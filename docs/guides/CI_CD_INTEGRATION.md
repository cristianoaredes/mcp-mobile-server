# CI/CD Integration Guide

**MCP Mobile Server v2.3.0**

This guide provides comprehensive instructions for integrating MCP Mobile Server into your CI/CD pipelines, enabling automated mobile development workflows.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions](#github-actions)
- [GitLab CI/CD](#gitlab-cicd)
- [Jenkins](#jenkins)
- [Docker Integration](#docker-integration)
- [Environment Variables](#environment-variables)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

MCP Mobile Server can be integrated into CI/CD pipelines to automate:
- Mobile app building (Android, iOS, Flutter)
- Automated testing on emulators/simulators
- APK/IPA deployment
- Quality checks (lint, tests, coverage)
- Environment validation

### Prerequisites

- CI/CD platform (GitHub Actions, GitLab CI, Jenkins, etc.)
- Android SDK (for Android builds)
- Xcode (for iOS builds - macOS runners only)
- Flutter SDK (for Flutter projects)
- Node.js 18+ and npm

---

## GitHub Actions

### Basic Setup

Create `.github/workflows/mcp-mobile.yml`:

```yaml
name: Mobile Development CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  android-build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Install MCP Mobile Server
      run: |
        npm install -g @cristianoaredes/mcp-mobile-server
        mcp-mobile-server --version

    - name: Setup Android SDK
      run: |
        # Use android_sdk_setup tool
        npx mcp-mobile-server exec android_sdk_setup \
          --action install \
          --components "platform-tools" "build-tools;33.0.0" "platforms;android-33"

    - name: Run Android Build
      run: |
        npx mcp-mobile-server exec android_gradle_build \
          --projectPath ./android \
          --task assembleDebug

    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/*.apk

  flutter-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        channel: 'stable'

    - name: Install MCP Mobile Server
      run: npm install -g @cristianoaredes/mcp-mobile-server

    - name: Run Flutter Test Suite
      run: |
        npx mcp-mobile-server exec flutter_test_suite \
          --cwd . \
          --coverage true

    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

### iOS Build (macOS Runner)

```yaml
  ios-build:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install MCP Mobile Server
      run: npm install -g @cristianoaredes/mcp-mobile-server

    - name: List iOS Simulators
      run: |
        npx mcp-mobile-server exec ios_list_simulators

    - name: Build iOS App
      run: |
        npx mcp-mobile-server exec ios_xcodebuild \
          --project MyApp.xcodeproj \
          --scheme MyApp \
          --configuration Debug \
          --destination "platform=iOS Simulator,name=iPhone 14"
```

### Advanced: Emulator Testing

```yaml
  android-emulator-test:
    runs-on: macos-latest  # macOS for hardware acceleration

    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Enable KVM (Linux only)
      if: runner.os == 'Linux'
      run: |
        echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' | sudo tee /etc/udev/rules.d/99-kvm4all.rules
        sudo udevadm control --reload-rules
        sudo udevadm trigger --name-match=kvm

    - name: Install MCP Mobile Server
      run: npm install -g @cristianoaredes/mcp-mobile-server

    - name: Create and Start Emulator
      run: |
        # Create AVD
        npx mcp-mobile-server exec android_create_avd \
          --name test_device \
          --systemImageId "system-images;android-30;google_apis;x86_64"

        # Start emulator headless
        npx mcp-mobile-server exec android_start_emulator \
          --avdName test_device \
          --options.noWindow true \
          --options.gpu swiftshader_indirect

    - name: Wait for emulator
      run: |
        adb wait-for-device
        adb shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'

    - name: Run Tests on Emulator
      run: |
        npx mcp-mobile-server exec android_full_debug \
          --apkPath ./app/build/outputs/apk/debug/app-debug.apk \
          --packageName com.example.app \
          --mainActivity .MainActivity
```

---

## GitLab CI/CD

### Basic Configuration

Create `.gitlab-ci.yml`:

```yaml
image: node:18

stages:
  - setup
  - build
  - test
  - deploy

variables:
  ANDROID_SDK_ROOT: "/opt/android-sdk"
  FLUTTER_VERSION: "3.16.0"

before_script:
  - npm install -g @cristianoaredes/mcp-mobile-server

setup:android:
  stage: setup
  image: openjdk:17-jdk
  script:
    - npx mcp-mobile-server exec android_sdk_setup --action check
    - npx mcp-mobile-server exec flutter_setup_environment --action check
  artifacts:
    reports:
      dotenv: environment.env

build:android:
  stage: build
  image: openjdk:17-jdk
  dependencies:
    - setup:android
  script:
    - npx mcp-mobile-server exec android_gradle_build \
        --projectPath ./android \
        --task assembleRelease
  artifacts:
    paths:
      - android/app/build/outputs/apk/release/*.apk
    expire_in: 1 week

build:flutter:
  stage: build
  image: cirrusci/flutter:$FLUTTER_VERSION
  script:
    - npx mcp-mobile-server exec flutter_build \
        --cwd . \
        --target apk \
        --buildMode release
  artifacts:
    paths:
      - build/app/outputs/flutter-apk/*.apk
    expire_in: 1 week

test:flutter:
  stage: test
  image: cirrusci/flutter:$FLUTTER_VERSION
  script:
    - npx mcp-mobile-server exec flutter_test_suite \
        --cwd . \
        --coverage true
  coverage: '/lines\.*: \d+\.\d+%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura.xml

lint:android:
  stage: test
  image: openjdk:17-jdk
  script:
    - npx mcp-mobile-server exec android_lint_check \
        --projectPath ./android \
        --options.outputFormat html \
        --options.outputFile lint-results.html
  artifacts:
    paths:
      - lint-results.html
    when: always
```

### iOS Build (GitLab macOS Runners)

```yaml
build:ios:
  stage: build
  tags:
    - macos
  script:
    - npm install -g @cristianoaredes/mcp-mobile-server
    - npx mcp-mobile-server exec ios_xcodebuild \
        --workspace MyApp.xcworkspace \
        --scheme MyApp \
        --configuration Release \
        --destination "generic/platform=iOS"
  artifacts:
    paths:
      - build/ios/ipa/*.ipa
    expire_in: 1 week
```

---

## Jenkins

### Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        ANDROID_SDK_ROOT = '/opt/android-sdk'
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk'
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g @cristianoaredes/mcp-mobile-server'
                sh 'npx mcp-mobile-server exec flutter_setup_environment --action check'
            }
        }

        stage('Build Android') {
            steps {
                sh '''
                    npx mcp-mobile-server exec android_gradle_build \
                        --projectPath ./android \
                        --task assembleDebug
                '''
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh '''
                            npx mcp-mobile-server exec flutter_test \
                                --cwd . \
                                --coverage true
                        '''
                    }
                }

                stage('Lint') {
                    steps {
                        sh '''
                            npx mcp-mobile-server exec android_lint_check \
                                --projectPath ./android
                        '''
                    }
                }
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'android/app/build/outputs/apk/**/*.apk'
                publishHTML([
                    reportDir: 'android/app/build/reports/lint',
                    reportFiles: 'lint-results.html',
                    reportName: 'Lint Report'
                ])
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
```

---

## Docker Integration

### Dockerfile for CI/CD

```dockerfile
FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools.zip && \
    rm commandlinetools.zip && \
    mv cmdline-tools latest

ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

# Install MCP Mobile Server
RUN npm install -g @cristianoaredes/mcp-mobile-server

# Setup Android SDK components
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "build-tools;33.0.0" "platforms;android-33"

WORKDIR /workspace

CMD ["bash"]
```

### Docker Compose for Local CI Testing

```yaml
version: '3.8'

services:
  mcp-mobile-ci:
    build: .
    volumes:
      - ./:/workspace
      - android-sdk:/opt/android-sdk
      - gradle-cache:/root/.gradle
    environment:
      - ANDROID_SDK_ROOT=/opt/android-sdk
    command: >
      sh -c "
        npx mcp-mobile-server exec android_gradle_build --projectPath ./android --task assembleDebug &&
        npx mcp-mobile-server exec flutter_test --cwd . --coverage true
      "

volumes:
  android-sdk:
  gradle-cache:
```

---

## Environment Variables

### Required Variables

```bash
# Android
export ANDROID_SDK_ROOT="/path/to/android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"  # Legacy
export JAVA_HOME="/path/to/jdk-17"

# Flutter
export FLUTTER_ROOT="/path/to/flutter"
export PATH="$PATH:$FLUTTER_ROOT/bin"

# iOS (macOS only)
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

# MCP Mobile Server
export MCP_MOBILE_LOG_LEVEL="info"  # debug, info, warn, error
export MCP_MOBILE_TIMEOUT="600000"  # Default timeout in ms
```

### CI/CD Secrets

Store sensitive data as secrets:

**GitHub Actions:**
```yaml
env:
  ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
  IOS_CERTIFICATE_PASSWORD: ${{ secrets.IOS_CERTIFICATE_PASSWORD }}
```

**GitLab CI:**
```yaml
variables:
  ANDROID_KEYSTORE_PASSWORD: $ANDROID_KEYSTORE_PASSWORD
```

---

## Best Practices

### 1. Cache Dependencies

**GitHub Actions:**
```yaml
- name: Cache Gradle
  uses: actions/cache@v3
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}

- name: Cache Flutter
  uses: actions/cache@v3
  with:
    path: /opt/hostedtoolcache/flutter
    key: ${{ runner.os }}-flutter-${{ hashFiles('**/pubspec.lock') }}
```

### 2. Parallel Execution

Run independent tasks in parallel:

```yaml
jobs:
  test-android:
    runs-on: ubuntu-latest
    # ... Android tests

  test-ios:
    runs-on: macos-latest
    # ... iOS tests

  lint:
    runs-on: ubuntu-latest
    # ... Linting
```

### 3. Fail Fast

```yaml
strategy:
  fail-fast: true  # Stop all jobs if one fails
  matrix:
    platform: [android, ios, flutter]
```

### 4. Artifact Management

```yaml
- name: Upload Build Artifacts
  uses: actions/upload-artifact@v4
  with:
    name: app-${{ matrix.platform }}-${{ github.sha }}
    path: |
      build/**/*.apk
      build/**/*.ipa
    retention-days: 30
```

### 5. Environment Validation

Always validate environment before builds:

```yaml
- name: Validate Environment
  run: |
    npx mcp-mobile-server exec flutter_doctor
    npx mcp-mobile-server exec android_list_devices
```

### 6. Headless Emulators

Use headless mode for CI/CD:

```bash
npx mcp-mobile-server exec android_start_emulator \
  --avdName test_device \
  --options.noWindow true \
  --options.gpu swiftshader_indirect
```

### 7. Timeout Configuration

Set appropriate timeouts for long-running tasks:

```yaml
- name: Build Release APK
  timeout-minutes: 30
  run: |
    npx mcp-mobile-server exec android_gradle_build \
      --projectPath ./android \
      --task assembleRelease
```

---

## Troubleshooting

### Issue: Android SDK Not Found

**Solution:**
```yaml
- name: Setup Android SDK
  run: |
    export ANDROID_SDK_ROOT=/opt/android-sdk
    npx mcp-mobile-server exec android_sdk_setup --action install
```

### Issue: Emulator Startup Timeout

**Solution:**
```yaml
- name: Start Emulator with Extended Timeout
  run: |
    npx mcp-mobile-server exec android_emulator_workflow \
      --avdName test_device \
      --timeout 300000  # 5 minutes
```

### Issue: iOS Simulator Not Available (Linux/Windows)

**Solution:**
iOS simulators only work on macOS runners. Use conditional jobs:

```yaml
build-ios:
  if: runner.os == 'macOS'
  runs-on: macos-latest
```

### Issue: Out of Memory During Build

**Solution:**
```yaml
- name: Increase Gradle Memory
  run: |
    export GRADLE_OPTS="-Xmx4096m -XX:MaxPermSize=512m"
    npx mcp-mobile-server exec android_gradle_build \
      --projectPath ./android \
      --task assembleRelease
```

### Issue: Permission Denied (gradlew)

**Solution:**
```yaml
- name: Make gradlew Executable
  run: chmod +x android/gradlew
```

---

## Example: Complete CI/CD Pipeline

### Multi-Platform Build and Deploy

```yaml
name: Multi-Platform Mobile CI/CD

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install MCP Mobile Server
        run: npm install -g @cristianoaredes/mcp-mobile-server

      - name: Build Release APK
        run: |
          npx mcp-mobile-server exec android_gradle_build \
            --projectPath ./android \
            --task assembleRelease

      - name: Sign APK
        run: |
          # Signing logic here

      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_JSON }}
          packageName: com.example.app
          releaseFiles: android/app/build/outputs/apk/release/*.apk
          track: production

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install MCP Mobile Server
        run: npm install -g @cristianoaredes/mcp-mobile-server

      - name: Build iOS App
        run: |
          npx mcp-mobile-server exec ios_xcodebuild \
            --workspace MyApp.xcworkspace \
            --scheme MyApp \
            --configuration Release

      - name: Upload to TestFlight
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: build/ios/ipa/MyApp.ipa
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_API_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_API_PRIVATE_KEY }}
```

---

## Additional Resources

- [MCP Mobile Server Documentation](../README.md)
- [Android Workflow Guide](../examples/android-workflow.md)
- [iOS Workflow Guide](../examples/ios-workflow.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)

---

**Last Updated:** 2025-11-16
**Version:** 2.3.0
