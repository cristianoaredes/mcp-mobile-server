# 🤖 Android Development Workflow Guide

Complete guide for Android development workflows using MCP Mobile Server.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Setup](#environment-setup)
3. [Device Management](#device-management)
4. [Development Workflows](#development-workflows)
5. [Testing & Debugging](#testing--debugging)
6. [Build & Release](#build--release)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Check environment
Use the health_check tool with verbose mode to verify setup

# Verify Android tools
Check if adb and Android SDK are available
```

### Quick Start

```
1. Use android_list_devices to see connected devices
2. If no devices, use android_list_emulators to see available AVDs
3. Start an emulator or create a new one if needed
4. Build and deploy your app
```

---

## ⚙️ Environment Setup

### Option 1: Automated Setup (Recommended)

**Using Setup Tool:**
```
Use android_sdk_setup with action: "full"

This will:
- Check for existing Android SDK
- Install SDK components if needed
- Configure environment variables
- Accept licenses automatically
```

**Example:**
```json
{
  "action": "full",
  "components": [
    "platform-tools",
    "build-tools;34.0.0",
    "platforms;android-34",
    "system-images;android-34;google_apis;x86_64"
  ],
  "acceptLicenses": true
}
```

### Option 2: Lightweight Alternative

**Install native-run:**
```bash
npm install -g native-run
```

**Benefits:**
- Only 15MB vs 3GB Android SDK
- Works for basic device management
- APK installation support
- No Java/Gradle required

**Verification:**
```
Use native_run_list_devices to confirm installation
```

### Manual SDK Setup

**On macOS/Linux:**
```bash
# Download Android command-line tools
# Extract to ~/Android/cmdline-tools

# Set environment variables
export ANDROID_HOME=~/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

**On Windows:**
```cmd
setx ANDROID_HOME "C:\Android\sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

**Verify Installation:**
```
Use health_check tool to verify all Android tools are detected
```

---

## 📱 Device Management

### List Connected Devices

**Using ADB:**
```
Tool: android_list_devices

Returns:
- Connected physical devices
- Running emulators
- Device state (device/offline/unauthorized)
```

**Using native-run:**
```
Tool: native_run_list_devices
Parameters: { "platform": "android" }

Benefits:
- Works without full SDK
- Cross-platform compatibility
- Consistent output format
```

### Create New AVD

**Step 1: List Available System Images**
```
Tool: android_sdk_list_packages

Look for packages matching:
"system-images;android-XX;google_apis;x86_64"
```

**Step 2: Install System Image (if needed)**
```
Tool: android_sdk_install_packages
Parameters: {
  "packages": ["system-images;android-34;google_apis;x86_64"]
}
```

**Step 3: Create AVD**
```
Tool: android_create_avd
Parameters: {
  "name": "Pixel_7_API_34",
  "device": "pixel_7",
  "systemImage": "system-images;android-34;google_apis;x86_64",
  "sdcard": "512M"
}
```

**Common Device Types:**
- `pixel_7` - Google Pixel 7
- `pixel_5` - Google Pixel 5
- `Nexus_6` - Nexus 6
- `pixel_tablet` - Pixel Tablet

### Start Emulator

**Basic Start:**
```
Tool: android_start_emulator
Parameters: {
  "avdName": "Pixel_7_API_34"
}
```

**Headless Mode (for CI/CD):**
```
Parameters: {
  "avdName": "Pixel_7_API_34",
  "noWindow": true,
  "gpu": "swiftshader_indirect"
}
```

**Custom Port:**
```
Parameters: {
  "avdName": "Pixel_7_API_34",
  "port": 5556
}
```

**Fresh Start (wipe data):**
```
Parameters: {
  "avdName": "Pixel_7_API_34",
  "wipeData": true
}
```

### Stop Emulator

```
Tool: android_stop_emulator
Parameters: {
  "deviceId": "emulator-5554"
}
```

---

## 💻 Development Workflows

### Scenario 1: Quick Test on Physical Device

**Step 1: Connect Device**
```bash
# Enable USB debugging on device
# Connect via USB
```

**Step 2: Verify Connection**
```
Tool: android_list_devices

Expected: Device shows "device" state
```

**Step 3: Install APK**
```
Tool: android_install_apk
Parameters: {
  "apkPath": "./app/build/outputs/apk/debug/app-debug.apk",
  "force": false
}
```

**Step 4: Monitor Logs**
```
Tool: android_logcat
Parameters: {
  "filter": "MyApp",
  "priority": "I",
  "duration": 60000
}
```

### Scenario 2: Emulator Development Session

**Complete Workflow:**
```
1. Tool: android_list_emulators
   → Get available AVDs

2. Tool: android_start_emulator
   Parameters: {
     "avdName": "<selected_avd>",
     "gpu": "auto"
   }
   → Wait for boot (~30-60s)

3. Tool: android_list_devices
   → Verify emulator is ready

4. Tool: android_install_apk
   Parameters: {
     "apkPath": "./app-debug.apk",
     "deviceId": "emulator-5554",
     "grantPermissions": true
   }
   → Install and grant permissions

5. Tool: android_screenshot
   Parameters: {
     "deviceId": "emulator-5554",
     "outputPath": "./screenshots/"
   }
   → Capture initial screen
```

### Scenario 3: Multi-Device Testing

**Parallel Testing Workflow:**
```
1. List all devices:
   Tool: android_list_devices

2. For each device:
   a. Install APK:
      Tool: android_install_apk
      Parameters: { "deviceId": "<device_id>", "apkPath": "..." }

   b. Run instrumentation tests:
      External: adb -s <device_id> shell am instrument ...

   c. Capture logs:
      Tool: android_logcat
      Parameters: { "deviceId": "<device_id>", "duration": 300000 }

   d. Take screenshot:
      Tool: android_screenshot
      Parameters: { "deviceId": "<device_id>" }
```

---

## 🧪 Testing & Debugging

### Full Debug Session

**Using android_full_debug Super-Tool:**
```
Tool: android_full_debug
Parameters: {
  "deviceId": "emulator-5554",
  "captureLogs": true,
  "captureScreenshot": true,
  "dumpSystemInfo": true,
  "duration": 60000
}

Returns:
- Comprehensive logcat output
- Device screenshot
- System information:
  * Android version
  * Device model
  * Screen resolution
  * Battery level
  * Network state
  * Storage info
```

### Targeted Logcat Filtering

**Filter by App:**
```
Parameters: {
  "filter": "com.myapp",
  "priority": "D"
}
```

**Filter by Tag:**
```
Parameters: {
  "filter": "NetworkManager",
  "priority": "I"
}
```

**Error Logs Only:**
```
Parameters: {
  "priority": "E"
}
```

### Screenshot Capture

**Single Screenshot:**
```
Tool: android_screenshot
Parameters: {
  "deviceId": "emulator-5554",
  "outputPath": "./screenshots/",
  "filename": "login-screen.png"
}
```

**Automated Screenshot Suite:**
```
# Capture multiple screens during test
For each test step:
  1. Perform action
  2. Wait for animation (2-3s)
  3. Take screenshot with descriptive filename
  4. Validate screenshot (optional)
```

### Shell Commands

**For Advanced Use:**
```
Tool: android_shell_command
Parameters: {
  "deviceId": "emulator-5554",
  "command": "pm list packages | grep myapp"
}

Examples:
- "pm list packages" - List installed packages
- "dumpsys battery" - Battery information
- "wm size" - Screen resolution
- "settings get global airplane_mode_on" - Airplane mode status
```

---

## 🏗️ Build & Release

### Gradle Build

**Debug Build:**
```bash
# Build debug APK
./gradlew assembleDebug

# Then install:
Tool: android_install_apk
Parameters: {
  "apkPath": "./app/build/outputs/apk/debug/app-debug.apk"
}
```

**Release Build:**
```bash
# Build release APK
./gradlew assembleRelease

# Build App Bundle (for Play Store)
./gradlew bundleRelease
```

### Build Flavors

**Product Flavors:**
```groovy
// build.gradle
android {
  flavorDimensions "environment"
  productFlavors {
    dev {
      applicationIdSuffix ".dev"
    }
    staging {
      applicationIdSuffix ".staging"
    }
    production {
      // No suffix
    }
  }
}
```

**Build Specific Flavor:**
```bash
./gradlew assembleDevDebug
./gradlew assembleStagingRelease
./gradlew assembleProductionRelease
```

### Sign APK for Release

**Generate Keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Configure Signing in build.gradle:**
```groovy
android {
  signingConfigs {
    release {
      storeFile file("my-release-key.keystore")
      storePassword System.getenv("KEYSTORE_PASSWORD")
      keyAlias "my-key-alias"
      keyPassword System.getenv("KEY_PASSWORD")
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

**Build Signed Release:**
```bash
export KEYSTORE_PASSWORD="your_password"
export KEY_PASSWORD="your_password"
./gradlew assembleRelease
```

### App Bundle for Google Play

**Build Bundle:**
```bash
./gradlew bundleRelease
```

**Verify Bundle:**
```bash
bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks
```

---

## 🔧 Troubleshooting

### Device Not Detected

**Check Connection:**
```
1. Use android_list_devices
2. If empty, verify:
   - USB cable is data cable (not charge-only)
   - USB debugging enabled on device
   - Computer authorized on device
```

**Fix Authorization:**
```bash
# Restart ADB server
adb kill-server
adb start-server

# Check devices again
Tool: android_list_devices
```

**Use native-run as fallback:**
```
Tool: native_run_list_devices
Parameters: { "platform": "android" }
```

### Emulator Won't Start

**Common Issues:**

**1. HAXM/KVM not installed:**
```bash
# macOS: Install HAXM via Android Studio
# Linux: Install KVM
sudo apt-get install qemu-kvm
```

**2. Port conflict:**
```
Try different port:
Tool: android_start_emulator
Parameters: {
  "avdName": "Pixel_7_API_34",
  "port": 5556
}
```

**3. GPU issues:**
```
Use software rendering:
Parameters: {
  "avdName": "Pixel_7_API_34",
  "gpu": "swiftshader_indirect"
}
```

### Installation Failed

**Error: INSTALL_FAILED_UPDATE_INCOMPATIBLE**
```
Solution: Uninstall existing app first
Tool: android_shell_command
Parameters: {
  "command": "pm uninstall com.myapp.package"
}

Then reinstall:
Tool: android_install_apk
Parameters: {
  "apkPath": "./app-debug.apk",
  "force": true
}
```

**Error: INSTALL_FAILED_INSUFFICIENT_STORAGE**
```
Solution: Clear app data
Tool: android_shell_command
Parameters: {
  "command": "pm clear com.myapp.package"
}
```

### Logcat Shows Nothing

**Check Filtering:**
```
# Remove all filters
Tool: android_logcat
Parameters: {
  "priority": "V",
  "duration": 30000
}
# V = Verbose (shows everything)
```

**Check Buffer:**
```bash
# Clear logcat buffer first
adb logcat -c

# Then capture fresh logs
Tool: android_logcat
Parameters: { "duration": 60000 }
```

---

## 📊 Real-World Examples

### Example 1: CI/CD Pipeline

```yaml
# .github/workflows/android.yml
steps:
  - name: Start Emulator
    run: |
      # Using MCP tools via Claude
      android_start_emulator:
        avdName: "CI_Pixel_5"
        noWindow: true
        gpu: "swiftshader_indirect"

  - name: Wait for Boot
    run: adb wait-for-device

  - name: Build & Test
    run: ./gradlew connectedDebugAndroidTest

  - name: Capture Results
    run: |
      android_screenshot:
        outputPath: "./test-results/"
      android_logcat:
        outputPath: "./test-results/logcat.txt"
```

### Example 2: Automated Testing

```
1. Setup:
   - android_create_avd for each Android version
   - android_start_emulator (parallel or sequential)

2. Deploy:
   - Build APK
   - android_install_apk on all devices

3. Test:
   - Run instrumentation tests
   - Capture logs with android_logcat
   - Take screenshots at key points

4. Cleanup:
   - android_stop_emulator
   - Generate test report
```

### Example 3: Release Checklist

```
☐ 1. Update version in build.gradle
☐ 2. Build release APK/AAB
     ./gradlew assembleRelease bundleRelease

☐ 3. Test on physical device
     Tool: android_install_apk
     Parameters: { "apkPath": "./app-release.apk" }

☐ 4. Verify signing
     jarsigner -verify -verbose ./app-release.apk

☐ 5. Generate screenshots
     Tool: android_screenshot (multiple screens)

☐ 6. Upload to Play Console
     - App bundle (.aab file)
     - Screenshots
     - Release notes

☐ 7. Test internal/beta track
☐ 8. Promote to production
```

---

## 🎯 Best Practices

### 1. Device Management

- **Use AVDs for development** - Faster than physical devices for quick tests
- **Test on physical devices before release** - Real-world performance
- **Create AVDs for each Android version** - Test compatibility
- **Use specific device IDs** - Avoid ambiguity in multi-device setups

### 2. Build Optimization

- **Use build cache** - `./gradlew --build-cache`
- **Parallel builds** - `org.gradle.parallel=true` in gradle.properties
- **Incremental builds** - Avoid `clean` unless necessary
- **Flavor separation** - Separate dev/staging/prod for faster iteration

### 3. Testing Strategy

- **Unit tests first** - Fast feedback
- **Instrumentation tests on emulator** - Automated UI testing
- **Manual testing on physical device** - Final validation
- **Capture logs and screenshots** - Evidence for bug reports

### 4. Debugging

- **Use specific log priorities** - Reduce noise
- **Add unique tags** - Easy filtering
- **Take screenshots** - Visual confirmation
- **Save logs to files** - Historical debugging

---

## 📚 Additional Resources

- [Android Developer Docs](https://developer.android.com/docs)
- [ADB Documentation](https://developer.android.com/studio/command-line/adb)
- [Gradle Build](https://developer.android.com/studio/build)
- [Native Run](https://github.com/ionic-team/native-run)

---

## 🆘 Need Help?

- Check [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Use `health_check` tool with verbose flag
- Report issues on [GitHub](https://github.com/cristianoaredes/mcp-mobile-server/issues)

---

**Happy Android Development! 🤖**
