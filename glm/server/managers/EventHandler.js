class EventHandler {
    constructor() {
        this.eventListeners = new Map();
        this.eventHistory = [];
        this.maxHistoryLength = 1000;
    }
    
    // Register an event listener
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        
        this.eventListeners.get(event).push(callback);
        
        console.log(`Event listener registered for: ${event}`);
    }
    
    // Emit an event
    emit(event, data = {}) {
        const eventData = {
            eventType: event,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        // Add to history
        this.addToHistory(eventData);
        
        // Log the event
        console.log(`Event emitted: ${event}`, data);
        
        // Call all listeners for this event
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(eventData);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
        
        return eventData;
    }
    
    // Remove an event listener
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            
            if (index !== -1) {
                listeners.splice(index, 1);
                console.log(`Event listener removed for: ${event}`);
            }
        }
    }
    
    // Remove all listeners for an event
    offAll(event) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.delete(event);
            console.log(`All event listeners removed for: ${event}`);
        }
    }
    
    // Get all events of a specific type from history
    getEventHistory(eventType = null, limit = null) {
        let history = this.eventHistory;
        
        if (eventType) {
            history = history.filter(event => event.eventType === eventType);
        }
        
        if (limit) {
            history = history.slice(-limit);
        }
        
        return history;
    }
    
    // Get event statistics
    getEventStatistics() {
        const stats = {
            totalEvents: this.eventHistory.length,
            eventTypes: {},
            eventsByHour: {},
            recentEvents: this.eventHistory.slice(-10)
        };
        
        // Count by event type
        this.eventHistory.forEach(event => {
            if (!stats.eventTypes[event.eventType]) {
                stats.eventTypes[event.eventType] = 0;
            }
            stats.eventTypes[event.eventType]++;
        });
        
        // Count by hour
        this.eventHistory.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            if (!stats.eventsByHour[hour]) {
                stats.eventsByHour[hour] = 0;
            }
            stats.eventsByHour[hour]++;
        });
        
        return stats;
    }
    
    // Clear event history
    clearHistory() {
        this.eventHistory = [];
        console.log('Event history cleared');
    }
    
    // Add event to history
    addToHistory(eventData) {
        this.eventHistory.push(eventData);
        
        // Keep history at maximum length
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistoryLength);
        }
    }
    
    // Set up default game event handlers
    setupGameEventHandlers(gameStateManager) {
        // Player events
        this.on('player:joined', (data) => {
            console.log(`Player joined: ${data.data.playerName}`);
        });
        
        this.on('player:turn:started', (data) => {
            console.log(`Turn started for player: ${data.data.playerName}`);
        });
        
        this.on('player:turn:ended', (data) => {
            console.log(`Turn ended for player: ${data.data.playerName}`);
        });
        
        this.on('player:moved', (data) => {
            console.log(`Player ${data.data.playerName} moved to ${data.data.spaceName}`);
        });
        
        this.on('player:money:changed', (data) => {
            console.log(`Player ${data.data.playerName} money changed by $${data.data.amount}`);
        });
        
        this.on('player:bankrupt', (data) => {
            console.log(`Player ${data.data.playerName} went bankrupt`);
        });
        
        this.on('player:jailed', (data) => {
            console.log(`Player ${data.data.playerName} was sent to jail`);
        });
        
        this.on('player:released', (data) => {
            console.log(`Player ${data.data.playerName} was released from jail`);
        });
        
        // Dice events
        this.on('dice:rolled', (data) => {
            console.log(`Dice rolled: ${data.data.dice[0]}, ${data.data.dice[1]}`);
        });
        
        // Property events
        this.on('property:purchased', (data) => {
            console.log(`Property ${data.data.propertyName} purchased by ${data.data.playerName}`);
        });
        
        this.on('property:mortgaged', (data) => {
            console.log(`Property ${data.data.propertyName} mortgaged by ${data.data.playerName}`);
        });
        
        this.on('property:unmortgaged', (data) => {
            console.log(`Property ${data.data.propertyName} unmortgaged by ${data.data.playerName}`);
        });
        
        this.on('building:built', (data) => {
            console.log(`Building built on ${data.data.propertyName} by ${data.data.playerName}`);
        });
        
        this.on('building:sold', (data) => {
            console.log(`Building sold on ${data.data.propertyName} by ${data.data.playerName}`);
        });
        
        // Card events
        this.on('card:drawn', (data) => {
            console.log(`Card drawn: ${data.data.cardText} by ${data.data.playerName}`);
        });
        
        // Game events
        this.on('game:started', (data) => {
            console.log('Game started');
        });
        
        this.on('game:paused', (data) => {
            console.log('Game paused');
        });
        
        this.on('game:resumed', (data) => {
            console.log('Game resumed');
        });
        
        this.on('game:ended', (data) => {
            console.log(`Game ended. Winner: ${data.data.winnerName}`);
        });
        
        // Auction events
        this.on('auction:started', (data) => {
            console.log(`Auction started for property: ${data.data.propertyName}`);
        });
        
        this.on('auction:bid', (data) => {
            console.log(`Auction bid: $${data.data.amount} by ${data.data.playerName}`);
        });
        
        this.on('auction:ended', (data) => {
            console.log(`Auction ended. Winner: ${data.data.winnerName} with bid $${data.data.amount}`);
        });
        
        // State events
        this.on('state:changed', (data) => {
            console.log('Game state changed');
        });
        
        // Error events
        this.on('error:occurred', (data) => {
            console.error(`Error occurred: ${data.data.message}`, data.data.error);
        });
        
        console.log('Default game event handlers set up');
    }
    
    // Validate event data
    validateEventData(eventType, data) {
        const requiredFields = {
            'player:joined': ['playerName', 'playerId'],
            'player:turn:started': ['playerName', 'playerId'],
            'player:turn:ended': ['playerName', 'playerId'],
            'player:moved': ['playerName', 'playerId', 'fromPosition', 'toPosition', 'spaceName'],
            'player:money:changed': ['playerName', 'playerId', 'amount', 'newBalance'],
            'player:bankrupt': ['playerName', 'playerId'],
            'player:jailed': ['playerName', 'playerId'],
            'player:released': ['playerName', 'playerId'],
            'dice:rolled': ['dice', 'isDoubles'],
            'property:purchased': ['propertyName', 'propertyId', 'playerName', 'playerId', 'price'],
            'card:drawn': ['cardText', 'playerName', 'playerId', 'cardType'],
            'game:started': [],
            'game:ended': ['winnerName', 'winnerId'],
            'error:occurred': ['message']
        };
        
        if (requiredFields[eventType]) {
            const missingFields = requiredFields[eventType].filter(field => !(field in data));
            
            if (missingFields.length > 0) {
                console.error(`Missing required fields for event ${eventType}: ${missingFields.join(', ')}`);
                return false;
            }
        }
        
        return true;
    }
    
    // Get all registered event types
    getRegisteredEventTypes() {
        return Array.from(this.eventListeners.keys());
    }
    
    // Get listener count for an event
    getListenerCount(event) {
        if (this.eventListeners.has(event)) {
            return this.eventListeners.get(event).length;
        }
        return 0;
    }
    
    // Get total number of registered listeners
    getTotalListenerCount() {
        let total = 0;
        for (const listeners of this.eventListeners.values()) {
            total += listeners.length;
        }
        return total;
    }
    
    // Destroy the event handler
    destroy() {
        this.eventListeners.clear();
        this.clearHistory();
        console.log('Event handler destroyed');
    }
}

module.exports = EventHandler;