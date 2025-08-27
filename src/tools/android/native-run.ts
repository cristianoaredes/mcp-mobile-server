import { z } from 'zod';
import { ProcessExecutor } from '../../utils/process.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

const processExecutor = new ProcessExecutor();

// Zod schemas for native-run operations
const NativeRunListDevicesSchema = z.object({
  platform: z.enum(['android', 'ios']).default('android'),
});

const NativeRunInstallAppSchema = z.object({
  platform: z.enum(['android', 'ios']).default('android'),
  appPath: z.string().min(1),
  deviceId: z.string().optional(),
});

const NativeRunRunAppSchema = z.object({
  platform: z.enum(['android', 'ios']).default('android'),
  appId: z.string().min(1),
  deviceId: z.string().optional(),
});

// Helper function to check if native-run is available
async function isNativeRunAvailable(): Promise<boolean> {
  try {
    await processExecutor.execute('native-run', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create native-run tools as ADB alternatives
 */
export function createNativeRunTools(): Map<string, Tool> {
  const tools = new Map<string, Tool>();

  // Native-Run - List devices (Android & iOS)
  tools.set('native_run_list_devices', {
    name: 'native_run_list_devices',
    description: 'List connected devices using native-run (Android & iOS support)',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['android', 'ios'],
          default: 'android'
        }
      },
      required: []
    },
    handler: async (args: any) => {
      const parsed = NativeRunListDevicesSchema.parse(args);
      
      if (!(await isNativeRunAvailable())) {
        throw new Error('native-run is not installed. Install with: npm install -g native-run');
      }

      const result = await processExecutor.execute('native-run', [
        parsed.platform,
        '--list',
        '--json'
      ]);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to list ${parsed.platform} devices: ${result.stderr}`);
      }

      let devices = [];
      try {
        const output = JSON.parse(result.stdout);
        devices = output.devices || [];
      } catch (parseError) {
        // If JSON parsing fails, try to parse text output
        devices = result.stdout
          .split('\n')
          .filter((line: string) => line.trim() && !line.includes('Available targets'))
          .map((line: string, index: number) => ({
            id: `device_${index}`,
            name: line.trim(),
            platform: parsed.platform,
            available: true
          }));
      }

      return {
        success: true,
        data: {
          platform: parsed.platform,
          devices,
          totalCount: devices.length,
          tool: 'native-run'
        },
      };
    }
  });

  // Native-Run - Install app
  tools.set('native_run_install_app', {
    name: 'native_run_install_app',
    description: 'Install app on device using native-run (works for Android APK & iOS app)',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['android', 'ios'],
          default: 'android'
        },
        appPath: {
          type: 'string',
          minLength: 1
        },
        deviceId: {
          type: 'string'
        }
      },
      required: ['appPath']
    },
    handler: async (args: any) => {
      const parsed = NativeRunInstallAppSchema.parse(args);
      
      if (!(await isNativeRunAvailable())) {
        throw new Error('native-run is not installed. Install with: npm install -g native-run');
      }

      const runArgs = [
        parsed.platform,
        '--app', parsed.appPath,
        '--device'
      ];

      if (parsed.deviceId) {
        runArgs.push('--target', parsed.deviceId);
      }

      const result = await processExecutor.execute('native-run', runArgs);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to install app on ${parsed.platform}: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          message: `App installed successfully on ${parsed.platform}`,
          platform: parsed.platform,
          appPath: parsed.appPath,
          deviceId: parsed.deviceId,
          tool: 'native-run'
        },
      };
    }
  });

  // Native-Run - Run app
  tools.set('native_run_run_app', {
    name: 'native_run_run_app',
    description: 'Run/launch app on device using native-run',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['android', 'ios'],
          default: 'android'
        },
        appId: {
          type: 'string',
          minLength: 1
        },
        deviceId: {
          type: 'string'
        }
      },
      required: ['appId']
    },
    handler: async (args: any) => {
      const parsed = NativeRunRunAppSchema.parse(args);
      
      if (!(await isNativeRunAvailable())) {
        throw new Error('native-run is not installed. Install with: npm install -g native-run');
      }

      const runArgs = [
        parsed.platform,
        '--app', parsed.appId
      ];

      if (parsed.deviceId) {
        runArgs.push('--target', parsed.deviceId);
      }

      const result = await processExecutor.execute('native-run', runArgs);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to run app on ${parsed.platform}: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          message: `App launched successfully on ${parsed.platform}`,
          platform: parsed.platform,
          appId: parsed.appId,
          deviceId: parsed.deviceId,
          tool: 'native-run'
        },
      };
    }
  });

  // Native-Run - Get device info
  tools.set('native_run_device_info', {
    name: 'native_run_device_info',
    description: 'Get detailed device information using native-run',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['android', 'ios'],
          default: 'android'
        },
        deviceId: {
          type: 'string'
        }
      },
      required: []
    },
    handler: async (args: any) => {
      const parsed = z.object({
        platform: z.enum(['android', 'ios']).default('android'),
        deviceId: z.string().optional(),
      }).parse(args);
      
      if (!(await isNativeRunAvailable())) {
        throw new Error('native-run is not installed. Install with: npm install -g native-run');
      }

      const runArgs = [
        parsed.platform,
        '--list',
        '--json'
      ];

      if (parsed.deviceId) {
        runArgs.push('--target', parsed.deviceId);
      }

      const result = await processExecutor.execute('native-run', runArgs);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to get device info: ${result.stderr}`);
      }

      let deviceInfo = {};
      try {
        const output = JSON.parse(result.stdout);
        deviceInfo = output.devices?.[0] || { message: 'Device info retrieved' };
      } catch (parseError) {
        deviceInfo = {
          platform: parsed.platform,
          deviceId: parsed.deviceId,
          raw_output: result.stdout,
          message: 'Device info retrieved (raw format)'
        };
      }

      return {
        success: true,
        data: {
          platform: parsed.platform,
          deviceInfo,
          tool: 'native-run'
        },
      };
    }
  });

  return tools;
}

/**
 * Check if native-run can be used as ADB alternative
 */
export async function canUseNativeRun(): Promise<boolean> {
  return await isNativeRunAvailable();
}