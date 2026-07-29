import { describe, it, expect, vi } from 'vitest';
import { ConfigManager } from './config';

describe('ConfigManager', () => {
  it('should initialize with default values', () => {
    const config = new ConfigManager();
    expect(config.get('preset')).toBe('fantasy');
    expect(config.get('heightScale')).toBe(1.0);
    expect(config.get('density')).toBe(0.7);
    expect(config.get('toonEnabled')).toBe(true);
    expect(config.get('wireframeEnabled')).toBe(false);
  });

  it('should allow setting and getting values', () => {
    const config = new ConfigManager();
    config.set('preset', 'neon');
    config.set('heightScale', 1.5);
    expect(config.get('preset')).toBe('neon');
    expect(config.get('heightScale')).toBe(1.5);
  });

  it('should support updating multiple properties at once', () => {
    const config = new ConfigManager();
    config.update({
      preset: 'monochrome',
      density: 0.4,
    });
    expect(config.get('preset')).toBe('monochrome');
    expect(config.get('density')).toBe(0.4);
    // Unspecified values should remain unchanged
    expect(config.get('heightScale')).toBe(1.0);
  });

  it('should notify subscribers when config changes', () => {
    const config = new ConfigManager();
    const listener = vi.fn();
    
    const unsubscribe = config.subscribe(listener);
    
    config.set('heightScale', 2.0);
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      preset: 'fantasy',
      heightScale: 2.0,
      density: 0.7,
      toonEnabled: true,
      wireframeEnabled: false,
    });

    unsubscribe();
    config.set('density', 0.1);
    // Listener should not be called after unsubscribing
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle listeners that throw exceptions without interrupting notification of other listeners', () => {
    const config = new ConfigManager();
    const badListener = vi.fn().mockImplementation(() => {
      throw new Error('Boom');
    });
    const goodListener = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    config.subscribe(badListener);
    config.subscribe(goodListener);

    config.set('density', 0.9);

    expect(badListener).toHaveBeenCalled();
    expect(goodListener).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should ignore duplicate sets or undefined updates', () => {
    const config = new ConfigManager();
    const listener = vi.fn();
    config.subscribe(listener);

    // Set to same value
    config.set('preset', 'fantasy');
    expect(listener).not.toHaveBeenCalled();

    // Update with undefined and same values
    config.update({
      preset: 'fantasy',
      heightScale: undefined,
    });
    expect(listener).not.toHaveBeenCalled();
  });
});
