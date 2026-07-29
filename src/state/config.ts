export interface Config {
  preset: string;
  heightScale: number;
  density: number;
  toonEnabled: boolean;
  wireframeEnabled: boolean;
}

export type ConfigKey = keyof Config;
export type Listener = (config: Config) => void;

export class ConfigManager {
  private config: Config = {
    preset: 'fantasy',
    heightScale: 1.0,
    density: 0.7,
    toonEnabled: true,
    wireframeEnabled: false,
  };

  private listeners: Set<Listener> = new Set();

  get<K extends ConfigKey>(key: K): Config[K] {
    return this.config[key];
  }

  set<K extends ConfigKey>(key: K, value: Config[K]): void {
    if (this.config[key] !== value) {
      this.config[key] = value;
      this.notify();
    }
  }

  update(params: Partial<Config>): void {
    let changed = false;
    (Object.keys(params) as Array<ConfigKey>).forEach((key) => {
      const val = params[key];
      if (val !== undefined && this.config[key] !== val) {
        (this.config as any)[key] = val;
        changed = true;
      }
    });

    if (changed) {
      this.notify();
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentConfig = { ...this.config };
    this.listeners.forEach((listener) => {
      try {
        listener(currentConfig);
      } catch (err) {
        console.error('Error notifying config subscriber:', err);
      }
    });
  }
}
