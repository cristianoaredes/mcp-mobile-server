# 🔧 Troubleshooting Guide

Common issues and solutions for MCP Mobile Server.

---

## 🚨 Server Issues

### **"Server not responding" or Connection Failed**

**Symptoms:**
- Claude Desktop shows "Failed to connect to server"
- Tools not appearing in Claude
- Timeout errors

**Solutions:**

1. **Check Configuration**
   ```bash
   # Verify config file exists and is valid JSON
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Test Server Directly**
   ```bash
   # Run server standalone to check for errors
   npx @cristianoaredes/mcp-mobile-server
   ```

3. **Restart Claude Desktop**
   - Completely quit Claude Desktop
   - Wait 5 seconds
   - Restart Claude Desktop

4. **Check Node.js Version**
   ```bash
   # Requires Node.js 18.0.0+
   node --version
   ```

---

## 🛠️ Tool Availability Issues

### **"Flutter not found" Error**

**Problem:** Flutter SDK not in PATH or not installed.

**Solutions:**

1. **Install Flutter**
   - Download from [flutter.dev](https://flutter.dev/docs/get-started/install)
   - Follow platform-specific installation guide

2. **Add to PATH**
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.profile
   export PATH="$PATH:/path/to/flutter/bin"
   
   # Reload shell
   source ~/.bashrc  # or ~/.zshrc
   ```

3. **Verify Installation**
   ```bash
   flutter --version
   flutter doctor
   ```

---

### **"ADB not found" or Android Device Issues**

**Problem:** Android SDK not properly configured or ADB not in PATH.

**Solutions:**

1. **Install Android SDK**
   - Install Android Studio
   - Or install command line tools only

2. **Set Environment Variables**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk  # Linux/macOS
   export ANDROID_SDK_ROOT=$ANDROID_HOME
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Alternative: Use native-run**
   ```bash
   # Lightweight alternative (15MB vs 3GB)
   npm install -g native-run
   
   # Verify installation
   native-run --version
   ```

4. **Enable USB Debugging**
   - Go to Settings > About phone
   - Tap Build number 7 times
   - Go to Developer options > Enable USB debugging

---

### **iOS Simulator Issues (macOS only)**

**Problem:** iOS simulators not starting or not listed.

**Solutions:**

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Check Simulator Installation**
   ```bash
   xcrun simctl list devices
   ```

3. **Boot Simulator**
   ```bash
   # List available simulators first
   # Use ios_list_simulators tool
   
   # Boot specific simulator
   # Use ios_boot_simulator with UDID
   ```

4. **Reset Simulator**
   ```bash
   # If simulator is corrupted
   xcrun simctl erase all
   ```

---

## 📱 Device Connection Issues

### **"No devices found"**

**Problem:** Physical devices or emulators not detected.

**Solutions:**

1. **Android Devices**
   ```bash
   # Check if device is detected
   adb devices
   
   # If unauthorized, allow on device
   adb kill-server
   adb start-server
   ```

2. **iOS Devices**
   - Ensure device is trusted in Xcode
   - Check provisioning profiles
   - Try restarting device and computer

3. **Emulators/Simulators**
   ```bash
   # Start Android emulator
   # Use android_list_emulators to see available AVDs
   
   # Start iOS simulator
   # Use ios_boot_simulator with UDID
   ```

---

## 🏗️ Build and Development Issues

### **Flutter Build Failures**

**Common Errors and Solutions:**

1. **"Gradle build failed"**
   ```bash
   # Clean project
   flutter clean
   flutter pub get
   
   # Update Gradle wrapper
   cd android && ./gradlew wrapper --gradle-version 7.6
   ```

2. **"CocoaPods issues" (iOS)**
   ```bash
   # Clean CocoaPods
   cd ios
   pod cache clean --all
   pod deintegrate
   pod install
   ```

3. **"Dependencies not found"**
   ```bash
   # Refresh dependencies
   flutter pub get
   flutter pub upgrade
   ```

---

### **Permission Errors**

**Problem:** Permission denied when installing apps or accessing devices.

**Solutions:**

1. **macOS Permission Issues**
   - Grant Terminal/Claude Desktop accessibility permissions
   - System Preferences > Security & Privacy > Privacy > Accessibility

2. **Android Installation Failures**
   ```bash
   # Install with force flag if app exists
   # Use android_install_apk with force: true
   
   # Or uninstall first
   adb uninstall com.example.app
   ```

3. **File Permission Issues**
   ```bash
   # Fix file permissions
   chmod +x /path/to/file
   
   # Fix directory permissions
   chmod -R 755 /path/to/directory
   ```

---

## 🔍 Debugging Tools

### **Health Check Diagnostics**

Use the health_check tool for detailed diagnostics:

```json
{
  "verbose": true
}
```

This provides:
- Tool availability status
- System tool detection
- Performance information
- Recommendations

---

### **Log Collection**

**Android Logs:**
```json
{
  "deviceId": "emulator-5554",
  "filter": "YourApp",
  "priority": "V",
  "duration": 30000
}
```

**Flutter Logs:**
- Use `flutter run` in verbose mode
- Check console output during `flutter_run` tool usage

---

## ⚠️ Common Gotchas

### **Environment Variables**

Make sure environment variables are available to Claude Desktop:

1. **macOS**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   
   # Reload shell or restart computer
   ```

2. **Path Issues**
   - Tools must be in system PATH
   - IDE-specific PATHs don't work with MCP server
   - Use `which flutter` to verify tool locations

### **Version Compatibility**

- **Node.js**: Requires 18.0.0 or higher
- **Flutter**: Works with all stable Flutter versions
- **Android SDK**: Requires API level 16+ for target devices
- **Xcode**: Requires macOS with Xcode Command Line Tools

---

## 🆘 Getting Help

### **Built-in Diagnostics**

1. **Server Health Check**
   ```
   Use health_check tool with verbose: true
   ```

2. **Tool Validation**
   ```bash
   npm run mcp:validate
   ```

### **Community Support**

- **GitHub Issues**: [Report bugs](https://github.com/cristianoaredes/mcp-mobile-server/issues)
- **Discussions**: [Ask questions](https://github.com/cristianoaredes/mcp-mobile-server/discussions)

### **Before Reporting Issues**

Include this information:

1. **System Information**
   ```bash
   node --version
   npm --version
   flutter --version  # if applicable
   adb version        # if applicable
   ```

2. **MCP Server Information**
   - Use health_check tool output
   - Include any error messages
   - Specify which tools are failing

3. **Configuration**
   - Claude Desktop config (sanitize sensitive info)
   - Environment variables being used
   - Platform (macOS/Windows/Linux)

---

## 🔄 Reset Procedures

### **Complete Reset**

If all else fails:

1. **Uninstall and Reinstall**
   ```bash
   npm uninstall -g @cristianoaredes/mcp-mobile-server
   npm install -g @cristianoaredes/mcp-mobile-server
   ```

2. **Clear Claude Desktop Config**
   - Backup current config
   - Remove MCP server entry
   - Restart Claude Desktop
   - Re-add server configuration

3. **Reset Development Environment**
   ```bash
   flutter clean
   flutter doctor
   adb kill-server
   adb start-server
   ```

---

**💡 Pro Tip:** Most issues are related to PATH configuration or missing dependencies. Start with `flutter doctor` and the `health_check` tool for comprehensive diagnostics.