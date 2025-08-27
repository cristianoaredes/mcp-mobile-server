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
| Device Management | 15-120s | 300s |
| Development Workflow | 60-600s | 1200s |
| Utilities | 20-60s | 120s |

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