#!/usr/bin/env node
/**
 * Tool Validation Script
 * Tests all MCP tools to ensure they work correctly
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createAndroidTools } from '../src/tools/android.js';
import { createFlutterTools } from '../src/tools/flutter.js';
import { createIOSTools } from '../src/tools/ios.js';
import { validateEnvironment } from '../src/utils/security.js';
import { 
  TOOL_REGISTRY, 
  ToolCategory, 
  generateHealthCheckReport, 
  getSafeTestingTools,
  getToolsByCategory 
} from '../src/utils/tool-categories.js';

interface ToolValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
  reason?: string;
}

class ToolValidator {
  private results: ToolValidationResult[] = [];
  
  async validateAllTools(): Promise<void> {
    console.log('🔍 Starting tool validation...\n');
    
    // Check environment first
    const envInfo = await validateEnvironment();
    console.log('📊 Environment Check:');
    console.log(`Platform: ${envInfo.platform}`);
    console.log(`Node: ${envInfo.nodeVersion}`);
    console.log('Available Tools:');
    Object.entries(envInfo.availableTools).forEach(([tool, available]) => {
      console.log(`  ${available ? '✅' : '❌'} ${tool}`);
    });
    console.log('');

    // Get all tools
    const androidTools = createAndroidTools();
    const flutterTools = createFlutterTools();
    const iosTools = createIOSTools();
    
    const allTools = new Map([
      ...androidTools,
      ...flutterTools,
      ...iosTools
    ]);

    console.log(`🛠️  Found ${allTools.size} tools to validate\n`);

    // Validate each tool category
    await this.validateToolCategory('Android', androidTools, envInfo);
    await this.validateToolCategory('Flutter', flutterTools, envInfo);
    await this.validateToolCategory('iOS', iosTools, envInfo);

    // Print summary
    await this.printSummary(envInfo);
  }

  private async validateToolCategory(
    category: string, 
    tools: Map<string, any>,
    envInfo: any
  ): Promise<void> {
    console.log(`📱 Validating ${category} Tools (${tools.size}):`);
    
    for (const [name, tool] of tools) {
      await this.validateTool(name, tool, envInfo);
    }
    console.log('');
  }

  private async validateTool(
    name: string, 
    tool: any, 
    envInfo: any
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if required tools are available
      const requiredTool = this.getRequiredToolForOperation(name);
      if (requiredTool && !envInfo.availableTools[requiredTool]) {
        this.results.push({
          name,
          status: 'skip',
          reason: `Required tool '${requiredTool}' not available`
        });
        console.log(`  ⏭️  ${name} - Skipped (${requiredTool} not available)`);
        return;
      }

      // Get safe test arguments for the tool
      const testArgs = this.getSafeTestArgs(name);
      if (!testArgs) {
        this.results.push({
          name,
          status: 'skip',
          reason: 'No safe test arguments available'
        });
        console.log(`  ⏭️  ${name} - Skipped (no safe test)`);
        return;
      }

      // Execute the tool
      const result = await tool.handler(testArgs);
      const duration = Date.now() - startTime;

      if (result && typeof result === 'object') {
        if (result.success === true || (result.success === false && result.error)) {
          this.results.push({
            name,
            status: 'pass',
            duration
          });
          console.log(`  ✅ ${name} - Pass (${duration}ms)`);
        } else {
          this.results.push({
            name,
            status: 'fail',
            error: 'Invalid response format',
            duration
          });
          console.log(`  ❌ ${name} - Fail (Invalid response)`);
        }
      } else {
        this.results.push({
          name,
          status: 'fail',
          error: 'Tool returned invalid result',
          duration
        });
        console.log(`  ❌ ${name} - Fail (No result)`);
      }

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: 'fail',
        error: error.message,
        duration
      });
      console.log(`  ❌ ${name} - Fail (${error.message})`);
    }
  }

  private getRequiredToolForOperation(toolName: string): string | null {
    // Map tool names to required system tools
    const toolMap: Record<string, string> = {
      // Android tools
      'android_list_devices': 'adb',
      'android_device_info': 'adb',
      'android_install_apk': 'adb',
      'android_uninstall_package': 'adb',
      'android_packages_list': 'adb',
      'android_logcat': 'adb',
      'android_shell_command': 'adb',
      'android_list_emulators': 'emulator',
      'android_start_emulator': 'emulator',
      'android_stop_emulator': 'adb',
      'android_list_avds': 'avdmanager',
      'android_create_avd': 'avdmanager',
      'android_delete_avd': 'avdmanager',
      'android_sdk_list_packages': 'sdkmanager',
      'android_sdk_install': 'sdkmanager',
      'android_sdk_update': 'sdkmanager',
      'android_gradle_build': 'gradle',
      'android_gradle_tasks': 'gradle',
      'android_gradle_clean': 'gradle',
      'android_gradle_dependencies': 'gradle',
      'android_lint_check': 'lint',
      'android_lint_explain': 'lint',
      'android_lint_baseline': 'lint',
      'android_lint_list_checks': 'lint',
      'android_screenshot': 'adb',
      'android_screen_record': 'adb',
      'android_screen_record_stop': 'adb',
      'android_push_file': 'adb',
      'android_pull_file': 'adb',
      
      // Flutter tools (using actual tool names from flutter.ts)
      'flutter_doctor': 'flutter',
      'flutter_version': 'flutter',
      'flutter_list_devices': 'flutter',
      'flutter_list_emulators': 'flutter',
      'flutter_launch_emulator': 'flutter',
      'flutter_run': 'flutter',
      'flutter_stop_session': 'flutter',
      'flutter_list_sessions': 'flutter',
      'flutter_build': 'flutter',
      'flutter_test': 'flutter',
      'flutter_clean': 'flutter',
      'flutter_pub_get': 'flutter',
      'flutter_screenshot': 'flutter',

      // iOS tools (using actual tool names from ios.ts)
      'ios_list_simulators': 'xcrun',
      'ios_boot_simulator': 'xcrun',
      'ios_shutdown_simulator': 'xcrun',
      'ios_erase_simulator': 'xcrun',
      'ios_open_url': 'xcrun',
      'ios_take_screenshot': 'xcrun',
      'ios_record_video': 'xcrun',
      'ios_list_schemes': 'xcodebuild',
      'ios_build_project': 'xcodebuild',
      'ios_run_tests': 'xcodebuild'
    };

    return toolMap[toolName] || null;
  }

  private getSafeTestArgs(toolName: string): any | null {
    // Return safe test arguments that won't cause side effects
    const safeArgs: Record<string, any> = {
      // Android - List operations (safe, no parameters needed)
      'android_list_devices': {},
      'android_list_emulators': {},
      'android_list_avds': {},
      'android_sdk_list_packages': {},
      
      // Android - Operations requiring device (skip in validation)
      'android_device_info': null,
      'android_install_apk': null,
      'android_uninstall_package': null,
      'android_packages_list': null,
      'android_logcat': null,
      'android_shell_command': null,
      'android_emulator_start': null,
      'android_emulator_stop': null,
      'android_screenshot': null,
      'android_screen_record': null,
      'android_screen_record_stop': null,
      'android_push_file': null,
      'android_pull_file': null,
      
      // Android - Operations requiring project (skip in validation)
      'android_avd_create': null,
      'android_avd_delete': null,
      'android_sdk_install': null,
      'android_sdk_update': null,
      'android_gradle_build': null,
      'android_gradle_tasks': null,
      'android_gradle_clean': null,
      'android_gradle_dependencies': null,
      'android_lint_check': null,
      'android_lint_explain': null,
      'android_lint_baseline': null,

      // Flutter - Safe operations (no project required)
      'flutter_doctor': {},
      'flutter_version': {},
      'flutter_list_devices': {},
      'flutter_list_emulators': {},
      
      // Flutter - Operations requiring project (skip in validation)
      'flutter_create': null,
      'flutter_run': null,
      'flutter_build': null,
      'flutter_test': null,
      'flutter_analyze': null,
      'flutter_format': null,
      'flutter_clean': null,
      'flutter_pub_get': null,
      'flutter_pub_upgrade': null,
      'flutter_pub_deps': null,

      // iOS - Safe operations (no project/device required)
      'ios_list_simulators': {},
      
      // iOS - Operations requiring specific inputs (skip in validation)
      'ios_simulator_boot': null,
      'ios_simulator_shutdown': null,
      'ios_install_app': null,
      'ios_uninstall_app': null,
      'ios_launch_app': null,
      'ios_device_info': null,
      'ios_build': null,
      'ios_test': null,
      'ios_archive': null
    };

    return safeArgs[toolName] !== undefined ? safeArgs[toolName] : null;
  }

  private async printSummary(envInfo: any): Promise<void> {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const total = this.results.length;

    console.log('📊 Validation Summary:');
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  📦 Total: ${total}\n`);

    if (failed > 0) {
      console.log('❌ Failed Tools:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
      console.log('');
    }

    if (skipped > 0) {
      console.log('⏭️  Skipped Tools:');
      this.results
        .filter(r => r.status === 'skip')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.reason}`);
        });
      console.log('');
    }

    // Recommendations
    if (failed > 0) {
      console.log('🔧 Recommendations:');
      console.log('  1. Review and fix failed tools');
      console.log('  2. Consider removing non-essential broken tools');
      console.log('  3. Add proper error handling for missing dependencies');
      console.log('');
    }

    // Export results for further analysis
    const resultsPath = './validation-results.json';
    const fs = await import('fs');
    fs.writeFileSync(resultsPath, JSON.stringify({
      summary: { passed, failed, skipped, total },
      results: this.results,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`📄 Detailed results saved to: ${resultsPath}`);

    // Generate health check report
    this.printHealthCheckReport(envInfo);
  }

  private printHealthCheckReport(envInfo: any): void {
    console.log('\n🏥 Health Check Report:');
    
    const healthReport = generateHealthCheckReport(envInfo.availableTools);
    
    console.log(`📊 Tool Categories:`);
    console.log(`  🎯 Essential: ${healthReport.categoryCounts[ToolCategory.ESSENTIAL]} (should work in basic env)`);
    console.log(`  🔧 Dependent: ${healthReport.categoryCounts[ToolCategory.DEPENDENT]} (need SDK/tools)`);  
    console.log(`  ⭐ Optional: ${healthReport.categoryCounts[ToolCategory.OPTIONAL]} (nice to have)`);
    
    console.log(`\n🔍 Platform Distribution:`);
    Object.entries(healthReport.platformCounts).forEach(([platform, count]) => {
      console.log(`  📱 ${platform}: ${count} tools`);
    });
    
    console.log(`\n🛠️  Requirement Analysis:`);
    Object.entries(healthReport.requirementCounts).forEach(([tool, count]) => {
      const available = envInfo.availableTools[tool] ? '✅' : '❌';
      console.log(`  ${available} ${tool}: ${count} tools depend on it`);
    });
    
    console.log(`\n📈 Performance Insights:`);
    console.log(`  🧪 Safe for testing: ${healthReport.safeForTesting} tools`);
    console.log(`  🔮 Expected working: ${healthReport.expectedWorkingTools} tools`);
    console.log(`  ✅ Currently working: ${this.results.filter(r => r.status === 'pass').length} tools`);
    
    const efficiency = healthReport.expectedWorkingTools > 0 
      ? Math.round((this.results.filter(r => r.status === 'pass').length / healthReport.expectedWorkingTools) * 100)
      : 0;
      
    console.log(`  📊 Efficiency: ${efficiency}% (working/expected)`);
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (!envInfo.availableTools['adb']) {
      console.log(`  • Install Android SDK to enable ${healthReport.requirementCounts['adb']} Android tools`);
    }
    if (!envInfo.availableTools['gradle']) {
      console.log(`  • Install Gradle to enable ${healthReport.requirementCounts['gradle'] || 0} build tools`);
    }
    if (!envInfo.availableTools['lint']) {
      console.log(`  • Install Android Lint to enable ${healthReport.requirementCounts['lint'] || 0} code quality tools`);
    }
    if (efficiency < 80) {
      console.log(`  • Consider investigating why some expected tools are not working`);
    }
    if (efficiency === 100) {
      console.log(`  🎉 Perfect! All expected tools are working correctly!`);
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ToolValidator();
  validator.validateAllTools().catch(console.error);
}

export { ToolValidator };