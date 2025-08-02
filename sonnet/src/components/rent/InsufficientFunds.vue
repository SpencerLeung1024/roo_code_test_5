<template>
  <div class="insufficient-funds-overlay" v-if="showBankruptcy">
    <div class="bankruptcy-modal">
      <div class="bankruptcy-header">
        <h3>💀 Bankruptcy Declaration</h3>
        <div class="bankruptcy-warning">
          Unable to pay required debt
        </div>
      </div>

      <div class="bankruptcy-content">
        <!-- Bankruptcy Summary -->
        <div class="bankruptcy-summary">
          <div class="debt-info">
            <h4>💸 Outstanding Debt</h4>
            <div class="debt-details">
              <div class="debt-item">
                <span class="debt-label">Rent Owed:</span>
                <span class="debt-amount">${{ debtInfo.rentAmount }}</span>
              </div>
              <div class="debt-item">
                <span class="debt-label">To Player:</span>
                <span class="debt-creditor">{{ debtInfo.creditorName }}</span>
              </div>
              <div class="debt-item">
                <span class="debt-label">Property:</span>
                <span class="debt-property">{{ debtInfo.propertyName }}</span>
              </div>
            </div>
          </div>

          <div class="player-status">
            <h4>👤 Player Status</h4>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Current Cash:</span>
                <span class="status-value">${{ playerAssets.cash }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Asset Value:</span>
                <span class="status-value">${{ playerAssets.totalAssetValue }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Total Worth:</span>
                <span class="status-value">${{ playerAssets.totalWorth }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Shortfall:</span>
                <span class="status-value negative">${{ shortfall }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bankruptcy Options -->
        <div class="bankruptcy-options">
          <h4>⚖️ Bankruptcy Options</h4>
          
          <!-- Option 1: Full Bankruptcy -->
          <div class="option-card bankruptcy-option" :class="{ selected: selectedOption === 'full-bankruptcy' }" @click="selectOption('full-bankruptcy')">
            <div class="option-header">
              <span class="option-icon">💀</span>
              <span class="option-title">Full Bankruptcy</span>
            </div>
            <div class="option-description">
              <p>Declare complete bankruptcy and exit the game.</p>
              <ul>
                <li>All properties transfer to {{ debtInfo.creditorName }}</li>
                <li>All houses/hotels return to bank (no refund)</li>
                <li>Player is eliminated from the game</li>
                <li>Debt is considered settled</li>
              </ul>
            </div>
          </div>

          <!-- Option 2: Partial Asset Transfer -->
          <div v-if="playerAssets.totalWorth > 0" class="option-card partial-option" :class="{ selected: selectedOption === 'partial-transfer' }" @click="selectOption('partial-transfer')">
            <div class="option-header">
              <span class="option-icon">⚖️</span>
              <span class="option-title">Asset Transfer Settlement</span>
            </div>
            <div class="option-description">
              <p>Transfer all assets to creditor as partial payment.</p>
              <ul>
                <li>Transfer ${{ playerAssets.totalWorth }} worth of assets</li>
                <li>Remaining debt: ${{ Math.max(0, debtInfo.rentAmount - playerAssets.totalWorth) }}</li>
                <li>Player eliminated but debt partially settled</li>
                <li>Creditor receives all properties and developments</li>
              </ul>
            </div>
          </div>

          <!-- Option 3: Negotiate (if enabled) -->
          <div v-if="allowNegotiation" class="option-card negotiate-option" :class="{ selected: selectedOption === 'negotiate' }" @click="selectOption('negotiate')">
            <div class="option-header">
              <span class="option-icon">🤝</span>
              <span class="option-title">Negotiate Settlement</span>
            </div>
            <div class="option-description">
              <p>Attempt to negotiate terms with {{ debtInfo.creditorName }}.</p>
              <ul>
                <li>Propose alternative payment terms</li>
                <li>Offer future rent discounts</li>
                <li>Creditor can accept or decline</li>
                <li>If declined, must choose another option</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Asset Transfer Preview -->
        <div v-if="selectedOption === 'partial-transfer' && transferableAssets.length > 0" class="asset-transfer-preview">
          <h4>📋 Assets to Transfer</h4>
          <div class="transfer-list">
            <div v-for="asset in transferableAssets" :key="asset.id" class="transfer-item">
              <div class="asset-info">
                <span class="asset-icon">{{ getAssetIcon(asset.type) }}</span>
                <div class="asset-details">
                  <span class="asset-name">{{ asset.name }}</span>
                  <span class="asset-type">{{ getAssetTypeText(asset.type) }}</span>
                </div>
              </div>
              <div class="asset-value">${{ asset.value }}</div>
            </div>
          </div>
          <div class="transfer-summary">
            <div class="summary-row">
              <span>Total Asset Value:</span>
              <span class="summary-value">${{ playerAssets.totalWorth }}</span>
            </div>
            <div class="summary-row">
              <span>Debt Coverage:</span>
              <span class="summary-value">{{ Math.round((playerAssets.totalWorth / debtInfo.rentAmount) * 100) }}%</span>
            </div>
          </div>
        </div>

        <!-- Negotiation Form -->
        <div v-if="selectedOption === 'negotiate'" class="negotiation-form">
          <h4>🤝 Negotiation Proposal</h4>
          <div class="proposal-options">
            <div class="proposal-option">
              <label>
                <input type="radio" v-model="negotiationProposal.type" value="payment-plan" />
                Payment Plan
              </label>
              <div v-if="negotiationProposal.type === 'payment-plan'" class="proposal-details">
                <div class="form-group">
                  <label>Initial Payment:</label>
                  <input type="number" v-model="negotiationProposal.initialPayment" :max="playerAssets.cash" min="0" />
                </div>
                <div class="form-group">
                  <label>Installments:</label>
                  <select v-model="negotiationProposal.installments">
                    <option value="2">2 payments</option>
                    <option value="3">3 payments</option>
                    <option value="4">4 payments</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="proposal-option">
              <label>
                <input type="radio" v-model="negotiationProposal.type" value="future-discount" />
                Future Rent Discount
              </label>
              <div v-if="negotiationProposal.type === 'future-discount'" class="proposal-details">
                <div class="form-group">
                  <label>Immediate Payment:</label>
                  <input type="number" v-model="negotiationProposal.immediatePayment" :max="playerAssets.totalWorth" min="0" />
                </div>
                <div class="form-group">
                  <label>Future Discount:</label>
                  <select v-model="negotiationProposal.discountPercent">
                    <option value="25">25% off future rents</option>
                    <option value="50">50% off future rents</option>
                    <option value="75">75% off future rents</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="proposal-option">
              <label>
                <input type="radio" v-model="negotiationProposal.type" value="property-trade" />
                Property Trade Deal
              </label>
              <div v-if="negotiationProposal.type === 'property-trade'" class="proposal-details">
                <p>Offer specific properties plus cash to settle debt</p>
                <div class="available-properties">
                  <div v-for="property in playerProperties" :key="property.id" class="property-option">
                    <label>
                      <input type="checkbox" v-model="negotiationProposal.selectedProperties" :value="property.id" />
                      {{ property.name }} (${{ property.value }})
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="proposal-message">
            <label>Personal Message (Optional):</label>
            <textarea v-model="negotiationProposal.message" placeholder="Add a personal appeal to improve chances..."></textarea>
          </div>
        </div>

        <!-- Bankruptcy Impact -->
        <div class="bankruptcy-impact">
          <h4>📊 Impact on Game</h4>
          <div class="impact-details">
            <div class="impact-item">
              <span class="impact-icon">👥</span>
              <div class="impact-content">
                <span class="impact-label">Players Remaining:</span>
                <span class="impact-value">{{ remainingPlayers }} of {{ totalPlayers }}</span>
              </div>
            </div>
            <div class="impact-item">
              <span class="impact-icon">🏠</span>
              <div class="impact-content">
                <span class="impact-label">Properties Affected:</span>
                <span class="impact-value">{{ playerProperties.length }} properties</span>
              </div>
            </div>
            <div class="impact-item">
              <span class="impact-icon">🏆</span>
              <div class="impact-content">
                <span class="impact-label">Game Status:</span>
                <span class="impact-value">{{ gameWillEnd ? 'Game will end' : 'Game continues' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bankruptcy-actions">
        <button 
          @click="confirmBankruptcy"
          class="action-btn confirm-btn"
          :disabled="!selectedOption || isProcessing"
        >
          <span class="btn-icon">{{ getConfirmButtonIcon() }}</span>
          {{ getConfirmButtonText() }}
        </button>

        <button 
          v-if="allowCancel"
          @click="cancelBankruptcy"
          class="action-btn cancel-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">❌</span>
          Cancel
        </button>
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-animation">
          <div class="bankruptcy-steps">
            <div class="step" :class="{ active: currentStep >= 1, complete: currentStep > 1 }">
              <span class="step-icon">📋</span>
              <span class="step-text">Processing</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 2, complete: currentStep > 2 }">
              <span class="step-icon">🔄</span>
              <span class="step-text">Transferring</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 3, complete: currentStep > 3 }">
              <span class="step-icon">✅</span>
              <span class="step-text">Complete</span>
            </div>
          </div>
          <div class="processing-text">{{ processingMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { gameActions } from '../../game/gameState.js'
import { PROPERTIES, RAILROADS, UTILITIES } from '../../data/boardData.js'

export default {
  name: 'InsufficientFunds',

  props: {
    playerId: {
      type: String,
      required: true
    },
    debtInfo: {
      type: Object,
      required: true
    },
    playerAssets: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    allowNegotiation: {
      type: Boolean,
      default: false
    },
    allowCancel: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'bankruptcy-confirmed',
    'bankruptcy-cancelled',
    'negotiation-proposed'
  ],

  setup(props, { emit }) {
    const showBankruptcy = ref(true)
    const selectedOption = ref('')
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const currentStep = ref(0)

    const negotiationProposal = reactive({
      type: '',
      initialPayment: 0,
      installments: 2,
      immediatePayment: 0,
      discountPercent: 25,
      selectedProperties: [],
      message: ''
    })

    // Computed properties
    const player = computed(() => {
      return props.gameState.players.find(p => p.id === props.playerId)
    })

    const shortfall = computed(() => {
      return Math.max(0, props.debtInfo.rentAmount - props.playerAssets.totalWorth)
    })

    const transferableAssets = computed(() => {
      const assets = []
      
      // Add properties
      if (player.value?.properties) {
        player.value.properties.forEach(propId => {
          const property = props.gameState.properties[propId]
          const propertyData = PROPERTIES[propId]
          if (property && propertyData) {
            assets.push({
              id: propId,
              name: propertyData.name,
              type: 'property',
              value: propertyData.mortgageValue
            })
          }
        })
      }

      // Add railroads
      if (player.value?.railroads) {
        player.value.railroads.forEach(railId => {
          const railroad = props.gameState.railroads[railId]
          const railroadData = RAILROADS[railId]
          if (railroad && railroadData) {
            assets.push({
              id: railId,
              name: railroadData.name,
              type: 'railroad',
              value: railroadData.mortgageValue
            })
          }
        })
      }

      // Add utilities
      if (player.value?.utilities) {
        player.value.utilities.forEach(utilId => {
          const utility = props.gameState.utilities[utilId]
          const utilityData = UTILITIES[utilId]
          if (utility && utilityData) {
            assets.push({
              id: utilId,
              name: utilityData.name,
              type: 'utility',
              value: utilityData.mortgageValue
            })
          }
        })
      }

      return assets.sort((a, b) => b.value - a.value)
    })

    const playerProperties = computed(() => {
      return transferableAssets.value.filter(asset => asset.type === 'property')
    })

    const remainingPlayers = computed(() => {
      return props.gameState.players.filter(p => p.isActive && !p.isBankrupt).length - 1
    })

    const totalPlayers = computed(() => {
      return props.gameState.players.length
    })

    const gameWillEnd = computed(() => {
      return remainingPlayers.value <= 1
    })

    // Methods
    const getAssetIcon = (type) => {
      switch (type) {
        case 'property': return '🏠'
        case 'railroad': return '🚂'
        case 'utility': return '⚡'
        default: return '🏢'
      }
    }

    const getAssetTypeText = (type) => {
      switch (type) {
        case 'property': return 'Property'
        case 'railroad': return 'Railroad'
        case 'utility': return 'Utility'
        default: return 'Asset'
      }
    }

    const selectOption = (option) => {
      selectedOption.value = option
      
      // Reset negotiation proposal when switching away
      if (option !== 'negotiate') {
        negotiationProposal.type = ''
        negotiationProposal.message = ''
      }
    }

    const getConfirmButtonIcon = () => {
      switch (selectedOption.value) {
        case 'full-bankruptcy': return '💀'
        case 'partial-transfer': return '⚖️'
        case 'negotiate': return '🤝'
        default: return '❓'
      }
    }

    const getConfirmButtonText = () => {
      switch (selectedOption.value) {
        case 'full-bankruptcy': return 'Declare Bankruptcy'
        case 'partial-transfer': return 'Transfer Assets'
        case 'negotiate': return 'Propose Settlement'
        default: return 'Select Option'
      }
    }

    const confirmBankruptcy = async () => {
      if (!selectedOption.value) return

      isProcessing.value = true
      currentStep.value = 1

      try {
        if (selectedOption.value === 'negotiate') {
          await processNegotiation()
        } else {
          await processBankruptcy()
        }
      } catch (error) {
        console.error('Bankruptcy processing error:', error)
        processingMessage.value = 'Processing failed!'
        setTimeout(() => {
          isProcessing.value = false
          currentStep.value = 0
        }, 2000)
      }
    }

    const processNegotiation = async () => {
      processingMessage.value = 'Preparing negotiation proposal...'
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      const proposal = {
        playerId: props.playerId,
        creditorId: props.debtInfo.creditorId,
        originalDebt: props.debtInfo.rentAmount,
        proposalType: negotiationProposal.type,
        terms: { ...negotiationProposal },
        playerAssets: props.playerAssets
      }

      currentStep.value = 2
      processingMessage.value = 'Sending proposal...'
      
      await new Promise(resolve => setTimeout(resolve, 800))

      currentStep.value = 3
      processingMessage.value = 'Proposal sent!'

      emit('negotiation-proposed', proposal)

      setTimeout(() => {
        closeBankruptcy()
      }, 1500)
    }

    const processBankruptcy = async () => {
      processingMessage.value = 'Processing bankruptcy...'
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      currentStep.value = 2
      processingMessage.value = 'Transferring assets...'

      // Execute bankruptcy logic
      if (selectedOption.value === 'full-bankruptcy') {
        await processFullBankruptcy()
      } else if (selectedOption.value === 'partial-transfer') {
        await processPartialTransfer()
      }

      currentStep.value = 3
      processingMessage.value = 'Bankruptcy complete!'

      await new Promise(resolve => setTimeout(resolve, 1500))

      emit('bankruptcy-confirmed', {
        playerId: props.playerId,
        bankruptcyType: selectedOption.value,
        assetTransfer: selectedOption.value === 'partial-transfer',
        creditorId: props.debtInfo.creditorId,
        originalDebt: props.debtInfo.rentAmount,
        assetsTransferred: transferableAssets.value
      })

      closeBankruptcy()
    }

    const processFullBankruptcy = async () => {
      // Mark player as bankrupt
      if (player.value) {
        player.value.isBankrupt = true
        player.value.isActive = false
      }

      // Transfer all properties to creditor
      transferAssetsToCreditor()
      
      // Sell all houses/hotels back to bank (no refund)
      sellDevelopmentsToBank()
    }

    const processPartialTransfer = async () => {
      // Mark player as bankrupt
      if (player.value) {
        player.value.isBankrupt = true
        player.value.isActive = false
      }

      // Transfer assets to creditor
      transferAssetsToCreditor()
      
      // Any developments transfer with properties
    }

    const transferAssetsToCreditor = () => {
      const creditor = props.gameState.players.find(p => p.id === props.debtInfo.creditorId)
      if (!creditor || !player.value) return

      // Transfer properties
      player.value.properties.forEach(propId => {
        const property = props.gameState.properties[propId]
        if (property) {
          property.ownerId = creditor.id
          creditor.properties.push(propId)
        }
      })

      // Transfer railroads
      player.value.railroads.forEach(railId => {
        const railroad = props.gameState.railroads[railId]
        if (railroad) {
          railroad.ownerId = creditor.id
          creditor.railroads.push(railId)
        }
      })

      // Transfer utilities
      player.value.utilities.forEach(utilId => {
        const utility = props.gameState.utilities[utilId]
        if (utility) {
          utility.ownerId = creditor.id
          creditor.utilities.push(utilId)
        }
      })

      // Transfer any remaining cash
      creditor.money += player.value.money
      player.value.money = 0

      // Clear player's portfolio
      player.value.properties = []
      player.value.railroads = []
      player.value.utilities = []

      // Update monopoly status and rents
      gameActions.updateMonopolyStatus()
      gameActions.updateRailroadRents(creditor.id)
      gameActions.updateUtilityRents(creditor.id)
    }

    const sellDevelopmentsToBank = () => {
      // This is only called in full bankruptcy
      // In partial transfer, developments transfer with properties
      if (!player.value) return

      // Return houses and hotels to bank without refund
      props.gameState.bank.houses += player.value.houses
      props.gameState.bank.hotels += player.value.hotels
      
      player.value.houses = 0
      player.value.hotels = 0

      // Reset property development
      player.value.properties.forEach(propId => {
        const property = props.gameState.properties[propId]
        if (property) {
          property.houses = 0
          property.hasHotel = false
          property.currentRent = PROPERTIES[propId]?.rent[0] || 0
        }
      })
    }

    const cancelBankruptcy = () => {
      emit('bankruptcy-cancelled')
      closeBankruptcy()
    }

    const closeBankruptcy = () => {
      showBankruptcy.value = false
      selectedOption.value = ''
      isProcessing.value = false
      processingMessage.value = ''
      currentStep.value = 0
    }

    return {
      // Reactive state
      showBankruptcy,
      selectedOption,
      isProcessing,
      processingMessage,
      currentStep,
      negotiationProposal,

      // Computed
      player,
      shortfall,
      transferableAssets,
      playerProperties,
      remainingPlayers,
      totalPlayers,
      gameWillEnd,

      // Methods
      getAssetIcon,
      getAssetTypeText,
      selectOption,
      getConfirmButtonIcon,
      getConfirmButtonText,
      confirmBankruptcy,
      cancelBankruptcy
    }
  }
}
</script>

<style scoped>
.insufficient-funds-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2400;
  backdrop-filter: blur(8px);
}

.bankruptcy-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  max-width: 900px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  border: 3px solid #e74c3c;
}

.bankruptcy-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 24px;
  border-radius: 16px 16px 0 0;
  text-align: center;
}

.bankruptcy-header h3 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: bold;
}

.bankruptcy-warning {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: bold;
}

.bankruptcy-content {
  padding: 24px;
}

.bankruptcy-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.debt-info h4,
.player-status h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.debt-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.debt-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.debt-item:last-child {
  margin-bottom: 0;
}

.debt-label {
  color: #7f8c8d;
  font-weight: bold;
}

.debt-amount {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1rem;
}

.debt-creditor,
.debt-property {
  color: #2c3e50;
  font-weight: bold;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.status-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: bold;
}

.status-value {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.1rem;
}

.status-value.negative {
  color: #e74c3c;
}

.bankruptcy-options {
  margin-bottom: 32px;
}

.bankruptcy-options h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.option-card {
  border: 3px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.2);
}

.option-card.selected {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(34, 153, 84, 0.05));
}

.bankruptcy-option.selected {
  border-color: #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(192, 57, 43, 0.05));
}

.option-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.option-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.option-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.option-description p {
  margin: 0 0 12px 0;
  color: #34495e;
}

.option-description ul {
  margin: 0;
  padding-left: 20px;
  color: #7f8c8d;
}

.option-description li {
  margin-bottom: 6px;
}

.asset-transfer-preview {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.asset-transfer-preview h4 {
  margin: 0 0 16px 0;
  color: #856404;
}

.transfer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.transfer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-icon {
  font-size: 1.2rem;
}

.asset-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-name {
  font-weight: bold;
  color: #856404;
}

.asset-type {
  font-size: 0.8rem;
  color: #6c757d;
}

.asset-value {
  font-weight: bold;
  color: #27ae60;
}

.transfer-summary {
  border-top: 1px solid #ffc107;
  padding-top: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.summary-value {
  font-weight: bold;
  color: #856404;
}

.negotiation-form {
  background: #e8f5e8;
  border: 2px solid #27ae60;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.negotiation-form h4 {
  margin: 0 0 16px 0;
  color: #155724;
}

.proposal-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.proposal-option label {
  font-weight: bold;
  color: #155724;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.proposal-details {
  margin-left: 24px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.form-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-group label {
  font-weight: normal;
  margin: 0;
}

.form-group input,
.form-group select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 120px;
}

.available-properties {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.property-option label {
  font-weight: normal;
  font-size: 0.9rem;
}

.proposal-message {
  margin-top: 16px;
}

.proposal-message label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #155724;
}

.proposal-message textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.bankruptcy-impact {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.bankruptcy-impact h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.impact-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.impact-icon {
  font-size: 1.5rem;
  min-width: 30px;
  text-align: center;
}

.impact-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.impact-label {
  color: #7f8c8d;
  font-weight: bold;
}

.impact-value {
  color: #2c3e50;
  font-weight: bold;
}

.bankruptcy-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.3);
}

.cancel-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.3rem;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.processing-animation {
  text-align: center;
}

.bankruptcy-steps {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.3;
  transition: all 0.5s ease;
}

.step.active {
  opacity: 1;
  transform: scale(1.1);
}

.step.complete {
  opacity: 1;
  transform: scale(1);
}

.step-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.step.active .step-icon {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  animation: pulse 1s ease-in-out infinite;
}

.step.complete .step-icon {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.step-text {
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
}

.processing-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .bankruptcy-modal {
    width: 98%;
    margin: 10px;
  }

  .bankruptcy-header {
    padding: 20px;
  }

  .bankruptcy-header h3 {
    font-size: 1.6rem;
  }

  .bankruptcy-content {
    padding: 16px;
  }

  .bankruptcy-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .proposal-options {
    gap: 12px;
  }

  .form-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .impact-details {
    gap: 8px;
  }

  .impact-content {
    flex-direction: column;
    gap: 4px;
  }

  .bankruptcy-actions {
    flex-direction: column;
    padding: 16px;
  }

  .action-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }

  .bankruptcy-steps {
    gap: 16px;
  }

  .step-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .step-text {
    font-size: 0.8rem;
  }
}
</style>