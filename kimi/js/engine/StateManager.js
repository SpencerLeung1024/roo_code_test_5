/**
 * State Manager
 * Handles game state persistence and loading
 */

import { constants } from '../config/constants.js';
import { StorageService } from '../services/StorageService.js';

/**
 * Manages game state persistence
 */
export class StateManager {
    constructor() {
        this.storageService = new StorageService();
        this.autoSaveInterval = null;
    }

    /**
     * Initialize the state manager
     */
    async init() {
        console.log('💾 Initializing State Manager...');
        
        // Setup auto-save
        this.setupAutoSave();
        
        console.log('✅ State Manager initialized');
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    /**
     * Save game state
     * @param {Object} gameState - The game state to save
     */
    async saveGame(gameState) {
        try {
            const state = {
                ...gameState,
                timestamp: Date.now(),
                version: constants.GAME.VERSION
            };
            
            await this.storageService.saveGame(state);
            console.log('💾 Game saved successfully');
            
            // Show notification
            this.showSaveNotification('Game saved');
            
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            this.showSaveNotification('Failed to save game', 'error');
        }
    }

    /**
     * Load game state
     * @returns {Object|null} The loaded game state
     */
    async loadGame() {
        try {
            const state = await this.storageService.loadGame();
            
            if (state) {
                console.log('📂 Game loaded successfully');
                return state;
            }
            
            console.log('📂 No saved game found');
            return null;
            
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }

    /**
     * Check if a saved game exists
     * @returns {Promise<boolean>} True if saved game exists
     */
    async hasSavedGame() {
        try {
            return await this.storageService.hasSavedGame();
        } catch (error) {
            console.error('❌ Failed to check for saved game:', error);
            return false;
        }
    }

    /**
     * Auto-save current game state
     */
    autoSave() {
        if (window.monopolyGame && window.monopolyGame.gameEngine) {
            const gameState = window.monopolyGame.gameEngine.getGameState();
            if (gameState.isGameActive) {
                this.saveGame(gameState);
            }
        }
    }

    /**
     * Clear saved game
     */
    async clearSavedGame() {
        try {
            await this.storageService.clearSavedGame();
            console.log('🗑️ Saved game cleared');
        } catch (error) {
            console.error('❌ Failed to clear saved game:', error);
        }
    }

    /**
     * Get list of saved games
     * @returns {Promise<Array>} List of saved games
     */
    async getSavedGames() {
        try {
            return await this.storageService.getSavedGames();
        } catch (error) {
            console.error('❌ Failed to get saved games:', error);
            return [];
        }
    }

    /**
     * Get count of saved games
     * @returns {Promise<number>} Number of saved games
     */
    async getSavedGamesCount() {
        try {
            const games = await this.getSavedGames();
            return games.length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Show save notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showSaveNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `save-notification save-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px',
            zIndex: '1000',
            backgroundColor: type === 'error' ? '#e74c3c' : '#2ecc71'
        });
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Export game state as JSON
     * @returns {string} JSON string of game state
     */
    exportGameState() {
        if (window.monopolyGame && window.monopolyGame.gameEngine) {
            const gameState = window.monopolyGame.gameEngine.getGameState();
            return JSON.stringify(gameState, null, 2);
        }
        return null;
    }

    /**
     * Import game state from JSON
     * @param {string} jsonString - JSON string of game state
     * @returns {boolean} True if import successful
     */
    async importGameState(jsonString) {
        try {
            const gameState = JSON.parse(jsonString);
            
            // Validate game state
            if (!this.validateGameState(gameState)) {
                throw new Error('Invalid game state format');
            }
            
            // Load the state
            if (window.monopolyGame && window.monopolyGame.gameEngine) {
                window.monopolyGame.gameEngine.loadGameState(gameState);
                console.log('📂 Game state imported successfully');
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Failed to import game state:', error);
            return false;
        }
    }

    /**
     * Validate game state format
     * @param {Object} state - Game state to validate
     * @returns {boolean} True if valid
     */
    validateGameState(state) {
        return (
            state &&
            Array.isArray(state.players) &&
            typeof state.currentPlayerIndex === 'number' &&
            typeof state.gameRound === 'number' &&
            typeof state.isGameActive === 'boolean'
        );
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}