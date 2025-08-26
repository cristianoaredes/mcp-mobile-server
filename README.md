# 📱 MCP Mobile Server

<div align="center">

[![MCP](https://img.shields.io/badge/MCP-Native_Server-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAzLTEuOSA3aDQuMnptMCAwdjE4bDggNS4yLTEyIDEuOXoiLz48L3N2Zz4=)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**Native MCP Server for Mobile Development**

*Complete automation toolkit for Android, iOS, and Flutter development through the Model Context Protocol*

[🚀 Quick Start](#-quick-start) • [📋 Tools](#-available-tools) • [🔧 IDE Setup](#-ide-integrations) • [📖 API Docs](#-api-reference) • [🛡️ Security](#-security)

</div>

---

## 🌟 **Overview**

The **MCP Mobile Server** is a comprehensive native Model Context Protocol server that provides **37 specialized tools** for mobile development automation. Built with TypeScript and designed for seamless integration with AI-powered development environments.

### ✨ **Key Features**

- **🤖 Android Development**: Complete SDK management, AVD control, emulator automation, and ADB operations
- **🍎 iOS Development**: Simulator management, Xcode integration, build automation, and testing tools  
- **💙 Flutter Development**: Full lifecycle support from doctor checks to deployment
- **🛡️ Enterprise Security**: Multi-layer security with command allowlisting and input sanitization
- **⚡ High Performance**: Async operations with proper process management and cleanup
- **🔌 Native MCP**: Official Model Context Protocol implementation with stdio transport

<details>
<summary><b>📊 Detailed Statistics</b></summary>

| Category | Tools Count | Key Features |
|----------|-------------|--------------|
| **Android** | 13 tools | SDK, AVD, Emulators, ADB, Logcat |
| **iOS** | 10 tools | Simulators, Xcode, Screenshots, Video |
| **Flutter** | 13 tools | Doctor, Build, Run, Test, Pub |
| **Health** | 1 tool | Status monitoring and diagnostics |
| **Total** | **37 tools** | Complete mobile development lifecycle |

</details>

---

## 🚀 **Quick Start**

### **Prerequisites**

<details>
<summary><b>📋 System Requirements</b></summary>

- **Node.js** 18.0.0 or higher
- **TypeScript** 5.3+ (dev dependency)
- **Git** for cloning the repository

**Platform-specific requirements:**
- **Android**: Android SDK, Java JDK 17+
- **iOS**: macOS with Xcode (iOS development requires macOS)
- **Flutter**: Flutter SDK in PATH

</details>

### **1. Installation**

```bash
# Clone the repository
git clone https://github.com/cristianoaredes/mcp-mobile-server.git
cd mcp-mobile-server

# Install dependencies
npm install

# Build the project
npm run build

# Validate installation
npm run mcp:validate
```

### **2. Environment Setup** 

<details>
<summary><b>🌍 Environment Variables (Optional)</b></summary>

Create a `.env` file in the project root:

```bash
# Android Development (auto-detected if not specified)
ANDROID_SDK_ROOT=/Users/you/Library/Android/sdk
ANDROID_HOME=/Users/you/Library/Android/sdk

# Flutter Development
FLUTTER_HOME=/Users/you/flutter

# Java Development  
JAVA_HOME=/Users/you/.sdkman/candidates/java/current

# Optional: Logging level
LOG_LEVEL=info
```

The server automatically detects tool paths if environment variables are not set.

</details>

### **3. Verify Installation**

```bash
# Run validation to ensure all tools are properly configured
npm run mcp:validate

# Expected output:
✅ Server configuration is valid
✅ 37 tools registered
📋 Available tools: android_list_devices, flutter_doctor, ios_list_simulators...
```

---

## 🔧 **IDE Integrations**

### **Claude Desktop** (Recommended)

<details>
<summary><b>🎯 Complete Claude Desktop Setup</b></summary>

1. **Locate your Claude Desktop config file:**
   ```bash
   # macOS
   ~/Library/Application Support/Claude/claude_desktop_config.json
   
   # Windows  
   %APPDATA%/Claude/claude_desktop_config.json
   
   # Linux
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Add MCP server configuration:**
   ```json
   {
     "mcpServers": {
       "mobile-dev": {
         "command": "node",
         "args": ["./dist/server.js"],
         "cwd": "/absolute/path/to/mcp-mobile-server",
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** and verify tools are available by using:
   ```
   Use the health_check tool to verify server status
   ```

</details>

### **Visual Studio Code**

<details>
<summary><b>⚙️ VS Code Configuration</b></summary>

1. **Install recommended extensions:**
   ```json
   // .vscode/extensions.json
   {
     "recommendations": [
       "ms-vscode.vscode-typescript-next",
       "bradlc.vscode-tailwindcss",
       "esbenp.prettier-vscode",
       "ms-vscode.vscode-json"
     ]
   }
   ```

2. **Add workspace tasks:**
   ```json
   // .vscode/tasks.json
   {
     "version": "2.0.0",
     "tasks": [
       {
         "label": "MCP Mobile: Validate",
         "type": "shell",
         "command": "npm run mcp:validate",
         "group": "build",
         "presentation": {
           "echo": true,
           "reveal": "always"
         }
       },
       {
         "label": "Flutter Doctor",
         "type": "shell", 
         "command": "flutter doctor",
         "group": "test"
       },
       {
         "label": "Android List Devices",
         "type": "shell",
         "command": "adb devices",
         "group": "test"
       }
     ]
   }
   ```

3. **Launch configuration for debugging:**
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug MCP Server",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/dist/server.js",
         "args": ["validate"],
         "console": "integratedTerminal",
         "internalConsoleOptions": "neverOpen"
       }
     ]
   }
   ```

</details>

### **JetBrains IDEs** (WebStorm, IntelliJ IDEA)

<details>
<summary><b>🧠 JetBrains Setup</b></summary>

1. **Create run configuration:**
   - Go to `Run > Edit Configurations`
   - Add new `Node.js` configuration
   - **Name**: MCP Mobile Server Validate
   - **Node interpreter**: Project node
   - **Working directory**: Project root  
   - **JavaScript file**: `dist/server.js`
   - **Application parameters**: `validate`

2. **Add external tools:**
   - `File > Settings > Tools > External Tools > Add`
   - **Name**: Flutter Doctor
   - **Program**: `flutter`
   - **Arguments**: `doctor`
   - **Working directory**: `$ProjectFileDir$`

3. **Code style configuration:**
   ```json
   // .idea/codeStyles/Project.xml
   <component name="ProjectCodeStyleConfiguration">
     <code_scheme name="Project">
       <TypeScriptCodeStyleSettings>
         <option name="FORCE_SEMICOLON_STYLE" value="true" />
         <option name="USE_DOUBLE_QUOTES" value="false" />
       </TypeScriptCodeStyleSettings>
     </code_scheme>
   </component>
   ```

</details>

### **Neovim** (Advanced)

<details>
<summary><b>⚡ Neovim + LSP Configuration</b></summary>

1. **LSP configuration (Lua):**
   ```lua
   -- ~/.config/nvim/lua/lsp/typescript.lua
   local lspconfig = require('lspconfig')
   
   lspconfig.tsserver.setup({
     root_dir = function(fname)
       return lspconfig.util.root_pattern('tsconfig.json')(fname) or
              lspconfig.util.root_pattern('.git')(fname)
     end,
     settings = {
       typescript = {
         preferences = {
           noSemicolons = false,
         }
       }
     }
   })
   ```

2. **Custom commands:**
   ```lua
   -- ~/.config/nvim/lua/commands/mcp.lua
   vim.api.nvim_create_user_command('McpValidate', function()
     vim.cmd('!npm run mcp:validate')
   end, {})
   
   vim.api.nvim_create_user_command('FlutterDoctor', function()
     vim.cmd('!flutter doctor')
   end, {})
   ```

3. **Keybindings:**
   ```lua
   -- ~/.config/nvim/lua/keymaps.lua  
   vim.keymap.set('n', '<leader>mv', ':McpValidate<CR>', { desc = 'MCP Validate' })
   vim.keymap.set('n', '<leader>fd', ':FlutterDoctor<CR>', { desc = 'Flutter Doctor' })
   ```

</details>

### **Cursor IDE**

<details>
<summary><b>🎯 Cursor Configuration</b></summary>

1. **Settings configuration:**
   ```json
   // .cursor/settings.json
   {
     "typescript.preferences.noSemicolons": false,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "mcp.servers": [
       {
         "name": "mobile-dev", 
         "command": "node",
         "args": ["./dist/server.js"],
         "cwd": ".",
         "env": {
           "NODE_ENV": "production"
         }
       }
     ]
   }
   ```

2. **Custom prompts for mobile development:**
   ```markdown
   // .cursor/prompts/mobile.md
   # Mobile Development Context
   
   This project uses MCP Mobile Server for mobile development automation.
   
   Available tools:
   - android_* tools for Android development  
   - ios_* tools for iOS development
   - flutter_* tools for Flutter development
   
   Always use appropriate tools for mobile development tasks.
   ```

</details>

### **Continue/Cline** (VS Code Extension)

<details>
<summary><b>🔄 Continue/Cline Setup</b></summary>

1. **Configuration file:**
   ```json
   // ~/.continue/config.json
   {
     "models": [
       {
         "title": "Claude 3.5 Sonnet",
         "provider": "anthropic",
         "model": "claude-3-5-sonnet-20241022",
         "apiKey": "your-api-key"
       }
     ],
     "mcpServers": [
       {
         "name": "mobile-dev",
         "command": "node", 
         "args": ["./dist/server.js"],
         "cwd": "/path/to/mcp-mobile-server"
       }
     ]
   }
   ```

2. **Custom commands:**
   ```json
   {
     "customCommands": [
       {
         "name": "Mobile Dev Status", 
         "prompt": "Use the health_check tool to show mobile development environment status"
       },
       {
         "name": "Flutter Setup Check",
         "prompt": "Use flutter_doctor to check Flutter development setup"
       }
     ]
   }
   ```

</details>

### **Windsurf IDE**

<details>
<summary><b>🌊 Windsurf Configuration</b></summary>

1. **MCP Server Configuration:**
   ```json
   // ~/.windsurf/config.json or workspace settings
   {
     "mcp": {
       "servers": [
         {
           "name": "mobile-dev",
           "command": "node",
           "args": ["./dist/server.js"],
           "cwd": "/absolute/path/to/mcp-mobile-server",
           "env": {
             "NODE_ENV": "production",
             "LOG_LEVEL": "info"
           },
           "description": "Mobile development automation tools for Android, iOS, and Flutter"
         }
       ]
     }
   }
   ```

2. **Workspace settings for mobile development:**
   ```json
   // .windsurf/workspace.json
   {
     "name": "Mobile Development Workspace",
     "tools": {
       "mobile-dev": {
         "enabled": true,
         "autoLoad": true,
         "favoriteTools": [
           "health_check",
           "flutter_doctor", 
           "android_list_devices",
           "ios_list_simulators"
         ]
       }
     },
     "shortcuts": {
       "ctrl+shift+m": "mobile-dev.health_check",
       "ctrl+shift+f": "mobile-dev.flutter_doctor",
       "ctrl+shift+a": "mobile-dev.android_list_devices"
     }
   }
   ```

3. **Custom AI prompts for Windsurf:**
   ```markdown
   # Mobile Development Context for Windsurf
   
   ## Available MCP Tools:
   - Use `health_check` to verify mobile development environment
   - Use `flutter_doctor` for comprehensive Flutter setup diagnostics
   - Use `android_list_devices` to check connected Android devices
   - Use `ios_list_simulators` to see available iOS simulators
   - Use `flutter_run` to start development sessions with hot reload
   
   ## Development Workflows:
   Always check environment health before starting development tasks.
   Use appropriate platform-specific tools for Android, iOS, or Flutter development.
   ```

4. **Project templates integration:**
   ```json
   // .windsurf/templates/mobile.json
   {
     "name": "Mobile Development Project",
     "description": "Template with MCP Mobile Server integration",
     "mcpTools": ["mobile-dev"],
     "setupCommands": [
       "health_check",
       "flutter_doctor"
     ],
     "developmentFlow": [
       "flutter_list_devices",
       "flutter_run"
     ]
   }
   ```

</details>

### **Trae.ai**

<details>
<summary><b>🤖 Trae.ai Integration</b></summary>

1. **Trae configuration file:**
   ```yaml
   # ~/.trae/config.yaml
   mcp_servers:
     mobile-dev:
       command: node
       args: ["./dist/server.js"]
       working_directory: "/absolute/path/to/mcp-mobile-server"
       environment:
         NODE_ENV: production
         LOG_LEVEL: info
       description: "Comprehensive mobile development automation"
       categories:
         - mobile
         - android
         - ios
         - flutter
   
   ai_context:
     mobile_development:
       tools:
         - mobile-dev.*
       context: |
         Available mobile development tools for Android, iOS, and Flutter.
         Always verify environment setup before development tasks.
   ```

2. **Custom workflows for Trae:**
   ```yaml
   # ~/.trae/workflows/mobile.yaml
   workflows:
     mobile_setup:
       name: "Mobile Development Setup"
       description: "Complete mobile development environment check"
       steps:
         - tool: mobile-dev.health_check
           description: "Check server and tool availability"
         - tool: mobile-dev.flutter_doctor
           description: "Verify Flutter development setup"
         - tool: mobile-dev.android_list_devices
           description: "List connected Android devices"
   
     flutter_dev_session:
       name: "Start Flutter Development"
       description: "Initialize Flutter development session"
       steps:
         - tool: mobile-dev.flutter_list_devices
         - tool: mobile-dev.flutter_pub_get
           args:
             cwd: "${PROJECT_ROOT}"
         - tool: mobile-dev.flutter_run
           args:
             cwd: "${PROJECT_ROOT}"
             deviceId: "chrome"
   
     android_testing:
       name: "Android Testing Workflow"  
       description: "Complete Android testing pipeline"
       steps:
         - tool: mobile-dev.android_list_devices
         - tool: mobile-dev.android_start_emulator
           args:
             avdName: "TestDevice"
         - tool: mobile-dev.android_install_apk
           args:
             apkPath: "./app/build/outputs/apk/debug/app-debug.apk"
   ```

3. **Trae AI agent configuration:**
   ```json
   // ~/.trae/agents/mobile_expert.json
   {
     "name": "Mobile Development Expert",
     "description": "Specialized agent for mobile development tasks",
     "tools": ["mobile-dev.*"],
     "expertise": [
       "Android development and debugging",
       "iOS simulation and testing", 
       "Flutter cross-platform development",
       "Mobile CI/CD automation"
     ],
     "context_prompts": {
       "android": "Focus on Android-specific tools and best practices. Always check device connectivity before operations.",
       "ios": "Use iOS simulator tools effectively. Remember iOS development requires macOS.",
       "flutter": "Leverage Flutter's cross-platform capabilities. Always run flutter_doctor first."
     },
     "default_workflow": "mobile_setup"
   }
   ```

4. **Project integration:**
   ```toml
   # .trae/project.toml
   [project]
   name = "Mobile App Development"
   type = "mobile"
   
   [mcp]
   servers = ["mobile-dev"]
   auto_load = true
   
   [shortcuts]
   health = "mobile-dev.health_check"
   flutter_check = "mobile-dev.flutter_doctor"  
   devices = "mobile-dev.flutter_list_devices"
   run_android = "mobile-dev.android_list_devices && mobile-dev.flutter_run --device android"
   run_ios = "mobile-dev.ios_list_simulators && mobile-dev.flutter_run --device ios"
   
   [development]
   primary_platform = "flutter"
   test_devices = ["android", "ios", "web"]
   ```

5. **Environment-specific configs:**
   ```bash
   # .trae/.env.mobile
   # Mobile development environment variables for Trae.ai
   
   ANDROID_SDK_ROOT=/Users/$USER/Library/Android/sdk
   FLUTTER_ROOT=/Users/$USER/flutter
   JAVA_HOME=/Users/$USER/.sdkman/candidates/java/current
   
   # Trae-specific settings
   TRAE_MCP_TIMEOUT=300
   TRAE_MOBILE_AUTO_SETUP=true
   TRAE_LOG_MOBILE_OPERATIONS=true
   ```

</details>

---

## 📋 **Available Tools**

### 🤖 **Android Tools** (13 tools)

<details>
<summary><b>Expand Android Tools Details</b></summary>

#### **SDK Management**
- **`android_sdk_list_packages`** - List available and installed SDK packages
  ```json
  // Input: None required
  // Output: Lists all available SDK packages with installation status
  ```

- **`android_sdk_install_packages`** - Install specific SDK packages
  ```json
  // Input: { "packages": ["platforms;android-34", "build-tools;34.0.0"] }
  // Output: Installation progress and results
  ```

#### **AVD (Android Virtual Device) Management**  
- **`android_list_avds`** - List all created AVDs
- **`android_create_avd`** - Create new AVD with specified configuration
- **`android_delete_avd`** - Remove existing AVD

#### **Emulator Control**
- **`android_list_emulators`** - List available emulators with status
- **`android_start_emulator`** - Start emulator with options
- **`android_stop_emulator`** - Stop running emulator

#### **ADB Operations**
- **`android_list_devices`** - List connected devices and emulators
- **`android_install_apk`** - Install APK to device/emulator
- **`android_uninstall_package`** - Uninstall app from device
- **`android_shell_command`** - Execute shell commands on device
- **`android_logcat`** - Capture and filter device logs

</details>

### 🍎 **iOS Tools** (10 tools)

<details>
<summary><b>Expand iOS Tools Details</b></summary>

#### **Simulator Management**
- **`ios_list_simulators`** - List all available iOS simulators
- **`ios_boot_simulator`** - Boot specific simulator by UDID
- **`ios_shutdown_simulator`** - Shutdown running simulator
- **`ios_erase_simulator`** - Erase all data from simulator

#### **Simulator Utilities**
- **`ios_open_url`** - Open URL in simulator Safari
- **`ios_take_screenshot`** - Capture simulator screenshot
- **`ios_record_video`** - Record simulator video

#### **Xcode Integration**
- **`ios_list_schemes`** - List available Xcode schemes
- **`ios_build_project`** - Build Xcode project/workspace
- **`ios_run_tests`** - Execute Xcode test suites

</details>

### 💙 **Flutter Tools** (13 tools)

<details>
<summary><b>Expand Flutter Tools Details</b></summary>

#### **Environment & Setup**
- **`flutter_doctor`** - Comprehensive environment check
- **`flutter_version`** - Flutter SDK version information

#### **Device Management**
- **`flutter_list_devices`** - List connected devices and emulators
- **`flutter_list_emulators`** - List available emulators
- **`flutter_launch_emulator`** - Launch specific emulator

#### **Development Workflow**
- **`flutter_run`** - Start development session with hot reload
- **`flutter_stop_session`** - Stop active development session  
- **`flutter_list_sessions`** - List running Flutter sessions
- **`flutter_build`** - Build app for production
- **`flutter_test`** - Run unit/widget/integration tests
- **`flutter_clean`** - Clean build cache and artifacts

#### **Package Management**
- **`flutter_pub_get`** - Install/update dependencies
- **`flutter_screenshot`** - Capture device screenshot

</details>

### ❤️ **Health & Diagnostics** (1 tool)

- **`health_check`** - Complete server and environment status check

---

## 📖 **API Reference**

### **Tool Response Format**

All tools return responses in a standardized format:

```typescript
interface ToolResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  executionTime: number;
}
```

### **Common Input Schemas**

<details>
<summary><b>📋 Detailed Schemas</b></summary>

#### **Android AVD Creation**
```json
{
  "name": "Pixel7_API34",
  "systemImageId": "system-images;android-34;google_apis;x86_64", 
  "sdcard": "1024M",
  "device": "pixel_7"
}
```

#### **iOS Simulator Boot**
```json
{
  "udid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

#### **Flutter Run Configuration**
```json
{
  "cwd": "/path/to/flutter/project",
  "deviceId": "chrome",
  "target": "lib/main.dart",
  "flavor": "development", 
  "buildMode": "debug"
}
```

</details>

### **Error Codes**

| Code | Description | Resolution |
|------|-------------|------------|
| `TOOL_NOT_FOUND` | MCP tool not available | Check tool name spelling |
| `VALIDATION_ERROR` | Invalid input parameters | Review input schema |
| `COMMAND_BLOCKED` | Security policy violation | Use allowed commands only |
| `EXECUTION_TIMEOUT` | Operation exceeded time limit | Retry or check system resources |
| `PROCESS_ERROR` | External command failed | Check tool installation |

---

## 🛡️ **Security**

### **Multi-Layer Security Architecture**

<details>
<summary><b>🔒 Security Controls Details</b></summary>

#### **1. Command Allowlisting**
Only predetermined safe commands are permitted:
```typescript
const ALLOWED_COMMANDS = [
  'adb', 'flutter', 'xcrun', 'xcodebuild', 
  'sdkmanager', 'avdmanager', 'emulator'
];
```

#### **2. Input Sanitization**
Dangerous patterns are blocked via regex:
```typescript
const DANGEROUS_PATTERNS = [
  /[;&|`$(){}[\]]/,     // Shell metacharacters
  /\.\./,                // Directory traversal  
  /rm\s+-rf/,           // Destructive commands
  /sudo|su\s/,          // Privilege escalation
];
```

#### **3. Path Validation**
All file paths are validated:
- No directory traversal (`../`)
- No access to system directories (`/etc`, `/proc`, `/sys`)  
- APK files must have `.apk` extension
- Project paths must contain valid project files

#### **4. Process Isolation**
- Commands run in controlled subprocess environment
- Resource limits enforced (CPU, memory, time)
- Automatic cleanup of orphaned processes
- Process PID tracking for emulators

#### **5. Timeout Controls**
- Default timeout: 5 minutes per operation
- SDK installations: 15 minutes
- Emulator boot: 3 minutes  
- Build operations: 10 minutes

</details>

### **Security Best Practices**

- **Always run with minimal required permissions**
- **Regularly update dependencies** (`npm audit`)
- **Monitor process execution** for anomalies  
- **Use environment-specific configurations**
- **Enable logging** for security auditing

---

## 🔧 **Development**

### **Available Scripts**

```bash
# Development
npm run dev          # Watch mode development server
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server

# Quality Assurance  
npm run lint         # ESLint code analysis
npm run format       # Prettier code formatting
npm test             # Run test suite (Vitest)

# MCP Operations
npm run mcp:validate # Validate MCP server configuration
```

### **Project Structure**

```
mcp-mobile-server/
├── 📁 src/
│   ├── 📄 server.ts              # Main MCP server entry point
│   ├── 📁 tools/                 # MCP tool implementations
│   │   ├── 📄 android.ts         # Android tools (13 tools)
│   │   ├── 📄 ios.ts             # iOS tools (10 tools)  
│   │   └── 📄 flutter.ts         # Flutter tools (13 tools)
│   ├── 📁 utils/                 # Utility modules
│   │   ├── 📄 process.ts         # Secure process execution
│   │   └── 📄 security.ts        # Security validation
│   └── 📁 types/                 # TypeScript definitions
│       └── 📄 index.ts           # Shared type definitions
├── 📁 dist/                      # Compiled JavaScript output
├── 📄 package.json               # Project configuration
├── 📄 tsconfig.json              # TypeScript configuration
└── 📄 claude-desktop-config.json # Example Claude Desktop config
```

### **Contributing Guidelines**

<details>
<summary><b>**How to Contribute**</b></summary>

#### **Development Setup**
```bash
# Fork and clone the repository
git clone https://github.com/cristianoaredes/mcp-mobile-server.git
cd mcp-mobile-server
  
# Install dependencies
npm install
  
# Run in development mode
npm run dev
```

#### **Code Standards**  
- **TypeScript** strict mode enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **100% type safety** required
- **Security-first** approach

#### **Testing Requirements**
- Unit tests for all new tools
- Integration tests for tool workflows  
- Security validation tests
- Performance benchmarks

#### **Pull Request Process**
1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite: `npm test`
4. Update documentation if needed
5. Submit PR with detailed description

</details>

---

## 🚀 **Advanced Usage**

### **Workflow Automation Examples**

<details>
<summary><b>📱 Complete Mobile Development Workflows</b></summary>

#### **Android Development Workflow**
```bash
# 1. Check environment and setup
health_check
android_sdk_list_packages

# 2. Create and start emulator  
android_create_avd --name "TestDevice" --systemImage "android-34"
android_start_emulator --avd "TestDevice"

# 3. Development cycle
android_install_apk --apk "./app/build/app-debug.apk"
android_logcat --filter "MyApp"
```

#### **iOS Development Workflow**  
```bash
# 1. Setup simulator environment
ios_list_simulators
ios_boot_simulator --udid "ABC123..."

# 2. Build and test cycle
ios_list_schemes --project "./MyApp.xcodeproj"  
ios_build_project --scheme "MyApp" --configuration "Debug"
ios_run_tests --scheme "MyApp"

# 3. Screenshots and testing
ios_take_screenshot --output "./screenshots/"
```

#### **Flutter Development Workflow**
```bash  
# 1. Environment validation
flutter_doctor
flutter_list_devices

# 2. Development setup
flutter_pub_get --project "./my_flutter_app"
flutter_clean --project "./my_flutter_app"

# 3. Development cycle  
flutter_run --device "chrome" --hot-reload
flutter_test --coverage
flutter_build --target "web" --release
```

</details>

### **CI/CD Integration**

<details>
<summary><b>🔄 Continuous Integration Setup</b></summary>

#### **GitHub Actions Example**
```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on: [push, pull_request]

jobs:
  mobile-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Setup MCP Mobile Server
        run: |
          npm install
          npm run build
          
      - name: Validate Mobile Environment  
        run: npm run mcp:validate
        
      - name: Run Flutter Tests
        run: |
          # Use MCP tools for automated testing
          flutter_doctor
          flutter_test --project ./example_app
```

#### **Docker Deployment** (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 8787

CMD ["node", "dist/server.js"]
```

</details>

---

## 🆘 **Troubleshooting**

### **Common Issues and Solutions**

<details>
<summary><b>🔧 Troubleshooting Guide</b></summary>

#### **Installation Issues**

**Problem**: `npm install` fails with permission errors
```bash
# Solution: Use proper npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

**Problem**: TypeScript compilation errors
```bash
# Solution: Ensure TypeScript version compatibility
npm install -D typescript@^5.3.0
npm run build
```

#### **MCP Integration Issues**

**Problem**: Claude Desktop doesn't recognize the server
```bash
# Solution: Check configuration path and syntax
cat ~/Library/Application Support/Claude/claude_desktop_config.json
npm run mcp:validate
```

**Problem**: Tools not appearing in Claude Desktop
```bash
# Solution: Restart Claude Desktop after configuration changes
killall Claude\ Desktop
open -a "Claude Desktop"
```

#### **Mobile Development Issues**

**Problem**: Android tools not working
```bash  
# Solution: Verify Android SDK setup
echo $ANDROID_SDK_ROOT
which adb
android_sdk_list_packages
```

**Problem**: iOS simulators not found (macOS only)
```bash
# Solution: Check Xcode command line tools
xcode-select --print-path
xcrun simctl list devices
```

**Problem**: Flutter tools failing
```bash
# Solution: Verify Flutter installation  
which flutter  
flutter doctor
flutter_version
```

</details>

### **Performance Optimization**

<details>
<summary><b>⚡ Performance Tuning</b></summary>

#### **Server Optimization**
- **Process Pool**: Reuse processes for similar operations
- **Caching**: Cache tool availability checks
- **Concurrent Execution**: Parallel operations where safe
- **Resource Limits**: Proper memory and CPU limits

#### **Mobile Development Optimization**
- **Emulator Management**: Keep commonly used emulators running  
- **Build Caching**: Leverage Flutter/Android build caches
- **Parallel Testing**: Run tests on multiple devices simultaneously

</details>

---

## 📊 **Monitoring & Observability**

<details>
<summary><b>📈 Monitoring Setup</b></summary>

### **Health Monitoring**
```bash
# Periodic health checks
*/5 * * * * /usr/local/bin/node /path/to/mcp-mobile-server/dist/server.js validate

# Log monitoring
tail -f /var/log/mcp-mobile-server.log | grep ERROR
```

### **Performance Metrics**
- Tool execution times
- Process resource usage  
- Error rates by tool type
- Device connectivity status

### **Alerting**
- Failed tool executions
- Process timeout events
- Security policy violations
- Resource exhaustion warnings

</details>

---

## 🌐 **Community & Support**

### **Resources**

- **📖 Official MCP Docs**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **🐛 Issue Tracker**: [GitHub Issues](https://github.com/cristianoaredes/mcp-mobile-server/issues)  
- **💬 Discussions**: [GitHub Discussions](https://github.com/cristianoaredes/mcp-mobile-server/discussions)
- **📺 Video Tutorials**: [YouTube Playlist](https://youtube.com/playlist)

### **Getting Help**

1. **Check Documentation**: Review relevant sections above
2. **Search Issues**: Look for similar problems in GitHub Issues
3. **Run Diagnostics**: Use `npm run mcp:validate` and `health_check` tool
4. **Create Issue**: Provide detailed information including:
   - Operating system and version
   - Node.js version (`node --version`)
   - Error messages and logs
   - Steps to reproduce

---

## 📝 **License**

**MIT License**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 👤 **Maintainer & Contact**

- **Maintainer**: Cristiano Arêdes Costa
- **Website**: https://aredes.me

<div align="center">

**🚀 Ready to supercharge your mobile development workflow?**

[⭐ Star this repo](https://github.com/cristianoaredes/mcp-mobile-server) • [🐛 Report bug](https://github.com/cristianoaredes/mcp-mobile-server/issues) • [💡 Request feature](https://github.com/cristianoaredes/mcp-mobile-server/issues)

---

**Version:** 1.0.0 | **Status:** ✅ Production Ready | **Tools:** 37 | **Platforms:** 3  

*Built with ❤️ for the mobile development community*

</div>