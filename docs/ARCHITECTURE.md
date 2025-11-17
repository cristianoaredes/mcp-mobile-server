# 🏗️ MCP Mobile Server - Architecture Documentation

**Version:** 2.3.0
**Last Updated:** November 16, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Tool Registry System](#tool-registry-system)
4. [Process Manager](#process-manager)
5. [Security Layer](#security-layer)
6. [Fallback System](#fallback-system)
7. [Request Flow](#request-flow)
8. [Tool Lifecycle](#tool-lifecycle)
9. [Error Handling](#error-handling)
10. [Performance Considerations](#performance-considerations)

---

## 🎯 Overview

MCP Mobile Server is a **Model Context Protocol (MCP)** server that provides 36 tools for mobile development automation. It's built with TypeScript and follows a modular, security-first architecture.

### Key Design Principles

1. **Security First** - All commands validated before execution
2. **Fail-Safe** - Graceful degradation with fallback mechanisms
3. **Modular** - Clear separation of concerns
4. **Type-Safe** - Strict TypeScript with runtime validation (Zod)
5. **Observable** - Comprehensive health checking and monitoring

### Technology Stack

```
┌─────────────────────────────────────┐
│  TypeScript 5.3.2 (Strict Mode)    │
├─────────────────────────────────────┤
│  @modelcontextprotocol/sdk ^0.4.0  │  ← MCP Protocol
│  zod ^3.22.4                        │  ← Runtime validation
│  execa ^8.0.1                       │  ← Process execution
│  which ^4.0.0                       │  ← Command resolution
└─────────────────────────────────────┘
```

---

## 🏛️ System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  MCP Client (Claude Desktop)                  │
│                    Transport: stdio (JSON-RPC 2.0)            │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     MCP Server (server.ts)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Server Request Handlers                       │  │
│  │  • ListToolsRequest  → Tool metadata & schemas         │  │
│  │  • CallToolRequest   → Tool execution                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                             │                                 │
│                             ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Tool Registry (TOOL_REGISTRY)              │  │
│  │  • 36 tools with metadata                              │  │
│  │  • Platform compatibility                               │  │
│  │  • Dependency requirements                              │  │
│  │  • Performance expectations                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                             │                                 │
│              ┌──────────────┼──────────────┐                 │
│              ▼              ▼              ▼                 │
│     ┌──────────────┐ ┌──────────┐ ┌─────────────┐          │
│     │Flutter Tools │ │Android   │ │iOS Tools    │          │
│     │(13 tools)    │ │Tools     │ │(10 tools)   │          │
│     │              │ │(14 tools)│ │(macOS only) │          │
│     └──────────────┘ └──────────┘ └─────────────┘          │
│                             │                                 │
│              ┌──────────────┴──────────────┐                 │
│              ▼                              ▼                 │
│     ┌──────────────┐              ┌──────────────┐          │
│     │Super-Tools   │              │Setup Tools   │          │
│     │(10 workflows)│              │(2 tools)     │          │
│     └──────────────┘              └──────────────┘          │
│                             │                                 │
│                             ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Process Executor (processExecutor)            │  │
│  │  • Command validation                                   │  │
│  │  • Timeout management                                   │  │
│  │  • Process tracking (globalProcessMap)                  │  │
│  │  • Stream handling                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                             │                                 │
│                             ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Security Validator (SecurityValidator)          │  │
│  │  • Command whitelisting                                 │  │
│  │  • Dangerous pattern detection                          │  │
│  │  • Path sanitization                                    │  │
│  │  • Argument validation                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                             │                                 │
│                             ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          Fallback Manager (fallbackManager)             │  │
│  │  • ADB → native-run fallback                           │  │
│  │  • Gradle wrapper → system gradle                      │  │
│  │  • Tool availability caching                            │  │
│  │  • Smart error messages                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                             │                                 │
└─────────────────────────────┼─────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │Flutter  │     │Android  │     │iOS      │
        │SDK      │     │SDK/ADB  │     │Xcode    │
        └─────────┘     └─────────┘     └─────────┘
```

### Directory Structure

```
src/
├── server.ts                    # Main entry point (304 lines)
├── types/
│   └── index.ts                 # Type definitions & Zod schemas (157 lines)
├── tools/                       # Tool implementations
│   ├── flutter.ts               # 13 Flutter tools (768 lines)
│   ├── android.ts               # 14 Android tools (824 lines)
│   ├── ios.ts                   # 10 iOS tools (801 lines)
│   ├── super-tools.ts           # 10 workflow tools (468 lines)
│   ├── setup-tools.ts           # 2 setup tools (462 lines)
│   └── android/                 # Android sub-modules
│       ├── gradle.ts            # Gradle operations
│       ├── lint.ts              # Code analysis
│       ├── media.ts             # Screenshot/video
│       └── native-run.ts        # Device management
└── utils/                       # Shared utilities
    ├── process.ts               # Process executor (189 lines)
    ├── security.ts              # Security validator (226 lines)
    ├── tool-categories.ts       # Tool registry (497 lines)
    └── fallbacks.ts             # Fallback manager (360 lines)
```

---

## 📊 Tool Registry System

**Location:** `src/utils/tool-categories.ts`

### Purpose

Centralized metadata system for all 36 tools, enabling:
- Dynamic tool registration
- Dependency tracking
- Performance monitoring
- Health checking
- Platform compatibility validation

### Data Structure

```typescript
export const TOOL_REGISTRY: Record<string, ToolInfo> = {
  'tool_name': {
    name: string;                    // Tool identifier
    category: ToolCategory;          // ESSENTIAL | DEPENDENT | OPTIONAL
    platform: string;                // 'android' | 'ios' | 'flutter' | 'cross-platform'
    requiredTools: RequiredTool[];   // Dependencies (adb, flutter, etc.)
    description: string;             // Human-readable description
    safeForTesting: boolean;         // Can run without side effects
    performance: {
      expectedDuration: number;      // Expected runtime (ms)
      timeout: number;               // Max allowed runtime (ms)
    }
  }
};
```

### Tool Categories

```typescript
export enum ToolCategory {
  ESSENTIAL = 'essential',   // Core functionality, must work
  DEPENDENT = 'dependent',   // Requires specific SDK/tools
  OPTIONAL = 'optional',     // Nice-to-have, can fail gracefully
}
```

### Required Tools Enum

```typescript
export enum RequiredTool {
  ADB = 'adb',                    // Android Debug Bridge
  NATIVE_RUN = 'native-run',      // Lightweight device management
  FLUTTER = 'flutter',            // Flutter SDK
  GRADLE = 'gradle',              // Android build system
  LINT = 'lint',                  // Android linter
  SDKMANAGER = 'sdkmanager',      // Android SDK manager
  AVDMANAGER = 'avdmanager',      // AVD management
  EMULATOR = 'emulator',          // Android emulator
  XCRUN = 'xcrun',                // Xcode CLI
  XCODEBUILD = 'xcodebuild',      // iOS build system
}
```

### Health Check Generation

```typescript
export function generateHealthCheckReport(
  availableTools: Record<string, boolean>
): HealthCheckReport {
  return {
    totalTools: 36,
    categoryCounts: { essential: 36, dependent: 0, optional: 0 },
    platformCounts: { android: 14, ios: 10, flutter: 13, 'cross-platform': 3 },
    requirementCounts: { /* tools per requirement */ },
    safeForTesting: 11,
    expectedWorkingTools: calculateWorking(availableTools)
  };
}
```

**Usage:** Powers the `health_check` tool with detailed environment analysis.

---

## 🔄 Process Manager

**Location:** `src/utils/process.ts` + global `processMap`

### Purpose

Manages all child processes spawned by tools, ensuring:
- Proper cleanup on server shutdown
- Process tracking for long-running operations
- Timeout enforcement
- Stream handling for real-time output

### Global Process Map

```typescript
// server.ts
const globalProcessMap = new Map<string, number>();

// Shared across all tool handlers
const flutterTools = createFlutterTools(globalProcessMap);
const androidTools = createAndroidTools(globalProcessMap);
// ...
```

### Process Executor Class

```typescript
class ProcessExecutor {
  private security: SecurityValidator;

  async execute(
    command: string,
    args: string[] = [],
    options: ExecutionOptions = {}
  ): Promise<CommandResult> {
    // 1. Security validation
    this.security.validateCommand(command, args);

    // 2. Execute with timeout
    const result = await execa(command, args, {
      cwd: options.cwd,
      timeout: options.timeout || 120000,  // 2 min default
      reject: false,                       // Don't throw on non-zero exit
      env: { ...process.env, ...options.env }
    });

    // 3. Track process if long-running
    if (options.trackProcess) {
      globalProcessMap.set(options.processId!, result.pid);
    }

    // 4. Return structured result
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode || 0,
      duration: Date.now() - startTime
    };
  }
}
```

### Process Cleanup

```typescript
// server.ts - SIGINT handler
process.on('SIGINT', async () => {
  console.log('\nShutting down MCP server...');

  // Kill all tracked processes
  for (const [key, pid] of globalProcessMap) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (err) {
      // Process already dead
    }
  }

  globalProcessMap.clear();
  process.exit(0);
});
```

### Timeout Handling

```typescript
try {
  const result = await execa(command, args, { timeout: 300000 });
} catch (error) {
  if (error.timedOut) {
    return {
      exitCode: 124,  // Standard timeout exit code
      stderr: `Command timed out after ${timeout}ms`,
      duration: timeout
    };
  }
  throw error;
}
```

---

## 🔒 Security Layer

**Location:** `src/utils/security.ts`

### Defense-in-Depth Strategy

```
User Input
    │
    ▼
┌─────────────────────────┐
│ 1. Command Whitelist    │  ← Only allowed commands
├─────────────────────────┤
│ 2. Dangerous Patterns   │  ← Block shell metacharacters
├─────────────────────────┤
│ 3. Path Sanitization    │  ← Prevent directory traversal
├─────────────────────────┤
│ 4. Argument Validation  │  ← Command-specific rules
├─────────────────────────┤
│ 5. Execution Limits     │  ← Timeout & output size
└─────────────────────────┘
    │
    ▼
Safe Execution
```

### 1. Command Whitelist

```typescript
const DEFAULT_SECURITY_CONFIG = {
  allowedCommands: [
    // Android
    'adb', 'sdkmanager', 'avdmanager', 'emulator',
    'gradle', 'gradlew', 'gradlew.bat', 'lint',

    // iOS (macOS only)
    'xcrun', 'xcodebuild', 'simctl',

    // Cross-platform
    'flutter', 'native-run',

    // System utilities
    'which', 'ls'
  ],

  maxExecutionTime: 300000,        // 5 minutes
  maxOutputSize: 10 * 1024 * 1024  // 10MB
};
```

### 2. Dangerous Pattern Detection

```typescript
const DANGEROUS_PATTERNS = [
  /[;&|`$(){}[\]]/,              // Shell metacharacters
  /\.\./,                         // Directory traversal
  /\/etc\/|\/proc\/|\/sys\//,     // System directories
  /rm\s+-rf/,                     // Destructive commands
  /sudo|su\s/,                    // Privilege escalation
  />\s*\/|>>/,                    // File redirection
];

function validateCommand(command: string, args: string[]): void {
  // Check whitelist
  if (!allowedCommands.includes(command)) {
    throw new SecurityError(`Command not allowed: ${command}`);
  }

  // Check patterns
  const fullCommand = `${command} ${args.join(' ')}`;
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(fullCommand)) {
      throw new SecurityError(`Dangerous pattern detected: ${pattern}`);
    }
  }
}
```

### 3. Command-Specific Validation

```typescript
// ADB validation
if (command === 'adb') {
  const safeAdbCommands = [
    'devices', 'install', 'uninstall', 'shell',
    'logcat', 'push', 'pull', 'screenshot', 'emu', 'kill-server'
  ];

  const adbCommand = args[0];
  if (!safeAdbCommands.includes(adbCommand)) {
    throw new SecurityError(`Unsafe adb command: ${adbCommand}`);
  }
}

// Emulator validation
if (command === 'emulator') {
  const safeEmulatorArgs = [
    '-list-avds', '-avd', '-no-window', '-port',
    '-gpu', '-wipe-data', '-no-snapshot'
  ];

  for (const arg of args) {
    if (arg.startsWith('-') && !safeEmulatorArgs.some(safe => arg.startsWith(safe))) {
      throw new SecurityError(`Unsafe emulator argument: ${arg}`);
    }
  }
}
```

### 4. Path Sanitization

```typescript
function validatePath(path: string): string {
  // Remove dangerous characters
  const sanitized = path.replace(/[;&|`$(){}[\]]/g, '');

  // Block directory traversal
  if (sanitized.includes('..')) {
    throw new SecurityError('Path traversal attempt detected');
  }

  // Block system directories
  if (/\/etc\/|\/proc\/|\/sys\//.test(sanitized)) {
    throw new SecurityError('Access to system directories not allowed');
  }

  return sanitized;
}
```

### Security Threat Matrix

| Attack Vector | Mitigation | Status |
|---------------|------------|--------|
| Command Injection | Whitelist + pattern blocking | ✅ Protected |
| Path Traversal | Path sanitization | ✅ Protected |
| Shell Metacharacters | Pattern detection | ✅ Protected |
| Arbitrary File Read | Path validation | ✅ Protected |
| Privilege Escalation | Block sudo/su | ✅ Protected |
| Resource Exhaustion | Timeout + size limits | ✅ Protected |
| DoS via Long Commands | Max execution time | ✅ Protected |

---

## 🔄 Fallback System

**Location:** `src/utils/fallbacks.ts`

### Purpose

Provide graceful degradation when preferred tools are unavailable, with:
- Automatic fallback to alternative implementations
- Tool availability caching
- Enhanced error messages with recommendations
- Zero user configuration required

### Fallback Chains

```
Primary Tool → Fallback Tool → Enhanced Error
```

#### 1. ADB → native-run Fallback

```typescript
async executeAdbWithFallback(
  adbArgs: string[],
  context: string
): Promise<CommandResult> {
  // Try ADB first
  const adbAvailable = await this.checkToolAvailability('adb');

  if (adbAvailable) {
    const result = await executor.execute('adb', adbArgs);
    if (result.exitCode === 0) return result;
  }

  // Fallback to native-run
  console.warn(`ADB unavailable, using native-run for ${context}`);
  const nativeRunArgs = this.convertAdbToNativeRun(adbArgs);
  return await executor.execute('native-run', nativeRunArgs);
}
```

**Benefits:**
- Users don't need full Android SDK (3GB) if they have native-run (15MB)
- Transparent fallback - tools work without user intervention

#### 2. Gradle Wrapper → System Gradle Fallback

```typescript
async executeGradleWithFallback(
  projectPath: string,
  gradleArgs: string[]
): Promise<CommandResult> {
  // Try project's gradlew first
  const gradlewPath = path.join(
    projectPath,
    process.platform === 'win32' ? 'gradlew.bat' : 'gradlew'
  );

  if (fs.existsSync(gradlewPath)) {
    return await executor.execute(gradlewPath, gradleArgs, {
      cwd: projectPath
    });
  }

  // Fallback to system gradle
  console.warn('Gradle wrapper not found, using system gradle');
  return await executor.execute('gradle', gradleArgs, {
    cwd: projectPath
  });
}
```

### Tool Availability Caching

```typescript
class FallbackManager {
  private toolAvailability: Map<string, boolean> = new Map();

  async checkToolAvailability(tool: string): Promise<boolean> {
    // Check cache first
    if (this.toolAvailability.has(tool)) {
      return this.toolAvailability.get(tool)!;
    }

    // Check if tool exists
    try {
      await executor.execute('which', [tool]);
      this.toolAvailability.set(tool, true);
      return true;
    } catch {
      this.toolAvailability.set(tool, false);
      return false;
    }
  }
}
```

**Performance Benefit:** Avoids repeated `which` calls for the same tool.

### Enhanced Error Messages

```typescript
function generateRecommendations(
  failedCommand: string,
  error: string
): string[] {
  const recommendations = [];

  if (failedCommand === 'adb') {
    recommendations.push('Install Android SDK platform-tools');
    recommendations.push('Or install lightweight alternative: npm install -g native-run');
    recommendations.push('Verify ANDROID_HOME environment variable');
  }

  if (failedCommand === 'flutter') {
    recommendations.push('Install Flutter SDK: https://flutter.dev/docs/get-started/install');
    recommendations.push('Add Flutter to PATH');
    recommendations.push('Run: flutter doctor');
  }

  return recommendations;
}
```

---

## 🔄 Request Flow

### MCP Request → Response Flow

```
1. Client Request (JSON-RPC)
   │
   ▼
2. MCP Server receives via stdio
   │
   ├─► ListToolsRequest
   │   └─► Returns tool metadata from TOOL_REGISTRY
   │
   └─► CallToolRequest
       │
       ▼
3. Tool Handler Lookup
   │
   ▼
4. Zod Schema Validation
   │
   ├─► ✅ Valid → Continue
   │
   └─► ❌ Invalid → Return error with details
       │
       ▼
5. Security Validation
   │
   ├─► ✅ Safe → Continue
   │
   └─► ❌ Unsafe → Reject with security error
       │
       ▼
6. Process Execution
   │
   ├─► Check tool availability
   │
   ├─► Apply fallback if needed
   │
   └─► Execute command with timeout
       │
       ▼
7. Result Handling
   │
   ├─► exitCode === 0 → Success response
   │
   └─► exitCode !== 0 → Error response
       │
       ▼
8. Return to Client
```

### Code Example

```typescript
// server.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 1. Lookup tool
  const tool = tools.get(name);
  if (!tool) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true
    };
  }

  try {
    // 2. Execute tool handler
    const result = await tool.handler(args);

    // 3. Return formatted response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});
```

---

## 🔧 Tool Lifecycle

### Tool Registration Flow

```typescript
// 1. Create tool factories with process map
const androidTools = createAndroidTools(globalProcessMap);
const iosTools = createIOSTools(globalProcessMap);
const flutterTools = createFlutterTools(globalProcessMap);
const superTools = createSuperTools(globalProcessMap);
const setupTools = createSetupTools(globalProcessMap);

// 2. Combine all tools
const allAvailableTools = new Map([
  ...androidTools.entries(),
  ...iosTools.entries(),
  ...flutterTools.entries(),
  ...superTools.entries(),
  ...setupTools.entries()
]);

// 3. Register only tools in TOOL_REGISTRY
for (const toolName of Object.keys(TOOL_REGISTRY)) {
  if (allAvailableTools.has(toolName)) {
    tools.set(toolName, allAvailableTools.get(toolName));
  } else {
    console.warn(`Tool '${toolName}' in registry but not implemented`);
  }
}
```

### Tool Handler Structure

```typescript
tools.set('tool_name', {
  name: 'tool_name',
  description: 'Human-readable description',

  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '...' },
      param2: { type: 'number', description: '...' }
    },
    required: ['param1']
  },

  handler: async (args: any) => {
    // 1. Validate input with Zod
    const schema = z.object({ /* ... */ });
    const validation = schema.safeParse(args);

    if (!validation.success) {
      throw new Error(`Invalid input: ${validation.error.message}`);
    }

    // 2. Extract validated data
    const { param1, param2 } = validation.data;

    // 3. Execute command
    const result = await processExecutor.execute(
      'command',
      [arg1, arg2],
      { cwd: param1, timeout: 60000 }
    );

    // 4. Return standardized response
    return {
      success: result.exitCode === 0,
      data: result.stdout,
      error: result.exitCode !== 0 ? {
        code: result.exitCode,
        message: result.stderr
      } : undefined
    };
  }
});
```

---

## ⚠️ Error Handling

### Error Types

```typescript
// 1. Validation Errors
class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

// 2. Security Errors
class SecurityError extends Error {
  constructor(message: string) {
    super(`Security validation failed: ${message}`);
    this.name = 'SecurityError';
  }
}

// 3. Execution Errors
class ExecutionError extends Error {
  constructor(
    public exitCode: number,
    public stdout: string,
    public stderr: string
  ) {
    super(`Command failed with exit code ${exitCode}`);
    this.name = 'ExecutionError';
  }
}

// 4. Timeout Errors
class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Command timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: number | string;
    message: string;
    details?: any;
    recommendations?: string[];
  };
}
```

### Error Handling Pattern

```typescript
try {
  // Attempt operation
  const result = await execute();

  return {
    success: true,
    data: result
  };

} catch (error) {
  // Categorize and enhance error
  if (error instanceof SecurityError) {
    return {
      success: false,
      error: {
        code: 'SECURITY_ERROR',
        message: error.message,
        recommendations: ['Review command arguments', 'Contact administrator']
      }
    };
  }

  if (error instanceof TimeoutError) {
    return {
      success: false,
      error: {
        code: 'TIMEOUT',
        message: error.message,
        recommendations: ['Increase timeout', 'Check system performance']
      }
    };
  }

  // Generic error handling
  return {
    success: false,
    error: {
      code: 'UNKNOWN',
      message: error.message
    }
  };
}
```

---

## ⚡ Performance Considerations

### Performance Characteristics by Category

| Category | Tools | Avg Duration | Max Timeout | Optimization |
|----------|-------|--------------|-------------|--------------|
| **Core Tools** | 5 | 1-8s | 30s | ✅ Fast, cached |
| **Device Management** | 9 | 1-60s | 180s | ⚠️ Platform dependent |
| **Development** | 6 | 10s-10min | 600s | ⚠️ CPU intensive |
| **Utilities** | 4 | 3-30s | 60s | ✅ Quick operations |
| **Super-Tools** | 10 | 30s-30min | 1800s | ⚠️ Complex workflows |
| **Setup Tools** | 2 | 5s-10min | 600s | ⚠️ One-time setup |

### Optimization Strategies

#### 1. Tool Availability Caching

```typescript
// Instead of checking `which flutter` every time
const cache = new Map<string, boolean>();

async function isToolAvailable(tool: string): Promise<boolean> {
  if (cache.has(tool)) {
    return cache.get(tool)!;
  }

  const available = await checkTool(tool);
  cache.set(tool, available);
  return available;
}
```

**Benefit:** Reduces ~100ms per tool check

#### 2. Parallel Execution in Super-Tools

```typescript
// Instead of sequential
const doctor = await flutter_doctor();
const devices = await flutter_list_devices();

// Run in parallel
const [doctor, devices] = await Promise.all([
  flutter_doctor(),
  flutter_list_devices()
]);
```

**Benefit:** 2x speedup for independent operations

#### 3. Streaming Output for Long Commands

```typescript
const process = spawn('flutter', ['run'], { cwd });

process.stdout.on('data', (chunk) => {
  // Stream output in real-time instead of buffering
  console.log(chunk.toString());
});
```

**Benefit:** Better UX, lower memory usage

#### 4. Timeout Tuning

```typescript
// Short timeout for quick operations
const devices = await execute('adb', ['devices'], { timeout: 10000 });

// Long timeout for builds
const build = await execute('flutter', ['build', 'apk'], { timeout: 600000 });
```

### Performance Metrics

```typescript
interface PerformanceMetrics {
  toolName: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
}

// Collected via health_check with verbose flag
```

---

## 📚 Additional Resources

- [Tool Reference](./TOOLS.md) - Complete documentation of all 36 tools
- [Quick Start](./QUICK_START.md) - Get started in 5 minutes
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Contributing](./CONTRIBUTING.md) - Development guidelines

---

## 🔍 Architecture Decision Records (ADRs)

### ADR-001: Why MCP Protocol?

**Decision:** Use Model Context Protocol for tool exposure

**Rationale:**
- Standardized JSON-RPC interface
- First-class Claude Desktop support
- Extensible for other AI clients
- Well-documented specification

**Alternatives Considered:**
- REST API (rejected: requires server/port management)
- gRPC (rejected: overkill for this use case)
- Custom protocol (rejected: reinventing the wheel)

### ADR-002: Why Zod for Validation?

**Decision:** Use Zod for runtime type validation

**Rationale:**
- Type-safe schema definitions
- Runtime validation + compile-time inference
- Excellent error messages
- Small bundle size

**Alternatives Considered:**
- Joi (rejected: less TypeScript-friendly)
- Yup (rejected: older, less maintained)
- Custom validation (rejected: too much code)

### ADR-003: Why execa over child_process?

**Decision:** Use execa for process execution

**Rationale:**
- Better error handling
- Promise-based API
- Proper stream handling
- Cross-platform support
- Timeout management built-in

**Alternatives Considered:**
- Native child_process (rejected: more code, less features)
- shelljs (rejected: security concerns with shell=true)

### ADR-004: Why Whitelist over Blacklist?

**Decision:** Use command whitelisting for security

**Rationale:**
- Fail-secure by default
- Explicit about allowed operations
- Easier to audit
- Prevents unknown attack vectors

**Alternatives Considered:**
- Blacklist dangerous commands (rejected: incomplete protection)
- Sandboxing (rejected: platform compatibility issues)

---

**Last Updated:** November 16, 2025
**Maintainers:** @cristianoaredes
**License:** MIT
