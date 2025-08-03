class DiceManager {
    constructor(eventHandler) {
        this.dice = [0, 0];
        this.isRolling = false;
        this.rollHistory = [];
        this.eventHandler = eventHandler;
        this.maxHistoryLength = 50;
    }
    
    // Main dice rolling method
    roll() {
        if (this.isRolling) {
            throw new Error('Dice are already rolling');
        }
        
        this.isRolling = true;
        
        // Simulate dice rolling animation (in real implementation, this would be client-side)
        setTimeout(() => {
            this.dice[0] = Math.floor(Math.random() * 6) + 1;
            this.dice[1] = Math.floor(Math.random() * 6) + 1;
            
            const rollResult = {
                dice: [...this.dice],
                total: this.getTotal(),
                isDoubles: this.isDoubles(),
                timestamp: new Date()
            };
            
            this.addToHistory(rollResult);
            this.isRolling = false;
            
            // Emit dice rolled event
            if (this.eventHandler) {
                this.eventHandler.emit('dice:rolled', rollResult);
            }
            
            console.log(`Dice rolled: ${this.dice[0]}, ${this.dice[1]} (Total: ${rollResult.total})`);
        }, 500); // Simulate rolling delay
        
        return {
            rolling: true,
            message: 'Dice are rolling...'
        };
    }
    
    // Quick roll method (no animation)
    quickRoll() {
        if (this.isRolling) {
            throw new Error('Dice are already rolling');
        }
        
        this.dice[0] = Math.floor(Math.random() * 6) + 1;
        this.dice[1] = Math.floor(Math.random() * 6) + 1;
        
        const rollResult = {
            dice: [...this.dice],
            total: this.getTotal(),
            isDoubles: this.isDoubles(),
            timestamp: new Date()
        };
        
        this.addToHistory(rollResult);
        
        // Emit dice rolled event
        if (this.eventHandler) {
            this.eventHandler.emit('dice:rolled', rollResult);
        }
        
        console.log(`Dice rolled: ${this.dice[0]}, ${this.dice[1]} (Total: ${rollResult.total})`);
        
        return rollResult;
    }
    
    // Dice state methods
    isDoubles() {
        return this.dice[0] === this.dice[1];
    }
    
    getTotal() {
        return this.dice[0] + this.dice[1];
    }
    
    getDice() {
        return [...this.dice];
    }
    
    setDice(die1, die2) {
        if (die1 < 1 || die1 > 6 || die2 < 1 || die2 > 6) {
            throw new Error('Dice values must be between 1 and 6');
        }
        
        this.dice[0] = die1;
        this.dice[1] = die2;
        
        const rollResult = {
            dice: [...this.dice],
            total: this.getTotal(),
            isDoubles: this.isDoubles(),
            timestamp: new Date(),
            manual: true
        };
        
        this.addToHistory(rollResult);
        
        // Emit dice set event
        if (this.eventHandler) {
            this.eventHandler.emit('dice:set', rollResult);
        }
        
        console.log(`Dice set manually: ${this.dice[0]}, ${this.dice[1]} (Total: ${rollResult.total})`);
    }
    
    // History management
    addToHistory(rollResult) {
        this.rollHistory.push(rollResult);
        
        // Keep history at maximum length
        if (this.rollHistory.length > this.maxHistoryLength) {
            this.rollHistory = this.rollHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getRollHistory(count = 10) {
        return this.rollHistory.slice(-count);
    }
    
    getFullHistory() {
        return [...this.rollHistory];
    }
    
    clearHistory() {
        this.rollHistory = [];
        console.log('Dice roll history cleared');
    }
    
    // Statistics methods
    getStatistics() {
        if (this.rollHistory.length === 0) {
            return {
                totalRolls: 0,
                averageRoll: 0,
                doublesCount: 0,
                doublesPercentage: 0,
                mostCommonRoll: null,
                rollDistribution: {}
            };
        }
        
        const totalRolls = this.rollHistory.length;
        const totalSum = this.rollHistory.reduce((sum, roll) => sum + roll.total, 0);
        const averageRoll = totalSum / totalRolls;
        const doublesCount = this.rollHistory.filter(roll => roll.isDoubles).length;
        const doublesPercentage = (doublesCount / totalRolls) * 100;
        
        // Calculate roll distribution
        const rollDistribution = {};
        this.rollHistory.forEach(roll => {
            rollDistribution[roll.total] = (rollDistribution[roll.total] || 0) + 1;
        });
        
        // Find most common roll
        let mostCommonRoll = null;
        let maxCount = 0;
        for (const [roll, count] of Object.entries(rollDistribution)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonRoll = parseInt(roll);
            }
        }
        
        return {
            totalRolls,
            averageRoll: Math.round(averageRoll * 100) / 100,
            doublesCount,
            doublesPercentage: Math.round(doublesPercentage * 100) / 100,
            mostCommonRoll,
            rollDistribution
        };
    }
    
    // Validation methods
    validateRoll() {
        if (this.isRolling) {
            return { valid: false, message: 'Dice are currently rolling' };
        }
        
        if (this.dice[0] === 0 || this.dice[1] === 0) {
            return { valid: false, message: 'Dice have not been rolled yet' };
        }
        
        return { valid: true, message: 'Dice roll is valid' };
    }
    
    // Reset methods
    reset() {
        this.dice = [0, 0];
        this.isRolling = false;
        console.log('Dice manager reset');
    }
    
    // State methods
    getState() {
        return {
            dice: [...this.dice],
            isRolling: this.isRolling,
            total: this.getTotal(),
            isDoubles: this.isDoubles(),
            rollCount: this.rollHistory.length,
            lastRoll: this.rollHistory.length > 0 ? this.rollHistory[this.rollHistory.length - 1] : null
        };
    }
    
    // Special dice methods for testing
    forceRoll(die1, die2) {
        this.dice[0] = die1;
        this.dice[1] = die2;
        
        const rollResult = {
            dice: [...this.dice],
            total: this.getTotal(),
            isDoubles: this.isDoubles(),
            timestamp: new Date(),
            forced: true
        };
        
        this.addToHistory(rollResult);
        
        // Emit dice rolled event
        if (this.eventHandler) {
            this.eventHandler.emit('dice:rolled', rollResult);
        }
        
        console.log(`Dice forced: ${this.dice[0]}, ${this.dice[1]} (Total: ${rollResult.total})`);
        
        return rollResult;
    }
    
    // Probability calculations
    calculateProbability(targetTotal) {
        if (targetTotal < 2 || targetTotal > 12) {
            return 0;
        }
        
        const combinations = {
            2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
            8: 5, 9: 4, 10: 3, 11: 2, 12: 1
        };
        
        return combinations[targetTotal] / 36;
    }
    
    calculateDoublesProbability() {
        return 6 / 36; // 6 possible doubles out of 36 combinations
    }
}

module.exports = DiceManager;