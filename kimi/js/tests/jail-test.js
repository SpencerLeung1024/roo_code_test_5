/**
 * Jail System Test Suite
 * Comprehensive tests for jail mechanics
 */

import { GameEngine } from '../engine/GameEngine.js';
import { Player } from '../models/Player.js';
import { constants } from '../config/constants.js';

/**
 * Test suite for jail mechanics
 */
class JailTestSuite {
    constructor() {
        this.gameEngine = null;
        this.testResults = [];
    }

    /**
     * Run all jail tests
     */
    async runAllTests() {
        console.log('🧪 Starting Jail System Tests...');
        
        this.testResults = [];
        
        try {
            await this.setupTestEnvironment();
            
            // Run individual tests
            await this.testJailEntryThreeDoubles();
            await this.testJailEntryGoToJail();
            await this.testJailEntryFromCards();
            await this.testJailExitPayFine();
            await this.testJailExitUseCard();
            await this.testJailExitRollDoubles();
            await this.testJailExitForcedPayment();
            await this.testJailTurnManagement();
            await this.testRentCollectionInJail();
            await this.testJailCardUsage();
            
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.testResults.push({
                test: 'Test Suite',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Setup test environment
     */
    async setupTestEnvironment() {
        this.gameEngine = new GameEngine();
        await this.gameEngine.init();
        
        // Create test players
        const testPlayers = [
            { id: 'test-1', name: 'Test Player 1', token: '🎩', money: 1500 },
            { id: 'test-2', name: 'Test Player 2', token: '🚗', money: 1500 }
        ];
        
        this.gameEngine.playerManager.createPlayers(testPlayers);
        this.gameEngine.gameState.isGameActive = true;
    }

    /**
     * Test jail entry via three doubles
     */
    async testJailEntryThreeDoubles() {
        console.log('🎲 Testing jail entry via three doubles...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            const initialPosition = player.position;
            
            // Simulate three doubles
            this.gameEngine.diceManager.forceRoll(3, 3); // First doubles
            await this.delay(100);
            this.gameEngine.diceManager.forceRoll(4, 4); // Second doubles
            await this.delay(100);
            this.gameEngine.diceManager.forceRoll(5, 5); // Third doubles - should go to jail
            
            // Verify player is in jail
            const isInJail = player.inJail;
            const jailPosition = player.position === constants.BOARD.JAIL_POSITION;
            
            this.assertTrue(isInJail, 'Player should be in jail after three doubles');
            this.assertTrue(jailPosition, 'Player should be at jail position');
            this.assertEqual(player.jailTurns, 0, 'Jail turns should be 0');
            
            this.testResults.push({
                test: 'Jail Entry - Three Doubles',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Entry - Three Doubles',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail entry via Go to Jail square
     */
    async testJailEntryGoToJail() {
        console.log('🚔 Testing jail entry via Go to Jail square...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Move player to Go to Jail square (position 30)
            player.position = 30;
            await this.gameEngine.handlePlayerLanding(30);
            
            // Verify player is in jail
            const isInJail = player.inJail;
            const jailPosition = player.position === constants.BOARD.JAIL_POSITION;
            
            this.assertTrue(isInJail, 'Player should be in jail after landing on Go to Jail');
            this.assertTrue(jailPosition, 'Player should be moved to jail position');
            
            this.testResults.push({
                test: 'Jail Entry - Go to Jail Square',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Entry - Go to Jail Square',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail entry via Chance/Community Chest cards
     */
    async testJailEntryFromCards() {
        console.log('🎴 Testing jail entry via cards...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Test Go to Jail card
            player.goToJail();
            
            this.assertTrue(player.inJail, 'Player should be in jail from Go to Jail card');
            this.assertEqual(player.position, constants.BOARD.JAIL_POSITION, 'Player should be at jail position');
            
            this.testResults.push({
                test: 'Jail Entry - Cards',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Entry - Cards',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail exit via paying fine
     */
    async testJailExitPayFine() {
        console.log('💰 Testing jail exit via paying fine...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            const initialMoney = player.money;
            
            // Put player in jail
            player.goToJail();
            
            // Pay fine to exit
            player.removeMoney(constants.JAIL.BAIL_AMOUNT, 'Jail fine');
            player.getOutOfJail(false);
            
            // Verify player is out of jail
            const isOutOfJail = !player.inJail;
            const moneyDeducted = player.money === initialMoney - constants.JAIL.BAIL_AMOUNT;
            
            this.assertTrue(isOutOfJail, 'Player should be out of jail after paying fine');
            this.assertTrue(moneyDeducted, 'Money should be deducted for fine');
            
            this.testResults.push({
                test: 'Jail Exit - Pay Fine',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Exit - Pay Fine',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail exit via Get Out of Jail Free card
     */
    async testJailExitUseCard() {
        console.log('🎴 Testing jail exit via Get Out of Jail Free card...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Put player in jail
            player.goToJail();
            
            // Give player a Get Out of Jail Free card
            player.getOutOfJailFreeCards = 1;
            
            // Use card to exit
            player.getOutOfJail(true);
            
            // Verify player is out of jail and card is used
            const isOutOfJail = !player.inJail;
            const cardUsed = player.getOutOfJailFreeCards === 0;
            
            this.assertTrue(isOutOfJail, 'Player should be out of jail after using card');
            this.assertTrue(cardUsed, 'Get Out of Jail Free card should be used');
            
            this.testResults.push({
                test: 'Jail Exit - Use Card',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Exit - Use Card',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail exit via rolling doubles
     */
    async testJailExitRollDoubles() {
        console.log('🎲 Testing jail exit via rolling doubles...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Put player in jail
            player.goToJail();
            
            // Simulate rolling doubles
            const diceResult = { dice1: 3, dice2: 3, isDoubles: true, total: 6 };
            
            // Player rolls doubles and exits
            player.getOutOfJail(false);
            
            // Verify player is out of jail
            const isOutOfJail = !player.inJail;
            
            this.assertTrue(isOutOfJail, 'Player should be out of jail after rolling doubles');
            
            this.testResults.push({
                test: 'Jail Exit - Roll Doubles',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Exit - Roll Doubles',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail exit via forced payment after 3 turns
     */
    async testJailExitForcedPayment() {
        console.log('⏰ Testing jail exit via forced payment...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            const initialMoney = player.money;
            
            // Put player in jail
            player.goToJail();
            
            // Simulate 3 turns in jail
            player.jailTurns = 3;
            
            // Force payment
            player.removeMoney(constants.JAIL.BAIL_AMOUNT, 'Jail fine (forced)');
            player.getOutOfJail(false);
            
            // Verify player is out of jail and money is deducted
            const isOutOfJail = !player.inJail;
            const moneyDeducted = player.money === initialMoney - constants.JAIL.BAIL_AMOUNT;
            
            this.assertTrue(isOutOfJail, 'Player should be out of jail after forced payment');
            this.assertTrue(moneyDeducted, 'Money should be deducted for forced payment');
            
            this.testResults.push({
                test: 'Jail Exit - Forced Payment',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Exit - Forced Payment',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail turn management
     */
    async testJailTurnManagement() {
        console.log('📊 Testing jail turn management...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Put player in jail
            player.goToJail();
            
            // Verify initial state
            this.assertEqual(player.jailTurns, 0, 'Initial jail turns should be 0');
            
            // Simulate turn progression
            player.jailTurns++;
            this.assertEqual(player.jailTurns, 1, 'Jail turns should increment');
            
            player.jailTurns++;
            this.assertEqual(player.jailTurns, 2, 'Jail turns should increment again');
            
            this.testResults.push({
                test: 'Jail Turn Management',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Turn Management',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test rent collection while in jail
     */
    async testRentCollectionInJail() {
        console.log('🏠 Testing rent collection while in jail...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Put player in jail
            player.goToJail();
            
            // Verify player can collect rent
            const canCollectRent = this.gameEngine.jailManager.canCollectRentInJail(player);
            
            this.assertTrue(canCollectRent, 'Player should be able to collect rent while in jail');
            
            this.testResults.push({
                test: 'Rent Collection in Jail',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Rent Collection in Jail',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test jail card usage
     */
    async testJailCardUsage() {
        console.log('🎴 Testing jail card usage...');
        
        try {
            const player = this.gameEngine.getCurrentPlayer();
            
            // Test adding jail cards
            player.getOutOfJailFreeCards = 2;
            this.assertEqual(player.getOutOfJailFreeCards, 2, 'Player should have 2 jail cards');
            
            // Test using jail cards
            player.getOutOfJailFreeCards--;
            this.assertEqual(player.getOutOfJailFreeCards, 1, 'Player should have 1 jail card left');
            
            this.testResults.push({
                test: 'Jail Card Usage',
                passed: true
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Jail Card Usage',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Helper methods
     */
    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Print test results
     */
    printTestResults() {
        console.log('\n📋 Jail System Test Results:');
        console.log('============================');
        
        let passed = 0;
        let total = this.testResults.length;
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.test}`);
            
            if (!result.passed && result.error) {
                console.log(`   Error: ${result.error}`);
            }
            
            if (result.passed) passed++;
        });
        
        console.log(`\n📊 Summary: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All jail tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the errors above.');
        }
    }
}

/**
 * Run jail tests
 */
export async function runJailTests() {
    const testSuite = new JailTestSuite();
    await testSuite.runAllTests();
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('jail-test')) {
    document.addEventListener('DOMContentLoaded', () => {
        runJailTests();
    });
}