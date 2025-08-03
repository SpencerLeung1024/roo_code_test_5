/**
 * Dice System Test Suite
 * Tests for the complete dice rolling mechanics
 */

import { dice } from '../models/Dice.js';
import { DiceManager } from '../services/DiceManager.js';
import { Player } from '../models/Player.js';
import { constants } from '../config/constants.js';

/**
 * Test class for dice system
 */
export class DiceTestSuite {
    constructor() {
        this.testResults = [];
        this.testPlayer = new Player({
            id: 'test-player',
            name: 'Test Player',
            token: 'test'
        });
    }

    /**
     * Run all dice tests
     */
    async runAllTests() {
        console.log('🎲 Starting Dice System Tests...\n');
        
        await this.testDiceModel();
        await this.testDoublesDetection();
        await this.testThreeDoublesRule();
        await this.testPlayerMovement();
        await this.testBoardWrapping();
        await this.testStatistics();
        
        this.printResults();
        return this.testResults.every(result => result.passed);
    }

    /**
     * Test basic dice model functionality
     */
    async testDiceModel() {
        console.log('Testing Dice Model...');
        
        // Test 1: Initial state
        const initialState = dice.getState();
        const test1 = initialState.dice1 === 1 && 
                     initialState.dice2 === 1 && 
                     initialState.total === 0;
        
        this.addResult('Initial State', test1, 'Dice should start with 1,1,0');

        // Test 2: Roll produces valid values
        const roll = dice.roll();
        const test2 = roll && 
                     roll.dice1 >= 1 && roll.dice1 <= 6 && 
                     roll.dice2 >= 1 && roll.dice2 <= 6 && 
                     roll.total >= 2 && roll.total <= 12;
        
        this.addResult('Valid Roll Values', test2, 'Roll should produce valid dice values');

        // Test 3: Roll history
        const history = dice.getRollHistory();
        const test3 = history.length >= 1 && history[0] === roll;
        
        this.addResult('Roll History', test3, 'Roll should be added to history');
    }

    /**
     * Test doubles detection
     */
    async testDoublesDetection() {
        console.log('Testing Doubles Detection...');
        
        dice.reset();
        
        // Test 1: Non-doubles
        const nonDouble = dice.simulateRoll(1, 2);
        const test1 = !nonDouble.isDoubles && dice.doublesCount === 0;
        this.addResult('Non-Doubles Detection', test1, '1+2 should not be doubles');

        // Test 2: Doubles
        const double = dice.simulateRoll(3, 3);
        const test2 = double.isDoubles && dice.doublesCount === 1;
        this.addResult('Doubles Detection', test2, '3+3 should be doubles');

        // Test 3: Consecutive doubles
        const double2 = dice.simulateRoll(4, 4);
        const test3 = double2.isDoubles && dice.doublesCount === 2;
        this.addResult('Consecutive Doubles', test3, 'Second doubles should increment count');
    }

    /**
     * Test three doubles jail rule
     */
    async testThreeDoublesRule() {
        console.log('Testing Three Doubles Rule...');
        
        dice.reset();
        
        // Roll three doubles
        dice.simulateRoll(1, 1);
        dice.simulateRoll(2, 2);
        const thirdDouble = dice.simulateRoll(3, 3);
        
        const test = thirdDouble.shouldGoToJail && 
                    thirdDouble.doublesCount === 3;
        
        this.addResult('Three Doubles Jail Rule', test, 'Third doubles should trigger jail');
    }

    /**
     * Test player movement based on dice roll
     */
    async testPlayerMovement() {
        console.log('Testing Player Movement...');
        
        const startPosition = this.testPlayer.position;
        const rollValue = 5;
        
        // Move player
        this.testPlayer.moveTo((startPosition + rollValue) % constants.BOARD.SIZE);
        
        const expectedPosition = (startPosition + rollValue) % constants.BOARD.SIZE;
        const test = this.testPlayer.position === expectedPosition;
        
        this.addResult('Player Movement', test, `Player should move ${rollValue} spaces`);
    }

    /**
     * Test board wrapping (passing GO)
     */
    async testBoardWrapping() {
        console.log('Testing Board Wrapping...');
        
        // Position player near the end
        this.testPlayer.position = 38;
        const initialMoney = this.testPlayer.money;
        
        // Move 5 spaces (should wrap around)
        this.testPlayer.moveTo((38 + 5) % constants.BOARD.SIZE);
        
        const test = this.testPlayer.position === 3 && 
                    this.testPlayer.money === initialMoney + constants.GAME.SALARY;
        
        this.addResult('Board Wrapping', test, 'Should wrap around and collect GO salary');
    }

    /**
     * Test dice statistics
     */
    async testStatistics() {
        console.log('Testing Statistics...');
        
        dice.reset();
        
        // Generate some rolls
        for (let i = 0; i < 10; i++) {
            dice.roll();
        }
        
        const stats = dice.getStatistics();
        
        const test1 = stats.totalRolls === 10;
        const test2 = stats.doublesPercentage >= 0 && stats.doublesPercentage <= 100;
        const test3 = stats.averageTotal >= 2 && stats.averageTotal <= 12;
        
        this.addResult('Statistics Count', test1, 'Should track total rolls');
        this.addResult('Statistics Percentage', test2, 'Should calculate doubles percentage');
        this.addResult('Statistics Average', test3, 'Should calculate average roll');
    }

    /**
     * Add test result
     * @param {string} testName - Name of the test
     * @param {boolean} passed - Whether test passed
     * @param {string} description - Test description
     */
    addResult(testName, passed, description) {
        this.testResults.push({
            testName,
            passed,
            description,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${testName}: ${description}`);
    }

    /**
     * Print test results summary
     */
    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
        
        if (passed === total) {
            console.log('\n🎉 All tests passed! Dice system is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the implementation.');
        }
    }

    /**
     * Run integration test
     */
    async runIntegrationTest() {
        console.log('\n🔄 Running Integration Test...\n');
        
        // Create mock game manager
        const mockGameManager = {
            endTurn: () => console.log('Turn ended'),
            players: [this.testPlayer]
        };
        
        const diceManager = new DiceManager(mockGameManager);
        
        // Test dice manager initialization
        const test1 = diceManager.currentPlayer === null && 
                     !diceManager.isProcessingRoll;
        
        this.addResult('Dice Manager Init', test1, 'Should initialize correctly');
        
        // Test turn start
        diceManager.handleTurnStart({ player: this.testPlayer });
        const test2 = diceManager.currentPlayer === this.testPlayer;
        this.addResult('Turn Start', test2, 'Should set current player');
        
        // Test dice roll processing
        const rollResult = dice.simulateRoll(2, 3);
        await diceManager.handleDiceRolled(rollResult);
        
        const test3 = this.testPlayer.position === 5;
        this.addResult('Roll Processing', test3, 'Should move player correctly');
        
        console.log('\nIntegration test completed.');
    }
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('dice-test')) {
    const testSuite = new DiceTestSuite();
    testSuite.runAllTests().then(() => {
        testSuite.runIntegrationTest();
    });
}

// Export for use in other modules
export { DiceTestSuite };