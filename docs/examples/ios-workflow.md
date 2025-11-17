# 🍎 iOS Development Workflow Guide

Complete guide for iOS development workflows using MCP Mobile Server.

**Note:** iOS tools only work on macOS due to Xcode requirements.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Setup](#environment-setup)
3. [Simulator Management](#simulator-management)
4. [Development Workflows](#development-workflows)
5. [Testing & Debugging](#testing--debugging)
6. [Build & Release](#build--release)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

**Required:**
- macOS (Big Sur 11.0+)
- Xcode (14.0+) or Xcode Command Line Tools

**Verification:**
```
Use health_check tool with verbose mode to verify Xcode installation
```

### Platform Check

```
All iOS tools will check for macOS platform:
if (process.platform !== 'darwin') {
  throw new Error('iOS tools only work on macOS')
}
```

---

## ⚙️ Environment Setup

### Option 1: Full Xcode (Recommended)

**Install from App Store:**
1. Open App Store
2. Search for "Xcode"
3. Download (12+ GB, takes 30-60 min)
4. Launch Xcode once to complete setup

**Verify Installation:**
```
Tool: ios_list_simulators

If successful, Xcode is properly installed
```

### Option 2: Command Line Tools Only

**Install:**
```bash
xcode-select --install
```

**Limitations:**
- Can use simulators
- Cannot build iOS apps from source
- Cannot run Xcode-specific tools

**Verify:**
```bash
xcode-select -p
# Should output: /Library/Developer/CommandLineTools
```

### Optional: native-run

**Install:**
```bash
npm install -g native-run
```

**Benefits:**
- Cross-platform CLI tool
- Works with both Android and iOS
- Simplified device management
- No Xcode required for listing devices

---

## 📱 Simulator Management

### List Available Simulators

**Basic List:**
```
Tool: ios_list_simulators

Returns:
- All installed iOS simulators
- Device types (iPhone, iPad, Apple Watch, Apple TV)
- iOS versions
- Current state (Shutdown, Booted, Booting)
- UDIDs for targeting specific simulators
```

**Example Response:**
```json
{
  "simulators": [
    {
      "udid": "ABC123...",
      "name": "iPhone 15 Pro",
      "version": "17.0",
      "state": "Shutdown",
      "deviceType": "iPhone"
    }
  ]
}
```

### Boot Simulator

**Boot Specific Simulator:**
```
Tool: ios_boot_simulator
Parameters: {
  "udid": "ABC123-DEF456-..."
}
```

**Auto-select and Boot:**
```
Tool: ios_simulator_manager
Parameters: {
  "action": "recommend",
  "deviceType": "iPhone 15 Pro",
  "iosVersion": "17.0"
}

Then use recommended UDID to boot
```

**Boot Time:**
- First boot: 20-40 seconds
- Subsequent boots: 10-20 seconds

### Shutdown Simulator

**Shutdown Specific:**
```
Tool: ios_shutdown_simulator
Parameters: {
  "udid": "ABC123-DEF456-..."
}
```

**Shutdown All:**
```
Tool: ios_shutdown_simulator
Parameters: {}
# Omit UDID to shutdown all running simulators
```

### Reset Simulator

**Erase All Content:**
```
Tool: ios_erase_simulator
Parameters: {
  "udid": "ABC123-DEF456-..."
}

Use Cases:
- Fresh app install testing
- Clear corrupted state
- Reset permissions
- Remove test data
```

### Smart Simulator Management

**Using Super-Tool:**
```
Tool: ios_simulator_manager
Parameters: {
  "action": "list" | "recommend" | "boot" | "clean",
  "deviceType": "iPhone 15 Pro",
  "iosVersion": "17.0"
}

Features:
- Intelligent recommendations based on popularity
- Latest iOS version preference
- Auto-boot recommended simulator
- Batch cleanup operations
```

---

## 💻 Development Workflows

### Scenario 1: Quick App Test

**Complete Workflow:**
```
1. List simulators:
   Tool: ios_list_simulators

2. Boot simulator:
   Tool: ios_boot_simulator
   Parameters: { "udid": "<selected_udid>" }

3. Install app (using native-run):
   Tool: native_run_install_app
   Parameters: {
     "platform": "ios",
     "appPath": "./build/ios/Debug-iphonesimulator/MyApp.app",
     "deviceId": "<udid>"
   }

4. Open deep link (optional):
   Tool: ios_open_url
   Parameters: {
     "udid": "<udid>",
     "url": "myapp://deeplink"
   }

5. Take screenshot:
   Tool: ios_take_screenshot
   Parameters: {
     "udid": "<udid>",
     "outputPath": "./screenshots/"
   }
```

### Scenario 2: Multi-Device Testing

**Test Across iOS Versions:**
```
1. Create test matrix:
   - iPhone 15 Pro (iOS 17.0)
   - iPhone 14 (iOS 16.0)
   - iPhone SE (iOS 15.0)
   - iPad Pro (iOS 17.0)

2. For each device:
   a. Boot simulator
   b. Install app
   c. Run automated tests
   d. Capture screenshots
   e. Record video (if needed)
   f. Shutdown simulator

3. Generate test report
```

**Parallel Execution:**
```bash
# Boot multiple simulators simultaneously
# Each simulator runs in separate process
# Max recommended: 3-4 simulators on 16GB RAM
```

### Scenario 3: Flutter iOS Development

**Complete Session:**
```
1. Check environment:
   Tool: flutter_doctor

2. List available devices:
   Tool: flutter_list_devices
   # Shows iOS simulators + physical devices

3. Start dev session:
   Tool: flutter_dev_session
   Parameters: {
     "cwd": "/path/to/project",
     "preferPhysical": false  # Use simulator
   }
   # Automatically selects and boots iOS simulator

4. Take screenshots:
   Tool: ios_take_screenshot
   Parameters: {
     "udid": "<simulator_udid>",
     "outputPath": "./screenshots/"
   }
```

---

## 🧪 Testing & Debugging

### Screenshot Capture

**Single Screenshot:**
```
Tool: ios_take_screenshot
Parameters: {
  "udid": "ABC123-DEF456-...",
  "outputPath": "./screenshots/",
  "filename": "login-screen.png"
}

Output:
- PNG format
- Retina resolution (2x, 3x)
- Maintains aspect ratio
```

**Screenshot Test Suite:**
```
Test Flow:
1. Navigate to screen
2. Wait for animations (1-2s)
3. Take screenshot
4. Compare with baseline (optional)

Example screens:
- Launch screen
- Login screen
- Main dashboard
- Settings page
- Error states
```

### Video Recording

**Record Session:**
```
Tool: ios_record_video
Parameters: {
  "udid": "ABC123-DEF456-...",
  "outputPath": "./videos/",
  "filename": "test-session.mp4",
  "duration": 30000  // 30 seconds
}

Use Cases:
- Bug reproduction
- App store preview videos
- Tutorial content
- Performance analysis
```

### Deep Link Testing

**Open URL:**
```
Tool: ios_open_url
Parameters: {
  "udid": "ABC123-DEF456-...",
  "url": "myapp://deeplink/feature"
}

Supported URL Schemes:
- Custom app schemes (myapp://)
- Universal links (https://)
- System URLs (sms:, tel:, mailto:)
```

**Test Matrix:**
```
Deep Links to Test:
- App launch from cold start
- App launch from background
- Invalid/malformed URLs
- Missing parameters
- Authentication flows
```

### System Log Access

**View Simulator Logs:**
```bash
# Simulator logs location
~/Library/Logs/CoreSimulator/<UDID>/system.log

# Monitor in real-time
tail -f ~/Library/Logs/CoreSimulator/<UDID>/system.log

# Filter by app
tail -f system.log | grep "MyApp"
```

---

## 🏗️ Build & Release

### Xcode Build

**Build for Simulator:**
```
Tool: ios_build_project
Parameters: {
  "projectPath": "./ios/MyApp.xcodeproj",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15 Pro"
}
```

**List Available Schemes:**
```
Tool: ios_list_schemes
Parameters: {
  "projectPath": "./ios/MyApp.xcodeproj"
}
```

### Build for Device

**Release Build:**
```
Tool: ios_build_project
Parameters: {
  "projectPath": "./ios/MyApp.xcworkspace",
  "scheme": "MyApp",
  "configuration": "Release",
  "destination": "generic/platform=iOS",
  "archivePath": "./build/MyApp.xcarchive"
}
```

**Export IPA:**
```bash
xcodebuild -exportArchive \
  -archivePath ./build/MyApp.xcarchive \
  -exportPath ./build/ipa \
  -exportOptionsPlist ./ExportOptions.plist
```

### Signing & Provisioning

**Automatic Signing:**
```xml
<!-- Info.plist -->
<key>DevelopmentTeam</key>
<string>YOUR_TEAM_ID</string>
```

**Manual Signing:**
```xml
<!-- ExportOptions.plist -->
<key>method</key>
<string>app-store</string>
<key>provisioningProfiles</key>
<dict>
  <key>com.myapp.bundle</key>
  <string>MyApp Distribution Profile</string>
</dict>
```

### Code Signing Requirements

**Development:**
- Apple Developer Account (free tier OK)
- Development certificate
- Development provisioning profile
- Device UDID registered

**Distribution:**
- Paid Apple Developer Account ($99/year)
- Distribution certificate
- Distribution provisioning profile

---

## 🧪 Testing

### Unit Tests

**Run Unit Tests:**
```
Tool: ios_run_tests
Parameters: {
  "projectPath": "./ios/MyApp.xcodeproj",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15 Pro",
  "onlyTesting": ["MyAppTests"]
}
```

### UI Tests

**Run UI Tests:**
```
Tool: ios_run_tests
Parameters: {
  "projectPath": "./ios/MyApp.xcworkspace",
  "scheme": "MyApp",
  "destination": "platform=iOS Simulator,name=iPhone 15 Pro",
  "onlyTesting": ["MyAppUITests"]
}
```

**Test Results Location:**
```
~/Library/Developer/Xcode/DerivedData/MyApp-xxx/Logs/Test/
```

---

## 🔧 Troubleshooting

### Simulator Not Listed

**Check Xcode Installation:**
```bash
# Verify Xcode path
xcode-select -p

# Should output: /Applications/Xcode.app/Contents/Developer

# If wrong, set correct path:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**Reinstall Simulators:**
```
1. Open Xcode
2. Preferences → Components
3. Download iOS Simulators
```

### Simulator Won't Boot

**Error: "Unable to boot device"**
```bash
# Reset simulator
xcrun simctl erase <UDID>

# Or use tool:
Tool: ios_erase_simulator
Parameters: { "udid": "<UDID>" }

# Retry boot
Tool: ios_boot_simulator
Parameters: { "udid": "<UDID>" }
```

**Error: "Device already booted"**
```
# Shutdown first
Tool: ios_shutdown_simulator
Parameters: { "udid": "<UDID>" }

# Wait 5 seconds

# Boot again
Tool: ios_boot_simulator
Parameters: { "udid": "<UDID>" }
```

### App Installation Failed

**Error: "App installation failed"**
```
Possible causes:
1. Wrong architecture (arm64 vs x86_64)
2. Invalid bundle ID
3. Provisioning profile mismatch
4. Expired certificate

Solution:
- Rebuild for simulator target
- Verify bundle ID matches
- Check provisioning profile
- Renew certificates if expired
```

### Developer Mode Issues (iOS 16+)

**Enable Developer Mode:**
```
On iOS 16+ physical devices:
1. Settings → Privacy & Security
2. Developer Mode → ON
3. Restart device
4. Confirm in popup

Without this, app installation will fail
```

---

## 📊 Real-World Examples

### Example 1: Automated UI Testing

```
Workflow:
1. Boot simulator:
   Tool: ios_boot_simulator
   Parameters: { "udid": "iPhone-15-Pro-UDID" }

2. Install app:
   xcodebuild -project MyApp.xcodeproj \
     -scheme MyApp \
     -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

3. Run UI tests:
   Tool: ios_run_tests
   Parameters: {
     "scheme": "MyApp",
     "onlyTesting": ["MyAppUITests"]
   }

4. Capture screenshots:
   Tool: ios_take_screenshot (after each test)

5. Record failure videos:
   Tool: ios_record_video (on test failure)

6. Shutdown:
   Tool: ios_shutdown_simulator
```

### Example 2: App Store Screenshots

```
Devices to capture:
- iPhone 15 Pro Max (6.7")
- iPhone 15 Pro (6.1")
- iPhone SE (4.7")
- iPad Pro 12.9"

For each device:
1. Boot simulator
2. Install app
3. Navigate to key screens:
   - Launch/splash
   - Main features (4-5 screens)
   - Settings/profile
4. Take screenshots
5. Organize by device size

Tool: ios_take_screenshot
Output: ./screenshots/<device>/<screen>.png
```

### Example 3: CI/CD Pipeline

```yaml
# .github/workflows/ios.yml
- name: Setup Simulators
  run: |
    xcrun simctl create "CI iPhone" "iPhone 15 Pro"
    xcrun simctl create "CI iPad" "iPad Pro (12.9-inch)"

- name: Run Tests
  run: |
    # Boot simulators
    ios_boot_simulator:
      udid: <iphone_udid>

    # Run tests
    ios_run_tests:
      scheme: "MyApp"
      destination: "platform=iOS Simulator,name=CI iPhone"

- name: Capture Results
  run: |
    ios_take_screenshot:
      outputPath: "./test-results/"

- name: Cleanup
  run: |
    ios_shutdown_simulator  # Shutdown all
```

---

## 🎯 Best Practices

### 1. Simulator Selection

- **Use latest iOS version** for development
- **Test on oldest supported iOS** for compatibility
- **Use iPhone Pro models** for latest features
- **Test iPad separately** - different UX patterns

### 2. Performance

- **Don't run too many simulators** - Max 3-4 on 16GB RAM
- **Shutdown when done** - Frees system resources
- **Reset periodically** - Prevents state accumulation
- **Use SSD** - Significantly faster boot times

### 3. Testing Strategy

- **Unit tests first** - Fastest feedback
- **UI tests on simulator** - Automated testing
- **Manual testing on device** - Real-world validation
- **Test on physical device before release** - Performance validation

### 4. Debugging

- **Use screenshots** - Visual confirmation
- **Record videos** - Bug reproduction
- **Test deep links** - Navigation flows
- **Monitor memory** - Prevent leaks

---

## 📚 Additional Resources

- [iOS Developer Docs](https://developer.apple.com/documentation/)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [Simulator User Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator)
- [App Distribution](https://developer.apple.com/app-store/)

---

## 🆘 Need Help?

- Check [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Use `health_check` tool with verbose flag
- Visit [iOS Setup Guide](../setup/ios.md)
- Report issues on [GitHub](https://github.com/cristianoaredes/mcp-mobile-server/issues)

---

**Happy iOS Development! 🍎**
