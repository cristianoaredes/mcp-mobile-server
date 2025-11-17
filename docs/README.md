# 📱 MCP Mobile Server Documentation

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@cristianoaredes/mcp-mobile-server.svg?style=for-the-badge)](https://www.npmjs.com/package/@cristianoaredes/mcp-mobile-server)
[![WIP Status](https://img.shields.io/badge/Status-Work_in_Progress-orange?style=for-the-badge&logo=construction)](https://github.com/cristianoaredes/mcp-mobile-server/issues)
[![MCP](https://img.shields.io/badge/MCP-Native_Server-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAzLTEuOSA3aDQuMnptMCAwdjE4bDggNS4yLTEyIDEuOXoiLz48L3N2Zz4=)](https://modelcontextprotocol.io)

**Native MCP Server for Mobile Development**

A comprehensive **Model Context Protocol (MCP) Server** with **36 powerful tools** for Android, iOS, and Flutter development.

> **⚠️ Work in Progress**  
> This project is under active development. Use with caution and report issues.

</div>

---

## 🚀 Quick Start

**NPX Usage (Recommended):**
```bash
# Run directly with npx
npx @cristianoaredes/mcp-mobile-server

# Or install globally 
npm install -g @cristianoaredes/mcp-mobile-server
```

**Claude Desktop Integration:**
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

---

## 📋 Tool Categories (36 Total)

### **🔧 Core Tools (5)**
- `health_check` - Server diagnostics and environment validation
- `flutter_doctor` - Complete Flutter environment check
- `flutter_version` - Flutter SDK version information
- `flutter_list_devices` - List all connected devices
- `android_list_devices` - Android devices and emulators

### **📱 Device Management (9)**
- `native_run_list_devices` - Cross-platform device listing
- `native_run_install_app` - Universal app installer
- `ios_list_simulators` - List iOS simulators
- `android_list_emulators` - List Android emulators
- `android_create_avd` - Create Android Virtual Device
- `android_start_emulator` - Start Android emulator
- `android_stop_emulator` - Stop Android emulator
- `ios_shutdown_simulator` - Shutdown iOS simulator
- `flutter_launch_emulator` - Launch Flutter emulator

### **⚡ Development Workflow (6)**
- `flutter_run` - Hot reload development session
- `flutter_build` - Multi-platform release builds
- `flutter_test` - Run test suites
- `flutter_clean` - Clean build artifacts
- `flutter_pub_get` - Install dependencies
- `android_install_apk` - Install APK on device

### **🛠️ Utilities (4)**
- `android_logcat` - Real-time debug logs
- `android_screenshot` - Capture Android screenshots
- `ios_boot_simulator` - Boot iOS simulator
- `ios_take_screenshot` - Capture iOS screenshots

### **🚀 Super-Tools (10)**
- `flutter_dev_session` - Complete development session workflow
- `flutter_test_suite` - Full test suite execution
- `flutter_release_build` - Multi-platform release pipeline
- `mobile_device_manager` - Smart device management
- `flutter_performance_profile` - Performance profiling with DevTools
- `flutter_deploy_pipeline` - Complete deployment workflow
- `flutter_fix_common_issues` - Auto-remediation of common issues
- `android_full_debug` - Complete Android debugging toolkit
- `ios_simulator_manager` - Smart iOS simulator management
- `flutter_inspector_session` - Widget inspector session

### **⚙️ Setup & Configuration (2)**
- `flutter_setup_environment` - Automated Flutter SDK setup
- `android_sdk_setup` - Android SDK installation and configuration

---

## 📚 Complete Documentation

| Guide | Description |
|-------|-------------|
| **[📋 Tools Reference](./TOOLS.md)** | Complete tool documentation |
| **[🚀 Quick Start](./QUICK_START.md)** | Fast setup guide |
| **[🔧 Troubleshooting](./TROUBLESHOOTING.md)** | Common issues & solutions |
| **[📖 API Reference](./API.md)** | Technical API documentation |
| **[🤝 Contributing](./CONTRIBUTING.md)** | How to contribute |

### **Platform Setup Guides**
- **[🤖 Android Setup](./setup/android.md)** - Android SDK configuration
- **[🍎 iOS Setup](./setup/ios.md)** - Xcode and iOS simulators  
- **[💙 Flutter Setup](./setup/flutter.md)** - Flutter SDK installation

### **Usage Examples**
- **[Claude Desktop](./examples/claude-desktop.md)** - Integration guide
- **[Flutter Workflow](./examples/flutter-workflow.md)** - Development examples
- **[Fallback System](./examples/fallback-usage.md)** - Tool alternatives

---

## 🚨 What's New in v2.3.0

- **Expanded**: 36 comprehensive tools across all categories
- **Super-Tools**: 10 intelligent workflow automation tools
- **Setup Tools**: Automated environment configuration
- **Enhanced**: Improved device management and debugging
- **Stable**: Production-ready with comprehensive testing

### **Key Features**
- Complete development workflow automation
- Smart device selection and management
- Multi-platform build and deployment
- Auto-remediation of common issues
- Performance profiling and debugging

---

## ⚡ Quick Health Check

```bash
# Validate installation
npm run mcp:validate

# Check tool availability
# Use health_check tool in Claude Desktop
```

---

## 🆘 Need Help?

1. **Check [Troubleshooting](./TROUBLESHOOTING.md)** for common issues
2. **Review [Examples](./examples/)** for usage patterns
3. **Report issues** on [GitHub](https://github.com/cristianoaredes/mcp-mobile-server/issues)

---

## 📊 Project Status

**Version:** 2.3.0 | **Status:** ✅ Production Ready | **Tools:** 36 | **Platforms:** Android, iOS, Flutter

*Comprehensive tooling for professional mobile development*