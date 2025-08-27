# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-08-27

### 🎯 Major Features
- **Flutter Environment Automation**: Complete Flutter SDK installation and configuration tool
- **Android SDK Setup**: Automated Android SDK setup with environment configuration

### ✨ Added
- `flutter_setup_environment` tool with actions: check, install, configure, and full setup
  - Cross-platform path detection (macOS, Linux, Windows)
  - Automatic Flutter SDK installation via Git
  - Shell environment configuration (.zshrc, .bashrc)
  - Comprehensive environment validation
  - Smart recommendations for missing components
- `android_sdk_setup` tool for Android SDK configuration
  - SDK component installation
  - Environment variable setup
  - SDK manager integration

### 📚 Documentation
- Completely redesigned README.md with professional structure
- Added comprehensive feature tables and tool documentation
- Included real-world usage examples
- Added architecture diagrams with Mermaid
- Enhanced troubleshooting section
- Updated tool count from 34 to 36 tools

### 🔧 Technical Improvements
- Added proper TypeScript typing for platform detection
- Enhanced error handling in setup tools
- Improved tool registration in TOOL_REGISTRY
- Fixed compilation issues with process executor

## [2.1.0] - Previous Release

### Features
- 34 mobile development tools
- 10 intelligent super-tools
- Cross-platform support (Android, iOS, Flutter)
- MCP protocol compliance
- Claude Desktop integration

---

*For more details, see the [README](README.md) and [documentation](./docs/).*