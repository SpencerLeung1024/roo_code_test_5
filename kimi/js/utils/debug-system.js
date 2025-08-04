/**
 * Comprehensive Debug and Error Handling System
 * Provides centralized error handling, logging, and debugging tools
 */

class DebugSystem {
    constructor() {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.performanceMetrics = new Map();
        this.isEnabled = this.detectDebugMode();
        this.maxLogs = 1000;
        this.startTime = performance.now();
        
        // Setup global error handlers
        this.setupGlobalErrorHandlers();
    }

    /**
     * Detect if debug mode should be enabled
     */
    detectDebugMode() {
        return window.location.search.includes('debug=true') || 
               localStorage.getItem('monopoly-debug') === 'true' ||
               window.location.hostname === 'localhost';
    }

    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno, event.colno);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event.reason);
        });

        // Console error override for additional logging
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.log('ERROR', ...args);
            originalConsoleError.apply(console, args);
        };
    }

    /**
     * Log debug information
     */
    log(level, ...args) {
        if (!this.isEnabled && level !== 'ERROR') return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            level,
            message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp,
            stack: new Error().stack,
            performance: performance.now() - this.startTime
        };

        this.logs.push(logEntry);

        // Limit log size
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Store errors separately
        if (level === 'ERROR') {
            this.errors.push(logEntry);
            this.showErrorNotification(logEntry);
        } else if (level === 'WARN') {
            this.warnings.push(logEntry);
        }

        // Console output
        if (this.isEnabled) {
            console[level.toLowerCase()]?.(`[${timestamp}] ${logEntry.message}`);
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(error, filename, lineno, colno) {
        const errorInfo = {
            level: 'ERROR',
            message: error.message,
            filename,
            lineno,
            colno,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            type: 'Global Error'
        };

        this.errors.push(errorInfo);
        this.log('ERROR', 'Global Error:', errorInfo);
        this.showErrorNotification(errorInfo);
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(reason) {
        const errorInfo = {
            level: 'ERROR',
            message: reason.message || String(reason),
            stack: reason.stack,
            timestamp: new Date().toISOString(),
            type: 'Unhandled Promise Rejection'
        };

        this.errors.push(errorInfo);
        this.log('ERROR', 'Unhandled Promise Rejection:', errorInfo);
        this.showErrorNotification(errorInfo);
    }

    /**
     * Show error notification to user
     */
    showErrorNotification(errorInfo) {
        if (typeof window !== 'undefined' && window.monopolyApp) {
            // Use existing notification system
            const event = new CustomEvent('game:error', {
                detail: {
                    message: errorInfo.message,
                    type: 'error',
                    timestamp: errorInfo.timestamp
                }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Performance monitoring
     */
    startTimer(name) {
        this.performanceMetrics.set(name, performance.now());
    }

    endTimer(name) {
        const startTime = this.performanceMetrics.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.log('PERF', `${name} took ${duration.toFixed(2)}ms`);
            this.performanceMetrics.delete(name);
            return duration;
        }
        return 0;
    }

    /**
     * Memory usage monitoring
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Create error boundary for async operations
     */
    async safeAsync(operation, fallback = null) {
        try {
            return await operation();
        } catch (error) {
            this.log('ERROR', 'Async operation failed:', error);
            return fallback;
        }
    }

    /**
     * Validate data structures
     */
    validateData(data, schema, name = 'data') {
        const errors = [];
        
        for (const [key, type] of Object.entries(schema)) {
            if (data[key] === undefined) {
                errors.push(`Missing required field: ${key}`);
            } else if (type && typeof data[key] !== type) {
                errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof data[key]}`);
            }
        }

        if (errors.length > 0) {
            this.log('ERROR', `Validation failed for ${name}:`, errors);
            return { valid: false, errors };
        }

        return { valid: true };
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        const memory = this.getMemoryUsage();
        
        return {
            logs: this.logs.slice(-100), // Last 100 logs
            errors: this.errors.slice(-50), // Last 50 errors
            warnings: this.warnings.slice(-50), // Last 50 warnings
            performance: Object.fromEntries(this.performanceMetrics),
            memory: memory,
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            storage: {
                localStorage: this.checkStorage('localStorage'),
                sessionStorage: this.checkStorage('sessionStorage'),
                indexedDB: 'indexedDB' in window
            },
            features: {
                touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                serviceWorker: 'serviceWorker' in navigator,
                webGL: this.checkWebGL(),
                webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
                webRTC: 'RTCPeerConnection' in window,
                webSocket: 'WebSocket' in window
            }
        };
    }

    /**
     * Check storage availability
     */
    checkStorage(type) {
        try {
            const storage = window[type];
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check WebGL support
     */
    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /**
     * Export debug data
     */
    exportDebugData() {
        const debugInfo = this.getDebugInfo();
        const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monopoly-debug-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.performanceMetrics.clear();
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('monopoly-debug', String(enabled));
        
        if (enabled) {
            console.log('🐛 Debug mode enabled');
        } else {
            console.log('🔇 Debug mode disabled');
        }
    }

    /**
     * Create debug overlay
     */
    createDebugOverlay() {
        if (!this.isEnabled) return;

        const overlay = document.createElement('div');
        overlay.id = 'debug-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            border-radius: 5px;
            padding: 10px;
            overflow-y: auto;
            display: none;
        `;

        const toggle = document.createElement('button');
        toggle.textContent = '🐛';
        toggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10001;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
        `;

        toggle.addEventListener('click', () => {
            overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        });

        document.body.appendChild(overlay);
        document.body.appendChild(toggle);

        // Update overlay content
        setInterval(() => {
            if (overlay.style.display === 'block') {
                const info = this.getDebugInfo();
                overlay.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>Debug Info</strong>
                        <button onclick="debugSystem.exportDebugData()" style="float: right;">Export</button>
                        <button onclick="debugSystem.clearLogs()" style="float: right; margin-right: 5px;">Clear</button>
                    </div>
                    <div>Errors: ${info.errors.length}</div>
                    <div>Warnings: ${info.warnings.length}</div>
                    <div>Memory: ${info.memory ? Math.round(info.memory.used / 1024 / 1024) + 'MB' : 'N/A'}</div>
                    <div>Logs: ${info.logs.length}</div>
                    <hr>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${info.logs.slice(-10).map(log => 
                            `<div style="color: ${log.level === 'ERROR' ? '#ff6b6b' : log.level === 'WARN' ? '#ffd93d' : '#6bcf7f'};">
                                ${log.message.substring(0, 100)}${log.message.length > 100 ? '...' : ''}
                            </div>`
                        ).join('')}
                    </div>
                `;
            }
        }, 1000);
    }
}

// Create global debug system
const debugSystem = new DebugSystem();

// Export for use
export { debugSystem, DebugSystem };

// Make globally available
if (typeof window !== 'undefined') {
    window.debugSystem = debugSystem;
    window.toggleDebug = () => debugSystem.setDebugMode(!debugSystem.isEnabled);
}