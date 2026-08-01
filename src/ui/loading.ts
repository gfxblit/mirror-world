import { pipelineState } from '../state/pipeline';
import type { PipelineInfo } from '../state/pipeline';

export class LoadingUI {
  private panelEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private progressBarEl: HTMLElement | null = null;
  private statusIndicatorEl: HTMLElement | null = null;
  private statusTextEl: HTMLElement | null = null;
  private statusDotEl: HTMLElement | null = null;

  private hideTimeout: any = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.initElements();
      this.unsubscribe = pipelineState.subscribe((info) => this.render(info));
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

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private render(info: PipelineInfo): void {
    // Re-check elements in case DOM wasn't fully initialized during constructor
    if (!this.panelEl) {
      this.initElements();
    }

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    const { state, progress, statusText } = info;

    if (state === 'idle') {
      if (this.panelEl) {
        this.panelEl.classList.add('hidden');
      }
      this.updateStatusIndicator('online', 'PIPELINE ONLINE');
      return;
    }

    if (state === 'success') {
      if (this.statusEl) {
        this.statusEl.innerText = statusText || 'Mirror World complete!';
      }
      if (this.progressBarEl) {
        this.progressBarEl.style.width = '100%';
        this.progressBarEl.parentElement?.setAttribute('aria-valuenow', '100');
      }
      this.updateStatusIndicator('online', 'PIPELINE ONLINE');

      this.hideTimeout = setTimeout(() => {
        if (this.panelEl) {
          this.panelEl.classList.add('hidden');
        }
      }, 1000);
      return;
    }

    if (state === 'failed') {
      if (this.statusEl) {
        this.statusEl.innerText = statusText || 'Failed to load real-world data.';
      }
      if (this.progressBarEl) {
        this.progressBarEl.style.width = '0%';
        this.progressBarEl.parentElement?.setAttribute('aria-valuenow', '0');
      }
      this.updateStatusIndicator('offline', 'PIPELINE OFFLINE');

      this.hideTimeout = setTimeout(() => {
        if (this.panelEl) {
          this.panelEl.classList.add('hidden');
        }
      }, 3000);
      return;
    }

    // Loading / Downloading / Extruding states
    if (this.panelEl) {
      this.panelEl.classList.remove('hidden');
    }

    if (this.statusEl) {
      this.statusEl.innerText = statusText;
    }

    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${progress}%`;
      this.progressBarEl.parentElement?.setAttribute('aria-valuenow', Math.round(progress).toString());
    }

    this.updateStatusIndicator('loading', 'FETCHING REALITY DATA');
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
