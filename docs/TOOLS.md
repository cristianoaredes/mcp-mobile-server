# 🔧 Tools Reference

This document provides detailed information about all 36 tools available in the MCP Mobile Server.

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

## 📱 Device Management (9)

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

### `android_create_avd`
**Platform:** Android
**Dependencies:** avdmanager
**Safe for Testing:** ❌ No (creates system files)

Create new Android Virtual Devices (AVDs) for testing different Android configurations.

```json
{
  "name": "Pixel_5_API_33",
  "device": "pixel_5",
  "systemImage": "system-images;android-33;google_apis;x86_64",
  "sdcard": "512M",
  "force": false
}
```

**Features:**
- Custom device configurations
- Multiple Android API levels
- SD card size configuration
- Force overwrite existing AVDs

---

### `android_start_emulator`
**Platform:** Android
**Dependencies:** Android Emulator
**Safe for Testing:** ❌ No (starts processes)

Start Android emulators with custom configuration options.

```json
{
  "avdName": "Pixel_5_API_33",
  "noWindow": false,
  "port": 5554,
  "gpu": "auto",
  "wipeData": false
}
```

**GPU Options:**
- `auto` - Automatic selection
- `host` - Use host GPU
- `swiftshader_indirect` - Software rendering
- `guest` - Use emulated GPU

**Features:**
- Headless mode support (`noWindow: true`)
- Custom port assignment
- Fresh start with `wipeData: true`
- Background execution

---

### `android_stop_emulator`
**Platform:** Android
**Dependencies:** ADB
**Safe for Testing:** ❌ No (stops processes)

Gracefully stop running Android emulators.

```json
{
  "deviceId": "emulator-5554"
}
```

**Features:**
- Safe shutdown process
- Automatic device ID detection
- State preservation

---

### `ios_shutdown_simulator`
**Platform:** iOS (macOS only)
**Dependencies:** Xcode Command Line Tools
**Safe for Testing:** ❌ No (stops processes)

Shutdown iOS simulators cleanly.

```json
{
  "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

**Features:**
- Clean shutdown process
- Automatic UDID resolution
- All simulators shutdown if no UDID provided

---

### `flutter_launch_emulator`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (starts processes)

Launch emulators using Flutter's emulator management.

```json
{
  "emulatorId": "Pixel_5_API_33",
  "coldBoot": false
}
```

**Features:**
- Cross-platform (Android/iOS)
- Automatic emulator selection
- Cold boot option for fresh state
- Integration with Flutter workflow

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

## 🚀 Super-Tools (10)

### `flutter_dev_session`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (comprehensive workflow)

Complete Flutter development session workflow - from environment check to running app with hot reload.

```json
{
  "cwd": "/path/to/flutter/project",
  "target": "lib/main.dart",
  "preferPhysical": true
}
```

**Workflow Steps:**
1. Run `flutter doctor` to verify environment
2. List available devices
3. Smart device selection (physical vs emulator)
4. Auto-start emulator if no devices available
5. Launch app with hot reload

**Perfect for:** Starting a development session with a single command.

---

### `flutter_test_suite`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (runs all tests)

Execute complete test suite including unit tests, widget tests, and integration tests with coverage reporting.

```json
{
  "cwd": "/path/to/flutter/project",
  "coverage": true,
  "integrationTests": false
}
```

**Test Categories:**
- **Unit Tests** - Business logic validation
- **Widget Tests** - UI component testing
- **Integration Tests** - End-to-end workflows
- **Coverage Report** - Code coverage metrics

**Output:**
- Test results for each category
- Coverage percentage
- Failed test details
- Performance metrics

---

### `flutter_release_build`
**Platform:** Flutter
**Dependencies:** Flutter SDK, Gradle, Xcode
**Safe for Testing:** ❌ No (long-running builds)

Build production-ready releases for all target platforms with optimizations and signing.

```json
{
  "cwd": "/path/to/flutter/project",
  "platforms": ["android", "ios", "web"],
  "buildNumber": "123",
  "buildName": "1.2.3",
  "obfuscate": true,
  "splitDebugInfo": "./debug-symbols/"
}
```

**Build Targets:**
- **Android**: APK and AAB (App Bundle)
- **iOS**: IPA with signing
- **Web**: Optimized web build
- **Desktop**: Windows, macOS, Linux

**Features:**
- Code obfuscation for security
- Split debug info for crash reporting
- Custom build numbers and names
- Parallel platform builds

---

### `mobile_device_manager`
**Platform:** Cross-platform
**Dependencies:** Flutter SDK
**Safe for Testing:** ✅ Yes (read-only)

Smart device management across all platforms with intelligent recommendations.

```json
{
  "action": "list", // or "recommend", "autostart"
  "platform": "all", // or "android", "ios"
  "includeEmulators": true
}
```

**Actions:**
- **list** - Show all connected devices and emulators
- **recommend** - Suggest best device for development
- **autostart** - Launch recommended emulator if none available

**Recommendations Based On:**
- Device type (physical vs emulator)
- Platform support
- Device specifications
- Current availability

---

### `flutter_performance_profile`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (resource intensive)

Run app in profile mode with Flutter DevTools for comprehensive performance analysis.

```json
{
  "cwd": "/path/to/flutter/project",
  "deviceId": "chrome",
  "enableTimeline": true,
  "enableMemoryProfiling": true
}
```

**Profiling Metrics:**
- **CPU** - Frame rendering performance
- **Memory** - Heap usage and leaks
- **Network** - API call performance
- **Timeline** - Event tracing

**DevTools Features:**
- Widget rebuild analysis
- Paint operations
- Layout performance
- Animation smoothness

---

### `flutter_deploy_pipeline`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (deployment workflow)

Complete deployment pipeline from clean build to store preparation.

```json
{
  "cwd": "/path/to/flutter/project",
  "platforms": ["android", "ios"],
  "generateChangelog": true,
  "runTests": true,
  "createReleaseNotes": true
}
```

**Pipeline Steps:**
1. `flutter clean` - Remove old artifacts
2. `flutter pub get` - Update dependencies
3. `flutter test` - Run test suite
4. `flutter build` - Create release builds
5. Generate changelog from git commits
6. Create release notes template
7. Prepare store submission assets

**Perfect for:** Automating the entire release process.

---

### `flutter_fix_common_issues`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (modifies project)

Automatically detect and fix common Flutter development issues.

```json
{
  "cwd": "/path/to/flutter/project",
  "issues": ["cache", "dependencies", "pods", "gradle"]
}
```

**Auto-Fix Issues:**
- **cache** - Clear Flutter cache and rebuild
- **dependencies** - Fix pubspec.lock conflicts
- **pods** - Clean and reinstall iOS CocoaPods
- **gradle** - Sync and repair Gradle configuration

**Common Fixes:**
```bash
# Cache issues
flutter clean
flutter pub get

# iOS pod issues
cd ios && pod deintegrate && pod install

# Gradle issues
cd android && ./gradlew clean
```

---

### `android_full_debug`
**Platform:** Android
**Dependencies:** ADB
**Safe for Testing:** ❌ No (comprehensive debugging)

Complete Android debugging toolkit with logs, screenshots, and system information.

```json
{
  "deviceId": "emulator-5554",
  "captureLogs": true,
  "captureScreenshot": true,
  "dumpSystemInfo": true,
  "duration": 30000
}
```

**Debug Information:**
- **Logcat** - Real-time application logs
- **Screenshot** - Current device screen
- **System Info** - Device specs and status
- **App Permissions** - Runtime permissions
- **Network State** - Connectivity status
- **Battery State** - Power and charging info

---

### `ios_simulator_manager`
**Platform:** iOS (macOS only)
**Dependencies:** Xcode Command Line Tools
**Safe for Testing:** ❌ No (manages simulators)

Smart iOS simulator management with recommendations and state cleanup.

```json
{
  "action": "list", // or "recommend", "boot", "clean"
  "deviceType": "iPhone 15 Pro",
  "iosVersion": "17.0"
}
```

**Actions:**
- **list** - Show all available simulators
- **recommend** - Suggest best simulator for testing
- **boot** - Start recommended simulator
- **clean** - Reset simulator to factory state

**Recommendations Consider:**
- Latest iOS version availability
- Device type popularity
- Screen size and resolution
- Current boot status

---

### `flutter_inspector_session`
**Platform:** Flutter
**Dependencies:** Flutter SDK
**Safe for Testing:** ❌ No (runs app with inspector)

Launch Flutter app with Inspector and DevTools for widget tree analysis.

```json
{
  "cwd": "/path/to/flutter/project",
  "deviceId": "chrome",
  "enableInspector": true,
  "enablePerformanceOverlay": true
}
```

**Inspector Features:**
- **Widget Tree** - Visual widget hierarchy
- **Render Tree** - Layout information
- **Performance Overlay** - FPS and frame timing
- **Debug Paint** - Layout boundaries
- **Size Information** - Widget dimensions

**Perfect for:** UI debugging and layout optimization.

---

## ⚙️ Setup & Configuration Tools (2)

### `flutter_setup_environment`
**Platform:** Cross-platform
**Dependencies:** None (bootstraps Flutter)
**Safe for Testing:** ✅ Yes (environment setup)

Automated Flutter SDK installation and environment configuration with PATH setup.

```json
{
  "action": "check", // or "install", "configure", "full"
  "installPath": "/usr/local/flutter",
  "updateShellConfig": true
}
```

**Actions:**
- **check** - Verify Flutter installation
- **install** - Download and install Flutter SDK
- **configure** - Set up PATH and environment variables
- **full** - Complete setup (check → install → configure)

**Configuration:**
- Adds Flutter to system PATH
- Updates shell profile (.bashrc, .zshrc)
- Configures Git for Flutter
- Runs initial `flutter doctor`

**Platform-Specific Paths:**
- **macOS**: `/Users/$USER/flutter`
- **Linux**: `/home/$USER/flutter`
- **Windows**: `C:\flutter`

---

### `android_sdk_setup`
**Platform:** Android
**Dependencies:** None (bootstraps Android SDK)
**Safe for Testing:** ✅ Yes (environment setup)

Setup Android SDK and configure environment for Android development.

```json
{
  "action": "check", // or "install", "configure"
  "components": ["platform-tools", "build-tools", "platforms;android-33"],
  "acceptLicenses": true
}
```

**SDK Components:**
- **platform-tools** - ADB and fastboot
- **build-tools** - AAPT, dx, zipalign
- **platforms** - Android API levels
- **system-images** - Emulator images

**Environment Variables:**
- `ANDROID_HOME` or `ANDROID_SDK_ROOT`
- `PATH` updates for platform-tools
- Java JDK configuration

**Perfect for:** First-time Android development setup.

---

## 🔧 Tool Categories

All 36 tools are categorized by functionality and complexity:

### Core Tools (5)
Essential diagnostic and environment checking tools that are safe to run anytime.

### Device Management (9)
Tools for discovering, creating, starting, and stopping devices and emulators across platforms.

### Development Workflow (6)
Primary development tools for building, testing, and running applications.

### Utility Tools (4)
Helper tools for debugging, logging, and capturing device state.

### Super-Tools (10)
Advanced workflow automation that combines multiple operations into intelligent pipelines. These tools provide:
- ✅ **Complete Workflows** - Multi-step automation
- ✅ **Smart Logic** - Intelligent decision making
- ✅ **Time Saving** - Reduce manual steps
- ✅ **Best Practices** - Industry-standard processes

### Setup & Configuration (2)
Bootstrap tools for installing and configuring development environments from scratch.

---

## 🚀 Performance Information

| Tool Category | Average Duration | Timeout | Safety |
|---------------|------------------|---------|---------|
| **Core Tools** | 1-8 seconds | 10-30s | ✅ Safe |
| **Device Management** | 1-60 seconds | 15-180s | ⚠️ Device changes |
| **Development** | 10s-10 minutes | 60-600s | ⚠️ Long running |
| **Utilities** | 3-30 seconds | 20-60s | ⚠️ File operations |
| **Super-Tools** | 30s-30 minutes | 300-1800s | ⚠️ Complex workflows |
| **Setup Tools** | 5s-10 minutes | 600s | ✅ Environment setup |

---

## 🛡️ Security & Safety

### Safe for Testing ✅
These tools can be run safely without side effects (read-only):
- `health_check`
- `flutter_doctor`
- `flutter_version`
- `flutter_list_devices`
- `android_list_devices`
- `native_run_list_devices`
- `ios_list_simulators`
- `android_list_emulators`
- `mobile_device_manager` (with action="list")
- `flutter_setup_environment` (with action="check")
- `android_sdk_setup` (with action="check")

### Use with Caution ⚠️
These tools modify system state, run long processes, or consume significant resources:
- **Device Management** - Start/stop emulators and simulators
- **Development Workflow** - Build, test, and run operations
- **Utilities** - File creation (screenshots) and logging
- **Super-Tools** - Complex multi-step workflows
- **Setup Tools** - System-wide environment changes (when installing)

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