import { SecurityConfig } from '../types/index.js';

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowedCommands: [
    // Android
    'adb',
    'sdkmanager',
    'avdmanager', 
    'emulator',
    'gradle',
    'gradlew',
    'gradlew.bat',
    'lint',
    // Cross-platform alternatives
    'native-run',
    // iOS
    'xcrun',
    'xcodebuild',
    'simctl',
    // Flutter
    'flutter',
    // System
    'which',
    'ls',
  ],
  maxExecutionTime: 300000, // 5 minutes
  maxOutputSize: 10 * 1024 * 1024, // 10MB
};

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  /[;&|`$(){}[\]]/,  // Shell metacharacters
  /\.\./,            // Directory traversal
  /\/etc\/|\/proc\/|\/sys\//,  // System directories
  /rm\s+-rf/,        // Dangerous rm commands
  /sudo|su\s/,       // Privilege escalation
  />\s*\/|>>/,       // File redirection to system paths
];

export class SecurityValidator {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
  }

  /**
   * Validates if a command is safe to execute
   */
  validateCommand(command: string, args: string[]): void {
    // Check if command is allowed
    if (!this.config.allowedCommands.includes(command)) {
      throw new Error(`Command '${command}' is not allowed`);
    }

    // Check for dangerous patterns in command and args
    const fullCommand = [command, ...args].join(' ');
    
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(fullCommand)) {
        throw new Error(`Command contains dangerous pattern: ${pattern.source}`);
      }
    }

    // Additional validation for specific commands
    this.validateCommandSpecific(command, args);
  }

  /**
   * Command-specific validation rules
   */
  private validateCommandSpecific(command: string, args: string[]): void {
    switch (command) {
      case 'adb':
        this.validateAdbCommand(args);
        break;
      case 'emulator':
        this.validateEmulatorCommand(args);
        break;
      case 'flutter':
        this.validateFlutterCommand(args);
        break;
      // Add more specific validations as needed
    }
  }

  private validateAdbCommand(args: string[]): void {
    // Only allow safe adb commands
    const safeAdbCommands = [
      'devices',
      'install',
      'uninstall',
      'shell',
      'logcat',
      'push',
      'pull',
      'version',
    ];

    if (args.length === 0) return;

    const subCommand = args[0];
    if (subCommand && !safeAdbCommands.includes(subCommand)) {
      throw new Error(`ADB subcommand '${subCommand}' is not allowed`);
    }

    // Block dangerous shell commands
    if (subCommand === 'shell') {
      const shellCommand = args.slice(1).join(' ');
      if (DANGEROUS_PATTERNS.some(pattern => pattern.test(shellCommand))) {
        throw new Error('Dangerous shell command detected');
      }
    }
  }

  private validateEmulatorCommand(args: string[]): void {
    // Allow only safe emulator operations
    const safeArgs = ['-list-avds', '-avd', '-no-window', '-port', '-gpu'];
    
    for (const arg of args) {
      if (arg.startsWith('-') && !safeArgs.includes(arg.split('=')[0] || arg)) {
        throw new Error(`Emulator argument '${arg}' is not allowed`);
      }
    }
  }

  private validateFlutterCommand(args: string[]): void {
    // Allow only safe flutter commands and flags
    const safeFlutterCommands = [
      'doctor',
      'devices',
      'emulators',
      'run',
      'build',
      'test',
      'clean',
      'pub',
      'create',
      'analyze',
    ];

    const safeFlutterFlags = [
      '--version',
      '--machine',
      '--verbose',
      '--no-version-check',
      '--suppress-analytics',
    ];

    if (args.length === 0) return;

    const subCommand = args[0];
    
    if (!subCommand) return;
    
    // Allow flags directly
    if (subCommand.startsWith('--')) {
      if (!safeFlutterFlags.includes(subCommand)) {
        throw new Error(`Flutter flag '${subCommand}' is not allowed`);
      }
      return;
    }
    
    // Allow safe subcommands
    if (subCommand && !safeFlutterCommands.includes(subCommand)) {
      throw new Error(`Flutter subcommand '${subCommand}' is not allowed`);
    }
  }

  /**
   * Sanitize file paths to prevent directory traversal
   */
  sanitizePath(path: string): string {
    // Remove dangerous path components
    return path
      .replace(/\.\./g, '')
      .replace(/\/+/g, '/')
      .replace(/^\/+/, '');
  }

  /**
   * Validate that a path is safe for file operations
   */
  validatePath(path: string): void {
    if (path.includes('..')) {
      throw new Error('Directory traversal attempt detected');
    }

    if (path.startsWith('/etc/') || path.startsWith('/proc/') || path.startsWith('/sys/')) {
      throw new Error('Access to system directories is not allowed');
    }
  }
}

/**
 * Validate the environment and check tool availability
 */
export async function validateEnvironment() {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const tools = ['adb', 'flutter', 'node', 'native-run', 'gradle', 'lint'];
  const toolStatus: Record<string, boolean> = {};

  // Check platform-specific tools
  if (process.platform === 'darwin') {
    tools.push('xcrun', 'xcodebuild');
  }

  for (const tool of tools) {
    try {
      await execAsync(`which ${tool}`);
      toolStatus[tool] = true;
    } catch {
      toolStatus[tool] = false;
    }
  }

  return {
    platform: process.platform,
    nodeVersion: process.version,
    availableTools: toolStatus,
    timestamp: new Date().toISOString(),
  };
}