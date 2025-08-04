/**
 * Turn Manager
 * Handles turn-based gameplay mechanics and turn progression
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { debugLog } from '../config/constants.js';

/**
 * Manages turn-based gameplay mechanics
 */
export class TurnManager extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.currentTurn = null;
        this.turnHistory = [];
        this.turnTimeout = null;
        this.maxTurnTime = 5 * 60 * 1000; // 5 minutes per turn
        this.turnActions = new Map();
    }

    /**
     * Initialize the turn manager
     */
    async init() {
        console.log('🔄 Initializing Turn Manager...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Turn Manager initialized');
    }

    /**
     * Setup event listeners for turn management
     */
    setupEventListeners() {
        // Listen for game events
        this.gameEngine.on('game:start', (data) => {
            this.handleGameStart(data);
        });

        this.gameEngine.on('turn:start', (data) => {
            this.handleTurnStart(data);
        });

        this.gameEngine.on('turn:end', (data) => {
            this.handleTurnEnd(data);
        });

        // Listen for dice events
        document.addEventListener('dice:rolled', (event) => {
            this.handleDiceRolled(event.detail);
        });

        // Listen for player actions
        document.addEventListener('player:action', (event) => {
            this.handlePlayerAction(event.detail);
        });
    }

    /**
     * Handle game start
     * @param {Object} data - Game start data
     */
    handleGameStart(data) {
        this.turnHistory = [];
        this.currentTurn = null;
        
        debugLog('info', 'Game started, turn history cleared');
    }

    /**
     * Start a new turn for a player
     * @param {Player} player - The player whose turn it is
     */
    startTurn(player) {
        if (!player || player.isBankrupt) {
            this.gameEngine.nextTurn();
            return;
        }

        // Create new turn record
        this.currentTurn = {
            id: this.generateTurnId(),
            player: player,
            startTime: Date.now(),
            actions: [],
            diceRolled: false,
            hasMoved: false,
            isComplete: false,
            phase: 'start'
        };

        // Add to history
        this.turnHistory.push(this.currentTurn);

        // Start turn timeout
        this.startTurnTimeout();

        // Emit turn start
        this.emit('turn:started', {
            turn: this.currentTurn,
            player: player,
            history: this.turnHistory
        });

        debugLog('info', `Turn started for ${player.name} (Turn ${this.turnHistory.length})`);
    }

    /**
     * End the current turn
     */
    endTurn() {
        if (!this.currentTurn) return;

        this.currentTurn.endTime = Date.now();
        this.currentTurn.isComplete = true;
        this.currentTurn.phase = 'complete';

        // Clear timeout
        this.clearTurnTimeout();

        // Emit turn end
        this.emit('turn:ended', {
            turn: this.currentTurn,
            player: this.currentTurn.player,
            duration: this.currentTurn.endTime - this.currentTurn.startTime
        });

        debugLog('info', `Turn ended for ${this.currentTurn.player.name} (${this.currentTurn.endTime - this.currentTurn.startTime}ms)`);

        this.currentTurn = null;
    }

    /**
     * Handle turn start from game engine
     * @param {Object} data - Turn start data
     */
    handleTurnStart(data) {
        this.startTurn(data.player);
    }

    /**
     * Handle turn end from game engine
     * @param {Object} data - Turn end data
     */
    handleTurnEnd(data) {
        this.endTurn();
    }

    /**
     * Handle dice rolled event
     * @param {Object} data - Dice roll data
     */
    handleDiceRolled(data) {
        if (!this.currentTurn) return;

        this.currentTurn.diceRolled = true;
        this.currentTurn.diceResult = data;
        this.currentTurn.phase = 'movement';

        this.addAction('dice_rolled', {
            dice1: data.dice1,
            dice2: data.dice2,
            total: data.total,
            isDouble: data.isDouble
        });

        this.emit('turn:dice_rolled', {
            turn: this.currentTurn,
            dice: data
        });
    }

    /**
     * Handle player action
     * @param {Object} data - Action data
     */
    handlePlayerAction(data) {
        if (!this.currentTurn) return;

        this.addAction(data.type, data.details);
        
        this.emit('turn:action', {
            turn: this.currentTurn,
            action: data
        });
    }

    /**
     * Add an action to the current turn
     * @param {string} type - Action type
     * @param {Object} details - Action details
     */
    addAction(type, details) {
        if (!this.currentTurn) return;

        const action = {
            type,
            details,
            timestamp: Date.now(),
            player: this.currentTurn.player.id
        };

        this.currentTurn.actions.push(action);
    }

    /**
     * Check if it's a player's turn
     * @param {string} playerId - Player ID
     * @returns {boolean} True if it's the player's turn
     */
    isPlayerTurn(playerId) {
        return this.currentTurn && this.currentTurn.player.id === playerId;
    }

    /**
     * Get current turn information
     * @returns {Object|null} Current turn info
     */
    getCurrentTurn() {
        return this.currentTurn;
    }

    /**
     * Get turn history
     * @param {number} limit - Maximum number of turns to return
     * @returns {Array} Turn history
     */
    getTurnHistory(limit = 10) {
        return this.turnHistory.slice(-limit);
    }

    /**
     * Get player's turn history
     * @param {string} playerId - Player ID
     * @returns {Array} Player's turn history
     */
    getPlayerTurnHistory(playerId) {
        return this.turnHistory.filter(turn => turn.player.id === playerId);
    }

    /**
     * Start turn timeout
     */
    startTurnTimeout() {
        this.clearTurnTimeout();
        
        this.turnTimeout = setTimeout(() => {
            this.handleTurnTimeout();
        }, this.maxTurnTime);
    }

    /**
     * Clear turn timeout
     */
    clearTurnTimeout() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout);
            this.turnTimeout = null;
        }
    }

    /**
     * Handle turn timeout
     */
    handleTurnTimeout() {
        if (!this.currentTurn) return;

        debugLog('warn', `Turn timeout for ${this.currentTurn.player.name}`);
        
        this.addAction('timeout', {
            reason: 'Turn exceeded maximum time'
        });

        this.emit('turn:timeout', {
            turn: this.currentTurn,
            player: this.currentTurn.player
        });

        // Force end turn
        this.gameEngine.endTurn();
    }

    /**
     * Skip player's turn (for bankrupt players)
     * @param {Player} player - Player to skip
     */
    skipTurn(player) {
        if (!player || player.isBankrupt) {
            this.addAction('turn_skipped', {
                reason: 'Player is bankrupt',
                player: player?.id
            });
            
            this.emit('turn:skipped', {
                player: player,
                reason: 'bankrupt'
            });
        }
    }

    /**
     * Generate unique turn ID
     * @returns {string} Turn ID
     */
    generateTurnId() {
        return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get turn statistics
     * @returns {Object} Turn statistics
     */
    getTurnStats() {
        const totalTurns = this.turnHistory.length;
        const completedTurns = this.turnHistory.filter(t => t.isComplete).length;
        const averageTurnDuration = totalTurns > 0 
            ? this.turnHistory.reduce((sum, turn) => {
                return sum + (turn.endTime ? turn.endTime - turn.startTime : 0);
            }, 0) / completedTurns 
            : 0;

        return {
            totalTurns,
            completedTurns,
            averageTurnDuration: Math.round(averageTurnDuration),
            currentTurn: this.currentTurn ? {
                player: this.currentTurn.player.name,
                duration: Date.now() - this.currentTurn.startTime,
                phase: this.currentTurn.phase
            } : null
        };
    }

    /**
     * Reset turn manager
     */
    reset() {
        this.currentTurn = null;
        this.turnHistory = [];
        this.clearTurnTimeout();
        this.turnActions.clear();
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.clearTurnTimeout();
        this.removeAllListeners();
    }
}