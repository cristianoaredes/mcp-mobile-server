#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { processExecutor } from './utils/process.js';
import { validateEnvironment } from './utils/security.js';
import { generateHealthCheckReport, TOOL_REGISTRY, RequiredTool, ToolCategory } from './utils/tool-categories.js';
import { fallbackManager } from './utils/fallbacks.js';

// Import tool handlers
import { createAndroidTools } from './tools/android.js';
import { createIOSTools } from './tools/ios.js';
import { createFlutterTools } from './tools/flutter.js';
import { createSuperTools } from './tools/super-tools.js';

// Global process tracking
const globalProcessMap = new Map<string, number>();

const server = new Server(
  {
    name: 'mcp-mobile-server',
    version: '1.0.0',
  }
);

// Tool registry
const tools = new Map<string, any>();

/**
 * Register all MCP tools
 * Only registers tools that are defined in TOOL_REGISTRY
 */
async function registerTools() {
  // Create tool handlers with shared process map
  const androidTools = createAndroidTools(globalProcessMap);
  const iosTools = createIOSTools(globalProcessMap);
  const flutterTools = createFlutterTools(globalProcessMap);
  const superTools = createSuperTools(globalProcessMap);

  // Combine all tool sources
  const allAvailableTools = new Map<string, any>([
    ...androidTools.entries(),
    ...iosTools.entries(),
    ...flutterTools.entries(),
    ...superTools.entries()
  ]);

  // Only register tools that are in TOOL_REGISTRY
  for (const toolName of Object.keys(TOOL_REGISTRY)) {
    if (allAvailableTools.has(toolName)) {
      tools.set(toolName, allAvailableTools.get(toolName));
    } else if (toolName === 'health_check') {
      // health_check is handled separately below
      continue;
    } else {
      // Tool is in registry but not implemented - log warning
      console.warn(`Warning: Tool '${toolName}' is in TOOL_REGISTRY but not implemented`);
    }
  }

  // Register health check tool
  tools.set('health_check', {
    name: 'health_check',
    description: 'Check server health, tool availability and environment status',
    inputSchema: {
      type: 'object',
      properties: {
        verbose: {
          type: 'boolean',
          description: 'Include detailed tool analysis and recommendations'
        }
      },
      required: []
    },
    handler: async (args: any) => {
      const env = await validateEnvironment();
      const verbose = args?.verbose || false;
      
      // Convert env.availableTools to match RequiredTool enum format
      const toolAvailability: Record<string, boolean> = {};
      for (const [toolName, isAvailable] of Object.entries(env.availableTools)) {
        // Map common tool names to RequiredTool enum values
        const mappedToolName = toolName === 'native-run' ? RequiredTool.NATIVE_RUN : 
                               toolName === 'adb' ? RequiredTool.ADB :
                               toolName === 'flutter' ? RequiredTool.FLUTTER :
                               toolName === 'xcrun' ? RequiredTool.XCRUN :
                               toolName === 'xcodebuild' ? RequiredTool.XCODEBUILD :
                               toolName as RequiredTool;
        toolAvailability[mappedToolName] = isAvailable as boolean;
      }
      
      const healthReport = generateHealthCheckReport(toolAvailability);
      
      const baseHealth = {
        success: true,
        data: {
          server: 'mcp-mobile-server',
          version: '1.0.0',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          registeredTools: tools.size,
          environment: env,
          toolHealth: {
            totalAvailable: healthReport.totalTools,
            expectedWorking: healthReport.expectedWorkingTools,
            safeForTesting: healthReport.safeForTesting,
            byCategory: healthReport.categoryCounts,
            byPlatform: healthReport.platformCounts,
          },
          activeProcesses: Array.from(globalProcessMap.entries()).map(([key, pid]) => ({
            key,
            pid
          }))
        }
      };

      if (verbose) {
        // Add detailed analysis
        const workingTools = Object.entries(TOOL_REGISTRY).filter(([_, toolInfo]) => {
          return toolInfo.requiredTools.every(req => toolAvailability[req]);
        });

        const brokenTools = Object.entries(TOOL_REGISTRY).filter(([_, toolInfo]) => {
          return !toolInfo.requiredTools.every(req => toolAvailability[req]);
        });

        (baseHealth.data as any).detailedAnalysis = {
          workingTools: workingTools.map(([name, info]) => ({
            name,
            category: info.category,
            platform: info.platform,
            description: info.description,
            safeForTesting: info.safeForTesting
          })),
          brokenTools: brokenTools.map(([name, info]) => ({
            name,
            category: info.category,
            platform: info.platform,
            description: info.description,
            missingRequirements: info.requiredTools.filter(req => !toolAvailability[req])
          })),
          recommendations: await fallbackManager.generateFallbackRecommendations()
        };
      }

      return baseHealth;
    }
  });

  console.log(`Registered ${tools.size} MCP tools`);
}

/**
 * List tools handler
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolList = Array.from(tools.values()).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  return { tools: toolList };
});

/**
 * Call tool handler
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const tool = tools.get(name);
  if (!tool) {
    throw new Error(`Tool "${name}" not found`);
  }

  console.log(`Executing tool: ${name}`, args);

  try {
    const result = await tool.handler(args || {});
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    console.error(`Tool execution failed: ${name}`, error);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              code: 'TOOL_EXECUTION_ERROR',
              message: error.message,
              details: error.stack,
            },
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Graceful shutdown handler
 */
process.on('SIGINT', async () => {
  console.log('Shutting down MCP server...');
  
  // Kill any running processes
  for (const [key, pid] of globalProcessMap.entries()) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`Terminated process ${key} (PID: ${pid})`);
    } catch (error) {
      console.warn(`Failed to terminate process ${key} (PID: ${pid}): ${error}`);
    }
  }
  
  await server.close();
  process.exit(0);
});

/**
 * Main server startup
 */
async function main() {
  // Validate command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('validate')) {
    // MCP validation mode
    console.log('MCP Mobile Server - Validation Mode');
    
    // Register tools for validation
    await registerTools();
    
    console.log('✅ Server configuration is valid');
    console.log(`✅ ${tools.size} tools registered`);
    
    // List all tools
    console.log('\n📋 Available tools:');
    for (const [name, tool] of tools.entries()) {
      console.log(`  - ${name}: ${tool.description}`);
    }
    
    process.exit(0);
  }

  // Register all tools
  await registerTools();

  // Check environment
  const env = await validateEnvironment();
  console.log('Environment validation completed', env);

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('🚀 MCP Mobile Server started successfully');
  console.log(`📱 ${tools.size} mobile development tools available`);
  console.log('🔗 Connected via stdio transport');
  
  // Keep the process alive
  process.stdin.resume();
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});