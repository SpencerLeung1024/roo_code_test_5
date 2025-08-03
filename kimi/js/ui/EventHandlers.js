/**
 * Event Handlers
 * Handles user interactions and game events
 */

/**
 * Manages all user interactions and game events
 */
export class EventHandlers {
    constructor(components) {
        this.gameEngine = components.gameEngine;
        this.boardRenderer = components.boardRenderer;
        this.playerRenderer = components.playerRenderer;
        this.modalManager = components.modalManager;
        this.stateManager = components.stateManager;
        
        this.isInitialized = false;
    }

    async init() {
        this.bindUIEvents();
        this.bindGameEvents();
        this.isInitialized = true;
        console.log('Event Handlers initialized');
    }

    bindUIEvents() {
        // New Game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.handleNewGame());
        }

        // Roll Dice button
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if (rollDiceBtn) {
            rollDiceBtn.addEventListener('click', () => this.handleRollDice());
        }

        // End Turn button
        const endTurnBtn = document.getElementById('end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => this.handleEndTurn());
        }

        // Save/Load buttons
        const saveBtn = document.getElementById('save-game-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveGame());
        }

        const loadBtn = document.getElementById('load-game-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.handleLoadGame());
        }

        // Player management buttons
        this.bindPlayerManagementEvents();
    }

    bindPlayerManagementEvents() {
        // Player card clicks for details
        document.addEventListener('click', (e) => {
            const playerCard = e.target.closest('.player-card');
            if (playerCard && playerCard.dataset.playerId) {
                this.handlePlayerCardClick(playerCard.dataset.playerId);
            }
        });

        // Player token clicks
        document.addEventListener('click', (e) => {
            const playerToken = e.target.closest('.player-token');
            if (playerToken && playerToken.dataset.playerId) {
                this.handlePlayerTokenClick(playerToken.dataset.playerId);
            }
        });

        // Keyboard shortcuts for player management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && e.ctrlKey) {
                e.preventDefault();
                this.handlePlayerManagement();
            }
        });
    }

    bindGameEvents() {
        // Listen for game events
        document.addEventListener('game:start', (e) => this.handleGameStart(e.detail));
        document.addEventListener('dice:rolled', (e) => this.handleDiceRolled(e.detail));
        document.addEventListener('player:move', (e) => this.handlePlayerMove(e.detail));
        document.addEventListener('money:changed', (e) => this.handleMoneyChanged(e.detail));
        document.addEventListener('player:bankrupt', (e) => this.handlePlayerBankrupt(e.detail));
        document.addEventListener('jail:entered', (e) => this.handleJailEntered(e.detail));
        document.addEventListener('jail:exited', (e) => this.handleJailExited(e.detail));
    }

    async handleNewGame() {
        const config = await this.modalManager.showGameSetup();
        if (config) {
            await this.gameEngine.startNewGame(config);
            this.updateUI();
        }
    }

    async handleRollDice() {
        if (!this.gameEngine.isGameActive()) return;
        
        const result = this.gameEngine.rollDice();
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        
        if (currentPlayer) {
            const newPosition = this.gameEngine.movePlayer(currentPlayer, result.total);
            this.boardRenderer.highlightSquare(newPosition);
            this.updateUI();
        }
    }

    handleEndTurn() {
        if (this.gameEngine.isGameActive()) {
            this.gameEngine.nextTurn();
            this.updateUI();
        }
    }

    handleSaveGame() {
        const state = this.gameEngine.getGameState();
        if (state) {
            this.stateManager.saveGame(state);
            alert('Game saved successfully!');
        }
    }

    async handleLoadGame() {
        const gameState = this.stateManager.loadGame();
        if (gameState) {
            this.gameEngine.loadGameState(gameState);
            this.updateUI();
            alert('Game loaded successfully!');
        } else {
            alert('No saved game found!');
        }
    }

    handleGameStart(detail) {
        console.log('Game started:', detail);
        this.updateUI();
    }

    handleDiceRolled(detail) {
        console.log('Dice rolled:', detail);
        this.updateDiceDisplay(detail);
    }

    handlePlayerMove(detail) {
        console.log('Player moved:', detail);
        this.boardRenderer.updatePlayerTokens([detail.player]);
        this.playerRenderer.animatePlayerMove(detail.player, detail.fromPosition, detail.toPosition);
    }

    handleMoneyChanged(detail) {
        console.log('Money changed:', detail);
        this.playerRenderer.updatePlayerMoney(detail.player, detail.oldAmount || detail.player.money - detail.amount, detail.player.money);
        this.playerRenderer.showTransactionFeedback(detail.player, detail.amount, detail.reason);
    }

    handlePlayerBankrupt(detail) {
        console.log('Player bankrupt:', detail);
        this.playerRenderer.highlightBankruptcy(detail.player);
        this.modalManager.showConfirm({
            title: 'Player Bankrupt',
            message: `${detail.player.name} has declared bankruptcy!`,
            confirmText: 'Continue'
        });
    }

    handleJailEntered(detail) {
        console.log('Jail entered:', detail);
        this.modalManager.showConfirm({
            title: 'Go to Jail',
            message: `${detail.player.name} has been sent to jail!`,
            confirmText: 'OK'
        });
    }

    handleJailExited(detail) {
        console.log('Jail exited:', detail);
        this.modalManager.showConfirm({
            title: 'Out of Jail',
            message: `${detail.player.name} has been released from jail!`,
            confirmText: 'OK'
        });
    }

    async handlePlayerCardClick(playerId) {
        const player = this.gameEngine.game?.getPlayerById(playerId);
        if (player) {
            this.playerRenderer.showPlayerDetailsModal(player);
        }
    }

    async handlePlayerTokenClick(playerId) {
        const player = this.gameEngine.game?.getPlayerById(playerId);
        if (player) {
            this.playerRenderer.showPlayerDetailsModal(player);
        }
    }

    async handlePlayerManagement() {
        if (this.gameEngine.game) {
            await this.modalManager.showPlayerManagement(this.gameEngine.game.players);
        }
    }

    updateUI() {
        if (!this.gameEngine.game) return;
        
        const game = this.gameEngine.game;
        const players = game.players;
        const currentPlayerIndex = game.currentPlayerIndex || 0;
        
        this.playerRenderer.renderPlayers(players, currentPlayerIndex);
        this.boardRenderer.updatePlayerTokens(players);
        
        // Update current player highlight
        this.updateCurrentPlayerUI();
    }

    updateCurrentPlayerUI() {
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        if (!currentPlayer) return;
        
        // Update button states
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        const endTurnBtn = document.getElementById('end-turn-btn');
        
        if (rollDiceBtn) {
            rollDiceBtn.disabled = !currentPlayer.isActive || currentPlayer.isBankrupt;
        }
        
        if (endTurnBtn) {
            endTurnBtn.disabled = !currentPlayer.isActive || currentPlayer.isBankrupt;
        }
    }

    updateDiceDisplay(diceResult) {
        const dice1 = document.getElementById('dice-1');
        const dice2 = document.getElementById('dice-2');
        
        if (dice1) dice1.textContent = diceResult.dice1;
        if (dice2) dice2.textContent = diceResult.dice2;
    }
}