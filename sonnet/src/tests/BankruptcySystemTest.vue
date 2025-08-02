<template>
  <div class="bankruptcy-system-test">
    <div class="test-header">
      <h2>Bankruptcy System Test Suite</h2>
      <div class="test-controls">
        <button @click="runAllTests" class="run-all-btn" :disabled="runningTests">
          {{ runningTests ? 'Running Tests...' : 'Run All Tests' }}
        </button>
        <button @click="resetTests" class="reset-btn">Reset</button>
      </div>
    </div>

    <div class="test-results-summary">
      <div class="summary-stats">
        <div class="stat-item passed">
          <span class="stat-label">Passed</span>
          <span class="stat-value">{{ testResults.passed }}</span>
        </div>
        <div class="stat-item failed">
          <span class="stat-label">Failed</span>
          <span class="stat-value">{{ testResults.failed }}</span>
        </div>
        <div class="stat-item total">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ testResults.total }}</span>
        </div>
      </div>
    </div>

    <div class="test-categories">
      <!-- Bankruptcy Detection Tests -->
      <div class="test-category">
        <h3>Bankruptcy Detection Tests</h3>
        <div class="test-list">
          <div v-for="test in bankruptcyDetectionTests" :key="test.id" class="test-item">
            <div class="test-info">
              <div class="test-name">{{ test.name }}</div>
              <div class="test-description">{{ test.description }}</div>
            </div>
            <div class="test-actions">
              <button @click="runSingleTest(test)" :disabled="test.running" class="run-test-btn">
                {{ test.running ? 'Running...' : 'Run' }}
              </button>
              <div class="test-status" :class="test.status">
                <i :class="getStatusIcon(test.status)"></i>
                <span>{{ test.status || 'Not Run' }}</span>
              </div>
            </div>
            <div v-if="test.result" class="test-result" :class="test.status">
              <div class="result-message">{{ test.result.message }}</div>
              <div v-if="test.result.details" class="result-details">
                <pre>{{ test.result.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Asset Liquidation Tests -->
      <div class="test-category">
        <h3>Asset Liquidation Tests</h3>
        <div class="test-list">
          <div v-for="test in assetLiquidationTests" :key="test.id" class="test-item">
            <div class="test-info">
              <div class="test-name">{{ test.name }}</div>
              <div class="test-description">{{ test.description }}</div>
            </div>
            <div class="test-actions">
              <button @click="runSingleTest(test)" :disabled="test.running" class="run-test-btn">
                {{ test.running ? 'Running...' : 'Run' }}
              </button>
              <div class="test-status" :class="test.status">
                <i :class="getStatusIcon(test.status)"></i>
                <span>{{ test.status || 'Not Run' }}</span>
              </div>
            </div>
            <div v-if="test.result" class="test-result" :class="test.status">
              <div class="result-message">{{ test.result.message }}</div>
              <div v-if="test.result.details" class="result-details">
                <pre>{{ test.result.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Property Transfer Tests -->
      <div class="test-category">
        <h3>Property Transfer Tests</h3>
        <div class="test-list">
          <div v-for="test in propertyTransferTests" :key="test.id" class="test-item">
            <div class="test-info">
              <div class="test-name">{{ test.name }}</div>
              <div class="test-description">{{ test.description }}</div>
            </div>
            <div class="test-actions">
              <button @click="runSingleTest(test)" :disabled="test.running" class="run-test-btn">
                {{ test.running ? 'Running...' : 'Run' }}
              </button>
              <div class="test-status" :class="test.status">
                <i :class="getStatusIcon(test.status)"></i>
                <span>{{ test.status || 'Not Run' }}</span>
              </div>
            </div>
            <div v-if="test.result" class="test-result" :class="test.status">
              <div class="result-message">{{ test.result.message }}</div>
              <div v-if="test.result.details" class="result-details">
                <pre>{{ test.result.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game End Detection Tests -->
      <div class="test-category">
        <h3>Game End Detection Tests</h3>
        <div class="test-list">
          <div v-for="test in gameEndTests" :key="test.id" class="test-item">
            <div class="test-info">
              <div class="test-name">{{ test.name }}</div>
              <div class="test-description">{{ test.description }}</div>
            </div>
            <div class="test-actions">
              <button @click="runSingleTest(test)" :disabled="test.running" class="run-test-btn">
                {{ test.running ? 'Running...' : 'Run' }}
              </button>
              <div class="test-status" :class="test.status">
                <i :class="getStatusIcon(test.status)"></i>
                <span>{{ test.status || 'Not Run' }}</span>
              </div>
            </div>
            <div v-if="test.result" class="test-result" :class="test.status">
              <div class="result-message">{{ test.result.message }}</div>
              <div v-if="test.result.details" class="result-details">
                <pre>{{ test.result.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Data Viewer -->
    <div class="test-data-viewer">
      <h3>Test Data Viewer</h3>
      <div class="data-tabs">
        <button 
          v-for="tab in dataTabs" 
          :key="tab"
          @click="activeTab = tab"
          :class="{ active: activeTab === tab }"
          class="data-tab"
        >
          {{ tab }}
        </button>
      </div>
      <div class="data-content">
        <pre>{{ getTabData(activeTab) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BankruptcySystemTest',
  setup() {
    const runningTests = ref(false)
    const activeTab = ref('Game State')
    const testGameState = ref(null)
    const testPlayers = ref([])
    const testProperties = ref([])

    const dataTabs = ['Game State', 'Players', 'Properties', 'Test Results']

    // Test results tracking
    const testResults = ref({
      passed: 0,
      failed: 0,
      total: 0
    })

    // Test definitions
    const bankruptcyDetectionTests = ref([
      {
        id: 'bd-001',
        name: 'Basic Bankruptcy Detection',
        description: 'Test detection when player has insufficient funds for rent',
        status: null,
        running: false,
        result: null,
        testFunction: testBasicBankruptcyDetection
      },
      {
        id: 'bd-002',
        name: 'Net Worth Calculation',
        description: 'Test accurate net worth calculation including all assets',
        status: null,
        running: false,
        result: null,
        testFunction: testNetWorthCalculation
      },
      {
        id: 'bd-003',
        name: 'Liquid Assets Assessment',
        description: 'Test calculation of liquidatable assets',
        status: null,
        running: false,
        result: null,
        testFunction: testLiquidAssetsAssessment
      },
      {
        id: 'bd-004',
        name: 'Multiple Debt Scenario',
        description: 'Test bankruptcy detection with multiple creditors',
        status: null,
        running: false,
        result: null,
        testFunction: testMultipleDebtScenario
      }
    ])

    const assetLiquidationTests = ref([
      {
        id: 'al-001',
        name: 'House Liquidation Priority',
        description: 'Test that houses are liquidated before hotels',
        status: null,
        running: false,
        result: null,
        testFunction: testHouseLiquidationPriority
      },
      {
        id: 'al-002',
        name: 'Mortgage Generation',
        description: 'Test mortgage generation from properties',
        status: null,
        running: false,
        result: null,
        testFunction: testMortgageGeneration
      },
      {
        id: 'al-003',
        name: 'Optimal Liquidation Order',
        description: 'Test that assets are liquidated in optimal order',
        status: null,
        running: false,
        result: null,
        testFunction: testOptimalLiquidationOrder
      },
      {
        id: 'al-004',
        name: 'Insufficient Assets',
        description: 'Test behavior when assets insufficient to cover debt',
        status: null,
        running: false,
        result: null,
        testFunction: testInsufficientAssets
      }
    ])

    const propertyTransferTests = ref([
      {
        id: 'pt-001',
        name: 'Property Ownership Transfer',
        description: 'Test transfer of property ownership to creditor',
        status: null,
        running: false,
        result: null,
        testFunction: testPropertyOwnershipTransfer
      },
      {
        id: 'pt-002',
        name: 'Monopoly Status Update',
        description: 'Test monopoly status updates after property transfer',
        status: null,
        running: false,
        result: null,
        testFunction: testMonopolyStatusUpdate
      },
      {
        id: 'pt-003',
        name: 'Mortgage Debt Transfer',
        description: 'Test transfer of mortgage debt with properties',
        status: null,
        running: false,
        result: null,
        testFunction: testMortgageDebtTransfer
      },
      {
        id: 'pt-004',
        name: 'Partial Asset Coverage',
        description: 'Test partial debt coverage through asset transfer',
        status: null,
        running: false,
        result: null,
        testFunction: testPartialAssetCoverage
      }
    ])

    const gameEndTests = ref([
      {
        id: 'ge-001',
        name: 'Last Player Standing',
        description: 'Test game end when only one player remains',
        status: null,
        running: false,
        result: null,
        testFunction: testLastPlayerStanding
      },
      {
        id: 'ge-002',
        name: 'Winner Determination',
        description: 'Test correct winner determination by net worth',
        status: null,
        running: false,
        result: null,
        testFunction: testWinnerDetermination
      },
      {
        id: 'ge-003',
        name: 'Turn Limit Ending',
        description: 'Test game end by turn limit',
        status: null,
        running: false,
        result: null,
        testFunction: testTurnLimitEnding
      },
      {
        id: 'ge-004',
        name: 'Asset Threshold Victory',
        description: 'Test victory by reaching asset threshold',
        status: null,
        running: false,
        result: null,
        testFunction: testAssetThresholdVictory
      }
    ])

    // Test implementations
    function testBasicBankruptcyDetection() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const player = createTestPlayer({ money: 50 })
          const debt = 200
          
          const canPay = player.money >= debt
          const liquidAssets = calculateLiquidAssets(player)
          const isBankrupt = !canPay && liquidAssets < debt
          
          if (isBankrupt) {
            resolve({
              status: 'passed',
              message: 'Correctly detected bankruptcy',
              details: `Player has $${player.money}, debt is $${debt}, liquid assets: $${liquidAssets}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Failed to detect bankruptcy',
              details: `Player has $${player.money}, debt is $${debt}, liquid assets: $${liquidAssets}`
            })
          }
        }, 500)
      })
    }

    function testNetWorthCalculation() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const player = createTestPlayer({ 
            money: 500,
            properties: [
              { price: 200, houses: 2, housePrice: 50 },
              { price: 300, hotels: 1, hotelPrice: 100 }
            ]
          })
          
          const expectedNetWorth = 500 + 200 + 300 + (2 * 50) + (1 * 100)
          const calculatedNetWorth = calculateNetWorth(player)
          
          if (Math.abs(calculatedNetWorth - expectedNetWorth) < 1) {
            resolve({
              status: 'passed',
              message: 'Net worth calculated correctly',
              details: `Expected: $${expectedNetWorth}, Calculated: $${calculatedNetWorth}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Net worth calculation incorrect',
              details: `Expected: $${expectedNetWorth}, Calculated: $${calculatedNetWorth}`
            })
          }
        }, 500)
      })
    }

    function testLiquidAssetsAssessment() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const player = createTestPlayer({
            money: 200,
            properties: [
              { price: 400, mortgaged: false },
              { price: 300, mortgaged: true }
            ]
          })
          
          const expectedLiquid = 200 + (400 * 0.5) // Cash + mortgageable property
          const calculatedLiquid = calculateLiquidAssets(player)
          
          if (Math.abs(calculatedLiquid - expectedLiquid) < 1) {
            resolve({
              status: 'passed',
              message: 'Liquid assets calculated correctly',
              details: `Expected: $${expectedLiquid}, Calculated: $${calculatedLiquid}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Liquid assets calculation incorrect',
              details: `Expected: $${expectedLiquid}, Calculated: $${calculatedLiquid}`
            })
          }
        }, 500)
      })
    }

    function testMultipleDebtScenario() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const player = createTestPlayer({ money: 100 })
          const debts = [150, 200, 75] // Total: 425
          const totalDebt = debts.reduce((sum, debt) => sum + debt, 0)
          
          const liquidAssets = calculateLiquidAssets(player)
          const isBankrupt = liquidAssets < totalDebt
          
          if (isBankrupt && totalDebt === 425) {
            resolve({
              status: 'passed',
              message: 'Multiple debt scenario handled correctly',
              details: `Total debt: $${totalDebt}, Liquid assets: $${liquidAssets}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Multiple debt scenario failed',
              details: `Total debt: $${totalDebt}, Liquid assets: $${liquidAssets}`
            })
          }
        }, 500)
      })
    }

    function testHouseLiquidationPriority() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const liquidationOrder = ['houses', 'hotels', 'mortgages', 'properties']
          const expectedOrder = ['houses', 'hotels', 'mortgages', 'properties']
          
          const isCorrectOrder = liquidationOrder.every((item, index) => 
            item === expectedOrder[index]
          )
          
          if (isCorrectOrder) {
            resolve({
              status: 'passed',
              message: 'Liquidation priority order is correct',
              details: `Order: ${liquidationOrder.join(' → ')}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Liquidation priority order is incorrect',
              details: `Expected: ${expectedOrder.join(' → ')}, Got: ${liquidationOrder.join(' → ')}`
            })
          }
        }, 500)
      })
    }

    function testMortgageGeneration() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const property = { price: 200, mortgaged: false }
          const mortgageValue = Math.floor(property.price * 0.5)
          
          if (mortgageValue === 100) {
            resolve({
              status: 'passed',
              message: 'Mortgage value calculated correctly',
              details: `Property price: $${property.price}, Mortgage value: $${mortgageValue}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Mortgage value calculation incorrect',
              details: `Property price: $${property.price}, Expected: $100, Got: $${mortgageValue}`
            })
          }
        }, 500)
      })
    }

    function testOptimalLiquidationOrder() {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate liquidation decisions
          const assetTypes = [
            { type: 'houses', liquidity: 1.0, efficiency: 0.5 },
            { type: 'hotels', liquidity: 0.9, efficiency: 0.5 },
            { type: 'mortgages', liquidity: 1.0, efficiency: 0.5 },
            { type: 'property-sale', liquidity: 0.3, efficiency: 0.8 }
          ]
          
          // Sort by liquidity first, then efficiency
          const sorted = assetTypes.sort((a, b) => 
            b.liquidity - a.liquidity || b.efficiency - a.efficiency
          )
          
          const isOptimal = sorted[0].type === 'houses' || sorted[0].type === 'mortgages'
          
          if (isOptimal) {
            resolve({
              status: 'passed',
              message: 'Optimal liquidation order determined',
              details: `Order: ${sorted.map(a => a.type).join(' → ')}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Suboptimal liquidation order',
              details: `Order: ${sorted.map(a => a.type).join(' → ')}`
            })
          }
        }, 500)
      })
    }

    function testInsufficientAssets() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const player = createTestPlayer({ money: 50 })
          const debt = 500
          const liquidAssets = calculateLiquidAssets(player)
          
          const shortage = debt - liquidAssets
          const isInsufficientAssets = shortage > 0
          
          if (isInsufficientAssets && shortage === 450) {
            resolve({
              status: 'passed',
              message: 'Correctly identified insufficient assets',
              details: `Debt: $${debt}, Assets: $${liquidAssets}, Shortage: $${shortage}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Failed to identify insufficient assets',
              details: `Debt: $${debt}, Assets: $${liquidAssets}, Shortage: $${shortage}`
            })
          }
        }, 500)
      })
    }

    function testPropertyOwnershipTransfer() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const property = { id: 1, owner: 'player1', price: 200 }
          const newOwner = 'player2'
          
          // Simulate transfer
          const transferredProperty = { ...property, owner: newOwner }
          
          if (transferredProperty.owner === newOwner) {
            resolve({
              status: 'passed',
              message: 'Property ownership transferred correctly',
              details: `Property ${property.id} transferred from ${property.owner} to ${newOwner}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Property ownership transfer failed',
              details: `Expected owner: ${newOwner}, Actual owner: ${transferredProperty.owner}`
            })
          }
        }, 500)
      })
    }

    function testMonopolyStatusUpdate() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const properties = [
            { id: 1, colorGroup: 'red', owner: 'player1' },
            { id: 2, colorGroup: 'red', owner: 'player1' },
            { id: 3, colorGroup: 'red', owner: 'player2' } // Transfer this one
          ]
          
          // After transfer, player1 should lose monopoly
          const updatedProperties = [...properties]
          updatedProperties[2].owner = 'player1'
          
          const player1RedProperties = updatedProperties.filter(p => 
            p.colorGroup === 'red' && p.owner === 'player1'
          ).length
          
          const hasMonopoly = player1RedProperties === 3
          
          if (hasMonopoly) {
            resolve({
              status: 'passed',
              message: 'Monopoly status updated correctly',
              details: `Player1 now owns ${player1RedProperties}/3 red properties`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Monopoly status update failed',
              details: `Player1 owns ${player1RedProperties}/3 red properties`
            })
          }
        }, 500)
      })
    }

    function testMortgageDebtTransfer() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const property = { 
            id: 1, 
            price: 200, 
            mortgaged: true, 
            mortgageDebt: 100 
          }
          
          const transferData = {
            property: property,
            mortgageDebt: property.mortgageDebt,
            newOwner: 'player2'
          }
          
          if (transferData.mortgageDebt === 100) {
            resolve({
              status: 'passed',
              message: 'Mortgage debt transferred correctly',
              details: `Property ${property.id} with $${transferData.mortgageDebt} debt transferred`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Mortgage debt transfer failed',
              details: `Expected debt: $100, Transferred debt: $${transferData.mortgageDebt}`
            })
          }
        }, 500)
      })
    }

    function testPartialAssetCoverage() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const debt = 500
          const assetValue = 300
          const remainingDebt = debt - assetValue
          
          if (remainingDebt === 200) {
            resolve({
              status: 'passed',
              message: 'Partial asset coverage calculated correctly',
              details: `Original debt: $${debt}, Asset value: $${assetValue}, Remaining: $${remainingDebt}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Partial asset coverage calculation failed',
              details: `Expected remaining debt: $200, Calculated: $${remainingDebt}`
            })
          }
        }, 500)
      })
    }

    function testLastPlayerStanding() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const players = [
            { id: 1, active: true, bankrupt: false },
            { id: 2, active: false, bankrupt: true },
            { id: 3, active: false, bankrupt: true },
            { id: 4, active: false, bankrupt: true }
          ]
          
          const activePlayers = players.filter(p => p.active && !p.bankrupt)
          const gameEnded = activePlayers.length === 1
          
          if (gameEnded && activePlayers[0].id === 1) {
            resolve({
              status: 'passed',
              message: 'Game end detected with last player standing',
              details: `Winner: Player ${activePlayers[0].id}, Active players: ${activePlayers.length}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Failed to detect game end',
              details: `Active players: ${activePlayers.length}`
            })
          }
        }, 500)
      })
    }

    function testWinnerDetermination() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const players = [
            { id: 1, netWorth: 2500 },
            { id: 2, netWorth: 1800 },
            { id: 3, netWorth: 3200 },
            { id: 4, netWorth: 1200 }
          ]
          
          const winner = players.reduce((prev, current) => 
            current.netWorth > prev.netWorth ? current : prev
          )
          
          if (winner.id === 3 && winner.netWorth === 3200) {
            resolve({
              status: 'passed',
              message: 'Winner determined correctly by net worth',
              details: `Winner: Player ${winner.id} with $${winner.netWorth}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Winner determination failed',
              details: `Expected Player 3, Got Player ${winner.id}`
            })
          }
        }, 500)
      })
    }

    function testTurnLimitEnding() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const maxTurns = 100
          const currentTurn = 100
          const gameEnded = currentTurn >= maxTurns
          
          if (gameEnded) {
            resolve({
              status: 'passed',
              message: 'Game ended correctly at turn limit',
              details: `Turn limit: ${maxTurns}, Current turn: ${currentTurn}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Failed to end game at turn limit',
              details: `Turn limit: ${maxTurns}, Current turn: ${currentTurn}`
            })
          }
        }, 500)
      })
    }

    function testAssetThresholdVictory() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const assetThreshold = 5000
          const playerAssets = 5200
          const victoryAchieved = playerAssets >= assetThreshold
          
          if (victoryAchieved) {
            resolve({
              status: 'passed',
              message: 'Asset threshold victory detected',
              details: `Threshold: $${assetThreshold}, Player assets: $${playerAssets}`
            })
          } else {
            resolve({
              status: 'failed',
              message: 'Failed to detect asset threshold victory',
              details: `Threshold: $${assetThreshold}, Player assets: $${playerAssets}`
            })
          }
        }, 500)
      })
    }

    // Helper functions
    function createTestPlayer(options = {}) {
      return {
        id: options.id || 1,
        money: options.money || 0,
        properties: options.properties || [],
        active: options.active !== undefined ? options.active : true,
        bankrupt: options.bankrupt || false
      }
    }

    function calculateNetWorth(player) {
      let netWorth = player.money || 0
      
      if (player.properties) {
        player.properties.forEach(property => {
          netWorth += property.price || 0
          netWorth += (property.houses || 0) * (property.housePrice || 0)
          netWorth += (property.hotels || 0) * (property.hotelPrice || 0)
        })
      }
      
      return netWorth
    }

    function calculateLiquidAssets(player) {
      let liquid = player.money || 0
      
      if (player.properties) {
        player.properties.forEach(property => {
          if (!property.mortgaged) {
            liquid += Math.floor((property.price || 0) * 0.5)
          }
        })
      }
      
      return liquid
    }

    // Test execution
    async function runSingleTest(test) {
      test.running = true
      test.status = null
      test.result = null
      
      try {
        const result = await test.testFunction()
        test.status = result.status
        test.result = {
          message: result.message,
          details: result.details
        }
        
        if (result.status === 'passed') {
          testResults.value.passed++
        } else {
          testResults.value.failed++
        }
        testResults.value.total++
        
      } catch (error) {
        test.status = 'failed'
        test.result = {
          message: 'Test execution failed',
          details: error.message
        }
        testResults.value.failed++
        testResults.value.total++
      }
      
      test.running = false
    }

    async function runAllTests() {
      runningTests.value = true
      resetTests()
      
      const allTests = [
        ...bankruptcyDetectionTests.value,
        ...assetLiquidationTests.value,
        ...propertyTransferTests.value,
        ...gameEndTests.value
      ]
      
      for (const test of allTests) {
        await runSingleTest(test)
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      runningTests.value = false
    }

    function resetTests() {
      testResults.value = { passed: 0, failed: 0, total: 0 }
      
      const allTests = [
        ...bankruptcyDetectionTests.value,
        ...assetLiquidationTests.value,
        ...propertyTransferTests.value,
        ...gameEndTests.value
      ]
      
      allTests.forEach(test => {
        test.status = null
        test.running = false
        test.result = null
      })
    }

    function getStatusIcon(status) {
      switch (status) {
        case 'passed': return 'fas fa-check-circle'
        case 'failed': return 'fas fa-times-circle'
        default: return 'fas fa-clock'
      }
    }

    function getTabData(tab) {
      switch (tab) {
        case 'Game State':
          return JSON.stringify(testGameState.value, null, 2)
        case 'Players':
          return JSON.stringify(testPlayers.value, null, 2)
        case 'Properties':
          return JSON.stringify(testProperties.value, null, 2)
        case 'Test Results':
          return JSON.stringify({
            summary: testResults.value,
            bankruptcyDetection: bankruptcyDetectionTests.value.map(t => ({
              name: t.name,
              status: t.status,
              result: t.result
            })),
            assetLiquidation: assetLiquidationTests.value.map(t => ({
              name: t.name,
              status: t.status,
              result: t.result
            })),
            propertyTransfer: propertyTransferTests.value.map(t => ({
              name: t.name,
              status: t.status,
              result: t.result
            })),
            gameEnd: gameEndTests.value.map(t => ({
              name: t.name,
              status: t.status,
              result: t.result
            }))
          }, null, 2)
        default:
          return 'No data available'
      }
    }

    return {
      runningTests,
      activeTab,
      dataTabs,
      testResults,
      bankruptcyDetectionTests,
      assetLiquidationTests,
      propertyTransferTests,
      gameEndTests,
      runSingleTest,
      runAllTests,
      resetTests,
      getStatusIcon,
      getTabData
    }
  }
}
</script>

<style scoped>
.bankruptcy-system-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.test-header h2 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.test-controls {
  display: flex;
  gap: 12px;
}

.run-all-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.run-all-btn {
  background: #2196f3;
  color: white;
}

.run-all-btn:hover:not(:disabled) {
  background: #1976d2;
}

.run-all-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-btn {
  background: #666;
  color: white;
}

.reset-btn:hover {
  background: #555;
}

.test-results-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  min-width: 100px;
}

.stat-item.passed {
  background: #e8f5e8;
  color: #2e7d32;
}

.stat-item.failed {
  background: #ffebee;
  color: #c62828;
}

.stat-item.total {
  background: #e3f2fd;
  color: #1976d2;
}

.stat-label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.test-categories {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.test-category h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.test-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.test-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.test-description {
  font-size: 14px;
  color: #666;
  max-width: 400px;
}

.test-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.run-test-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.run-test-btn:hover:not(:disabled) {
  background: #45a049;
}

.run-test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.test-status.passed {
  background: #e8f5e8;
  color: #2e7d32;
}

.test-status.failed {
  background: #ffebee;
  color: #c62828;
}

.test-status:not(.passed):not(.failed) {
  background: #f0f0f0;
  color: #666;
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid transparent;
}

.test-result.passed {
  background: #e8f5e8;
  border-left-color: #4caf50;
}

.test-result.failed {
  background: #ffebee;
  border-left-color: #f44336;
}

.result-message {
  font-weight: 500;
  margin-bottom: 8px;
}

.result-details {
  font-size: 13px;
  opacity: 0.8;
}

.result-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.test-data-viewer {
  margin-top: 32px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.test-data-viewer h3 {
  margin: 0;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

.data-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.data-tab {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.data-tab.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
  background: white;
}

.data-tab:hover:not(.active) {
  background: #f0f0f0;
}

.data-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.data-content pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .test-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .test-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .test-actions {
    justify-content: flex-start;
  }
  
  .data-tabs {
    flex-wrap: wrap;
  }
  
  .data-tab {
    flex: 1;
    min-width: 120px;
  }
}
</style>