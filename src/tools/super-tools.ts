/**
 * Super Tools - Combined workflows for common mobile development tasks
 * These tools combine multiple atomic operations into meaningful workflows
 */

import { z } from 'zod';
import { processExecutor } from '../utils/process.js';
import { createFlutterTools } from './flutter.js';
import { createAndroidTools } from './android.js';
import { createIOSTools } from './ios.js';

export function createSuperTools(processMap: Map<string, number>): Map<string, any> {
  const tools = new Map();
  
  // Get base tools for composition
  const flutterTools = createFlutterTools(processMap);
  const androidTools = createAndroidTools(processMap);
  const iosTools = createIOSTools(processMap);

  // Flutter Dev Session - Complete development setup
  tools.set('flutter_dev_session', {
    name: 'flutter_dev_session',
    description: 'Complete Flutter dev setup: check env, list devices, select best device, run with hot reload',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Working directory (Flutter project root)'
        },
        target: {
          type: 'string', 
          description: 'Target dart file (e.g., lib/main.dart)'
        },
        preferPhysical: {
          type: 'boolean',
          description: 'Prefer physical device over emulator',
          default: true
        }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const steps = [];
      
      try {
        // Step 1: Run flutter doctor
        const doctorTool = flutterTools.get('flutter_doctor');
        const doctorResult = await doctorTool.handler({});
        steps.push({ step: 'doctor', ...doctorResult });
        
        // Step 2: List available devices
        const listTool = flutterTools.get('flutter_list_devices');
        const devicesResult = await listTool.handler({});
        steps.push({ step: 'list_devices', ...devicesResult });
        
        // Step 3: Select best device
        let selectedDevice = null;
        if (devicesResult.success && devicesResult.data?.devices?.length > 0) {
          const devices = devicesResult.data.devices;
          
          // Prioritize based on preference
          if (args.preferPhysical) {
            selectedDevice = devices.find((d: any) => !d.emulator) || devices[0];
          } else {
            selectedDevice = devices[0];
          }
        }
        
        // Step 4: Run flutter app
        if (selectedDevice) {
          const runTool = flutterTools.get('flutter_run');
          const runResult = await runTool.handler({
            cwd: args.cwd,
            deviceId: selectedDevice.id,
            target: args.target
          });
          steps.push({ step: 'run', ...runResult });
          
          return {
            success: true,
            data: {
              selectedDevice,
              sessionId: runResult.data?.sessionId,
              steps,
              message: `Flutter dev session started on ${selectedDevice.name}`
            }
          };
        } else {
          // No device available - try to start emulator
          const emulatorsResult = await flutterTools.get('flutter_list_emulators').handler({});
          
          if (emulatorsResult.success && emulatorsResult.data?.emulators?.length > 0) {
            const emulator = emulatorsResult.data.emulators[0];
            await flutterTools.get('flutter_launch_emulator').handler({ 
              emulatorId: emulator.id 
            });
            
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 5000));
            return tools.get('flutter_dev_session').handler(args);
          }
          
          return {
            success: false,
            error: 'No devices available and no emulators to launch',
            steps
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          steps
        };
      }
    }
  });

  // Flutter Test Suite - Complete testing workflow
  tools.set('flutter_test_suite', {
    name: 'flutter_test_suite', 
    description: 'Run complete test suite: unit tests, widget tests, integration tests with coverage report',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Working directory (Flutter project root)'
        },
        coverage: {
          type: 'boolean',
          description: 'Generate coverage report',
          default: true
        },
        integrationTests: {
          type: 'boolean',
          description: 'Include integration tests',
          default: false
        }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const results = {
        unit: null as any,
        widget: null as any,
        integration: null as any,
        coverage: null as any
      };
      
      try {
        // Run unit and widget tests
        const testTool = flutterTools.get('flutter_test');
        results.unit = await testTool.handler({
          cwd: args.cwd,
          coverage: args.coverage
        });
        
        // Run integration tests if requested
        if (args.integrationTests) {
          const { stdout } = await processExecutor.execute(
            'flutter',
            ['test', 'integration_test'],
            { cwd: args.cwd }
          );
          results.integration = { success: true, data: stdout };
        }
        
        // Generate coverage report
        if (args.coverage) {
          const { stdout } = await processExecutor.execute(
            'genhtml',
            ['coverage/lcov.info', '-o', 'coverage/html'],
            { cwd: args.cwd }
          );
          results.coverage = { 
            success: true, 
            data: { 
              htmlReport: 'coverage/html/index.html',
              lcovFile: 'coverage/lcov.info'
            }
          };
        }
        
        return {
          success: true,
          data: results
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          data: results
        };
      }
    }
  });

  // Flutter Release Build - Multi-platform release builder
  tools.set('flutter_release_build', {
    name: 'flutter_release_build',
    description: 'Build release versions for all platforms: APK, AAB, IPA with signing',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Working directory (Flutter project root)'
        },
        platforms: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['apk', 'appbundle', 'ipa', 'ios']
          },
          description: 'Platforms to build for',
          default: ['apk', 'appbundle']
        },
        obfuscate: {
          type: 'boolean',
          description: 'Obfuscate Dart code',
          default: true
        }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const builds: Record<string, any> = {};
      const buildTool = flutterTools.get('flutter_build');
      
      for (const platform of args.platforms || ['apk', 'appbundle']) {
        try {
          const result = await buildTool.handler({
            cwd: args.cwd,
            target: platform,
            buildMode: 'release'
          });
          builds[platform] = result;
        } catch (error) {
          builds[platform] = {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      return {
        success: Object.values(builds).some((b: any) => b.success),
        data: {
          builds,
          artifacts: {
            apk: 'build/app/outputs/flutter-apk/app-release.apk',
            appbundle: 'build/app/outputs/bundle/release/app-release.aab',
            ipa: 'build/ios/ipa/*.ipa'
          }
        }
      };
    }
  });

  // Mobile Device Manager - Smart device selection and management
  tools.set('mobile_device_manager', {
    name: 'mobile_device_manager',
    description: 'Smart device management: list all, recommend best, auto-start if needed',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'recommend', 'ensure'],
          description: 'Action to perform',
          default: 'recommend'
        },
        platform: {
          type: 'string',
          enum: ['android', 'ios', 'any'],
          description: 'Target platform',
          default: 'any'
        }
      }
    },
    handler: async (args: any) => {
      const devices = [];
      const emulators = [];
      
      // Get all available devices
      const flutterDevices = await flutterTools.get('flutter_list_devices').handler({});
      if (flutterDevices.success) {
        devices.push(...(flutterDevices.data?.devices || []));
      }
      
      // Get available emulators
      const flutterEmulators = await flutterTools.get('flutter_list_emulators').handler({});
      if (flutterEmulators.success) {
        emulators.push(...(flutterEmulators.data?.emulators || []));
      }
      
      if (args.action === 'list') {
        return {
          success: true,
          data: { devices, emulators }
        };
      }
      
      if (args.action === 'recommend') {
        // Recommendation logic
        const recommendations = [];
        
        // Physical devices are usually preferred
        const physicalDevices = devices.filter((d: any) => !d.emulator);
        if (physicalDevices.length > 0) {
          recommendations.push({
            device: physicalDevices[0],
            reason: 'Physical device - best performance and real-world testing'
          });
        }
        
        // Running emulators
        const runningEmulators = devices.filter((d: any) => d.emulator);
        if (runningEmulators.length > 0) {
          recommendations.push({
            device: runningEmulators[0],
            reason: 'Emulator already running - ready to use'
          });
        }
        
        // Available emulators to start
        if (emulators.length > 0) {
          recommendations.push({
            emulator: emulators[0],
            reason: 'Emulator available - can be started on demand'
          });
        }
        
        return {
          success: true,
          data: {
            recommendations,
            bestOption: recommendations[0]
          }
        };
      }
      
      if (args.action === 'ensure') {
        // Ensure at least one device is available
        if (devices.length > 0) {
          return {
            success: true,
            data: {
              device: devices[0],
              message: 'Device already available'
            }
          };
        }
        
        // Try to start an emulator
        if (emulators.length > 0) {
          const launchResult = await flutterTools.get('flutter_launch_emulator').handler({
            emulatorId: emulators[0].id
          });
          
          return {
            success: launchResult.success,
            data: {
              emulator: emulators[0],
              launchResult,
              message: 'Started emulator'
            }
          };
        }
        
        return {
          success: false,
          error: 'No devices or emulators available'
        };
      }

      // Default return for unknown action
      return {
        success: false,
        error: `Unknown action: ${args.action}`
      };
    }
  });

  // Flutter Fix Common Issues - Auto-fix tool
  tools.set('flutter_fix_common_issues', {
    name: 'flutter_fix_common_issues',
    description: 'Auto-fix common issues: clean, pub get, pod install, gradle sync, invalidate caches',
    inputSchema: {
      type: 'object',
      properties: {
        cwd: {
          type: 'string',
          description: 'Working directory (Flutter project root)'
        },
        deep: {
          type: 'boolean',
          description: 'Perform deep cleaning (slower but more thorough)',
          default: false
        }
      },
      required: ['cwd']
    },
    handler: async (args: any) => {
      const fixes = [];
      
      try {
        // Step 1: Flutter clean
        const cleanResult = await flutterTools.get('flutter_clean').handler({ cwd: args.cwd });
        fixes.push({ step: 'flutter_clean', ...cleanResult });
        
        // Step 2: Flutter pub get
        const pubResult = await flutterTools.get('flutter_pub_get').handler({ cwd: args.cwd });
        fixes.push({ step: 'flutter_pub_get', ...pubResult });
        
        // Step 3: iOS pod install (if on macOS)
        if (process.platform === 'darwin') {
          try {
            const { stdout } = await processExecutor.execute(
              'pod',
              ['install'],
              { cwd: `${args.cwd}/ios` }
            );
            fixes.push({ step: 'pod_install', success: true, data: stdout });
          } catch (e) {
            fixes.push({ step: 'pod_install', success: false, error: 'Pod install failed' });
          }
        }
        
        // Step 4: Deep clean if requested
        if (args.deep) {
          // Remove build directories
          await processExecutor.execute('rm', ['-rf', 'build'], { cwd: args.cwd });
          await processExecutor.execute('rm', ['-rf', '.dart_tool'], { cwd: args.cwd });
          await processExecutor.execute('rm', ['-rf', '.packages'], { cwd: args.cwd });
          
          // Android specific
          await processExecutor.execute('./gradlew', ['clean'], { cwd: `${args.cwd}/android` });
          
          // iOS specific
          if (process.platform === 'darwin') {
            await processExecutor.execute('rm', ['-rf', 'ios/Pods'], { cwd: args.cwd });
            await processExecutor.execute('rm', ['-rf', `${process.env.HOME}/Library/Developer/Xcode/DerivedData`], {});
          }
          
          fixes.push({ step: 'deep_clean', success: true });
        }
        
        return {
          success: true,
          data: {
            fixes,
            message: 'Common issues fixed successfully'
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          data: { fixes }
        };
      }
    }
  });

  return tools;
}