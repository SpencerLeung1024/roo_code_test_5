/**
 * Property Transaction System Test
 * Tests the complete property buying and selling mechanics
 */

import { GameEngine } from './engine/GameEngine.js';
import { PropertyTransactionService } from './services/PropertyTransactionService.js';
import { LandingEventService } from './services/LandingEventService.js';
import { PropertyModal } from './ui/PropertyModal.js';

/**
 * Test the property transaction system
 */
class PropertyTransactionTest {
    constructor() {
        this.gameEngine = null;
        this.testResults = [];
    }

    async runTests() {
        console.log('🧪 Starting Property Transaction Tests...');
        
        await this.setupTestEnvironment();
        
        // Run individual tests
        await this.testPropertyPurchase();
        await this.testPropertyMortgage();
        await this.testPropertyUnmortgage();
        await this.testRentPayment();
        await this.testBankruptcy();
        
        this.displayResults();
    }

    async setupTestEnvironment() {
        console.log('📋 Setting up test environment...');
        
        this.gameEngine = new GameEngine();
        await this.gameEngine.init();
        
        // Create test players
        const testConfig = {
            players: [
                { name: 'Alice', token: 'hat' },
                { name: 'Bob', token: 'car' }
            ]
        };
        
        await this.gameEngine.startNewGame(testConfig);
        
        console.log('✅ Test environment ready');
    }

    async testPropertyPurchase() {
        console.log('🧪 Testing property purchase...');
        
        const player = this.gameEngine.getCurrentPlayer();
        const board = this.gameEngine.getBoard();
        const mediterranean = board.getSquare(1); // Mediterranean Avenue
        
        const result = this.gameEngine.propertyService.purchaseProperty(player, mediterranean.data);
        
        if (result.success) {
            this.testResults.push({ test: 'Property Purchase', status: 'PASS', details: `Purchased ${mediterranean.data.name} for $${mediterranean.data.price}` });
        } else {
            this.testResults.push({ test: 'Property Purchase', status: 'FAIL', details: result.reason });
        }
    }

    async testPropertyMortgage() {
        console.log('🧪 Testing property mortgage...');
        
        const player = this.gameEngine.getCurrentPlayer();
        const property = player.properties[0];
        
        if (property) {
            const result = this.gameEngine.propertyService.mortgageProperty(player, property);
            
            if (result.success) {
                this.testResults.push({ test: 'Property Mortgage', status: 'PASS', details: `Mortgaged ${property.name} for $${result.mortgageValue}` });
            } else {
                this.testResults.push({ test: 'Property Mortgage', status: 'FAIL', details: result.reason });
            }
        } else {
            this.testResults.push({ test: 'Property Mortgage', status: 'FAIL', details: 'No properties to mortgage' });
        }
    }

    async testPropertyUnmortgage() {
        console.log('🧪 Testing property unmortgage...');
        
        const player = this.gameEngine.getCurrentPlayer();
        const mortgagedProperty = player.properties.find(p => p.isMortgaged);
        
        if (mortgagedProperty) {
            const result = this.gameEngine.propertyService.unmortgageProperty(player, mortgagedProperty);
            
            if (result.success) {
                this.testResults.push({ test: 'Property Unmortgage', status: 'PASS', details: `Unmortgaged ${mortgagedProperty.name} for $${result.unmortgageCost}` });
            } else {
                this.testResults.push({ test: 'Property Unmortgage', status: 'FAIL', details: result.reason });
            }
        } else {
            this.testResults.push({ test: 'Property Unmortgage', status: 'FAIL', details: 'No mortgaged properties' });
        }
    }

    async testRentPayment() {
        console.log('🧪 Testing rent payment...');
        
        // Setup: Alice owns Mediterranean, Bob lands on it
        const alice = this.gameEngine.players[0];
        const bob = this.gameEngine.players[1];
        
        // Ensure Alice owns Mediterranean
        const mediterranean = this.gameEngine.getBoard().getSquare(1);
        mediterranean.data.setOwner(alice);
        alice.addProperty(mediterranean.data);
        
        // Move Bob to Mediterranean
        bob.position = 1;
        
        // Test rent calculation
        const rent = mediterranean.data.getCurrentRent();
        const aliceInitialMoney = alice.money;
        const bobInitialMoney = bob.money;
        
        // Simulate rent payment
        if (bob.canAfford(rent)) {
            bob.transferMoney(alice, rent, `Rent for ${mediterranean.data.name}`);
            
            if (alice.money === aliceInitialMoney + rent && bob.money === bobInitialMoney - rent) {
                this.testResults.push({ test: 'Rent Payment', status: 'PASS', details: `Bob paid $${rent} rent to Alice` });
            } else {
                this.testResults.push({ test: 'Rent Payment', status: 'FAIL', details: 'Money transfer failed' });
            }
        } else {
            this.testResults.push({ test: 'Rent Payment', status: 'FAIL', details: 'Bob cannot afford rent' });
        }
    }

    async testBankruptcy() {
        console.log('🧪 Testing bankruptcy...');
        
        const player = this.gameEngine.players[0];
        const creditor = this.gameEngine.players[1];
        
        // Give player a property and set them up for bankruptcy
        const property = this.gameEngine.getBoard().getSquare(3); // Baltic Avenue
        property.data.setOwner(player);
        player.addProperty(property.data);
        
        // Set player money to 0
        player.money = 0;
        
        // Test bankruptcy handling
        const amountOwed = 1000;
        
        if (!player.canAfford(amountOwed)) {
            player.declareBankrupt(creditor);
            
            if (player.isBankrupt && property.data.owner === creditor) {
                this.testResults.push({ test: 'Bankruptcy', status: 'PASS', details: 'Player declared bankruptcy and property transferred' });
            } else {
                this.testResults.push({ test: 'Bankruptcy', status: 'FAIL', details: 'Bankruptcy handling failed' });
            }
        } else {
            this.testResults.push({ test: 'Bankruptcy', status: 'FAIL', details: 'Player can afford the debt' });
        }
    }

    displayResults() {
        console.log('\n📊 Test Results:');
        console.log('================');
        
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const total = this.testResults.length;
        
        console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
    }
}

// Run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    window.runPropertyTests = async () => {
        const test = new PropertyTransactionTest();
        await test.runTests();
    };
}

export { PropertyTransactionTest };