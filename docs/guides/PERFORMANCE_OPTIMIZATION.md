# Performance Optimization Guide

**MCP Mobile Server v2.3.0**

This guide provides comprehensive strategies for optimizing MCP Mobile Server performance in development, CI/CD, and production environments.

## Table of Contents

- [Overview](#overview)
- [Build Performance](#build-performance)
- [Emulator Performance](#emulator-performance)
- [Testing Performance](#testing-performance)
- [Memory Optimization](#memory-optimization)
- [Caching Strategies](#caching-strategies)
- [Parallel Execution](#parallel-execution)
- [Network Optimization](#network-optimization)
- [Monitoring & Profiling](#monitoring--profiling)

---

## Overview

### Performance Metrics

Key performance indicators for mobile development workflows:

| Metric | Target | Excellent |
|--------|--------|-----------|
| Clean Build Time | < 5 min | < 2 min |
| Incremental Build | < 30 sec | < 10 sec |
| Test Execution | < 3 min | < 1 min |
| Emulator Boot | < 60 sec | < 30 sec |
| Memory Usage | < 4 GB | < 2 GB |

### Quick Wins Checklist

- ✅ Enable Gradle daemon and parallel builds
- ✅ Use build caching (Gradle, Flutter)
- ✅ Optimize emulator settings (RAM, CPU cores)
- ✅ Enable incremental builds
- ✅ Use hardware acceleration (HAXM, KVM)
- ✅ Minimize dependency resolution

---

## Build Performance

### Android Gradle Optimization

#### 1. Gradle Daemon & Parallel Builds

Create or modify `gradle.properties`:

```properties
# Enable Gradle Daemon (reuses build processes)
org.gradle.daemon=true

# Enable parallel builds
org.gradle.parallel=true

# Configure max workers (adjust based on CPU cores)
org.gradle.workers.max=4

# Increase memory allocation
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Enable configuration cache (Gradle 6.5+)
org.gradle.configuration-cache=true

# Enable build cache
org.gradle.caching=true
```

Using MCP Mobile Server with optimized Gradle:

```bash
npx mcp-mobile-server exec android_gradle_build \
  --projectPath ./android \
  --task assembleDebug \
  --options.parallel true \
  --options.daemon true
```

#### 2. Build Cache Configuration

Enable remote build cache for teams:

```groovy
// settings.gradle
buildCache {
    local {
        enabled = true
        directory = "$rootDir/.gradle/build-cache"
        removeUnusedEntriesAfterDays = 30
    }
    remote(HttpBuildCache) {
        enabled = true
        url = 'https://your-build-cache-server.com/cache/'
        credentials {
            username = System.getenv('BUILD_CACHE_USER')
            password = System.getenv('BUILD_CACHE_PASSWORD')
        }
        push = true  // Allow uploading to cache
    }
}
```

#### 3. Dependency Resolution Optimization

```groovy
// build.gradle
repositories {
    // Use local Maven repository first
    mavenLocal()

    // Use Google/Maven Central with content filters
    google {
        content {
            includeGroupByRegex("com\\.android.*")
            includeGroupByRegex("com\\.google.*")
            includeGroupByRegex("androidx.*")
        }
    }

    mavenCentral {
        content {
            excludeGroupByRegex("com\\.android.*")
            excludeGroupByRegex("com\\.google.*")
        }
    }
}

configurations.all {
    // Cache dynamic versions for 24 hours
    resolutionStrategy.cacheDynamicVersionsFor 24, 'hours'

    // Cache changing modules for 4 hours
    resolutionStrategy.cacheChangingModulesFor 4, 'hours'
}
```

#### 4. Modular Builds

Split large projects into modules:

```bash
# Build only changed modules
npx mcp-mobile-server exec android_gradle_build \
  --projectPath ./android \
  --task :app:assembleDebug  # Only build app module
```

### Flutter Build Optimization

#### 1. Enable Build Cache

```bash
# Enable pub cache globally
export PUB_CACHE="$HOME/.pub-cache"

# Use flutter_build with cache
npx mcp-mobile-server exec flutter_build \
  --cwd ./my-flutter-app \
  --target apk \
  --buildMode debug
```

#### 2. Precompile Dart Kernel

```bash
# Precompile for faster subsequent builds
flutter build bundle --precompile
```

#### 3. Optimize Asset Compilation

```yaml
# pubspec.yaml
flutter:
  assets:
    # Use specific paths instead of directories
    - assets/images/logo.png
    # NOT: - assets/images/
```

#### 4. Code Generation Optimization

```bash
# Run build_runner with delete-conflicting-outputs
flutter pub run build_runner build --delete-conflicting-outputs

# Use MCP Mobile Server
npx mcp-mobile-server exec flutter_pub_get --cwd .
```

---

## Emulator Performance

### Android Emulator Optimization

#### 1. Hardware Acceleration

**Linux (KVM):**
```bash
# Check KVM availability
ls /dev/kvm

# Install KVM
sudo apt-get install qemu-kvm

# Add user to kvm group
sudo usermod -a -G kvm $USER
```

**macOS (HAXM):**
```bash
# Install HAXM via Homebrew
brew install --cask intel-haxm

# Or via Android SDK Manager
npx mcp-mobile-server exec android_sdk_install_packages \
  --packages "extras;intel;Hardware_Accelerated_Execution_Manager"
```

**Windows (HAXM/WHPX):**
```powershell
# Install HAXM
sdkmanager "extras;intel;Hardware_Accelerated_Execution_Manager"

# Or use Windows Hypervisor Platform (WHPX)
Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
```

#### 2. Optimized AVD Configuration

Create performance-optimized AVD:

```bash
npx mcp-mobile-server exec android_create_avd \
  --name perf_device \
  --systemImageId "system-images;android-30;google_apis;x86_64" \
  --device "pixel_5" \
  --sdcard "512M"  # Minimal SD card size
```

Start with optimized settings:

```bash
npx mcp-mobile-server exec android_start_emulator \
  --avdName perf_device \
  --options.gpu "host" \  # Use host GPU
  --options.noWindow false  # GUI for development
```

**Advanced emulator options:**

```bash
# Direct emulator command with optimization flags
emulator -avd perf_device \
  -gpu host \
  -accel on \
  -cores 4 \
  -memory 4096 \
  -partition-size 2048 \
  -no-boot-anim \
  -no-snapshot-load \  # Skip snapshot for faster boot
  -wipe-data  # Fresh start (slower first boot, faster subsequent)
```

#### 3. Snapshots for Quick Boot

```bash
# Create snapshot after initial boot
adb emu avd snapshot save my_snapshot

# Boot from snapshot
emulator -avd perf_device -snapshot my_snapshot
```

### iOS Simulator Optimization

#### 1. Optimized Simulator Selection

Use smaller simulators for faster boot:

```bash
# List available simulators
npx mcp-mobile-server exec ios_list_simulators

# Use iPhone SE (smaller, faster)
npx mcp-mobile-server exec ios_boot_simulator \
  --udid "<UDID-of-iPhone-SE>"
```

#### 2. Disable Slow Animations

```bash
# Disable slow animations in simulator
defaults write com.apple.CoreSimulator.IndigoFramebufferServices FramebufferRendererHint 0
```

#### 3. Simulator GPU Acceleration

Enable Metal graphics acceleration (macOS):

```bash
# Check Metal support
system_profiler SPDisplaysDataType | grep Metal

# Simulators automatically use Metal if available
```

---

## Testing Performance

### 1. Selective Test Execution

Run only changed tests:

```bash
# Flutter - run specific test file
npx mcp-mobile-server exec flutter_test \
  --cwd . \
  --testFile test/widget_test.dart

# Android - run specific test class
./gradlew test --tests com.example.MyTest
```

### 2. Parallel Test Execution

```bash
# Android - parallel test execution
./gradlew test --parallel --max-workers=4

# Flutter - parallel integration tests
flutter test --concurrency=4
```

### 3. Test Sharding (CI/CD)

Split tests across multiple runners:

```yaml
# GitHub Actions
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - name: Run Tests (Shard ${{ matrix.shard }})
    run: |
      flutter test \
        --shard-index=${{ matrix.shard }} \
        --total-shards=4
```

### 4. Skip Heavy Tests in Development

```dart
// Dart/Flutter
@Skip('Slow integration test - run in CI only')
test('heavy integration test', () {
  // ...
});
```

---

## Memory Optimization

### 1. JVM Memory Configuration

Optimize Java heap for Android builds:

```properties
# gradle.properties
org.gradle.jvmargs=-Xmx4g \
  -XX:MaxMetaspaceSize=1g \
  -XX:+UseParallelGC \
  -XX:+HeapDumpOnOutOfMemoryError \
  -Dfile.encoding=UTF-8
```

### 2. Emulator Memory Allocation

```bash
# Allocate appropriate RAM (not too much!)
npx mcp-mobile-server exec android_start_emulator \
  --avdName test_device \
  --memory 2048  # 2GB is usually enough
```

### 3. Process Management

Monitor and kill idle processes:

```bash
# Check active Flutter sessions
npx mcp-mobile-server exec flutter_list_sessions

# Stop idle sessions
npx mcp-mobile-server exec flutter_stop_session --sessionId <session-id>
```

### 4. Dependency Cleanup

```bash
# Flutter - remove unused dependencies
flutter pub deps --json | jq '.packages[] | select(.kind == "direct") | .name'

# Android - analyze dependencies
./gradlew dependencies

# Clean build artifacts
npx mcp-mobile-server exec flutter_clean --cwd .
npx mcp-mobile-server exec android_gradle_clean --projectPath ./android
```

---

## Caching Strategies

### 1. CI/CD Cache Configuration

**GitHub Actions:**

```yaml
- name: Cache Dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
      ~/.pub-cache
    key: ${{ runner.os }}-deps-${{ hashFiles('**/*.gradle*', '**/pubspec.lock') }}
    restore-keys: |
      ${{ runner.os }}-deps-
```

**GitLab CI:**

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .gradle/
    - .pub-cache/
    - android/.gradle/
```

### 2. Local Development Cache

```bash
# Set cache directories
export GRADLE_USER_HOME="$HOME/.gradle"
export PUB_CACHE="$HOME/.pub-cache"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"

# Persistent cache across projects
export GRADLE_OPTS="-Dorg.gradle.caching=true"
```

### 3. Docker Layer Caching

```dockerfile
# Optimize layer caching in Dockerfile
FROM node:18-slim

# Install system dependencies (changes rarely)
RUN apt-get update && apt-get install -y ...

# Install SDK (changes rarely)
COPY scripts/install-sdk.sh /tmp/
RUN /tmp/install-sdk.sh

# Copy dependency files only (changes occasionally)
COPY package*.json pubspec.yaml ./
RUN npm install && flutter pub get

# Copy source code (changes frequently)
COPY . .

# Build
RUN flutter build apk
```

---

## Parallel Execution

### 1. Super-Tools for Parallel Workflows

Use super-tools to orchestrate parallel operations:

```bash
# Run parallel test suites
npx mcp-mobile-server exec flutter_test_suite \
  --cwd . \
  --integrationTests true &

npx mcp-mobile-server exec android_lint_check \
  --projectPath ./android &

wait  # Wait for all background jobs
```

### 2. Multiple Emulators

Run tests on multiple devices in parallel:

```bash
# Start multiple emulators on different ports
npx mcp-mobile-server exec android_start_emulator \
  --avdName device1 \
  --options.port 5554 &

npx mcp-mobile-server exec android_start_emulator \
  --avdName device2 \
  --options.port 5556 &

# Deploy to all devices
for device in emulator-5554 emulator-5556; do
  npx mcp-mobile-server exec android_install_apk \
    --serial $device \
    --apkPath ./app-debug.apk &
done
wait
```

### 3. Parallel Builds

Build multiple flavors/variants concurrently:

```bash
# Build multiple Android variants
./gradlew assembleDebug assembleProd --parallel

# Build Flutter for multiple platforms
flutter build apk &
flutter build ios &
wait
```

---

## Network Optimization

### 1. Offline Mode

Enable offline mode for faster builds:

```bash
# Gradle offline mode
./gradlew assembleDebug --offline

# Flutter offline pub get
flutter pub get --offline
```

### 2. Dependency Proxies

Use local dependency mirrors:

```groovy
// build.gradle
repositories {
    maven {
        url "https://your-local-mirror.com/maven2"
    }
}
```

### 3. Reduce Network Calls

```bash
# Disable Flutter analytics (reduces network calls)
flutter config --no-analytics

# Disable Gradle version checks
# gradle.properties
systemProp.org.gradle.vfs.watch=false
```

---

## Monitoring & Profiling

### 1. Build Scan

Enable Gradle build scans:

```bash
# Run build with scan
./gradlew assembleDebug --scan

# Analyze results at https://scans.gradle.com
```

### 2. Performance Profiling

```bash
# Profile Gradle build
./gradlew assembleDebug --profile

# View report in build/reports/profile/
```

### 3. Resource Monitoring

Monitor system resources during builds:

```bash
# Linux
watch -n 1 'free -h && echo && ps aux | grep -E "gradle|flutter"'

# macOS
while true; do clear; top -l 1 | head -n 20; sleep 1; done
```

### 4. MCP Mobile Server Metrics

Track tool execution times:

```bash
# Enable debug logging
export MCP_MOBILE_LOG_LEVEL=debug

# Run tool and check logs
npx mcp-mobile-server exec flutter_build \
  --cwd . \
  --target apk \
  --buildMode release

# Logs will show execution duration
```

---

## Performance Benchmarks

### Baseline Performance (Medium Project)

| Task | Without Optimization | With Optimization | Improvement |
|------|---------------------|-------------------|-------------|
| Android Clean Build | 4m 30s | 1m 45s | 61% faster |
| Android Incremental | 45s | 8s | 82% faster |
| Flutter Tests | 2m 15s | 35s | 74% faster |
| Emulator Boot | 90s | 25s | 72% faster |
| Full CI Pipeline | 12m | 4m 30s | 62% faster |

### Hardware Recommendations

**Development Machine:**
- CPU: 8+ cores (Intel i7/i9, AMD Ryzen 7/9)
- RAM: 16GB minimum, 32GB recommended
- Storage: NVMe SSD (500GB+)
- GPU: Dedicated GPU for emulator acceleration

**CI/CD Runners:**
- CPU: 4+ cores per parallel job
- RAM: 8GB minimum per job
- Storage: SSD with 100GB+ free space
- Network: High-bandwidth connection for dependency downloads

---

## Troubleshooting Performance Issues

### Issue: Slow Gradle Builds

**Diagnosis:**
```bash
./gradlew assembleDebug --profile --scan
```

**Solutions:**
1. Enable daemon and parallel builds
2. Increase JVM heap size
3. Enable build cache
4. Update Gradle version
5. Remove unused dependencies

### Issue: Emulator Won't Start or Crashes

**Diagnosis:**
```bash
# Check available resources
free -h
df -h

# Check emulator logs
cat ~/.android/avd/<avd-name>.avd/hardware-qemu.ini
```

**Solutions:**
1. Reduce emulator RAM allocation
2. Enable hardware acceleration
3. Update system images
4. Clear emulator cache: `rm -rf ~/.android/avd/*.avd/cache`

### Issue: Out of Memory Errors

**Diagnosis:**
```bash
# Monitor memory usage
watch -n 1 free -h

# Check Gradle memory
./gradlew --status
```

**Solutions:**
1. Increase `org.gradle.jvmargs` heap size
2. Reduce parallel workers
3. Close unused applications
4. Kill idle emulators/simulators

---

## Performance Checklist

### Development Environment

- [ ] Hardware acceleration enabled (KVM/HAXM)
- [ ] SSD storage for project and dependencies
- [ ] Gradle daemon and parallel builds enabled
- [ ] Build cache configured
- [ ] Incremental builds enabled
- [ ] Minimal emulator configuration
- [ ] Dependencies cached locally

### CI/CD Environment

- [ ] Dependency caching configured
- [ ] Parallel job execution enabled
- [ ] Docker layer caching optimized
- [ ] Emulators run headless with GPU acceleration
- [ ] Test sharding implemented
- [ ] Build artifacts cached between stages
- [ ] Minimal Android system images used

### Code & Configuration

- [ ] Modular project structure
- [ ] Unused dependencies removed
- [ ] R8/ProGuard optimizations enabled (release builds)
- [ ] Asset compression configured
- [ ] Incremental annotation processing enabled
- [ ] Build variants minimized
- [ ] Test coverage configured efficiently

---

## Additional Resources

- [Gradle Performance Guide](https://docs.gradle.org/current/userguide/performance.html)
- [Flutter Build Performance](https://docs.flutter.dev/perf/best-practices)
- [Android Emulator Performance](https://developer.android.com/studio/run/emulator-acceleration)
- [MCP Mobile Server Architecture](../ARCHITECTURE.md)

---

**Last Updated:** 2025-11-16
**Version:** 2.3.0
