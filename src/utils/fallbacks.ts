/**
 * Fallback system for unavailable tools
 * Provides alternative implementations when primary tools are missing
 */

import { ProcessExecutor } from './process.js';
import { RequiredTool } from './tool-categories.js';

const processExecutor = new ProcessExecutor();

export interface FallbackResult {
  success: boolean;
  usedFallback: boolean;
  fallbackTool?: string;
  originalTool: string;
  data?: any;
  message?: string;
  error?: string;
}

export class FallbackManager {
  private toolAvailability: Map<RequiredTool, boolean> = new Map();

  /**
   * Check tool availability and cache results
   */
  async checkToolAvailability(tool: RequiredTool): Promise<boolean> {
    if (this.toolAvailability.has(tool)) {
      return this.toolAvailability.get(tool)!;
    }

    try {
      await processExecutor.execute(tool, ['--version'], { timeout: 5000 });
      this.toolAvailability.set(tool, true);
      return true;
    } catch {
      // Try alternative commands for some tools
      try {
        switch (tool) {
          case RequiredTool.ADB:
            await processExecutor.execute('adb', ['version'], { timeout: 5000 });
            break;
          case RequiredTool.GRADLE:
            await processExecutor.execute('gradle', ['-v'], { timeout: 5000 });
            break;
          default:
            throw new Error(`Tool ${tool} not available`);
        }
        this.toolAvailability.set(tool, true);
        return true;
      } catch {
        this.toolAvailability.set(tool, false);
        return false;
      }
    }
  }

  /**
   * ADB operations fallback to native-run
   */
  async executeAdbWithFallback(
    adbArgs: string[],
    context: { deviceId?: string; platform?: 'android' | 'ios' } = {}
  ): Promise<FallbackResult> {
    const adbAvailable = await this.checkToolAvailability(RequiredTool.ADB);
    const nativeRunAvailable = await this.checkToolAvailability(RequiredTool.NATIVE_RUN);

    // Try ADB first if available
    if (adbAvailable) {
      try {
        const result = await processExecutor.execute('adb', adbArgs);
        return {
          success: true,
          usedFallback: false,
          originalTool: 'adb',
          data: result
        };
      } catch (error: any) {
        // ADB failed, try fallback
        if (nativeRunAvailable) {
          return await this.executeNativeRunFallback(adbArgs, context, error.message);
        }
        throw error;
      }
    }

    // Use native-run as fallback
    if (nativeRunAvailable) {
      return await this.executeNativeRunFallback(adbArgs, context, 'ADB not available');
    }

    return {
      success: false,
      usedFallback: false,
      originalTool: 'adb',
      error: 'Neither ADB nor native-run are available'
    };
  }

  /**
   * Execute native-run as ADB fallback
   */
  private async executeNativeRunFallback(
    adbArgs: string[],
    context: { deviceId?: string; platform?: 'android' | 'ios' },
    originalError: string
  ): Promise<FallbackResult> {
    try {
      // Map ADB commands to native-run equivalents
      const mappedCommand = this.mapAdbToNativeRun(adbArgs, context);
      
      if (!mappedCommand) {
        return {
          success: false,
          usedFallback: true,
          fallbackTool: 'native-run',
          originalTool: 'adb',
          error: `Cannot map ADB command '${adbArgs.join(' ')}' to native-run`
        };
      }

      const result = await processExecutor.execute('native-run', mappedCommand.args);
      
      return {
        success: true,
        usedFallback: true,
        fallbackTool: 'native-run',
        originalTool: 'adb',
        data: result,
        message: mappedCommand.message
      };
    } catch (error: any) {
      return {
        success: false,
        usedFallback: true,
        fallbackTool: 'native-run',
        originalTool: 'adb',
        error: `Fallback failed: ${error.message}. Original error: ${originalError}`
      };
    }
  }

  /**
   * Map ADB commands to native-run equivalents
   */
  private mapAdbToNativeRun(
    adbArgs: string[],
    context: { deviceId?: string; platform?: 'android' | 'ios' }
  ): { args: string[]; message: string } | null {
    const command = adbArgs[0];
    const platform = context.platform || 'android';

    switch (command) {
      case 'devices':
        return {
          args: [platform, '--list'],
          message: 'Listed devices using native-run instead of ADB'
        };

      case 'install':
        if (adbArgs[1]) {
          const args: string[] = [platform, '--app', adbArgs[1]];
          if (context.deviceId) {
            args.push('--target', context.deviceId as string);
          }
          return {
            args,
            message: `Installed app using native-run instead of ADB`
          };
        }
        break;

      case 'shell':
        // Limited shell command support
        if (adbArgs[1] === 'am' && adbArgs[2] === 'start') {
          // Extract package name from intent
          const intentArg = adbArgs.find(arg => arg.includes('/'));
          if (intentArg) {
            const parts = intentArg.split('/');
            if (parts[0]) {
              const packageName = parts[0];
              const args: string[] = [platform, '--app', packageName];
              if (context.deviceId) {
                args.push('--target', context.deviceId as string);
              }
              return {
                args,
                message: 'Launched app using native-run instead of ADB shell'
              };
            }
          }
        }
        break;
    }

    return null;
  }

  /**
   * Gradle operations fallback to system gradle
   */
  async executeGradleWithFallback(
    projectPath: string,
    gradleArgs: string[]
  ): Promise<FallbackResult> {
    // Try gradlew first (preferred)
    const gradlewPath = process.platform === 'win32' ? 
      `${projectPath}/gradlew.bat` : 
      `${projectPath}/gradlew`;

    try {
      const result = await processExecutor.execute(gradlewPath, gradleArgs, {
        cwd: projectPath
      });
      return {
        success: true,
        usedFallback: false,
        originalTool: 'gradlew',
        data: result
      };
    } catch (gradlewError: any) {
      // Try system gradle as fallback
      const gradleAvailable = await this.checkToolAvailability(RequiredTool.GRADLE);
      
      if (gradleAvailable) {
        try {
          const result = await processExecutor.execute('gradle', gradleArgs, {
            cwd: projectPath
          });
          return {
            success: true,
            usedFallback: true,
            fallbackTool: 'gradle',
            originalTool: 'gradlew',
            data: result,
            message: 'Used system Gradle instead of project Gradle wrapper'
          };
        } catch (gradleError: any) {
          return {
            success: false,
            usedFallback: true,
            fallbackTool: 'gradle',
            originalTool: 'gradlew',
            error: `Both Gradle wrapper and system Gradle failed. Wrapper: ${gradlewError.message}, System: ${gradleError.message}`
          };
        }
      }

      return {
        success: false,
        usedFallback: false,
        originalTool: 'gradlew',
        error: `Gradle wrapper failed: ${gradlewError.message}. System Gradle not available.`
      };
    }
  }

  /**
   * Flutter operations with enhanced error messages
   */
  async executeFlutterWithFallback(
    flutterArgs: string[],
    projectPath?: string
  ): Promise<FallbackResult> {
    const flutterAvailable = await this.checkToolAvailability(RequiredTool.FLUTTER);

    if (!flutterAvailable) {
      return {
        success: false,
        usedFallback: false,
        originalTool: 'flutter',
        error: 'Flutter SDK not available. Please install Flutter: https://flutter.dev/docs/get-started/install'
      };
    }

    try {
      const result = await processExecutor.execute('flutter', flutterArgs, {
        cwd: projectPath
      });
      return {
        success: true,
        usedFallback: false,
        originalTool: 'flutter',
        data: result
      };
    } catch (error: any) {
      // Provide helpful error messages for common Flutter issues
      let enhancedError = error.message;

      if (error.message.includes('No pubspec.yaml file found')) {
        enhancedError = 'No pubspec.yaml found. Please run this command from a Flutter project directory.';
      } else if (error.message.includes('No connected devices')) {
        enhancedError = 'No connected devices found. Please connect a device or start an emulator.';
      } else if (error.message.includes('Doctor found issues')) {
        enhancedError = 'Flutter doctor found issues. Run "flutter doctor" to see what needs to be fixed.';
      }

      return {
        success: false,
        usedFallback: false,
        originalTool: 'flutter',
        error: enhancedError
      };
    }
  }

  /**
   * Generate fallback recommendations based on missing tools
   */
  async generateFallbackRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    const adbAvailable = await this.checkToolAvailability(RequiredTool.ADB);
    const nativeRunAvailable = await this.checkToolAvailability(RequiredTool.NATIVE_RUN);
    const flutterAvailable = await this.checkToolAvailability(RequiredTool.FLUTTER);
    const gradleAvailable = await this.checkToolAvailability(RequiredTool.GRADLE);

    if (!adbAvailable && !nativeRunAvailable) {
      recommendations.push(
        '🚨 No device management tools available. Install native-run: npm install -g native-run'
      );
    } else if (!adbAvailable && nativeRunAvailable) {
      recommendations.push(
        '💡 Using native-run as ADB alternative. For full Android SDK: https://developer.android.com/studio'
      );
    }

    if (!flutterAvailable) {
      recommendations.push(
        '🚨 Flutter SDK not available. Install: https://flutter.dev/docs/get-started/install'
      );
    }

    if (!gradleAvailable) {
      recommendations.push(
        '💡 System Gradle not available. Projects will use Gradle wrapper if available.'
      );
    }

    if (process.platform === 'darwin') {
      const xcrunAvailable = await this.checkToolAvailability(RequiredTool.XCRUN);
      if (!xcrunAvailable) {
        recommendations.push(
          '🚨 Xcode Command Line Tools not available. Install: xcode-select --install'
        );
      }
    }

    return recommendations.filter((rec): rec is string => rec !== undefined);
  }

  /**
   * Clear cached tool availability (useful for testing)
   */
  clearCache(): void {
    this.toolAvailability.clear();
  }
}

// Export singleton instance
export const fallbackManager = new FallbackManager();