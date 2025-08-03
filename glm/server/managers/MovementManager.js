class MovementManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.movementHistory = [];
        this.maxHistoryLength = 100;
    }
    
    // Main movement method
    movePlayer(player, spaces) {
        if (!player || typeof spaces !== 'number' || spaces < 0) {
            throw new Error('Invalid player or spaces parameter');
        }
        
        const oldPosition = player.position;
        const boardSize = this.gameState.board.length;
        
        // Calculate new position
        let newPosition = (player.position + spaces) % boardSize;
        
        // Check if player passed Go
        let passedGo = false;
        if (newPosition < oldPosition) {
            passedGo = true;
            player.receive(this.gameState.settings.goAmount);
            
            this.eventHandler.emit('player:passed_go', {
                playerId: player.id,
                amount: this.gameState.settings.goAmount
            });
        }
        
        // Update player position
        player.position = newPosition;
        
        // Record movement
        const movementRecord = {
            playerId: player.id,
            playerName: player.name,
            from: oldPosition,
            to: newPosition,
            spaces: spaces,
            passedGo: passedGo,
            timestamp: new Date()
        };
        
        this.addToHistory(movementRecord);
        
        // Emit movement event
        this.eventHandler.emit('player:moved', {
            playerId: player.id,
            from: oldPosition,
            to: newPosition,
            spaces: spaces,
            passedGo: passedGo
        });
        
        console.log(`${player.name} moved from ${oldPosition} to ${newPosition} (${spaces} spaces)`);
        
        // Handle landing on the new space
        this.handleLandingOnSpace(player, newPosition);
        
        return {
            newPosition,
            passedGo,
            space: this.gameState.board[newPosition]
        };
    }
    
    // Move player to specific position
    movePlayerToPosition(player, position) {
        if (!player || typeof position !== 'number' || position < 0) {
            throw new Error('Invalid player or position parameter');
        }
        
        const boardSize = this.gameState.board.length;
        const validPosition = position % boardSize;
        
        const oldPosition = player.position;
        
        // Check if player passed Go (moving backwards)
        let passedGo = false;
        if (validPosition < oldPosition && oldPosition !== 0) {
            passedGo = true;
            player.receive(this.gameState.settings.goAmount);
            
            this.eventHandler.emit('player:passed_go', {
                playerId: player.id,
                amount: this.gameState.settings.goAmount
            });
        }
        
        // Update player position
        player.position = validPosition;
        
        // Record movement
        const movementRecord = {
            playerId: player.id,
            playerName: player.name,
            from: oldPosition,
            to: validPosition,
            spaces: 'direct',
            passedGo: passedGo,
            timestamp: new Date()
        };
        
        this.addToHistory(movementRecord);
        
        // Emit movement event
        this.eventHandler.emit('player:moved', {
            playerId: player.id,
            from: oldPosition,
            to: validPosition,
            spaces: 'direct',
            passedGo: passedGo
        });
        
        console.log(`${player.name} moved directly from ${oldPosition} to ${validPosition}`);
        
        // Handle landing on the new space
        this.handleLandingOnSpace(player, validPosition);
        
        return {
            newPosition: validPosition,
            passedGo,
            space: this.gameState.board[validPosition]
        };
    }
    
    // Send player to jail
    movePlayerToJail(player) {
        if (!player) {
            throw new Error('Invalid player parameter');
        }
        
        const oldPosition = player.position;
        const jailPosition = 10; // Standard Monopoly jail position
        
        player.position = jailPosition;
        player.sendToJail();
        
        // Record movement
        const movementRecord = {
            playerId: player.id,
            playerName: player.name,
            from: oldPosition,
            to: jailPosition,
            spaces: 'to_jail',
            passedGo: false,
            timestamp: new Date()
        };
        
        this.addToHistory(movementRecord);
        
        // Emit jail event
        this.eventHandler.emit('player:jailed', {
            playerId: player.id,
            reason: 'space_landing'
        });
        
        console.log(`${player.name} sent to jail from position ${oldPosition}`);
    }
    
    // Handle landing on a space
    handleLandingOnSpace(player, position) {
        const space = this.gameState.board[position];
        if (!space) {
            console.error(`Space not found at position ${position}`);
            return;
        }
        
        // Emit space landing event
        this.eventHandler.emit('player:landed_on_space', {
            playerId: player.id,
            spaceId: space.id,
            spaceType: space.type,
            spaceName: space.name
        });
        
        // Handle different space types
        switch (space.type) {
            case 'go':
                this.handleGoSpace(player, space);
                break;
            case 'property':
            case 'railroad':
            case 'utility':
                this.handlePropertySpace(player, space);
                break;
            case 'goToJail':
                this.handleGoToJailSpace(player, space);
                break;
            case 'jail':
                this.handleJailSpace(player, space);
                break;
            case 'freeParking':
                this.handleFreeParkingSpace(player, space);
                break;
            case 'tax':
                this.handleTaxSpace(player, space);
                break;
            case 'communityChest':
                this.handleCommunityChestSpace(player, space);
                break;
            case 'chance':
                this.handleChanceSpace(player, space);
                break;
            default:
                console.log(`${player.name} landed on ${space.name} (${space.type})`);
        }
    }
    
    // Space-specific handlers
    handleGoSpace(player, space) {
        // Go space is handled when passing, but landing on it directly
        console.log(`${player.name} landed on Go`);
    }
    
    handlePropertySpace(player, space) {
        console.log(`${player.name} landed on property: ${space.name}`);
        
        // Property handling will be implemented in PropertyManager
        // This is a placeholder for now
        if (space.ownerId === null) {
            this.eventHandler.emit('property:available', {
                playerId: player.id,
                propertyId: space.id,
                price: space.price
            });
        } else if (space.ownerId === player.id) {
            this.eventHandler.emit('player:landed_on_own_property', {
                playerId: player.id,
                propertyId: space.id
            });
        } else {
            this.eventHandler.emit('player:landed_on_owned_property', {
                playerId: player.id,
                propertyId: space.id,
                ownerId: space.ownerId
            });
        }
    }
    
    handleGoToJailSpace(player, space) {
        console.log(`${player.name} landed on Go To Jail`);
        this.movePlayerToJail(player);
    }
    
    handleJailSpace(player, space) {
        if (player.inJail) {
            console.log(`${player.name} is in jail`);
        } else {
            console.log(`${player.name} is just visiting jail`);
        }
    }
    
    handleFreeParkingSpace(player, space) {
        console.log(`${player.name} landed on Free Parking`);
        // Free Parking rules vary - this is a placeholder
    }
    
    handleTaxSpace(player, space) {
        console.log(`${player.name} landed on ${space.name}`);
        
        const taxAmount = space.data?.amount || 0;
        if (taxAmount > 0) {
            if (player.canAfford(taxAmount)) {
                player.pay(taxAmount);
                this.eventHandler.emit('player:paid_tax', {
                    playerId: player.id,
                    amount: taxAmount,
                    taxType: space.name
                });
            } else {
                // Handle bankruptcy
                this.eventHandler.emit('player:cannot_pay_tax', {
                    playerId: player.id,
                    amount: taxAmount,
                    taxType: space.name
                });
            }
        }
    }
    
    handleCommunityChestSpace(player, space) {
        console.log(`${player.name} landed on Community Chest`);
        this.eventHandler.emit('card:draw_requested', {
            playerId: player.id,
            cardType: 'communityChest'
        });
    }
    
    handleChanceSpace(player, space) {
        console.log(`${player.name} landed on Chance`);
        this.eventHandler.emit('card:draw_requested', {
            playerId: player.id,
            cardType: 'chance'
        });
    }
    
    // History management
    addToHistory(movementRecord) {
        this.movementHistory.push(movementRecord);
        
        // Keep history at maximum length
        if (this.movementHistory.length > this.maxHistoryLength) {
            this.movementHistory = this.movementHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getMovementHistory(playerId = null, count = 10) {
        let history = this.movementHistory;
        
        if (playerId) {
            history = history.filter(record => record.playerId === playerId);
        }
        
        return history.slice(-count);
    }
    
    getFullHistory() {
        return [...this.movementHistory];
    }
    
    clearHistory() {
        this.movementHistory = [];
        console.log('Movement history cleared');
    }
    
    // Utility methods
    calculateMovementPath(from, to, boardSize) {
        const path = [];
        let current = from;
        
        while (current !== to) {
            current = (current + 1) % boardSize;
            path.push(current);
        }
        
        return path;
    }
    
    getDistanceBetweenPositions(from, to, boardSize) {
        if (to >= from) {
            return to - from;
        } else {
            return (boardSize - from) + to;
        }
    }
    
    // Statistics
    getMovementStatistics(playerId = null) {
        let history = this.movementHistory;
        
        if (playerId) {
            history = history.filter(record => record.playerId === playerId);
        }
        
        if (history.length === 0) {
            return {
                totalMovements: 0,
                averageSpaces: 0,
                totalGoPasses: 0,
                mostVisitedSpace: null,
                spaceVisitCount: {}
            };
        }
        
        const totalMovements = history.length;
        const totalSpaces = history.reduce((sum, record) => {
            return sum + (typeof record.spaces === 'number' ? record.spaces : 0);
        }, 0);
        const averageSpaces = totalSpaces / totalMovements;
        const totalGoPasses = history.filter(record => record.passedGo).length;
        
        // Calculate space visit counts
        const spaceVisitCount = {};
        history.forEach(record => {
            spaceVisitCount[record.to] = (spaceVisitCount[record.to] || 0) + 1;
        });
        
        // Find most visited space
        let mostVisitedSpace = null;
        let maxVisits = 0;
        for (const [space, count] of Object.entries(spaceVisitCount)) {
            if (count > maxVisits) {
                maxVisits = count;
                mostVisitedSpace = parseInt(space);
            }
        }
        
        return {
            totalMovements,
            averageSpaces: Math.round(averageSpaces * 100) / 100,
            totalGoPasses,
            mostVisitedSpace,
            spaceVisitCount
        };
    }
    
    // State methods
    getState() {
        return {
            movementCount: this.movementHistory.length,
            lastMovement: this.movementHistory.length > 0 ? 
                this.movementHistory[this.movementHistory.length - 1] : null
        };
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.gameStateManager = managers.gameStateManager;
        this.jailManager = managers.jailManager;
        this.eventHandler = managers.eventHandler;
        
        console.log('MovementManager: All managers linked');
    }
}

module.exports = MovementManager;