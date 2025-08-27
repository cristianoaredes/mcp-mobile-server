/**
 * Tool categorization system for MCP Mobile Server
 * Helps manage tool requirements and dependencies
 */

export enum ToolCategory {
  ESSENTIAL = 'essential',      // Must work in basic environment
  DEPENDENT = 'dependent',      // Requires specific tools/SDK setup
  OPTIONAL = 'optional',        // Nice to have, can fail gracefully
}

export enum RequiredTool {
  ADB = 'adb',
  NATIVE_RUN = 'native-run',
  FLUTTER = 'flutter', 
  GRADLE = 'gradle',
  LINT = 'lint',
  SDKMANAGER = 'sdkmanager',
  AVDMANAGER = 'avdmanager',
  EMULATOR = 'emulator',
  XCRUN = 'xcrun',
  XCODEBUILD = 'xcodebuild',
}

export interface ToolInfo {
  name: string;
  category: ToolCategory;
  platform: 'android' | 'ios' | 'flutter' | 'cross-platform';
  requiredTools: RequiredTool[];
  description: string;
  safeForTesting: boolean;
  performance: {
    expectedDuration: number; // in ms
    timeout: number;
  };
}

export const TOOL_REGISTRY: Record<string, ToolInfo> = {
  // ===== CORE TOOLS =====
  'health_check': {
    name: 'health_check',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [],
    description: 'Check server health and tool availability',
    safeForTesting: true,
    performance: { expectedDuration: 1000, timeout: 10000 }
  },

  'flutter_doctor': {
    name: 'flutter_doctor',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Diagnose Flutter environment issues',
    safeForTesting: true,
    performance: { expectedDuration: 8000, timeout: 30000 }
  },

  'flutter_version': {
    name: 'flutter_version',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Get Flutter SDK version information',
    safeForTesting: true,
    performance: { expectedDuration: 200, timeout: 10000 }
  },

  'flutter_list_devices': {
    name: 'flutter_list_devices',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'List connected devices for Flutter development',
    safeForTesting: true,
    performance: { expectedDuration: 6000, timeout: 15000 }
  },

  'android_list_devices': {
    name: 'android_list_devices',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'List connected Android devices and emulators',
    safeForTesting: true,
    performance: { expectedDuration: 500, timeout: 10000 }
  },

  // ===== DEVICE MANAGEMENT =====
  'native_run_list_devices': {
    name: 'native_run_list_devices',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [RequiredTool.NATIVE_RUN],
    description: 'List devices using native-run (Android & iOS)',
    safeForTesting: true,
    performance: { expectedDuration: 2000, timeout: 15000 }
  },

  'native_run_install_app': {
    name: 'native_run_install_app',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [RequiredTool.NATIVE_RUN],
    description: 'Install app using native-run (APK/iOS)',
    safeForTesting: false,
    performance: { expectedDuration: 20000, timeout: 120000 }
  },

  'ios_list_simulators': {
    name: 'ios_list_simulators',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'List available iOS simulators',
    safeForTesting: true,
    performance: { expectedDuration: 150, timeout: 10000 }
  },

  'android_list_emulators': {
    name: 'android_list_emulators',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.EMULATOR],
    description: 'List available Android emulators',
    safeForTesting: true,
    performance: { expectedDuration: 1000, timeout: 15000 }
  },

  // ===== EMULATOR MANAGEMENT (Added back) =====
  'android_create_avd': {
    name: 'android_create_avd',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.AVDMANAGER],
    description: 'Create new Android Virtual Device',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 60000 }
  },

  'android_start_emulator': {
    name: 'android_start_emulator',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.EMULATOR],
    description: 'Start Android emulator',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 180000 }
  },

  'android_stop_emulator': {
    name: 'android_stop_emulator',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Stop running Android emulator',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 30000 }
  },

  'ios_shutdown_simulator': {
    name: 'ios_shutdown_simulator',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'Shutdown iOS simulator',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 30000 }
  },

  'flutter_launch_emulator': {
    name: 'flutter_launch_emulator',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Launch Flutter emulator',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 180000 }
  },

  // ===== DEVELOPMENT WORKFLOW =====
  'flutter_run': {
    name: 'flutter_run',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run Flutter app on connected device with hot reload',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 300000 }
  },

  'flutter_build': {
    name: 'flutter_build',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Build Flutter app for release',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'flutter_test': {
    name: 'flutter_test',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run Flutter tests',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'flutter_clean': {
    name: 'flutter_clean',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Clean Flutter project build artifacts',
    safeForTesting: false,
    performance: { expectedDuration: 10000, timeout: 60000 }
  },

  'flutter_pub_get': {
    name: 'flutter_pub_get',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Install Flutter project dependencies',
    safeForTesting: false,
    performance: { expectedDuration: 15000, timeout: 120000 }
  },

  'android_install_apk': {
    name: 'android_install_apk',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Install APK on Android device or emulator',
    safeForTesting: false,
    performance: { expectedDuration: 15000, timeout: 120000 }
  },

  // ===== UTILITY TOOLS =====
  'android_logcat': {
    name: 'android_logcat',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Capture Android logcat output for debugging',
    safeForTesting: false,
    performance: { expectedDuration: 0, timeout: 60000 } // Variable duration
  },

  'android_screenshot': {
    name: 'android_screenshot',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Capture screenshot from Android device',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 30000 }
  },

  'ios_boot_simulator': {
    name: 'ios_boot_simulator',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'Boot iOS simulator',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'ios_take_screenshot': {
    name: 'ios_take_screenshot',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'Take screenshot of iOS simulator',
    safeForTesting: false,
    performance: { expectedDuration: 3000, timeout: 20000 }
  },

  // ===== SUPER TOOLS - COMBINED WORKFLOWS =====
  'flutter_dev_session': {
    name: 'flutter_dev_session',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Complete Flutter dev setup: check env, list devices, select best device, run with hot reload',
    safeForTesting: false,
    performance: { expectedDuration: 90000, timeout: 300000 }
  },

  'flutter_test_suite': {
    name: 'flutter_test_suite',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run complete test suite: unit tests, widget tests, integration tests with coverage report',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'flutter_release_build': {
    name: 'flutter_release_build',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER, RequiredTool.GRADLE, RequiredTool.XCODEBUILD],
    description: 'Build release versions for all platforms: APK, AAB, IPA with signing',
    safeForTesting: false,
    performance: { expectedDuration: 300000, timeout: 1200000 }
  },

  'mobile_device_manager': {
    name: 'mobile_device_manager',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Smart device management: list all, recommend best, auto-start if needed',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 180000 }
  },

  'flutter_performance_profile': {
    name: 'flutter_performance_profile',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run app in profile mode with DevTools: CPU, memory, network, timeline analysis',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'flutter_deploy_pipeline': {
    name: 'flutter_deploy_pipeline',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Complete deployment: clean, test, build, generate changelog, prepare for store submission',
    safeForTesting: false,
    performance: { expectedDuration: 600000, timeout: 1800000 }
  },

  'flutter_fix_common_issues': {
    name: 'flutter_fix_common_issues',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Auto-fix common issues: clean, pub get, pod install, gradle sync, invalidate caches',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 300000 }
  },

  'android_full_debug': {
    name: 'android_full_debug',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Complete Android debugging: logcat, screenshot, system info, app permissions',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'ios_simulator_manager': {
    name: 'ios_simulator_manager',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'Smart iOS simulator management: list, recommend, boot, configure, clean state',
    safeForTesting: false,
    performance: { expectedDuration: 45000, timeout: 180000 }
  },

  'flutter_inspector_session': {
    name: 'flutter_inspector_session',
    category: ToolCategory.ESSENTIAL,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Launch app with Flutter Inspector: widget tree, render tree, performance overlay',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 300000 }
  }
};

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): ToolInfo[] {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.category === category);
}

/**
 * Get tools by platform
 */
export function getToolsByPlatform(platform: string): ToolInfo[] {
  return Object.values(TOOL_REGISTRY).filter(tool => 
    tool.platform === platform || tool.platform === 'cross-platform'
  );
}

/**
 * Get safe tools for testing
 */
export function getSafeTestingTools(): ToolInfo[] {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.safeForTesting);
}

/**
 * Get tools that require specific system tools
 */
export function getToolsByRequirement(requiredTool: RequiredTool): ToolInfo[] {
  return Object.values(TOOL_REGISTRY).filter(tool => 
    tool.requiredTools.includes(requiredTool)
  );
}

/**
 * Generate health check report
 */
export interface HealthCheckReport {
  totalTools: number;
  categoryCounts: Record<ToolCategory, number>;
  platformCounts: Record<string, number>;
  requirementCounts: Partial<Record<RequiredTool, number>>;
  safeForTesting: number;
  expectedWorkingTools: number; // Based on available system tools
}

export function generateHealthCheckReport(availableTools: Record<string, boolean>): HealthCheckReport {
  const allTools = Object.values(TOOL_REGISTRY);
  
  const categoryCounts = {
    [ToolCategory.ESSENTIAL]: 0,
    [ToolCategory.DEPENDENT]: 0,
    [ToolCategory.OPTIONAL]: 0,
  };
  
  const platformCounts: Record<string, number> = {};
  const requirementCounts: Partial<Record<RequiredTool, number>> = {};
  
  let safeForTesting = 0;
  let expectedWorkingTools = 0;
  
  allTools.forEach(tool => {
    // Count by category
    categoryCounts[tool.category]++;
    
    // Count by platform
    platformCounts[tool.platform] = (platformCounts[tool.platform] || 0) + 1;
    
    // Count by requirements
    tool.requiredTools.forEach(req => {
      requirementCounts[req] = (requirementCounts[req] || 0) + 1;
    });
    
    // Count safe for testing
    if (tool.safeForTesting) {
      safeForTesting++;
    }
    
    // Check if tool should work with available system tools
    const hasAllRequiredTools = tool.requiredTools.every(req => availableTools[req]);
    if (hasAllRequiredTools) {
      expectedWorkingTools++;
    }
  });
  
  return {
    totalTools: allTools.length,
    categoryCounts,
    platformCounts,
    requirementCounts,
    safeForTesting,
    expectedWorkingTools,
  };
}