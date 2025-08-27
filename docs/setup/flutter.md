# 💙 Flutter Development Setup

Complete guide to setting up Flutter SDK for MCP Mobile Server.

---

## 📋 Requirements

### **System Requirements**
- **Operating System**: Windows, macOS, or Linux
- **Disk Space**: 2.8 GB (not including IDEs/tools)
- **Git**: Required for Flutter installation and package management

### **Development Tools**
- **Flutter SDK** - Core framework
- **Dart SDK** - Included with Flutter
- **Platform SDKs** - Android SDK and/or iOS SDK (Xcode)

---

## ⚡ Quick Setup

### **Method 1: Official Flutter Installation**

1. **Download Flutter SDK**
   ```bash
   # macOS/Linux
   git clone https://github.com/flutter/flutter.git -b stable
   
   # Or download zip from: https://flutter.dev/docs/get-started/install
   ```

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

### **Method 2: Using Version Management**

**FVM (Flutter Version Management):**
```bash
# Install FVM
dart pub global activate fvm

# Install and use Flutter version
fvm install stable
fvm use stable

# Add to PATH (project-specific)
export PATH="$PATH:$PWD/.fvm/flutter_sdk/bin"
```

**Using Homebrew (macOS):**
```bash
# Install Flutter via Homebrew
brew install flutter

# Verify installation
flutter --version
flutter doctor
```

---

## 🔧 Flutter Configuration

### **Run Flutter Doctor**

```bash
# Comprehensive environment check
flutter doctor

# Verbose output for detailed issues
flutter doctor -v
```

Flutter Doctor checks:
- ✅ Flutter installation
- ✅ Android toolchain
- ✅ Xcode (macOS only)
- ✅ Chrome (for web development)
- ✅ Connected devices

### **Accept Android Licenses**

```bash
# Required for Android development
flutter doctor --android-licenses

# Accept all licenses
yes | flutter doctor --android-licenses
```

### **Configure IDEs (Optional)**

```bash
# Install Flutter plugins for VS Code
flutter config --enable-web      # Enable web development
flutter config --enable-desktop  # Enable desktop development
```

---

## 📱 Platform-Specific Setup

### **Android Development**

1. **Prerequisites**
   - Android Studio or Android SDK
   - See [Android Setup Guide](./android.md) for details

2. **Verify Android Setup**
   ```bash
   flutter doctor
   # Should show ✅ for Android toolchain
   
   flutter devices
   # Should list Android devices/emulators
   ```

### **iOS Development (macOS only)**

1. **Prerequisites**
   - Xcode and Command Line Tools
   - See [iOS Setup Guide](./ios.md) for details

2. **Verify iOS Setup**
   ```bash
   flutter doctor
   # Should show ✅ for Xcode toolchain
   
   flutter devices
   # Should list iOS simulators
   ```

### **Web Development**

```bash
# Enable web support
flutter config --enable-web

# Verify web setup
flutter devices
# Should show Chrome as available device
```

### **Desktop Development**

```bash
# Enable desktop support
flutter config --enable-macos-desktop     # macOS
flutter config --enable-windows-desktop   # Windows  
flutter config --enable-linux-desktop     # Linux

# Verify desktop setup
flutter devices
# Should show desktop as available device
```

---

## ✅ Verification with MCP Tools

### **Test Flutter Integration**

```json
// Check Flutter environment
{
  "tool": "flutter_doctor",
  "arguments": {}
}

// Check Flutter version
{
  "tool": "flutter_version", 
  "arguments": {}
}

// List available devices
{
  "tool": "flutter_list_devices",
  "arguments": {}
}

// Test health check
{
  "tool": "health_check",
  "arguments": { "verbose": true }
}
```

### **Command Line Tests**

```bash
# Basic Flutter commands
flutter --version
flutter doctor
flutter devices

# Create test project
flutter create test_app
cd test_app

# Test build
flutter build apk --debug      # Android
flutter build ios --debug      # iOS (macOS only)
flutter build web             # Web
```

---

## 🚨 Common Issues

### **"Flutter command not found"**

**Problem:** Flutter not in system PATH.

**Solutions:**

1. **Add to PATH permanently**
   ```bash
   # Find Flutter installation
   which flutter || echo "Flutter not in PATH"
   
   # Add to shell profile
   echo 'export PATH="$PATH:/path/to/flutter/bin"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Verify PATH**
   ```bash
   echo $PATH | grep flutter
   which flutter
   ```

### **"Android toolchain - develop for Android devices"**

**Problem:** Android SDK not properly configured.

**Solution:** Follow [Android Setup Guide](./android.md)

```bash
# Quick fix - accept licenses
flutter doctor --android-licenses

# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### **"Xcode - develop for iOS and macOS"**

**Problem:** Xcode not installed or configured (macOS only).

**Solution:** Follow [iOS Setup Guide](./ios.md)

```bash
# Install Xcode Command Line Tools
sudo xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

### **"No devices available"**

**Problem:** No connected devices or emulators.

**Solutions:**

1. **Start Android Emulator**
   ```bash
   # Using MCP tools
   # Use android_list_emulators to see available AVDs
   # Start emulator from Android Studio
   ```

2. **Start iOS Simulator (macOS)**
   ```bash
   # Using MCP tools
   # Use ios_list_simulators to see available simulators
   # Use ios_boot_simulator to start one
   ```

3. **Connect Physical Device**
   - Enable Developer Mode/USB Debugging
   - Connect via USB
   - Authorize computer on device

### **"HTTP host lookup failed"**

**Problem:** Network issues preventing package downloads.

**Solutions:**

1. **Check Network Connection**
   ```bash
   ping pub.dev
   curl -I https://pub.dev
   ```

2. **Configure Proxy (if needed)**
   ```bash
   flutter config --enable-web
   git config --global http.proxy http://proxy.company.com:8080
   ```

3. **Use Different Mirror**
   ```bash
   export PUB_HOSTED_URL=https://pub.flutter-io.cn
   export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
   ```

---

## 🏗️ Development Workflow

### **Create New Flutter Project**

```bash
# Create project
flutter create my_app
cd my_app

# Get dependencies
flutter pub get

# Using MCP tool
# Use flutter_pub_get with project directory
```

### **Run Development Server**

```bash
# Run with hot reload
flutter run

# Run on specific device
flutter run -d "device-id"

# Using MCP tool
# Use flutter_run with cwd and deviceId parameters
```

### **Build Applications**

```bash
# Debug builds
flutter build apk --debug
flutter build ios --debug

# Release builds
flutter build apk --release
flutter build ios --release

# Using MCP tools
# Use flutter_build with appropriate target and buildMode
```

### **Test Applications**

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Using MCP tool
# Use flutter_test with coverage: true
```

### **Clean Project**

```bash
# Clean build artifacts
flutter clean

# Reinstall dependencies
flutter pub get

# Using MCP tool
# Use flutter_clean with project directory
```

---

## 🔧 Advanced Configuration

### **Multiple Flutter Versions**

**Using FVM:**
```bash
# Install multiple versions
fvm install 3.16.0
fvm install 3.19.0

# Switch versions per project
fvm use 3.16.0

# Global default
fvm global 3.19.0
```

### **Custom Build Configurations**

```bash
# Build with flavor
flutter build apk --flavor production --release

# Build for specific architecture
flutter build apk --target-platform android-arm64

# Custom build name and number
flutter build apk --build-name=1.2.3 --build-number=123
```

### **Development Settings**

```bash
# Enable/disable features
flutter config --enable-web
flutter config --enable-macos-desktop
flutter config --no-analytics

# View current config
flutter config
```

### **Performance Optimization**

```bash
# Profile mode build
flutter build apk --profile

# Analyze bundle size
flutter analyze --write=analysis.txt

# Performance profiling
flutter run --profile --trace-startup
```

---

## 📊 Flutter Project Structure

```
flutter_project/
├── lib/                   # Dart source code
│   ├── main.dart         # App entry point
│   ├── screens/          # UI screens
│   ├── widgets/          # Custom widgets
│   └── models/           # Data models
├── test/                 # Unit and widget tests
├── integration_test/     # Integration tests
├── android/              # Android-specific code
├── ios/                  # iOS-specific code
├── web/                  # Web-specific code
├── pubspec.yaml          # Dependencies and metadata
└── pubspec.lock          # Dependency versions
```

---

## 🎯 Best Practices

### **Development Environment**

1. **Use Stable Channel**
   ```bash
   flutter channel stable
   flutter upgrade
   ```

2. **Regular Updates**
   ```bash
   # Check for updates
   flutter upgrade

   # Update packages
   flutter pub upgrade
   ```

3. **Version Pinning**
   ```yaml
   # In pubspec.yaml
   environment:
     sdk: '>=3.2.0 <4.0.0'
     flutter: '>=3.16.0'
   ```

### **Performance Tips**

1. **Hot Reload Usage**
   - Use hot reload for UI changes
   - Hot restart for logic changes
   - Full restart for dependency changes

2. **Build Optimization**
   ```bash
   # Use release builds for performance testing
   flutter run --release
   
   # Profile builds for debugging performance
   flutter run --profile
   ```

3. **Package Management**
   ```bash
   # Keep dependencies minimal
   flutter pub deps
   
   # Remove unused dependencies
   flutter pub outdated
   ```

---

## 📊 Troubleshooting Checklist

- [ ] **Flutter SDK** installed and in PATH
- [ ] **Git** available for package management  
- [ ] **Android SDK** configured (for Android development)
- [ ] **Xcode** installed (for iOS development on macOS)
- [ ] **Licenses accepted** for all platforms
- [ ] **At least one device** available for testing
- [ ] **Network access** for package downloads
- [ ] **MCP flutter_doctor** passes successfully

### **Complete Diagnostic**

```bash
# Full Flutter environment check
flutter doctor -v
flutter --version
flutter devices

# Test package system
flutter create test_project
cd test_project
flutter pub get
flutter analyze

# Test MCP integration
# Use health_check tool with verbose: true
# Use flutter_doctor tool
```

---

## 🎯 Next Steps

1. **Verify Setup**: Use MCP `flutter_doctor` tool
2. **Check Devices**: Use `flutter_list_devices` tool
3. **Create Project**: Use standard `flutter create` command
4. **Development**: Use `flutter_run` tool for hot reload
5. **Testing**: Use `flutter_test` tool for running tests
6. **Building**: Use `flutter_build` tool for release builds

---

**🎉 Flutter setup complete!** You can now use all Flutter-related MCP tools for cross-platform mobile development automation.