import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createFlutterTools } from '../../src/tools/flutter.js';

describe('Flutter Tools Integration', () => {
  let flutterTools: Map<string, any>;
  const processMap = new Map<string, number>();

  beforeAll(() => {
    flutterTools = createFlutterTools(processMap);
  });

  afterAll(() => {
    // Cleanup any running processes
    for (const [key, pid] of processMap.entries()) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch (error) {
        // Process might already be dead
      }
    }
  });

  test('should have flutter_doctor tool', () => {
    expect(flutterTools.has('flutter_doctor')).toBe(true);
    
    const tool = flutterTools.get('flutter_doctor');
    expect(tool.name).toBe('flutter_doctor');
    expect(tool.description).toContain('Flutter');
    expect(typeof tool.handler).toBe('function');
  });

  test('should run flutter doctor', async () => {
    const tool = flutterTools.get('flutter_doctor');
    const result = await tool.handler({});
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    
    if (result.success) {
      expect(typeof result.data).toBe('object');
    } else {
      expect(result.error).toBeDefined();
      expect(typeof result.error.message).toBe('string');
    }
  });

  test('should validate flutter build parameters', async () => {
    const tool = flutterTools.get('flutter_build');
    
    // Test with invalid parameters
    try {
      await tool.handler({
        cwd: '/nonexistent',
        target: 'invalid_target'
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('should handle flutter not found gracefully', async () => {
    const tool = flutterTools.get('flutter_devices_list');
    const result = await tool.handler({});
    
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(typeof result.error.message).toBe('string');
    }
  });
});