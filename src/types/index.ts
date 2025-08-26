import { z } from 'zod';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface JobResponse {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

// Environment info
export const EnvironmentInfoSchema = z.object({
  os: z.string(),
  paths: z.object({
    androidSdk: z.string().nullable(),
    xcodePath: z.string().nullable(),
    flutterPath: z.string().nullable(),
  }),
  tools: z.object({
    adb: z.string().nullable(),
    simctl: z.string().nullable(),
    xcodebuild: z.string().nullable(),
    flutter: z.string().nullable(),
    sdkmanager: z.string().nullable(),
    avdmanager: z.string().nullable(),
    emulator: z.string().nullable(),
  }),
});

export type EnvironmentInfo = z.infer<typeof EnvironmentInfoSchema>;

// Android types
export const AndroidPackageSchema = z.object({
  packages: z.array(z.string()),
});

export const AndroidAvdCreateSchema = z.object({
  name: z.string(),
  systemImageId: z.string(),
  sdcard: z.string().optional(),
  device: z.string().optional(),
});

export const AndroidEmulatorStartSchema = z.object({
  avdName: z.string(),
  options: z.object({
    noWindow: z.boolean().optional(),
    port: z.number().optional(),
    gpu: z.string().optional(),
  }).optional(),
});

export const AndroidAdbInstallSchema = z.object({
  serial: z.string(),
  apkPath: z.string(),
  options: z.object({
    replace: z.boolean().optional(),
    test: z.boolean().optional(),
  }).optional(),
});

export const AndroidAdbShellSchema = z.object({
  serial: z.string(),
  command: z.string(),
});

export const AndroidAdbUninstallSchema = z.object({
  serial: z.string(),
  packageName: z.string(),
});

export const AndroidAdbLogcatSchema = z.object({
  serial: z.string(),
  filter: z.string().optional(),
  lines: z.number().optional(),
  clear: z.boolean().optional(),
});

// iOS types
export const IosSimulatorActionSchema = z.object({
  udid: z.string(),
});

export const IosSimulatorOpenUrlSchema = z.object({
  udid: z.string(),
  url: z.string(),
});

export const IosSimulatorScreenshotSchema = z.object({
  udid: z.string(),
  path: z.string(),
});

export const IosSimulatorRecordSchema = z.object({
  udid: z.string(),
  path: z.string(),
  duration: z.number().optional(),
});

export const IosXcodeBuildSchema = z.object({
  workspace: z.string().optional(),
  project: z.string().optional(),
  scheme: z.string(),
  configuration: z.string().optional(),
  destination: z.string().optional(),
});

// Flutter types
export const FlutterEmulatorLaunchSchema = z.object({
  emulatorId: z.string(),
});

export const FlutterRunSchema = z.object({
  cwd: z.string(),
  deviceId: z.string().optional(),
  target: z.string().optional(),
  flavor: z.string().optional(),
  debugPort: z.number().optional(),
});

export const FlutterBuildSchema = z.object({
  cwd: z.string(),
  target: z.enum(['android', 'ios', 'web', 'macos', 'linux', 'windows']),
  buildMode: z.enum(['debug', 'profile', 'release']).optional(),
  flavor: z.string().optional(),
});

export const FlutterTestSchema = z.object({
  cwd: z.string(),
  testFile: z.string().optional(),
  coverage: z.boolean().optional(),
});

// Command execution types
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface SecurityConfig {
  allowedCommands: string[];
  maxExecutionTime: number;
  maxOutputSize: number;
}