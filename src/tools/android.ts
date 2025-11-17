/**
 * @fileoverview Android Tools for MCP Mobile Server
 *
 * This module provides comprehensive Android development tools for the MCP protocol,
 * enabling AI agents to interact with Android SDK, ADB (Android Debug Bridge), AVD
 * (Android Virtual Device), emulators, and the complete Android development ecosystem.
 *
 * @module tools/android
 * @category Core Tools
 *
 * Key Features:
 * - Android SDK package management (list, install)
 * - ADB device interaction (list, install, uninstall, shell, logcat)
 * - AVD management (create, delete, list)
 * - Emulator control (start, stop, with advanced options)
 * - Integration with specialized tools (Gradle, Lint, Media, native-run)
 * - Automatic fallback system (ADB → native-run)
 * - Process lifecycle tracking for emulators
 *
 * @example
 * ```typescript
 * const androidTools = createAndroidTools(globalProcessMap);
 * const devicesTool = androidTools.get('android_list_devices');
 * const result = await devicesTool.handler({});
 * console.log(result.data.devices);
 * ```
 */

import { z } from 'zod';
import { processExecutor } from '../utils/process.js';
import { fallbackManager } from '../utils/fallbacks.js';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import { createAndroidGradleTools } from './android/gradle.js';
import { createAndroidLintTools } from './android/lint.js';
import { createAndroidMediaTools } from './android/media.js';
import { createNativeRunTools } from './android/native-run.js';

/**
 * Global map tracking running Android emulator processes.
 * Maps AVD names to process IDs.
 *
 * @type {Map<string, number>}
 */
let runningEmulators: Map<string, number>;

/**
 * Zod validation schema for android_sdk_install_packages tool.
 * Validates SDK package installation parameters.
 *
 * @type {z.ZodObject}
 * @property {string[]} packages - Array of SDK package names to install
 */
const AndroidPackageSchema = z.object({
  packages: z.array(z.string().min(1)).min(1),
});

/**
 * Zod validation schema for android_create_avd tool.
 * Validates Android Virtual Device creation parameters.
 *
 * @type {z.ZodObject}
 * @property {string} name - AVD name
 * @property {string} systemImageId - System image identifier (e.g., "system-images;android-30;google_apis;x86")
 * @property {string} [device] - Device profile (optional)
 * @property {string} [sdcard] - SD card size (e.g., "512M", "1G")
 */
const AndroidAvdCreateSchema = z.object({
  name: z.string().min(1),
  systemImageId: z.string().min(1),
  device: z.string().optional(),
  sdcard: z.string().optional(),
});

/**
 * Zod validation schema for android_start_emulator tool.
 * Validates Android emulator startup parameters.
 *
 * @type {z.ZodObject}
 * @property {string} avdName - AVD name to start
 * @property {Object} [options] - Emulator startup options
 * @property {boolean} [options.noWindow] - Run headless without GUI
 * @property {number} [options.port] - Emulator port (5554-5682)
 * @property {string} [options.gpu] - GPU acceleration mode
 */
const AndroidEmulatorStartSchema = z.object({
  avdName: z.string().min(1),
  options: z.object({
    noWindow: z.boolean().optional(),
    port: z.number().min(5554).max(5682).optional(),
    gpu: z.enum(['auto', 'host', 'swiftshader_indirect', 'angle_indirect', 'guest']).optional(),
  }).optional(),
});

/**
 * Zod validation schema for android_install_apk tool.
 * Validates APK installation parameters.
 *
 * @type {z.ZodObject}
 * @property {string} serial - Device serial number
 * @property {string} apkPath - Path to APK file
 * @property {Object} [options] - Installation options
 * @property {boolean} [options.replace] - Replace existing app
 * @property {boolean} [options.test] - Install as test APK
 */
const AndroidAdbInstallSchema = z.object({
  serial: z.string().min(1),
  apkPath: z.string().min(1),
  options: z.object({
    replace: z.boolean().optional(),
    test: z.boolean().optional(),
  }).optional(),
});

/**
 * Zod validation schema for android_adb_shell tool.
 * Validates ADB shell command parameters.
 *
 * @type {z.ZodObject}
 * @property {string} serial - Device serial number
 * @property {string} command - Shell command to execute
 */
const AndroidAdbShellSchema = z.object({
  serial: z.string().min(1),
  command: z.string().min(1),
});

/**
 * Zod validation schema for android_stop_emulator tool.
 *
 * @type {z.ZodObject}
 * @property {string} avdName - AVD name to stop
 */
const AndroidEmulatorStopSchema = z.object({
  avdName: z.string().min(1),
});

/**
 * Zod validation schema for android_adb_uninstall tool.
 *
 * @type {z.ZodObject}
 * @property {string} serial - Device serial number
 * @property {string} packageName - Android package name to uninstall
 */
const AndroidAdbUninstallSchema = z.object({
  serial: z.string().min(1),
  packageName: z.string().min(1),
});

/**
 * Zod validation schema for android_delete_avd tool.
 *
 * @type {z.ZodObject}
 * @property {string} name - AVD name to delete
 */
const AndroidAvdDeleteSchema = z.object({
  name: z.string().min(1),
});

/**
 * Zod validation schema for android_adb_logcat tool.
 * Validates logcat command parameters.
 *
 * @type {z.ZodObject}
 * @property {string} serial - Device serial number
 * @property {string} [filter] - Logcat filter expression
 * @property {number} lines - Number of lines to retrieve (1-10000, default: 100)
 * @property {boolean} clear - Clear logcat buffer before reading
 */
const AndroidAdbLogcatSchema = z.object({
  serial: z.string().min(1),
  filter: z.string().optional(),
  lines: z.number().min(1).max(10000).default(100),
  clear: z.boolean().default(false),
});

/**
 * Creates and configures all Android tools for the MCP Mobile Server.
 *
 * This factory function initializes and returns a comprehensive set of Android development tools,
 * providing complete Android SDK, ADB, and emulator integration for AI agents via the MCP protocol.
 *
 * **Core Tools Created:**
 * - `android_sdk_list_packages`: List available and installed SDK packages
 * - `android_sdk_install_packages`: Install SDK packages
 * - `android_list_devices`: List connected Android devices and emulators
 * - `android_create_avd`: Create Android Virtual Device (AVD)
 * - `android_delete_avd`: Delete Android Virtual Device
 * - `android_list_avds`: List all available AVDs
 * - `android_start_emulator`: Start Android emulator
 * - `android_stop_emulator`: Stop running emulator
 * - `android_install_apk`: Install APK on device
 * - `android_adb_uninstall`: Uninstall app from device
 * - `android_adb_shell`: Execute shell command on device
 * - `android_adb_logcat`: Read device logs (logcat)
 *
 * **Specialized Tools** (via sub-modules):
 * - Gradle tools: Build, assemble, test Android projects
 * - Lint tools: Code quality analysis
 * - Media tools: Screenshot, screen recording
 * - Native-run tools: Lightweight alternative to ADB
 *
 * **Features:**
 * - Automatic fallback system (ADB → native-run when ADB unavailable)
 * - Process lifecycle tracking for emulators
 * - Security validation for all commands and paths
 * - Comprehensive error handling with detailed messages
 * - Support for headless emulators (CI/CD environments)
 * - GPU acceleration options
 *
 * @param {Map<string, number>} globalProcessMap - Global map tracking all active processes
 * @returns {Map<string, any>} Map of tool names to tool configurations
 *
 * @example
 * ```typescript
 * const globalProcesses = new Map();
 * const tools = createAndroidTools(globalProcesses);
 *
 * // List devices
 * const devicesTool = tools.get('android_list_devices');
 * const devices = await devicesTool.handler({});
 * console.log(devices.data.devices);
 *
 * // Create and start emulator
 * const createAvd = tools.get('android_create_avd');
 * await createAvd.handler({
 *   name: 'test_device',
 *   systemImageId: 'system-images;android-30;google_apis;x86'
 * });
 *
 * const startEmu = tools.get('android_start_emulator');
 * await startEmu.handler({
 *   avdName: 'test_device',
 *   options: { noWindow: true, gpu: 'swiftshader_indirect' }
 * });
 * ```
 *
 * @throws {Error} If Android SDK is not installed or not configured
 * @throws {Error} If validation schemas fail for any tool parameters
 *
 * @see {@link https://developer.android.com/studio/command-line|Android CLI Reference}
 * @see {@link https://developer.android.com/studio/command-line/adb|ADB Documentation}
 */
export function createAndroidTools(globalProcessMap: Map<string, number>): Map<string, any> {
  // Initialize local emulator tracking if not provided
  runningEmulators = globalProcessMap;

  const tools = new Map<string, any>();

  // Android SDK Manager - List packages
  tools.set('android_sdk_list_packages', {
    name: 'android_sdk_list_packages',
    description: 'List available and installed Android SDK packages',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('sdkmanager', ['--list']);
      
      if (result.exitCode !== 0) {
        throw new Error(`SDK Manager failed: ${result.stderr}`);
      }

      // Parse sdkmanager output
      const packages = [];
      const lines = result.stdout.split('\n');
      let inPackageSection = false;

      for (const line of lines) {
        if (line.includes('Available Packages:') || line.includes('Installed packages:')) {
          inPackageSection = true;
          continue;
        }
        
        if (inPackageSection && line.trim() && !line.startsWith('-') && !line.startsWith('Path') && !line.startsWith('Description')) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 0 && parts[0] && !line.includes('Version') && !line.includes('Location')) {
            packages.push(parts[0]);
          }
        }
      }

      return {
        success: true,
        data: {
          packages: packages.filter(pkg => pkg.length > 0),
          rawOutput: result.stdout,
        },
      };
    }
  });

  // Android SDK Manager - Install packages
  tools.set('android_sdk_install_packages', {
    name: 'android_sdk_install_packages',
    description: 'Install Android SDK packages',
    inputSchema: {
      type: 'object',
      properties: {
        packages: {
          type: 'array',
          items: { type: 'string', minLength: 1 },
          minItems: 1,
          description: 'Array of SDK package names to install'
        }
      },
      required: ['packages']
    },
    handler: async (args: any) => {
      const validation = AndroidPackageSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { packages } = validation.data;

      // Validate package names (only alphanumeric, dots, dashes, colons, semicolons)
      const validPackagePattern = /^[a-zA-Z0-9.:;-]+$/;
      for (const pkg of packages) {
        if (!validPackagePattern.test(pkg)) {
          throw new Error(`Invalid package name: ${pkg}. Package names can only contain alphanumeric characters, dots, colons, semicolons, and dashes`);
        }
      }

      const result = await processExecutor.execute(
        'sdkmanager', 
        [...packages],
        { timeout: 600000 } // 10 minutes timeout for SDK installations
      );

      if (result.exitCode !== 0) {
        throw new Error(`SDK package installation failed: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          installedPackages: packages,
          output: result.stdout,
        },
      };
    }
  });

  // Android AVD Manager - List AVDs
  tools.set('android_list_avds', {
    name: 'android_list_avds',
    description: 'List Android Virtual Devices (AVDs)',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('avdmanager', ['list', 'avd']);

      if (result.exitCode !== 0) {
        throw new Error(`AVD Manager failed: ${result.stderr}`);
      }

      // Parse AVD list output
      const avds = [];
      const lines = result.stdout.split('\n');
      let currentAvd: any = {};

      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Name:')) {
          if (currentAvd.name) {
            avds.push(currentAvd);
          }
          currentAvd = { name: trimmed.replace('Name:', '').trim() };
        } else if (trimmed.startsWith('Path:')) {
          currentAvd.path = trimmed.replace('Path:', '').trim();
        } else if (trimmed.startsWith('Target:')) {
          currentAvd.target = trimmed.replace('Target:', '').trim();
        } else if (trimmed.startsWith('Based on:')) {
          currentAvd.systemImage = trimmed.replace('Based on:', '').trim();
        }
      }
      
      // Add last AVD if exists
      if (currentAvd.name) {
        avds.push(currentAvd);
      }

      return {
        success: true,
        data: {
          avds,
          rawOutput: result.stdout,
        },
      };
    }
  });

  // Android AVD Manager - Create AVD
  tools.set('android_create_avd', {
    name: 'android_create_avd',
    description: 'Create a new Android Virtual Device (AVD)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, description: 'AVD name (alphanumeric and underscores only)' },
        systemImageId: { type: 'string', minLength: 1, description: 'System image package ID' },
        device: { type: 'string', description: 'Device definition (optional)' },
        sdcard: { type: 'string', description: 'SD card size (e.g., 512M, 1G)' }
      },
      required: ['name', 'systemImageId']
    },
    handler: async (args: any) => {
      const validation = AndroidAvdCreateSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { name, systemImageId, sdcard, device } = validation.data;

      // Validate AVD name (only alphanumeric and underscores)
      if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error('AVD name can only contain alphanumeric characters and underscores');
      }

      const args_cmd = ['create', 'avd', '--name', name, '--package', systemImageId];
      
      if (device) {
        args_cmd.push('--device', device);
      }
      
      if (sdcard) {
        args_cmd.push('--sdcard', sdcard);
      }

      const result = await processExecutor.execute('avdmanager', args_cmd, {
        timeout: 300000, // 5 minutes timeout
      });

      if (result.exitCode !== 0) {
        throw new Error(`AVD creation failed: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          avdName: name,
          systemImage: systemImageId,
          output: result.stdout,
        },
      };
    }
  });

  // Android AVD Manager - Delete AVD
  tools.set('android_delete_avd', {
    name: 'android_delete_avd',
    description: 'Delete an Android Virtual Device (AVD)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, description: 'AVD name to delete' }
      },
      required: ['name']
    },
    handler: async (args: any) => {
      const validation = AndroidAvdDeleteSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { name } = validation.data;

      // Validate AVD name
      if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        throw new Error('Invalid AVD name. Name can only contain alphanumeric characters and underscores');
      }

      const result = await processExecutor.execute('avdmanager', ['delete', 'avd', '--name', name]);

      if (result.exitCode !== 0) {
        throw new Error(`AVD deletion failed: ${result.stderr}`);
      }

      // Remove from running emulators tracking if exists
      runningEmulators.delete(name);

      return {
        success: true,
        data: {
          deletedAvd: name,
          output: result.stdout,
        },
      };
    }
  });

  // Android Emulator - List emulators
  tools.set('android_list_emulators', {
    name: 'android_list_emulators',
    description: 'List available Android emulators',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('emulator', ['-list-avds']);

      if (result.exitCode !== 0) {
        throw new Error(`Emulator listing failed: ${result.stderr}`);
      }

      const emulators = result.stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(name => ({
          name,
          isRunning: runningEmulators.has(name),
          pid: runningEmulators.get(name) || null,
        }));

      return {
        success: true,
        data: {
          emulators,
          totalCount: emulators.length,
          runningCount: emulators.filter(e => e.isRunning).length,
        },
      };
    }
  });

  // Android Emulator - Start emulator
  tools.set('android_start_emulator', {
    name: 'android_start_emulator',
    description: 'Start an Android emulator',
    inputSchema: {
      type: 'object',
      properties: {
        avdName: { type: 'string', minLength: 1, description: 'AVD name to start' },
        options: {
          type: 'object',
          properties: {
            noWindow: { type: 'boolean', description: 'Run without UI window' },
            port: { type: 'number', minimum: 5554, maximum: 5682, description: 'Console port number' },
            gpu: { 
              type: 'string', 
              enum: ['auto', 'host', 'swiftshader_indirect', 'angle_indirect', 'guest'],
              description: 'GPU acceleration mode'
            }
          }
        }
      },
      required: ['avdName']
    },
    handler: async (args: any) => {
      const validation = AndroidEmulatorStartSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { avdName, options = {} } = validation.data;

      // Check if emulator is already running
      if (runningEmulators.has(avdName)) {
        return {
          success: true,
          data: {
            avdName,
            status: 'already_running',
            pid: runningEmulators.get(avdName),
            message: 'Emulator is already running',
          },
        };
      }

      const emulator_args = ['-avd', avdName];
      
      if (options.noWindow) {
        emulator_args.push('-no-window');
      }
      
      if (options.port) {
        emulator_args.push('-port', options.port.toString());
      }
      
      if (options.gpu) {
        emulator_args.push('-gpu', options.gpu);
      }

      // Start emulator in background
      const emulatorProcess = spawn('emulator', emulator_args, {
        detached: true,
        stdio: 'ignore',
      });

      // Track the process
      runningEmulators.set(avdName, emulatorProcess.pid!);

      // Handle process exit
      emulatorProcess.on('exit', () => {
        runningEmulators.delete(avdName);
      });

      // Unref to allow the parent process to exit
      emulatorProcess.unref();

      return {
        success: true,
        data: {
          avdName,
          pid: emulatorProcess.pid,
          status: 'started',
          options,
        },
      };
    }
  });

  // Android Emulator - Stop emulator
  tools.set('android_stop_emulator', {
    name: 'android_stop_emulator',
    description: 'Stop a running Android emulator',
    inputSchema: {
      type: 'object',
      properties: {
        avdName: { type: 'string', minLength: 1, description: 'AVD name to stop' }
      },
      required: ['avdName']
    },
    handler: async (args: any) => {
      const validation = AndroidEmulatorStopSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { avdName } = validation.data;

      const pid = runningEmulators.get(avdName);
      if (!pid) {
        throw new Error(`Emulator is not running or not tracked by this server. No running emulator found for AVD: ${avdName}`);
      }

      try {
        // Kill the process
        process.kill(pid, 'SIGTERM');
        
        // Remove from tracking
        runningEmulators.delete(avdName);

        return {
          success: true,
          data: {
            avdName,
            pid,
            status: 'stopped',
          },
        };
      } catch (killError) {
        // Process might already be dead
        runningEmulators.delete(avdName);
        
        return {
          success: true,
          data: {
            avdName,
            pid,
            status: 'already_stopped',
            message: 'Process was already terminated',
          },
        };
      }
    }
  });

  // Android ADB - List devices
  tools.set('android_list_devices', {
    name: 'android_list_devices',
    description: 'List connected Android devices and emulators (supports ADB fallback to native-run)',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const fallbackResult = await fallbackManager.executeAdbWithFallback(
        ['devices', '-l'],
        { platform: 'android' }
      );

      if (!fallbackResult.success) {
        throw new Error(fallbackResult.error || 'Failed to list devices');
      }

      const result = fallbackResult.data;

      // Parse adb devices output
      const devices = [];
      const lines = result.stdout.split('\n').slice(1); // Skip header

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('*')) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            const device = {
              serial: parts[0],
              state: parts[1],
              product: '',
              model: '',
              device: '',
              transport_id: '',
            };

            // Parse additional info
            for (let i = 2; i < parts.length; i++) {
              const part = parts[i];
              if (part && part.startsWith('product:')) {
                device.product = part.split(':')[1] || '';
              } else if (part && part.startsWith('model:')) {
                device.model = part.split(':')[1] || '';
              } else if (part && part.startsWith('device:')) {
                device.device = part.split(':')[1] || '';
              } else if (part && part.startsWith('transport_id:')) {
                device.transport_id = part.split(':')[1] || '';
              }
            }

            devices.push(device);
          }
        }
      }

      return {
        success: true,
        data: {
          devices,
          totalCount: devices.length,
          onlineCount: devices.filter(d => d.state === 'device').length,
          fallbackInfo: fallbackResult.usedFallback ? {
            usedFallback: true,
            fallbackTool: fallbackResult.fallbackTool,
            message: fallbackResult.message
          } : undefined
        },
      };
    }
  });

  // Android ADB - Install APK
  tools.set('android_install_apk', {
    name: 'android_install_apk',
    description: 'Install an APK file to an Android device or emulator',
    inputSchema: {
      type: 'object',
      properties: {
        serial: { type: 'string', minLength: 1, description: 'Device serial number' },
        apkPath: { type: 'string', minLength: 1, description: 'Path to APK file' },
        options: {
          type: 'object',
          properties: {
            replace: { type: 'boolean', description: 'Replace existing app if installed' },
            test: { type: 'boolean', description: 'Allow test APKs' }
          }
        }
      },
      required: ['serial', 'apkPath']
    },
    handler: async (args: any) => {
      const validation = AndroidAdbInstallSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { serial, apkPath, options = {} } = validation.data;

      // Validate APK path
      if (!apkPath.endsWith('.apk')) {
        throw new Error(`File must have .apk extension. Invalid path: ${apkPath}`);
      }

      // Check if APK file exists
      try {
        await fs.access(apkPath);
      } catch {
        throw new Error(`APK file not found: ${apkPath}`);
      }

      const adb_args = ['-s', serial, 'install'];
      
      if (options.replace) {
        adb_args.push('-r');
      }
      
      if (options.test) {
        adb_args.push('-t');
      }
      
      adb_args.push(apkPath);

      const result = await processExecutor.execute('adb', adb_args, {
        timeout: 300000, // 5 minutes timeout for APK installation
      });

      if (result.exitCode !== 0) {
        throw new Error(`APK installation failed: ${result.stderr || result.stdout}`);
      }

      return {
        success: true,
        data: {
          serial,
          apkPath: path.basename(apkPath),
          output: result.stdout,
        },
      };
    }
  });

  // Android ADB - Uninstall package
  tools.set('android_uninstall_package', {
    name: 'android_uninstall_package',
    description: 'Uninstall an Android application package',
    inputSchema: {
      type: 'object',
      properties: {
        serial: { type: 'string', minLength: 1, description: 'Device serial number' },
        packageName: { type: 'string', minLength: 1, description: 'Android package name (e.g., com.example.app)' }
      },
      required: ['serial', 'packageName']
    },
    handler: async (args: any) => {
      const validation = AndroidAdbUninstallSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { serial, packageName } = validation.data;

      // Validate package name format
      if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/.test(packageName)) {
        throw new Error(`Invalid Android package name format: ${packageName}. Package name must follow Android naming conventions`);
      }

      const result = await processExecutor.execute('adb', ['-s', serial, 'uninstall', packageName]);

      if (result.exitCode !== 0) {
        throw new Error(`Package uninstallation failed: ${result.stderr || result.stdout}`);
      }

      return {
        success: true,
        data: {
          serial,
          packageName,
          output: result.stdout,
        },
      };
    }
  });

  // Android ADB - Execute shell command
  tools.set('android_shell_command', {
    name: 'android_shell_command',
    description: 'Execute a shell command on an Android device or emulator',
    inputSchema: {
      type: 'object',
      properties: {
        serial: { type: 'string', minLength: 1, description: 'Device serial number' },
        command: { type: 'string', minLength: 1, description: 'Shell command to execute' }
      },
      required: ['serial', 'command']
    },
    handler: async (args: any) => {
      const validation = AndroidAdbShellSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { serial, command } = validation.data;

      // Additional validation for dangerous commands
      const dangerousCommands = ['rm -rf', 'format', 'dd if=', 'dd of=', '>/dev/', 'chmod 777'];
      for (const dangerous of dangerousCommands) {
        if (command.includes(dangerous)) {
          throw new Error(`Command contains dangerous operations. Blocked command pattern: ${dangerous}`);
        }
      }

      const result = await processExecutor.execute('adb', ['-s', serial, 'shell', command]);

      return {
        success: true,
        data: {
          serial,
          command,
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          duration: result.duration,
        },
      };
    }
  });

  // Android ADB - Logcat
  tools.set('android_logcat', {
    name: 'android_logcat',
    description: 'Capture Android logcat output from device or emulator',
    inputSchema: {
      type: 'object',
      properties: {
        serial: { type: 'string', minLength: 1, description: 'Device serial number' },
        filter: { type: 'string', description: 'Log filter (e.g., *:E for errors only)' },
        lines: { type: 'number', minimum: 1, maximum: 10000, description: 'Number of log lines to capture' },
        clear: { type: 'boolean', description: 'Clear logcat buffer before capturing' }
      },
      required: ['serial']
    },
    handler: async (args: any) => {
      const validation = AndroidAdbLogcatSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { serial, filter, lines = 100, clear = false } = validation.data;

      const adb_args = ['-s', serial, 'logcat'];
      
      if (clear) {
        adb_args.push('-c');
        const clearResult = await processExecutor.execute('adb', adb_args);
        
        return {
          success: true,
          data: {
            serial,
            action: 'cleared',
            output: 'Logcat cleared successfully',
          },
        };
      }

      // Add filter if provided
      if (filter) {
        adb_args.push(filter);
      }

      // Add line limit
      adb_args.push('-t', lines.toString());

      const result = await processExecutor.execute('adb', adb_args, {
        timeout: 60000, // 1 minute timeout for logcat
      });

      return {
        success: true,
        data: {
          serial,
          filter: filter || 'all',
          lines,
          logs: result.stdout,
          exitCode: result.exitCode,
        },
      };
    }
  });

  // Add new Android tools
  const gradleTools = createAndroidGradleTools();
  const lintTools = createAndroidLintTools();  
  const mediaTools = createAndroidMediaTools();
  const nativeRunTools = createNativeRunTools();

  // Merge all tools
  for (const [name, tool] of gradleTools.entries()) {
    tools.set(name, tool);
  }
  
  for (const [name, tool] of lintTools.entries()) {
    tools.set(name, tool);
  }
  
  for (const [name, tool] of mediaTools.entries()) {
    tools.set(name, tool);
  }

  for (const [name, tool] of nativeRunTools.entries()) {
    tools.set(name, tool);
  }

  return tools;
}