/**
 * Monopoly Game - Main Entry Point
 * Initializes the game and coordinates all components
 */

import { GameEngine } from './engine/GameEngine.js';
import { BoardRenderer } from './ui/BoardRenderer.js';
import { PlayerRenderer } from './ui/PlayerRenderer.js';
import { ModalManager } from './ui/ModalManager.js';
import { EventHandlers } from './ui/EventHandlers.js';
import { StateManager } from './engine/StateManager.js';
import { constants } from './config/constants.js';

/**
 * Main application class
 * Coordinates all game components
 */
class MonopolyGame {
    constructor() {
        this.gameEngine = null;
        this.boardRenderer = null;
        this.playerRenderer = null;
        this.modalManager = null;
        this.eventHandlers = null;
        this.stateManager = null;
        
        this.isInitialized = false;
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            console.log('🎮 Initializing Monopoly Game...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize state manager
            this.stateManager = new StateManager();
            await this.stateManager.init();
            
            // Initialize modal manager
            this.modalManager = new ModalManager();
            await this.modalManager.init();
            
            // Initialize renderers
            this.boardRenderer = new BoardRenderer();
            await this.boardRenderer.init();
            
            this.playerRenderer = new PlayerRenderer();
            await this.playerRenderer.init();
            
            // Initialize game engine
            this.gameEngine = new GameEngine();
            await this.gameEngine.init();
            
            // Initialize event handlers
            this.eventHandlers = new EventHandlers({
                gameEngine: this.gameEngine,
                boardRenderer: this.boardRenderer,
                playerRenderer: this.playerRenderer,
                modalManager: this.modalManager,
                stateManager: this.stateManager
            });
            await this.eventHandlers.init();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Check for saved game
            await this.checkForSavedGame();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Monopoly Game initialized successfully!');
            
            // Show welcome modal
            this.showWelcomeModal();
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stateManager.autoSave();
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', (e) => {
            this.stateManager.autoSave();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.stateManager.saveGame();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.stateManager.loadGame();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.startNewGame();
                        break;
                }
            }
        });
    }

    /**
     * Check for saved game on startup
     */
    async checkForSavedGame() {
        const hasSavedGame = await this.stateManager.hasSavedGame();
        if (hasSavedGame) {
            const shouldLoad = await this.modalManager.showConfirm({
                title: 'Continue Game?',
                message: 'You have a saved game. Would you like to continue where you left off?',
                confirmText: 'Continue',
                cancelText: 'New Game'
            });
            
            if (shouldLoad) {
                await this.stateManager.loadGame();
            } else {
                await this.startNewGame();
            }
        } else {
            await this.startNewGame();
        }
    }

    /**
     * Start a new game
     */
    async startNewGame() {
        const gameConfig = await this.modalManager.showGameSetup();
        if (gameConfig) {
            await this.gameEngine.startNewGame(gameConfig);
            this.stateManager.clearSavedGame();
        }
    }

    /**
     * Show welcome modal
     */
    async showWelcomeModal() {
        await this.modalManager.showWelcome();
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        this.modalManager.showError(message);
    }

    /**
     * Get game statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            hasActiveGame: this.gameEngine?.isGameActive() || false,
            currentPlayer: this.gameEngine?.getCurrentPlayer(),
            gameRound: this.gameEngine?.getCurrentRound() || 0,
            savedGames: this.stateManager?.getSavedGamesCount() || 0
        };
    }
}

/**
 * Global game instance
 */
window.monopolyGame = new MonopolyGame();

/**
 * Initialize game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.monopolyGame.init();
});

/**
 * Export for testing
 */
export { MonopolyGame };