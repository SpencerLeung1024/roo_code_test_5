// User Interface Handling for Monopoly Game
// This handles the client-side UI and user interactions

class GameUI {
    constructor(game) {
        this.game = game;
        this.playerColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FECA57', '#FF9FF3', '#54A0FF', '#48DBFB'
        ];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        // Initialize player setup
        this.showPlayerSetup();
        
        // Listen for game log events
        document.addEventListener('gameLog', (event) => {
            this.addLogMessage(event.detail);
        });
    }
    
    setupEventListeners() {
        // Roll dice button
        const rollDiceBtn = document.getElementById('roll-dice');
        if (rollDiceBtn) {
            rollDiceBtn.addEventListener('click', () => this.handleRollDice());
        }
        
        // End turn button
        const endTurnBtn = document.getElementById('end-turn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => this.handleEndTurn());
        }
        
        // Property purchase buttons (will be added dynamically)
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('buy-property-btn')) {
                this.handleBuyProperty(event.target.dataset.propertyId);
            }
            
            if (event.target.classList.contains('draw-card-btn')) {
                this.handleDrawCard(event.target.dataset.cardType);
            }
        });
    }
    
    showPlayerSetup() {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.innerHTML = `
            <div class="player-setup">
                <h2>Player Setup</h2>
                <div id="player-inputs">
                    <div class="player-input">
                        <label for="player1-name">Player 1 Name:</label>
                        <input type="text" id="player1-name" value="Player 1" required>
                        <div class="color-picker">
                            <input type="color" id="player1-color" value="${this.playerColors[0]}">
                        </div>
                    </div>
                    <div class="player-input">
                        <label for="player2-name">Player 2 Name:</label>
                        <input type="text" id="player2-name" value="Player 2" required>
                        <div class="color-picker">
                            <input type="color" id="player2-color" value="${this.playerColors[1]}">
                        </div>
                    </div>
                </div>
                <button id="add-player-btn">Add Player</button>
                <button id="start-game-btn">Start Game</button>
            </div>
        `;
        
        // Add event listeners for player setup
        document.getElementById('add-player-btn').addEventListener('click', () => this.addPlayerInput());
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    }
    
    addPlayerInput() {
        const playerInputs = document.getElementById('player-inputs');
        const playerCount = playerInputs.children.length + 1;
        
        if (playerCount > 8) {
            this.addLogMessage('Maximum 8 players allowed!');
            return;
        }
        
        const playerInput = document.createElement('div');
        playerInput.className = 'player-input';
        playerInput.innerHTML = `
            <label for="player${playerCount}-name">Player ${playerCount} Name:</label>
            <input type="text" id="player${playerCount}-name" value="Player ${playerCount}" required>
            <div class="color-picker">
                <input type="color" id="player${playerCount}-color" value="${this.playerColors[playerCount - 1]}">
            </div>
        `;
        
        playerInputs.appendChild(playerInput);
    }
    
    startGame() {
        const playerInputs = document.querySelectorAll('.player-input');
        const players = [];
        
        // First create a game
        this.game.createGame();
        
        // Store player info for joining after game is created
        this.pendingPlayers = [];
        
        playerInputs.forEach((input, index) => {
            const nameInput = input.querySelector('input[type="text"]');
            const colorInput = input.querySelector('input[type="color"]');
            const name = nameInput.value.trim() || `Player ${index + 1}`;
            const color = colorInput.value || this.playerColors[index];
            
            this.pendingPlayers.push({ name, color });
            players.push({ name, color });
        });
        
        if (players.length < 2) {
            this.addLogMessage('Need at least 2 players to start the game!');
            return;
        }
        
        this.addLogMessage('Creating game...');
    }
    
    // Handle game created event
    onGameCreated(gameId) {
        this.gameId = gameId;
        this.addLogMessage(`Game created with ID: ${gameId}`);
        
        // Join all players to the game
        if (this.pendingPlayers && this.pendingPlayers.length > 0) {
            this.pendingPlayers.forEach((player, index) => {
                setTimeout(() => {
                    this.game.joinGame(gameId, player.name, player.color);
                }, index * 100); // Small delay between joins
            });
        }
    }
    
    // Handle game joined event
    onGameJoined(data) {
        this.addLogMessage(`Successfully joined game as ${data.playerId}`);
        
        // Check if all players have joined
        if (this.pendingPlayers && this.pendingPlayers.length > 0) {
            this.playersJoined = (this.playersJoined || 0) + 1;
            
            if (this.playersJoined >= this.pendingPlayers.length) {
                // All players have joined, start the game
                setTimeout(() => {
                    this.game.startGame(this.gameId);
                    this.gameStarted = true;
                    this.addLogMessage('Game started! Good luck!');
                }, 500);
            }
        }
    }
    
    // Handle game started event
    onGameStarted() {
        this.gameStarted = true;
        this.addLogMessage('Game has started! Roll the dice to begin.');
        this.initializeGameBoard();
        this.updateBoard();
        this.updatePlayerInfo();
        this.updateGameControls();
    }
    
    initializeGameBoard() {
        const gameBoard = document.querySelector('.game-board');
        gameBoard.innerHTML = `
            <div class="board-container">
                <div class="board">
                    <!-- Board will be dynamically generated based on game state -->
                    <div id="board-spaces"></div>
                </div>
                <div class="dice-container">
                    <div class="dice" id="dice1">?</div>
                    <div class="dice" id="dice2">?</div>
                </div>
                <div class="action-buttons">
                    <button id="roll-dice" class="game-btn">Roll Dice</button>
                    <button id="end-turn" class="game-btn">End Turn</button>
                </div>
            </div>
        `;
        
        // Re-setup event listeners for the new buttons
        this.setupEventListeners();
    }
    
    generateBoardHTML() {
        if (!this.game.gameState || !this.game.gameState.board) {
            return '<div class="board-message">Waiting for game state...</div>';
        }
        
        let boardHTML = '<div class="board-spaces">';
        
        this.game.gameState.board.forEach((space, index) => {
            const isProperty = space.type === 'street' || space.type === 'railroad' || space.type === 'utility';
            const isOwned = space.ownerId !== null && space.ownerId !== undefined;
            const currentPlayer = this.game.getCurrentPlayer();
            const canBuy = isProperty && !isOwned && currentPlayer && currentPlayer.money >= space.price;
            
            boardHTML += `
                <div class="board-space ${space.type} ${isOwned ? 'owned' : ''}" data-position="${index}">
                    <div class="space-name">${space.name}</div>
                    ${isProperty ? `<div class="space-price">$${space.price}</div>` : ''}
                    ${isOwned ? `<div class="space-owner">Owned</div>` : ''}
                    ${canBuy ? `<button class="buy-property-btn" data-property-id="${space.id}">Buy</button>` : ''}
                    ${(space.type === 'chance' || space.type === 'communityChest') ?
                        `<button class="draw-card-btn" data-card-type="${space.type === 'chance' ? 'chance' : 'communityChest'}">Draw Card</button>` : ''}
                    <div class="space-players" id="players-on-${index}"></div>
                </div>
            `;
        });
        
        boardHTML += '</div>';
        return boardHTML;
    }
    
    updateBoard() {
        const boardSpaces = document.getElementById('board-spaces');
        if (boardSpaces) {
            boardSpaces.innerHTML = this.generateBoardHTML();
            this.updatePlayerPositions();
        }
    }
    
    updatePlayerPositions() {
        if (!this.game.gameState || !this.game.gameState.players || !this.game.gameState.board) {
            return;
        }
        
        // Clear all player position indicators
        this.game.gameState.board.forEach((space, index) => {
            const playersOnSpace = document.getElementById(`players-on-${index}`);
            if (playersOnSpace) {
                playersOnSpace.innerHTML = '';
            }
        });
        
        // Add players to their current positions
        this.game.gameState.players.forEach((player, index) => {
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
        if (!this.game.gameState || !this.game.gameState.players) {
            return;
        }
        
        const playerDetails = document.getElementById('player-details');
        if (!playerDetails) return;
        
        let html = '';
        this.game.gameState.players.forEach((player, index) => {
            const isCurrentPlayer = this.game.gameState.currentPlayerId === player.id;
            html += `
                <div class="player ${isCurrentPlayer ? 'current-player' : ''}">
                    <h3 style="color: ${player.color || '#ccc'}">${player.name} ${isCurrentPlayer ? '(Current)' : ''}</h3>
                    <p>Money: $${player.money}</p>
                    <p>Position: ${this.game.gameState.board[player.position]?.name || 'Unknown'}</p>
                    <p>Properties: ${player.properties ? player.properties.length : 0}</p>
                    ${player.inJail ? '<p class="in-jail">IN JAIL</p>' : ''}
                    ${player.getOutOfJailCards > 0 ? `<p>Get Out of Jail Cards: ${player.getOutOfJailCards}</p>` : ''}
                    ${isCurrentPlayer ? '<div class="current-turn-indicator">● Your Turn</div>' : ''}
                </div>
            `;
        });
        
        playerDetails.innerHTML = html;
    }
    
    updateGameControls() {
        const rollDiceBtn = document.getElementById('roll-dice');
        const endTurnBtn = document.getElementById('end-turn');
        
        if (rollDiceBtn) {
            rollDiceBtn.disabled = !this.game.canRollDice();
        }
        
        if (endTurnBtn) {
            endTurnBtn.disabled = !this.game.canEndTurn();
        }
    }
    
    handleRollDice() {
        if (!this.game.canRollDice()) {
            this.addLogMessage('You cannot roll dice right now!');
            return;
        }
        
        this.game.rollDice();
    }
    
    handleEndTurn() {
        if (!this.game.canEndTurn()) {
            this.addLogMessage('You cannot end turn right now!');
            return;
        }
        
        this.game.endTurn();
    }
    
    handleBuyProperty(propertyId) {
        if (!this.game.canBuyProperty(propertyId)) {
            this.addLogMessage('You cannot buy this property!');
            return;
        }
        
        this.game.buyProperty(propertyId);
    }
    
    handleDrawCard(cardType) {
        if (!this.game.gameState || !this.game.gameState.currentPlayerId) {
            this.addLogMessage('You cannot draw a card right now!');
            return;
        }
        
        this.game.drawCard(cardType);
    }
    
    showPropertyModal(property) {
        const modal = document.createElement('div');
        modal.className = 'property-modal';
        modal.innerHTML = `
            <div class="property-content">
                <h3>${property.name}</h3>
                <p>Type: ${property.type}</p>
                <p>Price: $${property.price}</p>
                ${property.rentLevels ? `<p>Rent: $${property.rentLevels[0]}</p>` : ''}
                ${property.ownerId ? `<p>Owned by: ${this.game.getPlayerById(property.ownerId)?.name || 'Unknown'}</p>` : '<p>Available for purchase</p>'}
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
    }
    
    // Public methods for external calls
    onGameStateUpdate() {
        this.updateBoard();
        this.updatePlayerInfo();
        this.updateGameControls();
    }
    
    onGameEvent(event) {
        // Handle specific game events
        switch (event.eventType) {
            case 'player:turn:started':
                this.addLogMessage(`${event.eventData.playerName}'s turn started`);
                break;
            case 'player:turn:ended':
                this.addLogMessage(`${event.eventData.playerName}'s turn ended`);
                break;
            case 'player:moved':
                this.addLogMessage(`${event.eventData.playerName} moved to ${event.eventData.spaceName}`);
                break;
            case 'property:purchased':
                this.addLogMessage(`${event.eventData.playerName} purchased ${event.eventData.propertyName}`);
                break;
            case 'card:drawn':
                this.addLogMessage(`${event.eventData.playerName} drew a ${event.eventData.deckType} card`);
                break;
        }
    }
}

// Initialize the UI when the page loads and the game is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the game to be initialized
    const checkGame = setInterval(() => {
        if (window.game) {
            clearInterval(checkGame);
            window.ui = new GameUI(window.game);
            
            // Set up game state update listener
            window.game.onGameStateUpdate = () => {
                window.ui.onGameStateUpdate();
            };
            
            // Set up game event listener
            window.game.onGameEvent = (event) => {
                window.ui.onGameEvent(event);
            };
        }
    }, 100);
});