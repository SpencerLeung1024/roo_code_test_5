/**
 * Game End Manager
 * Handles game ending logic and winner determination
 */

import { WinConditionChecker } from './WinConditionChecker.js';
import { debugLog } from '../config/constants.js';

/**
 * Game End Manager
 * Coordinates game ending functionality and winner determination
 */
export class GameEndManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.winConditionChecker = null;
        this.isGameEnding = false;
    }

    /**
     * Initialize the game end manager
     */
    async init() {
        console.log('🏁 Initializing Game End Manager...');
        
        // Initialize win condition checker
        this.winConditionChecker = new WinConditionChecker(this.gameEngine);
        this.winConditionChecker.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Game End Manager initialized');
    }

    /**
     * Setup event listeners for game ending
     */
    setupEventListeners() {
        // Listen for win condition met
        document.addEventListener('win:condition:met', (event) => {
            this.handleWinConditionMet(event.detail);
        });
    }

    /**
     * Handle win condition being met
     * @param {Object} winData - Win condition data
     */
    handleWinConditionMet(winData) {
        if (this.isGameEnding) return;
        
        debugLog('info', 'Win condition met:', winData);
        this.endGame(winData);
    }

    /**
     * End the game and determine winner
     * @param {Object} winResult - Win condition result
     */
    async endGame(winResult) {
        if (this.isGameEnding) return;
        
        this.isGameEnding = true;
        
        try {
            debugLog('info', 'Ending game...', winResult);
            
            // Stop game activity
            this.gameEngine.gameState.isGameActive = false;
            
            // Stop win condition monitoring
            this.winConditionChecker.stopMonitoring();
            
            // Calculate final rankings
            const rankings = this.calculateFinalRankings();
            
            // Prepare game end data
            const gameEndData = {
                winner: winResult.winner,
                reason: winResult.reason,
                rankings: rankings,
                statistics: this.getGameStatistics(),
                duration: Date.now() - this.gameEngine.gameState.startTime
            };
            
            // Save final game state
            await this.saveFinalGameState(gameEndData);
            
            // Emit game end event
            this.gameEngine.emit('game:ended', gameEndData);
            
            debugLog('info', 'Game ended successfully', gameEndData);
            
        } catch (error) {
            console.error('Error ending game:', error);
        } finally {
            this.isGameEnding = false;
        }
    }

    /**
     * Calculate final player rankings
     * @returns {Array} Final rankings
     */
    calculateFinalRankings() {
        const players = this.gameEngine.playerManager.players;
        
        return players
            .map(player => ({
                player: player,
                name: player.name,
                netWorth: player.getNetWorth(),
                money: player.money,
                properties: player.properties.length,
                monopolies: this.getPlayerMonopolies(player).length,
                isBankrupt: player.isBankrupt
            }))
            .sort((a, b) => {
                // Bankrupt players always rank lower
                if (a.isBankrupt && !b.isBankrupt) return 1;
                if (!a.isBankrupt && b.isBankrupt) return -1;
                
                // Sort by net worth (descending)
                return b.netWorth - a.netWorth;
            })
            .map((ranking, index) => ({
                ...ranking,
                rank: index + 1
            }));
    }

    /**
     * Get player's monopolies
     * @param {Player} player - Player to check
     * @returns {Array} Array of monopoly groups
     */
    getPlayerMonopolies(player) {
        const monopolies = [];
        const colorGroups = {};
        
        player.properties.forEach(property => {
            if (property.colorGroup) {
                if (!colorGroups[property.colorGroup]) {
                    colorGroups[property.colorGroup] = [];
                }
                colorGroups[property.colorGroup].push(property);
            }
        });
        
        // Check for complete monopolies
        Object.entries(colorGroups).forEach(([group, properties]) => {
            // Simple check - if player owns all properties in a color group
            const expectedCount = this.getExpectedPropertiesInGroup(group);
            if (properties.length === expectedCount) {
                monopolies.push(group);
            }
        });
        
        return monopolies;
    }

    /**
     * Get expected number of properties in a color group
     * @param {string} group - Color group name
     * @returns {number} Expected count
     */
    getExpectedPropertiesInGroup(group) {
        // Basic mapping - can be enhanced with actual property data
        const groupSizes = {
            'brown': 2,
            'light-blue': 3,
            'pink': 3,
            'orange': 3,
            'red': 3,
            'yellow': 3,
            'green': 3,
            'dark-blue': 2,
            'railroad': 4,
            'utility': 2
        };
        
        return groupSizes[group.toLowerCase()] || 0;
    }

    /**
     * Get comprehensive game statistics
     * @returns {Object} Game statistics
     */
    getGameStatistics() {
        const players = this.gameEngine.playerManager.players;
        const activePlayers = this.gameEngine.playerManager.getActivePlayers();
        
        return {
            totalPlayers: players.length,
            activePlayers: activePlayers.length,
            bankruptPlayers: players.filter(p => p.isBankrupt).length,
            gameDuration: Date.now() - this.gameEngine.gameState.startTime,
            totalRounds: this.gameEngine.getCurrentRound(),
            totalNetWorth: players.reduce((sum, p) => sum + p.getNetWorth(), 0),
            averageNetWorth: players.reduce((sum, p) => sum + p.getNetWorth(), 0) / players.length,
            highestNetWorth: Math.max(...players.map(p => p.getNetWorth())),
            lowestNetWorth: Math.min(...players.map(p => p.getNetWorth())),
            totalProperties: players.reduce((sum, p) => sum + p.properties.length, 0),
            totalMonopolies: players.reduce((sum, p) => sum + this.getPlayerMonopolies(p).length, 0)
        };
    }

    /**
     * Save final game state
     * @param {Object} gameEndData - Game end data
     */
    async saveFinalGameState(gameEndData) {
        try {
            // Create final game record
            const gameRecord = {
                timestamp: new Date().toISOString(),
                duration: gameEndData.duration,
                winner: gameEndData.winner ? {
                    name: gameEndData.winner.name,
                    netWorth: gameEndData.winner.getNetWorth()
                } : null,
                rankings: gameEndData.rankings,
                statistics: gameEndData.statistics,
                reason: gameEndData.reason
            };
            
            // Save to local storage
            const savedGames = JSON.parse(localStorage.getItem('monopoly_game_history') || '[]');
            savedGames.unshift(gameRecord);
            
            // Keep only last 10 games
            if (savedGames.length > 10) {
                savedGames.splice(10);
            }
            
            localStorage.setItem('monopoly_game_history', JSON.stringify(savedGames));
            
            debugLog('info', 'Final game state saved', gameRecord);
        } catch (error) {
            console.error('Failed to save final game state:', error);
        }
    }

    /**
     * Get game history
     * @returns {Array} Game history
     */
    getGameHistory() {
        try {
            return JSON.parse(localStorage.getItem('monopoly_game_history') || '[]');
        } catch (error) {
            console.error('Failed to load game history:', error);
            return [];
        }
    }

    /**
     * Reset game end manager
     */
    reset() {
        this.isGameEnding = false;
        if (this.winConditionChecker) {
            this.winConditionChecker.reset();
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.winConditionChecker) {
            this.winConditionChecker.destroy();
        }
    }
}