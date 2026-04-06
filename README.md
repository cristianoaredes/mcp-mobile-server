# MCP Mobile Server — AI-Powered Mobile Development for Android, iOS, and Flutter

<div align="center">

<a href="https://www.npmjs.com/package/@cristianoaredes/mcp-mobile-server"><img src="https://img.shields.io/npm/v/@cristianoaredes/mcp-mobile-server.svg?style=flat-square&label=npm&color=CB3837" alt="NPM Version"></a>
<a href="https://github.com/cristianoaredes/mcp-mobile-server/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
<a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-green.svg?style=flat-square" alt="MCP Compatible"></a>
<img src="https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Flutter-orange.svg?style=flat-square" alt="Platforms: Android | iOS | Flutter">
<img src="https://img.shields.io/badge/tools-36-brightgreen.svg?style=flat-square" alt="36 Tools">
<img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square" alt="Node.js 18+">

**36 tools for mobile development automation, ready to use inside Claude Desktop and any MCP-compatible AI client.**

by [Cristiano Arêdes](https://github.com/cristianoaredes)

</div>

---

## What is this?

MCP Mobile Server is a [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI assistants direct, structured access to your mobile development toolchain. It bridges Claude Desktop (and other MCP clients) to Flutter, Android SDK, and iOS/Xcode workflows through 36 typed tools and 10 high-level "super-tools" that orchestrate complete multi-step workflows.

Instead of switching between terminals and docs, you describe what you want in natural language and the server executes the right commands — with validation, error handling, and fallback strategies built in.

**Supported platforms:** Android · iOS · Flutter · macOS · Linux · Windows (partial)

---

## Features

| Category | Tools | What you can do |
|---|---|---|
| **Core / Health** | 5 | Environment diagnostics, Flutter doctor, device discovery |
| **Device Management** | 9 | List, create, start, and stop Android emulators and iOS simulators |
| **Flutter Development** | 6 | Hot reload sessions, builds, tests, dependency management |
| **Utilities** | 4 | Logcat, screenshots, simulator boot/shutdown |
| **Setup & Configuration** | 2 | Automated Flutter and Android SDK environment setup |
| **Super-Tools (workflows)** | 10 | Complete end-to-end workflows combining multiple atomic tools |

### Super-Tools — complete workflows in one call

| Tool | What it does |
|---|---|
| `flutter_dev_session` | Selects best available device, runs doctor, starts hot reload — one command |
| `flutter_test_suite` | Unit + widget + integration tests with coverage reporting |
| `flutter_release_build` | Multi-platform release builds (APK, App Bundle, IPA) |
| `flutter_deploy_pipeline` | End-to-end: test → build → sign |
| `flutter_fix_common_issues` | Diagnoses and auto-fixes common Flutter build errors |
| `flutter_inspector_session` | Widget inspection session |
| `mobile_device_manager` | Intelligent device orchestration across platforms |
| `android_full_debug` | Device selection → APK install → launch → logcat in one step |
| `android_emulator_workflow` | AVD create → start → wait → ready |
| `ios_simulator_manager` | Boot → wait → ready → screenshot lifecycle management |

### Security built in

- All shell commands are validated against an allowlist before execution
- Dangerous pattern detection blocks injection attempts
- Path traversal protection on all file arguments
- Runtime input validation via [Zod](https://zod.dev)
- Configurable timeouts on long-running processes

---

## Requirements

| Requirement | Version |
|---|---|
| Node.js | 18.0.0 or later |
| npm or yarn | any recent version |
| Flutter SDK | 3.0+ (for Flutter tools) |
| Android SDK / Android Studio | any recent (for Android tools) |
| Xcode | 14+ on macOS (for iOS tools) |

You only need the SDKs for the platforms you work on. The server starts and serves tools even when some SDKs are absent.

---

## Installation

### Option 1 — Run with npx (no install needed)

```bash
npx @cristianoaredes/mcp-mobile-server
```

### Option 2 — Install globally

```bash
npm install -g @cristianoaredes/mcp-mobile-server
mcp-mobile-server
```

### Option 3 — Build from source

```bash
git clone https://github.com/cristianoaredes/mcp-mobile-server.git
cd mcp-mobile-server
npm install
npm run build
npm start
```

---

## Claude Desktop Setup

Add the server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

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

Restart Claude Desktop after saving. The 36 mobile development tools will appear automatically.

---

## Usage Examples

### Check your environment

```
Use the health_check tool to verify the mobile development server is working
```

```
Run flutter_doctor to check my Flutter setup
```

### Work with devices

```
List all connected Android devices and iOS simulators
```

```
Start a Flutter development session with hot reload on the best available device
```

### Build and test

```
Run the full test suite for my Flutter project at /path/to/project
```

```
Build release versions for Android and iOS
```

### Fix build problems

```
My Flutter app won't build. Use flutter_fix_common_issues to diagnose and fix it.
```

### Validate the installation from the command line

```bash
# After building from source:
npm run mcp:validate

# Expected output:
# ✅ Server configuration is valid
# ✅ 36 tools registered
```

---

## Project Structure

```
src/
  server.ts          # MCP server entry point
  tools/
    android.ts       # Android SDK tools
    ios.ts           # iOS / Xcode / Simulator tools
    flutter.ts       # Flutter SDK tools
    super-tools.ts   # High-level workflow automation
    setup-tools.ts   # Environment setup tools
  utils/
    process.ts       # Process execution and tracking
    security.ts      # Command validation and sandboxing
    fallbacks.ts     # Fallback strategies (ADB → native-run, etc.)
    tool-categories.ts # Tool registry
```

The server communicates over stdio using JSON-RPC 2.0, the standard MCP transport.

---

## Contributing

```bash
# Clone and install
git clone https://github.com/cristianoaredes/mcp-mobile-server.git
cd mcp-mobile-server
npm install

# Run in development mode (watch)
npm run dev

# Run tests
npm test

# Run linter and full CI check
npm run ci
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines and [docs/](./docs/) for the full documentation set.

---

## Documentation

| Resource | Description |
|---|---|
| [Quick Start Guide](./docs/QUICK_START.md) | Get running in under 5 minutes |
| [Tools Reference](./docs/TOOLS.md) | All 36 tools with parameters and examples |
| [Architecture](./docs/ARCHITECTURE.md) | System design, security layer, and ADRs |
| [Android Workflow](./docs/examples/android-workflow.md) | Android development guide |
| [iOS Workflow](./docs/examples/ios-workflow.md) | iOS development guide |
| [Flutter Workflow](./docs/examples/flutter-workflow.md) | Flutter development guide |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |

---

## Troubleshooting

**Flutter not found**
```bash
# Run the automated setup tool
# In Claude Desktop: "Use flutter_setup_environment to install Flutter"
```

**Android SDK not configured**
```bash
# In Claude Desktop: "Use android_sdk_setup to configure Android"
```

**No devices available**
```bash
# List what's available
# "Use android_list_emulators and ios_list_simulators to see available devices"

# Or start a new one
# "Use android_start_emulator to launch an Android emulator"
```

**Claude Desktop not recognizing the server**
1. Verify the config file path is correct for your OS
2. Check the JSON is valid (no trailing commas)
3. Restart Claude Desktop completely
4. Ask Claude: "Use health_check to verify the mobile server"

---

## License

[MIT](./LICENSE) — free to use, modify, and distribute.

---

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/cristianoaredes/mcp-mobile-server?style=social)](https://github.com/cristianoaredes/mcp-mobile-server)

[Report a Bug](https://github.com/cristianoaredes/mcp-mobile-server/issues) · [Request a Feature](https://github.com/cristianoaredes/mcp-mobile-server/discussions) · [Full Documentation](./docs/)

</div>
