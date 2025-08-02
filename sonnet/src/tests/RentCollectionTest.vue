<template>
  <div class="rent-test-container">
    <h2>🧪 Rent Collection System Test Suite</h2>
    
    <div class="test-controls">
      <button @click="runAllTests" class="test-btn run-all" :disabled="testing">
        {{ testing ? 'Running Tests...' : 'Run All Tests' }}
      </button>
      <button @click="resetTestState" class="test-btn reset">Reset Test State</button>
    </div>

    <div class="test-scenarios">
      <div class="test-category">
        <h3>🏠 Property Rent Tests</h3>
        <div class="test-grid">
          <button @click="testBasicPropertyRent" class="test-btn">Basic Property Rent</button>
          <button @click="testMonopolyRent" class="test-btn">Monopoly Double Rent</button>
          <button @click="testHouseRent" class="test-btn">House Development Rent</button>
          <button @click="testHotelRent" class="test-btn">Hotel Rent</button>
          <button @click="testMortgagedProperty" class="test-btn">Mortgaged Property</button>
        </div>
      </div>

      <div class="test-category">
        <h3>🚂 Railroad & Utility Tests</h3>
        <div class="test-grid">
          <button @click="testSingleRailroad" class="test-btn">Single Railroad</button>
          <button @click="testMultipleRailroads" class="test-btn">Multiple Railroads</button>
          <button @click="testSingleUtility" class="test-btn">Single Utility</button>
          <button @click="testBothUtilities" class="test-btn">Both Utilities</button>
        </div>
      </div>

      <div class="test-category">
        <h3>💰 Payment Scenarios</h3>
        <div class="test-grid">
          <button @click="testSufficientFunds" class="test-btn">Sufficient Funds</button>
          <button @click="testInsufficientFunds" class="test-btn">Insufficient Funds</button>
          <button @click="testAssetLiquidation" class="test-btn">Asset Liquidation</button>
          <button @click="testBankruptcy" class="test-btn">Bankruptcy</button>
        </div>
      </div>

      <div class="test-category">
        <h3>🚫 Rent Exemptions</h3>
        <div class="test-grid">
          <button @click="testOwnProperty" class="test-btn">Own Property</button>
          <button @click="testPlayerInJail" class="test-btn">Player in Jail</button>
          <button @click="testLandOnGO" class="test-btn">Landing on GO</button>
          <button @click="testUnownedProperty" class="test-btn">Unowned Property</button>
        </div>
      </div>
    </div>

    <div class="test-results">
      <h3>📊 Test Results</h3>
      <div class="results-summary">
        <div class="summary-stat">
          <span class="stat-label">Tests Run:</span>
          <span class="stat-value">{{ testsRun }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Passed:</span>
          <span class="stat-value passed">{{ testsPassed }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Failed:</span>
          <span class="stat-value failed">{{ testsFailed }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Success Rate:</span>
          <span class="stat-value">{{ successRate }}%</span>
        </div>
      </div>

      <div class="test-log">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          class="test-result-item"
          :class="{ passed: result.passed, failed: !result.passed }"
        >
          <div class="result-header">
            <span class="result-icon">{{ result.passed ? '✅' : '❌' }}</span>
            <span class="result-name">{{ result.name }}</span>
            <span class="result-time">{{ result.timestamp }}</span>
          </div>
          <div class="result-details" v-if="result.details">
            {{ result.details }}
          </div>
          <div class="result-error" v-if="!result.passed && result.error">
            Error: {{ result.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { createRentCalculator } from '../utils/RentCalculator.js'
import { gameState, gameActions } from '../game/gameState.js'

export default {
  name: 'RentCollectionTest',

  setup() {
    const testing = ref(false)
    const testResults = ref([])
    
    // Computed test statistics
    const testsRun = computed(() => testResults.value.length)
    const testsPassed = computed(() => testResults.value.filter(r => r.passed).length)
    const testsFailed = computed(() => testResults.value.filter(r => !r.passed).length)
    const successRate = computed(() => {
      if (testsRun.value === 0) return 0
      return Math.round((testsPassed.value / testsRun.value) * 100)
    })

    // Test helper functions
    const logTestResult = (name, passed, details = '', error = '') => {
      testResults.value.push({
        name,
        passed,
        details,
        error,
        timestamp: new Date().toLocaleTimeString()
      })
    }

    const setupTestGame = () => {
      // Initialize a test game with 2 players
      gameActions.initializeGame([
        { name: 'Test Player 1', piece: 'car', color: '#e74c3c' },
        { name: 'Test Player 2', piece: 'dog', color: '#3498db' }
      ])

      // Give players some money
      gameState.players[0].money = 1500
      gameState.players[1].money = 1500

      return createRentCalculator(gameState)
    }

    const makePlayerOwnProperty = (playerId, propertyId) => {
      const player = gameState.players.find(p => p.id === playerId)
      if (!player) return false

      // Purchase the property
      const success = gameActions.purchaseProperty(playerId, propertyId)
      return success
    }

    // Individual test functions
    const testBasicPropertyRent = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns Mediterranean Avenue (property 1)
        makePlayerOwnProperty('player_1', 1)
        
        // Player 1 lands on Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const expected = 2 // Base rent for Mediterranean Avenue
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Basic Property Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Rent amount mismatch'
        )
      } catch (error) {
        logTestResult('Basic Property Rent', false, '', error.message)
      }
    }

    const testMonopolyRent = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns both brown properties (monopoly)
        makePlayerOwnProperty('player_1', 1) // Mediterranean
        makePlayerOwnProperty('player_1', 3) // Baltic
        
        // Update monopoly status
        gameActions.updateMonopolyStatus()
        
        // Player 1 lands on Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const expected = 4 // Double rent for monopoly (2 * 2)
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Monopoly Double Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Monopoly rent not doubled'
        )
      } catch (error) {
        logTestResult('Monopoly Double Rent', false, '', error.message)
      }
    }

    const testHouseRent = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns monopoly and builds houses
        makePlayerOwnProperty('player_1', 1)
        makePlayerOwnProperty('player_1', 3)
        gameActions.updateMonopolyStatus()
        
        // Build 2 houses on Mediterranean
        gameActions.buildHouses('player_1', 1, 2)
        
        // Player 1 lands on Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const expected = 30 // Rent with 2 houses
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'House Development Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'House rent calculation incorrect'
        )
      } catch (error) {
        logTestResult('House Development Rent', false, '', error.message)
      }
    }

    const testHotelRent = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns monopoly and builds hotel
        makePlayerOwnProperty('player_1', 1)
        makePlayerOwnProperty('player_1', 3)
        gameActions.updateMonopolyStatus()
        
        // Build 4 houses then hotel on Mediterranean
        gameActions.buildHouses('player_1', 1, 4)
        gameActions.buildHotel('player_1', 1)
        
        // Player 1 lands on Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const expected = 250 // Hotel rent
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Hotel Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Hotel rent calculation incorrect'
        )
      } catch (error) {
        logTestResult('Hotel Rent', false, '', error.message)
      }
    }

    const testMortgagedProperty = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns and mortgages Mediterranean Avenue
        makePlayerOwnProperty('player_1', 1)
        gameActions.mortgageProperty('player_1', 1)
        
        // Player 1 lands on Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const passed = !result.canCollectRent && result.reason === 'Property is mortgaged'
        
        logTestResult(
          'Mortgaged Property',
          passed,
          'Should not collect rent on mortgaged property',
          passed ? '' : 'Mortgaged property still collecting rent'
        )
      } catch (error) {
        logTestResult('Mortgaged Property', false, '', error.message)
      }
    }

    const testSingleRailroad = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns Reading Railroad
        makePlayerOwnProperty('player_1', 5)
        gameActions.updateRailroadRents('player_1')
        
        // Player 1 lands on Reading Railroad
        const result = calculator.calculateRentForSpace(5, 'player_0')
        
        const expected = 25 // Single railroad rent
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Single Railroad Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Single railroad rent incorrect'
        )
      } catch (error) {
        logTestResult('Single Railroad Rent', false, '', error.message)
      }
    }

    const testMultipleRailroads = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns 3 railroads
        makePlayerOwnProperty('player_1', 5)  // Reading
        makePlayerOwnProperty('player_1', 15) // Pennsylvania
        makePlayerOwnProperty('player_1', 25) // B&O
        gameActions.updateRailroadRents('player_1')
        
        // Player 1 lands on Reading Railroad
        const result = calculator.calculateRentForSpace(5, 'player_0')
        
        const expected = 100 // 3 railroads rent
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Multiple Railroads Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Multiple railroad rent incorrect'
        )
      } catch (error) {
        logTestResult('Multiple Railroads Rent', false, '', error.message)
      }
    }

    const testSingleUtility = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns Electric Company
        makePlayerOwnProperty('player_1', 12)
        gameActions.updateUtilityRents('player_1')
        
        // Player 1 lands on Electric Company with dice roll of 6
        const result = calculator.calculateRentForSpace(12, 'player_0', 6)
        
        const expected = 24 // 4 * 6 (single utility)
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Single Utility Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Single utility rent incorrect'
        )
      } catch (error) {
        logTestResult('Single Utility Rent', false, '', error.message)
      }
    }

    const testBothUtilities = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns both utilities
        makePlayerOwnProperty('player_1', 12) // Electric Company
        makePlayerOwnProperty('player_1', 28) // Water Works
        gameActions.updateUtilityRents('player_1')
        
        // Player 1 lands on Electric Company with dice roll of 8
        const result = calculator.calculateRentForSpace(12, 'player_0', 8)
        
        const expected = 80 // 10 * 8 (both utilities)
        const passed = result.canCollectRent && result.rentAmount === expected
        
        logTestResult(
          'Both Utilities Rent',
          passed,
          `Expected: $${expected}, Got: $${result.rentAmount || 0}`,
          passed ? '' : 'Both utilities rent incorrect'
        )
      } catch (error) {
        logTestResult('Both Utilities Rent', false, '', error.message)
      }
    }

    const testSufficientFunds = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player has $1500, property rent is $50
        gameState.players[0].money = 1500
        
        const paymentOptions = calculator.getPaymentOptions('player_0', 50)
        
        const passed = paymentOptions.canPay && !paymentOptions.needsLiquidation
        
        logTestResult(
          'Sufficient Funds Payment',
          passed,
          'Player should be able to pay directly',
          passed ? '' : 'Payment options incorrect for sufficient funds'
        )
      } catch (error) {
        logTestResult('Sufficient Funds Payment', false, '', error.message)
      }
    }

    const testInsufficientFunds = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player has $30, property rent is $50
        gameState.players[0].money = 30
        
        const paymentOptions = calculator.getPaymentOptions('player_0', 50)
        
        const passed = !paymentOptions.canPay || paymentOptions.needsLiquidation
        
        logTestResult(
          'Insufficient Funds Detection',
          passed,
          'Should detect insufficient funds and need liquidation',
          passed ? '' : 'Failed to detect insufficient funds'
        )
      } catch (error) {
        logTestResult('Insufficient Funds Detection', false, '', error.message)
      }
    }

    const testAssetLiquidation = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player has some properties but little cash
        gameState.players[0].money = 10
        makePlayerOwnProperty('player_0', 1) // Mediterranean Avenue
        
        const liquidationOptions = calculator.getLiquidationOptions('player_0')
        
        const passed = liquidationOptions.options.length > 0 && liquidationOptions.totalPotential > 0
        
        logTestResult(
          'Asset Liquidation Options',
          passed,
          `Found ${liquidationOptions.options.length} liquidation options worth $${liquidationOptions.totalPotential}`,
          passed ? '' : 'No liquidation options found'
        )
      } catch (error) {
        logTestResult('Asset Liquidation Options', false, '', error.message)
      }
    }

    const testBankruptcy = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player has no money and no assets
        gameState.players[0].money = 0
        gameState.players[0].properties = []
        gameState.players[0].railroads = []
        gameState.players[0].utilities = []
        
        const paymentOptions = calculator.getPaymentOptions('player_0', 100)
        
        const passed = paymentOptions.isBankrupt
        
        logTestResult(
          'Bankruptcy Detection',
          passed,
          'Should detect bankruptcy when no assets available',
          passed ? '' : 'Failed to detect bankruptcy'
        )
      } catch (error) {
        logTestResult('Bankruptcy Detection', false, '', error.message)
      }
    }

    const testOwnProperty = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player owns Mediterranean Avenue and lands on it
        makePlayerOwnProperty('player_0', 1)
        
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const passed = !result.canCollectRent && result.reason === 'Player owns this property'
        
        logTestResult(
          'Own Property Exemption',
          passed,
          'Should not pay rent on own property',
          passed ? '' : 'Player paying rent on own property'
        )
      } catch (error) {
        logTestResult('Own Property Exemption', false, '', error.message)
      }
    }

    const testPlayerInJail = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player 2 owns Mediterranean, Player 1 is in jail
        makePlayerOwnProperty('player_1', 1)
        gameState.players[0].isInJail = true
        
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const passed = !result.canCollectRent && result.reason === 'Player is in jail'
        
        logTestResult(
          'Player in Jail Exemption',
          passed,
          'Players in jail should not pay rent',
          passed ? '' : 'Player in jail paying rent'
        )
      } catch (error) {
        logTestResult('Player in Jail Exemption', false, '', error.message)
      }
    }

    const testLandOnGO = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player lands on GO space
        const result = calculator.calculateRentForSpace(0, 'player_0')
        
        const passed = !result.canCollectRent && result.reason === 'Not a rentable property'
        
        logTestResult(
          'GO Space Exemption',
          passed,
          'GO space should not collect rent',
          passed ? '' : 'GO space collecting rent'
        )
      } catch (error) {
        logTestResult('GO Space Exemption', false, '', error.message)
      }
    }

    const testUnownedProperty = async () => {
      try {
        const calculator = setupTestGame()
        
        // Player lands on unowned Mediterranean Avenue
        const result = calculator.calculateRentForSpace(1, 'player_0')
        
        const passed = !result.canCollectRent && result.reason === 'Property is unowned'
        
        logTestResult(
          'Unowned Property Exemption',
          passed,
          'Unowned properties should not collect rent',
          passed ? '' : 'Unowned property collecting rent'
        )
      } catch (error) {
        logTestResult('Unowned Property Exemption', false, '', error.message)
      }
    }

    // Test execution functions
    const runAllTests = async () => {
      testing.value = true
      testResults.value = []

      const tests = [
        testBasicPropertyRent,
        testMonopolyRent,
        testHouseRent,
        testHotelRent,
        testMortgagedProperty,
        testSingleRailroad,
        testMultipleRailroads,
        testSingleUtility,
        testBothUtilities,
        testSufficientFunds,
        testInsufficientFunds,
        testAssetLiquidation,
        testBankruptcy,
        testOwnProperty,
        testPlayerInJail,
        testLandOnGO,
        testUnownedProperty
      ]

      for (const test of tests) {
        await test()
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      testing.value = false
    }

    const resetTestState = () => {
      testResults.value = []
    }

    return {
      testing,
      testResults,
      testsRun,
      testsPassed,
      testsFailed,
      successRate,
      runAllTests,
      resetTestState,
      // Individual test functions
      testBasicPropertyRent,
      testMonopolyRent,
      testHouseRent,
      testHotelRent,
      testMortgagedProperty,
      testSingleRailroad,
      testMultipleRailroads,
      testSingleUtility,
      testBothUtilities,
      testSufficientFunds,
      testInsufficientFunds,
      testAssetLiquidation,
      testBankruptcy,
      testOwnProperty,
      testPlayerInJail,
      testLandOnGO,
      testUnownedProperty
    }
  }
}
</script>

<style scoped>
.rent-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.rent-test-container h2 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.test-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 30px;
}

.test-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.run-all {
  background: #27ae60;
  color: white;
  font-size: 16px;
  padding: 12px 24px;
}

.run-all:hover:not(:disabled) {
  background: #229954;
}

.reset {
  background: #95a5a6;
  color: white;
}

.reset:hover {
  background: #7f8c8d;
}

.test-scenarios {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.test-category h3 {
  color: #34495e;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.test-grid .test-btn {
  background: #3498db;
  color: white;
  text-align: left;
}

.test-grid .test-btn:hover {
  background: #2980b9;
}

.test-results {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.test-results h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-stat {
  background: white;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  border: 2px solid #ecf0f1;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.passed {
  color: #27ae60;
}

.stat-value.failed {
  color: #e74c3c;
}

.test-log {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.test-result-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #ecf0f1;
}

.test-result-item.passed {
  border-left-color: #27ae60;
}

.test-result-item.failed {
  border-left-color: #e74c3c;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.result-icon {
  font-size: 16px;
}

.result-name {
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.result-time {
  color: #7f8c8d;
  font-size: 12px;
}

.result-details {
  color: #34495e;
  font-size: 14px;
  margin-left: 24px;
}

.result-error {
  color: #e74c3c;
  font-size: 14px;
  margin-left: 24px;
  font-style: italic;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .test-controls {
    flex-direction: column;
  }

  .test-grid {
    grid-template-columns: 1fr;
  }

  .results-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-header {
    flex-wrap: wrap;
  }

  .result-time {
    width: 100%;
    margin-top: 4px;
  }
}
</style>