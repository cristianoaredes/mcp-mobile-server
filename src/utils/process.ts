import { execa } from 'execa';
import { CommandResult } from '../types/index.js';
import { SecurityValidator, DEFAULT_SECURITY_CONFIG } from './security.js';
import { setTimeout } from 'timers/promises';

export class ProcessExecutor {
  private security: SecurityValidator;

  constructor() {
    this.security = new SecurityValidator(DEFAULT_SECURITY_CONFIG);
  }

  /**
   * Execute a command safely with security validation
   */
  async execute(
    command: string,
    args: string[] = [],
    options: {
      cwd?: string;
      timeout?: number;
      maxOutputSize?: number;
      env?: Record<string, string>;
    } = {}
  ): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      // Security validation
      this.security.validateCommand(command, args);
      
      if (options.cwd) {
        this.security.validatePath(options.cwd);
      }

      // Set timeout
      const timeout = options.timeout || DEFAULT_SECURITY_CONFIG.maxExecutionTime;
      const maxOutputSize = options.maxOutputSize || DEFAULT_SECURITY_CONFIG.maxOutputSize;

      // Execute command
      const result = await execa(command, args, {
        cwd: options.cwd,
        timeout,
        maxBuffer: maxOutputSize,
        env: {
          ...process.env,
          ...options.env,
        },
        encoding: 'utf8',
        reject: false, // Don't throw on non-zero exit codes
      });

      const duration = Date.now() - startTime;

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof Error) {
        // Handle timeout
        if (error.message.includes('timeout')) {
          throw new Error(`Command timed out after ${options.timeout || DEFAULT_SECURITY_CONFIG.maxExecutionTime}ms`);
        }
        
        // Handle killed process
        if (error.message.includes('killed')) {
          throw new Error('Command was killed due to resource limits');
        }
        
        // Re-throw security errors
        if (error.message.includes('not allowed') || error.message.includes('dangerous')) {
          throw error;
        }
      }

      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        duration,
      };
    }
  }

  /**
   * Execute command and stream output
   */
  async *executeStream(
    command: string,
    args: string[] = [],
    options: {
      cwd?: string;
      timeout?: number;
      env?: Record<string, string>;
    } = {}
  ): AsyncGenerator<{ type: 'stdout' | 'stderr'; data: string }, CommandResult> {
    // Security validation
    this.security.validateCommand(command, args);
    
    if (options.cwd) {
      this.security.validatePath(options.cwd);
    }

    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    try {
      const subprocess = execa(command, args, {
        cwd: options.cwd,
        timeout: options.timeout || DEFAULT_SECURITY_CONFIG.maxExecutionTime,
        env: {
          ...process.env,
          ...options.env,
        },
        encoding: 'utf8',
        buffer: false,
      });

      // Stream stdout
      if (subprocess.stdout) {
        subprocess.stdout.on('data', (chunk: Buffer) => {
          const data = chunk.toString();
          stdout += data;
        });
      }

      // Stream stderr
      if (subprocess.stderr) {
        subprocess.stderr.on('data', (chunk: Buffer) => {
          const data = chunk.toString();
          stderr += data;
        });
      }

      const result = await subprocess;
      const duration = Date.now() - startTime;

      return {
        stdout,
        stderr,
        exitCode: result.exitCode,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        stdout,
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        duration,
      };
    }
  }

  /**
   * Check if a command exists in the system
   */
  async checkCommand(command: string): Promise<boolean> {
    try {
      const result = await this.execute('which', [command]);
      return result.exitCode === 0 && result.stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the full path of a command
   */
  async getCommandPath(command: string): Promise<string | null> {
    try {
      const result = await this.execute('which', [command]);
      return result.exitCode === 0 ? result.stdout.trim() : null;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const processExecutor = new ProcessExecutor();