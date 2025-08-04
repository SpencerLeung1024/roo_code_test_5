/**
 * EventEmitter utility for component communication
 * Simple event system for building system components
 */

export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to callbacks
     */
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error('Error in event callback:', error);
            }
        });
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (this.events[event]) {
            this.events[event] = [];
        }
    }

    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Function[]} Array of listeners
     */
    listeners(event) {
        return this.events[event] || [];
    }

    /**
     * Check if event has listeners
     * @param {string} event - Event name
     * @returns {boolean} True if has listeners
     */
    hasListeners(event) {
        return !!(this.events[event] && this.events[event].length > 0);
    }
}