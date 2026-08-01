export class DebugConsole {
  private consoleEl!: HTMLDivElement;

  constructor() {
    // Look for an existing element or create it
    const existing = document.getElementById('debug-console');
    if (existing) {
      this.consoleEl = existing as HTMLDivElement;
    } else {
      this.consoleEl = document.createElement('div');
      this.consoleEl.id = 'debug-console';
      this.consoleEl.style.position = 'absolute';
      this.consoleEl.style.bottom = '20px';
      this.consoleEl.style.left = '360px'; // 20px margin + 320px left panel + 20px gap
      this.consoleEl.style.right = '20px';
      this.consoleEl.style.width = 'auto';
      this.consoleEl.style.maxHeight = '120px';
      this.consoleEl.style.overflowY = 'auto';
      this.consoleEl.style.background = 'rgba(10, 10, 15, 0.9)';
      this.consoleEl.style.border = '1px solid hsla(271, 91%, 65%, 0.4)';
      this.consoleEl.style.borderRadius = '8px';
      this.consoleEl.style.padding = '10px';
      this.consoleEl.style.fontFamily = 'monospace';
      this.consoleEl.style.fontSize = '11px';
      this.consoleEl.style.color = '#a3a3c2';
      this.consoleEl.style.zIndex = '9999';
      this.consoleEl.style.backdropFilter = 'blur(10px)';
      this.consoleEl.style.pointerEvents = 'auto';
      this.consoleEl.style.userSelect = 'text';
      this.consoleEl.innerText = '✦ Telemetry Debugger Online.\n';
      document.body.appendChild(this.consoleEl);
    }

    window.addEventListener('error', (e) => {
      this.log(`${e.message} at ${e.filename.split('/').pop()}:${e.lineno}`, 'error');
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.log(`Promise rejected: ${e.reason}`, 'error');
    });
  }

  log(msg: string, type: 'info' | 'error' | 'warn' = 'info'): void {
    const color = type === 'error' ? '#ff4d4d' : type === 'warn' ? '#ffcc00' : '#a3a3c2';
    const prefix = type === 'error' ? '✖ ' : type === 'warn' ? '⚠ ' : '✦ ';
    
    this.consoleEl.innerHTML += `<span style="color: ${color}">${prefix}${msg}</span><br/>`;
    this.consoleEl.scrollTop = this.consoleEl.scrollHeight;

    if (type === 'error') {
      console.error(prefix + msg);
    } else if (type === 'warn') {
      console.warn(prefix + msg);
    } else {
      console.log(prefix + msg);
    }
  }
}

// Export a singleton instance
export const debugConsole = new DebugConsole();
export const logToScreen = (msg: string, type: 'info' | 'error' | 'warn' = 'info') => {
  debugConsole.log(msg, type);
};
