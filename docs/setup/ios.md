# 🍎 iOS Development Setup

Complete guide to setting up iOS development tools for MCP Mobile Server on macOS.

---

## 📋 Requirements

### **System Requirements**
- **macOS** - iOS development is only available on macOS
- **Xcode** - Required for iOS development
- **Xcode Command Line Tools** - Core development utilities

### **MCP Tools Supported**
- `ios_list_simulators` - List available iOS simulators
- `ios_boot_simulator` - Start iOS simulators
- `ios_take_screenshot` - Capture simulator screenshots
- `native_run_install_app` - Install iOS apps

---

## ⚡ Quick Setup

### **Option 1: Xcode from App Store (Recommended)**

```bash
# 1. Install Xcode from Mac App Store
# Visit: https://apps.apple.com/app/xcode/id497799835

# 2. Install Command Line Tools
sudo xcode-select --install

# 3. Accept license
sudo xcodebuild -license accept

# 4. Verify installation
xcodebuild -version
xcrun simctl list devices
```

### **Option 2: Command Line Tools Only**

For lighter installation (no Xcode IDE):

```bash
# Install just the command line tools
xcode-select --install

# Verify
xcode-select -p
xcrun --version
```

**Note:** Full Xcode required for:
- Building iOS apps
- Advanced simulator features
- iOS device development

---

## 📱 iOS Simulator Setup

### **List Available Simulators**

```bash
# List all simulators
xcrun simctl list devices

# List only available simulators
xcrun simctl list devices available

# Using MCP tool
# Use ios_list_simulators tool
```

### **Create New Simulator**

```bash
# List device types
xcrun simctl list devicetypes

# List runtimes
xcrun simctl list runtimes

# Create simulator
xcrun simctl create "iPhone 15 Pro" "iPhone15,2" "iOS17.0"
```

### **Boot Simulator**

```bash
# Boot by UDID
xcrun simctl boot "UDID-HERE"

# Using MCP tool
# Use ios_boot_simulator with UDID
```

---

## 🛠️ Development Workflow

### **iOS App Installation**

1. **Using native-run (Recommended)**
   ```bash
   # Install native-run
   npm install -g native-run
   
   # List iOS devices/simulators
   native-run ios --list
   
   # Install .app bundle
   native-run ios --app path/to/YourApp.app --target "simulator-udid"
   ```

2. **Using MCP Tools**
   ```json
   // Install app on simulator
   {
     "tool": "native_run_install_app",
     "arguments": {
       "platform": "ios",
       "appPath": "/path/to/YourApp.app",
       "deviceId": "simulator-udid"
     }
   }
   ```

### **Screenshot Capture**

```bash
# Using simctl
xcrun simctl io "UDID" screenshot screenshot.png

# Using MCP tool
# Use ios_take_screenshot with UDID and output path
```

---

## 📲 Physical iOS Device Setup

### **Prerequisites**

1. **Apple Developer Account**
   - Free account: 7-day app expiration
   - Paid account: 1-year certificates

2. **Device Registration**
   - Add device UDID to developer portal
   - Create provisioning profile

### **Device Configuration**

1. **Trust Developer**
   - Install app on device
   - Go to Settings > General > VPN & Device Management
   - Trust the developer certificate

2. **Enable Developer Mode (iOS 16+)**
   - Install development app
   - Go to Settings > Privacy & Security > Developer Mode
   - Enable Developer Mode
   - Restart device

### **Using with native-run**

```bash
# List connected iOS devices
native-run ios --list

# Install on physical device
native-run ios --app YourApp.app --target "device-udid"
```

---

## ✅ Verification

### **Test MCP Tools**

```json
// Check iOS tool availability
{
  "tool": "health_check",
  "arguments": { "verbose": true }
}

// List available simulators
{
  "tool": "ios_list_simulators",
  "arguments": {}
}

// Boot a simulator
{
  "tool": "ios_boot_simulator", 
  "arguments": {
    "udid": "your-simulator-udid"
  }
}

// Take screenshot
{
  "tool": "ios_take_screenshot",
  "arguments": {
    "udid": "your-simulator-udid",
    "outputPath": "./screenshots/",
    "filename": "test-screenshot.png"
  }
}
```

### **Command Line Verification**

```bash
# Test Xcode installation
xcodebuild -version
xcode-select -p

# Test simulators
xcrun simctl list devices available

# Test native-run
native-run ios --list

# Test simulator boot
xcrun simctl boot "UDID"
xcrun simctl list devices | grep Booted
```

---

## 🚨 Common Issues

### **"xcode-select: error: tool 'simctl' requires Xcode"**

**Problem:** Command line tools installed but full Xcode required.

**Solutions:**

1. **Install Full Xcode**
   ```bash
   # Install from App Store or developer portal
   # Then set path
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

2. **Verify Xcode Path**
   ```bash
   xcode-select -p
   # Should show: /Applications/Xcode.app/Contents/Developer
   ```

### **"Unable to boot device"**

**Common Causes & Solutions:**

1. **Simulator Already Running**
   ```bash
   # Check running simulators
   xcrun simctl list devices | grep Booted
   
   # Shutdown all
   xcrun simctl shutdown all
   ```

2. **Insufficient Resources**
   - Close other applications
   - Free up disk space (10GB+ recommended)
   - Increase available RAM

3. **Corrupted Simulator**
   ```bash
   # Reset simulator
   xcrun simctl erase "UDID"
   
   # Or delete and recreate
   xcrun simctl delete "UDID"
   ```

### **"No devices available"**

```bash
# Download additional simulators
# Open Xcode > Window > Devices and Simulators > Simulators
# Click "+" to add simulators with different iOS versions

# Or via command line (if available)
xcrun simctl create "iPhone 14" "iPhone14,7" "iOS16.0"
```

### **"Developer Mode not available"**

**iOS 16+ Requirement:** Physical devices need Developer Mode enabled.

```bash
# Solution:
# 1. Install development app on device
# 2. Settings > Privacy & Security > Developer Mode > Enable
# 3. Restart device
# 4. Confirm security prompt
```

### **Provisioning Profile Issues**

1. **Check Team Settings**
   ```bash
   # In Xcode project:
   # Signing & Capabilities > Team > Select your team
   ```

2. **Manual Provisioning**
   - Create App ID in developer portal
   - Create provisioning profile
   - Download and install profile

3. **Automatic Signing**
   ```bash
   # Enable in Xcode:
   # Signing & Capabilities > Automatically manage signing ✓
   ```

---

## 🔧 Advanced Configuration

### **Multiple iOS Versions**

```bash
# List available runtimes
xcrun simctl list runtimes

# Install additional iOS versions via Xcode
# Xcode > Settings > Components > Simulators
# Download desired iOS versions
```

### **Simulator Performance**

```bash
# Boot with GPU acceleration
xcrun simctl boot "UDID" --gpu-acceleration

# Increase simulator RAM
# Simulator > Device > Configure... > Hardware > Memory
```

### **Headless Simulator**

```bash
# Boot without UI (automation)
xcrun simctl boot "UDID"
# Simulator app won't open, but simulator is running

# Check status
xcrun simctl list devices | grep "UDID"
```

### **Custom Simulator Configurations**

```bash
# Create simulator with specific settings
xcrun simctl create \
  "Custom iPhone" \
  "iPhone14,7" \
  "iOS16.0"

# Customize settings after creation via Simulator app
# Device > Configure...
```

---

## 📊 iOS Development Tips

### **Flutter iOS Development**

```bash
# Prerequisites for Flutter iOS development
flutter doctor
# Ensure iOS toolchain shows ✓

# Build iOS app
flutter build ios

# Run on simulator
flutter run -d "ios-simulator-udid"

# Run on device  
flutter run -d "ios-device-udid"
```

### **Native iOS Development**

```bash
# Build iOS project
xcodebuild -workspace YourApp.xcworkspace \
           -scheme YourApp \
           -destination 'platform=iOS Simulator,name=iPhone 15' \
           build

# Archive for distribution
xcodebuild -workspace YourApp.xcworkspace \
           -scheme YourApp \
           -archivePath YourApp.xcarchive \
           archive
```

### **Debugging iOS Apps**

```bash
# View device logs
xcrun simctl spawn "UDID" log show --predicate 'process == "YourApp"'

# Install and launch with debugging
native-run ios --app YourApp.app --target "UDID" --foreground
```

---

## 🎯 Best Practices

### **Simulator Management**

1. **Use Descriptive Names**
   ```bash
   xcrun simctl create "iPhone 15 Pro - iOS 17.0" "iPhone15,2" "iOS17.0"
   ```

2. **Regular Cleanup**
   ```bash
   # Remove unused simulators
   xcrun simctl delete unavailable
   
   # Reset simulator data
   xcrun simctl erase all
   ```

3. **Automate Common Tasks**
   - Use MCP tools for consistent simulator operations
   - Create scripts for repetitive workflows
   - Integrate with CI/CD pipelines

### **Physical Device Testing**

1. **Test on Real Hardware**
   - Different performance characteristics
   - Real-world network conditions
   - Actual hardware sensors

2. **Use Multiple iOS Versions**
   - Test backward compatibility
   - Verify new iOS features
   - Different device screen sizes

---

## 📊 Troubleshooting Checklist

- [ ] **macOS** system (iOS development requires macOS)
- [ ] **Xcode** installed from App Store
- [ ] **Command Line Tools** installed via `xcode-select --install`
- [ ] **Xcode license** accepted
- [ ] **At least one simulator** created and available
- [ ] **Developer certificate** trusted (for physical devices)
- [ ] **native-run** installed globally
- [ ] **MCP health_check** passes for iOS tools

### **Quick Diagnostic**

```bash
# Complete iOS setup check
uname -s                    # Should show: Darwin
xcodebuild -version        # Should show Xcode version
xcrun simctl list devices available | head -5
native-run ios --list     # Should list iOS devices/simulators

# Test MCP integration
# Use health_check tool with verbose: true
```

---

## 🎯 Next Steps

1. **Verify Setup**: Use MCP `health_check` tool
2. **List Simulators**: Use `ios_list_simulators` tool  
3. **Boot Simulator**: Use `ios_boot_simulator` with a UDID
4. **Install App**: Try `native_run_install_app` with iOS app
5. **Take Screenshot**: Use `ios_take_screenshot` to verify display

---

**🎉 iOS setup complete!** You can now use all iOS-related MCP tools for mobile development automation on macOS.