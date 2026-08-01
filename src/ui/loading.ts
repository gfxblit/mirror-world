export class LoadingUI {
  private panelEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private progressBarEl: HTMLElement | null = null;
  private statusIndicatorEl: HTMLElement | null = null;
  private statusTextEl: HTMLElement | null = null;
  private statusDotEl: HTMLElement | null = null;

  private progressInterval: number | null = null;
  private currentProgress = 0;

  constructor() {
    // Only query elements if document is available (prevents issues in non-browser testing contexts)
    if (typeof document !== 'undefined') {
      this.initElements();
    }
  }

  private initElements() {
    this.panelEl = document.getElementById('hud-loading');
    this.statusEl = document.getElementById('loading-status');
    this.progressBarEl = document.getElementById('loading-progress-bar');
    this.statusIndicatorEl = document.querySelector('.status-indicator');
    
    if (this.statusIndicatorEl) {
      this.statusTextEl = this.statusIndicatorEl.querySelector('.status-text');
      this.statusDotEl = this.statusIndicatorEl.querySelector('.pulse-dot');
    }
  }

  show(): void {
    if (typeof document === 'undefined') return;

    // Re-check elements in case DOM wasn't fully initialized during constructor
    if (!this.panelEl) {
      this.initElements();
    }
    
    if (this.panelEl) {
      this.panelEl.classList.remove('hidden');
    }
    
    this.updateStatusIndicator('loading', 'FETCHING REALITY DATA');
    this.setProgress(10);
    this.updateStatus('Querying Overpass API (Bellevue center)...');

    // Start a simulated progress bar incrementing to keep the UI feeling "alive"
    this.currentProgress = 10;
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.progressInterval = window.setInterval(() => {
      if (this.currentProgress < 75) {
        this.currentProgress += Math.random() * 5 + 1; // Increment by 1-6%
        if (this.currentProgress > 75) this.currentProgress = 75;
        this.setProgress(this.currentProgress);
        
        if (this.currentProgress > 45 && this.statusEl && this.statusEl.innerText.startsWith('Querying')) {
          this.updateStatus('Downloading spatial footprints from OpenStreetMap...');
        }
      }
    }, 300);
  }

  updateStatus(message: string): void {
    if (this.statusEl) {
      this.statusEl.innerText = message;
    }
  }

  setProgress(percentage: number): void {
    this.currentProgress = percentage;
    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${percentage}%`;
    }
  }

  hide(success = true): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    if (success) {
      this.updateStatus('Mirror World complete!');
      this.setProgress(100);
      this.updateStatusIndicator('online', 'PIPELINE ONLINE');
      
      setTimeout(() => {
        if (this.panelEl) {
          this.panelEl.classList.add('hidden');
        }
      }, 1000);
    } else {
      this.updateStatus('Failed to load real-world data.');
      this.setProgress(0);
      this.updateStatusIndicator('offline', 'PIPELINE OFFLINE');
      
      setTimeout(() => {
        if (this.panelEl) {
          this.panelEl.classList.add('hidden');
        }
      }, 3000);
    }
  }

  private updateStatusIndicator(state: 'loading' | 'online' | 'offline', text: string): void {
    if (!this.statusIndicatorEl) return;

    // Reset classes and styling
    this.statusIndicatorEl.className = 'status-indicator';
    if (this.statusDotEl) {
      this.statusDotEl.className = 'pulse-dot';
    }

    if (state === 'loading') {
      this.statusIndicatorEl.classList.add('status-loading');
      if (this.statusDotEl) this.statusDotEl.classList.add('pulse-blue');
    } else if (state === 'offline') {
      this.statusIndicatorEl.classList.add('status-offline');
      if (this.statusDotEl) this.statusDotEl.classList.add('pulse-red');
    } else {
      this.statusIndicatorEl.classList.add('status-online');
      if (this.statusDotEl) this.statusDotEl.classList.add('pulse-green');
    }

    if (this.statusTextEl) {
      this.statusTextEl.innerText = text;
    }
  }
}

export const loadingUI = new LoadingUI();
