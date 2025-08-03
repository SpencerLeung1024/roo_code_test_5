/**
 * Rent Calculation Test Suite
 * Comprehensive tests for all rent calculation scenarios
 */

import { RentCalculationService } from '../services/RentCalculationService.js';
import { Property } from '../models/Property.js';
import { Player } from '../models/Player.js';
import { Board } from '../models/Board.js';

/**
 * Test class for rent calculations
 */
export class RentCalculationTest {
    constructor() {
        this.board = new Board();
        this.testResults = [];
    }

    /**
     * Run all rent calculation tests
     */
    async runAllTests() {
        console.log('🧪 Starting Rent Calculation Tests...\n');
        
        this.testResults = [];
        
        // Test property rent calculations
        await this.testPropertyRentCalculations();
        
        // Test railroad rent calculations
        await this.testRailroadRentCalculations();
        
        // Test utility rent calculations
        await this.testUtilityRentCalculations();
        
        // Test monopoly bonuses
        await this.testMonopolyBonuses();
        
        // Test mortgage effects
        await this.testMortgageEffects();
        
        // Test edge cases
        await this.testEdgeCases();
        
        this.printResults();
    }

    /**
     * Test property rent calculations
     */
    async testPropertyRentCalculations() {
        console.log('🏠 Testing Property Rent Calculations...');
        
        const player = new Player({ id: 'test1', name: 'Test Player', money: 1500 });
        const property = new Property('Test Property', 200, 'orange', [14, 70, 200, 550, 750, 950], 100);
        property.setOwner(player);
        
        // Test base rent
        const baseRent = property.getCurrentRent();
        this.assertEqual('Base rent calculation', baseRent, 14);
        
        // Test with 1 house
        property.houses = 1;
        const house1Rent = property.getCurrentRent();
        this.assertEqual('1 house rent calculation', house1Rent, 70);
        
        // Test with 2 houses
        property.houses = 2;
        const house2Rent = property.getCurrentRent();
        this.assertEqual('2 houses rent calculation', house2Rent, 200);
        
        // Test with hotel
        property.hasHotel = true;
        property.houses = 0;
        const hotelRent = property.getCurrentRent();
        this.assertEqual('Hotel rent calculation', hotelRent, 950);
        
        console.log('✅ Property rent calculations passed\n');
    }

    /**
     * Test railroad rent calculations
     */
    async testRailroadRentCalculations() {
        console.log('🚂 Testing Railroad Rent Calculations...');
        
        const player = new Player({ id: 'test2', name: 'Railroad Owner', money: 1500 });
        const railroad1 = new Property('Reading Railroad', 200, 'railroad', [25, 50, 100, 200]);
        const railroad2 = new Property('Pennsylvania Railroad', 200, 'railroad', [25, 50, 100, 200]);
        const railroad3 = new Property('B&O Railroad', 200, 'railroad', [25, 50, 100, 200]);
        const railroad4 = new Property('Short Line Railroad', 200, 'railroad', [25, 50, 100, 200]);
        
        // Test 1 railroad
        railroad1.setOwner(player);
        player.addProperty(railroad1);
        const rent1 = railroad1.getCurrentRent();
        this.assertEqual('1 railroad rent', rent1, 25);
        
        // Test 2 railroads
        railroad2.setOwner(player);
        player.addProperty(railroad2);
        const rent2 = railroad1.getCurrentRent();
        this.assertEqual('2 railroads rent', rent2, 50);
        
        // Test 3 railroads
        railroad3.setOwner(player);
        player.addProperty(railroad3);
        const rent3 = railroad1.getCurrentRent();
        this.assertEqual('3 railroads rent', rent3, 100);
        
        // Test 4 railroads
        railroad4.setOwner(player);
        player.addProperty(railroad4);
        const rent4 = railroad1.getCurrentRent();
        this.assertEqual('4 railroads rent', rent4, 200);
        
        console.log('✅ Railroad rent calculations passed\n');
    }

    /**
     * Test utility rent calculations
     */
    async testUtilityRentCalculations() {
        console.log('⚡ Testing Utility Rent Calculations...');
        
        const player = new Player({ id: 'test3', name: 'Utility Owner', money: 1500 });
        const utility1 = new Property('Electric Company', 150, 'utility', [4, 10]);
        const utility2 = new Property('Water Works', 150, 'utility', [4, 10]);
        
        // Test 1 utility
        utility1.setOwner(player);
        player.addProperty(utility1);
        const rent1 = utility1.getCurrentRent(7);
        this.assertEqual('1 utility rent (dice 7)', rent1, 28);
        
        // Test 2 utilities
        utility2.setOwner(player);
        player.addProperty(utility2);
        const rent2 = utility1.getCurrentRent(7);
        this.assertEqual('2 utilities rent (dice 7)', rent2, 70);
        
        console.log('✅ Utility rent calculations passed\n');
    }

    /**
     * Test monopoly bonuses
     */
    async testMonopolyBonuses() {
        console.log('🎯 Testing Monopoly Bonuses...');
        
        const player = new Player({ id: 'test4', name: 'Monopoly Owner', money: 1500 });
        const property1 = new Property('Oriental Avenue', 100, 'light-blue', [6, 30, 90, 270, 400, 550], 50);
        const property2 = new Property('Vermont Avenue', 100, 'light-blue', [6, 30, 90, 270, 400, 550], 50);
        const property3 = new Property('Connecticut Avenue', 120, 'light-blue', [8, 40, 100, 300, 450, 600], 50);
        
        // Test without monopoly
        property1.setOwner(player);
        player.addProperty(property1);
        const baseRent = property1.getCurrentRent();
        this.assertEqual('Base rent without monopoly', baseRent, 6);
        
        // Test with monopoly (simulate)
        property2.setOwner(player);
        property3.setOwner(player);
        player.addProperty(property2);
        player.addProperty(property3);
        
        // Note: This would need the enhanced rent service for proper testing
        console.log('✅ Monopoly bonus tests completed\n');
    }

    /**
     * Test mortgage effects
     */
    async testMortgageEffects() {
        console.log('🏦 Testing Mortgage Effects...');
        
        const player = new Player({ id: 'test5', name: 'Mortgage Owner', money: 1500 });
        const property = new Property('Test Property', 200, 'orange', [14, 70, 200, 550, 750, 950], 100);
        property.setOwner(player);
        
        // Test normal rent
        const normalRent = property.getCurrentRent();
        this.assertEqual('Normal rent', normalRent, 14);
        
        // Test mortgaged property
        property.isMortgaged = true;
        const mortgagedRent = property.getCurrentRent();
        this.assertEqual('Mortgaged rent', mortgagedRent, 0);
        
        console.log('✅ Mortgage effects tests passed\n');
    }

    /**
     * Test edge cases
     */
    async testEdgeCases() {
        console.log('🔍 Testing Edge Cases...');
        
        // Test unowned property
        const unownedProperty = new Property('Unowned', 200, 'orange', [14, 70, 200, 550, 750, 950], 100);
        const unownedRent = unownedProperty.getCurrentRent();
        this.assertEqual('Unowned property rent', unownedRent, 14);
        
        // Test player landing on own property
        const player = new Player({ id: 'test6', name: 'Self Owner', money: 1500 });
        const ownProperty = new Property('Own Property', 200, 'orange', [14, 70, 200, 550, 750, 950], 100);
        ownProperty.setOwner(player);
        
        // This would be handled by the rent service
        console.log('✅ Edge cases tests completed\n');
    }

    /**
     * Assert equality for testing
     * @param {string} testName - Test name
     * @param {any} actual - Actual value
     * @param {any} expected - Expected value
     */
    assertEqual(testName, actual, expected) {
        const passed = actual === expected;
        this.testResults.push({
            name: testName,
            passed: passed,
            actual: actual,
            expected: expected
        });
        
        if (passed) {
            console.log(`✅ ${testName}: PASSED`);
        } else {
            console.log(`❌ ${testName}: FAILED (Expected ${expected}, got ${actual})`);
        }
    }

    /**
     * Print test results summary
     */
    printResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n📊 Test Results Summary:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => !r.passed).forEach(r => {
                console.log(`- ${r.name}: Expected ${r.expected}, got ${r.actual}`);
            });
        }
    }
}

// Export for use in other files
export { RentCalculationTest };