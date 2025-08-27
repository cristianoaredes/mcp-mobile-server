# 🔧 Tools Reference

This document provides detailed information about all 19 essential tools available in the MCP Mobile Server.

---

## 🔧 Core Tools (5)

### `health_check`
**Platform:** Cross-platform  
**Dependencies:** None  
**Safe for Testing:** ✅ Yes  

Check server health and tool availability with optional detailed analysis.

```json
// Basic health check
{}

// Detailed analysis with recommendations
{
  "verbose": true
}
```

**Output:**
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

### `flutter_doctor`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ✅ Yes  

Diagnose Flutter environment issues and dependencies.

```json
{}
```

**Output:** Complete Flutter environment analysis including SDK, devices, and IDE setup.

---

### `flutter_version`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ✅ Yes  

Get Flutter SDK version information.

```json
{}
```

**Output:** Flutter version, Dart version, and framework details.

---

### `flutter_list_devices`
**Platform:** Cross-platform  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ✅ Yes  

List all connected devices and emulators available for Flutter development.

```json
{}
```

**Output:** Comprehensive list of Android devices, iOS simulators, and web browsers.

---

### `android_list_devices`
**Platform:** Android  
**Dependencies:** ADB  
**Safe for Testing:** ✅ Yes  

List connected Android devices and emulators with fallback to native-run.

```json
{}
```

**Output:** Android devices with serial numbers, status, and device information.

---

## 📱 Device Management (4)

### `native_run_list_devices`
**Platform:** Cross-platform  
**Dependencies:** native-run  
**Safe for Testing:** ✅ Yes  

List connected devices using native-run (works with both Android and iOS).

```json
{
  "platform": "android" // or "ios"
}
```

**Benefits:**
- Lightweight (~15MB vs 3GB Android SDK)
- Cross-platform support
- No full SDK required

---

### `native_run_install_app`
**Platform:** Cross-platform  
**Dependencies:** native-run  
**Safe for Testing:** ❌ No (modifies device)  

Install applications on devices using native-run.

```json
{
  "platform": "android",
  "appPath": "./app/build/outputs/apk/app-debug.apk",
  "deviceId": "emulator-5554"
}
```

**Supported formats:**
- Android: `.apk` files
- iOS: `.app` bundles

---

### `ios_list_simulators`
**Platform:** iOS  
**Dependencies:** Xcode Command Line Tools  
**Safe for Testing:** ✅ Yes  

List all available iOS simulators with their status.

```json
{}
```

**Output:** iOS simulator versions, device types, and availability status.

---

### `android_list_emulators`
**Platform:** Android  
**Dependencies:** Android Emulator  
**Safe for Testing:** ✅ Yes  

List available Android Virtual Devices (AVDs).

```json
{}
```

**Output:** AVD names, status, and configuration details.

---

## ⚡ Development Workflow (6)

### `flutter_run`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ❌ No (starts processes)  

Start Flutter development session with hot reload.

```json
{
  "cwd": "/path/to/flutter/project",
  "deviceId": "chrome",
  "target": "lib/main.dart",
  "flavor": "development",
  "buildMode": "debug"
}
```

**Features:**
- Hot reload support
- Multiple device targets
- Debug and release modes

---

### `flutter_build`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ❌ No (long running)  

Build Flutter applications for release.

```json
{
  "cwd": "/path/to/flutter/project",
  "target": "apk", // or "ios", "web", "windows", "macos", "linux"
  "buildMode": "release",
  "flavor": "production"
}
```

**Supported targets:**
- `apk` - Android APK
- `ios` - iOS app bundle  
- `web` - Web application
- `windows`, `macos`, `linux` - Desktop apps

---

### `flutter_test`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ❌ No (runs tests)  

Run Flutter tests with optional coverage.

```json
{
  "cwd": "/path/to/flutter/project",
  "coverage": true,
  "testPath": "test/widget_test.dart"
}
```

**Test types:**
- Unit tests
- Widget tests  
- Integration tests

---

### `flutter_clean`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ❌ No (deletes files)  

Clean Flutter project build artifacts and cache.

```json
{
  "cwd": "/path/to/flutter/project"
}
```

**Cleans:**
- `build/` directory
- `.dart_tool/` cache
- Platform-specific build files

---

### `flutter_pub_get`
**Platform:** Flutter  
**Dependencies:** Flutter SDK  
**Safe for Testing:** ❌ No (downloads packages)  

Install or update Flutter project dependencies.

```json
{
  "cwd": "/path/to/flutter/project",
  "upgrade": false
}
```

**Options:**
- `upgrade: false` - Install exact versions
- `upgrade: true` - Update to latest compatible

---

### `android_install_apk`
**Platform:** Android  
**Dependencies:** ADB  
**Safe for Testing:** ❌ No (modifies device)  

Install APK files on Android devices or emulators.

```json
{
  "apkPath": "/path/to/app.apk",
  "deviceId": "emulator-5554",
  "force": false
}
```

**Options:**
- `force: true` - Reinstall if already installed
- Automatic device selection if no deviceId provided

---

## 🛠️ Utility Tools (4)

### `android_logcat`
**Platform:** Android  
**Dependencies:** ADB  
**Safe for Testing:** ❌ No (continuous output)  

Capture Android device logs for debugging.

```json
{
  "deviceId": "emulator-5554",
  "filter": "MyApp",
  "priority": "V", // V, D, I, W, E, F
  "duration": 30000 // milliseconds
}
```

**Log priorities:**
- `V` - Verbose
- `D` - Debug
- `I` - Info  
- `W` - Warning
- `E` - Error
- `F` - Fatal

---

### `android_screenshot`
**Platform:** Android  
**Dependencies:** ADB  
**Safe for Testing:** ❌ No (creates files)  

Capture screenshots from Android devices.

```json
{
  "deviceId": "emulator-5554",
  "outputPath": "./screenshots/",
  "filename": "app-screenshot.png"
}
```

**Output formats:**
- PNG (default)
- JPEG (coming soon)

---

### `ios_boot_simulator`
**Platform:** iOS  
**Dependencies:** Xcode Command Line Tools  
**Safe for Testing:** ❌ No (starts processes)  

Boot iOS simulators for development and testing.

```json
{
  "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

**Features:**
- Automatic simulator selection
- Boot status monitoring
- Error handling for busy simulators

---

### `ios_take_screenshot`
**Platform:** iOS  
**Dependencies:** Xcode Command Line Tools  
**Safe for Testing:** ❌ No (creates files)  

Take screenshots of iOS simulators.

```json
{
  "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
  "outputPath": "./screenshots/",
  "filename": "ios-screenshot.png"
}
```

**Supported formats:**
- PNG (high quality)
- Retina resolution support

---

## 🔧 Tool Categories

### Essential Tools
All 19 tools are categorized as **Essential** for focused, reliable functionality:

- ✅ **Stable** - Well-tested and reliable
- ✅ **Useful** - Covers core mobile development needs
- ✅ **Safe** - Minimal risk of system issues
- ✅ **Fast** - Quick execution times
- ✅ **Cross-platform** - Works on macOS, Windows, Linux

### Removed Tool Categories
- **Dependent** - Complex tools requiring extensive setup
- **Optional** - Nice-to-have features that often fail

---

## 🚀 Performance Information

| Tool Category | Average Duration | Timeout | Safety |
|---------------|------------------|---------|---------|
| **Core Tools** | 1-8 seconds | 10-30s | ✅ Safe |
| **Device Management** | 1-20 seconds | 15-120s | ⚠️ Device changes |
| **Development** | 10s-10 minutes | 60-600s | ⚠️ Long running |
| **Utilities** | 3-30 seconds | 20-60s | ⚠️ File operations |

---

## 🛡️ Security & Safety

### Safe for Testing ✅
These tools can be run safely without side effects:
- `health_check`
- `flutter_doctor`
- `flutter_version`  
- `flutter_list_devices`
- `android_list_devices`
- `native_run_list_devices`
- `ios_list_simulators`
- `android_list_emulators`

### Use with Caution ⚠️
These tools modify system state or run long processes:
- All installation tools
- Build and test operations
- File creation tools
- Device management tools

---

## 🔄 Fallback System

The MCP Mobile Server includes automatic fallbacks:

- **ADB → native-run** - If ADB unavailable, uses native-run
- **Enhanced errors** - Context-aware error messages
- **Tool detection** - Automatic availability checking

See [Fallback Usage Examples](./examples/fallback-usage.md) for details.

---

## 🆘 Troubleshooting

**Tool not found?**
```bash
# Check tool availability
npm run mcp:validate

# Run health check
# Use health_check tool with verbose:true
```

**Command fails?**
1. Verify dependencies are installed
2. Check tool-specific setup guides
3. Review error messages for missing requirements

**Need help?**
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Report issues on [GitHub](https://github.com/cristianoaredes/mcp-mobile-server/issues)