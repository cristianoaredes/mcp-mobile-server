/**
 * Setup Tools - Automated environment setup for mobile development
 * These tools help configure Flutter, Android SDK, and other dependencies
 */

import { z } from 'zod';
import { processExecutor } from '../utils/process.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export function createSetupTools(processMap: Map<string, number>): Map<string, any> {
  const tools = new Map();

  // Flutter Setup Environment Tool
  tools.set('flutter_setup_environment', {
    name: 'flutter_setup_environment',
    description: 'Complete Flutter SDK installation and environment setup with automatic path configuration',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['check', 'install', 'configure', 'full'],
          description: 'Action to perform (check status, install Flutter, configure paths, or full setup)',
          default: 'check'
        },
        channel: {
          type: 'string',
          enum: ['stable', 'beta', 'dev', 'master'],
          description: 'Flutter channel to install',
          default: 'stable'
        },
        installPath: {
          type: 'string',
          description: 'Custom installation path (default: ~/development/flutter)',
        },
        autoConfig: {
          type: 'boolean',
          description: 'Automatically configure shell environment',
          default: true
        }
      }
    },
    handler: async (args: any) => {
      const homeDir = os.homedir();
      const platform = process.platform as 'darwin' | 'linux' | 'win32';
      const results = {
        platform,
        checks: {} as any,
        installation: null as any,
        configuration: null as any,
        recommendations: [] as string[]
      };

      // Determine default paths based on OS
      const platformPaths = {
        darwin: {
          flutter: path.join(homeDir, 'development', 'flutter'),
          androidSdk: path.join(homeDir, 'Library', 'Android', 'sdk'),
          shellConfig: path.join(homeDir, '.zshrc')
        },
        linux: {
          flutter: path.join(homeDir, 'development', 'flutter'),
          androidSdk: path.join(homeDir, 'Android', 'Sdk'),
          shellConfig: path.join(homeDir, '.bashrc')
        },
        win32: {
          flutter: 'C:\\src\\flutter',
          androidSdk: path.join(homeDir, 'AppData', 'Local', 'Android', 'Sdk'),
          shellConfig: null as string | null // Windows uses system environment variables
        }
      };
      
      const defaultPaths = platformPaths[platform] || platformPaths.linux;

      const installPath = args.installPath || defaultPaths.flutter;

      // Action: CHECK - Check current environment status
      if (args.action === 'check' || args.action === 'full') {
        results.checks = {
          flutter: {
            installed: false,
            version: null,
            path: null,
            inPath: false
          },
          android: {
            sdkInstalled: false,
            sdkPath: null,
            adbAvailable: false,
            platformTools: false,
            cmdlineTools: false,
            emulator: false,
            envVars: {
              ANDROID_HOME: process.env.ANDROID_HOME || null,
              ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT || null
            }
          },
          java: {
            installed: false,
            version: null,
            path: null
          },
          environment: {
            PATH: process.env.PATH?.includes('flutter'),
            shellConfig: null as string | null
          }
        };

        // Check Flutter installation
        try {
          const { stdout: flutterPath } = await processExecutor.execute('which', ['flutter'], {});
          if (flutterPath) {
            results.checks.flutter.installed = true;
            results.checks.flutter.path = flutterPath.trim();
            results.checks.flutter.inPath = true;

            // Get Flutter version
            try {
              const { stdout: version } = await processExecutor.execute('flutter', ['--version'], {});
              const versionMatch = version.match(/Flutter (\d+\.\d+\.\d+)/);
              if (versionMatch) {
                results.checks.flutter.version = versionMatch[1];
              }
            } catch (e) {
              // Version check failed
            }
          }
        } catch (e) {
          // Flutter not in PATH, check common locations
          try {
            await fs.access(installPath);
            const flutterBin = path.join(installPath, 'bin', 'flutter');
            await fs.access(flutterBin);
            results.checks.flutter.installed = true;
            results.checks.flutter.path = installPath;
            results.checks.flutter.inPath = false;
            results.recommendations.push('Flutter is installed but not in PATH. Run with action="configure" to fix.');
          } catch (e) {
            results.recommendations.push('Flutter is not installed. Run with action="install" to install.');
          }
        }

        // Check Android SDK
        const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || defaultPaths.androidSdk;
        try {
          await fs.access(androidHome);
          results.checks.android.sdkInstalled = true;
          results.checks.android.sdkPath = androidHome;

          // Check specific Android tools
          const toolsToCheck = [
            { name: 'adb', path: path.join(androidHome, 'platform-tools', 'adb'), key: 'adbAvailable' },
            { name: 'platform-tools', path: path.join(androidHome, 'platform-tools'), key: 'platformTools' },
            { name: 'cmdline-tools', path: path.join(androidHome, 'cmdline-tools'), key: 'cmdlineTools' },
            { name: 'emulator', path: path.join(androidHome, 'emulator'), key: 'emulator' }
          ];

          for (const tool of toolsToCheck) {
            try {
              await fs.access(tool.path);
              results.checks.android[tool.key] = true;
            } catch (e) {
              results.checks.android[tool.key] = false;
              results.recommendations.push(`Android ${tool.name} not found. Install Android SDK components.`);
            }
          }
        } catch (e) {
          results.recommendations.push('Android SDK not found. Install Android Studio or command-line tools.');
        }

        // Check Java
        try {
          const { stdout: javaVersion } = await processExecutor.execute('java', ['-version'], {});
          results.checks.java.installed = true;
          const versionMatch = javaVersion.match(/version "?(\d+)/);
          if (versionMatch) {
            results.checks.java.version = versionMatch[1];
          }
        } catch (e) {
          results.recommendations.push('Java not found. Install JDK 11 or higher.');
        }

        // Check shell configuration
        if (defaultPaths.shellConfig) {
          try {
            const shellContent = await fs.readFile(defaultPaths.shellConfig, 'utf-8');
            results.checks.environment.shellConfig = defaultPaths.shellConfig;
            
            const hasFlutterPath = shellContent.includes('flutter/bin');
            const hasAndroidHome = shellContent.includes('ANDROID_HOME');
            
            if (!hasFlutterPath) {
              results.recommendations.push('Flutter not configured in shell. Run with action="configure".');
            }
            if (!hasAndroidHome) {
              results.recommendations.push('Android SDK not configured in shell. Run with action="configure".');
            }
          } catch (e) {
            results.recommendations.push('Shell configuration file not found.');
          }
        }
      }

      // Action: INSTALL - Install Flutter SDK
      if (args.action === 'install' || args.action === 'full') {
        if (!results.checks?.flutter?.installed || args.action === 'install') {
          results.installation = {
            status: 'starting',
            path: installPath,
            channel: args.channel || 'stable'
          };

          try {
            // Create installation directory
            await fs.mkdir(path.dirname(installPath), { recursive: true });

            // Download Flutter based on platform
            const downloadUrls: Record<string, string> = {
              darwin: `https://storage.googleapis.com/flutter_infra_release/releases/${args.channel}/macos/flutter_macos_arm64-${args.channel}.zip`,
              linux: `https://storage.googleapis.com/flutter_infra_release/releases/${args.channel}/linux/flutter_linux_${args.channel}.tar.xz`,
              win32: `https://storage.googleapis.com/flutter_infra_release/releases/${args.channel}/windows/flutter_windows_${args.channel}.zip`
            };

            const downloadUrl = downloadUrls[platform as string];
            if (!downloadUrl) {
              throw new Error(`Unsupported platform: ${platform}`);
            }

            // Check if git is available for cloning
            try {
              await processExecutor.execute('git', ['--version'], {});
              
              // Clone Flutter repository
              results.installation.method = 'git';
              results.installation.status = 'cloning';
              
              await processExecutor.execute('git', [
                'clone',
                'https://github.com/flutter/flutter.git',
                '-b',
                args.channel || 'stable',
                installPath
              ], { timeout: 300000 }); // 5 minute timeout for clone

              results.installation.status = 'success';
              results.installation.message = `Flutter installed successfully at ${installPath}`;
            } catch (gitError) {
              // Fallback to download method
              results.installation.method = 'download';
              results.installation.status = 'downloading';
              results.installation.error = 'Git not available, manual download required';
              results.installation.downloadUrl = downloadUrl;
              results.recommendations.push(`Download Flutter manually from: ${downloadUrl}`);
            }
          } catch (error) {
            results.installation.status = 'failed';
            results.installation.error = error instanceof Error ? error.message : String(error);
          }
        }
      }

      // Action: CONFIGURE - Configure environment variables
      if ((args.action === 'configure' || args.action === 'full') && args.autoConfig !== false) {
        results.configuration = {
          status: 'starting',
          shellConfig: defaultPaths.shellConfig,
          changes: [] as string[]
        };

        if (platform === 'win32') {
          results.configuration.status = 'manual';
          results.configuration.instructions = [
            'Add Flutter to Windows PATH:',
            `1. Add "${installPath}\\bin" to your PATH`,
            '2. Set ANDROID_HOME environment variable',
            '3. Restart your terminal'
          ];
        } else if (defaultPaths.shellConfig) {
          try {
            const shellPath = defaultPaths.shellConfig;
            let shellContent = '';
            
            try {
              shellContent = await fs.readFile(shellPath, 'utf-8');
            } catch (e) {
              // File doesn't exist, create it
              shellContent = '';
            }

            const additions = [];
            
            // Add Flutter configuration if not present
            if (!shellContent.includes('flutter/bin')) {
              const flutterPath = results.checks?.flutter?.path || installPath;
              additions.push(`
# Flutter SDK Configuration
export PATH="$PATH:${flutterPath}/bin"
export PATH="$PATH:${flutterPath}/bin/cache/dart-sdk/bin"
export PATH="$PATH:$HOME/.pub-cache/bin"`);
              results.configuration.changes.push('Added Flutter to PATH');
            }

            // Add Android SDK configuration if not present
            if (!shellContent.includes('ANDROID_HOME') && results.checks?.android?.sdkPath) {
              additions.push(`
# Android SDK Configuration
export ANDROID_HOME="${results.checks.android.sdkPath}"
export ANDROID_SDK_ROOT="${results.checks.android.sdkPath}"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"`);
              results.configuration.changes.push('Added Android SDK configuration');
            }

            // Add Chrome executable for web development (macOS)
            if (platform === 'darwin' && !shellContent.includes('CHROME_EXECUTABLE')) {
              additions.push(`
# Chrome for Flutter Web Development
export CHROME_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`);
              results.configuration.changes.push('Added Chrome executable for web development');
            }

            if (additions.length > 0) {
              await fs.appendFile(shellPath, additions.join('\n') + '\n');
              results.configuration.status = 'success';
              results.configuration.message = `Updated ${shellPath}. Run 'source ${shellPath}' to apply changes.`;
            } else {
              results.configuration.status = 'unchanged';
              results.configuration.message = 'Environment already configured correctly.';
            }
          } catch (error) {
            results.configuration.status = 'failed';
            results.configuration.error = error instanceof Error ? error.message : String(error);
          }
        }
      }

      // Final recommendations
      if (results.checks?.flutter?.installed && results.checks?.flutter?.inPath) {
        results.recommendations.push('Run "flutter doctor" to verify your setup.');
      }

      return {
        success: true,
        data: results
      };
    }
  });

  // Android SDK Setup Tool
  tools.set('android_sdk_setup', {
    name: 'android_sdk_setup',
    description: 'Setup Android SDK and configure environment for Android development',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['check', 'install', 'configure'],
          description: 'Action to perform',
          default: 'check'
        },
        components: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'SDK components to install (platform-tools, build-tools, platforms, etc.)',
          default: ['platform-tools', 'build-tools;34.0.0', 'platforms;android-34']
        }
      }
    },
    handler: async (args: any) => {
      const homeDir = os.homedir();
      const platform = process.platform;
      
      const androidPath = platform === 'darwin' 
        ? path.join(homeDir, 'Library', 'Android', 'sdk')
        : platform === 'win32'
        ? path.join(homeDir, 'AppData', 'Local', 'Android', 'Sdk')
        : path.join(homeDir, 'Android', 'Sdk');

      const results = {
        platform,
        androidPath,
        status: {} as any,
        installation: null as any,
        configuration: null as any
      };

      // Check current status
      if (args.action === 'check' || args.action === 'install') {
        try {
          await fs.access(androidPath);
          results.status.sdkFound = true;
          
          // Check for sdkmanager
          const sdkManagerPaths = [
            path.join(androidPath, 'cmdline-tools', 'latest', 'bin', 'sdkmanager'),
            path.join(androidPath, 'cmdline-tools', '17.0', 'bin', 'sdkmanager'),
            path.join(androidPath, 'tools', 'bin', 'sdkmanager')
          ];
          
          let sdkManagerPath = null;
          for (const path of sdkManagerPaths) {
            try {
              await fs.access(path);
              sdkManagerPath = path;
              break;
            } catch (e) {
              // Continue checking
            }
          }
          
          results.status.sdkManager = sdkManagerPath;
          
          if (sdkManagerPath && args.action === 'install') {
            // Install requested components
            results.installation = {
              components: args.components || [],
              results: []
            };
            
            for (const component of args.components || []) {
              try {
                await processExecutor.execute(sdkManagerPath, [
                  '--install',
                  component,
                  '--sdk_root=' + androidPath
                ], { timeout: 300000 });
                
                results.installation.results.push({
                  component,
                  status: 'success'
                });
              } catch (error) {
                results.installation.results.push({
                  component,
                  status: 'failed',
                  error: error instanceof Error ? error.message : String(error)
                });
              }
            }
          }
        } catch (e) {
          results.status.sdkFound = false;
          results.status.message = 'Android SDK not found. Install Android Studio or command-line tools.';
        }
      }

      return {
        success: true,
        data: results
      };
    }
  });

  return tools;
}