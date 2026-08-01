// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoadingUI } from './loading';

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
    hudLoading.appendChild(loadingStatus);

    loadingProgressBar = document.createElement('div');
    loadingProgressBar.id = 'loading-progress-bar';
    hudLoading.appendChild(loadingProgressBar);

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
    ui.show();

    // Verify it makes the HUD loading panel visible
    expect(hudLoading.classList.contains('hidden')).toBe(false);

    // Verify status text and indicator styling
    expect(statusText.innerText).toBe('FETCHING REALITY DATA');
    expect(statusIndicator.classList.contains('status-loading')).toBe(true);
    expect(pulseDot.classList.contains('pulse-blue')).toBe(true);

    // Initial simulated progress is 10%
    expect(loadingProgressBar.style.width).toBe('10%');
    expect(loadingStatus.innerText).toBe('Querying Overpass API (Bellevue center)...');

    // Advance time to verify interval increments progress
    vi.advanceTimersByTime(300);
    // Progress should have increased beyond 10%
    const widthAfter1Tick = parseFloat(loadingProgressBar.style.width);
    expect(widthAfter1Tick).toBeGreaterThan(10);
    expect(widthAfter1Tick).toBeLessThanOrEqual(75);

    // Advance more to see status change from Querying to Downloading
    vi.advanceTimersByTime(3000);
    expect(loadingStatus.innerText).toBe('Downloading spatial footprints from OpenStreetMap...');
  });

  it('should handle successful complete state', () => {
    ui.show();
    ui.hide(true);

    expect(loadingStatus.innerText).toBe('Mirror World complete!');
    expect(loadingProgressBar.style.width).toBe('100%');
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
    ui.show();
    ui.hide(false);

    expect(loadingStatus.innerText).toBe('Failed to load real-world data.');
    expect(loadingProgressBar.style.width).toBe('0%');
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
