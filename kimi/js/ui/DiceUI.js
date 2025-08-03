/**
 * Dice UI Component
 * Handles visual dice display and animations
 */

import { constants } from '../config/constants.js';
import { dice } from '../models/Dice.js';
import { debugLog } from '../config/constants.js';

/**
 * Dice UI class for handling visual dice display
 */
export class DiceUI {
    constructor(containerId = 'dice-container') {
        this.container = document.getElementById(containerId);
        this.diceElements = [];
        this.isAnimating = false;
        this.animationTimeout = null;
        
        if (!this.container) {
            debugLog('error', `Dice container with id '${containerId}' not found`);
            return;
        }
        
        this.init();
    }

    /**
     * Initialize the dice UI
     */
    init() {
        this.createDiceElements();
        this.bindEvents();
        this.render();
    }

    /**
     * Create dice DOM elements
     */
    createDiceElements() {
        this.container.innerHTML = `
            <div class="dice-ui">
                <div class="dice-display">
                    <div class="dice dice-1" data-dice="1">
                        <div class="dice-face">
                            <div class="dots"></div>
                        </div>
                    </div>
                    <div class="dice dice-2" data-dice="2">
                        <div class="dice-face">
                            <div class="dots"></div>
                        </div>
                    </div>
                </div>
                <div class="dice-controls">
                    <button class="roll-button" id="roll-dice-btn">
                        <span class="btn-text">Roll Dice</span>
                        <span class="btn-spinner" style="display: none;">🎲</span>
                    </button>
                </div>
                <div class="dice-result">
                    <div class="total-display">
                        <span class="total-label">Total:</span>
                        <span class="total-value">-</span>
                    </div>
                    <div class="doubles-indicator" style="display: none;">
                        <span class="doubles-text">DOUBLES!</span>
                        <span class="roll-again-text">Roll Again</span>
                    </div>
                </div>
                <div class="roll-history" style="display: none;">
                    <h4>Recent Rolls</h4>
                    <div class="history-list"></div>
                </div>
            </div>
        `;

        this.diceElements = [
            this.container.querySelector('.dice-1'),
            this.container.querySelector('.dice-2')
        ];
        
        this.rollButton = this.container.querySelector('#roll-dice-btn');
        this.totalDisplay = this.container.querySelector('.total-value');
        this.doublesIndicator = this.container.querySelector('.doubles-indicator');
        this.historyPanel = this.container.querySelector('.roll-history');
        this.historyList = this.container.querySelector('.history-list');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Roll button click
        this.rollButton?.addEventListener('click', () => {
            this.handleRollClick();
        });

        // Listen for dice rolled events
        document.addEventListener('dice:rolled', (event) => {
            this.handleDiceRolled(event.detail);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
                event.preventDefault();
                this.handleRollClick();
            }
        });
    }

    /**
     * Handle roll button click
     */
    handleRollClick() {
        if (this.isAnimating || !dice.canRoll) {
            debugLog('warn', 'Cannot roll: animation in progress or rolling disabled');
            return;
        }

        this.rollButton.disabled = true;
        this.startRollingAnimation();
        
        // Roll dice after animation starts
        setTimeout(() => {
            const result = dice.roll();
            if (result) {
                this.animateRoll(result);
            }
        }, 200);
    }

    /**
     * Start rolling animation
     */
    startRollingAnimation() {
        this.isAnimating = true;
        
        // Add rolling class to dice
        this.diceElements.forEach(diceEl => {
            diceEl.classList.add('rolling');
        });
        
        // Show spinner on button
        const spinner = this.rollButton.querySelector('.btn-spinner');
        const text = this.rollButton.querySelector('.btn-text');
        if (spinner && text) {
            spinner.style.display = 'inline';
            text.style.display = 'none';
        }
    }

    /**
     * Animate dice roll
     * @param {Object} result - Roll result
     */
    animateRoll(result) {
        // Stop rolling animation
        this.diceElements.forEach(diceEl => {
            diceEl.classList.remove('rolling');
        });

        // Update dice faces
        this.updateDiceFace(this.diceElements[0], result.dice1);
        this.updateDiceFace(this.diceElements[1], result.dice2);

        // Update total display
        this.totalDisplay.textContent = result.total;

        // Show doubles indicator
        if (result.isDoubles) {
            this.doublesIndicator.style.display = 'block';
            this.doublesIndicator.classList.add('show');
        } else {
            this.doublesIndicator.style.display = 'none';
            this.doublesIndicator.classList.remove('show');
        }

        // Update history
        this.updateHistory();

        // Reset button
        setTimeout(() => {
            this.rollButton.disabled = false;
            const spinner = this.rollButton.querySelector('.btn-spinner');
            const text = this.rollButton.querySelector('.btn-text');
            if (spinner && text) {
                spinner.style.display = 'none';
                text.style.display = 'inline';
            }
            this.isAnimating = false;
        }, constants.UI.DICE_ROLL_DURATION);
    }

    /**
     * Update dice face with dots
     * @param {Element} diceElement - Dice DOM element
     * @param {number} value - Dice value (1-6)
     */
    updateDiceFace(diceElement, value) {
        const dotsContainer = diceElement.querySelector('.dots');
        dotsContainer.innerHTML = '';
        
        // Create dots based on dice value
        const dotPositions = this.getDotPositions(value);
        
        dotPositions.forEach(position => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = position.x + '%';
            dot.style.top = position.y + '%';
            dotsContainer.appendChild(dot);
        });

        diceElement.setAttribute('data-value', value);
    }

    /**
     * Get dot positions for each dice value
     * @param {number} value - Dice value (1-6)
     * @returns {Array} Array of dot positions
     */
    getDotPositions(value) {
        const positions = {
            1: [{ x: 50, y: 50 }],
            2: [{ x: 20, y: 20 }, { x: 80, y: 80 }],
            3: [{ x: 20, y: 20 }, { x: 50, y: 50 }, { x: 80, y: 80 }],
            4: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 20, y: 80 }, { x: 80, y: 80 }],
            5: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 50, y: 50 }, { x: 20, y: 80 }, { x: 80, y: 80 }],
            6: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 20, y: 50 }, { x: 80, y: 50 }, { x: 20, y: 80 }, { x: 80, y: 80 }]
        };
        
        return positions[value] || positions[1];
    }

    /**
     * Handle dice rolled event
     * @param {Object} result - Roll result
     */
    handleDiceRolled(result) {
        debugLog('info', 'DiceUI received dice:rolled event', result);
    }

    /**
     * Update roll history display
     */
    updateHistory() {
        const history = dice.getRollHistory(5);
        this.historyList.innerHTML = '';
        
        history.forEach((roll, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <span class="dice-values">${roll.dice1} + ${roll.dice2}</span>
                <span class="total">= ${roll.total}</span>
                ${roll.isDoubles ? '<span class="doubles-badge">D</span>' : ''}
            `;
            
            if (index === history.length - 1) {
                item.classList.add('latest');
            }
            
            this.historyList.appendChild(item);
        });

        // Show history panel if there are rolls
        if (history.length > 0) {
            this.historyPanel.style.display = 'block';
        }
    }

    /**
     * Show/hide roll history
     * @param {boolean} show - Whether to show history
     */
    toggleHistory(show = null) {
        const shouldShow = show !== null ? show : this.historyPanel.style.display === 'none';
        this.historyPanel.style.display = shouldShow ? 'block' : 'none';
    }

    /**
     * Enable/disable dice rolling
     * @param {boolean} enabled - Whether rolling is enabled
     */
    setRollingEnabled(enabled) {
        this.rollButton.disabled = !enabled;
        dice.setCanRoll(enabled);
    }

    /**
     * Reset dice display
     */
    reset() {
        this.diceElements.forEach(diceEl => {
            this.updateDiceFace(diceEl, 1);
            diceEl.classList.remove('rolling');
        });
        
        this.totalDisplay.textContent = '-';
        this.doublesIndicator.style.display = 'none';
        this.historyPanel.style.display = 'none';
        this.historyList.innerHTML = '';
        
        this.rollButton.disabled = false;
        this.isAnimating = false;
    }

    /**
     * Render the dice UI
     */
    render() {
        // Initial dice faces
        this.diceElements.forEach(diceEl => {
            this.updateDiceFace(diceEl, 1);
        });
    }

    /**
     * Get dice container element
     * @returns {Element} Container element
     */
    getContainer() {
        return this.container;
    }
}

// Create singleton instance
export const diceUI = new DiceUI();