/**
 * Monopoly Game
 * Main game controller that coordinates all systems
 */

import { GameEngine } from './GameEngine.js';
import { TurnManager } from './TurnManager.js';
import { GameFlowController, GamePhase } from './GameFlowController.js';
import { TurnActions } from './TurnActions.js';
import { TurnUI } from '../ui/TurnUI.js';
import { StateManager } from './StateManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { debugLog } from '../config/constants.js';

/**
 * Main Monopoly game controller
 */
export class MonopolyGame extends EventEmitter {
    constructor() {
        super();
        
        // Core systems
        this.gameEngine = null;
        this.turnManager = null;
        this.gameFlow = null;
        this.turnActions = null;
        this.turnUI = null;
        this.stateManager = null;
        
        // Game state
        this.isInitialized = false;
        this.isGameActive = false;
        
        // Configuration
        this.config = {
            autoSave: true,
            turnTimeout: 5 * 60 * 1000, // 5 minutes
            maxPlayers: 6,
            minPlayers: 2
        };
    }

    /**
     * Initialize the complete game system
     */
    async init() {
        console.log('🎲 Initializing Monopoly Game...');
        
        try {
            // Initialize core systems
            await this.initializeSystems();
            
            // Setup event coordination
            this.setupEventCoordination();
            
            // Initialize UI
            await this.initializeUI();
            
            this.isInitialized = true;
            console.log('✅ Monopoly Game initialized successfully');
            
            // Emit ready event
            this.emit('game:ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Monopoly Game:', error);
            throw error;
        }
    }

    /**
     * Initialize all game systems
     */
    async initializeSystems() {
        // Initialize game engine
        this.gameEngine = new GameEngine();
        await this.gameEngine.init();

        // Initialize turn manager
        this.turnManager = new TurnManager(this.gameEngine);
        await this.turnManager.init();

        // Initialize game flow controller
        this.gameFlow = new GameFlowController(this.gameEngine);
        await this.gameFlow.init();

        // Initialize turn actions
        this.turnActions = new TurnActions(this.gameEngine);
        await this.turnActions.init();

        // Initialize state manager
        this.stateManager = new StateManager();
        await this.stateManager.init();

        // Wire up systems
        this.gameEngine.turnManager = this.turnManager;
        this.gameEngine.gameFlow = this.gameFlow;
        this.gameEngine.turnActions = this.turnActions;
        this.gameEngine.stateManager = this.stateManager;
    }

    /**
     * Setup event coordination between systems
     */
    setupEventCoordination() {
        // Game flow coordination
        this.gameFlow.on('phase:changed', (data) => {
            this.handlePhaseChange(data);
        });

        // Turn coordination
        this.turnManager.on('turn:started', (data) => {
            this.handleTurnStarted(data);
        });

        this.turnManager.on('turn:ended', (data) => {
            this.handleTurnEnded(data);
        });

        // Action coordination
        this.turnActions.on('action:added', (action) => {
            this.handleActionAdded(action);
        });

        // State management
        this.gameEngine.on('game:start', (data) => {
            if (this.config.autoSave) {
                this.stateManager.saveGame(this.gameEngine.getGameState());
            }
        });

        this.gameEngine.on('turn:end', () => {
            if (this.config.autoSave) {
                this.stateManager.saveGame(this.gameEngine.getGameState());
            }
        });

        // Error handling
        this.gameEngine.on('error', (error) => {
            this.handleGameError(error);
        });
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        // Initialize turn UI
        this.turnUI = new TurnUI(this.gameEngine);
        await this.turnUI.init();

        // Setup UI event listeners
        this.setupUIEvents();
    }

    /**
     * Setup UI event listeners
     */
    setupUIEvents() {
        // Game setup events
        document.addEventListener('ui:start_game', (event) => {
            this.startGame(event.detail.config);
        });

        // Game control events
        document.addEventListener('ui:pause_game', () => {
            this.pauseGame();
        });

        document.addEventListener('ui:resume_game', () => {
            this.resumeGame();
        });

        document.addEventListener('ui:restart_game', () => {
            this.restartGame();
        });

        // Save/load events
        document.addEventListener('ui:save_game', () => {
            this.saveGame();
        });

        document.addEventListener('ui:load_game', () => {
            this.loadGame();
        });

        // Settings events
        document.addEventListener('ui:update_settings', (event) => {
            this.updateSettings(event.detail.settings);
        });
    }

    /**
     * Start a new game
     * @param {Object} gameConfig - Game configuration
     */
    async startGame(gameConfig) {
        if (!this.isInitialized) {
            throw new Error('Game not initialized');
        }

        // Validate configuration
        const validation = this.validateGameConfig(gameConfig);
        if (!validation.isValid) {
            this.emit('game:start:failed', { errors: validation.errors });
            return false;
        }

        try {
            // Transition to active phase
            await this.gameFlow.startGame(gameConfig);
            
            this.isGameActive = true;
            this.emit('game:started', { config: gameConfig });
            
            return true;
            
        } catch (error) {
            console.error('Failed to start game:', error);
            this.emit('game:start:failed', { error });
            return false;
        }
    }

    /**
     * Validate game configuration
     * @param {Object} config - Game configuration
     * @returns {Object} Validation result
     */
    validateGameConfig(config) {
        const errors = [];

        if (!config || !config.players) {
            errors.push('Invalid game configuration');
            return { isValid: false, errors };
        }

        if (config.players.length < this.config.minPlayers) {
            errors.push(`At least ${this.config.minPlayers} players required`);
        }

        if (config.players.length > this.config.maxPlayers) {
            errors.push(`Maximum ${this.config.maxPlayers} players allowed`);
        }

        // Validate player names
        const names = config.players.map(p => p.name?.trim()).filter(n => n);
        if (names.length !== new Set(names).size) {
            errors.push('Player names must be unique');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (!this.isGameActive) return false;
        
        return this.gameFlow.pauseGame('User requested pause');
    }

    /**
     * Resume the game
     */
    resumeGame() {
        return this.gameFlow.resumeGame();
    }

    /**
     * Restart the game
     */
    async restartGame() {
        this.isGameActive = false;
        
        await this.gameFlow.restartGame();
        
        // Reset all systems
        this.turnManager.reset();
        this.turnActions.reset();
        
        this.emit('game:restarted');
    }

    /**
     * Save current game
     */
    async saveGame() {
        if (!this.isGameActive) return false;
        
        try {
            const gameState = this.gameEngine.getGameState();
            await this.stateManager.saveGame(gameState);
            this.emit('game:saved');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.emit('game:save:failed', { error });
            return false;
        }
    }

    /**
     * Load saved game
     */
    async loadGame() {
        try {
            const savedState = await this.stateManager.loadGame();
            if (!savedState) {
                this.emit('game:load:failed', { error: 'No saved game found' });
                return false;
            }

            // Load state into game engine
            this.gameEngine.loadGameState(savedState);
            
            // Update game flow
            this.gameFlow.transitionTo(GamePhase.ACTIVE);
            
            this.isGameActive = true;
            this.emit('game:loaded', { state: savedState });
            
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            this.emit('game:load:failed', { error });
            return false;
        }
    }

    /**
     * Update game settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.config = { ...this.config, ...settings };
        this.emit('settings:updated', { settings: this.config });
    }

    /**
     * Handle phase changes
     * @param {Object} data - Phase change data
     */
    handlePhaseChange(data) {
        debugLog('info', `Phase changed: ${data.previous} -> ${data.current}`);
        
        // Update UI based on phase
        switch (data.current) {
            case GamePhase.SETUP:
                this.handleSetupPhase();
                break;
            case GamePhase.ACTIVE:
                this.handleActivePhase();
                break;
            case GamePhase.PAUSED:
                this.handlePausedPhase();
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
        this.turnUI.hideTurnPanel();
        this.emit('ui:show_setup');
    }

    /**
     * Handle active phase
     */
    handleActivePhase() {
        this.turnUI.showTurnPanel();
        this.emit('ui:show_game');
    }

    /**
     * Handle paused phase
     */
    handlePausedPhase() {
        this.emit('ui:show_pause');
    }

    /**
     * Handle ended phase
     */
    handleEndedPhase(data) {
        this.emit('ui:show_game_over', {
            winner: data.winner,
            rankings: data.rankings
        });
    }

    /**
     * Handle turn started
     * @param {Object} data - Turn start data
     */
    handleTurnStarted(data) {
        debugLog('info', `Turn started for ${data.player.name}`);
        
        // Update UI
        if (this.turnUI) {
            this.turnUI.updateCurrentPlayer(data.player);
        }
    }

    /**
     * Handle turn ended
     * @param {Object} data - Turn end data
     */
    handleTurnEnded(data) {
        debugLog('info', `Turn ended for ${data.player.name}`);
    }

    /**
     * Handle action added
     * @param {Object} action - Action data
     */
    handleActionAdded(action) {
        debugLog('debug', 'Action added:', action);
    }

    /**
     * Handle game errors
     * @param {Error} error - Game error
     */
    handleGameError(error) {
        console.error('Game error:', error);
        this.emit('game:error', { error });
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            isInitialized: this.isInitialized,
            isGameActive: this.isGameActive,
            phase: this.gameFlow?.getCurrentPhase(),
            config: this.config,
            gameState: this.gameEngine?.getGameState(),
            turnStats: this.turnManager?.getTurnStats(),
            flowStats: this.gameFlow?.getFlowStats()
        };
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        return {
            ...this.gameEngine?.getGameStats(),
            ...this.turnManager?.getTurnStats(),
            ...this.gameFlow?.getFlowStats()
        };
    }

    /**
     * Check if game is ready
     * @returns {boolean} True if game is ready
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Check if game is active
     * @returns {boolean} True if game is active
     */
    isActive() {
        return this.isGameActive;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.isGameActive = false;
        
        // Cleanup all systems
        this.turnManager?.destroy();
        this.gameFlow?.destroy();
        this.turnActions?.destroy();
        this.turnUI?.destroy();
        this.stateManager?.destroy();
        
        this.removeAllListeners();
    }
}

// Global game instance
window.monopolyGame = null;

/**
 * Initialize the global game instance
 */
export async function initMonopolyGame() {
    if (window.monopolyGame) {
        window.monopolyGame.destroy();
    }
    
    window.monopolyGame = new MonopolyGame();
    await window.monopolyGame.init();
    
    return window.monopolyGame;
}