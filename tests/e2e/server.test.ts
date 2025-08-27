import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

describe('MCP Server E2E', () => {
  let serverProcess: ChildProcess;
  
  beforeAll(async () => {
    // Ensure server is built
    const serverPath = path.join(__dirname, '../../dist/server.js');
    
    // Start server in validation mode to test startup
    serverProcess = spawn('node', [serverPath, 'validate'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  });

  test('should start server in validation mode', (done) => {
    let output = '';
    
    serverProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.on('exit', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('tools registered');
      expect(output).toContain('Server configuration is valid');
      done();
    });
  }, 10000);

  test('should handle SIGINT gracefully', (done) => {
    const testProcess = spawn('node', [path.join(__dirname, '../../dist/server.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    testProcess.stdout?.on('data', (data) => {
      output += data.toString();
      
      // Once server is running, send SIGINT
      if (output.includes('MCP Mobile Server started successfully')) {
        testProcess.kill('SIGINT');
      }
    });

    testProcess.on('exit', (code) => {
      expect(output).toContain('Shutting down MCP server');
      done();
    });
  }, 10000);

  test('should export correct number of tools', (done) => {
    let output = '';
    
    serverProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr?.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.on('exit', () => {
      // Should have 37+ tools
      const toolCount = output.match(/(\d+) tools registered/)?.[1];
      if (toolCount) {
        expect(parseInt(toolCount)).toBeGreaterThanOrEqual(37);
      }
      done();
    });
  });
});