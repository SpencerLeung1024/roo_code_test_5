const GameState = require('../models/GameState');
const GameStateValidator = require('./GameStateValidator');
const EventHandler = require('./EventHandler');

// Static game rooms storage (outside the class to avoid circular reference)
const gameRooms = new Map();

class GameStateManager {
    constructor(socketManager) {
        this.gameState = new GameState();
        this.socketManager = socketManager;
        this.validator = new GameStateValidator();
        this.eventHandler = new EventHandler();
    }
    
    // Game lifecycle methods
    createGame() {
        this.gameState = new GameState();
        gameRooms.set(this.gameState.id, this);
        this.eventHandler.emit('game:created', { gameId: this.gameState.id });
        this.broadcastGameState();
        return this.gameState;
    }
    
    startGame() {
        try {
            this.gameState.startGame();
            this.eventHandler.emit('game:started', { gameId: this.gameState.id });
            this.broadcastGameState();
            return true;
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return false;
        }
    }
    
    pauseGame() {
        if (this.gameState.pauseGame()) {
            this.eventHandler.emit('game:paused', { gameId: this.gameState.id });
            this.broadcastGameState();
            return true;
        }
        return false;
    }
    
    resumeGame() {
        if (this.gameState.resumeGame()) {
            this.eventHandler.emit('game:resumed', { gameId: this.gameState.id });
            this.broadcastGameState();
            return true;
        }
        return false;
    }
    
    endGame(winner = null) {
        this.gameState.endGame(winner);
        this.eventHandler.emit('game:ended', {
            gameId: this.gameState.id,
            winner: winner ? { id: winner.id, name: winner.name } : null
        });
        this.broadcastGameState();
    }
    
    // Player management methods
    addPlayer(playerData) {
        try {
            // Move Player require to top of file to avoid dynamic loading
            const Player = require('../models/Player');
            const player = new Player(
                playerData.id,
                playerData.name,
                playerData.color
            );
            
            this.gameState.addPlayer(player);
            this.eventHandler.emit('player:joined', { playerId: player.id, playerName: player.name });
            this.broadcastGameState();
            
            return player;
        } catch (error) {
            this.eventHandler.emitError(error.message);
            return null;
        }
    }
    
    removePlayer(playerId) {
        const player = this.gameState.removePlayer(playerId);
        if (player) {
            this.eventHandler.emit('player:left', { playerId: player.id });
            this.broadcastGameState();
        }
        return player;
    }
    
    // Game action methods
    rollDice(playerId) {
        try {
            const validation = this.validator.validateRollDice(playerId, this.gameState);
            if (!validation.valid) {
                this.eventHandler.emitError(validation.message);
                return null;
            }
            
            const dice = this.gameState.rollDice();
            this.eventHandler.emit('dice:rolled', { playerId, dice, isDoubles: dice[0] === dice[1] });
            this.broadcastGameState();
            
            return dice;
        } catch (error) {
            this.eventHandler.emitError(error.message);
            return null;
        }
    }
    
    movePlayer(playerId, spaces) {
        try {
            const player = this.gameState.getPlayerById(playerId);
            if (!player) {
                throw new Error('Player not found');
            }
            
            const oldPosition = player.position;
            player.position = (player.position + spaces) % this.gameState.board.length;
            
            // Check if player passed Go
            if (player.position < oldPosition) {
                player.receive(this.gameState.settings.goAmount);
                this.eventHandler.emit('player:passed_go', {
                    playerId,
                    amount: this.gameState.settings.goAmount
                });
            }
            
            this.gameState.updateLastAction({
                type: 'move',
                playerId,
                from: oldPosition,
                to: player.position,
                spaces
            });
            
            this.eventHandler.emit('player:moved', {
                playerId,
                fromPosition: oldPosition,
                toPosition: player.position,
                spaceName: this.gameState.board[player.position].name
            });
            this.broadcastGameState();
            
            return player.position;
        } catch (error) {
            this.eventHandler.emitError(error.message);
            return null;
        }
    }
    
    endTurn(playerId) {
        try {
            const validation = this.validator.validateEndTurn(playerId, this.gameState);
            if (!validation.valid) {
                this.eventHandler.emitError(validation.message);
                return false;
            }
            
            const currentPlayer = this.gameState.getCurrentPlayer();
            const nextPlayer = this.gameState.nextPlayer();
            
            this.gameState.updateLastAction({
                type: 'end_turn',
                playerId,
                nextPlayerId: nextPlayer.id
            });
            
            this.eventHandler.emit('player:turn:ended', {
                playerId,
                nextPlayerId: nextPlayer.id
            });
            this.broadcastGameState();
            
            // Check for three doubles (go to jail)
            if (this.gameState.doubleCount >= 3) {
                currentPlayer.sendToJail();
                this.eventHandler.emit('player:jailed', {
                    playerId: currentPlayer.id,
                    reason: 'three_doubles'
                });
            }
            
            return true;
        } catch (error) {
            this.eventHandler.emitError(error.message);
            return false;
        }
    }
    
    // Property transaction methods
    purchaseProperty(playerId, propertyId) {
        try {
            const validation = this.validator.validatePurchaseProperty(playerId, propertyId, this.gameState);
            if (!validation.valid) {
                this.eventHandler.emitError(validation.message);
                return false;
            }
            
            const player = this.gameState.getPlayerById(playerId);
            const property = this.gameState.getPropertyById(propertyId);
            
            if (player.pay(property.price)) {
                player.addProperty(property);
                
                this.gameState.updateLastAction({
                    type: 'purchase_property',
                    playerId,
                    propertyId,
                    amount: property.price
                });
                
                this.eventHandler.emit('property:purchased', {
                    playerId,
                    propertyId,
                    propertyName: property.name,
                    price: property.price
                });
                this.broadcastGameState();
                
                return true;
            } else {
                this.eventHandler.emitError('Insufficient funds');
                return false;
            }
        } catch (error) {
            this.eventHandler.emitError(error.message);
            return false;
        }
    }
    
    // State management methods
    updateState(newState) {
        try {
            const validation = this.validator.validateGameState(newState);
            if (!validation.valid) {
                this.eventHandler.emit('error:occurred', { message: validation.message });
                return false;
            }
            
            // Merge new state with existing state
            Object.assign(this.gameState, newState);
            this.gameState.lastUpdatedAt = new Date();
            
            this.broadcastGameState();
            return true;
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return false;
        }
    }
    
    // Board initialization
    initializeBoard(boardData) {
        this.gameState.initializeBoard(boardData);
        this.broadcastGameState();
        this.eventHandler.emit('board:initialized', {
            gameId: this.gameState.id,
            spaceCount: this.gameState.board.length
        });
    }
    
    // Utility methods
    getGameState() {
        return this.gameState;
    }
    
    getGameStateDelta() {
        // Return only the changes since last broadcast
        // This is a simplified version - in production, you'd track changes more efficiently
        return {
            id: this.gameState.id,
            status: this.gameState.status,
            players: this.gameState.players.map(p => p.toJSON()),
            currentPlayerIndex: this.gameState.currentPlayerIndex,
            turnPhase: this.gameState.turnPhase,
            dice: this.gameState.dice,
            doubleCount: this.gameState.doubleCount,
            lastAction: this.gameState.lastAction,
            lastUpdatedAt: this.gameState.lastUpdatedAt
        };
    }
    
    // Communication methods
    broadcastGameState() {
        if (this.socketManager) {
            this.socketManager.broadcastGameState(this.gameState.id, this.getGameStateDelta());
        }
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.turnManager = managers.turnManager;
        this.diceManager = managers.diceManager;
        this.movementManager = managers.movementManager;
        this.propertyManager = managers.propertyManager;
        this.rentCalculator = managers.rentCalculator;
        this.jailManager = managers.jailManager;
        this.bankruptcyManager = managers.bankruptcyManager;
        this.cardManager = managers.cardManager;
        this.stateSynchronizer = managers.stateSynchronizer;
        
        console.log('GameStateManager: All managers linked');
    }
    
    // Static method to get game manager by ID
    static getGameManager(gameId) {
        return gameRooms.get(gameId);
    }
    
    // Static method to get all active games
    static getAllGames() {
        return Array.from(gameRooms.values()).map(manager => ({
            gameId: manager.gameState.id,
            status: manager.gameState.status,
            playerCount: manager.gameState.players.length,
            createdAt: manager.gameState.createdAt
        }));
    }
    
    // Static method to remove a game room
    static removeGame(gameId) {
        return gameRooms.delete(gameId);
    }
}

module.exports = GameStateManager;