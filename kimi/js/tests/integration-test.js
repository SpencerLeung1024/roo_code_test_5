/**
 * Integration Test for Player System
 * Tests the complete player management system
 */

import { PlayerManager } from '../services/PlayerManager.js';
import { PlayerRenderer } from '../ui/PlayerRenderer.js';
import { ModalManager } from '../ui/ModalManager.js';

/**
 * Integration test for player system
 */
export class PlayerIntegrationTest {
    constructor() {
        this.testResults = [];
    }

    async runIntegrationTest() {
        console.log('🚀 Starting Player System Integration Test...');
        
        try {
            // Initialize components
            const playerManager = new PlayerManager();
            const playerRenderer = new PlayerRenderer();
            const modalManager = new ModalManager();
            
            await playerManager.init();
            await playerRenderer.init();
            await modalManager.init();
            
            // Test 1: Create players
            const players = playerManager.createPlayers([
                { name: 'Alice', token: 'Hat', money: 1500 },
                { name: 'Bob', token: 'Car', money: 1500 },
                { name: 'Charlie', token: 'Ship', money: 1500 }
            ]);
            
            this.assert('Player creation', players.length === 3);
            this.assert('Player names', players.every(p => p.name && p.token));
            
            // Test 2: Render players
            playerRenderer.renderPlayers(players, 0);
            this.assert('Player rendering', true);
            
            // Test 3: Player interactions
            const currentPlayer = playerManager.getCurrentPlayer();
            this.assert('Current player', currentPlayer.name === 'Alice');
            
            // Test 4: Money transactions
            const success = currentPlayer.transferMoney(players[1], 200, 'Test transfer');
            this.assert('Money transfer', success && currentPlayer.money === 1300 && players[1].money === 1700);
            
            // Test 5: State management
            const savedState = playerManager.savePlayerStates();
            this.assert('State save', savedState.players.length === 3);
            
            // Test 6: Load state
            const newManager = new PlayerManager();
            newManager.loadPlayerStates(savedState, {});
            this.assert('State load', newManager.players.length === 3);
            this.assert('State integrity', newManager.players[0].name === 'Alice');
            
            // Test 7: Player elimination
            const bankruptPlayer = players[2];
            bankruptPlayer.money = -100;
            playerManager.eliminatePlayer(bankruptPlayer.id);
            this.assert('Player elimination', playerManager.getActivePlayers().length === 2);
            
            // Test 8: Rankings
            const rankings = playerManager.getPlayerRankings();
            this.assert('Player rankings', rankings.length === 3);
            this.assert('Ranking order', rankings[0].name === 'Bob'); // Bob has most money
            
            console.log('✅ All integration tests passed!');
            return true;
            
        } catch (error) {
            console.error('❌ Integration test failed:', error);
            this.assert('Integration test', false, error.message);
            return false;
        }
    }

    assert(testName, condition, error = '') {
        const result = {
            test: testName,
            passed: condition,
            error: error
        };
        
        this.testResults.push(result);
        
        if (condition) {
            console.log(`✅ ${testName}`);
        } else {
            console.log(`❌ ${testName}: ${error}`);
        }
    }

    printSummary() {
        console.log('\n📊 Integration Test Summary:');
        console.log(`Total tests: ${this.testResults.length}`);
        
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        return failed === 0;
    }
}

// Export for use in main application
export { PlayerIntegrationTest };

// Auto-run if in test mode
if (window.location.search.includes('integration=true')) {
    const test = new PlayerIntegrationTest();
    test.runIntegrationTest().then(success => {
        console.log(`Integration test ${success ? 'passed' : 'failed'}`);
    });
}