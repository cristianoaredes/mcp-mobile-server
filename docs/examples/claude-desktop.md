# 🤖 Claude Desktop Integration Guide

Complete guide for integrating MCP Mobile Server with Claude Desktop for AI-assisted mobile development.

---

## ⚡ Quick Setup

### **1. Install MCP Mobile Server**

```bash
# Install globally (recommended)
npm install -g @cristianoaredes/mcp-mobile-server

# Or use directly with npx
npx @cristianoaredes/mcp-mobile-server
```

### **2. Configure Claude Desktop**

**Find your configuration file:**

```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows
%APPDATA%/Claude/claude_desktop_config.json

# Linux  
~/.config/Claude/claude_desktop_config.json
```

**Add MCP server configuration:**

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

Close and reopen Claude Desktop completely to load the new server configuration.

---

## 🛠️ Claude Desktop Usage Patterns

### **Environment Verification**

**Ask Claude:**
```
Use the health_check tool with verbose details to verify my mobile development environment is properly set up
```

**Claude will:**
- Check server status and tool availability
- Analyze system tools (Flutter, Android SDK, etc.)
- Provide recommendations for missing components
- Report expected vs actual working tools

### **Device Discovery**

**Ask Claude:**
```
Show me all connected mobile devices and emulators available for development
```

**Claude will:**
- Use `flutter_list_devices` to show all platforms
- Use `android_list_devices` for Android-specific devices  
- Use `ios_list_simulators` for iOS simulators (macOS)
- Present organized device information with recommendations

### **Flutter Development Assistance**

**Ask Claude:**
```
Help me start a Flutter development session on my Android emulator
```

**Claude will:**
1. List available devices
2. Help you select appropriate device
3. Use `flutter_run` to start development server
4. Provide guidance on hot reload usage

---

## 💬 Effective Claude Prompts

### **Project Health Check**

```
"Run a comprehensive health check of my mobile development environment. Check Flutter setup, Android tools, iOS tools (if on macOS), and tell me what needs to be fixed."
```

**Expected Response:**
- Health check results with detailed analysis
- Platform-specific setup status
- Actionable recommendations for fixes
- Tool availability summary

### **Device Management**

```
"I need to test my Flutter app on multiple devices. Show me what's available and help me boot an iOS simulator if I'm on macOS."
```

**Claude Actions:**
1. Lists all available devices across platforms
2. Identifies best devices for testing
3. Boots iOS simulator if requested and available
4. Provides device selection guidance

### **Build and Release**

```
"Build my Flutter app for Android release, install it on my connected phone, and take a screenshot to verify it's working."
```

**Claude Workflow:**
1. Uses `flutter_build` with release configuration
2. Uses `android_install_apk` or `native_run_install_app`
3. Uses `android_screenshot` to capture result
4. Analyzes the build process and provides feedback

### **Debugging Assistance**

```
"My Android app is crashing. Help me monitor the logs and take screenshots to debug the issue."
```

**Claude Process:**
1. Uses `android_logcat` to capture real-time logs
2. Filters logs for error messages
3. Uses `android_screenshot` to capture current state
4. Analyzes logs for common issues and solutions

---

## 🎯 Advanced Integration Patterns

### **Multi-Platform Development**

**Prompt:**
```
"I'm building a cross-platform Flutter app. Help me test it on both Android emulator and iOS simulator, and compare the results with screenshots."
```

**Claude Workflow:**
1. Verifies both Android and iOS environments
2. Builds app for both platforms
3. Runs on both emulator and simulator
4. Captures comparative screenshots
5. Analyzes differences and provides insights

### **Automated Testing Pipeline**

**Prompt:**
```
"Set up an automated testing workflow: run Flutter tests, build release APK, install on device, and capture screenshots for documentation."
```

**Claude Actions:**
1. Runs `flutter_test` with coverage
2. Executes `flutter_build` for release
3. Installs APK using appropriate tool
4. Captures screenshots at key app screens
5. Provides test results summary and build artifacts info

### **Performance Analysis**

**Prompt:**
```
"Help me analyze the performance of my Flutter app. Build a release version, install it, monitor logs for 60 seconds, and tell me about any performance issues."
```

**Claude Process:**
1. Builds optimized release version
2. Installs on physical device (if available)
3. Monitors logs with performance-focused filtering
4. Analyzes log output for performance warnings
5. Provides optimization recommendations

---

## 🔧 Configuration Best Practices

### **Enhanced Configuration**

```json
{
  "mcpServers": {
    "mobile-dev": {
      "command": "npx",
      "args": ["@cristianoaredes/mcp-mobile-server"],
      "env": {
        "LOG_LEVEL": "info",
        "NODE_OPTIONS": "--max-old-space-size=4096"
      }
    }
  }
}
```

**Environment Variables:**
- `LOG_LEVEL`: Control server logging (error, warn, info, debug)
- `NODE_OPTIONS`: Increase memory limit if needed

### **Multiple Configurations**

```json
{
  "mcpServers": {
    "mobile-dev": {
      "command": "npx",
      "args": ["@cristianoaredes/mcp-mobile-server"]
    },
    "mobile-dev-local": {
      "command": "node", 
      "args": ["/path/to/mcp-mobile-server/dist/server.js"]
    }
  }
}
```

**Use Cases:**
- `mobile-dev`: Stable NPM version
- `mobile-dev-local`: Development/custom version

---

## 🎪 Interactive Workflows

### **Guided Setup Assistant**

**Ask Claude:**
```
"I'm new to mobile development. Guide me through setting up my environment step by step, checking each component as we go."
```

**Claude Will:**
1. Run health check to assess current state
2. Guide through missing component installation
3. Verify each step with appropriate tools
4. Provide platform-specific setup instructions
5. Test final configuration with sample workflows

### **Project Onboarding**

**Ask Claude:**
```
"I just cloned a Flutter project. Help me get it running on my Android phone."
```

**Claude Process:**
1. Verifies development environment
2. Checks project dependencies with `flutter_pub_get`
3. Lists available Android devices
4. Runs project with `flutter_run`
5. Assists with any setup issues encountered

### **Release Preparation**

**Ask Claude:**
```
"I'm ready to release my app. Help me build release versions for Android and iOS, test them, and prepare deployment assets."
```

**Claude Workflow:**
1. Runs final tests with `flutter_test`
2. Builds release versions for target platforms
3. Installs and tests on real devices
4. Captures screenshots for store listings
5. Provides checklist for app store submission

---

## 🚨 Troubleshooting with Claude

### **Common Issues Resolution**

**"Flutter not working" - Ask Claude:**
```
"Flutter commands are failing. Help me diagnose and fix my Flutter installation."
```

**Claude Response:**
1. Runs `flutter_doctor` to identify issues
2. Checks environment variables and PATH
3. Provides specific fix instructions
4. Verifies fixes with follow-up health checks

**"No devices found" - Ask Claude:**
```
"Claude can't find any devices for testing. Help me set up an Android emulator."
```

**Claude Actions:**
1. Lists available emulators with `android_list_emulators`
2. Provides guidance on creating new AVD
3. Helps boot emulator with appropriate tools
4. Verifies device detection with `flutter_list_devices`

### **Build Failures**

**Ask Claude:**
```
"My Flutter build is failing. Help me clean the project and retry with detailed logging."
```

**Claude Process:**
1. Uses `flutter_clean` to clear build cache
2. Refreshes dependencies with `flutter_pub_get`
3. Attempts build with detailed error capture
4. Analyzes error messages and provides solutions
5. Suggests alternative build approaches if needed

---

## 📊 Monitoring and Analytics

### **Development Session Tracking**

**Ask Claude:**
```
"Track my development session: monitor device logs while I test my app and summarize any issues found."
```

**Claude Monitoring:**
1. Starts log monitoring with `android_logcat`
2. Filters for app-specific messages
3. Captures screenshots at intervals
4. Summarizes findings and performance metrics

### **Cross-Platform Comparison**

**Ask Claude:**
```
"Compare how my app looks and performs on Android vs iOS. Take screenshots and analyze any differences."
```

**Claude Analysis:**
1. Builds and installs on both platforms
2. Captures identical screenshots from both
3. Monitors performance logs from both platforms
4. Provides comparative analysis and recommendations

---

## 🎯 Power User Tips

### **Batch Operations**

```
"Run my complete CI/CD pipeline: test, build for Android and iOS, install on all connected devices, and generate screenshots for documentation."
```

### **Custom Workflows**

```
"Create a custom development workflow: start my app on 3 different Android devices simultaneously, monitor logs from all of them, and alert me to any crashes."
```

### **Performance Optimization**

```
"Analyze my app's performance: build release version, install on fastest device, run for 5 minutes while monitoring logs, and provide optimization recommendations."
```

---

## ✅ Verification Checklist

**Initial Setup:**
- [ ] MCP Mobile Server installed globally or accessible via npx
- [ ] Claude Desktop configuration file updated correctly
- [ ] Claude Desktop restarted and recognizes mobile-dev server
- [ ] Health check passes with expected tool count

**Development Ready:**
- [ ] Flutter environment verified via `flutter_doctor` tool
- [ ] At least one mobile device/emulator available
- [ ] Sample Flutter project can be built and run
- [ ] Screenshots and logs can be captured

**Advanced Features:**
- [ ] Cross-platform development working (if applicable)
- [ ] Release builds completing successfully
- [ ] App installation on physical devices working
- [ ] Automated workflows responding correctly to Claude prompts

---

**🎉 You're ready!** Claude Desktop can now assist you with comprehensive mobile development workflows using all 19 essential tools in the MCP Mobile Server.