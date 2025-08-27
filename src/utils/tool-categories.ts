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
  // ===== FLUTTER TOOLS (Working) =====
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

  'flutter_list_emulators': {
    name: 'flutter_list_emulators',
    category: ToolCategory.ESSENTIAL,
    platform: 'cross-platform',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'List available emulators for Flutter',
    safeForTesting: true,
    performance: { expectedDuration: 600, timeout: 10000 }
  },

  // ===== iOS TOOLS (Working) =====
  'ios_list_simulators': {
    name: 'ios_list_simulators',
    category: ToolCategory.ESSENTIAL,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'List iOS simulators',
    safeForTesting: true,
    performance: { expectedDuration: 150, timeout: 10000 }
  },

  // ===== FLUTTER TOOLS (Dependent) =====
  'flutter_create': {
    name: 'flutter_create',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Create new Flutter project',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'flutter_run': {
    name: 'flutter_run',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run Flutter app on connected device',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 300000 }
  },

  'flutter_build': {
    name: 'flutter_build',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Build Flutter app for release',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'flutter_test': {
    name: 'flutter_test',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Run Flutter tests',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'flutter_clean': {
    name: 'flutter_clean',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Clean Flutter project build artifacts',
    safeForTesting: false,
    performance: { expectedDuration: 10000, timeout: 60000 }
  },

  'flutter_pub_get': {
    name: 'flutter_pub_get',
    category: ToolCategory.DEPENDENT,
    platform: 'flutter',
    requiredTools: [RequiredTool.FLUTTER],
    description: 'Get Flutter project dependencies',
    safeForTesting: false,
    performance: { expectedDuration: 15000, timeout: 120000 }
  },

  // ===== ANDROID TOOLS (Dependent - Need SDK) =====
  'android_list_devices': {
    name: 'android_list_devices',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'List connected Android devices',
    safeForTesting: true,
    performance: { expectedDuration: 500, timeout: 10000 }
  },

  'android_sdk_list_packages': {
    name: 'android_sdk_list_packages',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.SDKMANAGER],
    description: 'List available Android SDK packages',
    safeForTesting: true,
    performance: { expectedDuration: 3000, timeout: 30000 }
  },

  'android_list_avds': {
    name: 'android_list_avds',
    category: ToolCategory.ESSENTIAL,
    platform: 'android',
    requiredTools: [RequiredTool.AVDMANAGER],
    description: 'List Android Virtual Devices',
    safeForTesting: true,
    performance: { expectedDuration: 2000, timeout: 15000 }
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

  'android_gradle_build': {
    name: 'android_gradle_build',
    category: ToolCategory.DEPENDENT,
    platform: 'android',
    requiredTools: [RequiredTool.GRADLE],
    description: 'Build Android project with Gradle',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'android_gradle_tasks': {
    name: 'android_gradle_tasks',
    category: ToolCategory.DEPENDENT,
    platform: 'android',
    requiredTools: [RequiredTool.GRADLE],
    description: 'List available Gradle tasks',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 30000 }
  },

  'android_gradle_clean': {
    name: 'android_gradle_clean',
    category: ToolCategory.DEPENDENT,
    platform: 'android',
    requiredTools: [RequiredTool.GRADLE],
    description: 'Clean Android project build artifacts',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'android_gradle_dependencies': {
    name: 'android_gradle_dependencies',
    category: ToolCategory.DEPENDENT,
    platform: 'android',
    requiredTools: [RequiredTool.GRADLE],
    description: 'Show Android project dependencies',
    safeForTesting: false,
    performance: { expectedDuration: 10000, timeout: 60000 }
  },

  'android_lint_check': {
    name: 'android_lint_check',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.LINT],
    description: 'Run Android Lint checks',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 180000 }
  },

  'android_lint_explain': {
    name: 'android_lint_explain',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.LINT],
    description: 'Explain Android Lint issue',
    safeForTesting: false,
    performance: { expectedDuration: 1000, timeout: 10000 }
  },

  'android_lint_baseline': {
    name: 'android_lint_baseline',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.LINT],
    description: 'Generate Android Lint baseline',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 180000 }
  },

  'android_lint_list_checks': {
    name: 'android_lint_list_checks',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.LINT],
    description: 'List available Android Lint checks',
    safeForTesting: true,
    performance: { expectedDuration: 2000, timeout: 15000 }
  },

  // ===== ANDROID TOOLS (Device Operations) =====
  'android_install_apk': {
    name: 'android_install_apk',
    category: ToolCategory.DEPENDENT,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Install APK on Android device',
    safeForTesting: false,
    performance: { expectedDuration: 15000, timeout: 120000 }
  },

  'android_screenshot': {
    name: 'android_screenshot',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Capture Android device screenshot',
    safeForTesting: false,
    performance: { expectedDuration: 5000, timeout: 30000 }
  },

  'android_screen_record': {
    name: 'android_screen_record',
    category: ToolCategory.OPTIONAL,
    platform: 'android',
    requiredTools: [RequiredTool.ADB],
    description: 'Record Android device screen',
    safeForTesting: false,
    performance: { expectedDuration: 0, timeout: 300000 } // Variable duration
  },

  // ===== iOS TOOLS (Dependent) =====
  'ios_boot_simulator': {
    name: 'ios_boot_simulator',
    category: ToolCategory.DEPENDENT,
    platform: 'ios',
    requiredTools: [RequiredTool.XCRUN],
    description: 'Boot iOS simulator',
    safeForTesting: false,
    performance: { expectedDuration: 30000, timeout: 120000 }
  },

  'ios_build_project': {
    name: 'ios_build_project',
    category: ToolCategory.DEPENDENT,
    platform: 'ios',
    requiredTools: [RequiredTool.XCODEBUILD],
    description: 'Build iOS project with Xcode',
    safeForTesting: false,
    performance: { expectedDuration: 120000, timeout: 600000 }
  },

  'ios_run_tests': {
    name: 'ios_run_tests',
    category: ToolCategory.DEPENDENT,
    platform: 'ios',
    requiredTools: [RequiredTool.XCODEBUILD],
    description: 'Run iOS unit tests',
    safeForTesting: false,
    performance: { expectedDuration: 60000, timeout: 300000 }
  },
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