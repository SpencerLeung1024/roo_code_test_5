/**
 * Game Flow Controller
 * Manages game phases and state transitions
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { debugLog } from '../config/constants.js';

/**
 * Game phases enumeration
 */
export const GamePhase = {
    SETUP: 'setup',
    ACTIVE: 'active',
    PAUSED: 'paused',
    ENDED: 'ended'
};

/**
 * Manages game flow and state transitions
 */
export class GameFlowController extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.currentPhase = GamePhase.SETUP;
        this.phaseHistory = [];
        this.phaseStartTime = null;
        this.pauseReason = null;
    }

    /**
     * Initialize the game flow controller
     */
    async init() {
        console.log('🎮 Initializing Game Flow Controller...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Game Flow Controller initialized');
    }

    /**
     * Setup event listeners for game flow
     */
    setupEventListeners() {
        // Listen for game events
        this.gameEngine.on('game:start', () => {
            this.transitionTo(GamePhase.ACTIVE);
        });

        this.gameEngine.on('game:end', () => {
            this.transitionTo(GamePhase.ENDED);
        });

        // Listen for UI events
        document.addEventListener('game:pause', (event) => {
            this.pauseGame(event.detail?.reason || 'User requested pause');
        });

        document.addEventListener('game:resume', () => {
            this.resumeGame();
        });

        document.addEventListener('game:restart', () => {
            this.restartGame();
        });

        // Listen for player events
        document.addEventListener('player:bankrupt', () => {
            this.checkGameEndConditions();
        });
    }

    /**
     * Transition to a new game phase
     * @param {string} newPhase - The new phase to transition to
     * @param {Object} data - Additional data for the transition
     */
    transitionTo(newPhase, data = {}) {
        const previousPhase = this.currentPhase;
        const transitionTime = Date.now();

        // Validate transition
        if (!this.isValidTransition(previousPhase, newPhase)) {
            debugLog('warn', `Invalid phase transition: ${previousPhase} -> ${newPhase}`);
            return false;
        }

        // Record phase history
        this.phaseHistory.push({
            from: previousPhase,
            to: newPhase,
            timestamp: transitionTime,
            data: data
        });

        // Update current phase
        this.currentPhase = newPhase;
        this.phaseStartTime = transitionTime;

        // Handle phase-specific setup
        this.handlePhaseTransition(newPhase, previousPhase, data);

        // Emit phase change event
        this.emit('phase:changed', {
            previous: previousPhase,
            current: newPhase,
            data: data,
            timestamp: transitionTime
        });

        debugLog('info', `Phase transition: ${previousPhase} -> ${newPhase}`);
        
        return true;
    }

    /**
     * Check if a phase transition is valid
     * @param {string} fromPhase - Current phase
     * @param {string} toPhase - Target phase
     * @returns {boolean} True if transition is valid
     */
    isValidTransition(fromPhase, toPhase) {
        const validTransitions = {
            [GamePhase.SETUP]: [GamePhase.ACTIVE, GamePhase.ENDED],
            [GamePhase.ACTIVE]: [GamePhase.PAUSED, GamePhase.ENDED],
            [GamePhase.PAUSED]: [GamePhase.ACTIVE, GamePhase.ENDED],
            [GamePhase.ENDED]: [GamePhase.SETUP]
        };

        return validTransitions[fromPhase]?.includes(toPhase) || false;
    }

    /**
     * Handle phase-specific transition logic
     * @param {string} newPhase - New phase
     * @param {string} previousPhase - Previous phase
     * @param {Object} data - Transition data
     */
    handlePhaseTransition(newPhase, previousPhase, data) {
        switch (newPhase) {
            case GamePhase.SETUP:
                this.handleSetupPhase();
                break;
            case GamePhase.ACTIVE:
                this.handleActivePhase(previousPhase, data);
                break;
            case GamePhase.PAUSED:
                this.handlePausedPhase(data);
                break;
            case GamePhase.ENDED:
                this.handleEndedPhase(data);
                break;
        }
    }

    /**
     * Handle setup phase
     */
    handleSetupPhase() {
        // Reset game state
        this.phaseHistory = [];
        this.pauseReason = null;
        
        // Emit setup event
        this.emit('phase:setup');
    }

    /**
     * Handle active phase
     * @param {string} previousPhase - Previous phase
     * @param {Object} data - Transition data
     */
    handleActivePhase(previousPhase, data) {
        if (previousPhase === GamePhase.SETUP) {
            // Starting new game
            this.emit('phase:active:start');
        } else if (previousPhase === GamePhase.PAUSED) {
            // Resuming from pause
            this.emit('phase:active:resume');
        }
    }

    /**
     * Handle paused phase
     * @param {Object} data - Pause data
     */
    handlePausedPhase(data) {
        this.pauseReason = data.reason || 'Game paused';
        this.emit('phase:paused', { reason: this.pauseReason });
    }

    /**
     * Handle ended phase
     * @param {Object} data - End game data
     */
    handleEndedPhase(data) {
        this.emit('phase:ended', {
            winner: data.winner,
            rankings: data.rankings
        });
    }

    /**
     * Start the game (transition from setup to active)
     * @param {Object} gameConfig - Game configuration
     */
    async startGame(gameConfig) {
        if (this.currentPhase !== GamePhase.SETUP) {
            debugLog('warn', 'Cannot start game from non-setup phase');
            return false;
        }

        this.emit('game:starting', { config: gameConfig });
        
        try {
            await this.gameEngine.startNewGame(gameConfig);
            return true;
        } catch (error) {
            debugLog('error', 'Failed to start game:', error);
            this.emit('game:start:failed', { error });
            return false;
        }
    }

    /**
     * Pause the game
     * @param {string} reason - Reason for pause
     */
    pauseGame(reason) {
        if (this.currentPhase !== GamePhase.ACTIVE) {
            debugLog('warn', 'Cannot pause game from non-active phase');
            return false;
        }

        this.transitionTo(GamePhase.PAUSED, { reason });
        return true;
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.currentPhase !== GamePhase.PAUSED) {
            debugLog('warn', 'Cannot resume game from non-paused phase');
            return false;
        }

        this.transitionTo(GamePhase.ACTIVE);
        return true;
    }

    /**
     * End the game
     * @param {Object} data - End game data
     */
    endGame(data = {}) {
        if (this.currentPhase === GamePhase.ENDED) {
            debugLog('warn', 'Game already ended');
            return false;
        }

        this.transitionTo(GamePhase.ENDED, data);
        return true;
    }

    /**
     * Restart the game
     */
    async restartGame() {
        this.emit('game:restarting');
        
        // Reset to setup phase
        this.transitionTo(GamePhase.SETUP);
        
        // Allow UI to reset
        setTimeout(() => {
            this.emit('game:restart:ready');
        }, 100);
    }

    /**
     * Check if game should end
     */
    checkGameEndConditions() {
        const activePlayers = this.gameEngine.playerManager.getActivePlayers();
        
        if (activePlayers.length <= 1) {
            const winner = this.gameEngine.playerManager.getWinner();
            this.endGame({
                winner: winner,
                rankings: this.gameEngine.playerManager.getPlayerRankings()
            });
        }
    }

    /**
     * Get current game phase
     * @returns {string} Current phase
     */
    getCurrentPhase() {
        return this.currentPhase;
    }

    /**
     * Check if game is in a specific phase
     * @param {string} phase - Phase to check
     * @returns {boolean} True if in the specified phase
     */
    isInPhase(phase) {
        return this.currentPhase === phase;
    }

    /**
     * Get phase history
     * @param {number} limit - Maximum number of transitions to return
     * @returns {Array} Phase history
     */
    getPhaseHistory(limit = 10) {
        return this.phaseHistory.slice(-limit);
    }

    /**
     * Get time spent in current phase
     * @returns {number} Time in milliseconds
     */
    getTimeInCurrentPhase() {
        return this.phaseStartTime ? Date.now() - this.phaseStartTime : 0;
    }

    /**
     * Get game flow statistics
     * @returns {Object} Flow statistics
     */
    getFlowStats() {
        const phaseCounts = this.phaseHistory.reduce((counts, transition) => {
            counts[transition.to] = (counts[transition.to] || 0) + 1;
            return counts;
        }, {});

        return {
            currentPhase: this.currentPhase,
            timeInCurrentPhase: this.getTimeInCurrentPhase(),
            totalTransitions: this.phaseHistory.length,
            phaseCounts,
            pauseReason: this.pauseReason
        };
    }

    /**
     * Get game state summary
     * @returns {Object} Game state summary
     */
    getGameStateSummary() {
        return {
            phase: this.currentPhase,
            isActive: this.currentPhase === GamePhase.ACTIVE,
            isPaused: this.currentPhase === GamePhase.PAUSED,
            isEnded: this.currentPhase === GamePhase.ENDED,
            timeInPhase: this.getTimeInCurrentPhase(),
            pauseReason: this.pauseReason
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.removeAllListeners();
    }
}