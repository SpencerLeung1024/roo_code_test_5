const GameStateManager = require('./GameStateManager');

class SocketManager {
    constructor(server) {
        this.io = require('socket.io')(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.gameRooms = new Map();
        this.clientToGame = new Map();
        this.setupSocketHandlers();
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            
            // Handle game creation
            socket.on('create_game', (data) => {
                this.handleCreateGame(socket, data);
            });
            
            // Handle joining a game
            socket.on('join_game', (data) => {
                this.handleJoinGame(socket, data);
            });
            
            // Handle game actions
            socket.on('game_action', (data) => {
                this.handleGameAction(socket, data);
            });
            
            // Handle player actions
            socket.on('roll_dice', (data) => {
                this.handleRollDice(socket, data);
            });
            
            socket.on('end_turn', (data) => {
                this.handleEndTurn(socket, data);
            });
            
            socket.on('purchase_property', (data) => {
                this.handlePurchaseProperty(socket, data);
            });
            
            socket.on('start_game', (data) => {
                this.handleStartGame(socket, data);
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
            
            // Send initial connection confirmation
            socket.emit('connected', { socketId: socket.id });
        });
    }
    
    handleCreateGame(socket, data) {
        try {
            const gameManager = new GameStateManager(this);
            const game = gameManager.createGame();
            
            // Store the game manager
            this.gameRooms.set(game.id, gameManager);
            
            // Join the socket to the game room
            socket.join(game.id);
            
            // Store the client-game mapping
            this.clientToGame.set(socket.id, game.id);
            
            console.log(`Game created: ${game.id}`);
            
            socket.emit('game_created', {
                gameId: game.id,
                gameState: game.toJSON()
            });
        } catch (error) {
            console.error('Error creating game:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handleJoinGame(socket, data) {
        try {
            const { gameId, playerName, playerColor } = data;
            
            if (!gameId || !playerName) {
                throw new Error('Game ID and player name are required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            // Generate player ID
            const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Add player to game
            const player = gameManager.addPlayer({
                id: playerId,
                name: playerName,
                color: playerColor || this.getRandomColor()
            });
            
            if (!player) {
                throw new Error('Failed to add player to game');
            }
            
            // Join the socket to the game room
            socket.join(gameId);
            
            // Store the client-game mapping
            this.clientToGame.set(socket.id, gameId);
            
            // Store the socket-player mapping
            socket.playerId = playerId;
            
            console.log(`Player ${playerName} (${playerId}) joined game ${gameId}`);
            
            socket.emit('game_joined', {
                gameId,
                playerId,
                gameState: gameManager.getGameState().toJSON()
            });
            
            // Notify other players
            socket.to(gameId).emit('player_joined', {
                playerId,
                playerName,
                playerColor: player.color
            });
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handleGameAction(socket, data) {
        try {
            const { gameId, action } = data;
            
            if (!gameId || !action) {
                throw new Error('Game ID and action are required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            // Validate that the player is in the game
            if (!socket.playerId || !gameManager.getGameState().getPlayerById(socket.playerId)) {
                throw new Error('Player not in game');
            }
            
            // Add player ID to action
            action.playerId = socket.playerId;
            
            // Process the action
            const result = gameManager.validateAction(action, gameManager.getGameState());
            if (!result.valid) {
                throw new Error(result.message);
            }
            
            // Execute the action
            this.executeGameAction(socket, gameManager, action);
        } catch (error) {
            console.error('Error handling game action:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    executeGameAction(socket, gameManager, action) {
        switch (action.type) {
            case 'roll_dice':
                gameManager.rollDice(action.playerId);
                break;
            case 'end_turn':
                gameManager.endTurn(action.playerId);
                break;
            case 'purchase_property':
                gameManager.purchaseProperty(action.playerId, action.propertyId);
                break;
            default:
                throw new Error('Unknown action type');
        }
    }
    
    handleRollDice(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                throw new Error('Game ID is required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            if (!socket.playerId) {
                throw new Error('Player not identified');
            }
            
            const dice = gameManager.rollDice(socket.playerId);
            
            if (dice) {
                socket.emit('dice_rolled', { dice });
            }
        } catch (error) {
            console.error('Error rolling dice:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handleEndTurn(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                throw new Error('Game ID is required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            if (!socket.playerId) {
                throw new Error('Player not identified');
            }
            
            gameManager.endTurn(socket.playerId);
        } catch (error) {
            console.error('Error ending turn:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handlePurchaseProperty(socket, data) {
        try {
            const { gameId, propertyId } = data;
            
            if (!gameId || !propertyId) {
                throw new Error('Game ID and property ID are required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            if (!socket.playerId) {
                throw new Error('Player not identified');
            }
            
            gameManager.purchaseProperty(socket.playerId, propertyId);
        } catch (error) {
            console.error('Error purchasing property:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handleStartGame(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                throw new Error('Game ID is required');
            }
            
            const gameManager = this.gameRooms.get(gameId);
            if (!gameManager) {
                throw new Error('Game not found');
            }
            
            if (!socket.playerId) {
                throw new Error('Player not identified');
            }
            
            gameManager.startGame();
        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: error.message });
        }
    }
    
    handleDisconnect(socket) {
        console.log(`Client disconnected: ${socket.id}`);
        
        const gameId = this.clientToGame.get(socket.id);
        if (gameId) {
            const gameManager = this.gameRooms.get(gameId);
            if (gameManager && socket.playerId) {
                // Remove player from game
                gameManager.removePlayer(socket.playerId);
                
                // Notify other players
                socket.to(gameId).emit('player_left', {
                    playerId: socket.playerId
                });
            }
            
            // Clean up mappings
            this.clientToGame.delete(socket.id);
        }
    }
    
    // Public methods for game managers to use
    broadcastGameState(gameId, gameState) {
        this.io.to(gameId).emit('game_state_update', {
            gameId,
            gameState
        });
    }
    
    emitGameEvent(gameId, eventType, eventData) {
        this.io.to(gameId).emit('game_event', {
            gameId,
            eventType,
            eventData,
            timestamp: new Date()
        });
    }
    
    sendGameState(socket, gameState) {
        socket.emit('game_state_update', {
            gameState
        });
    }
    
    // Utility methods
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getGameRooms() {
        return Array.from(this.gameRooms.keys());
    }
    
    getGameManager(gameId) {
        return this.gameRooms.get(gameId);
    }
    
    // Set up cross-references to other managers
    setGameStateManager(gameStateManager) {
        this.gameStateManager = gameStateManager;
        console.log('SocketManager: GameStateManager linked');
    }
    
    setStateSynchronizer(stateSynchronizer) {
        this.stateSynchronizer = stateSynchronizer;
        console.log('SocketManager: StateSynchronizer linked');
    }
}

module.exports = SocketManager;