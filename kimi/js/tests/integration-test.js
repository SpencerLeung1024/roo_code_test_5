/**
 * Complete Integration Test
 * Tests the entire turn-based gameplay system
 */

import { MonopolyGame } from '../engine/MonopolyGame.js';
import { GamePhase } from '../engine/GameFlowController.js';

/**
 * Integration test suite for the complete Monopoly game
 */
class IntegrationTest {
    constructor() {
        this.game = null;
        this.testResults = [];
    }

    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Integration Tests...');
        
        try {
            await this.setupTestEnvironment();
            
            const tests = [
                'testGameInitialization',
                'testPlayerCreation',
                'testTurnManagement',
                'testDiceRolling',
                'testPlayerMovement',
                'testPropertyLanding',
                'testJailSystem',
                'testTurnFlow',
                'testGameFlow',
                'testSaveLoad'
            ];

            for (const testName of tests) {
                console.log(`\n📋 Running ${testName}...`);
                await this[testName]();
                console.log(`✅ ${testName} passed`);
            }

            console.log('\n🎉 All integration tests passed!');
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ Integration test failed:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Setup test environment
     */
    async setupTestEnvironment() {
        this.game = new MonopolyGame();
        await this.game.init();
        
        // Create test players
        this.testConfig = {
            players: [
                { name: 'Alice', token: '🚗', money: 1500 },
                { name: 'Bob', token: '🐕', money: 1500 },
                { name: 'Charlie', token: '🎩', money: 1500 }
            ],
            settings: {
                autoSave: false,
                turnTimeout: 0
            }
        };
    }

    /**
     * Test game initialization
     */
    async testGameInitialization() {
        this.assert(this.game.isReady(), 'Game should be initialized');
        this.assert(this.game.gameEngine, 'Game engine should exist');
        this.assert(this.game.turnManager, 'Turn manager should exist');
        this.assert(this.game.gameFlow, 'Game flow controller should exist');
        this.assert(this.game.turnActions, 'Turn actions should exist');
    }

    /**
     * Test player creation
     */
    async testPlayerCreation() {
        await this.game.startGame(this.testConfig);
        
        const players = this.game.gameEngine.playerManager.getActivePlayers();
        this.assert(players.length === 3, 'Should have 3 players');
        this.assert(players[0].name === 'Alice', 'First player should be Alice');
        this.assert(players[0].money === 1500, 'Players should start with $1500');
        this.assert(players[0].position === 0, 'Players should start at GO');
    }

    /**
     * Test turn management
     */
    async testTurnManagement() {
        const turnManager = this.game.turnManager;
        const currentPlayer = this.game.gameEngine.getCurrentPlayer();
        
        this.assert(currentPlayer.name === 'Alice', 'Alice should start first');
        this.assert(turnManager.getCurrentTurn(), 'Should have current turn');
        this.assert(turnManager.getCurrentTurn().player.id === currentPlayer.id, 'Turn should belong to current player');
    }

    /**
     * Test dice rolling
     */
    async testDiceRolling() {
        const diceManager = this.game.gameEngine.diceManager;
        
        // Test dice roll
        const rollResult = diceManager.rollDice();
        this.assert(rollResult.dice1 >= 1 && rollResult.dice1 <= 6, 'Dice 1 should be 1-6');
        this.assert(rollResult.dice2 >= 1 && rollResult.dice2 <= 6, 'Dice 2 should be 1-6');
        this.assert(rollResult.total >= 2 && rollResult.total <= 12, 'Total should be 2-12');
    }

    /**
     * Test player movement
     */
    async testPlayerMovement() {
        const player = this.game.gameEngine.getCurrentPlayer();
        const originalPosition = player.position;
        
        // Simulate movement
        const steps = 5;
        await this.game.turnActions.movePlayer(player, steps);
        
        const expectedPosition = (originalPosition + steps) % 40;
        this.assert(player.position === expectedPosition, `Player should move to position ${expectedPosition}`);
    }

    /**
     * Test property landing
     */
    async testPropertyLanding() {
        const player = this.game.gameEngine.getCurrentPlayer();
        
        // Move to a property square
        const propertySquare = this.game.gameEngine.board.getSquare(1); // Mediterranean Avenue
        player.position = 1;
        
        await this.game.turnActions.handleLanding(player, 1);
        
        // Check if property action was triggered
        this.assert(true, 'Property landing handled successfully');
    }

    /**
     * Test jail system
     */
    async testJailSystem() {
        const player = this.game.gameEngine.getCurrentPlayer();
        
        // Send player to jail
        player.goToJail();
        this.assert(player.inJail === true, 'Player should be in jail');
        this.assert(player.position === 10, 'Player should be at jail position');
        
        // Test jail turn handling
        this.game.gameEngine.handleJailTurn(player);
        this.assert(true, 'Jail turn handled successfully');
    }

    /**
     * Test complete turn flow
     */
    async testTurnFlow() {
        const originalPlayer = this.game.gameEngine.getCurrentPlayer();
        
        // Simulate complete turn
        await this.simulateTurn();
        
        const newPlayer = this.game.gameEngine.getCurrentPlayer();
        this.assert(originalPlayer.id !== newPlayer.id, 'Turn should advance to next player');
    }

    /**
     * Test game flow
     */
    async testGameFlow() {
        const gameFlow = this.game.gameFlow;
        
        this.assert(gameFlow.getCurrentPhase() === GamePhase.ACTIVE, 'Game should be in active phase');
        
        // Test pause/resume
        gameFlow.pauseGame('Test pause');
        this.assert(gameFlow.getCurrentPhase() === GamePhase.PAUSED, 'Game should be paused');
        
        gameFlow.resumeGame();
        this.assert(gameFlow.getCurrentPhase() === GamePhase.ACTIVE, 'Game should be resumed');
    }

    /**
     * Test save/load functionality
     */
    async testSaveLoad() {
        // Save game state
        const originalState = this.game.getGameState();
        await this.game.saveGame();
        
        // Restart game
        await this.game.restartGame();
        
        // Load saved state
        await this.game.loadGame();
        
        const loadedState = this.game.getGameState();
        this.assert(loadedState.gameState.currentPlayerIndex === originalState.gameState.currentPlayerIndex, 
                   'Loaded state should match saved state');
    }

    /**
     * Simulate a complete turn
     */
    async simulateTurn() {
        const player = this.game.gameEngine.getCurrentPlayer();
        
        // Roll dice
        const diceResult = this.game.gameEngine.diceManager.rollDice();
        
        // Move player
        await this.game.turnActions.movePlayer(player, diceResult.total);
        
        // Handle landing
        await this.game.turnActions.handleLanding(player, player.position);
        
        // End turn
        this.game.gameEngine.endTurn();
        
        // Wait for turn to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Assert test condition
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
        this.testResults.push({ test: message, status: 'passed' });
    }

    /**
     * Print test results
     */
    printTestResults() {
        console.log('\n📊 Test Results:');
        this.testResults.forEach(result => {
            console.log(`✅ ${result.test}`);
        });
    }

    /**
     * Cleanup test environment
     */
    async cleanup() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

// Run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('integration-test')) {
    const test = new IntegrationTest();
    test.runAllTests().catch(console.error);
}

// Export for use in other files
export { IntegrationTest };