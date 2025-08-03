/**
 * Game Engine
 * Core game logic and state management
 */

import { Board } from '../models/Board.js';
import { Player } from '../models/Player.js';
import { constants } from '../config/constants.js';
import { PropertyTransactionService } from '../services/PropertyTransactionService.js';
import { LandingEventService } from '../services/LandingEventService.js';

/**
 * Main game engine that coordinates all game logic
 */
export class GameEngine {
    constructor() {
        this.board = null;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameRound = 1;
        this.isGameActive = false;
        this.gameConfig = null;
        this.propertyService = null;
        this.landingService = null;
    }

    /**
     * Initialize the game engine
     */
    async init() {
        console.log('🎮 Initializing Game Engine...');
        this.board = new Board();
        this.propertyService = new PropertyTransactionService(this);
        this.landingService = new LandingEventService(this);
        console.log('✅ Game Engine initialized');
    }

    /**
     * Start a new game
     * @param {Object} config - Game configuration
     */
    async startNewGame(config) {
        console.log('🎲 Starting new game...', config);
        
        this.gameConfig = config;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameRound = 1;
        
        // Create players
        config.players.forEach((playerConfig, index) => {
            const player = new Player(
                playerConfig.name,
                playerConfig.token,
                constants.GAME.STARTING_MONEY
            );
            this.players.push(player);
        });
        
        this.isGameActive = true;
        
        // Dispatch game start event
        document.dispatchEvent(new CustomEvent('game:start', {
            detail: { players: this.players, config: this.gameConfig }
        }));
        
        console.log('✅ New game started with', this.players.length, 'players');
    }

    /**
     * Get the current board
     * @returns {Board} The game board
     */
    getBoard() {
        return this.board;
    }

    /**
     * Get all players
     * @returns {Player[]} Array of players
     */
    getPlayers() {
        return this.players;
    }

    /**
     * Get the current player
     * @returns {Player} Current player
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Get the current game round
     * @returns {number} Current round
     */
    getCurrentRound() {
        return this.gameRound;
    }

    /**
     * Check if game is active
     * @returns {boolean} True if game is active
     */
    isGameActive() {
        return this.isGameActive;
    }

    /**
     * Move to the next player
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        if (this.currentPlayerIndex === 0) {
            this.gameRound++;
        }
        
        document.dispatchEvent(new CustomEvent('turn:start', {
            detail: { player: this.getCurrentPlayer() }
        }));
    }

    /**
     * Roll dice for the current player
     * @returns {Object} Dice result
     */
    rollDice() {
        if (!this.isGameActive) return null;
        
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const isDouble = die1 === die2;
        
        const result = {
            die1,
            die2,
            total: die1 + die2,
            isDouble
        };
        
        document.dispatchEvent(new CustomEvent('dice:rolled', {
            detail: { result, player: this.getCurrentPlayer() }
        }));
        
        return result;
    }

    /**
     * Move player to a new position
     * @param {Player} player - The player to move
     * @param {number} steps - Number of steps to move
     */
    movePlayer(player, steps) {
        const oldPosition = player.position;
        const newPosition = this.board.getNextPosition(oldPosition, steps);
        
        player.position = newPosition;
        
        // Check if passed GO
        if (this.board.passedGo(oldPosition, newPosition)) {
            player.money += constants.GAME.SALARY;
            document.dispatchEvent(new CustomEvent('money:changed', {
                detail: { player, amount: constants.GAME.SALARY, reason: 'Passed GO' }
            }));
        }
        
        document.dispatchEvent(new CustomEvent('player:move', {
            detail: { player, from: oldPosition, to: newPosition }
        }));
        
        // Handle landing on square
        this.handleSquareLanding(player, newPosition);
    }

    /**
     * Handle player landing on a square
     * @param {Player} player - The player
     * @param {number} position - Position landed on
     */
    async handleSquareLanding(player, position) {
        await this.landingService.handleLandingEvent(player, position);
    }

    // Property handling methods are now handled by LandingEventService

    /**
     * Check if game should end
     */
    checkGameEnd() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        
        if (activePlayers.length <= 1) {
            this.endGame(activePlayers[0]);
        }
    }

    /**
     * End the game
     * @param {Player} winner - The winning player
     */
    endGame(winner) {
        this.isGameActive = false;
        
        document.dispatchEvent(new CustomEvent('game:end', {
            detail: { winner, players: this.players }
        }));
        
        console.log(`🎉 Game over! Winner: ${winner?.name || 'No winner'}`);
    }

    /**
     * Get game state for saving
     * @returns {Object} Game state
     */
    getGameState() {
        return {
            players: this.players.map(p => p.getState()),
            currentPlayerIndex: this.currentPlayerIndex,
            gameRound: this.gameRound,
            isGameActive: this.isGameActive,
            gameConfig: this.gameConfig
        };
    }

    /**
     * Load game state
     * @param {Object} state - Game state to load
     */
    loadGameState(state) {
        this.players = state.players.map(p => Player.fromState(p));
        this.currentPlayerIndex = state.currentPlayerIndex;
        this.gameRound = state.gameRound;
        this.isGameActive = state.isGameActive;
        this.gameConfig = state.gameConfig;
        
        console.log('✅ Game state loaded');
    }
}