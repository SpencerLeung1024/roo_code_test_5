class TurnManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.currentPhase = 'waiting'; // waiting, rolling, moving, acting, ended
        this.actionsTaken = [];
        this.turnStartTime = null;
    }
    
    // Turn lifecycle methods
    startTurn() {
        if (this.currentPhase !== 'waiting') {
            throw new Error('Cannot start turn - turn already in progress');
        }
        
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) {
            throw new Error('No current player found');
        }
        
        this.currentPhase = 'rolling';
        this.turnStartTime = new Date();
        this.actionsTaken = [];
        
        // Reset player's double roll count at the start of their turn
        currentPlayer.doubleRolls = 0;
        
        this.eventHandler.emit('player:turn:started', {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name
        });
        
        console.log(`Turn started for ${currentPlayer.name}`);
    }
    
    endTurn() {
        if (this.currentPhase === 'waiting' || this.currentPhase === 'ended') {
            throw new Error('Cannot end turn - no turn in progress');
        }
        
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) {
            throw new Error('No current player found');
        }
        
        // Check for three doubles (go to jail)
        if (this.gameState.doubleCount >= 3) {
            currentPlayer.sendToJail();
            this.eventHandler.emit('player:jailed', {
                playerId: currentPlayer.id,
                reason: 'three_doubles'
            });
        }
        
        this.currentPhase = 'ended';
        
        this.eventHandler.emit('player:turn:ended', {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            actionsTaken: this.actionsTaken,
            turnDuration: Date.now() - this.turnStartTime
        });
        
        console.log(`Turn ended for ${currentPlayer.name}`);
        
        // Reset for next turn
        setTimeout(() => {
            this.currentPhase = 'waiting';
            this.actionsTaken = [];
            this.turnStartTime = null;
        }, 1000);
    }
    
    // Phase management methods
    setPhase(phase) {
        const validPhases = ['waiting', 'rolling', 'moving', 'acting', 'ended'];
        if (!validPhases.includes(phase)) {
            throw new Error(`Invalid phase: ${phase}`);
        }
        
        const oldPhase = this.currentPhase;
        this.currentPhase = phase;
        
        this.eventHandler.emit('turn:phase_changed', {
            oldPhase,
            newPhase: phase,
            playerId: this.gameState.getCurrentPlayer()?.id
        });
        
        console.log(`Turn phase changed from ${oldPhase} to ${phase}`);
    }
    
    // Action validation methods
    canRollDice() {
        return this.currentPhase === 'rolling';
    }
    
    canMovePlayer() {
        return this.currentPhase === 'moving';
    }
    
    canPerformAction() {
        return this.currentPhase === 'acting';
    }
    
    canEndTurn() {
        return this.currentPhase === 'acting' || this.currentPhase === 'rolling';
    }
    
    // Action tracking methods
    recordAction(action) {
        this.actionsTaken.push({
            type: action.type,
            timestamp: new Date(),
            data: action
        });
    }
    
    getActionsTaken() {
        return [...this.actionsTaken];
    }
    
    // Turn state methods
    getTurnState() {
        return {
            currentPhase: this.currentPhase,
            currentPlayerId: this.gameState.getCurrentPlayer()?.id,
            actionsTaken: this.actionsTaken,
            turnStartTime: this.turnStartTime,
            turnDuration: this.turnStartTime ? Date.now() - this.turnStartTime : 0
        };
    }
    
    isTurnActive() {
        return this.currentPhase !== 'waiting' && this.currentPhase !== 'ended';
    }
    
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    // Special turn handling
    handleDoubles() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) return false;
        
        currentPlayer.doubleRolls++;
        
        if (currentPlayer.doubleRolls >= 3) {
            // Third double - go to jail
            currentPlayer.sendToJail();
            this.eventHandler.emit('player:jailed', {
                playerId: currentPlayer.id,
                reason: 'three_doubles'
            });
            this.endTurn();
            return false;
        }
        
        // Player gets another turn
        this.eventHandler.emit('player:rolled_doubles', {
            playerId: currentPlayer.id,
            doubleCount: currentPlayer.doubleRolls
        });
        
        // Reset to rolling phase for another turn
        this.setPhase('rolling');
        return true;
    }
    
    handleJailTurn(player) {
        if (!player.inJail) return false;
        
        player.incrementJailTurns();
        
        if (player.jailTurns >= 3) {
            // Player must pay fine or use card
            if (player.getOutOfJailCards > 0) {
                player.useGetOutOfJailCard();
                this.eventHandler.emit('player:released', {
                    playerId: player.id,
                    method: 'card'
                });
            } else if (player.canAfford(this.gameState.settings.jailFine)) {
                player.pay(this.gameState.settings.jailFine);
                player.releaseFromJail();
                this.eventHandler.emit('player:released', {
                    playerId: player.id,
                    method: 'fine',
                    amount: this.gameState.settings.jailFine
                });
            } else {
                // Player is stuck in jail (bankruptcy situation)
                this.eventHandler.emit('player:bankrupt', {
                    playerId: player.id,
                    reason: 'cannot_pay_jail_fine'
                });
                return false;
            }
        }
        
        return true;
    }
    
    // Turn validation
    validateTurnContinuation() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) return false;
        
        // Check if player is bankrupt
        if (currentPlayer.bankrupt) {
            this.endTurn();
            return false;
        }
        
        // Check if player is in jail
        if (currentPlayer.inJail) {
            return this.handleJailTurn(currentPlayer);
        }
        
        return true;
    }
    
    // Forced turn end (for timeouts or errors)
    forceEndTurn(reason = 'unknown') {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) return;
        
        this.eventHandler.emit('turn:force_ended', {
            playerId: currentPlayer.id,
            reason: reason
        });
        
        this.endTurn();
    }
    
    // Get turn statistics
    getTurnStats() {
        return {
            totalActions: this.actionsTaken.length,
            actionTypes: this.actionsTaken.reduce((acc, action) => {
                acc[action.type] = (acc[action.type] || 0) + 1;
                return acc;
            }, {}),
            turnDuration: this.turnStartTime ? Date.now() - this.turnStartTime : 0,
            phase: this.currentPhase
        };
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.diceManager = managers.diceManager;
        this.movementManager = managers.movementManager;
        this.jailManager = managers.jailManager;
        this.eventHandler = managers.eventHandler;
        
        console.log('TurnManager: All managers linked');
    }
}

module.exports = TurnManager;