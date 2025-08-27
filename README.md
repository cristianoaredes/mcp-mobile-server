# 📱 MCP Mobile Server

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@cristianoaredes/mcp-mobile-server.svg?style=for-the-badge)](https://www.npmjs.com/package/@cristianoaredes/mcp-mobile-server)
[![WIP Status](https://img.shields.io/badge/Status-Work_in_Progress-orange?style=for-the-badge&logo=construction)](https://github.com/cristianoaredes/mcp-mobile-server/issues)
[![MCP](https://img.shields.io/badge/MCP-Native_Server-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAzLTEuOSA3aDQuMnptMCAwdjE4bDggNS4yLTEyIDEuOXoiLz48L3N2Zz4=)](https://modelcontextprotocol.io)

**Native MCP Server for Mobile Development**

A powerful **Model Context Protocol (MCP) Server** with **34 tools** including **10 intelligent super-tools** that combine multiple operations into complete workflows for Android, iOS, and Flutter development.

> **⚠️ Work in Progress**  
> This project is under active development. Use with caution and report issues.

</div>
---

## 📚 Complete Documentation

All documentation has been organized in the [`/docs`](./docs/) directory:

| Guide | Description |
|-------|-------------|
| **[🚀 Quick Start](./docs/QUICK_START.md)** | Get up and running in under 5 minutes |
| **[📋 Tools Reference](./docs/TOOLS.md)** | Complete documentation for all 34 tools |
| **[🔧 Troubleshooting](./docs/TROUBLESHOOTING.md)** | Common issues and solutions |
| **[📖 API Reference](./docs/API.md)** | Technical API documentation |
| **[🤝 Contributing](./docs/CONTRIBUTING.md)** | How to contribute to the project |

### Platform Setup Guides
- **[🤖 Android Setup](./docs/setup/android.md)** - Android SDK configuration
- **[🍎 iOS Setup](./docs/setup/ios.md)** - Xcode and iOS simulators  
- **[💙 Flutter Setup](./docs/setup/flutter.md)** - Flutter SDK installation

### Usage Examples
- **[Claude Desktop Integration](./docs/examples/claude-desktop.md)** - Complete integration guide
- **[Flutter Development Workflow](./docs/examples/flutter-workflow.md)** - Real-world examples

---

## ⚡ Quick Start

**Install and run with NPX:**
```bash
npx @cristianoaredes/mcp-mobile-server
```

**Claude Desktop integration:**
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

**Verify installation:**
```
Use the health_check tool to verify server status
```

➡️ **[Complete setup guide](./docs/QUICK_START.md)**

---

## 🛠️ Tools Overview (34 Total)

### 🔧 Core Tools (5)
- `health_check` - Server diagnostics and tool availability
- `flutter_doctor` - Flutter environment check
- `flutter_version` - Flutter SDK version info
- `flutter_list_devices` - Connected devices detection
- `android_list_devices` - Android devices and emulators

### 📱 Device & Emulator Management (9) 
- `native_run_list_devices` - Cross-platform device listing
- `native_run_install_app` - Universal app installer
- `ios_list_simulators` - iOS simulators management
- `android_list_emulators` - Android AVD management
- `android_create_avd` - Create Android Virtual Devices
- `android_start_emulator` - Start Android emulator
- `android_stop_emulator` - Stop Android emulator
- `ios_shutdown_simulator` - Shutdown iOS simulator
- `flutter_launch_emulator` - Launch Flutter emulator

### ⚡ Development Workflow (6)
- `flutter_run` - Hot reload development server
- `flutter_build` - Production builds
- `flutter_test` - Test execution with coverage
- `flutter_clean` - Project cleanup
- `flutter_pub_get` - Dependency management
- `android_install_apk` - Android app installation

### 🛠️ Utilities (4)
- `android_logcat` - Real-time debug logs
- `android_screenshot` - Device screenshot capture
- `ios_boot_simulator` - iOS simulator startup
- `ios_take_screenshot` - iOS screenshot capture

### 🚀 Super Tools - Intelligent Workflows (10) 
- `flutter_dev_session` - Complete dev setup with auto device selection
- `flutter_test_suite` - Run all tests with coverage reports
- `flutter_release_build` - Multi-platform release builds
- `mobile_device_manager` - Smart device management & recommendations
- `flutter_performance_profile` - DevTools profiling session
- `flutter_deploy_pipeline` - Complete deployment workflow
- `flutter_fix_common_issues` - Auto-fix common problems
- `android_full_debug` - Complete Android debugging session
- `ios_simulator_manager` - Smart iOS simulator management
- `flutter_inspector_session` - Widget inspector with debugging

➡️ **[Complete tools documentation](./docs/TOOLS.md)**

## 🚨 What's New in v2.0

- **Streamlined**: Reduced from 54 to 19 essential tools
- **Reliable**: Focus on stable, tested functionality
- **Organized**: Complete documentation restructure
- **Essential-only**: Removed experimental features

### Breaking Changes
- Removed 35 less essential tools
- Simplified tool categories (Essential only)
- New documentation structure in `/docs`
- Updated fallback system

---

## 🆘 Need Help?

1. **Check [📋 Documentation](./docs/)** for comprehensive guides
2. **Review [🔧 Troubleshooting](./docs/TROUBLESHOOTING.md)** for common issues  
3. **Report issues** on [GitHub](https://github.com/cristianoaredes/mcp-mobile-server/issues)

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details.

---

<div align="center">

**🚀 Ready to streamline your mobile development?**

[⭐ Star this repo](https://github.com/cristianoaredes/mcp-mobile-server) • [🐛 Report bug](https://github.com/cristianoaredes/mcp-mobile-server/issues) • [💡 Request feature](https://github.com/cristianoaredes/mcp-mobile-server/discussions)

---

**Version:** 2.0.0 | **Status:** 🚧 WIP | **Tools:** 19 | **Platforms:** Android, iOS, Flutter

*Streamlined for reliability and ease of use*

</div>