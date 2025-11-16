/**
 * @fileoverview iOS Tools for MCP Mobile Server
 *
 * This module provides comprehensive iOS development tools for the MCP protocol,
 * enabling AI agents to interact with iOS Simulator, Xcode, and the complete
 * iOS development ecosystem. All tools are macOS-specific and require Xcode.
 *
 * @module tools/ios
 * @category Core Tools
 *
 * Key Features:
 * - iOS Simulator management (list, boot, shutdown, erase, clone)
 * - Deep link and URL testing
 * - Screenshot and video recording
 * - Xcode project integration (build, list schemes)
 * - Runtime management (list iOS versions, install runtimes)
 * - macOS platform validation
 *
 * @platform darwin (macOS only)
 * @requires Xcode Command Line Tools
 *
 * @example
 * ```typescript
 * const iosTools = createIOSTools(globalProcessMap);
 * const simulatorsTool = iosTools.get('ios_list_simulators');
 * const result = await simulatorsTool.handler({});
 * console.log(result.data.simulators);
 * ```
 */

import { z } from 'zod';
import { processExecutor } from '../utils/process.js';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

/**
 * Global map tracking active video recording processes.
 * Maps recording IDs to process IDs.
 *
 * @type {Map<string, number>}
 */
let activeRecordings: Map<string, number>;

/**
 * Zod validation schema for iOS simulator action tools.
 * Used by boot, shutdown, erase operations.
 *
 * @type {z.ZodObject}
 * @property {string} udid - Simulator UDID (Universally Unique Identifier)
 */
const IosSimulatorActionSchema = z.object({
  udid: z.string().min(1),
});

/**
 * Zod validation schema for ios_simulator_open_url tool.
 * Validates deep link and URL opening parameters.
 *
 * @type {z.ZodObject}
 * @property {string} udid - Simulator UDID
 * @property {string} url - URL to open (must be valid URL format)
 */
const IosSimulatorOpenUrlSchema = z.object({
  udid: z.string().min(1),
  url: z.string().url(),
});

/**
 * Zod validation schema for ios_simulator_screenshot tool.
 *
 * @type {z.ZodObject}
 * @property {string} udid - Simulator UDID
 * @property {string} path - Output file path for screenshot
 */
const IosSimulatorScreenshotSchema = z.object({
  udid: z.string().min(1),
  path: z.string().min(1),
});

/**
 * Zod validation schema for ios_simulator_record tool.
 * Validates video recording parameters.
 *
 * @type {z.ZodObject}
 * @property {string} udid - Simulator UDID
 * @property {string} path - Output file path for video
 * @property {number} duration - Recording duration in seconds (1-300, default: 30)
 */
const IosSimulatorRecordSchema = z.object({
  udid: z.string().min(1),
  path: z.string().min(1),
  duration: z.number().min(1).max(300).default(30),
});

/**
 * Zod validation schema for ios_xcodebuild tool.
 * Validates Xcode build parameters.
 *
 * @type {z.ZodObject}
 * @property {string} [workspace] - Xcode workspace file path (.xcworkspace)
 * @property {string} [project] - Xcode project file path (.xcodeproj)
 * @property {string} scheme - Build scheme name
 * @property {string} configuration - Build configuration (default: "Debug")
 * @property {string} [destination] - Build destination (e.g., "platform=iOS Simulator,name=iPhone 14")
 */
const IosXcodeBuildSchema = z.object({
  workspace: z.string().optional(),
  project: z.string().optional(),
  scheme: z.string().min(1),
  configuration: z.string().default('Debug'),
  destination: z.string().optional(),
});

/**
 * Zod validation schema for ios_xcode_list tool.
 * Validates parameters for listing Xcode schemes and targets.
 *
 * @type {z.ZodObject}
 * @property {string} [project] - Xcode project file path
 * @property {string} [workspace] - Xcode workspace file path
 */
const IosXcodeListSchema = z.object({
  project: z.string().optional(),
  workspace: z.string().optional(),
});

/**
 * Validates that the current platform is macOS (darwin).
 * iOS tools require macOS with Xcode installed.
 *
 * @returns {void}
 * @throws {Error} If current platform is not macOS
 *
 * @example
 * ```typescript
 * checkMacOS(); // Throws on Windows/Linux
 * ```
 */
const checkMacOS = (): void => {
  if (process.platform !== 'darwin') {
    throw new Error(`iOS development tools only work on macOS. Current platform: ${process.platform}`);
  }
};

/**
 * Validates iOS Simulator UDID format.
 * UDIDs must match UUID v4 format (8-4-4-4-12 hexadecimal pattern).
 *
 * @param {string} udid - Simulator UDID to validate
 * @returns {boolean} True if valid UDID format, false otherwise
 *
 * @example
 * ```typescript
 * validateUDID('12345678-1234-1234-1234-123456789ABC'); // true
 * validateUDID('invalid-udid'); // false
 * ```
 */
const validateUDID = (udid: string): boolean => {
  const uuidPattern = /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i;
  return uuidPattern.test(udid);
};

/**
 * Validates Xcode scheme name format.
 * Scheme names can only contain alphanumeric characters, underscores, and dashes.
 *
 * @param {scheme} scheme - Scheme name to validate
 * @returns {boolean} True if valid scheme name, false otherwise
 *
 * @example
 * ```typescript
 * validateSchemeName('MyApp-Prod'); // true
 * validateSchemeName('Invalid Scheme!'); // false
 * ```
 */
const validateSchemeName = (scheme: string): boolean => {
  const schemePattern = /^[a-zA-Z0-9_-]+$/;
  return schemePattern.test(scheme);
};

/**
 * Creates and configures all iOS tools for the MCP Mobile Server.
 *
 * This factory function initializes and returns a comprehensive set of iOS development tools,
 * providing complete iOS Simulator and Xcode integration for AI agents via the MCP protocol.
 * **macOS Only** - All tools require macOS (darwin) platform with Xcode Command Line Tools.
 *
 * **Tools Created:**
 * - `ios_list_simulators`: List all available iOS simulators with status
 * - `ios_boot_simulator`: Boot (start) an iOS simulator
 * - `ios_shutdown_simulator`: Shutdown a running simulator
 * - `ios_erase_simulator`: Erase simulator content and settings
 * - `ios_clone_simulator`: Clone an existing simulator
 * - `ios_simulator_open_url`: Open URL or deep link in simulator
 * - `ios_simulator_screenshot`: Capture simulator screenshot
 * - `ios_simulator_record`: Record simulator video
 * - `ios_list_runtimes`: List available iOS runtime versions
 * - `ios_install_runtime`: Install new iOS runtime version
 * - `ios_xcodebuild`: Build Xcode project or workspace
 * - `ios_xcode_list`: List available schemes and targets
 *
 * **Features:**
 * - Automatic macOS platform validation for all tools
 * - UDID format validation (UUID v4)
 * - Xcode scheme name validation
 * - Video recording with duration control (1-300 seconds)
 * - Process lifecycle tracking for recordings
 * - Support for both Xcode projects (.xcodeproj) and workspaces (.xcworkspace)
 * - Comprehensive error handling with detailed messages
 *
 * @param {Map<string, number>} globalProcessMap - Global map tracking all active processes
 * @returns {Map<string, any>} Map of tool names to tool configurations
 *
 * @example
 * ```typescript
 * const globalProcesses = new Map();
 * const tools = createIOSTools(globalProcesses);
 *
 * // List simulators
 * const listSim = tools.get('ios_list_simulators');
 * const sims = await listSim.handler({});
 * console.log(sims.data.simulators);
 *
 * // Boot simulator
 * const bootSim = tools.get('ios_boot_simulator');
 * await bootSim.handler({
 *   udid: '12345678-1234-1234-1234-123456789ABC'
 * });
 *
 * // Take screenshot
 * const screenshot = tools.get('ios_simulator_screenshot');
 * await screenshot.handler({
 *   udid: '12345678-1234-1234-1234-123456789ABC',
 *   path: '/tmp/screenshot.png'
 * });
 *
 * // Build Xcode project
 * const build = tools.get('ios_xcodebuild');
 * await build.handler({
 *   project: 'MyApp.xcodeproj',
 *   scheme: 'MyApp',
 *   configuration: 'Debug',
 *   destination: 'platform=iOS Simulator,name=iPhone 14'
 * });
 * ```
 *
 * @throws {Error} If platform is not macOS (darwin)
 * @throws {Error} If Xcode Command Line Tools are not installed
 * @throws {Error} If validation schemas fail for any tool parameters
 *
 * @platform darwin (macOS only)
 * @requires Xcode Command Line Tools
 *
 * @see {@link https://developer.apple.com/documentation/xcode|Xcode Documentation}
 * @see {@link https://developer.apple.com/library/archive/documentation/ToolsLanguages/Conceptual/Xcode_Overview/Simulators.html|iOS Simulator Guide}
 */
export function createIOSTools(globalProcessMap: Map<string, number>): Map<string, any> {
  // Initialize local recordings tracking if not provided
  activeRecordings = globalProcessMap;

  const tools = new Map<string, any>();

  // iOS Simulator Management - List simulators
  tools.set('ios_list_simulators', {
    name: 'ios_list_simulators',
    description: 'List available iOS simulators',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      checkMacOS();

      const result = await processExecutor.execute('xcrun', ['simctl', 'list', 'devices', '--json']);
      
      if (result.exitCode !== 0) {
        throw new Error(`Failed to list iOS simulators: ${result.stderr}`);
      }

      let devicesData;
      try {
        devicesData = JSON.parse(result.stdout);
      } catch (parseError) {
        throw new Error(`Failed to parse simulator list JSON: ${parseError}`);
      }

      const simulators = [];
      const devices = devicesData.devices || {};

      for (const [runtime, deviceList] of Object.entries(devices)) {
        if (Array.isArray(deviceList)) {
          for (const device of deviceList as any[]) {
            simulators.push({
              udid: device.udid,
              name: device.name,
              state: device.state,
              runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', ''),
              deviceTypeIdentifier: device.deviceTypeIdentifier,
              isAvailable: device.isAvailable || false,
            });
          }
        }
      }

      return {
        success: true,
        data: {
          simulators,
          totalCount: simulators.length,
          bootedCount: simulators.filter((s: any) => s.state === 'Booted').length,
          availableCount: simulators.filter((s: any) => s.isAvailable).length,
        },
      };
    }
  });

  // iOS Simulator Management - Boot simulator
  tools.set('ios_boot_simulator', {
    name: 'ios_boot_simulator',
    description: 'Boot an iOS simulator',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' }
      },
      required: ['udid']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorActionSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      const result = await processExecutor.execute('xcrun', ['simctl', 'boot', udid], {
        timeout: 60000, // 1 minute timeout for simulator boot
      });

      // Note: simctl boot returns exit code 164 if simulator is already booted, which is not an error
      if (result.exitCode !== 0 && result.exitCode !== 164) {
        throw new Error(`Failed to boot iOS simulator: ${result.stderr}`);
      }

      const isAlreadyBooted = result.exitCode === 164;

      return {
        success: true,
        data: {
          udid,
          status: isAlreadyBooted ? 'already_booted' : 'booted',
          message: isAlreadyBooted ? 'Simulator was already booted' : 'Simulator booted successfully',
          output: result.stdout,
        },
      };
    }
  });

  // iOS Simulator Management - Shutdown simulator
  tools.set('ios_shutdown_simulator', {
    name: 'ios_shutdown_simulator',
    description: 'Shutdown an iOS simulator',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' }
      },
      required: ['udid']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorActionSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      // Stop any active recordings for this simulator
      if (activeRecordings.has(udid)) {
        const pid = activeRecordings.get(udid);
        try {
          process.kill(pid!, 'SIGTERM');
          activeRecordings.delete(udid);
        } catch {
          // Process might already be dead
          activeRecordings.delete(udid);
        }
      }

      const result = await processExecutor.execute('xcrun', ['simctl', 'shutdown', udid], {
        timeout: 30000, // 30 seconds timeout for shutdown
      });

      // Note: simctl shutdown returns exit code 164 if simulator is already shut down
      if (result.exitCode !== 0 && result.exitCode !== 164) {
        throw new Error(`Failed to shutdown iOS simulator: ${result.stderr}`);
      }

      const wasAlreadyShutdown = result.exitCode === 164;

      return {
        success: true,
        data: {
          udid,
          status: wasAlreadyShutdown ? 'already_shutdown' : 'shutdown',
          message: wasAlreadyShutdown ? 'Simulator was already shut down' : 'Simulator shut down successfully',
          output: result.stdout,
        },
      };
    }
  });

  // iOS Simulator Management - Erase simulator
  tools.set('ios_erase_simulator', {
    name: 'ios_erase_simulator',
    description: 'Erase all data from an iOS simulator',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' }
      },
      required: ['udid']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorActionSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      const result = await processExecutor.execute('xcrun', ['simctl', 'erase', udid], {
        timeout: 120000, // 2 minutes timeout for erase
      });

      if (result.exitCode !== 0) {
        throw new Error(`Failed to erase iOS simulator: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          udid,
          status: 'erased',
          message: 'Simulator data erased successfully',
          output: result.stdout,
        },
      };
    }
  });

  // iOS Simulator Utilities - Open URL
  tools.set('ios_open_url', {
    name: 'ios_open_url',
    description: 'Open a URL in an iOS simulator',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' },
        url: { type: 'string', format: 'uri', description: 'URL to open in the simulator' }
      },
      required: ['udid', 'url']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorOpenUrlSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid, url } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL format. URL must be a valid HTTP/HTTPS or custom scheme URL: ${url}`);
      }

      const result = await processExecutor.execute('xcrun', ['simctl', 'openurl', udid, url]);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to open URL in simulator: ${result.stderr}`);
      }

      return {
        success: true,
        data: {
          udid,
          url,
          status: 'opened',
          message: 'URL opened successfully in simulator',
          output: result.stdout,
        },
      };
    }
  });

  // iOS Simulator Utilities - Take screenshot
  tools.set('ios_take_screenshot', {
    name: 'ios_take_screenshot',
    description: 'Take a screenshot of an iOS simulator',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' },
        path: { type: 'string', minLength: 1, description: 'Absolute path to save screenshot' }
      },
      required: ['udid', 'path']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorScreenshotSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid, path: screenshotPath } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      // Validate screenshot path - must be absolute and not contain dangerous patterns
      if (!path.isAbsolute(screenshotPath)) {
        throw new Error(`Screenshot path must be absolute. Path must start with /: ${screenshotPath}`);
      }

      // Security check - prevent path traversal and access to sensitive directories
      const normalizedPath = path.normalize(screenshotPath);
      const dangerousPaths = ['/etc', '/usr', '/System', '/private', '/var'];
      if (dangerousPaths.some(dangerous => normalizedPath.startsWith(dangerous))) {
        throw new Error(`Access to this path is not allowed. Path access denied for security reasons: ${normalizedPath}`);
      }

      // Ensure file has image extension
      const allowedExtensions = ['.png', '.jpg', '.jpeg'];
      const extension = path.extname(screenshotPath).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        throw new Error(`Screenshot file must have image extension. Allowed extensions: ${allowedExtensions.join(', ')}. Got: ${extension}`);
      }

      // Create directory if it doesn't exist
      const directory = path.dirname(screenshotPath);
      try {
        await fs.mkdir(directory, { recursive: true });
      } catch (mkdirError) {
        throw new Error(`Failed to create screenshot directory: ${mkdirError}`);
      }

      const result = await processExecutor.execute('xcrun', ['simctl', 'io', udid, 'screenshot', screenshotPath]);

      if (result.exitCode !== 0) {
        throw new Error(`Failed to capture screenshot: ${result.stderr}`);
      }

      // Verify screenshot was created
      let fileStats;
      try {
        fileStats = await fs.stat(screenshotPath);
      } catch {
        throw new Error(`Screenshot file was not created. Expected file: ${screenshotPath}`);
      }

      return {
        success: true,
        data: {
          udid,
          screenshotPath,
          fileSize: fileStats.size,
          status: 'captured',
          message: 'Screenshot captured successfully',
          output: result.stdout,
        },
      };
    }
  });

  // iOS Simulator Utilities - Record video
  tools.set('ios_record_video', {
    name: 'ios_record_video',
    description: 'Record video of an iOS simulator (starts background recording)',
    inputSchema: {
      type: 'object',
      properties: {
        udid: { type: 'string', minLength: 1, description: 'Simulator UDID' },
        path: { type: 'string', minLength: 1, description: 'Absolute path to save video' },
        duration: { type: 'number', minimum: 1, maximum: 300, description: 'Recording duration in seconds (max 5 minutes)' }
      },
      required: ['udid', 'path']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosSimulatorRecordSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { udid, path: videoPath, duration = 30 } = validation.data;

      // Validate UDID format
      if (!validateUDID(udid)) {
        throw new Error(`Invalid simulator UDID format. UDID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX: ${udid}`);
      }

      // Check if recording is already active for this simulator
      if (activeRecordings.has(udid)) {
        throw new Error(`Recording already active for this simulator. Active recording PID: ${activeRecordings.get(udid)}`);
      }

      // Validate video path
      if (!path.isAbsolute(videoPath)) {
        throw new Error(`Video path must be absolute. Path must start with /: ${videoPath}`);
      }

      // Security check for path
      const normalizedPath = path.normalize(videoPath);
      const dangerousPaths = ['/etc', '/usr', '/System', '/private', '/var'];
      if (dangerousPaths.some(dangerous => normalizedPath.startsWith(dangerous))) {
        throw new Error(`Access to this path is not allowed. Path access denied for security reasons: ${normalizedPath}`);
      }

      // Ensure file has video extension
      const allowedExtensions = ['.mov', '.mp4'];
      const extension = path.extname(videoPath).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        throw new Error(`Video file must have video extension. Allowed extensions: ${allowedExtensions.join(', ')}. Got: ${extension}`);
      }

      // Validate duration
      if (duration < 1 || duration > 300) { // Max 5 minutes
        throw new Error(`Duration must be between 1 and 300 seconds. Got duration: ${duration}`);
      }

      // Create directory if it doesn't exist
      const directory = path.dirname(videoPath);
      try {
        await fs.mkdir(directory, { recursive: true });
      } catch (mkdirError) {
        throw new Error(`Failed to create video directory: ${mkdirError}`);
      }

      // Start video recording in background
      const recordProcess = spawn('xcrun', ['simctl', 'io', udid, 'recordVideo', '--timeout', duration.toString(), videoPath], {
        detached: true,
        stdio: 'ignore',
      });

      // Track the recording process
      activeRecordings.set(udid, recordProcess.pid!);

      // Handle process exit
      recordProcess.on('exit', (code) => {
        activeRecordings.delete(udid);
      });

      // Auto-cleanup after duration + buffer time
      setTimeout(() => {
        if (activeRecordings.has(udid)) {
          try {
            process.kill(recordProcess.pid!, 'SIGTERM');
            activeRecordings.delete(udid);
          } catch {
            activeRecordings.delete(udid);
          }
        }
      }, (duration + 5) * 1000); // Add 5 seconds buffer

      // Unref to allow parent process to exit
      recordProcess.unref();

      return {
        success: true,
        data: {
          udid,
          videoPath,
          duration,
          pid: recordProcess.pid,
          status: 'recording_started',
          message: `Video recording started for ${duration} seconds`,
        },
      };
    }
  });

  // iOS Xcode Integration - List schemes
  tools.set('ios_list_schemes', {
    name: 'ios_list_schemes',
    description: 'List Xcode schemes for a project or workspace',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Path to .xcodeproj file' },
        workspace: { type: 'string', description: 'Path to .xcworkspace file' }
      }
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosXcodeListSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { project, workspace } = validation.data;

      if (!project && !workspace) {
        // Try to auto-detect project/workspace in current directory
        const cwd = process.cwd();
        const files = await fs.readdir(cwd);
        
        let detectedWorkspace = files.find(f => f.endsWith('.xcworkspace'));
        let detectedProject = files.find(f => f.endsWith('.xcodeproj'));

        if (!detectedWorkspace && !detectedProject) {
          throw new Error('No Xcode project or workspace found. Either provide project/workspace parameter or run from directory containing .xcodeproj/.xcworkspace');
        }
      }

      const xcode_args = ['-list'];
      
      if (workspace) {
        xcode_args.push('-workspace', workspace);
      } else if (project) {
        xcode_args.push('-project', project);
      }

      const result = await processExecutor.execute('xcodebuild', xcode_args, {
        timeout: 30000, // 30 seconds timeout
      });

      if (result.exitCode !== 0) {
        throw new Error(`Failed to list Xcode schemes: ${result.stderr}`);
      }

      // Parse xcodebuild -list output
      const lines = result.stdout.split('\n');
      const schemes = [];
      const targets = [];
      const configurations = [];
      
      let currentSection = '';
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.includes('Schemes:')) {
          currentSection = 'schemes';
          continue;
        } else if (trimmed.includes('Targets:')) {
          currentSection = 'targets';
          continue;
        } else if (trimmed.includes('Build Configurations:')) {
          currentSection = 'configurations';
          continue;
        } else if (trimmed === '') {
          currentSection = '';
          continue;
        }
        
        if (currentSection && trimmed && !trimmed.startsWith('Information about project')) {
          switch (currentSection) {
            case 'schemes':
              schemes.push(trimmed);
              break;
            case 'targets':
              targets.push(trimmed);
              break;
            case 'configurations':
              configurations.push(trimmed);
              break;
          }
        }
      }

      return {
        success: true,
        data: {
          project: project || 'auto-detected',
          workspace: workspace || 'auto-detected',
          schemes,
          targets,
          configurations,
          rawOutput: result.stdout,
        },
      };
    }
  });

  // iOS Xcode Integration - Build project
  tools.set('ios_build_project', {
    name: 'ios_build_project',
    description: 'Build an iOS Xcode project or workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Path to .xcworkspace file' },
        project: { type: 'string', description: 'Path to .xcodeproj file' },
        scheme: { type: 'string', minLength: 1, description: 'Build scheme name' },
        configuration: { type: 'string', description: 'Build configuration (Debug, Release, etc.)' },
        destination: { type: 'string', description: 'Build destination (e.g., platform=iOS Simulator,name=iPhone 15)' }
      },
      required: ['scheme']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosXcodeBuildSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { workspace, project, scheme, configuration = 'Debug', destination } = validation.data;

      if (!workspace && !project) {
        throw new Error('Either workspace or project must be specified. Provide either workspace or project parameter');
      }

      // Validate scheme name
      if (!validateSchemeName(scheme)) {
        throw new Error(`Invalid scheme name format. Scheme name can only contain alphanumeric characters, underscores, and dashes: ${scheme}`);
      }

      const xcode_args = [];
      
      if (workspace) {
        xcode_args.push('-workspace', workspace);
      } else if (project) {
        xcode_args.push('-project', project);
      }
      
      xcode_args.push('-scheme', scheme);
      
      if (configuration) {
        xcode_args.push('-configuration', configuration);
      }
      
      if (destination) {
        xcode_args.push('-destination', destination);
      }
      
      xcode_args.push('build');

      const result = await processExecutor.execute('xcodebuild', xcode_args, {
        timeout: 600000, // 10 minutes timeout for builds
      });

      const success = result.exitCode === 0;

      return {
        success,
        data: {
          workspace: workspace || null,
          project: project || null,
          scheme,
          configuration: configuration || 'Debug',
          destination: destination || null,
          exitCode: result.exitCode,
          buildSucceeded: success,
          duration: result.duration,
          output: result.stdout,
          errors: result.stderr,
        },
      };
    }
  });

  // iOS Xcode Integration - Run tests
  tools.set('ios_run_tests', {
    name: 'ios_run_tests',
    description: 'Run tests for an iOS Xcode project or workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Path to .xcworkspace file' },
        project: { type: 'string', description: 'Path to .xcodeproj file' },
        scheme: { type: 'string', minLength: 1, description: 'Test scheme name' },
        configuration: { type: 'string', description: 'Build configuration (Debug, Release, etc.)' },
        destination: { type: 'string', description: 'Test destination (e.g., platform=iOS Simulator,name=iPhone 15)' }
      },
      required: ['scheme']
    },
    handler: async (args: any) => {
      checkMacOS();

      const validation = IosXcodeBuildSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { workspace, project, scheme, configuration = 'Debug', destination } = validation.data;

      if (!workspace && !project) {
        throw new Error('Either workspace or project must be specified. Provide either workspace or project parameter');
      }

      // Validate scheme name
      if (!validateSchemeName(scheme)) {
        throw new Error(`Invalid scheme name format. Scheme name can only contain alphanumeric characters, underscores, and dashes: ${scheme}`);
      }

      const xcode_args = [];
      
      if (workspace) {
        xcode_args.push('-workspace', workspace);
      } else if (project) {
        xcode_args.push('-project', project);
      }
      
      xcode_args.push('-scheme', scheme);
      
      if (configuration) {
        xcode_args.push('-configuration', configuration);
      }
      
      if (destination) {
        xcode_args.push('-destination', destination);
      }
      
      xcode_args.push('test');

      const result = await processExecutor.execute('xcodebuild', xcode_args, {
        timeout: 900000, // 15 minutes timeout for tests
      });

      // Parse test results from output
      const testPassed = result.stdout.includes('Test Succeeded') || result.exitCode === 0;
      const testFailed = result.stdout.includes('Test Failed') || result.exitCode !== 0;

      // Extract basic test statistics
      const testSummaryRegex = /Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)/;
      const match = result.stdout.match(testSummaryRegex);
      const testStats = match && match.length >= 5 ? {
        totalTests: parseInt(match[1] || '0', 10),
        failures: parseInt(match[2] || '0', 10),
        errors: parseInt(match[3] || '0', 10),
        skipped: parseInt(match[4] || '0', 10),
      } : null;

      const success = result.exitCode === 0;

      return {
        success,
        data: {
          workspace: workspace || null,
          project: project || null,
          scheme,
          configuration: configuration || 'Debug',
          destination: destination || null,
          exitCode: result.exitCode,
          testsPassed: testPassed,
          testsFailed: testFailed,
          testStatistics: testStats,
          duration: result.duration,
          output: result.stdout,
          errors: result.stderr,
        },
      };
    }
  });

  return tools;
}