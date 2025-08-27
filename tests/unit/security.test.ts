import { describe, test, expect } from 'vitest';
import { validateEnvironment } from '../../src/utils/security.js';

describe('SecurityValidator', () => {
  test('should validate environment successfully', async () => {
    const result = await validateEnvironment();
    
    expect(result).toBeDefined();
    expect(typeof result.platform).toBe('string');
    expect(typeof result.nodeVersion).toBe('string');
  });

  test('should detect platform correctly', async () => {
    const result = await validateEnvironment();
    
    expect(result.platform).toMatch(/darwin|linux|win32/);
  });

  test('should check Node.js version', async () => {
    const result = await validateEnvironment();
    
    expect(result.nodeVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});