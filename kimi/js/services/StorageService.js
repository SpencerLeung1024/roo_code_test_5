/**
 * Storage Service
 * Handles local storage operations for game persistence
 */

import { constants } from '../config/constants.js';

/**
 * Service for managing game storage
 */
export class StorageService {
    constructor() {
        this.storageKey = constants.STORAGE.GAME_STATE_KEY;
        this.maxSavedGames = constants.STORAGE.MAX_SAVED_GAMES;
    }

    /**
     * Save game state to local storage
     * @param {Object} gameState - The game state to save
     * @returns {Promise<boolean>} True if saved successfully
     */
    async saveGame(gameState) {
        try {
            const savedGames = this.getSavedGames();
            
            // Add new game
            savedGames.unshift({
                ...gameState,
                id: Date.now().toString(),
                name: `Game ${new Date().toLocaleString()}`
            });
            
            // Limit number of saved games
            if (savedGames.length > this.maxSavedGames) {
                savedGames.splice(this.maxSavedGames);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(savedGames));
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load the most recent game state
     * @returns {Object|null} The game state or null if not found
     */
    async loadGame() {
        try {
            const savedGames = this.getSavedGames();
            return savedGames.length > 0 ? savedGames[0] : null;
            
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }

    /**
     * Get all saved games
     * @returns {Array} Array of saved games
     */
    getSavedGames() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
            
        } catch (error) {
            console.error('❌ Failed to get saved games:', error);
            return [];
        }
    }

    /**
     * Check if any saved games exist
     * @returns {Promise<boolean>} True if saved games exist
     */
    async hasSavedGame() {
        try {
            const savedGames = this.getSavedGames();
            return savedGames.length > 0;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear all saved games
     * @returns {Promise<boolean>} True if cleared successfully
     */
    async clearSavedGame() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to clear saved game:', error);
            return false;
        }
    }

    /**
     * Delete a specific saved game
     * @param {string} gameId - ID of the game to delete
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteGame(gameId) {
        try {
            const savedGames = this.getSavedGames();
            const filteredGames = savedGames.filter(game => game.id !== gameId);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredGames));
            return true;
            
        } catch (error) {
            console.error('❌ Failed to delete game:', error);
            return false;
        }
    }

    /**
     * Save game settings
     * @param {Object} settings - Game settings
     * @returns {Promise<boolean>} True if saved successfully
     */
    async saveSettings(settings) {
        try {
            localStorage.setItem(constants.STORAGE.SETTINGS_KEY, JSON.stringify(settings));
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
            return false;
        }
    }

    /**
     * Load game settings
     * @returns {Object} Game settings
     */
    async loadSettings() {
        try {
            const data = localStorage.getItem(constants.STORAGE.SETTINGS_KEY);
            return data ? JSON.parse(data) : {};
            
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
            return {};
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        try {
            const savedGames = this.getSavedGames();
            const settings = localStorage.getItem(constants.STORAGE.SETTINGS_KEY);
            
            let totalSize = 0;
            
            // Calculate approximate size
            const gameData = localStorage.getItem(this.storageKey);
            if (gameData) totalSize += gameData.length;
            if (settings) totalSize += settings.length;
            
            return {
                savedGames: savedGames.length,
                totalSize: totalSize,
                maxGames: this.maxSavedGames,
                available: true
            };
            
        } catch (error) {
            return {
                savedGames: 0,
                totalSize: 0,
                maxGames: this.maxSavedGames,
                available: false,
                error: error.message
            };
        }
    }

    /**
     * Export all data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        try {
            const data = {
                games: this.getSavedGames(),
                settings: localStorage.getItem(constants.STORAGE.SETTINGS_KEY)
                    ? JSON.parse(localStorage.getItem(constants.STORAGE.SETTINGS_KEY))
                    : {}
            };
            
            return JSON.stringify(data, null, 2);
            
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            return null;
        }
    }

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON string to import
     * @returns {boolean} True if imported successfully
     */
    async importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.games) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.games));
            }
            
            if (data.settings) {
                localStorage.setItem(constants.STORAGE.SETTINGS_KEY, JSON.stringify(data.settings));
            }
            
            console.log('✅ Data imported successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            return false;
        }
    }

    /**
     * Clear all storage data
     * @returns {Promise<boolean>} True if cleared successfully
     */
    async clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(constants.STORAGE.SETTINGS_KEY);
            console.log('🗑️ All storage data cleared');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to clear all data:', error);
            return false;
        }
    }
}