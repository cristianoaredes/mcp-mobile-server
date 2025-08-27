import { z } from 'zod';
import { ProcessExecutor } from '../../utils/process.js';
import path from 'path';
import fs from 'fs/promises';

const processExecutor = new ProcessExecutor();

// Zod schemas for Gradle operations
const AndroidGradleBuildSchema = z.object({
  projectPath: z.string().min(1),
  task: z.string().default('assembleDebug'),
  options: z.object({
    clean: z.boolean().default(false),
    parallel: z.boolean().default(true),
    daemon: z.boolean().default(true),
    stacktrace: z.boolean().default(false),
    info: z.boolean().default(false),
    debug: z.boolean().default(false),
  }).optional(),
});

const AndroidGradleTasksSchema = z.object({
  projectPath: z.string().min(1),
  taskGroup: z.string().optional(),
});

const AndroidGradleCleanSchema = z.object({
  projectPath: z.string().min(1),
});

const AndroidGradleDependenciesSchema = z.object({
  projectPath: z.string().min(1),
  configuration: z.string().optional(),
});

// Helper function to find gradlew
async function findGradleWrapper(projectPath: string): Promise<string> {
  const gradlewPath = process.platform === 'win32' ? 'gradlew.bat' : 'gradlew';
  const fullPath = path.join(projectPath, gradlewPath);
  
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
    // Fall back to system gradle if gradlew not found
    return 'gradle';
  }
}

// Helper function to validate Android project
async function validateAndroidProject(projectPath: string): Promise<void> {
  const buildGradlePath = path.join(projectPath, 'build.gradle');
  const buildGradleKtsPath = path.join(projectPath, 'build.gradle.kts');
  
  try {
    await fs.access(buildGradlePath);
  } catch {
    try {
      await fs.access(buildGradleKtsPath);
    } catch {
      throw new Error(`No build.gradle or build.gradle.kts found in ${projectPath}`);
    }
  }
}

export function createAndroidGradleTools(): Map<string, any> {
  const tools = new Map();

  tools.set('android_gradle_build', {
    name: 'android_gradle_build',
    description: 'Build Android project using Gradle wrapper or system Gradle',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        },
        task: {
          type: 'string',
          description: 'Gradle task to execute',
          default: 'assembleDebug'
        },
        options: {
          type: 'object',
          properties: {
            clean: {
              type: 'boolean',
              description: 'Run clean before build',
              default: false
            },
            parallel: {
              type: 'boolean', 
              description: 'Enable parallel execution',
              default: true
            },
            daemon: {
              type: 'boolean',
              description: 'Use Gradle daemon',
              default: true
            },
            stacktrace: {
              type: 'boolean',
              description: 'Show full stacktrace on errors',
              default: false
            },
            info: {
              type: 'boolean',
              description: 'Set log level to INFO',
              default: false
            },
            debug: {
              type: 'boolean',
              description: 'Set log level to DEBUG',
              default: false
            }
          }
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidGradleBuildSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const gradleArgs = [];
        
        // Add options
        if (parsed.options?.clean) {
          gradleArgs.push('clean');
        }
        
        gradleArgs.push(parsed.task);
        
        if (parsed.options?.parallel) {
          gradleArgs.push('--parallel');
        }
        
        if (!parsed.options?.daemon) {
          gradleArgs.push('--no-daemon');
        }
        
        if (parsed.options?.stacktrace) {
          gradleArgs.push('--stacktrace');
        }
        
        if (parsed.options?.info) {
          gradleArgs.push('--info');
        }
        
        if (parsed.options?.debug) {
          gradleArgs.push('--debug');
        }
        
        const result = await processExecutor.execute(gradlePath, gradleArgs, {
          cwd: parsed.projectPath,
          timeout: 300000, // 5 minutes
        });
        
        if (result.exitCode === 0) {
          return {
            success: true,
            data: {
              task: parsed.task,
              output: result.stdout,
              projectPath: parsed.projectPath,
              buildTime: result.duration
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'GRADLE_BUILD_FAILED',
              message: 'Gradle build failed',
              details: {
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode
              }
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'GRADLE_BUILD_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_gradle_tasks', {
    name: 'android_gradle_tasks',
    description: 'List available Gradle tasks for Android project',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        },
        taskGroup: {
          type: 'string',
          description: 'Filter tasks by group (build, verification, etc.)'
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidGradleTasksSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const gradleArgs = ['tasks'];
        
        if (parsed.taskGroup) {
          gradleArgs.push('--group', parsed.taskGroup);
        } else {
          gradleArgs.push('--all');
        }
        
        const result = await processExecutor.execute(gradlePath, gradleArgs, {
          cwd: parsed.projectPath,
          timeout: 60000,
        });
        
        if (result.exitCode === 0) {
          // Parse tasks from output
          const tasks = result.stdout
            .split('\n')
            .filter(line => line.includes(' - '))
            .map((line: string) => {
              const [task, description] = line.split(' - ');
              return {
                name: task?.trim() || '',
                description: description?.trim() || ''
              };
            });
          
          return {
            success: true,
            data: {
              tasks,
              totalTasks: tasks.length,
              projectPath: parsed.projectPath,
              taskGroup: parsed.taskGroup
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'GRADLE_TASKS_FAILED',
              message: 'Failed to list Gradle tasks',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'GRADLE_TASKS_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_gradle_clean', {
    name: 'android_gradle_clean',
    description: 'Clean Android project build artifacts',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidGradleCleanSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const result = await processExecutor.execute(gradlePath, ['clean'], {
          cwd: parsed.projectPath,
          timeout: 120000, // 2 minutes
        });
        
        if (result.exitCode === 0) {
          return {
            success: true,
            data: {
              message: 'Project cleaned successfully',
              output: result.stdout,
              projectPath: parsed.projectPath
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'GRADLE_CLEAN_FAILED',
              message: 'Gradle clean failed',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'GRADLE_CLEAN_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_gradle_dependencies', {
    name: 'android_gradle_dependencies',
    description: 'Show Android project dependencies tree',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        },
        configuration: {
          type: 'string',
          description: 'Dependency configuration (implementation, testImplementation, etc.)'
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidGradleDependenciesSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const gradleArgs = ['dependencies'];
        
        if (parsed.configuration) {
          gradleArgs.push('--configuration', parsed.configuration);
        }
        
        const result = await processExecutor.execute(gradlePath, gradleArgs, {
          cwd: parsed.projectPath,
          timeout: 120000,
        });
        
        if (result.exitCode === 0) {
          return {
            success: true,
            data: {
              dependenciesTree: result.stdout,
              configuration: parsed.configuration,
              projectPath: parsed.projectPath
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'GRADLE_DEPENDENCIES_FAILED',
              message: 'Failed to get dependencies',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'GRADLE_DEPENDENCIES_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  return tools;
}