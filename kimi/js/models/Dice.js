/**
 * Dice Model
 * Handles dice rolling mechanics for Monopoly game
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Dice class for handling dice rolling mechanics
 */
export class Dice {
    constructor() {
        this.dice1 = 1;
        this.dice2 = 1;
        this.total = 0;
        this.isDoubles = false;
        this.doublesCount = 0;
        this.rollHistory = [];
        this.isRolling = false;
        this.canRoll = true;
    }

    /**
     * Roll the dice
     * @returns {Object} Roll result with dice values and metadata
     */
    roll() {
        if (!this.canRoll) {
            debugLog('warn', 'Cannot roll dice: rolling not allowed');
            return null;
        }

        if (this.isRolling) {
            debugLog('warn', 'Cannot roll dice: already rolling');
            return null;
        }

        this.isRolling = true;
        
        // Generate random dice values
        this.dice1 = this.getRandomDiceValue();
        this.dice2 = this.getRandomDiceValue();
        this.total = this.dice1 + this.dice2;
        this.isDoubles = this.dice1 === this.dice2;

        // Handle doubles logic
        if (this.isDoubles) {
            this.doublesCount++;
            debugLog('info', `Doubles rolled: ${this.doublesCount} in a row`);
        } else {
            this.doublesCount = 0;
        }

        // Check for 3 doubles (go to jail rule)
        const shouldGoToJail = this.doublesCount >= constants.DICE.MAX_DOUBLE_ROLLS;

        // Create roll result
        const rollResult = {
            dice1: this.dice1,
            dice2: this.dice2,
            total: this.total,
            isDoubles: this.isDoubles,
            doublesCount: this.doublesCount,
            shouldGoToJail: shouldGoToJail,
            timestamp: Date.now()
        };

        // Add to history
        this.rollHistory.push(rollResult);
        
        // Limit history to last 50 rolls
        if (this.rollHistory.length > 50) {
            this.rollHistory.shift();
        }

        debugLog('info', `Dice rolled: ${this.dice1} + ${this.dice2} = ${this.total}${this.isDoubles ? ' (DOUBLES)' : ''}`);

        // Reset rolling state after a delay
        setTimeout(() => {
            this.isRolling = false;
        }, constants.UI.DICE_ROLL_DURATION);

        // Dispatch dice rolled event
        this.dispatchEvent('dice:rolled', rollResult);

        return rollResult;
    }

    /**
     * Get a random dice value between 1 and 6
     * @returns {number} Random dice value
     */
    getRandomDiceValue() {
        return Math.floor(Math.random() * constants.DICE.MAX_VALUE) + constants.DICE.MIN_VALUE;
    }

    /**
     * Reset dice state
     */
    reset() {
        this.dice1 = 1;
        this.dice2 = 1;
        this.total = 0;
        this.isDoubles = false;
        this.doublesCount = 0;
        this.rollHistory = [];
        this.isRolling = false;
        this.canRoll = true;
        debugLog('info', 'Dice state reset');
    }

    /**
     * Get roll statistics
     * @returns {Object} Statistics about dice rolls
     */
    getStatistics() {
        if (this.rollHistory.length === 0) {
            return {
                totalRolls: 0,
                doublesCount: 0,
                doublesPercentage: 0,
                averageTotal: 0,
                mostCommonRoll: null,
                lastRoll: null
            };
        }

        const totalRolls = this.rollHistory.length;
        const doublesCount = this.rollHistory.filter(roll => roll.isDoubles).length;
        const totalSum = this.rollHistory.reduce((sum, roll) => sum + roll.total, 0);
        
        // Find most common total
        const totals = this.rollHistory.map(roll => roll.total);
        const frequency = {};
        totals.forEach(total => {
            frequency[total] = (frequency[total] || 0) + 1;
        });
        
        let mostCommonRoll = null;
        let maxFrequency = 0;
        for (const [total, count] of Object.entries(frequency)) {
            if (count > maxFrequency) {
                maxFrequency = count;
                mostCommonRoll = parseInt(total);
            }
        }

        return {
            totalRolls,
            doublesCount,
            doublesPercentage: Math.round((doublesCount / totalRolls) * 100),
            averageTotal: Math.round((totalSum / totalRolls) * 100) / 100,
            mostCommonRoll,
            lastRoll: this.rollHistory[this.rollHistory.length - 1]
        };
    }

    /**
     * Get roll history
     * @param {number} limit - Maximum number of rolls to return
     * @returns {Array} Array of roll results
     */
    getRollHistory(limit = 10) {
        return this.rollHistory.slice(-limit);
    }

    /**
     * Check if player can roll again (for doubles)
     * @returns {boolean} True if player can roll again
     */
    canRollAgain() {
        return this.isDoubles && this.doublesCount < constants.DICE.MAX_DOUBLE_ROLLS;
    }

    /**
     * Set whether dice can be rolled
     * @param {boolean} canRoll - Whether rolling is allowed
     */
    setCanRoll(canRoll) {
        this.canRoll = canRoll;
        debugLog('info', `Dice rolling ${canRoll ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get current dice state
     * @returns {Object} Current dice state
     */
    getState() {
        return {
            dice1: this.dice1,
            dice2: this.dice2,
            total: this.total,
            isDoubles: this.isDoubles,
            doublesCount: this.doublesCount,
            isRolling: this.isRolling,
            canRoll: this.canRoll
        };
    }

    /**
     * Simulate a dice roll (for testing purposes)
     * @param {number} dice1 - Value for first die
     * @param {number} dice2 - Value for second die
     * @returns {Object} Simulated roll result
     */
    simulateRoll(dice1, dice2) {
        if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
            throw new Error('Dice values must be between 1 and 6');
        }

        this.dice1 = dice1;
        this.dice2 = dice2;
        this.total = dice1 + dice2;
        this.isDoubles = dice1 === dice2;

        if (this.isDoubles) {
            this.doublesCount++;
        } else {
            this.doublesCount = 0;
        }

        const rollResult = {
            dice1: this.dice1,
            dice2: this.dice2,
            total: this.total,
            isDoubles: this.isDoubles,
            doublesCount: this.doublesCount,
            shouldGoToJail: this.doublesCount >= constants.DICE.MAX_DOUBLE_ROLLS,
            timestamp: Date.now()
        };

        this.rollHistory.push(rollResult);
        
        if (this.rollHistory.length > 50) {
            this.rollHistory.shift();
        }

        debugLog('info', `Simulated dice roll: ${dice1} + ${dice2} = ${this.total}`);
        
        return rollResult;
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
}

// Create singleton instance
export const dice = new Dice();