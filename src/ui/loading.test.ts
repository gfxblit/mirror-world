// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoadingUI } from './loading';
import { pipelineState } from '../state/pipeline';

describe('LoadingUI', () => {
  let ui: LoadingUI;
  let hudLoading: HTMLDivElement;
  let loadingStatus: HTMLDivElement;
  let loadingProgressBar: HTMLDivElement;
  let statusIndicator: HTMLDivElement;
  let statusText: HTMLSpanElement;
  let pulseDot: HTMLSpanElement;

  beforeEach(() => {
    vi.useFakeTimers();

    // Set up document body markup matching index.html
    hudLoading = document.createElement('div');
    hudLoading.id = 'hud-loading';
    hudLoading.className = 'hud-loading-panel glass hidden';

    loadingStatus = document.createElement('div');
    loadingStatus.id = 'loading-status';
    loadingStatus.setAttribute('aria-live', 'polite');
    hudLoading.appendChild(loadingStatus);

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'loading-progress-bar-container';
    progressBarContainer.setAttribute('role', 'progressbar');
    progressBarContainer.setAttribute('aria-valuemin', '0');
    progressBarContainer.setAttribute('aria-valuemax', '100');
    progressBarContainer.setAttribute('aria-valuenow', '0');

    loadingProgressBar = document.createElement('div');
    loadingProgressBar.id = 'loading-progress-bar';
    progressBarContainer.appendChild(loadingProgressBar);
    hudLoading.appendChild(progressBarContainer);

    statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';

    statusText = document.createElement('span');
    statusText.className = 'status-text';
    statusText.innerText = 'PIPELINE ONLINE';
    statusIndicator.appendChild(statusText);

    pulseDot = document.createElement('span');
    pulseDot.className = 'pulse-dot';
    statusIndicator.appendChild(pulseDot);

    document.body.appendChild(hudLoading);
    document.body.appendChild(statusIndicator);

    ui = new LoadingUI();
  });

  afterEach(() => {
    ui.destroy();
    pipelineState.setState('idle', 0, '');
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize and locate DOM elements correctly', () => {
    expect(ui).toBeDefined();
    // Element states at start
    expect(hudLoading.classList.contains('hidden')).toBe(true);
  });

  it('should show loading ui, update status indicators, and simulate progress', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.8); // 0.8 * 5 + 1 = 5% increment

    pipelineState.startLoading();

    // Verify it makes the HUD loading panel visible
    expect(hudLoading.classList.contains('hidden')).toBe(false);

    // Verify status text and indicator styling
    expect(statusText.innerText).toBe('FETCHING REALITY DATA');
    expect(statusIndicator.classList.contains('status-loading')).toBe(true);
    expect(pulseDot.classList.contains('pulse-blue')).toBe(true);

    // Initial simulated progress is 10%
    expect(loadingProgressBar.style.width).toBe('10%');
    expect(loadingProgressBar.parentElement?.getAttribute('aria-valuenow')).toBe('10');
    expect(loadingStatus.innerText).toBe('Querying Overpass API (Bellevue center)...');

    // Advance time to verify interval increments progress: 1 tick of 300ms -> +5% -> 15%
    vi.advanceTimersByTime(300);
    expect(loadingProgressBar.style.width).toBe('15%');
    expect(loadingProgressBar.parentElement?.getAttribute('aria-valuenow')).toBe('15');

    // Advance 7 more ticks (2100ms) -> +35% -> 50%
    vi.advanceTimersByTime(2100);
    expect(loadingProgressBar.style.width).toBe('50%');
    expect(loadingProgressBar.parentElement?.getAttribute('aria-valuenow')).toBe('50');
    expect(loadingStatus.innerText).toBe('Downloading spatial footprints from OpenStreetMap...');

    expect(randomSpy).toHaveBeenCalled();
  });

  it('should handle successful complete state', () => {
    pipelineState.startLoading();
    pipelineState.setState('success', 100, 'Mirror World complete!');

    expect(loadingStatus.innerText).toBe('Mirror World complete!');
    expect(loadingProgressBar.style.width).toBe('100%');
    expect(loadingProgressBar.parentElement?.getAttribute('aria-valuenow')).toBe('100');
    expect(statusText.innerText).toBe('PIPELINE ONLINE');
    expect(statusIndicator.classList.contains('status-online')).toBe(true);
    expect(pulseDot.classList.contains('pulse-green')).toBe(true);

    // Panel should still be visible because of the 1s hide timeout
    expect(hudLoading.classList.contains('hidden')).toBe(false);

    // Advance timers by 1s
    vi.advanceTimersByTime(1000);
    expect(hudLoading.classList.contains('hidden')).toBe(true);
  });

  it('should handle failure state', () => {
    pipelineState.startLoading();
    pipelineState.setState('failed', 0, 'Failed to load real-world data.');

    expect(loadingStatus.innerText).toBe('Failed to load real-world data.');
    expect(loadingProgressBar.style.width).toBe('0%');
    expect(loadingProgressBar.parentElement?.getAttribute('aria-valuenow')).toBe('0');
    expect(statusText.innerText).toBe('PIPELINE OFFLINE');
    expect(statusIndicator.classList.contains('status-offline')).toBe(true);
    expect(pulseDot.classList.contains('pulse-red')).toBe(true);

    // Panel should be visible because of the 3s error timeout
    expect(hudLoading.classList.contains('hidden')).toBe(false);

    // Advance timers by 3s
    vi.advanceTimersByTime(3000);
    expect(hudLoading.classList.contains('hidden')).toBe(true);
  });
});
