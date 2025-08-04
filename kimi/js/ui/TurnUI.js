/**
 * Turn UI
 * Handles the turn-based user interface components
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { debugLog } from '../config/constants.js';

/**
 * Manages the turn-based user interface
 */
export class TurnUI extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.elements = {};
        this.currentPlayer = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the turn UI
     */
    async init() {
        console.log('🎮 Initializing Turn UI...');
        
        this.createUIElements();
        this.setupEventListeners();
        this.bindEvents();
        
        this.isInitialized = true;
        console.log('✅ Turn UI initialized');
    }

    /**
     * Create UI elements for turn management
     */
    createUIElements() {
        // Create turn panel container
        this.elements.turnPanel = this.createElement('div', 'turn-panel');
        
        // Current player display
        this.elements.currentPlayer = this.createElement('div', 'current-player');
        this.elements.playerName = this.createElement('h3', 'player-name');
        this.elements.playerMoney = this.createElement('div', 'player-money');
        this.elements.playerToken = this.createElement('div', 'player-token');
        
        this.elements.currentPlayer.appendChild(this.elements.playerToken);
        this.elements.currentPlayer.appendChild(this.elements.playerName);
        this.elements.currentPlayer.appendChild(this.elements.playerMoney);

        // Turn actions
        this.elements.actionsContainer = this.createElement('div', 'turn-actions');
        this.elements.rollDiceBtn = this.createElement('button', 'roll-dice-btn', 'Roll Dice');
        this.elements.endTurnBtn = this.createElement('button', 'end-turn-btn', 'End Turn');
        this.elements.managePropertiesBtn = this.createElement('button', 'manage-properties-btn', 'Properties');
        this.elements.tradeBtn = this.createElement('button', 'trade-btn', 'Trade');

        // Turn info
        this.elements.turnInfo = this.createElement('div', 'turn-info');
        this.elements.turnNumber = this.createElement('div', 'turn-number');
        this.elements.roundNumber = this.createElement('div', 'round-number');
        this.elements.turnTimer = this.createElement('div', 'turn-timer');

        this.elements.turnInfo.appendChild(this.elements.turnNumber);
        this.elements.turnInfo.appendChild(this.elements.roundNumber);
        this.elements.turnInfo.appendChild(this.elements.turnTimer);

        // Turn history
        this.elements.historyContainer = this.createElement('div', 'turn-history');
        this.elements.historyTitle = this.createElement('h4', 'history-title', 'Recent Actions');
        this.elements.historyList = this.createElement('ul', 'history-list');

        this.elements.historyContainer.appendChild(this.elements.historyTitle);
        this.elements.historyContainer.appendChild(this.elements.historyList);

        // Action buttons container
        this.elements.actionButtons = this.createElement('div', 'action-buttons');
        this.elements.actionButtons.appendChild(this.elements.rollDiceBtn);
        this.elements.actionButtons.appendChild(this.elements.endTurnBtn);
        this.elements.actionButtons.appendChild(this.elements.managePropertiesBtn);
        this.elements.actionButtons.appendChild(this.elements.tradeBtn);

        // Jail UI
        this.elements.jailContainer = this.createElement('div', 'jail-ui');
        this.elements.jailMessage = this.createElement('div', 'jail-message');
        this.elements.jailOptions = this.createElement('div', 'jail-options');
        
        this.elements.jailContainer.appendChild(this.elements.jailMessage);
        this.elements.jailContainer.appendChild(this.elements.jailOptions);

        // Assemble turn panel
        this.elements.turnPanel.appendChild(this.elements.currentPlayer);
        this.elements.turnPanel.appendChild(this.elements.turnInfo);
        this.elements.turnPanel.appendChild(this.elements.actionsContainer);
        this.elements.turnPanel.appendChild(this.elements.actionButtons);
        this.elements.turnPanel.appendChild(this.elements.jailContainer);
        this.elements.turnPanel.appendChild(this.elements.historyContainer);

        // Add to page
        document.body.appendChild(this.elements.turnPanel);
    }

    /**
     * Create a DOM element
     * @param {string} tag - Element tag
     * @param {string} className - CSS class
     * @param {string} textContent - Text content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, className, textContent = '') {
        const element = document.createElement(tag);
        element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Button click handlers
        this.elements.rollDiceBtn.addEventListener('click', () => {
            this.handleRollDice();
        });

        this.elements.endTurnBtn.addEventListener('click', () => {
            this.handleEndTurn();
        });

        this.elements.managePropertiesBtn.addEventListener('click', () => {
            this.handleManageProperties();
        });

        this.elements.tradeBtn.addEventListener('click', () => {
            this.handleTrade();
        });
    }

    /**
     * Bind to game events
     */
    bindEvents() {
        // Game events
        this.gameEngine.on('game:start', (data) => {
            this.handleGameStart(data);
        });

        this.gameEngine.on('turn:start', (data) => {
            this.handleTurnStart(data);
        });

        this.gameEngine.on('turn:end', (data) => {
            this.handleTurnEnd(data);
        });

        // Turn manager events
        if (this.gameEngine.turnManager) {
            this.gameEngine.turnManager.on('turn:started', (data) => {
                this.updateCurrentPlayer(data.player);
            });

            this.gameEngine.turnManager.on('turn:action', (data) => {
                this.addToHistory(data.action);
            });
        }

        // Dice events
        document.addEventListener('dice:rolled', (event) => {
            this.handleDiceRolled(event.detail);
        });

        // Jail events
        document.addEventListener('jail:entered', (event) => {
            this.handleJailEntered(event.detail);
        });

        document.addEventListener('jail:exited', (event) => {
            this.handleJailExited(event.detail);
        });
    }

    /**
     * Handle game start
     * @param {Object} data - Game start data
     */
    handleGameStart(data) {
        this.showTurnPanel();
        this.updateGameInfo(data);
    }

    /**
     * Handle turn start
     * @param {Object} data - Turn start data
     */
    handleTurnStart(data) {
        this.updateCurrentPlayer(data.player);
        this.updateTurnInfo(data);
        this.enableTurnActions();
    }

    /**
     * Handle turn end
     * @param {Object} data - Turn end data
     */
    handleTurnEnd(data) {
        this.disableTurnActions();
        this.clearJailUI();
    }

    /**
     * Update current player display
     * @param {Player} player - Current player
     */
    updateCurrentPlayer(player) {
        this.currentPlayer = player;
        
        if (this.elements.playerName) {
            this.elements.playerName.textContent = player.name;
        }
        
        if (this.elements.playerMoney) {
            this.elements.playerMoney.textContent = `$${player.money}`;
        }
        
        if (this.elements.playerToken) {
            this.elements.playerToken.style.backgroundColor = player.color || '#007bff';
            this.elements.playerToken.textContent = player.token || player.name.charAt(0);
        }

        // Update panel color based on player
        this.elements.turnPanel.style.borderColor = player.color || '#007bff';
    }

    /**
     * Update turn information
     * @param {Object} data - Turn data
     */
    updateTurnInfo(data) {
        if (this.elements.turnNumber) {
            this.elements.turnNumber.textContent = `Turn: ${data.round || 1}`;
        }
        
        if (this.elements.roundNumber) {
            this.elements.roundNumber.textContent = `Round: ${data.round || 1}`;
        }
    }

    /**
     * Update game information
     * @param {Object} data - Game data
     */
    updateGameInfo(data) {
        // Update with game configuration
        if (data.players) {
            this.updatePlayerList(data.players);
        }
    }

    /**
     * Handle roll dice button click
     */
    handleRollDice() {
        if (this.gameEngine.diceManager) {
            this.gameEngine.diceManager.rollDice();
        }
    }

    /**
     * Handle end turn button click
     */
    handleEndTurn() {
        this.gameEngine.endTurn();
    }

    /**
     * Handle manage properties button click
     */
    handleManageProperties() {
        // Trigger property modal
        const event = new CustomEvent('ui:show_properties', {
            detail: { player: this.currentPlayer }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle trade button click
     */
    handleTrade() {
        // Trigger trade modal
        const event = new CustomEvent('ui:show_trade', {
            detail: { player: this.currentPlayer }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle dice rolled event
     * @param {Object} data - Dice roll data
     */
    handleDiceRolled(data) {
        this.disableRollDice();
        
        // Show dice result
        this.showDiceResult(data);
        
        // Enable end turn if not doubles
        if (!data.isDouble) {
            this.enableEndTurn();
        }
    }

    /**
     * Show dice roll result
     * @param {Object} data - Dice roll data
     */
    showDiceResult(data) {
        const resultDiv = this.createElement('div', 'dice-result');
        resultDiv.innerHTML = `
            <span>Rolled: ${data.dice1} + ${data.dice2} = ${data.total}</span>
            ${data.isDouble ? '<span class="doubles">DOUBLES!</span>' : ''}
        `;
        
        this.elements.actionsContainer.appendChild(resultDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (resultDiv.parentNode) {
                resultDiv.parentNode.removeChild(resultDiv);
            }
        }, 3000);
    }

    /**
     * Handle jail entered
     * @param {Object} data - Jail data
     */
    handleJailEntered(data) {
        this.showJailUI(data.player);
    }

    /**
     * Handle jail exited
     * @param {Object} data - Jail data
     */
    handleJailExited(data) {
        this.clearJailUI();
    }

    /**
     * Show jail UI
     * @param {Player} player - Player in jail
     */
    showJailUI(player) {
        this.elements.jailContainer.style.display = 'block';
        this.elements.jailMessage.textContent = `${player.name} is in jail!`;
        
        // Create jail options
        this.elements.jailOptions.innerHTML = '';
        
        const options = [
            { text: 'Roll for doubles', action: 'roll_doubles' },
            { text: 'Pay $50', action: 'pay_bail' }
        ];
        
        if (player.hasGetOutOfJailCard && player.hasGetOutOfJailCard()) {
            options.unshift({ text: 'Use Get Out of Jail card', action: 'use_card' });
        }
        
        options.forEach(option => {
            const button = this.createElement('button', 'jail-option', option.text);
            button.addEventListener('click', () => {
                this.handleJailOption(option.action);
            });
            this.elements.jailOptions.appendChild(button);
        });
    }

    /**
     * Clear jail UI
     */
    clearJailUI() {
        this.elements.jailContainer.style.display = 'none';
    }

    /**
     * Handle jail option selection
     * @param {string} action - Selected action
     */
    handleJailOption(action) {
        const event = new CustomEvent('jail:option_selected', {
            detail: { action, player: this.currentPlayer }
        });
        document.dispatchEvent(event);
    }

    /**
     * Add action to history
     * @param {Object} action - Action to add
     */
    addToHistory(action) {
        const li = this.createElement('li', 'history-item');
        li.textContent = `${action.type}: ${JSON.stringify(action.details)}`;
        
        this.elements.historyList.insertBefore(li, this.elements.historyList.firstChild);
        
        // Keep only last 5 items
        while (this.elements.historyList.children.length > 5) {
            this.elements.historyList.removeChild(this.elements.historyList.lastChild);
        }
    }

    /**
     * Update player list
     * @param {Array} players - Array of players
     */
    updatePlayerList(players) {
        // Could be used to update a player status sidebar
    }

    /**
     * Enable turn actions
     */
    enableTurnActions() {
        this.elements.rollDiceBtn.disabled = false;
        this.elements.endTurnBtn.disabled = true;
        this.elements.managePropertiesBtn.disabled = false;
        this.elements.tradeBtn.disabled = false;
    }

    /**
     * Disable turn actions
     */
    disableTurnActions() {
        this.elements.rollDiceBtn.disabled = true;
        this.elements.endTurnBtn.disabled = true;
        this.elements.managePropertiesBtn.disabled = true;
        this.elements.tradeBtn.disabled = true;
    }

    /**
     * Enable roll dice button
     */
    enableRollDice() {
        this.elements.rollDiceBtn.disabled = false;
    }

    /**
     * Disable roll dice button
     */
    disableRollDice() {
        this.elements.rollDiceBtn.disabled = true;
    }

    /**
     * Enable end turn button
     */
    enableEndTurn() {
        this.elements.endTurnBtn.disabled = false;
    }

    /**
     * Show turn panel
     */
    showTurnPanel() {
        this.elements.turnPanel.style.display = 'block';
    }

    /**
     * Hide turn panel
     */
    hideTurnPanel() {
        this.elements.turnPanel.style.display = 'none';
    }

    /**
     * Update turn timer
     * @param {number} timeLeft - Time left in milliseconds
     */
    updateTurnTimer(timeLeft) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        this.elements.turnTimer.textContent = 
            `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        const notification = this.createElement('div', `notification ${type}`, message);
        this.elements.turnPanel.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.elements.turnPanel && this.elements.turnPanel.parentNode) {
            this.elements.turnPanel.parentNode.removeChild(this.elements.turnPanel);
        }
        this.removeAllListeners();
    }
}