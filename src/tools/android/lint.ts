import { z } from 'zod';
import { ProcessExecutor } from '../../utils/process.js';
import path from 'path';
import fs from 'fs/promises';

const processExecutor = new ProcessExecutor();

// Zod schemas for Android Lint operations
const AndroidLintCheckSchema = z.object({
  projectPath: z.string().min(1),
  options: z.object({
    check: z.array(z.string()).optional(),
    ignore: z.array(z.string()).optional(),
    disable: z.array(z.string()).optional(),
    enable: z.array(z.string()).optional(),
    warningsAsErrors: z.boolean().default(false),
    abortOnError: z.boolean().default(true),
    quiet: z.boolean().default(false),
    verbose: z.boolean().default(false),
    outputFormat: z.enum(['text', 'xml', 'html']).default('text'),
    outputFile: z.string().optional(),
  }).optional(),
});

const AndroidLintExplainSchema = z.object({
  issueId: z.string().min(1),
});

const AndroidLintBaselineSchema = z.object({
  projectPath: z.string().min(1),
  baselineFile: z.string().default('lint-baseline.xml'),
});

// Helper function to find gradlew
async function findGradleWrapper(projectPath: string): Promise<string> {
  const gradlewPath = process.platform === 'win32' ? 'gradlew.bat' : 'gradlew';
  const fullPath = path.join(projectPath, gradlewPath);
  
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
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

// Helper function to parse lint output
function parseLintOutput(output: string): any {
  const issues: Array<{
    id: string;
    severity: string;
    message: string;
    file?: string;
    line?: number;
    column?: number;
  }> = [];
  
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Parse lint issue format: File:Line:Column: Severity: Message [IssueId]
    const match = line.match(/^(.+):(\d+):(\d+):\s*(Error|Warning|Information):\s*(.+?)\s*\[(.+)\]$/);
    
    if (match) {
      const [, file, lineNum, column, severity, message, id] = match;
      issues.push({
        id: id?.trim() || '',
        severity: severity?.toLowerCase() || '',
        message: message?.trim() || '',
        file: file?.trim(),
        line: parseInt(lineNum || '0'),
        column: parseInt(column || '0')
      });
    }
  }
  
  return issues;
}

export function createAndroidLintTools(): Map<string, any> {
  const tools = new Map();

  tools.set('android_lint_check', {
    name: 'android_lint_check',
    description: 'Run Android Lint static analysis on project',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        },
        options: {
          type: 'object',
          properties: {
            check: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific lint checks to run'
            },
            ignore: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lint checks to ignore'
            },
            disable: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lint checks to disable'
            },
            enable: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lint checks to enable'
            },
            warningsAsErrors: {
              type: 'boolean',
              description: 'Treat warnings as errors',
              default: false
            },
            abortOnError: {
              type: 'boolean',
              description: 'Abort on first error',
              default: true
            },
            quiet: {
              type: 'boolean',
              description: 'Quiet mode - only show errors',
              default: false
            },
            verbose: {
              type: 'boolean',
              description: 'Verbose output',
              default: false
            },
            outputFormat: {
              type: 'string',
              enum: ['text', 'xml', 'html'],
              description: 'Output format',
              default: 'text'
            },
            outputFile: {
              type: 'string',
              description: 'Output file path'
            }
          }
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidLintCheckSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const gradleArgs = ['lint'];
        
        // Add lint options
        if (parsed.options?.check && parsed.options.check.length > 0) {
          gradleArgs.push('--check', parsed.options.check.join(','));
        }
        
        if (parsed.options?.ignore && parsed.options.ignore.length > 0) {
          gradleArgs.push('--ignore', parsed.options.ignore.join(','));
        }
        
        if (parsed.options?.disable && parsed.options.disable.length > 0) {
          gradleArgs.push('--disable', parsed.options.disable.join(','));
        }
        
        if (parsed.options?.enable && parsed.options.enable.length > 0) {
          gradleArgs.push('--enable', parsed.options.enable.join(','));
        }
        
        if (parsed.options?.warningsAsErrors) {
          gradleArgs.push('--warnings-as-errors');
        }
        
        if (!parsed.options?.abortOnError) {
          gradleArgs.push('--continue');
        }
        
        if (parsed.options?.quiet) {
          gradleArgs.push('--quiet');
        }
        
        if (parsed.options?.verbose) {
          gradleArgs.push('--info');
        }
        
        const result = await processExecutor.execute(gradlePath, gradleArgs, {
          cwd: parsed.projectPath,
          timeout: 300000, // 5 minutes
        });
        
        // Parse lint results
        const issues = parseLintOutput(result.stdout + '\n' + result.stderr);
        
        const summary = {
          totalIssues: issues.length,
          errors: issues.filter((i: any) => i.severity === 'error').length,
          warnings: issues.filter((i: any) => i.severity === 'warning').length,
          information: issues.filter((i: any) => i.severity === 'information').length
        };
        
        return {
          success: result.exitCode === 0 || issues.length === 0,
          data: {
            summary,
            issues,
            output: result.stdout,
            projectPath: parsed.projectPath,
            executionTime: result.duration
          }
        };
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'LINT_CHECK_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_lint_explain', {
    name: 'android_lint_explain',
    description: 'Get detailed explanation of a specific lint issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: {
          type: 'string',
          description: 'Lint issue ID to explain (e.g., UnusedResources, MissingTranslation)'
        }
      },
      required: ['issueId']
    },
    handler: async (args: any) => {
      const parsed = AndroidLintExplainSchema.parse(args);
      
      try {
        const result = await processExecutor.execute('lint', ['--explain', parsed.issueId], {
          timeout: 30000,
        });
        
        if (result.exitCode === 0) {
          return {
            success: true,
            data: {
              issueId: parsed.issueId,
              explanation: result.stdout,
              description: result.stdout.split('\n')[0] // First line usually contains the summary
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'LINT_EXPLAIN_FAILED',
              message: `Failed to explain lint issue: ${parsed.issueId}`,
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'LINT_EXPLAIN_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_lint_baseline', {
    name: 'android_lint_baseline',
    description: 'Create or update lint baseline file to suppress existing issues',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to Android project directory'
        },
        baselineFile: {
          type: 'string',
          description: 'Baseline file name',
          default: 'lint-baseline.xml'
        }
      },
      required: ['projectPath']
    },
    handler: async (args: any) => {
      const parsed = AndroidLintBaselineSchema.parse(args);
      
      try {
        await validateAndroidProject(parsed.projectPath);
        const gradlePath = await findGradleWrapper(parsed.projectPath);
        
        const baselinePath = path.join(parsed.projectPath, parsed.baselineFile);
        
        const result = await processExecutor.execute(gradlePath, [
          'lint',
          '--baseline',
          baselinePath
        ], {
          cwd: parsed.projectPath,
          timeout: 300000,
        });
        
        // Check if baseline file was created
        let baselineCreated = false;
        try {
          await fs.access(baselinePath);
          baselineCreated = true;
        } catch {
          baselineCreated = false;
        }
        
        return {
          success: true,
          data: {
            baselineFile: parsed.baselineFile,
            baselinePath,
            baselineCreated,
            output: result.stdout,
            projectPath: parsed.projectPath
          }
        };
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'LINT_BASELINE_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  tools.set('android_lint_list_checks', {
    name: 'android_lint_list_checks',
    description: 'List all available lint checks and their descriptions',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (args: any) => {
      try {
        const result = await processExecutor.execute('lint', ['--list'], {
          timeout: 30000,
        });
        
        if (result.exitCode === 0) {
          // Parse the list of checks
          const checks: Array<{
            id: string;
            description: string;
            category: string;
          }> = [];
          
          const lines = result.stdout.split('\n');
          let currentCategory = '';
          
          for (const line of lines) {
            if (line.startsWith('Category: ')) {
              currentCategory = line.replace('Category: ', '').trim();
            } else if (line.includes(': ')) {
              const [id, description] = line.split(': ', 2);
              if (id && description) {
                checks.push({
                  id: id.trim(),
                  description: description.trim(),
                  category: currentCategory
                });
              }
            }
          }
          
          return {
            success: true,
            data: {
              totalChecks: checks.length,
              categories: [...new Set(checks.map(c => c.category))].filter(Boolean),
              checks
            }
          };
        } else {
          return {
            success: false,
            error: {
              code: 'LINT_LIST_FAILED',
              message: 'Failed to list lint checks',
              details: result.stderr
            }
          };
        }
        
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'LINT_LIST_ERROR',
            message: error.message,
            details: error
          }
        };
      }
    }
  });

  return tools;
}