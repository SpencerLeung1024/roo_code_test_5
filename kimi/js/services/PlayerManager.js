/**
 * Player Manager
 * Handles player state management, creation, and interactions
 */

import { Player } from '../models/Player.js';
import { constants } from '../config/constants.js';

/**
 * Manages all player-related operations
 */
export class PlayerManager {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.eliminatedPlayers = [];
    }

    /**
     * Initialize player manager
     */
    async init() {
        console.log('Player Manager initialized');
    }

    /**
     * Create new players for a game
     * @param {Array} playerConfigs - Array of player configurations
     * @returns {Array} Array of created players
     */
    createPlayers(playerConfigs) {
        this.players = [];
        this.eliminatedPlayers = [];
        this.currentPlayerIndex = 0;

        playerConfigs.forEach((config, index) => {
            const player = new Player({
                id: `player-${index + 1}`,
                name: config.name,
                token: config.token,
                money: config.money || constants.GAME.STARTING_MONEY
            });
            this.players.push(player);
        });

        console.log(`Created ${this.players.length} players`);
        return this.players;
    }

    /**
     * Get current player
     * @returns {Player} Current player
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Get next player
     * @returns {Player} Next player
     */
    getNextPlayer() {
        let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        let attempts = 0;
        
        // Skip bankrupt players
        while (this.players[nextIndex].isBankrupt && attempts < this.players.length) {
            nextIndex = (nextIndex + 1) % this.players.length;
            attempts++;
        }
        
        return this.players[nextIndex];
    }

    /**
     * Advance to next player
     * @returns {Player} New current player
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        let attempts = 0;
        
        // Skip bankrupt players
        while (this.players[this.currentPlayerIndex].isBankrupt && attempts < this.players.length) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            attempts++;
        }
        
        // Check if game is over
        if (this.getActivePlayers().length <= 1) {
            this.endGame();
        }
        
        return this.getCurrentPlayer();
    }

    /**
     * Get all active (non-bankrupt) players
     * @returns {Array} Active players
     */
    getActivePlayers() {
        return this.players.filter(player => !player.isBankrupt);
    }

    /**
     * Get player by ID
     * @param {string} playerId - Player ID
     * @returns {Player|null} Player or null if not found
     */
    getPlayerById(playerId) {
        return this.players.find(player => player.id === playerId) || null;
    }

    /**
     * Get player by name
     * @param {string} name - Player name
     * @returns {Player|null} Player or null if not found
     */
    getPlayerByName(name) {
        return this.players.find(player => player.name === name) || null;
    }

    /**
     * Get player rankings
     * @returns {Array} Players sorted by net worth
     */
    getPlayerRankings() {
        return [...this.players]
            .sort((a, b) => {
                if (a.isBankrupt && !b.isBankrupt) return 1;
                if (!a.isBankrupt && b.isBankrupt) return -1;
                return b.getNetWorth() - a.getNetWorth();
            });
    }

    /**
     * Check if game is over
     * @returns {boolean} True if game is over
     */
    isGameOver() {
        return this.getActivePlayers().length <= 1;
    }

    /**
     * Get game winner
     * @returns {Player|null} Winner or null if game not over
     */
    getWinner() {
        if (this.isGameOver()) {
            const activePlayers = this.getActivePlayers();
            return activePlayers.length === 1 ? activePlayers[0] : null;
        }
        return null;
    }

    /**
     * Eliminate player (declare bankruptcy)
     * @param {string} playerId - Player ID to eliminate
     * @param {Player|null} creditor - Player who caused bankruptcy
     */
    eliminatePlayer(playerId, creditor = null) {
        const player = this.getPlayerById(playerId);
        if (!player || player.isBankrupt) return;

        player.declareBankrupt(creditor);
        this.eliminatedPlayers.push(player);
        
        console.log(`${player.name} has been eliminated from the game`);
    }

    /**
     * Save player states
     * @returns {Object} Serialized player data
     */
    savePlayerStates() {
        return {
            players: this.players.map(player => player.serialize()),
            currentPlayerIndex: this.currentPlayerIndex,
            eliminatedPlayers: this.eliminatedPlayers.map(player => player.serialize())
        };
    }

    /**
     * Load player states
     * @param {Object} savedData - Saved player data
     * @param {Object} propertyMap - Map of property IDs to property objects
     */
    loadPlayerStates(savedData, propertyMap) {
        this.players = savedData.players.map(playerData => {
            const player = Player.deserialize(playerData);
            // Re-associate properties
            player.properties = playerData.properties.map(propertyId => propertyMap[propertyId]).filter(Boolean);
            player.properties.forEach(property => {
                property.owner = player;
            });
            return player;
        });

        this.currentPlayerIndex = savedData.currentPlayerIndex || 0;
        this.eliminatedPlayers = (savedData.eliminatedPlayers || []).map(playerData => {
            const player = Player.deserialize(playerData);
            player.properties = playerData.properties.map(propertyId => propertyMap[propertyId]).filter(Boolean);
            player.properties.forEach(property => {
                property.owner = player;
            });
            return player;
        });

        console.log(`Loaded ${this.players.length} players from saved state`);
    }

    /**
     * Reset all players
     */
    resetAllPlayers() {
        this.players = [];
        this.eliminatedPlayers = [];
        this.currentPlayerIndex = 0;
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        const activePlayers = this.getActivePlayers();
        const totalNetWorth = this.players.reduce((sum, player) => sum + player.getNetWorth(), 0);
        
        return {
            totalPlayers: this.players.length,
            activePlayers: activePlayers.length,
            eliminatedPlayers: this.eliminatedPlayers.length,
            currentPlayer: this.getCurrentPlayer()?.name,
            totalNetWorth,
            averageNetWorth: totalNetWorth / this.players.length,
            rankings: this.getPlayerRankings().map((player, index) => ({
                rank: index + 1,
                name: player.name,
                netWorth: player.getNetWorth(),
                isBankrupt: player.isBankrupt
            }))
        };
    }

    /**
     * Validate player setup
     * @param {Array} playerConfigs - Player configurations
     * @returns {Object} Validation result
     */
    validatePlayerSetup(playerConfigs) {
        const errors = [];
        
        if (!playerConfigs || playerConfigs.length < 2) {
            errors.push('At least 2 players are required');
        }
        
        if (playerConfigs.length > 6) {
            errors.push('Maximum 6 players allowed');
        }
        
        const names = playerConfigs.map(p => p.name.trim());
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
     * Handle player trade
     * @param {string} fromPlayerId - Player giving money
     * @param {string} toPlayerId - Player receiving money
     * @param {number} amount - Amount to transfer
     * @returns {boolean} True if successful
     */
    handlePlayerTrade(fromPlayerId, toPlayerId, amount) {
        const fromPlayer = this.getPlayerById(fromPlayerId);
        const toPlayer = this.getPlayerById(toPlayerId);
        
        if (!fromPlayer || !toPlayer) return false;
        if (fromPlayer.isBankrupt || toPlayer.isBankrupt) return false;
        
        return fromPlayer.transferMoney(toPlayer, amount, 'Player trade');
    }

    /**
     * Get player turn order
     * @returns {Array} Players in turn order
     */
    getTurnOrder() {
        const order = [];
        let currentIndex = this.currentPlayerIndex;
        
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[currentIndex];
            if (!player.isBankrupt) {
                order.push(player);
            }
            currentIndex = (currentIndex + 1) % this.players.length;
        }
        
        return order;
    }

    /**
     * Check if it's a player's turn
     * @param {string} playerId - Player ID
     * @returns {boolean} True if it's the player's turn
     */
    isPlayerTurn(playerId) {
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer && currentPlayer.id === playerId;
    }

    /**
     * Get player summary for display
     * @returns {Array} Player summaries
     */
    getPlayerSummaries() {
        return this.players.map(player => ({
            ...player.getDisplayInfo(),
            rank: this.getPlayerRankings().findIndex(p => p.id === player.id) + 1
        }));
    }
}