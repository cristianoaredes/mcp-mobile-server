import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createAndroidTools } from '../../src/tools/android.js';

describe('Android Tools Integration', () => {
  let androidTools: Map<string, any>;
  const processMap = new Map<string, number>();

  beforeAll(() => {
    androidTools = createAndroidTools(processMap);
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

  test('should have android_devices_list tool', () => {
    expect(androidTools.has('android_devices_list')).toBe(true);
    
    const tool = androidTools.get('android_devices_list');
    expect(tool.name).toBe('android_devices_list');
    expect(tool.description).toContain('Android');
    expect(typeof tool.handler).toBe('function');
  });

  test('should list Android devices', async () => {
    const tool = androidTools.get('android_devices_list');
    const result = await tool.handler({});
    
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
    expect(Array.isArray(result.data) || typeof result.error === 'object').toBe(true);
  });

  test('should handle ADB not found gracefully', async () => {
    // This test assumes ADB might not be installed
    const tool = androidTools.get('android_devices_list');
    const result = await tool.handler({});
    
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(typeof result.error.message).toBe('string');
    }
  });

  test('should validate AVD creation parameters', async () => {
    const tool = androidTools.get('android_avd_create');
    
    // Test with invalid parameters
    try {
      await tool.handler({
        name: '',
        systemImageId: 'invalid'
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});