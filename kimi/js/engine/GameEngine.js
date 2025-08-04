/**
 * Game Engine
 * Main game logic and state management
 */

import { Board } from '../models/Board.js';
import { PlayerManager } from '../services/PlayerManager.js';
import { DiceManager } from '../services/DiceManager.js';
import { CardManager } from '../services/CardManager.js';
import { JailManager } from '../services/JailManager.js';
import { GameEndManager } from '../services/GameEndManager.js';
import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Main game engine that coordinates all game systems
 */
export class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.board = new Board();
        this.playerManager = new PlayerManager();
        this.diceManager = null;
        this.cardManager = null;
        this.jailManager = null;
        this.gameEndManager = null;
        
        this.gameState = {
            isGameActive: false,
            currentPlayerIndex: 0,
            gameRound: 1,
            startTime: null,
            lastSave: null
        };
        
        this.isProcessingTurn = false;
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🎮 Initializing Game Engine...');
        
        // Initialize dice manager
        this.diceManager = new DiceManager(this);
        
        // Initialize card manager
        this.cardManager = new CardManager(this);
        await this.cardManager.init();
        
        // Initialize jail manager
        this.jailManager = new JailManager(this);
        this.jailManager.init();
        
        // Initialize game end manager
        this.gameEndManager = new GameEndManager(this);
        await this.gameEndManager.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Game Engine initialized');
    }

    /**
     * Setup event listeners for game coordination
     */
    setupEventListeners() {
        // Listen for turn start
        this.on('turn:start', (data) => {
            this.handleTurnStart(data.player);
        });

        // Listen for turn end
        this.on('turn:end', (data) => {
            this.handleTurnEnd(data.player);
        });

        // Listen for jail events
        document.addEventListener('jail:entered', (event) => {
            this.handleJailEntry(event.detail.player);
        });

        document.addEventListener('jail:exited', (event) => {
            this.handleJailExit(event.detail.player);
        });

        // Listen for player bankruptcy
        document.addEventListener('player:bankrupt', (event) => {
            this.handlePlayerBankruptcy(event.detail.player, event.detail.creditor);
        });
    }

    /**
     * Start a new game
     * @param {Object} gameConfig - Game configuration
     */
    async startNewGame(gameConfig) {
        console.log('🎲 Starting new game...');
        
        // Reset game state
        this.resetGameState();
        
        // Create players
        const players = this.playerManager.createPlayers(gameConfig.players);
        
        // Initialize game state
        this.gameState.isGameActive = true;
        this.gameState.startTime = Date.now();
        this.gameState.currentPlayerIndex = 0;
        this.gameState.gameRound = 1;
        
        // Emit game start event
        this.emit('game:start', {
            players: players,
            config: gameConfig
        });
        
        console.log(`✅ Game started with ${players.length} players`);
        
        // Start first turn
        this.startTurn();
    }

    /**
     * Reset game state
     */
    resetGameState() {
        this.gameState = {
            isGameActive: false,
            currentPlayerIndex: 0,
            gameRound: 1,
            startTime: null,
            lastSave: null
        };
        
        this.playerManager.resetAllPlayers();
        this.diceManager.reset();
        this.cardManager.resetDecks();
        this.jailManager.reset();
        if (this.gameEndManager) {
            this.gameEndManager.reset();
        }
    }

    /**
     * Start a player's turn
     */
    startTurn() {
        if (!this.gameState.isGameActive) return;
        
        const currentPlayer = this.playerManager.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.isBankrupt) {
            this.nextTurn();
            return;
        }
        
        debugLog('info', `Starting turn for ${currentPlayer.name}`);
        
        // Emit turn start event
        this.emit('turn:start', {
            player: currentPlayer,
            round: this.gameState.gameRound
        });
        
        // Handle jail turn if player is in jail
        if (currentPlayer.inJail) {
            this.handleJailTurn(currentPlayer);
        } else {
            // Normal turn - enable dice rolling
            this.diceManager.setCanRoll(true);
        }
    }

    /**
     * Handle jail turn for a player
     * @param {Player} player - The player in jail
     */
    handleJailTurn(player) {
        debugLog('info', `${player.name} is in jail, handling jail turn`);
        
        // Use jail manager to handle jail turn
        this.jailManager.handleJailTurn(player);
    }

    /**
     * End the current turn
     */
    endTurn() {
        if (!this.gameState.isGameActive || this.isProcessingTurn) return;
        
        this.isProcessingTurn = true;
        
        try {
            const currentPlayer = this.playerManager.getCurrentPlayer();
            debugLog('info', `Ending turn for ${currentPlayer.name}`);
            
            // Emit turn end event
            this.emit('turn:end', {
                player: currentPlayer,
                round: this.gameState.gameRound
            });
            
            // Check for game over
            if (this.checkGameOver()) {
                this.endGame();
                return;
            }
            
            // Move to next player
            this.nextTurn();
            
        } finally {
            this.isProcessingTurn = false;
        }
    }

    /**
     * Move to the next player's turn
     */
    nextTurn() {
        const nextPlayer = this.playerManager.nextPlayer();
        
        // Check if we've completed a round
        if (nextPlayer === this.playerManager.getActivePlayers()[0]) {
            this.gameState.gameRound++;
            debugLog('info', `Starting round ${this.gameState.gameRound}`);
        }
        
        this.gameState.currentPlayerIndex = this.playerManager.currentPlayerIndex;
        
        // Start next turn
        setTimeout(() => {
            this.startTurn();
        }, 1000);
    }

    /**
     * Handle player landing on a square
     * @param {number} position - Board position
     */
    async handlePlayerLanding(position) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;
        
        const square = this.board.getSquare(position);
        if (!square) return;
        
        debugLog('info', `${currentPlayer.name} landed on ${square.name}`);
        
        // Handle different square types
        switch (square.type) {
            case 'go-to-jail':
                await this.handleGoToJailLanding(currentPlayer);
                break;
            case 'property':
            case 'railroad':
            case 'utility':
                // These will be handled by their respective systems
                break;
            default:
                // Other squares handled by their systems
                break;
        }
    }

    /**
     * Handle Go to Jail landing
     * @param {Player} player - The player
     */
    async handleGoToJailLanding(player) {
        debugLog('info', `${player.name} landed on Go to Jail`);
        
        // Send player to jail
        player.goToJail();
        
        // Show notification
        this.showNotification('Go to Jail!', `${player.name} must go directly to jail!`);
        
        // End turn
        setTimeout(() => {
            this.endTurn();
        }, 2000);
    }

    /**
     * Handle jail entry
     * @param {Player} player - The player entering jail
     */
    handleJailEntry(player) {
        debugLog('info', `${player.name} entered jail`);
        
        // Update UI
        this.updatePlayerDisplay(player);
        
        // Show jail notification
        this.showNotification('Jail', `${player.name} is now in jail!`);
    }

    /**
     * Handle jail exit
     * @param {Player} player - The player exiting jail
     */
    handleJailExit(player) {
        debugLog('info', `${player.name} exited jail`);
        
        // Update UI
        this.updatePlayerDisplay(player);
        
        // Show jail exit notification
        this.showNotification('Free!', `${player.name} is out of jail!`);
    }

    /**
     * Handle player bankruptcy
     * @param {Player} player - The bankrupt player
     * @param {Player} creditor - The creditor (optional)
     */
    handlePlayerBankruptcy(player, creditor = null) {
        debugLog('info', `${player.name} declared bankruptcy`);
        
        // Update player display
        this.updatePlayerDisplay(player);
        
        // Check if game is over
        if (this.checkGameOver()) {
            this.endGame();
        }
    }

    /**
     * Check if the game is over
     * @returns {boolean} True if game is over
     */
    checkGameOver() {
        if (!this.gameEndManager) return false;
        
        const result = this.gameEndManager.winConditionChecker.checkAllWinConditions();
        return result.gameOver;
    }

    /**
     * End the game
     */
    async endGame() {
        if (!this.gameEndManager) return;
        
        debugLog('info', 'Game over!');
        
        const result = this.gameEndManager.winConditionChecker.checkAllWinConditions();
        if (result.gameOver) {
            await this.gameEndManager.endGame(result);
        }
    }

    /**
     * Show notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#2c3e50',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '1000',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Update player display
     * @param {Player} player - The player to update
     */
    updatePlayerDisplay(player) {
        // This would trigger UI updates
        this.emit('player:updated', { player });
    }

    /**
     * Get current player
     * @returns {Player} Current player
     */
    getCurrentPlayer() {
        return this.playerManager.getCurrentPlayer();
    }

    /**
     * Get game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            ...this.gameState,
            players: this.playerManager.savePlayerStates(),
            board: this.board,
            decks: {
                chance: this.cardManager.getDeck('chance')?.getStats(),
                communityChest: this.cardManager.getDeck('community-chest')?.getStats()
            }
        };
    }

    /**
     * Load game state
     * @param {Object} savedState - Saved game state
     */
    loadGameState(savedState) {
        if (!savedState) return;
        
        // Load player states
        const propertyMap = {};
        this.board.getSquares().forEach(square => {
            if (square.data && square.data.id) {
                propertyMap[square.data.id] = square.data;
            }
        });
        
        this.playerManager.loadPlayerStates(savedState.players, propertyMap);
        
        // Update game state
        this.gameState = {
            ...this.gameState,
            ...savedState,
            players: undefined // Remove loaded players from state
        };
        
        debugLog('info', 'Game state loaded');
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        const stats = this.playerManager.getGameStats();
        return {
            ...stats,
            gameRound: this.gameState.gameRound,
            gameDuration: this.gameState.startTime ? Date.now() - this.gameState.startTime : 0,
            isGameActive: this.gameState.isGameActive
        };
    }

    /**
     * Check if game is active
     * @returns {boolean} True if game is active
     */
    isGameActive() {
        return this.gameState.isGameActive;
    }

    /**
     * Get current game round
     * @returns {number} Current round
     */
    getCurrentRound() {
        return this.gameState.gameRound;
    }
}