# 🚀 Quick Start Guide

Get up and running with MCP Mobile Server in less than 5 minutes.

---

## 📋 Prerequisites

### **Required**
- **Node.js** 18.0.0+ ([Download](https://nodejs.org))
- **Git** for cloning repositories

### **Platform-Specific** (Install what you need)
- **Flutter SDK** ([Install Guide](https://flutter.dev/docs/get-started/install))
- **Android SDK** OR **native-run** (lightweight alternative)
- **Xcode** (macOS only, for iOS development)

---

## ⚡ Installation Methods

### **Method 1: NPX (Recommended)**
```bash
# Run directly - no installation required
npx @cristianoaredes/mcp-mobile-server
```

### **Method 2: Global Install**
```bash
# Install globally
npm install -g @cristianoaredes/mcp-mobile-server

# Run server
mcp-mobile-server
```

### **Method 3: From Source**
```bash
# Clone repository
git clone https://github.com/cristianoaredes/mcp-mobile-server.git
cd mcp-mobile-server

# Install dependencies
npm install

# Build and run
npm run build
npm start
```

---

## 🔧 Claude Desktop Setup

### **1. Find Your Config File**
```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows  
%APPDATA%/Claude/claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

### **2. Add MCP Server Configuration**
```json
{
  "mcpServers": {
    "mobile-dev": {
      "command": "npx",
      "args": ["@cristianoaredes/mcp-mobile-server"]
    }
  }
}
```

### **3. Restart Claude Desktop**
Close and reopen Claude Desktop to load the new configuration.

---

## ✅ Verify Installation

### **1. Test Server Health**
In Claude Desktop, ask:
```
Use the health_check tool to verify the mobile development server is working
```

### **2. Check Available Tools**
```
List all available mobile development tools
```

### **3. Test Flutter Environment**
```
Use flutter_doctor to check my Flutter development setup
```

---

## 🛠️ Essential Tool Setup

### **Lightweight Option: native-run**
If you don't have the full Android SDK:
```bash
# Install lightweight alternative to ADB
npm install -g native-run

# Verify installation
native-run --version
```

### **Flutter Setup Verification**
```bash
# Check Flutter installation
flutter --version
flutter doctor

# List available devices
flutter devices
```

### **Android SDK (Optional)**
Only if you need full Android development:
```bash
# Check if ADB is available
adb version

# List connected devices
adb devices
```

---

## 📱 First Mobile Development Task

### **Flutter Project Workflow**
```
1. Use flutter_list_devices to see available devices
2. Create a new Flutter project (outside MCP - use flutter create)
3. Use flutter_run to start development with hot reload
4. Use flutter_test to run tests
5. Use flutter_build to create release builds
```

### **Device Management**
```
1. Use native_run_list_devices to see all connected devices
2. Use android_list_emulators to check Android emulators
3. Use ios_list_simulators to check iOS simulators (macOS only)
```

### **Debugging**
```
1. Use android_screenshot to capture device screens
2. Use android_logcat to view Android logs
3. Use health_check with verbose:true for detailed diagnostics
```

---

## 🚨 Common Setup Issues

### **"Flutter not found"**
```bash
# Add Flutter to PATH
export PATH="$PATH:/path/to/flutter/bin"

# Or install Flutter
# See: https://flutter.dev/docs/get-started/install
```

### **"No devices available"**
```bash
# Start Android emulator
# Use android_list_emulators then start one from Android Studio

# Boot iOS simulator (macOS only)  
# Use ios_boot_simulator with a simulator UDID

# Or connect physical device via USB
```

### **"ADB not found"**
```bash
# Install lightweight alternative
npm install -g native-run

# Or install Android SDK
# See: https://developer.android.com/studio
```

### **"Claude Desktop not recognizing server"**
1. Check config file path is correct
2. Verify JSON syntax is valid
3. Restart Claude Desktop completely
4. Check for error messages in Claude Desktop logs

---

## 🎯 Next Steps

### **Learn More**
- **[📋 Tools Reference](./TOOLS.md)** - Complete tool documentation
- **[🔧 Troubleshooting](./TROUBLESHOOTING.md)** - Solve common issues
- **[📱 Platform Setup](./setup/)** - Detailed platform guides

### **Try Examples**
- **[Flutter Workflow](./examples/flutter-workflow.md)** - Development examples
- **[Claude Desktop](./examples/claude-desktop.md)** - Advanced integration

### **Get Help**
- **[GitHub Issues](https://github.com/cristianoaredes/mcp-mobile-server/issues)** - Report problems
- **[Discussions](https://github.com/cristianoaredes/mcp-mobile-server/discussions)** - Ask questions

---

## 📊 Quick Health Check

```bash
# Validate installation
npm run mcp:validate

# Expected output:
✅ Server configuration is valid
✅ 19 tools registered
```

If you see errors, check:
1. Node.js version is 18.0.0+
2. Required dependencies are installed
3. Permissions are correct

---

**🎉 Congratulations!** You're ready to use MCP Mobile Server for mobile development automation.