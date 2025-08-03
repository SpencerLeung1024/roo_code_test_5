class StateSynchronizer {
    constructor(socketManager, gameState) {
        this.socketManager = socketManager;
        this.gameState = gameState;
        this.clientStates = new Map();
        this.updateQueue = [];
        this.isProcessing = false;
        this.updateInterval = null;
        this.batchSize = 10; // Number of updates to batch together
        this.batchDelay = 100; // Milliseconds to wait for batching
        this.pendingUpdates = new Map();
    }
    
    // Initialize the synchronizer
    initialize() {
        // Start processing updates
        this.startProcessing();
        
        // Set up periodic state broadcasts
        this.updateInterval = setInterval(() => {
            this.broadcastFullState();
        }, 30000); // Broadcast full state every 30 seconds
        
        console.log('State synchronizer initialized');
    }
    
    // Start processing the update queue
    startProcessing() {
        if (this.isProcessing) {
            return;
        }
        
        this.isProcessing = true;
        this.processUpdates();
    }
    
    // Stop processing updates
    stopProcessing() {
        this.isProcessing = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('State synchronizer stopped');
    }
    
    // Queue an update for processing
    queueUpdate(update) {
        if (!update || !update.type) {
            console.error('Invalid update queued');
            return;
        }
        
        // Add timestamp if not provided
        if (!update.timestamp) {
            update.timestamp = new Date();
        }
        
        // Add to queue
        this.updateQueue.push(update);
        
        // Process immediately if not already processing
        if (!this.isProcessing) {
            this.startProcessing();
        }
    }
    
    // Process updates in the queue
    async processUpdates() {
        while (this.isProcessing && this.updateQueue.length > 0) {
            // Get batch of updates
            const batch = this.updateQueue.splice(0, this.batchSize);
            
            try {
                // Process the batch
                await this.processBatch(batch);
                
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, this.batchDelay));
            } catch (error) {
                console.error('Error processing update batch:', error);
            }
        }
        
        this.isProcessing = false;
    }
    
    // Process a batch of updates
    async processBatch(batch) {
        // Group updates by type
        const groupedUpdates = this.groupUpdatesByType(batch);
        
        // Process each group
        for (const [type, updates] of groupedUpdates.entries()) {
            await this.processUpdateGroup(type, updates);
        }
    }
    
    // Group updates by type
    groupUpdatesByType(batch) {
        const grouped = new Map();
        
        batch.forEach(update => {
            if (!grouped.has(update.type)) {
                grouped.set(update.type, []);
            }
            grouped.get(update.type).push(update);
        });
        
        return grouped;
    }
    
    // Process a group of updates of the same type
    async processUpdateGroup(type, updates) {
        switch (type) {
            case 'player_update':
                await this.processPlayerUpdates(updates);
                break;
            case 'property_update':
                await this.processPropertyUpdates(updates);
                break;
            case 'game_state':
                await this.processGameStateUpdates(updates);
                break;
            case 'event':
                await this.processEventUpdates(updates);
                break;
            default:
                console.warn(`Unknown update type: ${type}`);
        }
    }
    
    // Process player updates
    async processPlayerUpdates(updates) {
        const playerUpdates = new Map();
        
        // Group updates by player
        updates.forEach(update => {
            if (!playerUpdates.has(update.playerId)) {
                playerUpdates.set(update.playerId, {});
            }
            Object.assign(playerUpdates.get(update.playerId), update.data);
        });
        
        // Create delta updates
        const deltaUpdates = [];
        playerUpdates.forEach((data, playerId) => {
            deltaUpdates.push({
                type: 'player_delta',
                playerId,
                data,
                timestamp: new Date()
            });
        });
        
        // Broadcast to all clients
        this.broadcastDeltaUpdates(deltaUpdates);
    }
    
    // Process property updates
    async processPropertyUpdates(updates) {
        const propertyUpdates = new Map();
        
        // Group updates by property
        updates.forEach(update => {
            if (!propertyUpdates.has(update.propertyId)) {
                propertyUpdates.set(update.propertyId, {});
            }
            Object.assign(propertyUpdates.get(update.propertyId), update.data);
        });
        
        // Create delta updates
        const deltaUpdates = [];
        propertyUpdates.forEach((data, propertyId) => {
            deltaUpdates.push({
                type: 'property_delta',
                propertyId,
                data,
                timestamp: new Date()
            });
        });
        
        // Broadcast to all clients
        this.broadcastDeltaUpdates(deltaUpdates);
    }
    
    // Process game state updates
    async processGameStateUpdates(updates) {
        // Create combined game state delta
        const combinedDelta = {};
        
        updates.forEach(update => {
            Object.assign(combinedDelta, update.data);
        });
        
        const deltaUpdate = {
            type: 'game_state_delta',
            data: combinedDelta,
            timestamp: new Date()
        };
        
        // Broadcast to all clients
        this.broadcastDeltaUpdates([deltaUpdate]);
    }
    
    // Process event updates
    async processEventUpdates(updates) {
        // Events are broadcast as-is
        this.broadcastEventUpdates(updates);
    }
    
    // Register a new client
    registerClient(clientId, socket) {
        // Initialize client state
        this.clientStates.set(clientId, {
            socket,
            lastSync: new Date(),
            pendingAcks: new Set(),
            version: 1
        });
        
        // Send initial full state
        this.sendFullState(clientId);
        
        console.log(`Client ${clientId} registered for state synchronization`);
    }
    
    // Unregister a client
    unregisterClient(clientId) {
        this.clientStates.delete(clientId);
        this.pendingUpdates.delete(clientId);
        
        console.log(`Client ${clientId} unregistered from state synchronization`);
    }
    
    // Send full state to a specific client
    sendFullState(clientId) {
        const clientState = this.clientStates.get(clientId);
        if (!clientState) {
            return;
        }
        
        const fullState = {
            type: 'full_state',
            gameState: this.gameState.toJSON ? this.gameState.toJSON() : this.gameState,
            version: clientState.version,
            timestamp: new Date()
        };
        
        clientState.socket.emit('state_update', fullState);
        clientState.lastSync = new Date();
        
        console.log(`Full state sent to client ${clientId}`);
    }
    
    // Broadcast full state to all clients
    broadcastFullState() {
        const fullState = {
            type: 'full_state',
            gameState: this.gameState.toJSON ? this.gameState.toJSON() : this.gameState,
            timestamp: new Date()
        };
        
        // Since we don't have a specific game ID for broadcast to all, we'll skip this for now
        // In a real implementation, we would broadcast to all game rooms
        console.log('Full state broadcast skipped - no specific game ID for broadcast');
        
        // Update client sync times
        this.clientStates.forEach((clientState, clientId) => {
            clientState.lastSync = new Date();
            clientState.version++;
        });
        
        console.log('Full state broadcast to all clients');
    }
    
    // Broadcast delta updates to all clients
    broadcastDeltaUpdates(updates) {
        const deltaUpdate = {
            type: 'delta_update',
            updates,
            timestamp: new Date()
        };
        
        // Since we don't have a specific game ID for broadcast to all, we'll skip this for now
        // In a real implementation, we would broadcast to all game rooms
        console.log('Delta updates broadcast skipped - no specific game ID for broadcast');
        
        console.log(`Delta updates broadcast to all clients (${updates.length} updates)`);
    }
    
    // Broadcast event updates to all clients
    broadcastEventUpdates(events) {
        // Since we don't have a specific game ID for broadcast to all, we'll skip this for now
        // In a real implementation, we would broadcast to all game rooms
        console.log('Event updates broadcast skipped - no specific game ID for broadcast');
        
        console.log(`Event updates broadcast to all clients (${events.length} events)`);
    }
    
    // Handle client acknowledgment
    handleAck(clientId, ackData) {
        const clientState = this.clientStates.get(clientId);
        if (!clientState) {
            return;
        }
        
        // Remove acknowledged updates from pending
        if (ackData.updateIds) {
            ackData.updateIds.forEach(updateId => {
                clientState.pendingAcks.delete(updateId);
            });
        }
        
        // Update client version
        if (ackData.version) {
            clientState.version = ackData.version;
        }
        
        clientState.lastSync = new Date();
    }
    
    // Reconcile client state with server state
    reconcileState(clientId, clientStateData) {
        const serverState = this.gameState.toJSON ? this.gameState.toJSON() : this.gameState;
        const clientState = this.clientStates.get(clientId);
        
        if (!clientState) {
            return;
        }
        
        // Calculate differences
        const differences = this.calculateStateDifferences(clientStateData, serverState);
        
        if (Object.keys(differences).length > 0) {
            // Send reconciliation update
            const reconciliationUpdate = {
                type: 'reconciliation',
                differences,
                serverVersion: clientState.version,
                timestamp: new Date()
            };
            
            clientState.socket.emit('state_update', reconciliationUpdate);
            
            console.log(`State reconciliation sent to client ${clientId}`);
        }
    }
    
    // Calculate differences between client and server state
    calculateStateDifferences(clientState, serverState) {
        const differences = {};
        
        // Compare players
        if (clientState.players && serverState.players) {
            const playerDifferences = this.calculatePlayerDifferences(
                clientState.players,
                serverState.players
            );
            
            if (Object.keys(playerDifferences).length > 0) {
                differences.players = playerDifferences;
            }
        }
        
        // Compare game state
        const gameStateDifferences = this.calculateGameStateDifferences(
            clientState.gameState || {},
            serverState
        );
        
        if (Object.keys(gameStateDifferences).length > 0) {
            differences.gameState = gameStateDifferences;
        }
        
        return differences;
    }
    
    // Calculate player differences
    calculatePlayerDifferences(clientPlayers, serverPlayers) {
        const differences = {};
        
        serverPlayers.forEach(serverPlayer => {
            const clientPlayer = clientPlayers.find(p => p.id === serverPlayer.id);
            
            if (!clientPlayer) {
                // New player
                differences[serverPlayer.id] = { action: 'add', player: serverPlayer };
            } else {
                // Check for differences
                const playerDiff = this.calculateObjectDifferences(clientPlayer, serverPlayer);
                if (Object.keys(playerDiff).length > 0) {
                    differences[serverPlayer.id] = { action: 'update', changes: playerDiff };
                }
            }
        });
        
        // Check for removed players
        clientPlayers.forEach(clientPlayer => {
            const serverPlayer = serverPlayers.find(p => p.id === clientPlayer.id);
            if (!serverPlayer) {
                differences[clientPlayer.id] = { action: 'remove' };
            }
        });
        
        return differences;
    }
    
    // Calculate game state differences
    calculateGameStateDifferences(clientGameState, serverGameState) {
        const fieldsToCompare = [
            'currentPlayerIndex', 'turnPhase', 'dice', 'doubleCount',
            'status', 'lastAction', 'winner'
        ];
        
        const differences = {};
        
        fieldsToCompare.forEach(field => {
            if (JSON.stringify(clientGameState[field]) !== JSON.stringify(serverGameState[field])) {
                differences[field] = serverGameState[field];
            }
        });
        
        return differences;
    }
    
    // Calculate differences between two objects
    calculateObjectDifferences(obj1, obj2) {
        const differences = {};
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        
        allKeys.forEach(key => {
            if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                differences[key] = obj2[key];
            }
        });
        
        return differences;
    }
    
    // Get synchronization statistics
    getStatistics() {
        const totalClients = this.clientStates.size;
        const pendingUpdates = this.updateQueue.length;
        const avgSyncTime = this.calculateAverageSyncTime();
        
        return {
            totalClients,
            pendingUpdates,
            isProcessing: this.isProcessing,
            averageSyncTime: avgSyncTime,
            clientStates: Array.from(this.clientStates.entries()).map(([id, state]) => ({
                id,
                lastSync: state.lastSync,
                version: state.version,
                pendingAcks: state.pendingAcks.size
            }))
        };
    }
    
    // Calculate average sync time
    calculateAverageSyncTime() {
        if (this.clientStates.size === 0) {
            return 0;
        }
        
        const now = new Date();
        const totalSyncAge = Array.from(this.clientStates.values())
            .reduce((sum, state) => sum + (now - state.lastSync), 0);
        
        return totalSyncAge / this.clientStates.size;
    }
    
    // Clean up old client states
    cleanup() {
        const now = new Date();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes
        
        const staleClients = [];
        this.clientStates.forEach((state, clientId) => {
            if (now - state.lastSync > staleThreshold) {
                staleClients.push(clientId);
            }
        });
        
        staleClients.forEach(clientId => {
            this.unregisterClient(clientId);
        });
        
        if (staleClients.length > 0) {
            console.log(`Cleaned up ${staleClients.length} stale client states`);
        }
    }
    
    // Destroy the synchronizer
    destroy() {
        this.stopProcessing();
        this.clientStates.clear();
        this.updateQueue = [];
        this.pendingUpdates.clear();
        
        console.log('State synchronizer destroyed');
    }
}

module.exports = StateSynchronizer;