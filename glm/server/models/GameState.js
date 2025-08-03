const Player = require('./Player');
const Property = require('./Property');
const Space = require('./Space');
const Card = require('./Card');

class GameState {
    constructor() {
        this.id = this.generateGameId();
        this.status = 'waiting'; // waiting, active, paused, finished
        this.players = [];
        this.board = [];
        this.currentPlayerIndex = 0;
        this.turnPhase = 'waiting'; // waiting, rolling, moving, acting
        this.dice = [0, 0];
        this.doubleCount = 0;
        this.auction = null;
        this.lastAction = null;
        this.winner = null;
        this.settings = {
            startingMoney: 1500,
            goAmount: 200,
            maxHousesPerProperty: 4,
            maxHotelsPerProperty: 1,
            jailFine: 50,
            doubleJailLimit: 3
        };
        this.createdAt = new Date();
        this.lastUpdatedAt = new Date();
        this.eventHistory = [];
    }
    
    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    addPlayer(player) {
        if (this.players.length >= 8) {
            throw new Error('Maximum number of players (8) reached');
        }
        
        if (this.status !== 'waiting') {
            throw new Error('Cannot add player to game that has already started');
        }
        
        this.players.push(player);
        this.lastUpdatedAt = new Date();
        this.logEvent('player_joined', { playerId: player.id, playerName: player.name });
        
        return player;
    }
    
    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            const player = this.players[index];
            this.players.splice(index, 1);
            
            // Adjust current player index if necessary
            if (this.currentPlayerIndex >= this.players.length && this.players.length > 0) {
                this.currentPlayerIndex = 0;
            }
            
            this.lastUpdatedAt = new Date();
            this.logEvent('player_left', { playerId: player.id, playerName: player.name });
            
            return player;
        }
        return null;
    }
    
    getCurrentPlayer() {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }
    
    nextPlayer() {
        if (this.players.length === 0) return null;
        
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.doubleCount = 0;
        this.turnPhase = 'waiting';
        this.lastUpdatedAt = new Date();
        
        const currentPlayer = this.getCurrentPlayer();
        this.logEvent('turn_changed', { 
            currentPlayerId: currentPlayer.id, 
            currentPlayerName: currentPlayer.name 
        });
        
        return currentPlayer;
    }
    
    startGame() {
        if (this.players.length < 2) {
            throw new Error('Need at least 2 players to start the game');
        }
        
        this.status = 'active';
        this.currentPlayerIndex = 0;
        this.turnPhase = 'waiting';
        this.lastUpdatedAt = new Date();
        
        this.logEvent('game_started', { 
            playerCount: this.players.length,
            players: this.players.map(p => ({ id: p.id, name: p.name }))
        });
        
        return true;
    }
    
    pauseGame() {
        if (this.status === 'active') {
            this.status = 'paused';
            this.lastUpdatedAt = new Date();
            this.logEvent('game_paused', {});
            return true;
        }
        return false;
    }
    
    resumeGame() {
        if (this.status === 'paused') {
            this.status = 'active';
            this.lastUpdatedAt = new Date();
            this.logEvent('game_resumed', {});
            return true;
        }
        return false;
    }
    
    endGame(winner = null) {
        this.status = 'finished';
        this.winner = winner;
        this.lastUpdatedAt = new Date();
        
        this.logEvent('game_ended', { 
            winner: winner ? { id: winner.id, name: winner.name } : null 
        });
        
        return true;
    }
    
    isGameActive() {
        return this.status === 'active';
    }
    
    isGameWaiting() {
        return this.status === 'waiting';
    }
    
    isGameFinished() {
        return this.status === 'finished';
    }
    
    checkWinCondition() {
        // Check if only one player remains (others bankrupt)
        const activePlayers = this.players.filter(p => !p.bankrupt);
        
        if (activePlayers.length === 1) {
            this.endGame(activePlayers[0]);
            return activePlayers[0];
        }
        
        // Check for time limit or other win conditions
        // This could be extended with additional win conditions
        
        return null;
    }
    
    rollDice() {
        if (this.turnPhase !== 'waiting') {
            throw new Error('Cannot roll dice in current phase');
        }
        
        this.dice[0] = Math.floor(Math.random() * 6) + 1;
        this.dice[1] = Math.floor(Math.random() * 6) + 1;
        
        // Check for doubles
        if (this.dice[0] === this.dice[1]) {
            this.doubleCount++;
        } else {
            this.doubleCount = 0;
        }
        
        this.turnPhase = 'moving';
        this.lastUpdatedAt = new Date();
        
        this.logEvent('dice_rolled', { 
            dice: this.dice,
            doubles: this.dice[0] === this.dice[1],
            doubleCount: this.doubleCount
        });
        
        return this.dice;
    }
    
    setTurnPhase(phase) {
        this.turnPhase = phase;
        this.lastUpdatedAt = new Date();
    }
    
    updateLastAction(action) {
        this.lastAction = {
            ...action,
            timestamp: new Date()
        };
        this.lastUpdatedAt = new Date();
    }
    
    logEvent(eventType, eventData) {
        const event = {
            type: eventType,
            data: eventData,
            timestamp: new Date(),
            gameId: this.id
        };
        
        this.eventHistory.push(event);
        
        // Keep only last 100 events to prevent memory issues
        if (this.eventHistory.length > 100) {
            this.eventHistory = this.eventHistory.slice(-100);
        }
    }
    
    getRecentEvents(count = 10) {
        return this.eventHistory.slice(-count);
    }
    
    initializeBoard(boardData) {
        this.board = boardData.map(spaceData => {
            if (spaceData.type === 'property') {
                return new Property(spaceData);
            } else {
                return new Space(spaceData);
            }
        });
        
        this.lastUpdatedAt = new Date();
        this.logEvent('board_initialized', { spaceCount: this.board.length });
    }
    
    getPlayerById(playerId) {
        return this.players.find(p => p.id === playerId);
    }
    
    getSpaceByPosition(position) {
        return this.board[position];
    }
    
    getPropertyById(propertyId) {
        return this.board.find(space => space.id === propertyId && space.type === 'property');
    }
    
    toJSON() {
        return {
            id: this.id,
            status: this.status,
            players: this.players.map(p => p.toJSON()),
            board: this.board.map(s => s.toJSON()),
            currentPlayerIndex: this.currentPlayerIndex,
            turnPhase: this.turnPhase,
            dice: this.dice,
            doubleCount: this.doubleCount,
            auction: this.auction,
            lastAction: this.lastAction,
            winner: this.winner ? { id: this.winner.id, name: this.winner.name } : null,
            settings: this.settings,
            createdAt: this.createdAt,
            lastUpdatedAt: this.lastUpdatedAt,
            eventHistory: this.getRecentEvents(20)
        };
    }
}

module.exports = GameState;