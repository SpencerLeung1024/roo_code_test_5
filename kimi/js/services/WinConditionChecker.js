/**
 * Win Condition Checker
 * Comprehensive system for detecting and managing game win conditions
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Win condition types
 */
export const WinConditionType = {
    LAST_PLAYER_STANDING: 'last_player_standing',
    BANKRUPTCY: 'bankruptcy',
    NET_WORTH_TARGET: 'net_worth_target',
    TIME_LIMIT: 'time_limit',
    TURN_LIMIT: 'turn_limit',
    MONOPOLY_COMPLETION: 'monopoly_completion',
    PROPERTY_DOMINATION: 'property_domination'
};

/**
 * Win condition configuration
 */
export const WinConditionConfig = {
    [WinConditionType.LAST_PLAYER_STANDING]: {
        enabled: true,
        priority: 1,
        description: 'Last player remaining wins'
    },
    [WinConditionType.BANKRUPTCY]: {
        enabled: true,
        priority: 2,
        description: 'Player runs out of money'
    },
    [WinConditionType.NET_WORTH_TARGET]: {
        enabled: false,
        targetAmount: 5000,
        priority: 3,
        description: 'First player to reach target net worth'
    },
    [WinConditionType.TIME_LIMIT]: {
        enabled: false,
        duration: 60 * 60 * 1000, // 1 hour in milliseconds
        priority: 4,
        description: 'Highest net worth after time limit'
    },
    [WinConditionType.TURN_LIMIT]: {
        enabled: false,
        maxTurns: 50,
        priority: 5,
        description: 'Highest net worth after turn limit'
    },
    [WinConditionType.MONOPOLY_COMPLETION]: {
        enabled: false,
        requiredMonopolies: 3,
        priority: 6,
        description: 'First to complete required monopolies'
    },
    [WinConditionType.PROPERTY_DOMINATION]: {
        enabled: false,
        requiredProperties: 20,
        priority: 7,
        description: 'First to own required properties'
    }
};

/**
 * Win condition checker service
 */
export class WinConditionChecker {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.config = { ...WinConditionConfig };
        this.startTime = null;
        this.gameStartTime = null;
        this.monitoringEnabled = true;
        this.checkInterval = null;
    }

    /**
     * Initialize win condition checker
     */
    init() {
        this.startTime = Date.now();
        this.gameStartTime = this.startTime;
        this.setupMonitoring();
        debugLog('info', 'Win condition checker initialized');
    }

    /**
     * Setup real-time monitoring
     */
    setupMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Check win conditions every 5 seconds
        this.checkInterval = setInterval(() => {
            if (this.monitoringEnabled && this.gameEngine.isGameActive()) {
                this.checkAllWinConditions();
            }
        }, 5000);
    }

    /**
     * Check all win conditions
     * @returns {Object} Win condition results
     */
    checkAllWinConditions() {
        const results = {
            gameOver: false,
            winner: null,
            reason: null,
            rankings: [],
            statistics: {}
        };

        // Check each win condition in priority order
        const activeConditions = Object.entries(this.config)
            .filter(([type, config]) => config.enabled)
            .sort((a, b) => a[1].priority - b[1].priority);

        for (const [conditionType, config] of activeConditions) {
            const result = this.checkWinCondition(conditionType, config);
            if (result.gameOver) {
                return {
                    ...results,
                    ...result,
                    rankings: this.calculateFinalRankings()
                };
            }
        }

        // Update statistics even if game isn't over
        results.statistics = this.getGameStatistics();
        results.rankings = this.calculateCurrentRankings();

        return results;
    }

    /**
     * Check specific win condition
     * @param {string} conditionType - Type of win condition
     * @param {Object} config - Win condition configuration
     * @returns {Object} Win condition result
     */
    checkWinCondition(conditionType, config) {
        switch (conditionType) {
            case WinConditionType.LAST_PLAYER_STANDING:
                return this.checkLastPlayerStanding();
            case WinConditionType.BANKRUPTCY:
                return this.checkBankruptcy();
            case WinConditionType.NET_WORTH_TARGET:
                return this.checkNetWorthTarget(config);
            case WinConditionType.TIME_LIMIT:
                return this.checkTimeLimit(config);
            case WinConditionType.TURN_LIMIT:
                return this.checkTurnLimit(config);
            case WinConditionType.MONOPOLY_COMPLETION:
                return this.checkMonopolyCompletion(config);
            case WinConditionType.PROPERTY_DOMINATION:
                return this.checkPropertyDomination(config);
            default:
                return { gameOver: false };
        }
    }

    /**
     * Check last player standing condition
     * @returns {Object} Win condition result
     */
    checkLastPlayerStanding() {
        const activePlayers = this.gameEngine.playerManager.getActivePlayers();
        
        if (activePlayers.length <= 1) {
            return {
                gameOver: true,
                winner: activePlayers[0] || null,
                reason: activePlayers.length === 1 
                    ? `${activePlayers[0].name} is the last player standing!`
                    : 'All players have been eliminated'
            };
        }

        return { gameOver: false };
    }

    /**
     * Check bankruptcy condition
     * @returns {Object} Win condition result
     */
    checkBankruptcy() {
        const bankruptPlayers = this.gameEngine.playerManager.players.filter(p => p.isBankrupt);
        const activePlayers = this.gameEngine.playerManager.getActivePlayers();

        if (bankruptPlayers.length > 0 && activePlayers.length === 1) {
            return {
                gameOver: true,
                winner: activePlayers[0],
                reason: `${activePlayers[0].name} wins as all other players have gone bankrupt!`
            };
        }

        return { gameOver: false };
    }

    /**
     * Check net worth target condition
     * @param {Object} config - Configuration with target amount
     * @returns {Object} Win condition result
     */
    checkNetWorthTarget(config) {
        const players = this.gameEngine.playerManager.players.filter(p => !p.isBankrupt);
        
        for (const player of players) {
            if (player.getNetWorth() >= config.targetAmount) {
                return {
                    gameOver: true,
                    winner: player,
                    reason: `${player.name} reached the target net worth of $${config.targetAmount}!`
                };
            }
        }

        return { gameOver: false };
    }

    /**
     * Check time limit condition
     * @param {Object} config - Configuration with duration
     * @returns {Object} Win condition result
     */
    checkTimeLimit(config) {
        const elapsedTime = Date.now() - this.gameStartTime;
        
        if (elapsedTime >= config.duration) {
            const rankings = this.calculateFinalRankings();
            const winner = rankings[0];
            
            return {
                gameOver: true,
                winner: winner,
                reason: `Time limit reached! ${winner.name} has the highest net worth of $${winner.netWorth}`
            };
        }

        return { gameOver: false };
    }

    /**
     * Check turn limit condition
     * @param {Object} config - Configuration with max turns
     * @returns {Object} Win condition result
     */
    checkTurnLimit(config) {
        const currentTurn = this.gameEngine.getCurrentRound();
        
        if (currentTurn >= config.maxTurns) {
            const rankings = this.calculateFinalRankings();
            const winner = rankings[0];
            
            return {
                gameOver: true,
                winner: winner,
                reason: `Turn limit reached! ${winner.name} has the highest net worth of $${winner.netWorth}`
            };
        }

        return { gameOver: false };
    }

    /**
     * Check monopoly completion condition
     * @param {Object} config - Configuration with required monopolies
     * @returns {Object} Win condition result
     */
    checkMonopolyCompletion(config) {
        const players = this.gameEngine.playerManager.players.filter(p => !p.isBankrupt);
        
        for (const player of players) {
            const monopolies = this.getPlayerMonopolies(player);
            if (monopolies.length >= config.requiredMonopolies) {
                return {
                    gameOver: true,
                    winner: player,
                    reason: `${player.name} completed ${monopolies.length} monopolies!`
                };
            }
        }

        return { gameOver: false };
    }

    /**
     * Check property domination condition
     * @param {Object} config - Configuration with required properties
     * @returns {Object} Win condition result
     */
    checkPropertyDomination(config) {
        const players = this.gameEngine.playerManager.players.filter(p => !p.isBankrupt);
        
        for (const player of players) {
            if (player.properties.length >= config.requiredProperties) {
                return {
                    gameOver: true,
                    winner: player,
                    reason: `${player.name} owns ${player.properties.length} properties!`
                };
            }
        }

        return { gameOver: false };
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
        const groupConfig = constants.PROPERTY_GROUPS[group.toUpperCase()];
        return groupConfig ? groupConfig.properties.length : 0;
    }

    /**
     * Calculate final rankings
     * @returns {Array} Final player rankings
     */
    calculateFinalRankings() {
        return this.gameEngine.playerManager.getPlayerRankings().map((player, index) => ({
            rank: index + 1,
            player: player,
            name: player.name,
            netWorth: player.getNetWorth(),
            money: player.money,
            properties: player.properties.length,
            monopolies: this.getPlayerMonopolies(player).length,
            isBankrupt: player.isBankrupt
        }));
    }

    /**
     * Calculate current rankings
     * @returns {Array} Current player rankings
     */
    calculateCurrentRankings() {
        return this.calculateFinalRankings();
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
            gameDuration: Date.now() - this.gameStartTime,
            currentRound: this.gameEngine.getCurrentRound(),
            totalNetWorth: players.reduce((sum, p) => sum + p.getNetWorth(), 0),
            averageNetWorth: players.reduce((sum, p) => sum + p.getNetWorth(), 0) / players.length,
            highestNetWorth: Math.max(...players.map(p => p.getNetWorth())),
            lowestNetWorth: Math.min(...players.map(p => p.getNetWorth())),
            totalProperties: players.reduce((sum, p) => sum + p.properties.length, 0),
            totalMonopolies: players.reduce((sum, p) => sum + this.getPlayerMonopolies(p).length, 0),
            rankings: this.calculateCurrentRankings()
        };
    }

    /**
     * Configure win conditions
     * @param {Object} newConfig - New configuration
     */
    configureWinConditions(newConfig) {
        this.config = { ...this.config, ...newConfig };
        debugLog('info', 'Win conditions updated:', this.config);
    }

    /**
     * Enable/disable specific win condition
     * @param {string} conditionType - Type of win condition
     * @param {boolean} enabled - Whether to enable
     */
    setWinConditionEnabled(conditionType, enabled) {
        if (this.config[conditionType]) {
            this.config[conditionType].enabled = enabled;
            debugLog('info', `${conditionType} win condition ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Update win condition configuration
     * @param {string} conditionType - Type of win condition
     * @param {Object} updates - Configuration updates
     */
    updateWinConditionConfig(conditionType, updates) {
        if (this.config[conditionType]) {
            this.config[conditionType] = { ...this.config[conditionType], ...updates };
            debugLog('info', `${conditionType} configuration updated:`, updates);
        }
    }

    /**
     * Get current win condition configuration
     * @returns {Object} Current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }

    /**
     * Start monitoring win conditions
     */
    startMonitoring() {
        this.monitoringEnabled = true;
        debugLog('info', 'Win condition monitoring started');
    }

    /**
     * Stop monitoring win conditions
     */
    stopMonitoring() {
        this.monitoringEnabled = false;
        debugLog('info', 'Win condition monitoring stopped');
    }

    /**
     * Reset win condition checker
     */
    reset() {
        this.startTime = Date.now();
        this.gameStartTime = this.startTime;
        this.monitoringEnabled = true;
        debugLog('info', 'Win condition checker reset');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.monitoringEnabled = false;
        debugLog('info', 'Win condition checker destroyed');
    }
}