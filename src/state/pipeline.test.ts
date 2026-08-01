import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PipelineStateManager } from './pipeline';

describe('PipelineStateManager', () => {
  let pipeline: PipelineStateManager;

  beforeEach(() => {
    vi.useFakeTimers();
    pipeline = new PipelineStateManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with idle state', () => {
    const current = pipeline.get();
    expect(current.state).toBe('idle');
    expect(current.progress).toBe(0);
    expect(current.statusText).toBe('');
  });

  it('should allow setting explicit state, progress, and status', () => {
    pipeline.setState('extruding', 85, 'Extruding shapes...');
    const current = pipeline.get();
    expect(current.state).toBe('extruding');
    expect(current.progress).toBe(85);
    expect(current.statusText).toBe('Extruding shapes...');
  });

  it('should simulate progress on startLoading', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8); // 0.8 * 5 + 1 = 5% increment
    const listener = vi.fn();
    pipeline.subscribe(listener);

    // Initial state is idle (first call to listener)
    expect(listener).toHaveBeenCalledTimes(1);

    pipeline.startLoading();
    // Setting state to fetching_metadata (second call)
    expect(listener).toHaveBeenCalledTimes(2);
    expect(pipeline.get().state).toBe('fetching_metadata');
    expect(pipeline.get().progress).toBe(10);

    // Tick 1: 300ms -> +5% -> 15% progress
    vi.advanceTimersByTime(300);
    expect(pipeline.get().progress).toBe(15);

    // Advance 7 more ticks (2100ms) -> +35% -> 50% progress
    vi.advanceTimersByTime(2100);
    expect(pipeline.get().progress).toBe(50);
    expect(pipeline.get().state).toBe('downloading_footprints');
    expect(pipeline.get().statusText).toBe('Downloading spatial footprints from OpenStreetMap...');

    // Advance enough to cap at 75%
    vi.advanceTimersByTime(3000);
    expect(pipeline.get().progress).toBe(75);
    expect(pipeline.get().state).toBe('downloading_footprints');
  });

  it('should stop simulation on transition to non-loading states', () => {
    pipeline.startLoading();
    expect(pipeline.get().state).toBe('fetching_metadata');

    pipeline.setState('extruding', 85, 'Extruding...');
    expect(pipeline.get().state).toBe('extruding');

    // Advancing timer should not change state or progress
    vi.advanceTimersByTime(1000);
    expect(pipeline.get().state).toBe('extruding');
    expect(pipeline.get().progress).toBe(85);
  });
});
