import { describe, test, expect } from 'vitest';
import { processExecutor } from '../../src/utils/process.js';

describe('ProcessExecutor', () => {
  test('should execute simple command successfully', async () => {
    const result = await processExecutor('echo', ['test']);
    
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('test');
    expect(result.stderr).toBe('');
    expect(result.exitCode).toBe(0);
  });

  test('should handle command not found', async () => {
    const result = await processExecutor('nonexistentcommand', ['arg']);
    
    expect(result.success).toBe(false);
    expect(result.exitCode).toBeGreaterThan(0);
  });

  test('should respect timeout', async () => {
    const startTime = Date.now();
    const result = await processExecutor('sleep', ['2'], { timeout: 500 });
    const endTime = Date.now();
    
    expect(result.success).toBe(false);
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('should sanitize arguments', async () => {
    const result = await processExecutor('echo', ['test; rm -rf /']);
    
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('test; rm -rf /');
  });
});