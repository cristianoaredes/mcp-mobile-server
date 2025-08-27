import { z } from 'zod';
import { processExecutor } from '../utils/process.js';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

// Process tracking for flutter run sessions per tool instance
let runningFlutterSessions: Map<string, { pid: number; deviceId: string; projectPath: string }>;

// Zod schemas for Flutter tools
const FlutterEmulatorLaunchSchema = z.object({
  emulatorId: z.string().min(1),
});

const FlutterRunSchema = z.object({
  cwd: z.string().min(1),
  deviceId: z.string().optional(),
  target: z.string().optional(),
  flavor: z.string().optional(),
  debugPort: z.number().min(1024).max(65535).optional(),
});

const FlutterBuildSchema = z.object({
  cwd: z.string().min(1),
  target: z.enum(['apk', 'appbundle', 'ipa', 'ios', 'android', 'web', 'windows', 'macos', 'linux']),
  buildMode: z.enum(['debug', 'profile', 'release']).default('debug'),
  flavor: z.string().optional(),
});

const FlutterTestSchema = z.object({
  cwd: z.string().min(1),
  testFile: z.string().optional(),
  coverage: z.boolean().default(false),
});

const FlutterCleanSchema = z.object({
  cwd: z.string().min(1),
});

const FlutterPubGetSchema = z.object({
  cwd: z.string().min(1),
});

const FlutterScreenshotSchema = z.object({
  deviceId: z.string().optional(),
  outputPath: z.string().optional(),
});

const FlutterStopSessionSchema = z.object({
  sessionId: z.string().min(1),
});

// Helper function to validate Flutter project
const validateFlutterProject = async (cwd: string): Promise<void> => {
  const pubspecPath = path.join(cwd, 'pubspec.yaml');
  try {
    await fs.access(pubspecPath);
    const pubspecContent = await fs.readFile(pubspecPath, 'utf8');
    if (!pubspecContent.includes('flutter:')) {
      throw new Error(`Directory does not appear to be a Flutter project. No flutter section found in ${pubspecPath}`);
    }
  } catch {
    throw new Error(`pubspec.yaml not found. Flutter project must contain pubspec.yaml at: ${pubspecPath}`);
  }
};

/**
 * Create Flutter MCP tools
 */
export function createFlutterTools(globalProcessMap: Map<string, number>): Map<string, any> {
  // Initialize local sessions tracking if not provided
  runningFlutterSessions = new Map();

  const tools = new Map<string, any>();

  // Flutter Doctor - System diagnostics
  tools.set('flutter_doctor', {
    name: 'flutter_doctor',
    description: 'Run Flutter doctor to check development environment setup',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('flutter', ['doctor', '--machine']);
      
      if (result.exitCode !== 0) {
        // Try fallback without --machine flag
        const fallbackResult = await processExecutor.execute('flutter', ['doctor', '-v']);
        
        return {
          success: true,
          data: {
            status: 'completed_with_issues',
            machineOutput: null,
            humanOutput: fallbackResult.stdout,
            issues: fallbackResult.stderr,
            rawExitCode: result.exitCode,
          },
        };
      }

      // Parse machine output if available
      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        // If JSON parsing fails, provide raw output
        parsedOutput = null;
      }

      return {
        success: true,
        data: {
          status: 'completed',
          machineOutput: parsedOutput,
          rawOutput: result.stdout,
          issues: result.stderr,
          exitCode: result.exitCode,
        },
      };
    }
  });

  // Flutter Version - Get version information
  tools.set('flutter_version', {
    name: 'flutter_version',
    description: 'Get Flutter SDK version information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('flutter', ['--version', '--machine']);
      
      if (result.exitCode !== 0) {
        // Try fallback without --machine flag
        const fallbackResult = await processExecutor.execute('flutter', ['--version']);
        
        return {
          success: true,
          data: {
            machineOutput: null,
            humanOutput: fallbackResult.stdout,
            rawExitCode: result.exitCode,
          },
        };
      }

      // Parse machine output if available
      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        // Fallback to human readable
        const humanResult = await processExecutor.execute('flutter', ['--version']);
        return {
          success: true,
          data: {
            machineOutput: null,
            humanOutput: humanResult.stdout,
            rawExitCode: result.exitCode,
          },
        };
      }

      return {
        success: true,
        data: {
          machineOutput: parsedOutput,
          rawOutput: result.stdout,
          exitCode: result.exitCode,
        },
      };
    }
  });

  // Flutter Devices - List connected devices
  tools.set('flutter_list_devices', {
    name: 'flutter_list_devices',
    description: 'List connected devices and emulators available for Flutter development',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('flutter', ['devices', '--machine']);
      
      if (result.exitCode !== 0) {
        throw new Error(`Failed to list Flutter devices: ${result.stderr}`);
      }

      // Parse JSON output
      let devices = [];
      try {
        devices = JSON.parse(result.stdout);
      } catch (parseError) {
        throw new Error(`Failed to parse devices output: ${parseError}`);
      }

      // Enhance device info with running session status
      const enhancedDevices = devices.map((device: any) => ({
        ...device,
        hasRunningSession: Array.from(runningFlutterSessions.values()).some(
          session => session.deviceId === device.id
        ),
      }));

      return {
        success: true,
        data: {
          devices: enhancedDevices,
          totalCount: enhancedDevices.length,
          connectedCount: enhancedDevices.filter((d: any) => d.isDevice).length,
          simulatorCount: enhancedDevices.filter((d: any) => !d.isDevice).length,
          runningSessionsCount: runningFlutterSessions.size,
        },
      };
    }
  });

  // Flutter Emulators - List available emulators
  tools.set('flutter_list_emulators', {
    name: 'flutter_list_emulators',
    description: 'List available emulators for Flutter development',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const result = await processExecutor.execute('flutter', ['emulators']);
      
      if (result.exitCode !== 0) {
        throw new Error(`Failed to list Flutter emulators: ${result.stderr}`);
      }

      // Parse text output (emulators command doesn't support --machine flag)
      const emulators = result.stdout
        .split('\n')
        .filter((line: string) => line.trim() && !line.includes('No emulators available'))
        .map((line: string, index: number) => ({
          id: `emulator_${index}`,
          name: line.trim(),
          available: true
        }));

      return {
        success: true,
        data: {
          emulators,
          totalCount: emulators.length,
        },
      };
    }
  });

  // Flutter Emulators - Launch emulator
  tools.set('flutter_launch_emulator', {
    name: 'flutter_launch_emulator',
    description: 'Launch a Flutter emulator',
    inputSchema: {
      type: 'object',
      properties: {
        emulatorId: { type: 'string', minLength: 1, description: 'Emulator ID to launch' }
      },
      required: ['emulatorId']
    },
    handler: async (args: any) => {
      const validation = FlutterEmulatorLaunchSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { emulatorId } = validation.data;

      // Validate emulator ID format (alphanumeric, underscores, dots, dashes)
      if (!/^[a-zA-Z0-9._-]+$/.test(emulatorId)) {
        throw new Error(`Invalid emulator ID format. Emulator ID can only contain alphanumeric characters, dots, underscores, and dashes: ${emulatorId}`);
      }

      const result = await processExecutor.execute(
        'flutter', 
        ['emulators', '--launch', emulatorId],
        { timeout: 180000 } // 3 minutes timeout for emulator launch
      );

      if (result.exitCode !== 0) {
        throw new Error(`Failed to launch emulator: ${result.stderr || result.stdout}`);
      }

      return {
        success: true,
        data: {
          emulatorId,
          status: 'launched',
          output: result.stdout,
        },
      };
    }
  });

  // Flutter Run - Start development session
  tools.set('flutter_run', {
    name: 'flutter_run',
    description: 'Start a Flutter development session (hot reload enabled)',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', minLength: 1, description: 'Working directory (Flutter project root)' },
        deviceId: { type: 'string', description: 'Target device ID' },
        target: { type: 'string', description: 'Target dart file (e.g., lib/main.dart)' },
        flavor: { type: 'string', description: 'Build flavor' },
        debugPort: { type: 'number', minimum: 1024, maximum: 65535, description: 'Debug port number' }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const validation = FlutterRunSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { cwd, deviceId, target, flavor, debugPort } = validation.data;

      // Validate that it's a Flutter project
      await validateFlutterProject(cwd);

      // Check if there's already a running session for this project
      const existingSession = Array.from(runningFlutterSessions.entries()).find(
        ([_, session]) => session.projectPath === cwd
      );
      
      if (existingSession) {
        return {
          success: true,
          data: {
            sessionId: existingSession[0],
            pid: existingSession[1].pid,
            status: 'already_running',
            projectPath: cwd,
            deviceId: existingSession[1].deviceId,
            message: 'Flutter run session is already active for this project',
          },
        };
      }

      const flutter_args = ['run'];
      
      if (deviceId) {
        flutter_args.push('-d', deviceId);
      }
      
      if (target) {
        // Validate target path (must be .dart file)
        if (!target.endsWith('.dart')) {
          throw new Error(`Target must be a .dart file. Invalid target: ${target}`);
        }
        flutter_args.push('--target', target);
      }
      
      if (flavor) {
        flutter_args.push('--flavor', flavor);
      }
      
      if (debugPort) {
        flutter_args.push('--debug-port', debugPort.toString());
      }

      // Start flutter run in background
      const flutterProcess = spawn('flutter', flutter_args, {
        cwd,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const sessionId = `flutter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Track the process
      runningFlutterSessions.set(sessionId, {
        pid: flutterProcess.pid!,
        deviceId: deviceId || 'default',
        projectPath: cwd,
      });

      // Handle process exit
      flutterProcess.on('exit', () => {
        runningFlutterSessions.delete(sessionId);
      });

      // Unref to allow the parent process to exit
      flutterProcess.unref();

      return {
        success: true,
        data: {
          sessionId,
          pid: flutterProcess.pid,
          status: 'started',
          projectPath: cwd,
          deviceId: deviceId || 'default',
          target: target || 'lib/main.dart',
          flavor,
          debugPort,
        },
      };
    }
  });

  // Flutter Run - Stop development session
  tools.set('flutter_stop_session', {
    name: 'flutter_stop_session',
    description: 'Stop a running Flutter development session',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', minLength: 1, description: 'Flutter session ID to stop' }
      },
      required: ['sessionId']
    },
    handler: async (args: any) => {
      const validation = FlutterStopSessionSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { sessionId } = validation.data;

      const session = runningFlutterSessions.get(sessionId);
      if (!session) {
        throw new Error(`Flutter run session not found. No active session found with ID: ${sessionId}`);
      }

      try {
        // Kill the process
        process.kill(session.pid, 'SIGTERM');
        
        // Remove from tracking
        runningFlutterSessions.delete(sessionId);

        return {
          success: true,
          data: {
            sessionId,
            pid: session.pid,
            status: 'stopped',
            projectPath: session.projectPath,
          },
        };
      } catch (killError) {
        // Process might already be dead
        runningFlutterSessions.delete(sessionId);
        
        return {
          success: true,
          data: {
            sessionId,
            pid: session.pid,
            status: 'already_stopped',
            projectPath: session.projectPath,
            message: 'Process was already terminated',
          },
        };
      }
    }
  });

  // Flutter Run Sessions - List active sessions
  tools.set('flutter_list_sessions', {
    name: 'flutter_list_sessions',
    description: 'List active Flutter development sessions',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const sessions = Array.from(runningFlutterSessions.entries()).map(([sessionId, session]) => ({
        sessionId,
        ...session,
      }));

      return {
        success: true,
        data: {
          sessions,
          totalCount: sessions.length,
        },
      };
    }
  });

  // Flutter Build - Build app for target platform
  tools.set('flutter_build', {
    name: 'flutter_build',
    description: 'Build Flutter app for specific target platform',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', minLength: 1, description: 'Working directory (Flutter project root)' },
        target: { 
          type: 'string',
          enum: ['apk', 'appbundle', 'ipa', 'ios', 'android', 'web', 'windows', 'macos', 'linux'],
          description: 'Build target platform'
        },
        buildMode: {
          type: 'string',
          enum: ['debug', 'profile', 'release'],
          description: 'Build mode'
        },
        flavor: { type: 'string', description: 'Build flavor' }
      },
      required: ['cwd', 'target']
    },
    handler: async (args: any) => {
      const validation = FlutterBuildSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { cwd, target, buildMode = 'debug', flavor } = validation.data;

      // Validate that it's a Flutter project
      await validateFlutterProject(cwd);

      const flutter_args = ['build', target];
      
      if (buildMode !== 'debug') {
        flutter_args.push(`--${buildMode}`);
      }
      
      if (flavor) {
        flutter_args.push('--flavor', flavor);
      }

      const result = await processExecutor.execute('flutter', flutter_args, {
        cwd,
        timeout: 1800000, // 30 minutes timeout for builds
      });

      if (result.exitCode !== 0) {
        throw new Error(`Flutter build failed: ${result.stderr || result.stdout}`);
      }

      return {
        success: true,
        data: {
          target,
          buildMode,
          flavor,
          projectPath: cwd,
          output: result.stdout,
          duration: result.duration,
          exitCode: result.exitCode,
        },
      };
    }
  });

  // Flutter Test - Run tests
  tools.set('flutter_test', {
    name: 'flutter_test',
    description: 'Run Flutter tests with optional coverage',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', minLength: 1, description: 'Working directory (Flutter project root)' },
        testFile: { type: 'string', description: 'Specific test file to run (optional)' },
        coverage: { type: 'boolean', description: 'Enable test coverage' }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const validation = FlutterTestSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { cwd, testFile, coverage = false } = validation.data;

      // Validate that it's a Flutter project
      await validateFlutterProject(cwd);

      const flutter_args = ['test'];
      
      if (testFile) {
        // Validate test file path (must be .dart file in test directory)
        if (!testFile.endsWith('.dart')) {
          throw new Error(`Test file must be a .dart file. Invalid test file: ${testFile}`);
        }
        
        // Check if test file exists
        const testFilePath = path.isAbsolute(testFile) ? testFile : path.join(cwd, testFile);
        try {
          await fs.access(testFilePath);
        } catch {
          throw new Error(`Test file not found. File does not exist: ${testFilePath}`);
        }
        
        flutter_args.push(testFile);
      }
      
      if (coverage) {
        flutter_args.push('--coverage');
      }

      const result = await processExecutor.execute('flutter', flutter_args, {
        cwd,
        timeout: 600000, // 10 minutes timeout for tests
      });

      return {
        success: true,
        data: {
          testFile: testFile || 'all tests',
          coverage,
          projectPath: cwd,
          exitCode: result.exitCode,
          output: result.stdout,
          errors: result.stderr,
          duration: result.duration,
          passed: result.exitCode === 0,
        },
      };
    }
  });

  // Flutter Clean - Clean build cache
  tools.set('flutter_clean', {
    name: 'flutter_clean',
    description: 'Clean Flutter build cache and generated files',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', minLength: 1, description: 'Working directory (Flutter project root)' }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const validation = FlutterCleanSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { cwd } = validation.data;

      // Validate that it's a Flutter project
      await validateFlutterProject(cwd);

      const result = await processExecutor.execute('flutter', ['clean'], {
        cwd,
        timeout: 120000, // 2 minutes timeout for clean
      });

      return {
        success: true,
        data: {
          projectPath: cwd,
          exitCode: result.exitCode,
          output: result.stdout,
          duration: result.duration,
        },
      };
    }
  });

  // Flutter Pub Get - Install dependencies
  tools.set('flutter_pub_get', {
    name: 'flutter_pub_get',
    description: 'Install Flutter project dependencies (pub get)',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: { type: 'string', minLength: 1, description: 'Working directory (Flutter project root)' }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const validation = FlutterPubGetSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { cwd } = validation.data;

      // Validate that it's a Flutter project
      await validateFlutterProject(cwd);

      const result = await processExecutor.execute('flutter', ['pub', 'get'], {
        cwd,
        timeout: 300000, // 5 minutes timeout for pub get
      });

      return {
        success: true,
        data: {
          projectPath: cwd,
          exitCode: result.exitCode,
          output: result.stdout,
          errors: result.stderr,
          duration: result.duration,
          success: result.exitCode === 0,
        },
      };
    }
  });

  // Flutter Screenshot - Take screenshot from connected device
  tools.set('flutter_screenshot', {
    name: 'flutter_screenshot',
    description: 'Take a screenshot from a connected Flutter device',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Target device ID (optional)' },
        outputPath: { type: 'string', description: 'Output PNG file path (optional)' }
      }
    },
    handler: async (args: any) => {
      const validation = FlutterScreenshotSchema.safeParse(args);
      if (!validation.success) {
        throw new Error(`Invalid request: ${validation.error.message}`);
      }

      const { deviceId, outputPath } = validation.data;

      const flutter_args = ['screenshot'];
      
      if (deviceId) {
        // Validate device ID format
        if (!/^[a-zA-Z0-9._:-]+$/.test(deviceId)) {
          throw new Error(`Invalid device ID format. Device ID contains invalid characters: ${deviceId}`);
        }
        flutter_args.push('-d', deviceId);
      }

      if (outputPath) {
        // Validate output path (must end with .png)
        if (!outputPath.endsWith('.png')) {
          throw new Error(`Screenshot output must be a .png file. Invalid path: ${outputPath}`);
        }
        flutter_args.push('-o', outputPath);
      }

      const result = await processExecutor.execute('flutter', flutter_args, {
        timeout: 60000, // 1 minute timeout for screenshot
      });

      if (result.exitCode !== 0) {
        throw new Error(`Screenshot capture failed: ${result.stderr || result.stdout}`);
      }

      return {
        success: true,
        data: {
          deviceId: deviceId || 'default',
          outputPath: outputPath || 'flutter_screenshot.png',
          output: result.stdout,
          duration: result.duration,
        },
      };
    }
  });

  return tools;
}