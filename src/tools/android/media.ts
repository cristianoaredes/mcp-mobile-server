import { z } from 'zod';
import { ProcessExecutor } from '../../utils/process.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const processExecutor = new ProcessExecutor();

// Zod schemas for Android media operations
const AndroidScreenshotSchema = z.object({
  serial: z.string().min(1),
  outputPath: z.string().min(1),
  options: z.object({
    format: z.enum(['png', 'raw']).default('png'),
    display: z.number().optional(),
  }).optional(),
});

const AndroidScreenRecordSchema = z.object({
  serial: z.string().min(1),
  outputPath: z.string().min(1),
  options: z.object({
    duration: z.number().min(1).max(180).default(30),
    size: z.string().optional(), // e.g., "1280x720"
    bitRate: z.number().min(1000000).max(100000000).optional(), // 1Mbps to 100Mbps
    rotate: z.boolean().default(false),
    verbose: z.boolean().default(false),
  }).optional(),
});

const AndroidScreenRecordStopSchema = z.object({
  serial: z.string().min(1),
});

const AndroidPushFileSchema = z.object({
  serial: z.string().min(1),
  localPath: z.string().min(1),
  remotePath: z.string().min(1),
});

const AndroidPullFileSchema = z.object({
  serial: z.string().min(1),
  remotePath: z.string().min(1),
  localPath: z.string().min(1),
});

// Track active recordings per device
const activeRecordings = new Map<string, number>();

export function createAndroidMediaTools(): Map<string, any> {
  const tools = new Map();

  tools.set('android_screenshot', {
    name: 'android_screenshot',
    description: 'Capture screenshot from Android device or emulator',
    inputSchema: {
      type: 'object',
      properties: {
        serial: {
          type: 'string',
          description: 'Device serial number (use android_devices_list to get available devices)'
        },
        outputPath: {
          type: 'string',
          description: 'Local path where screenshot will be saved (e.g., ./screenshot.png)'
        },
        options: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['png', 'raw'],
              description: 'Screenshot format',
              default: 'png'
            },
            display: {
              type: 'number',
              description: 'Display ID for multi-display devices'
            }
          }
        }
      },
      required: ['serial', 'outputPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidScreenshotSchema.parse(args);
      
      try {
        // Ensure output directory exists
        const outputDir = path.dirname(parsed.outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        
        const adbArgs = ['-s', parsed.serial, 'exec-out', 'screencap'];
        
        if (parsed.options?.format) {
          adbArgs.push('-p'); // PNG format
        }
        
        if (parsed.options?.display !== undefined) {
          adbArgs.push('-d', parsed.options.display.toString());
        }
        
        // Capture screenshot to temporary location first
        const tempPath = `/sdcard/screenshot_${Date.now()}.png`;
        const captureResult = await processExecutor.execute('adb', [
          '-s', parsed.serial, 'shell', 'screencap', '-p', tempPath
        ], {
          timeout: 30000,
        });
        
        if (captureResult.exitCode !== 0) {
          return {
            success: false,
            error: {
              code: 'SCREENSHOT_CAPTURE_FAILED',
              message: 'Failed to capture screenshot on device',
              details: captureResult.stderr
            }
          };
        }
        
        // Pull screenshot to local machine
        const pullResult = await processExecutor.execute('adb', [
          '-s', parsed.serial, 'pull', tempPath, parsed.outputPath
        ], {
          timeout: 30000,
        });
        
        // Clean up temporary file
        await processExecutor.execute('adb', [
          '-s', parsed.serial, 'shell', 'rm', tempPath
        ], {
          timeout: 10000,
        });
        
        if (pullResult.exitCode === 0) {
          // Verify file was created
          let fileStats;
          try {
            fileStats = await fs.stat(parsed.outputPath);
          } catch {
            throw new Error(`Screenshot file was not created at ${parsed.outputPath}`);
          }
          
          return {
            success: true,
            data: {
              screenshotPath: parsed.outputPath,
              fileSize: fileStats.size,
              format: parsed.options?.format || 'png',
              device: parsed.serial,
              timestamp: new Date().toISOString()
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'SCREENSHOT_PULL_FAILED',
              message: 'Failed to pull screenshot from device',
              details: pullResult.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'SCREENSHOT_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_screen_record', {
    name: 'android_screen_record',
    description: 'Start screen recording on Android device or emulator',
    inputSchema: {
      type: 'object',
      properties: {
        serial: {
          type: 'string',
          description: 'Device serial number'
        },
        outputPath: {
          type: 'string',
          description: 'Local path where recording will be saved (e.g., ./recording.mp4)'
        },
        options: {
          type: 'object',
          properties: {
            duration: {
              type: 'number',
              description: 'Recording duration in seconds (max 180)',
              default: 30,
              minimum: 1,
              maximum: 180
            },
            size: {
              type: 'string',
              description: 'Video size (e.g., "1280x720")'
            },
            bitRate: {
              type: 'number',
              description: 'Video bit rate in bps (1Mbps to 100Mbps)',
              minimum: 1000000,
              maximum: 100000000
            },
            rotate: {
              type: 'boolean',
              description: 'Rotate video 90 degrees',
              default: false
            },
            verbose: {
              type: 'boolean',
              description: 'Verbose output',
              default: false
            }
          }
        }
      },
      required: ['serial', 'outputPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidScreenRecordSchema.parse(args);
      
      try {
        // Check if recording is already active for this device
        if (activeRecordings.has(parsed.serial)) {
          return {
            success: false,
            error: {
              code: 'RECORDING_ALREADY_ACTIVE',
              message: `Screen recording is already active for device ${parsed.serial}`,
              details: { activeRecordingPid: activeRecordings.get(parsed.serial) }
            }
          };
        }
        
        // Ensure output directory exists
        const outputDir = path.dirname(parsed.outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        
        const remotePath = `/sdcard/screenrecord_${Date.now()}.mp4`;
        const adbArgs = ['-s', parsed.serial, 'shell', 'screenrecord'];
        
        if (parsed.options?.duration) {
          adbArgs.push('--time-limit', parsed.options.duration.toString());
        }
        
        if (parsed.options?.size) {
          adbArgs.push('--size', parsed.options.size);
        }
        
        if (parsed.options?.bitRate) {
          adbArgs.push('--bit-rate', parsed.options.bitRate.toString());
        }
        
        if (parsed.options?.rotate) {
          adbArgs.push('--rotate');
        }
        
        if (parsed.options?.verbose) {
          adbArgs.push('--verbose');
        }
        
        adbArgs.push(remotePath);
        
        // Start recording in background
        const recordingProcess = spawn('adb', adbArgs, {
          detached: false,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        if (recordingProcess.pid) {
          activeRecordings.set(parsed.serial, recordingProcess.pid);
        }
        
        // Set up cleanup and file transfer when recording completes
        recordingProcess.on('exit', async (code: any) => {
          activeRecordings.delete(parsed.serial);
          
          if (code === 0) {
            // Pull the recording file
            const pullResult = await processExecutor.execute('adb', [
              '-s', parsed.serial, 'pull', remotePath, parsed.outputPath
            ], {
              timeout: 60000, // 1 minute for file transfer
            });
            
            // Clean up remote file
            await processExecutor.execute('adb', [
              '-s', parsed.serial, 'shell', 'rm', remotePath
            ], {
              timeout: 10000,
            });
          }
        });
        
        return {
          success: true,
          data: {
            message: 'Screen recording started',
            device: parsed.serial,
            outputPath: parsed.outputPath,
            duration: parsed.options?.duration || 30,
            recordingPid: recordingProcess.pid || 0,
            remotePath
          }
        };
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'SCREEN_RECORD_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_screen_record_stop', {
    name: 'android_screen_record_stop',
    description: 'Stop active screen recording on Android device',
    inputSchema: {
      type: 'object',
      properties: {
        serial: {
          type: 'string',
          description: 'Device serial number'
        }
      },
      required: ['serial']
    },
    handler: async (args: any) => {
      const parsed = AndroidScreenRecordStopSchema.parse(args);
      
      try {
        const recordingPid = activeRecordings.get(parsed.serial);
        
        if (!recordingPid) {
          return {
            success: false,
            error: {
              code: 'NO_ACTIVE_RECORDING',
              message: `No active recording found for device ${parsed.serial}`,
              details: null
            }
          };
        }
        
        // Stop the recording process
        try {
          process.kill(recordingPid, 'SIGINT');
          activeRecordings.delete(parsed.serial);
          
          return {
            success: true,
            data: {
              message: 'Screen recording stopped',
              device: parsed.serial,
              stoppedPid: recordingPid
            }
          };
        } catch (killError) {
          return {
            success: false,
            error: {
              code: 'RECORDING_STOP_FAILED',
              message: 'Failed to stop recording process',
              details: killError
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'SCREEN_RECORD_STOP_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_push_file', {
    name: 'android_push_file',
    description: 'Push file from local machine to Android device',
    inputSchema: {
      type: 'object',
      properties: {
        serial: {
          type: 'string',
          description: 'Device serial number'
        },
        localPath: {
          type: 'string',
          description: 'Local file path to push'
        },
        remotePath: {
          type: 'string',
          description: 'Remote path on device (e.g., /sdcard/file.txt)'
        }
      },
      required: ['serial', 'localPath', 'remotePath']
    },
    handler: async (args: any) => {
      const parsed = AndroidPushFileSchema.parse(args);
      
      try {
        // Verify local file exists
        try {
          await fs.access(parsed.localPath);
        } catch {
          return {
            success: false,
            error: {
              code: 'LOCAL_FILE_NOT_FOUND',
              message: `Local file not found: ${parsed.localPath}`,
              details: null
            }
          };
        }
        
        const result = await processExecutor.execute('adb', [
          '-s', parsed.serial, 'push', parsed.localPath, parsed.remotePath
        ], {
          timeout: 120000, // 2 minutes
        });
        
        if (result.exitCode === 0) {
          const fileStats = await fs.stat(parsed.localPath);
          
          return {
            success: true,
            data: {
              localPath: parsed.localPath,
              remotePath: parsed.remotePath,
              device: parsed.serial,
              fileSize: fileStats.size,
              transferInfo: result.stdout
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'PUSH_FAILED',
              message: 'Failed to push file to device',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'PUSH_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_pull_file', {
    name: 'android_pull_file',
    description: 'Pull file from Android device to local machine',
    inputSchema: {
      type: 'object',
      properties: {
        serial: {
          type: 'string',
          description: 'Device serial number'
        },
        remotePath: {
          type: 'string',
          description: 'Remote file path on device'
        },
        localPath: {
          type: 'string',
          description: 'Local path where file will be saved'
        }
      },
      required: ['serial', 'remotePath', 'localPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidPullFileSchema.parse(args);
      
      try {
        // Ensure local directory exists
        const localDir = path.dirname(parsed.localPath);
        await fs.mkdir(localDir, { recursive: true });
        
        const result = await processExecutor.execute('adb', [
          '-s', parsed.serial, 'pull', parsed.remotePath, parsed.localPath
        ], {
          timeout: 120000, // 2 minutes
        });
        
        if (result.exitCode === 0) {
          let fileStats;
          try {
            fileStats = await fs.stat(parsed.localPath);
          } catch {
            return {
              success: false,
              error: {
                code: 'PULLED_FILE_NOT_FOUND',
                message: `Pulled file not found at ${parsed.localPath}`,
                details: null
              }
            };
          }
          
          return {
            success: true,
            data: {
              remotePath: parsed.remotePath,
              localPath: parsed.localPath,
              device: parsed.serial,
              fileSize: fileStats.size,
              transferInfo: result.stdout
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'PULL_FAILED',
              message: 'Failed to pull file from device',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'PULL_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  return tools;
}