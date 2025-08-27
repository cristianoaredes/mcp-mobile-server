# 🔄 Fallback System Usage Examples

The MCP Mobile Server includes a comprehensive fallback system that automatically provides alternative implementations when primary tools are unavailable.

## 📱 Device Management Fallbacks

### ADB → Native-run Fallback

When ADB is not available, the server automatically falls back to native-run for device operations:

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device_0",
        "name": "Pixel 7 Android Emulator",
        "platform": "android",
        "available": true
      }
    ],
    "totalCount": 1,
    "onlineCount": 1,
    "fallbackInfo": {
      "usedFallback": true,
      "fallbackTool": "native-run",
      "message": "Listed devices using native-run instead of ADB"
    }
  }
}
```

### Supported ADB → Native-run Mappings

| ADB Command | Native-run Equivalent | Status |
|-------------|----------------------|---------|
| `adb devices` | `native-run android --list` | ✅ Fully Supported |
| `adb install app.apk` | `native-run android --app app.apk` | ✅ Fully Supported |
| `adb shell am start` | `native-run android --app com.package` | ✅ Limited Support |

## 🔧 Build Tool Fallbacks

### Gradle Wrapper → System Gradle

When project Gradle wrapper is not available:

```javascript
// Usage in tools
const result = await fallbackManager.executeGradleWithFallback(
  '/path/to/project',
  ['build', '--info']
);

if (result.usedFallback) {
  console.log(result.message); // "Used system Gradle instead of project Gradle wrapper"
}
```

## 🏥 Health Check with Fallback Analysis

Use the enhanced health check tool to see fallback recommendations:

```bash
# Basic health check
health_check

# Detailed analysis with recommendations
health_check --verbose true
```

Example output with recommendations:
```json
{
  "success": true,
  "data": {
    "server": "mcp-mobile-server",
    "status": "healthy",
    "toolHealth": {
      "expectedWorking": 45,
      "safeForTesting": 23
    },
    "detailedAnalysis": {
      "recommendations": [
        "💡 Using native-run as ADB alternative. For full Android SDK: https://developer.android.com/studio",
        "💡 System Gradle not available. Projects will use Gradle wrapper if available."
      ]
    }
  }
}
```

## 🎯 Smart Error Messages

The fallback system provides enhanced error messages for common scenarios:

### Flutter Issues
```json
{
  "success": false,
  "error": "No connected devices found. Please connect a device or start an emulator."
}
```

### Tool Unavailability
```json
{
  "success": false,
  "error": "Neither ADB nor native-run are available. Install native-run: npm install -g native-run"
}
```

## 🔄 Automatic Tool Detection

The fallback system automatically caches tool availability:

```typescript
// Check if tools are available
const adbAvailable = await fallbackManager.checkToolAvailability(RequiredTool.ADB);
const nativeRunAvailable = await fallbackManager.checkToolAvailability(RequiredTool.NATIVE_RUN);

if (!adbAvailable && nativeRunAvailable) {
  console.log("Will use native-run for device operations");
}
```

## 🌟 Benefits of Fallback System

1. **Graceful Degradation**: Operations continue even when primary tools are missing
2. **Transparent Fallbacks**: Users are informed when fallbacks are used
3. **Smart Recommendations**: Helpful suggestions for missing dependencies
4. **Cached Detection**: Tool availability is cached for performance
5. **Enhanced Error Messages**: Context-aware error reporting

## 🚀 Integration Examples

### Claude Desktop Usage

When using with Claude Desktop, fallback information is included in responses:

```
User: "List my Android devices"
Claude: Using android_list_devices tool...

Response: I found 2 Android devices using native-run (ADB fallback):
- Pixel 7 Emulator (online)
- Physical Device ABC123 (offline)

Note: Using native-run instead of ADB for device management.
```

### Programmatic Usage

```typescript
import { fallbackManager } from './utils/fallbacks.js';

// Execute with automatic fallback
const result = await fallbackManager.executeAdbWithFallback(
  ['devices'],
  { platform: 'android' }
);

if (result.success) {
  console.log('Devices:', result.data);
  if (result.usedFallback) {
    console.log('Used fallback:', result.fallbackTool);
  }
} else {
  console.error('Failed:', result.error);
}
```

## ⚙️ Configuration

### Environment-specific Fallbacks

The system respects environment configurations:

```bash
# Prefer native-run over ADB
PREFER_NATIVE_RUN=true

# Disable specific fallbacks
DISABLE_GRADLE_FALLBACK=true
```

### Custom Fallback Priority

Future versions will support custom fallback priority:

```json
{
  "fallbackPriority": {
    "deviceManagement": ["native-run", "adb"],
    "buildTools": ["gradlew", "gradle", "maven"]
  }
}
```

---

This fallback system ensures your mobile development workflow remains uninterrupted even when tools are missing or misconfigured.