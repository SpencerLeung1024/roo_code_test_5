/**
 * Main Application Entry Point
 * Initializes and coordinates the complete Monopoly game
 */

import { initMonopolyGame } from './engine/MonopolyGame.js';
import { BoardRenderer } from './ui/BoardRenderer.js';
import { ModalManager } from './ui/ModalManager.js';
import { EventEmitter } from './utils/EventEmitter.js';

/**
 * Main application controller
 */
class MonopolyApp extends EventEmitter {
    constructor() {
        super();
        this.game = null;
        this.boardRenderer = null;
        this.modalManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🎲 Starting Monopoly Application...');
        
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize game
            this.game = await initMonopolyGame();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show setup modal
            this.showSetupModal();
            
            this.isInitialized = true;
            console.log('✅ Monopoly Application ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize game: ' + error.message);
        }
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        // Initialize board renderer
        this.boardRenderer = new BoardRenderer(this.game.gameEngine.board);
        await this.boardRenderer.init();
        
        // Initialize modal manager
        this.modalManager = new ModalManager();
        await this.modalManager.init();
        
        // Render game board
        const boardContainer = document.getElementById('game-board');
        if (boardContainer) {
            boardContainer.appendChild(this.boardRenderer.getElement());
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Game events
        this.game.on('game:ready', () => {
            console.log('Game system ready');
        });

        this.game.on('game:started', (data) => {
            this.handleGameStarted(data);
        });

        this.game.on('game:ended', (data) => {
            this.handleGameEnded(data);
        });

        // UI events
        document.getElementById('start-game-btn')?.addEventListener('click', () => {
            this.handleStartGame();
        });

        document.getElementById('load-game-btn')?.addEventListener('click', () => {
            this.handleLoadGame();
        });

        document.getElementById('add-player-btn')?.addEventListener('click', () => {
            this.addPlayerInput();
        });

        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.handlePauseGame();
        });

        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.handleSaveGame();
        });

        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.handleRestartGame();
        });

        document.getElementById('resume-btn')?.addEventListener('click', () => {
            this.handleResumeGame();
        });

        document.getElementById('new-game-btn')?.addEventListener('click', () => {
            this.handleNewGame();
        });

        // Modal events
        document.addEventListener('modal:closed', (event) => {
            this.handleModalClosed(event.detail);
        });
    }

    /**
     * Show setup modal
     */
    showSetupModal() {
        this.modalManager.show('setup-modal');
        this.initializePlayerInputs();
    }

    /**
     * Initialize player input fields
     */
    initializePlayerInputs() {
        const playerList = document.getElementById('player-list');
        if (!playerList) return;

        playerList.innerHTML = '';
        
        // Add 2 default players
        for (let i = 0; i < 2; i++) {
            this.addPlayerInput();
        }
    }

    /**
     * Add player input field
     */
    addPlayerInput() {
        const playerList = document.getElementById('player-list');
        if (!playerList) return;

        const playerCount = playerList.children.length;
        if (playerCount >= 6) {
            alert('Maximum 6 players allowed');
            return;
        }

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-input';
        playerDiv.innerHTML = `
            <input type="text" 
                   class="player-name" 
                   placeholder="Player ${playerCount + 1} name" 
                   maxlength="20">
            <select class="player-token">
                <option value="🚗">🚗 Car</option>
                <option value="🐕">🐕 Dog</option>
                <option value="🎩">🎩 Hat</option>
                <option value="👢">👢 Boot</option>
                <option value="🚂">🚂 Ship</option>
                <option value="🐈">🐈 Cat</option>
            </select>
            <button type="button" class="remove-player-btn">×</button>
        `;

        playerList.appendChild(playerDiv);

        // Add remove handler
        playerDiv.querySelector('.remove-player-btn').addEventListener('click', () => {
            if (playerList.children.length > 2) {
                playerDiv.remove();
            } else {
                alert('At least 2 players required');
            }
        });
    }

    /**
     * Handle start game
     */
    handleStartGame() {
        const gameConfig = this.collectGameConfig();
        const validation = this.validateGameConfig(gameConfig);
        
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        this.modalManager.hide('setup-modal');
        this.game.startGame(gameConfig);
    }

    /**
     * Collect game configuration from UI
     */
    collectGameConfig() {
        const players = [];
        const playerInputs = document.querySelectorAll('.player-input');
        
        playerInputs.forEach(input => {
            const name = input.querySelector('.player-name').value.trim();
            const token = input.querySelector('.player-token').value;
            
            if (name) {
                players.push({
                    name,
                    token,
                    money: 1500 // Starting money
                });
            }
        });

        const autoSave = document.getElementById('auto-save')?.checked || true;
        const turnTimer = document.getElementById('turn-timer')?.checked || true;

        return {
            players,
            settings: {
                autoSave,
                turnTimeout: turnTimer ? 5 * 60 * 1000 : 0
            }
        };
    }

    /**
     * Validate game configuration
     */
    validateGameConfig(config) {
        const errors = [];

        if (!config.players || config.players.length < 2) {
            errors.push('At least 2 players required');
        }

        if (config.players.length > 6) {
            errors.push('Maximum 6 players allowed');
        }

        const names = config.players.map(p => p.name);
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
            errors.push('Player names must be unique');
        }

        const emptyNames = names.filter(name => !name || name.trim().length === 0);
        if (emptyNames.length > 0) {
            errors.push('All players must have names');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Handle load game
     */
    async handleLoadGame() {
        try {
            const success = await this.game.loadGame();
            if (success) {
                this.modalManager.hide('setup-modal');
                this.showGameInterface();
            } else {
                alert('No saved game found');
            }
        } catch (error) {
            alert('Failed to load game: ' + error.message);
        }
    }

    /**
     * Handle game started
     */
    handleGameStarted(data) {
        console.log('Game started with config:', data.config);
        this.showGameInterface();
    }

    /**
     * Handle game ended
     */
    handleGameEnded(data) {
        this.showGameOverModal(data);
    }

    /**
     * Show game interface
     */
    showGameInterface() {
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('setup-modal').style.display = 'none';
        
        // Update board
        this.boardRenderer.render();
    }

    /**
     * Show game over modal
     */
    showGameOverModal(data) {
        const modal = document.getElementById('game-over-modal');
        const winnerName = document.getElementById('winner-name');
        const winnerMessage = document.getElementById('winner-message');
        const rankingsList = document.getElementById('rankings-list');

        if (data.winner) {
            winnerName.textContent = data.winner.name;
            winnerMessage.textContent = 'Congratulations! You won the game!';
        } else {
            winnerName.textContent = 'Game Over';
            winnerMessage.textContent = 'All players are bankrupt!';
        }

        // Update rankings
        rankingsList.innerHTML = '';
        data.rankings.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = `${player.name} - $${player.getNetWorth()}${player.isBankrupt ? ' (Bankrupt)' : ''}`;
            rankingsList.appendChild(li);
        });

        this.modalManager.show('game-over-modal');
    }

    /**
     * Handle pause game
     */
    handlePauseGame() {
        this.game.pauseGame();
        this.modalManager.show('pause-modal');
    }

    /**
     * Handle resume game
     */
    handleResumeGame() {
        this.game.resumeGame();
        this.modalManager.hide('pause-modal');
    }

    /**
     * Handle save game
     */
    async handleSaveGame() {
        try {
            await this.game.saveGame();
            alert('Game saved successfully!');
        } catch (error) {
            alert('Failed to save game: ' + error.message);
        }
    }

    /**
     * Handle restart game
     */
    async handleRestartGame() {
        if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
            await this.game.restartGame();
            this.showSetupModal();
        }
    }

    /**
     * Handle new game
     */
    handleNewGame() {
        this.modalManager.hide('game-over-modal');
        this.showSetupModal();
    }

    /**
     * Handle modal closed
     */
    handleModalClosed(detail) {
        console.log('Modal closed:', detail.modalId);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        alert(message);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new MonopolyApp();
    await app.init();
    
    // Make app globally available for debugging
    window.monopolyApp = app;
});