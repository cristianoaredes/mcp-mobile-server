# 📱 MCP Mobile Server Documentation

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@cristianoaredes/mcp-mobile-server.svg?style=for-the-badge)](https://www.npmjs.com/package/@cristianoaredes/mcp-mobile-server)
[![WIP Status](https://img.shields.io/badge/Status-Work_in_Progress-orange?style=for-the-badge&logo=construction)](https://github.com/cristianoaredes/mcp-mobile-server/issues)
[![MCP](https://img.shields.io/badge/MCP-Native_Server-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAzLTEuOSA3aDQuMnptMCAwdjE4bDggNS4yLTEyIDEuOXoiLz48L3N2Zz4=)](https://modelcontextprotocol.io)

**Native MCP Server for Mobile Development**

A streamlined **Model Context Protocol (MCP) Server** with **19 essential tools** for Android, iOS, and Flutter development.

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

## 📋 Essential Tools (19 Total)

### **🔧 Core Tools (5)**
- `health_check` - Server diagnostics
- `flutter_doctor` - Flutter environment check
- `flutter_version` - Flutter SDK version
- `flutter_list_devices` - Connected devices
- `android_list_devices` - Android devices

### **📱 Device Management (4)**
- `native_run_list_devices` - Cross-platform device list
- `native_run_install_app` - Universal app installer
- `ios_list_simulators` - iOS simulators
- `android_list_emulators` - Android emulators

### **⚡ Development Workflow (6)**
- `flutter_run` - Hot reload development
- `flutter_build` - Release builds
- `flutter_test` - Run tests
- `flutter_clean` - Clean projects
- `flutter_pub_get` - Dependencies
- `android_install_apk` - Install Android apps

### **🛠️ Utilities (4)**
- `android_logcat` - Debug logs
- `android_screenshot` - Android screenshots
- `ios_boot_simulator` - Start iOS simulator
- `ios_take_screenshot` - iOS screenshots

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

## 🚨 What's New in v2.0

- **Streamlined**: Reduced from 54 to 19 essential tools
- **Reliable**: Focus on stable, tested functionality
- **Organized**: Clean documentation structure
- **Essential-only**: Removed experimental/risky features

### **Breaking Changes**
- Removed 35 less essential tools
- Simplified tool categories (Essential only)
- New documentation structure
- Updated fallback system

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

**Version:** 2.0.0 | **Status:** 🚧 WIP | **Tools:** 19 | **Platforms:** Android, iOS, Flutter

*Streamlined for reliability and ease of use*