# 🤖 Android Development Setup

Complete guide to setting up Android development tools for MCP Mobile Server.

---

## 📋 Requirements

### **Essential**
- **Java JDK 17+** - Required for Android development
- **Android SDK** - Core Android development tools
- **ADB (Android Debug Bridge)** - Device communication

### **Recommended**
- **Android Studio** - Full IDE with integrated tools
- **native-run** - Lightweight alternative to full SDK

---

## ⚡ Quick Setup (Recommended)

### **Option 1: Lightweight with native-run**

Perfect for CI/CD or minimal environments:

```bash
# Install native-run (lightweight alternative to ADB)
npm install -g native-run

# Verify installation
native-run --version

# Test device detection
native-run android --list
```

**Benefits:**
- Only ~15MB download vs 3GB Android SDK
- Works with physical devices
- No complex SDK configuration
- Cross-platform support

---

### **Option 2: Android Studio (Full Setup)**

Best for active Android development:

1. **Download Android Studio**
   - Visit [developer.android.com/studio](https://developer.android.com/studio)
   - Download for your platform

2. **Install with SDK**
   - Run installer
   - Choose "Standard" installation
   - Let it download Android SDK automatically

3. **Verify Installation**
   ```bash
   # Check ADB is available
   adb version
   
   # List connected devices
   adb devices
   ```

---

## 🔧 Manual SDK Setup

### **1. Download SDK Tools**

```bash
# Create SDK directory
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools
# Visit: https://developer.android.com/studio#command-tools
# Extract to ~/Android/Sdk/cmdline-tools/latest/
```

### **2. Set Environment Variables**

**macOS/Linux (`~/.bashrc` or `~/.zshrc`):**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

**Windows (PowerShell Profile):**
```powershell
$env:ANDROID_HOME = "$env:USERPROFILE\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH += ";$env:ANDROID_HOME\cmdline-tools\latest\bin"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\emulator"
```

### **3. Install SDK Components**

```bash
# Accept licenses
sdkmanager --licenses

# Install essential components
sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

# Install emulator (optional)
sdkmanager "emulator" "system-images;android-34;google_apis;x86_64"
```

---

## 📱 Device Setup

### **Physical Devices**

1. **Enable Developer Options**
   - Go to Settings > About phone
   - Tap "Build number" 7 times
   - Developer options now available

2. **Enable USB Debugging**
   - Go to Settings > Developer options
   - Enable "USB debugging"
   - Enable "Install via USB" (if available)

3. **Connect and Authorize**
   ```bash
   # Connect device via USB
   adb devices
   
   # Should show:
   # List of devices attached
   # ABC123DEF456    device
   ```

   If shows "unauthorized":
   - Check device screen for authorization dialog
   - Tap "Allow" and optionally "Always allow from this computer"

### **Android Emulators**

1. **Create AVD (Android Virtual Device)**
   ```bash
   # List available system images
   sdkmanager --list | grep system-images
   
   # Create AVD
   avdmanager create avd -n "Pixel7" -k "system-images;android-34;google_apis;x86_64"
   ```

2. **Start Emulator**
   ```bash
   # List available AVDs
   emulator -list-avds
   
   # Start emulator
   emulator -avd Pixel7
   ```

3. **Using Android Studio**
   - Open Android Studio
   - Go to Tools > AVD Manager
   - Create Virtual Device
   - Choose device definition and system image
   - Launch emulator

---

## ✅ Verification

### **Test MCP Tools**

Use these MCP tools to verify your setup:

```json
// Check if Android tools are detected
{
  "tool": "health_check",
  "arguments": { "verbose": true }
}

// List connected Android devices
{
  "tool": "android_list_devices", 
  "arguments": {}
}

// List available emulators
{
  "tool": "android_list_emulators",
  "arguments": {}
}
```

### **Command Line Tests**

```bash
# Test ADB
adb version
adb devices

# Test native-run (if installed)
native-run android --list

# Test SDK manager
sdkmanager --list_installed

# Test emulator
emulator -list-avds
```

---

## 🚨 Common Issues

### **"adb: command not found"**

**Solution 1: Add to PATH**
```bash
# Find where ADB is installed
find /Applications -name adb 2>/dev/null  # macOS
find /opt -name adb 2>/dev/null          # Linux
where adb                                 # Windows

# Add directory to PATH in shell profile
export PATH=$PATH:/path/to/android-sdk/platform-tools
```

**Solution 2: Use native-run instead**
```bash
npm install -g native-run
native-run android --list
```

### **"No devices found"**

1. **Check USB Connection**
   ```bash
   # Kill and restart ADB server
   adb kill-server
   adb start-server
   adb devices
   ```

2. **USB Debugging Issues**
   - Ensure USB debugging is enabled
   - Try different USB cable/port
   - Check device is in "File Transfer" mode
   - Revoke USB debugging authorizations and reconnect

3. **Emulator Issues**
   ```bash
   # Check if emulator process is running
   ps aux | grep emulator
   
   # Start with verbose logging
   emulator -avd YourAVD -verbose
   ```

### **"ANDROID_HOME not set"**

```bash
# Check current environment
echo $ANDROID_HOME
echo $PATH | grep android

# Set temporarily
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Make permanent by adding to shell profile
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

### **"SDK licenses not accepted"**

```bash
# Accept all licenses
sdkmanager --licenses

# Or accept specific license
yes | sdkmanager --licenses
```

### **Emulator Performance Issues**

1. **Enable Hardware Acceleration**
   ```bash
   # Check if HAXM/KVM is installed
   # macOS: System Report > Software > Extensions
   # Linux: lsmod | grep kvm
   ```

2. **Emulator Settings**
   - Use x86_64 system images (not ARM)
   - Allocate sufficient RAM (4GB+)
   - Enable hardware graphics acceleration

3. **Alternative: Use Physical Device**
   - Often faster than emulator
   - Better battery testing
   - Real hardware behavior

---

## 🔧 Advanced Configuration

### **Multiple Android SDKs**

```bash
# Use different SDK for specific projects
export ANDROID_HOME=/path/to/android-sdk-29
export ANDROID_SDK_ROOT=$ANDROID_HOME

# Or use SDK manager to manage multiple API levels
sdkmanager "platforms;android-29" "platforms;android-34"
```

### **Headless Emulator**

```bash
# Start emulator without UI (for CI/CD)
emulator -avd YourAVD -no-window -no-audio

# Check if running
adb devices
```

### **Custom Build Tools**

```bash
# Install specific build tools version
sdkmanager "build-tools;33.0.2"

# Use specific version in project
# Set in android/app/build.gradle:
# compileSdkVersion 34
# buildToolsVersion "33.0.2"
```

---

## 📊 Troubleshooting Checklist

- [ ] **Java JDK 17+** installed and in PATH
- [ ] **ANDROID_HOME** environment variable set
- [ ] **platform-tools** in PATH (contains adb)
- [ ] **USB debugging** enabled on device
- [ ] **Device authorization** completed
- [ ] **SDK licenses** accepted
- [ ] **Emulator** created and bootable
- [ ] **MCP health_check** passes for Android tools

### **Quick Diagnostic**

```bash
# Run complete diagnostic
java -version
echo $ANDROID_HOME
adb version
sdkmanager --list_installed | head -10

# Test MCP integration
# Use health_check tool with verbose: true
```

---

## 🎯 Next Steps

1. **Verify Setup**: Use MCP `health_check` tool
2. **Test Device**: Use `android_list_devices` tool
3. **Install App**: Try `android_install_apk` with test APK
4. **Capture Logs**: Use `android_logcat` for debugging
5. **Take Screenshot**: Use `android_screenshot` to verify display

---

**🎉 Android setup complete!** You can now use all Android-related MCP tools for mobile development automation.