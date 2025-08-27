# 💙 Flutter Development Workflow Examples

Real-world examples using MCP Mobile Server tools for Flutter development.

---

## 🚀 Complete Flutter Development Cycle

### **1. Environment Setup and Verification**

```json
// Check server health and tool availability
{
  "tool": "health_check",
  "arguments": { "verbose": true }
}

// Diagnose Flutter environment
{
  "tool": "flutter_doctor", 
  "arguments": {}
}

// Check Flutter version
{
  "tool": "flutter_version",
  "arguments": {}
}
```

**Expected Results:**
- Server status: healthy
- Flutter toolchain: ✅ working
- All required tools detected

### **2. Device Discovery and Selection**

```json
// List all available devices
{
  "tool": "flutter_list_devices",
  "arguments": {}
}

// Alternative: Use native-run for cross-platform device detection
{
  "tool": "native_run_list_devices",
  "arguments": { "platform": "android" }
}

// List iOS simulators (macOS only)
{
  "tool": "ios_list_simulators", 
  "arguments": {}
}

// Boot iOS simulator if needed
{
  "tool": "ios_boot_simulator",
  "arguments": { "udid": "your-simulator-udid" }
}
```

**Device Selection Strategy:**
- Physical devices for performance testing
- Emulators/simulators for UI testing
- Web/desktop for rapid prototyping

---

## 🏗️ Development Workflow

### **3. Project Preparation**

```bash
# Create new Flutter project (outside MCP)
flutter create my_awesome_app
cd my_awesome_app
```

```json
// Install/update dependencies
{
  "tool": "flutter_pub_get",
  "arguments": { 
    "cwd": "/path/to/my_awesome_app",
    "upgrade": false
  }
}

// Clean project if needed
{
  "tool": "flutter_clean",
  "arguments": { "cwd": "/path/to/my_awesome_app" }
}
```

### **4. Development with Hot Reload**

```json
// Start development server with hot reload
{
  "tool": "flutter_run",
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "deviceId": "emulator-5554",
    "buildMode": "debug",
    "target": "lib/main.dart"
  }
}
```

**Development Tips:**
- Hot reload: Save files to see changes instantly
- Hot restart: Use when changing app state or main()
- Debug mode: Best for development with assertions

### **5. Testing**

```json
// Run all tests
{
  "tool": "flutter_test",
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "coverage": true
  }
}

// Run specific test file
{
  "tool": "flutter_test", 
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "testPath": "test/widget_test.dart"
  }
}
```

**Testing Strategy:**
- Unit tests: Business logic
- Widget tests: UI components
- Integration tests: Full user flows

---

## 📦 Build and Release Workflow

### **6. Debug Builds**

```json
// Build Android APK (debug)
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "target": "apk",
    "buildMode": "debug"
  }
}

// Build iOS app (debug) - macOS only
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/my_awesome_app", 
    "target": "ios",
    "buildMode": "debug"
  }
}
```

### **7. Release Builds**

```json
// Build Android APK (release)
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "target": "apk", 
    "buildMode": "release"
  }
}

// Build for multiple platforms
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/my_awesome_app",
    "target": "web",
    "buildMode": "release"
  }
}
```

### **8. App Installation and Testing**

```json
// Install APK on Android device
{
  "tool": "android_install_apk",
  "arguments": {
    "apkPath": "/path/to/my_awesome_app/build/app/outputs/apk/release/app-release.apk",
    "deviceId": "emulator-5554"
  }
}

// Alternative: Use native-run for cross-platform installation
{
  "tool": "native_run_install_app",
  "arguments": {
    "platform": "android",
    "appPath": "/path/to/app-release.apk",
    "deviceId": "emulator-5554"
  }
}
```

---

## 🐛 Debugging and Monitoring

### **9. Log Monitoring**

```json
// Monitor Android logs
{
  "tool": "android_logcat",
  "arguments": {
    "deviceId": "emulator-5554",
    "filter": "flutter",
    "priority": "V",
    "duration": 30000
  }
}
```

### **10. Visual Testing**

```json
// Take Android screenshots
{
  "tool": "android_screenshot",
  "arguments": {
    "deviceId": "emulator-5554",
    "outputPath": "./screenshots/android/",
    "filename": "home_screen.png"
  }
}

// Take iOS screenshots
{
  "tool": "ios_take_screenshot", 
  "arguments": {
    "udid": "your-simulator-udid",
    "outputPath": "./screenshots/ios/",
    "filename": "home_screen.png"
  }
}
```

---

## 🔄 Real-World Development Scenarios

### **Scenario 1: Cross-Platform Feature Development**

```json
// 1. Check available devices
{ "tool": "flutter_list_devices", "arguments": {} }

// 2. Start development on Android
{
  "tool": "flutter_run",
  "arguments": {
    "cwd": "/path/to/project",
    "deviceId": "emulator-5554"
  }
}

// 3. Test on iOS (macOS)
{
  "tool": "ios_boot_simulator",
  "arguments": { "udid": "ios-simulator-udid" }
}

{
  "tool": "flutter_run", 
  "arguments": {
    "cwd": "/path/to/project",
    "deviceId": "ios-simulator-udid"
  }
}

// 4. Compare screenshots across platforms
{ "tool": "android_screenshot", "arguments": {...} }
{ "tool": "ios_take_screenshot", "arguments": {...} }
```

### **Scenario 2: Performance Testing**

```json
// 1. Build release version
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/project",
    "target": "apk",
    "buildMode": "release"
  }
}

// 2. Install on physical device
{
  "tool": "android_install_apk",
  "arguments": {
    "apkPath": "./build/app/outputs/apk/release/app-release.apk",
    "deviceId": "physical-device-id"
  }
}

// 3. Monitor performance logs
{
  "tool": "android_logcat",
  "arguments": {
    "deviceId": "physical-device-id", 
    "filter": "flutter",
    "priority": "I",
    "duration": 60000
  }
}
```

### **Scenario 3: CI/CD Integration**

```json
// Automated testing pipeline
[
  {
    "tool": "health_check",
    "arguments": { "verbose": true }
  },
  {
    "tool": "flutter_doctor", 
    "arguments": {}
  },
  {
    "tool": "flutter_pub_get",
    "arguments": { "cwd": "/path/to/project" }
  },
  {
    "tool": "flutter_test",
    "arguments": { 
      "cwd": "/path/to/project",
      "coverage": true 
    }
  },
  {
    "tool": "flutter_build",
    "arguments": {
      "cwd": "/path/to/project",
      "target": "apk", 
      "buildMode": "release"
    }
  }
]
```

---

## 🎯 Advanced Workflows

### **Multi-Flavor Development**

```json
// Build different flavors
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/project",
    "target": "apk",
    "buildMode": "release", 
    "flavor": "production"
  }
}

{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/project",
    "target": "apk", 
    "buildMode": "debug",
    "flavor": "development"
  }
}
```

### **Automated Screenshot Testing**

```json
// Capture screenshots across devices for UI regression testing
[
  {
    "tool": "android_screenshot",
    "arguments": {
      "deviceId": "pixel_6",
      "outputPath": "./screenshots/pixel6/",
      "filename": "home_screen.png"
    }
  },
  {
    "tool": "android_screenshot", 
    "arguments": {
      "deviceId": "samsung_s21",
      "outputPath": "./screenshots/s21/",
      "filename": "home_screen.png"
    }
  },
  {
    "tool": "ios_take_screenshot",
    "arguments": {
      "udid": "iphone_15_pro",
      "outputPath": "./screenshots/iphone15/", 
      "filename": "home_screen.png"
    }
  }
]
```

---

## ⚡ Performance Tips

### **Efficient Development Cycle**

1. **Use Hot Reload for UI Changes**
   ```json
   // Keep flutter_run session active
   { "tool": "flutter_run", "arguments": { ... } }
   // Make code changes, save files
   // See changes instantly without restart
   ```

2. **Batch Operations**
   ```json
   // Run multiple builds in parallel (if system allows)
   [
     { "tool": "flutter_build", "arguments": { "target": "apk" } },
     { "tool": "flutter_build", "arguments": { "target": "web" } }
   ]
   ```

3. **Smart Device Selection**
   ```json
   // Use fastest available device for iteration
   { "tool": "flutter_list_devices", "arguments": {} }
   // Choose emulator over slow physical device for UI work
   // Use physical device for performance testing
   ```

### **Resource Management**

1. **Clean Between Major Changes**
   ```json
   {
     "tool": "flutter_clean",
     "arguments": { "cwd": "/path/to/project" }
   }
   ```

2. **Update Dependencies Regularly**
   ```json
   {
     "tool": "flutter_pub_get", 
     "arguments": { 
       "cwd": "/path/to/project",
       "upgrade": true 
     }
   }
   ```

---

## 🚨 Troubleshooting Common Issues

### **Build Failures**

```json
// 1. Clean and retry
{ "tool": "flutter_clean", "arguments": { "cwd": "/path/to/project" } }
{ "tool": "flutter_pub_get", "arguments": { "cwd": "/path/to/project" } }
{ "tool": "flutter_build", "arguments": { ... } }

// 2. Check environment
{ "tool": "flutter_doctor", "arguments": {} }
```

### **Device Connection Issues**

```json
// 1. Refresh device list
{ "tool": "flutter_list_devices", "arguments": {} }

// 2. Try alternative tool
{ "tool": "native_run_list_devices", "arguments": {} }

// 3. Check specific platform
{ "tool": "android_list_devices", "arguments": {} }
```

### **Performance Issues**

```json
// 1. Use release build for testing
{
  "tool": "flutter_build",
  "arguments": {
    "cwd": "/path/to/project",
    "target": "apk",
    "buildMode": "release"
  }
}

// 2. Monitor device logs
{
  "tool": "android_logcat",
  "arguments": {
    "priority": "W",  // Only warnings and errors
    "duration": 30000
  }
}
```

---

## 📊 Workflow Checklist

**Pre-Development:**
- [ ] Environment verified with `health_check` and `flutter_doctor`
- [ ] Devices available via `flutter_list_devices`
- [ ] Project dependencies updated with `flutter_pub_get`

**Development:**
- [ ] Hot reload active via `flutter_run` 
- [ ] Regular testing with `flutter_test`
- [ ] Screenshots captured for UI verification

**Pre-Release:**
- [ ] Clean build with `flutter_clean`
- [ ] Release builds created with `flutter_build`
- [ ] Apps tested on real devices via installation tools
- [ ] Performance verified with device logs

**Post-Release:**
- [ ] Apps installed on multiple devices for verification
- [ ] User flows tested with screenshots
- [ ] Performance logs analyzed

---

**💡 Pro Tip:** Save common workflows as scripts or templates for consistent development processes across team members.