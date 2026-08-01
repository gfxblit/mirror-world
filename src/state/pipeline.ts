export type LoadingState =
  | 'idle'
  | 'fetching_metadata'
  | 'downloading_footprints'
  | 'extruding'
  | 'success'
  | 'failed';

export interface PipelineInfo {
  state: LoadingState;
  progress: number;
  statusText: string;
}

export type PipelineListener = (info: PipelineInfo) => void;

export class PipelineStateManager {
  private info: PipelineInfo = {
    state: 'idle',
    progress: 0,
    statusText: '',
  };

  private listeners: Set<PipelineListener> = new Set();
  private progressInterval: any = null;

  get(): PipelineInfo {
    return { ...this.info };
  }

  setState(state: LoadingState, progress: number, statusText: string): void {
    // Clear simulation if we are moving out of fetching/downloading
    if (state !== 'fetching_metadata' && state !== 'downloading_footprints') {
      this.clearSimulation();
    }

    if (
      this.info.state !== state ||
      this.info.progress !== progress ||
      this.info.statusText !== statusText
    ) {
      this.info = { state, progress, statusText };
      this.notify();
    }
  }

  startLoading(): void {
    this.clearSimulation();
    this.setState('fetching_metadata', 10, 'Querying Overpass API (Bellevue center)...');

    // Simulate progress updates for a realistic loading experience
    this.progressInterval = setInterval(() => {
      const current = this.info;
      if (current.state === 'fetching_metadata' || current.state === 'downloading_footprints') {
        if (current.progress < 75) {
          const increment = Math.random() * 5 + 1; // 1-6%
          const nextProgress = Math.min(75, current.progress + increment);
          const nextState = nextProgress > 45 ? 'downloading_footprints' : 'fetching_metadata';
          const nextStatus = nextState === 'downloading_footprints'
            ? 'Downloading spatial footprints from OpenStreetMap...'
            : 'Querying Overpass API (Bellevue center)...';

          this.setState(nextState, nextProgress, nextStatus);
        }
      }
    }, 300);
  }

  subscribe(listener: PipelineListener): () => void {
    this.listeners.add(listener);
    // Notify immediately on subscription
    listener({ ...this.info });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private clearSimulation(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private notify(): void {
    const currentInfo = { ...this.info };
    this.listeners.forEach((listener) => {
      try {
        listener(currentInfo);
      } catch (err) {
        console.error('Error notifying pipeline subscriber:', err);
      }
    });
  }
}

export const pipelineState = new PipelineStateManager();
