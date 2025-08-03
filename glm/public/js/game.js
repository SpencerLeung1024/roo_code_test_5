// Monopoly Game Logic - Client Side
// This handles the client-side game logic and communication with the server

class MonopolyGame {
    constructor() {
        this.socket = null;
        this.gameState = null;
        this.playerId = null;
        this.isGameStarted = false;
        this.board = [];
        
        // Initialize socket connection
        this.initializeSocket();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    initializeSocket() {
        // Connect to the server
        this.socket = io();
        
        // Set up socket event listeners
        this.socket.on('connect', () => {
            console.log('Connected to game server');
            this.addLogMessage('Connected to game server');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from game server');
            this.addLogMessage('Disconnected from game server');
        });
        
        this.socket.on('state_update', (data) => {
            this.handleStateUpdate(data);
        });
        
        this.socket.on('game_event', (data) => {
            this.handleGameEvent(data);
        });
        
        this.socket.on('player_joined', (data) => {
            this.handlePlayerJoined(data);
        });
        
        this.socket.on('game_started', (data) => {
            this.handleGameStarted(data);
        });
        
        this.socket.on('state_update', (data) => {
            this.handleStateUpdate(data);
        });
        
        this.socket.on('dice_rolled', (data) => {
            this.handleDiceRolled(data);
        });
        
        this.socket.on('turn_ended', (data) => {
            this.handleTurnEnded(data);
        });
        
        this.socket.on('property_purchased', (data) => {
            this.handlePropertyPurchased(data);
        });
        
        this.socket.on('card_drawn', (data) => {
            this.handleCardDrawn(data);
        });
        
        this.socket.on('error', (data) => {
            this.handleError(data);
        });
        
        this.socket.on('game_created', (data) => {
            this.handleGameCreated(data);
        });
        
        this.socket.on('game_joined', (data) => {
            this.handleGameJoined(data);
        });
    }
    
    setupEventListeners() {
        // Event listeners will be set up in ui.js
        // This method is a placeholder for future game logic event handling
    }
    
    // Game actions
    createGame() {
        this.socket.emit('create_game', {});
    }
    
    joinGame(gameId, playerName, playerColor) {
        this.socket.emit('join_game', {
            gameId: gameId,
            playerName: playerName,
            playerColor: playerColor
        });
    }
    
    startGame(gameId) {
        this.socket.emit('start_game', { gameId: gameId });
    }
    
    rollDice() {
        if (!this.gameState || !this.gameState.currentPlayerId) {
            return;
        }
        
        this.socket.emit('roll_dice', {
            playerId: this.gameState.currentPlayerId
        });
    }
    
    endTurn() {
        if (!this.gameState || !this.gameState.currentPlayerId) {
            return;
        }
        
        this.socket.emit('end_turn', {
            playerId: this.gameState.currentPlayerId
        });
    }
    
    buyProperty(propertyId) {
        if (!this.gameState || !this.gameState.currentPlayerId) {
            return;
        }
        
        this.socket.emit('buy_property', {
            playerId: this.gameState.currentPlayerId,
            propertyId: propertyId
        });
    }
    
    drawCard(cardType) {
        if (!this.gameState || !this.gameState.currentPlayerId) {
            return;
        }
        
        this.socket.emit('draw_card', {
            playerId: this.gameState.currentPlayerId,
            cardType: cardType
        });
    }
    
    // State update handlers
    handleStateUpdate(data) {
        if (data.type === 'full_state') {
            this.gameState = data.gameState;
            this.board = this.gameState.board || [];
            this.isGameStarted = this.gameState.status === 'active';
            
            // Update UI
            this.updateGameBoard();
            this.updatePlayerInfo();
            this.updateGameControls();
            
            this.addLogMessage('Game state synchronized');
        } else if (data.type === 'delta_update') {
            // Apply delta updates
            this.applyDeltaUpdates(data.updates);
        } else if (data.type === 'reconciliation') {
            // Handle state reconciliation
            this.reconcileState(data.differences);
        }
    }
    
    applyDeltaUpdates(updates) {
        updates.forEach(update => {
            switch (update.type) {
                case 'player_delta':
                    this.updatePlayerState(update.playerId, update.data);
                    break;
                case 'property_delta':
                    this.updatePropertyState(update.propertyId, update.data);
                    break;
                case 'game_state_delta':
                    this.updateGameState(update.data);
                    break;
                case 'dice_update':
                    this.updateDiceDisplay(update.data);
                    break;
                case 'card_drawn':
                    this.handleCardDrawn(update);
                    break;
            }
        });
        
        // Update UI
        this.updatePlayerInfo();
        this.updateGameBoard();
    }
    
    updatePlayerState(playerId, data) {
        if (!this.gameState || !this.gameState.players) {
            return;
        }
        
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player) {
            Object.assign(player, data);
        }
    }
    
    updatePropertyState(propertyId, data) {
        if (!this.gameState || !this.gameState.board) {
            return;
        }
        
        const property = this.gameState.board.find(p => p.id === propertyId);
        if (property) {
            Object.assign(property, data);
        }
    }
    
    updateGameState(data) {
        if (!this.gameState) {
            return;
        }
        
        Object.assign(this.gameState, data);
        this.updateGameControls();
    }
    
    updateDiceDisplay(diceData) {
        // Update dice display in UI
        const dice1Element = document.getElementById('dice1');
        const dice2Element = document.getElementById('dice2');
        
        if (dice1Element && diceData.dice) {
            dice1Element.textContent = diceData.dice[0];
            dice2Element.textContent = diceData.dice[1];
        }
    }
    
    reconcileState(differences) {
        // Handle state reconciliation
        console.log('Reconciling state differences:', differences);
        this.addLogMessage('Reconciling game state...');
        
        // Apply differences
        if (differences.players) {
            Object.keys(differences.players).forEach(playerId => {
                const playerDiff = differences.players[playerId];
                if (playerDiff.action === 'update') {
                    this.updatePlayerState(playerId, playerDiff.changes);
                }
            });
        }
        
        if (differences.gameState) {
            this.updateGameState(differences.gameState);
        }
        
        // Update UI
        this.updatePlayerInfo();
        this.updateGameBoard();
    }
    
    // Event handlers
    handleGameEvent(data) {
        switch (data.eventType) {
            case 'player:turn:started':
                this.addLogMessage(`${data.eventData.playerName}'s turn started`);
                break;
            case 'player:turn:ended':
                this.addLogMessage(`${data.eventData.playerName}'s turn ended`);
                break;
            case 'player:moved':
                this.addLogMessage(`${data.eventData.playerName} moved to ${data.eventData.spaceName}`);
                break;
            case 'player:money:changed':
                this.addLogMessage(`${data.eventData.playerName}'s money changed by $${data.eventData.amount}`);
                break;
            case 'player:jailed':
                this.addLogMessage(`${data.eventData.playerName} was sent to jail`);
                break;
            case 'player:released':
                this.addLogMessage(`${data.eventData.playerName} was released from jail`);
                break;
            case 'property:purchased':
                this.addLogMessage(`${data.eventData.playerName} purchased ${data.eventData.propertyName}`);
                break;
            case 'card:drawn':
                this.addLogMessage(`${data.eventData.playerName} drew a ${data.eventData.deckType} card`);
                break;
            default:
                this.addLogMessage(`Game event: ${data.eventType}`);
        }
    }
    
    handlePlayerJoined(data) {
        this.addLogMessage(`${data.player.name} joined the game`);
        this.updatePlayerInfo();
    }
    
    handleGameStarted(data) {
        this.isGameStarted = true;
        this.addLogMessage('Game started!');
        this.updateGameControls();
        this.updatePlayerInfo();
    }
    
    handleDiceRolled(data) {
        this.addLogMessage(`Dice rolled: ${data.dice[0]} and ${data.dice[1]}`);
        this.updateDiceDisplay(data);
    }
    
    handleTurnEnded(data) {
        this.addLogMessage(`Turn ended. Next player's turn.`);
        this.updateGameControls();
        this.updatePlayerInfo();
    }
    
    handlePropertyPurchased(data) {
        this.addLogMessage(`${data.playerName} purchased ${data.propertyName}`);
        this.updateGameBoard();
        this.updatePlayerInfo();
    }
    
    handleCardDrawn(data) {
        this.addLogMessage(`Card drawn: ${data.card.text}`);
        this.showCardModal(data.card);
    }
    
    handleError(data) {
        this.addLogMessage(`Error: ${data.message}`);
        console.error('Game error:', data);
    }
    
    handleGameCreated(data) {
        this.gameId = data.gameId;
        this.addLogMessage(`Game created with ID: ${data.gameId}`);
        
        // Notify UI that game was created
        if (window.ui) {
            window.ui.onGameCreated(data.gameId);
        }
    }
    
    handleGameJoined(data) {
        this.playerId = data.playerId;
        this.gameState = data.gameState;
        this.addLogMessage(`Successfully joined game as player ${data.playerId}`);
        
        // Update UI
        this.updateGameBoard();
        this.updatePlayerInfo();
        this.updateGameControls();
        
        // Notify UI that player joined
        if (window.ui) {
            window.ui.onGameJoined(data);
        }
    }
    
    handleGameStarted(data) {
        this.isGameStarted = true;
        this.addLogMessage('Game has started!');
        
        // Update UI
        this.updateGameControls();
        
        // Notify UI that game started
        if (window.ui) {
            window.ui.onGameStarted();
        }
    }
    
    // UI update methods
    updateGameBoard() {
        if (!this.gameState || !this.gameState.board) {
            return;
        }
        
        // Update board display
        const boardContainer = document.querySelector('.board');
        if (boardContainer) {
            boardContainer.innerHTML = this.generateBoardHTML();
            this.updatePlayerPositions();
        }
    }
    
    generateBoardHTML() {
        if (!this.gameState || !this.gameState.board) {
            return '';
        }
        
        let boardHTML = '<div class="board-spaces">';
        
        this.gameState.board.forEach((space, index) => {
            const isProperty = space.type === 'street' || space.type === 'railroad' || space.type === 'utility';
            const isOwned = space.ownerId !== null && space.ownerId !== undefined;
            
            boardHTML += `
                <div class="board-space ${space.type} ${isOwned ? 'owned' : ''}" data-position="${index}">
                    <div class="space-name">${space.name}</div>
                    ${isProperty ? `<div class="space-price">$${space.price}</div>` : ''}
                    ${isOwned ? `<div class="space-owner">Owned</div>` : ''}
                    <div class="space-players" id="players-on-${index}"></div>
                </div>
            `;
        });
        
        boardHTML += '</div>';
        return boardHTML;
    }
    
    updatePlayerPositions() {
        if (!this.gameState || !this.gameState.players || !this.gameState.board) {
            return;
        }
        
        // Clear all player position indicators
        this.gameState.board.forEach((space, index) => {
            const playersOnSpace = document.getElementById(`players-on-${index}`);
            if (playersOnSpace) {
                playersOnSpace.innerHTML = '';
            }
        });
        
        // Add players to their current positions
        this.gameState.players.forEach((player, index) => {
            if (player.position !== undefined && player.position !== null) {
                const playersOnSpace = document.getElementById(`players-on-${player.position}`);
                if (playersOnSpace) {
                    const playerToken = document.createElement('div');
                    playerToken.className = `player-token player-${index + 1}`;
                    playerToken.style.backgroundColor = player.color || '#ccc';
                    playerToken.title = player.name;
                    playersOnSpace.appendChild(playerToken);
                }
            }
        });
    }
    
    updatePlayerInfo() {
        if (!this.gameState || !this.gameState.players) {
            return;
        }
        
        const playerDetails = document.getElementById('player-details');
        if (!playerDetails) return;
        
        let html = '';
        this.gameState.players.forEach((player, index) => {
            const isCurrentPlayer = this.gameState.currentPlayerId === player.id;
            html += `
                <div class="player ${isCurrentPlayer ? 'current-player' : ''}">
                    <h3>${player.name} ${isCurrentPlayer ? '(Current)' : ''}</h3>
                    <p>Money: $${player.money}</p>
                    <p>Position: ${this.gameState.board[player.position]?.name || 'Unknown'}</p>
                    <p>Properties: ${player.properties ? player.properties.length : 0}</p>
                    ${player.inJail ? '<p class="in-jail">IN JAIL</p>' : ''}
                    ${player.getOutOfJailCards > 0 ? `<p>Get Out of Jail Cards: ${player.getOutOfJailCards}</p>` : ''}
                </div>
            `;
        });
        
        playerDetails.innerHTML = html;
    }
    
    updateGameControls() {
        const rollDiceBtn = document.getElementById('roll-dice');
        const endTurnBtn = document.getElementById('end-turn');
        
        if (!this.gameState || !this.isGameStarted) {
            // Game not started
            if (rollDiceBtn) rollDiceBtn.disabled = true;
            if (endTurnBtn) endTurnBtn.disabled = true;
            return;
        }
        
        const isCurrentPlayer = this.gameState.currentPlayerId === this.playerId;
        const currentPlayer = this.gameState.players.find(p => p.id === this.gameState.currentPlayerId);
        
        if (rollDiceBtn) {
            rollDiceBtn.disabled = !isCurrentPlayer || (currentPlayer && currentPlayer.inJail);
        }
        
        if (endTurnBtn) {
            endTurnBtn.disabled = !isCurrentPlayer;
        }
    }
    
    showCardModal(card) {
        // Create and show a modal with the card information
        const modal = document.createElement('div');
        modal.className = 'card-modal';
        modal.innerHTML = `
            <div class="card-content">
                <h3>${card.type === 'chance' ? 'Chance' : 'Community Chest'}</h3>
                <p>${card.text}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }
    
    addLogMessage(message) {
        const logMessages = document.getElementById('log-messages');
        if (!logMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'log-message';
        messageElement.textContent = message;
        
        logMessages.appendChild(messageElement);
        logMessages.scrollTop = logMessages.scrollHeight;
        
        // Also dispatch custom event for other components
        const event = new CustomEvent('gameLog', { detail: message });
        document.dispatchEvent(event);
    }
    
    // Utility methods
    getCurrentPlayer() {
        if (!this.gameState || !this.gameState.players) {
            return null;
        }
        
        return this.gameState.players.find(p => p.id === this.gameState.currentPlayerId);
    }
    
    getPlayerById(playerId) {
        if (!this.gameState || !this.gameState.players) {
            return null;
        }
        
        return this.gameState.players.find(p => p.id === playerId);
    }
    
    getPropertyById(propertyId) {
        if (!this.gameState || !this.gameState.board) {
            return null;
        }
        
        return this.gameState.board.find(p => p.id === propertyId);
    }
    
    // Public methods for UI to call
    canRollDice() {
        return this.isGameStarted &&
               this.gameState &&
               this.gameState.currentPlayerId === this.playerId &&
               !this.getCurrentPlayer()?.inJail;
    }
    
    canEndTurn() {
        return this.isGameStarted &&
               this.gameState &&
               this.gameState.currentPlayerId === this.playerId;
    }
    
    canBuyProperty(propertyId) {
        if (!this.gameState || !this.isGameStarted) {
            return false;
        }
        
        const property = this.getPropertyById(propertyId);
        const currentPlayer = this.getCurrentPlayer();
        
        return property &&
               !property.ownerId &&
               currentPlayer &&
               currentPlayer.money >= property.price;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MonopolyGame();
});