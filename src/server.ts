#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { processExecutor } from './utils/process.js';
import { validateEnvironment } from './utils/security.js';

// Import tool handlers
import { createAndroidTools } from './tools/android.js';
import { createIOSTools } from './tools/ios.js';
import { createFlutterTools } from './tools/flutter.js';

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
 */
async function registerTools() {
  // Create tool handlers with shared process map
  const androidTools = createAndroidTools(globalProcessMap);
  const iosTools = createIOSTools(globalProcessMap);
  const flutterTools = createFlutterTools(globalProcessMap);

  // Register Android tools
  for (const [name, tool] of androidTools.entries()) {
    tools.set(name, tool);
  }

  // Register iOS tools
  for (const [name, tool] of iosTools.entries()) {
    tools.set(name, tool);
  }

  // Register Flutter tools
  for (const [name, tool] of flutterTools.entries()) {
    tools.set(name, tool);
  }

  // Register health check tool
  tools.set('health_check', {
    name: 'health_check',
    description: 'Check server health and tool availability',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async () => {
      const env = await validateEnvironment();
      return {
        success: true,
        data: {
          server: 'mcp-mobile-server',
          version: '1.0.0',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: env,
          activeProcesses: Array.from(globalProcessMap.entries()).map(([key, pid]) => ({
            key,
            pid
          }))
        }
      };
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