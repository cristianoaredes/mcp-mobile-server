# 📖 API Reference

Technical API documentation for MCP Mobile Server tools.

---

## 🔄 MCP Protocol Integration

### **Server Configuration**

```json
{
  "mcpServers": {
    "mobile-dev": {
      "command": "npx",
      "args": ["@cristianoaredes/mcp-mobile-server"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### **Capabilities**

```json
{
  "tools": true,
  "resources": false,
  "prompts": false
}
```

---

## 🛠️ Tool API Reference

### **Request Format**

All tools use JSON parameters with this structure:

```typescript
interface ToolRequest {
  name: string;           // Tool name
  arguments: object;      // Tool-specific parameters
}
```

### **Response Format**

```typescript
interface ToolResponse {
  success: boolean;
  data?: any;             // Tool output
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    duration: number;     // Execution time in ms
    tool: string;         // Tool name
    platform: string;    // Platform used
  };
}
```

---

## 🔧 Core Tools API

### **health_check**

Check server and tool availability.

**Parameters:**
```typescript
interface HealthCheckParams {
  verbose?: boolean;      // Default: false
}
```

**Response:**
```typescript
interface HealthCheckResponse {
  server: string;
  status: 'healthy' | 'degraded';
  toolHealth: {
    totalAvailable: number;
    expectedWorking: number;
    categoryCounts: Record<string, number>;
  };
  systemTools?: Record<string, boolean>;  // If verbose
  recommendations?: string[];             // If verbose
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "server": "mcp-mobile-server",
    "status": "healthy",
    "toolHealth": {
      "totalAvailable": 19,
      "expectedWorking": 15
    }
  }
}
```

---

### **flutter_doctor**

Diagnose Flutter environment.

**Parameters:** None

**Response:**
```typescript
interface FlutterDoctorResponse {
  version: string;
  checks: {
    name: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }[];
  overall: 'success' | 'warning' | 'error';
}
```

---

### **flutter_list_devices**

List available devices for Flutter development.

**Parameters:** None

**Response:**
```typescript
interface FlutterDevicesResponse {
  devices: {
    id: string;
    name: string;
    platform: 'android' | 'ios' | 'web' | 'desktop';
    type: 'physical' | 'emulator' | 'simulator';
    status: 'available' | 'busy' | 'offline';
  }[];
}
```

---

### **android_list_devices**

List connected Android devices and emulators.

**Parameters:** None

**Response:**
```typescript
interface AndroidDevicesResponse {
  devices: {
    id: string;              // Device serial (e.g., emulator-5554)
    state: string;           // device, offline, unauthorized
    product: string;
    model: string;
    device: string;
  }[];
}
```

**Error Codes:**
- `TOOL_NOT_FOUND` - ADB not installed
- `EXECUTION_FAILED` - ADB command failed

**Timeout:** 10s

---

## 📱 Device Management API

### **native_run_list_devices**

List devices using native-run.

**Parameters:**
```typescript
interface NativeRunListParams {
  platform?: 'android' | 'ios';  // Default: both
}
```

**Response:**
```typescript
interface NativeRunDevicesResponse {
  devices: {
    id: string;
    name: string;
    platform: 'android' | 'ios';
    type: 'device' | 'emulator' | 'simulator';
    api?: string;              // Android API level
    version?: string;          // iOS version
  }[];
}
```

---

### **native_run_install_app**

Install app using native-run.

**Parameters:**
```typescript
interface NativeRunInstallParams {
  platform: 'android' | 'ios';
  appPath: string;           // Path to .apk or .app
  deviceId?: string;         // Optional device target
}
```

**Response:**
```typescript
interface NativeRunInstallResponse {
  installed: boolean;
  deviceId: string;
  appPath: string;
  packageId?: string;        // Android package name
}
```

---

### **ios_list_simulators**

List iOS simulators.

**Parameters:** None

**Response:**
```typescript
interface IOSSimulatorsResponse {
  simulators: {
    udid: string;
    name: string;
    version: string;
    state: 'Shutdown' | 'Booted' | 'Booting';
    deviceType: string;
  }[];
}
```

---

### **android_list_emulators**

List Android emulators.

**Parameters:** None

**Response:**
```typescript
interface AndroidEmulatorsResponse {
  emulators: {
    name: string;
    target: string;
    api: string;
    tag: string;
    device: string;
  }[];
}
```

---

### **android_create_avd**

Create Android Virtual Device.

**Parameters:**
```typescript
interface CreateAVDParams {
  name: string;              // AVD name (e.g., "Pixel_5_API_33")
  device: string;            // Device type (e.g., "pixel_5")
  systemImage: string;       // System image package
  sdcard?: string;           // SD card size (e.g., "512M")
  force?: boolean;           // Overwrite existing AVD
}
```

**Response:**
```typescript
interface CreateAVDResponse {
  created: boolean;
  name: string;
  device: string;
  systemImage: string;
}
```

**Error Codes:**
- `TOOL_NOT_FOUND` - avdmanager not installed
- `INVALID_PARAMETERS` - Invalid system image
- `EXECUTION_FAILED` - AVD creation failed

**Timeout:** 60s

---

### **android_start_emulator**

Start Android emulator with configuration options.

**Parameters:**
```typescript
interface StartEmulatorParams {
  avdName: string;           // AVD to start
  noWindow?: boolean;        // Headless mode (default: false)
  port?: number;             // Emulator port (5554-5682)
  gpu?: 'auto' | 'host' | 'swiftshader_indirect' | 'guest';
  wipeData?: boolean;        // Fresh start (default: false)
}
```

**Response:**
```typescript
interface StartEmulatorResponse {
  started: boolean;
  avdName: string;
  port?: number;
  pid: number;
}
```

**Error Codes:**
- `TOOL_NOT_FOUND` - Emulator not installed
- `DEVICE_NOT_FOUND` - AVD not found
- `EXECUTION_FAILED` - Emulator start failed

**Timeout:** 180s

---

### **android_stop_emulator**

Stop running Android emulator.

**Parameters:**
```typescript
interface StopEmulatorParams {
  deviceId: string;          // Emulator serial (e.g., "emulator-5554")
}
```

**Response:**
```typescript
interface StopEmulatorResponse {
  stopped: boolean;
  deviceId: string;
}
```

**Timeout:** 30s

---

### **ios_shutdown_simulator**

Shutdown iOS simulator.

**Parameters:**
```typescript
interface ShutdownSimulatorParams {
  udid?: string;             // Specific simulator (omit for all)
}
```

**Response:**
```typescript
interface ShutdownSimulatorResponse {
  shutdown: boolean;
  udid?: string;
  count?: number;            // If shutting down all
}
```

**Timeout:** 30s

---

### **flutter_launch_emulator**

Launch emulator using Flutter.

**Parameters:**
```typescript
interface FlutterLaunchEmulatorParams {
  emulatorId: string;        // Emulator ID from flutter emulators
  coldBoot?: boolean;        // Cold boot (default: false)
}
```

**Response:**
```typescript
interface FlutterLaunchEmulatorResponse {
  launched: boolean;
  emulatorId: string;
  deviceId?: string;
}
```

**Timeout:** 180s

---

## ⚡ Development Workflow API

### **flutter_run**

Start Flutter development with hot reload.

**Parameters:**
```typescript
interface FlutterRunParams {
  cwd: string;               // Project directory
  deviceId?: string;         // Target device
  target?: string;           // Entry point file
  flavor?: string;           // Build flavor
  buildMode?: 'debug' | 'profile' | 'release';
}
```

**Response:**
```typescript
interface FlutterRunResponse {
  started: boolean;
  deviceId: string;
  target: string;
  buildMode: string;
  hotReloadEnabled: boolean;
}
```

---

### **flutter_build**

Build Flutter application.

**Parameters:**
```typescript
interface FlutterBuildParams {
  cwd: string;               // Project directory
  target: 'apk' | 'ios' | 'web' | 'windows' | 'macos' | 'linux';
  buildMode?: 'debug' | 'profile' | 'release';
  flavor?: string;           // Build flavor
  splitPerAbi?: boolean;     // Android APK split
}
```

**Response:**
```typescript
interface FlutterBuildResponse {
  success: boolean;
  target: string;
  buildMode: string;
  outputPath?: string;
  artifacts?: string[];
  buildTime: number;
}
```

---

### **flutter_test**

Run Flutter tests.

**Parameters:**
```typescript
interface FlutterTestParams {
  cwd: string;               // Project directory
  testPath?: string;         // Specific test file
  coverage?: boolean;        // Generate coverage
  reporter?: 'compact' | 'expanded' | 'json';
}
```

**Response:**
```typescript
interface FlutterTestResponse {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  success: boolean;
  coveragePercent?: number;
}
```

---

### **flutter_clean**

Clean Flutter project build artifacts.

**Parameters:**
```typescript
interface FlutterCleanParams {
  cwd: string;               // Project directory
}
```

**Response:**
```typescript
interface FlutterCleanResponse {
  cleaned: boolean;
  removedDirectories: string[];
  freedSpace?: number;       // Bytes freed
}
```

**Timeout:** 60s

---

### **flutter_pub_get**

Install Flutter project dependencies.

**Parameters:**
```typescript
interface FlutterPubGetParams {
  cwd: string;               // Project directory
  upgrade?: boolean;         // Upgrade to latest (default: false)
  offline?: boolean;         // Use cached packages only
}
```

**Response:**
```typescript
interface FlutterPubGetResponse {
  success: boolean;
  packagesInstalled: number;
  packagesUpgraded?: number;
}
```

**Timeout:** 120s

---

### **android_install_apk**

Install APK on Android device.

**Parameters:**
```typescript
interface AndroidInstallAPKParams {
  apkPath: string;           // Path to APK file
  deviceId?: string;         // Target device (default: first available)
  force?: boolean;           // Reinstall (default: false)
  grantPermissions?: boolean;// Auto-grant permissions
}
```

**Response:**
```typescript
interface AndroidInstallAPKResponse {
  installed: boolean;
  deviceId: string;
  apkPath: string;
  packageName?: string;
}
```

**Error Codes:**
- `PATH_NOT_FOUND` - APK file not found
- `DEVICE_NOT_FOUND` - No devices available
- `EXECUTION_FAILED` - Installation failed

**Timeout:** 120s

---

## 🛠️ Utility Tools API

### **android_logcat**

Capture Android logs.

**Parameters:**
```typescript
interface AndroidLogcatParams {
  deviceId?: string;         // Default: first available
  filter?: string;           // Log tag filter
  priority?: 'V' | 'D' | 'I' | 'W' | 'E' | 'F';
  duration?: number;         // Capture duration in ms
}
```

**Response:**
```typescript
interface AndroidLogcatResponse {
  logs: string[];
  deviceId: string;
  filter?: string;
  priority: string;
  duration: number;
}
```

---

### **android_screenshot**

Capture Android screenshot.

**Parameters:**
```typescript
interface AndroidScreenshotParams {
  deviceId?: string;         // Default: first available
  outputPath?: string;       // Default: ./screenshots/
  filename?: string;         // Default: auto-generated
}
```

**Response:**
```typescript
interface AndroidScreenshotResponse {
  captured: boolean;
  deviceId: string;
  filePath: string;
  fileSize: number;
}
```

---

### **ios_boot_simulator**

Boot iOS simulator.

**Parameters:**
```typescript
interface IOSBootParams {
  udid: string;              // Simulator UDID
}
```

**Response:**
```typescript
interface IOSBootResponse {
  booted: boolean;
  udid: string;
  name: string;
  state: string;
  bootTime?: number;
}
```

---

### **ios_take_screenshot**

Take iOS simulator screenshot.

**Parameters:**
```typescript
interface IOSScreenshotParams {
  udid: string;              // Simulator UDID
  outputPath?: string;       // Default: ./screenshots/
  filename?: string;         // Default: auto-generated
}
```

**Response:**
```typescript
interface IOSScreenshotResponse {
  captured: boolean;
  udid: string;
  filePath: string;
  fileSize: number;
}
```

---

## 🚀 Super-Tools API

### **flutter_dev_session**

Complete Flutter development session workflow.

**Parameters:**
```typescript
interface FlutterDevSessionParams {
  cwd: string;               // Project directory
  target?: string;           // Entry point (default: lib/main.dart)
  preferPhysical?: boolean;  // Prefer physical device (default: true)
}
```

**Response:**
```typescript
interface FlutterDevSessionResponse {
  success: boolean;
  selectedDevice: {
    id: string;
    name: string;
    type: 'physical' | 'emulator';
  };
  sessionId?: string;
  steps: Array<{
    step: string;
    success: boolean;
    data?: any;
  }>;
}
```

**Workflow:**
1. Run `flutter_doctor`
2. List available devices
3. Auto-select best device
4. Start emulator if needed
5. Run app with hot reload

**Timeout:** 300s

---

### **flutter_test_suite**

Execute complete test suite with coverage.

**Parameters:**
```typescript
interface FlutterTestSuiteParams {
  cwd: string;               // Project directory
  coverage?: boolean;        // Generate coverage (default: true)
  integrationTests?: boolean;// Run integration tests (default: false)
}
```

**Response:**
```typescript
interface FlutterTestSuiteResponse {
  success: boolean;
  unit: {
    passed: number;
    failed: number;
    total: number;
  };
  widget: {
    passed: number;
    failed: number;
    total: number;
  };
  integration?: {
    passed: number;
    failed: number;
    total: number;
  };
  coverage?: {
    generated: boolean;
    percentage: number;
    path: string;
  };
}
```

**Timeout:** 600s

---

### **flutter_release_build**

Build production releases for all platforms.

**Parameters:**
```typescript
interface FlutterReleaseBuildParams {
  cwd: string;               // Project directory
  platforms: Array<'android' | 'ios' | 'web'>;
  buildNumber?: string;
  buildName?: string;
  obfuscate?: boolean;       // Code obfuscation (default: false)
  splitDebugInfo?: string;   // Path for debug symbols
}
```

**Response:**
```typescript
interface FlutterReleaseBuildResponse {
  success: boolean;
  builds: Array<{
    platform: string;
    success: boolean;
    artifacts: string[];
    buildTime: number;
  }>;
}
```

**Timeout:** 1200s (20 minutes)

---

### **mobile_device_manager**

Smart device management across platforms.

**Parameters:**
```typescript
interface MobileDeviceManagerParams {
  action: 'list' | 'recommend' | 'autostart';
  platform?: 'all' | 'android' | 'ios';  // Default: 'all'
  includeEmulators?: boolean;            // Default: true
}
```

**Response:**
```typescript
interface MobileDeviceManagerResponse {
  action: string;
  devices: Array<{
    id: string;
    name: string;
    platform: string;
    type: string;
    available: boolean;
    recommended?: boolean;
  }>;
  recommendation?: {
    deviceId: string;
    reason: string;
  };
  autostartResult?: {
    started: boolean;
    deviceId: string;
  };
}
```

**Timeout:** 180s

---

### **flutter_performance_profile**

Run app in profile mode with DevTools.

**Parameters:**
```typescript
interface FlutterPerformanceProfileParams {
  cwd: string;               // Project directory
  deviceId?: string;         // Target device
  enableTimeline?: boolean;  // Timeline profiling (default: true)
  enableMemoryProfiling?: boolean;  // Memory analysis (default: true)
}
```

**Response:**
```typescript
interface FlutterPerformanceProfileResponse {
  success: boolean;
  deviceId: string;
  devToolsUrl: string;
  profileData?: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
  };
}
```

**Timeout:** 600s

---

### **flutter_deploy_pipeline**

Complete deployment pipeline from clean to store prep.

**Parameters:**
```typescript
interface FlutterDeployPipelineParams {
  cwd: string;               // Project directory
  platforms: Array<'android' | 'ios'>;
  generateChangelog?: boolean;      // Default: true
  runTests?: boolean;               // Default: true
  createReleaseNotes?: boolean;     // Default: true
}
```

**Response:**
```typescript
interface FlutterDeployPipelineResponse {
  success: boolean;
  steps: Array<{
    name: string;
    success: boolean;
    duration: number;
  }>;
  artifacts: {
    builds: string[];
    changelog?: string;
    releaseNotes?: string;
  };
}
```

**Timeout:** 1800s (30 minutes)

---

### **flutter_fix_common_issues**

Auto-detect and fix common Flutter issues.

**Parameters:**
```typescript
interface FlutterFixCommonIssuesParams {
  cwd: string;               // Project directory
  issues?: Array<'cache' | 'dependencies' | 'pods' | 'gradle'>;
}
```

**Response:**
```typescript
interface FlutterFixCommonIssuesResponse {
  success: boolean;
  issuesFixed: Array<{
    issue: string;
    fixed: boolean;
    actions: string[];
  }>;
}
```

**Timeout:** 300s

---

### **android_full_debug**

Complete Android debugging toolkit.

**Parameters:**
```typescript
interface AndroidFullDebugParams {
  deviceId?: string;         // Default: first available
  captureLogs?: boolean;     // Default: true
  captureScreenshot?: boolean;  // Default: true
  dumpSystemInfo?: boolean;  // Default: true
  duration?: number;         // Log capture duration (ms)
}
```

**Response:**
```typescript
interface AndroidFullDebugResponse {
  success: boolean;
  deviceId: string;
  logs?: string[];
  screenshot?: string;       // File path
  systemInfo?: {
    androidVersion: string;
    model: string;
    manufacturer: string;
    screenResolution: string;
    batteryLevel: number;
  };
}
```

**Timeout:** 120s

---

### **ios_simulator_manager**

Smart iOS simulator management.

**Parameters:**
```typescript
interface IOSSimulatorManagerParams {
  action: 'list' | 'recommend' | 'boot' | 'clean';
  deviceType?: string;       // e.g., "iPhone 15 Pro"
  iosVersion?: string;       // e.g., "17.0"
}
```

**Response:**
```typescript
interface IOSSimulatorManagerResponse {
  action: string;
  simulators?: Array<{
    udid: string;
    name: string;
    version: string;
    state: string;
    recommended?: boolean;
  }>;
  recommendation?: {
    udid: string;
    name: string;
    reason: string;
  };
  actionResult?: {
    success: boolean;
    udid: string;
  };
}
```

**Timeout:** 180s

---

### **flutter_inspector_session**

Launch app with Flutter Inspector and DevTools.

**Parameters:**
```typescript
interface FlutterInspectorSessionParams {
  cwd: string;               // Project directory
  deviceId?: string;         // Target device
  enableInspector?: boolean; // Default: true
  enablePerformanceOverlay?: boolean;  // Default: true
}
```

**Response:**
```typescript
interface FlutterInspectorSessionResponse {
  success: boolean;
  deviceId: string;
  inspectorUrl: string;
  devToolsUrl: string;
}
```

**Timeout:** 300s

---

## ⚙️ Setup & Configuration API

### **flutter_setup_environment**

Automated Flutter SDK installation and configuration.

**Parameters:**
```typescript
interface FlutterSetupEnvironmentParams {
  action: 'check' | 'install' | 'configure' | 'full';
  installPath?: string;      // Custom install path
  updateShellConfig?: boolean;  // Update .bashrc/.zshrc (default: true)
}
```

**Response:**
```typescript
interface FlutterSetupEnvironmentResponse {
  action: string;
  installed: boolean;
  configured: boolean;
  flutterPath?: string;
  version?: string;
  steps: Array<{
    step: string;
    success: boolean;
    message: string;
  }>;
}
```

**Timeout:** 600s

---

### **android_sdk_setup**

Setup Android SDK and environment.

**Parameters:**
```typescript
interface AndroidSDKSetupParams {
  action: 'check' | 'install' | 'configure';
  components?: string[];     // SDK components to install
  acceptLicenses?: boolean;  // Auto-accept licenses (default: false)
}
```

**Response:**
```typescript
interface AndroidSDKSetupResponse {
  action: string;
  installed: boolean;
  configured: boolean;
  sdkPath?: string;
  components: Array<{
    name: string;
    installed: boolean;
    version?: string;
  }>;
}
```

**Timeout:** 600s

---

## 🚨 Error Codes

### **Common Error Codes**

| Code | Description |
|------|-------------|
| `TOOL_NOT_FOUND` | Required system tool not available |
| `DEVICE_NOT_FOUND` | Target device not connected |
| `INVALID_PARAMETERS` | Missing or invalid tool parameters |
| `EXECUTION_FAILED` | Tool execution failed |
| `TIMEOUT` | Tool execution exceeded timeout |
| `PERMISSION_DENIED` | Insufficient permissions |
| `PATH_NOT_FOUND` | Specified file/directory not found |

### **Error Response Format**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      tool?: string;
      command?: string;
      exitCode?: number;
      stderr?: string;
    };
  };
}
```

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "TOOL_NOT_FOUND",
    "message": "Flutter SDK not found in PATH",
    "details": {
      "tool": "flutter",
      "command": "flutter --version"
    }
  }
}
```

---

## ⚡ Performance Guidelines

### **Tool Timeouts**

| Tool Category | Default Timeout | Max Recommended |
|---------------|-----------------|-----------------|
| Core Tools | 10-30s | 60s |
| Device Management | 15-180s | 300s |
| Development Workflow | 60-600s | 1200s |
| Utilities | 20-60s | 120s |
| Super-Tools | 120-1800s | 3600s |
| Setup Tools | 300-600s | 900s |

### **Best Practices**

1. **Batch Operations**: Group related tool calls
2. **Device Selection**: Specify deviceId to avoid auto-selection overhead  
3. **Timeout Handling**: Implement proper timeout handling in clients
4. **Error Recovery**: Use fallback tools when primary tools fail

---

## 🔒 Security Considerations

### **Input Validation**

- All file paths are validated and sanitized
- Command injection prevention through parameter allowlisting
- No shell expansion or glob patterns allowed

### **Process Isolation**

- Each tool runs in isolated process
- No persistent state between tool calls
- Resource cleanup after each execution

### **File System Access**

- Limited to specified working directories
- No access to sensitive system directories
- Output files created with safe permissions

---

## 📊 Usage Examples

### **Basic Flutter Workflow**

```typescript
// 1. Check environment
const health = await callTool('health_check', { verbose: true });

// 2. List available devices  
const devices = await callTool('flutter_list_devices', {});

// 3. Run app on device
const run = await callTool('flutter_run', {
  cwd: '/path/to/project',
  deviceId: 'emulator-5554',
  buildMode: 'debug'
});

// 4. Build for release
const build = await callTool('flutter_build', {
  cwd: '/path/to/project', 
  target: 'apk',
  buildMode: 'release'
});
```

### **Native App Installation**

```typescript
// 1. List connected devices
const devices = await callTool('native_run_list_devices', {
  platform: 'android'
});

// 2. Install APK
const install = await callTool('native_run_install_app', {
  platform: 'android',
  appPath: './app-release.apk',
  deviceId: devices.data.devices[0].id
});
```

---

For more examples, see the [Examples](./examples/) directory.