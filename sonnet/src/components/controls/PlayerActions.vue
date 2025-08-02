<template>
  <div class="player-actions">
    <div class="actions-header">
      <h4>Available Actions</h4>
      <div class="space-context" v-if="currentSpace">
        <span class="space-name">{{ currentSpace.name }}</span>
      </div>
    </div>

    <div class="actions-content">
      <!-- Property Purchase Actions -->
      <div v-if="canPurchaseProperty" class="action-group purchase-group">
        <div class="action-card primary">
          <div class="action-header">
            <span class="action-icon">🏠</span>
            <span class="action-title">Purchase Property</span>
          </div>
          <div class="action-details">
            <div class="purchase-info">
              <div class="price">Price: ${{ propertyPrice.toLocaleString() }}</div>
              <div class="rent-info">Base Rent: ${{ baseRent }}</div>
            </div>
            <div class="action-buttons">
              <button 
                @click="purchaseProperty"
                :disabled="!canAffordProperty"
                class="btn primary"
              >
                {{ canAffordProperty ? 'Buy Property' : 'Cannot Afford' }}
              </button>
              <button 
                v-if="gameOptions.auctionUnbought"
                @click="declineProperty"
                class="btn secondary"
              >
                Decline (Auction)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rent Payment Actions -->
      <div v-if="mustPayRent" class="action-group rent-group">
        <div class="action-card warning">
          <div class="action-header">
            <span class="action-icon">💸</span>
            <span class="action-title">Pay Rent</span>
          </div>
          <div class="action-details">
            <div class="rent-details">
              <div class="rent-amount">Amount: ${{ rentAmount.toLocaleString() }}</div>
              <div class="property-owner">To: {{ propertyOwner?.name }}</div>
              <div v-if="currentSpace.type === 'utility'" class="utility-calculation">
                Calculation: {{ utilityMultiplier }}× dice roll ({{ lastDiceRoll }})
              </div>
            </div>
            <div class="action-buttons">
              <button 
                @click="payRent"
                :disabled="!canAffordRent"
                class="btn warning"
              >
                {{ canAffordRent ? 'Pay Rent' : 'Cannot Afford - Bankrupt!' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tax Payment Actions -->
      <div v-if="mustPayTax" class="action-group tax-group">
        <div class="action-card warning">
          <div class="action-header">
            <span class="action-icon">💰</span>
            <span class="action-title">Pay Tax</span>
          </div>
          <div class="action-details">
            <div class="tax-details">
              <div class="tax-amount">Amount: ${{ taxAmount.toLocaleString() }}</div>
              <div class="tax-type">{{ currentSpace.name }}</div>
            </div>
            <div class="action-buttons">
              <button 
                @click="payTax"
                :disabled="!canAffordTax"
                class="btn warning"
              >
                {{ canAffordTax ? 'Pay Tax' : 'Cannot Afford - Bankrupt!' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Actions -->
      <div v-if="mustDrawCard" class="action-group card-group">
        <div class="action-card info">
          <div class="action-header">
            <span class="action-icon">🎴</span>
            <span class="action-title">Draw Card</span>
          </div>
          <div class="action-details">
            <div class="card-info">
              <div class="card-type">{{ cardTypeDisplay }}</div>
            </div>
            <div class="action-buttons">
              <button @click="drawCard" class="btn info">
                Draw {{ cardTypeDisplay }} Card
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Property Management Actions -->
      <div v-if="canManageProperties" class="action-group management-group">
        <div class="action-card secondary">
          <div class="action-header">
            <span class="action-icon">🏗️</span>
            <span class="action-title">Property Management</span>
          </div>
          <div class="action-details">
            <div class="management-options">
              <button 
                v-if="canBuildHouses"
                @click="openBuildDialog"
                class="btn secondary small"
              >
                Build Houses
              </button>
              <button 
                v-if="canBuildHotels"
                @click="openHotelDialog"
                class="btn secondary small"
              >
                Build Hotels
              </button>
              <button 
                v-if="canMortgageProperties"
                @click="openMortgageDialog"
                class="btn secondary small"
              >
                Mortgage Properties
              </button>
              <button 
                v-if="canUnmortgageProperties"
                @click="openUnmortgageDialog"
                class="btn secondary small"
              >
                Unmortgage Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trading Actions -->
      <div v-if="canTrade" class="action-group trade-group">
        <div class="action-card secondary">
          <div class="action-header">
            <span class="action-icon">🤝</span>
            <span class="action-title">Trading</span>
          </div>
          <div class="action-details">
            <div class="trade-options">
              <select v-model="selectedTradePartner" class="trade-partner-select">
                <option value="">Select trading partner...</option>
                <option 
                  v-for="otherPlayer in availableTradePartners"
                  :key="otherPlayer.id"
                  :value="otherPlayer.id"
                >
                  {{ otherPlayer.name }}
                </option>
              </select>
              <button 
                @click="initiateTrade"
                :disabled="!selectedTradePartner"
                class="btn secondary"
              >
                Start Trade
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Special Space Actions -->
      <div v-if="hasSpecialAction" class="action-group special-group">
        <div class="action-card info">
          <div class="action-header">
            <span class="action-icon">⭐</span>
            <span class="action-title">{{ specialActionTitle }}</span>
          </div>
          <div class="action-details">
            <div class="special-info">
              <div class="special-description">{{ specialActionDescription }}</div>
            </div>
            <div class="action-buttons">
              <button @click="executeSpecialAction" class="btn info">
                {{ specialActionButton }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Actions Available -->
      <div v-if="!hasAnyActions" class="action-group no-actions">
        <div class="action-card neutral">
          <div class="action-header">
            <span class="action-icon">✅</span>
            <span class="action-title">Turn Complete</span>
          </div>
          <div class="action-details">
            <div class="complete-info">
              <div class="complete-message">No actions required.</div>
            </div>
            <div class="action-buttons">
              <button 
                v-if="canEndTurn"
                @click="$emit('action', { type: 'end-turn' })"
                class="btn primary"
              >
                End Turn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action History -->
    <div v-if="showActionHistory && recentActions.length > 0" class="action-history">
      <div class="history-header">
        <h5>Recent Actions</h5>
      </div>
      <div class="history-items">
        <div 
          v-for="action in recentActions"
          :key="action.id"
          class="history-item"
        >
          <span class="history-icon">{{ action.icon }}</span>
          <span class="history-text">{{ action.text }}</span>
          <span class="history-time">{{ formatTime(action.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'PlayerActions',
  
  props: {
    player: {
      type: Object,
      required: true
    },
    currentSpace: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    canEndTurn: {
      type: Boolean,
      default: false
    },
    gameOptions: {
      type: Object,
      default: () => ({})
    },
    showActionHistory: {
      type: Boolean,
      default: false
    },
    recentActions: {
      type: Array,
      default: () => []
    }
  },

  emits: ['action'],

  setup(props, { emit }) {
    const selectedTradePartner = ref('')

    // Property Analysis
    const currentProperty = computed(() => {
      if (!props.currentSpace) return null
      
      const spaceId = props.currentSpace.id
      return props.gameState.properties?.[spaceId] ||
             props.gameState.railroads?.[spaceId] ||
             props.gameState.utilities?.[spaceId]
    })

    const propertyOwner = computed(() => {
      if (!currentProperty.value?.ownerId) return null
      return props.gameState.players?.find(p => p.id === currentProperty.value.ownerId)
    })

    // Purchase Actions
    const canPurchaseProperty = computed(() => {
      return currentProperty.value && 
             !currentProperty.value.ownerId &&
             ['property', 'railroad', 'utility'].includes(props.currentSpace.type)
    })

    const propertyPrice = computed(() => {
      return currentProperty.value?.price || 0
    })

    const baseRent = computed(() => {
      if (!currentProperty.value) return 0
      
      if (currentProperty.value.rent) {
        return currentProperty.value.rent[0]
      } else if (currentProperty.value.rentSchedule) {
        return currentProperty.value.rentSchedule[0]
      } else if (currentProperty.value.rentMultiplier) {
        return `${currentProperty.value.rentMultiplier}× dice`
      }
      
      return 0
    })

    const canAffordProperty = computed(() => {
      return props.player.money >= propertyPrice.value
    })

    // Rent Actions
    const mustPayRent = computed(() => {
      return currentProperty.value && 
             currentProperty.value.ownerId &&
             currentProperty.value.ownerId !== props.player.id &&
             !currentProperty.value.isMortgaged
    })

    const rentAmount = computed(() => {
      if (!mustPayRent.value) return 0
      
      const property = currentProperty.value
      
      if (property.currentRent !== undefined) {
        return property.currentRent
      }
      
      // For utilities, calculate based on dice roll
      if (props.currentSpace.type === 'utility') {
        return property.rentMultiplier * (props.gameState.dice?.total || 7)
      }
      
      return property.rent?.[0] || property.rentSchedule?.[0] || 0
    })

    const canAffordRent = computed(() => {
      return props.player.money >= rentAmount.value
    })

    const utilityMultiplier = computed(() => {
      return currentProperty.value?.rentMultiplier || 4
    })

    const lastDiceRoll = computed(() => {
      return props.gameState.dice?.total || 0
    })

    // Tax Actions
    const mustPayTax = computed(() => {
      return props.currentSpace.type === 'tax'
    })

    const taxAmount = computed(() => {
      return props.currentSpace.taxAmount || 0
    })

    const canAffordTax = computed(() => {
      return props.player.money >= taxAmount.value
    })

    // Card Actions
    const mustDrawCard = computed(() => {
      return ['chance', 'communityChest'].includes(props.currentSpace.type)
    })

    const cardTypeDisplay = computed(() => {
      if (props.currentSpace.type === 'chance') return 'Chance'
      if (props.currentSpace.type === 'communityChest') return 'Community Chest'
      return ''
    })

    // Property Management
    const canManageProperties = computed(() => {
      return (props.player.properties?.length || 0) > 0 ||
             (props.player.railroads?.length || 0) > 0 ||
             (props.player.utilities?.length || 0) > 0
    })

    const canBuildHouses = computed(() => {
      // Check if player has monopolies that can be developed
      return props.player.properties?.some(propId => {
        const property = props.gameState.properties?.[propId]
        return property?.canDevelop && property.houses < 4 && !property.hasHotel
      })
    })

    const canBuildHotels = computed(() => {
      return props.player.properties?.some(propId => {
        const property = props.gameState.properties?.[propId]
        return property?.canDevelop && property.houses === 4 && !property.hasHotel
      })
    })

    const canMortgageProperties = computed(() => {
      return props.player.properties?.some(propId => {
        const property = props.gameState.properties?.[propId]
        return property && !property.isMortgaged && property.houses === 0 && !property.hasHotel
      })
    })

    const canUnmortgageProperties = computed(() => {
      return props.player.properties?.some(propId => {
        const property = props.gameState.properties?.[propId]
        return property?.isMortgaged
      })
    })

    // Trading
    const canTrade = computed(() => {
      return availableTradePartners.value.length > 0
    })

    const availableTradePartners = computed(() => {
      return props.gameState.players?.filter(p => 
        p.id !== props.player.id && 
        p.isActive && 
        !p.isBankrupt
      ) || []
    })

    // Special Actions
    const hasSpecialAction = computed(() => {
      return props.currentSpace.type === 'special' && props.currentSpace.specialType !== 'freeParking'
    })

    const specialActionTitle = computed(() => {
      const specialTypes = {
        'go': 'Collect Salary',
        'jail': 'Visiting Jail',
        'goToJail': 'Go to Jail'
      }
      return specialTypes[props.currentSpace.specialType] || 'Special Action'
    })

    const specialActionDescription = computed(() => {
      const descriptions = {
        'go': 'Collect $200 for landing on or passing GO',
        'jail': 'Just visiting - no action required',
        'goToJail': 'Go directly to jail. Do not pass GO.'
      }
      return descriptions[props.currentSpace.specialType] || ''
    })

    const specialActionButton = computed(() => {
      const buttons = {
        'go': 'Collect $200',
        'jail': 'Continue',
        'goToJail': 'Go to Jail'
      }
      return buttons[props.currentSpace.specialType] || 'Continue'
    })

    // Overall Action Status
    const hasAnyActions = computed(() => {
      return canPurchaseProperty.value ||
             mustPayRent.value ||
             mustPayTax.value ||
             mustDrawCard.value ||
             hasSpecialAction.value
    })

    // Action Methods
    const purchaseProperty = () => {
      emit('action', {
        type: 'purchase-property',
        propertyId: props.currentSpace.id,
        playerId: props.player.id,
        price: propertyPrice.value
      })
    }

    const declineProperty = () => {
      emit('action', {
        type: 'decline-property',
        propertyId: props.currentSpace.id,
        playerId: props.player.id
      })
    }

    const payRent = () => {
      emit('action', {
        type: 'pay-rent',
        propertyId: props.currentSpace.id,
        payerId: props.player.id,
        receiverId: propertyOwner.value.id,
        amount: rentAmount.value
      })
    }

    const payTax = () => {
      emit('action', {
        type: 'pay-tax',
        playerId: props.player.id,
        amount: taxAmount.value,
        taxType: props.currentSpace.name
      })
    }

    const drawCard = () => {
      emit('action', {
        type: 'draw-card',
        playerId: props.player.id,
        cardType: props.currentSpace.type
      })
    }

    const executeSpecialAction = () => {
      emit('action', {
        type: 'special-action',
        playerId: props.player.id,
        specialType: props.currentSpace.specialType
      })
    }

    const openBuildDialog = () => {
      emit('action', {
        type: 'open-build-dialog',
        playerId: props.player.id,
        buildType: 'houses'
      })
    }

    const openHotelDialog = () => {
      emit('action', {
        type: 'open-build-dialog',
        playerId: props.player.id,
        buildType: 'hotels'
      })
    }

    const openMortgageDialog = () => {
      emit('action', {
        type: 'open-mortgage-dialog',
        playerId: props.player.id,
        actionType: 'mortgage'
      })
    }

    const openUnmortgageDialog = () => {
      emit('action', {
        type: 'open-mortgage-dialog',
        playerId: props.player.id,
        actionType: 'unmortgage'
      })
    }

    const initiateTrade = () => {
      if (selectedTradePartner.value) {
        emit('action', {
          type: 'initiate-trade',
          playerId: props.player.id,
          partnerId: selectedTradePartner.value
        })
      }
    }

    const formatTime = (timestamp) => {
      const now = new Date()
      const time = new Date(timestamp)
      const diff = now - time
      
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      return `${Math.floor(diff / 3600000)}h ago`
    }

    return {
      selectedTradePartner,
      currentProperty,
      propertyOwner,
      canPurchaseProperty,
      propertyPrice,
      baseRent,
      canAffordProperty,
      mustPayRent,
      rentAmount,
      canAffordRent,
      utilityMultiplier,
      lastDiceRoll,
      mustPayTax,
      taxAmount,
      canAffordTax,
      mustDrawCard,
      cardTypeDisplay,
      canManageProperties,
      canBuildHouses,
      canBuildHotels,
      canMortgageProperties,
      canUnmortgageProperties,
      canTrade,
      availableTradePartners,
      hasSpecialAction,
      specialActionTitle,
      specialActionDescription,
      specialActionButton,
      hasAnyActions,
      purchaseProperty,
      declineProperty,
      payRent,
      payTax,
      drawCard,
      executeSpecialAction,
      openBuildDialog,
      openHotelDialog,
      openMortgageDialog,
      openUnmortgageDialog,
      initiateTrade,
      formatTime
    }
  }
}
</script>

<style scoped>
.player-actions {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.actions-header {
  background: #34495e;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.space-context {
  font-size: 0.9rem;
  opacity: 0.9;
}

.space-name {
  font-weight: 500;
}

.actions-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Action Cards */
.action-card {
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.action-card.primary {
  border-color: #27ae60;
  background: linear-gradient(135deg, #d5f4e6 0%, #ffffff 100%);
}

.action-card.warning {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fef5e7 0%, #ffffff 100%);
}

.action-card.info {
  border-color: #3498db;
  background: linear-gradient(135deg, #e8f4fd 0%, #ffffff 100%);
}

.action-card.secondary {
  border-color: #95a5a6;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.action-card.neutral {
  border-color: #bdc3c7;
  background: #f8f9fa;
}

.action-header {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.action-icon {
  font-size: 1.2rem;
}

.action-title {
  font-size: 1rem;
}

.action-details {
  padding: 1rem;
}

/* Purchase Group */
.purchase-info {
  margin-bottom: 1rem;
}

.price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 0.25rem;
}

.rent-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Rent Group */
.rent-details {
  margin-bottom: 1rem;
}

.rent-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 0.25rem;
}

.property-owner {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.utility-calculation {
  color: #7f8c8d;
  font-size: 0.8rem;
  font-style: italic;
}

/* Tax Group */
.tax-details {
  margin-bottom: 1rem;
}

.tax-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 0.25rem;
}

.tax-type {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Management Group */
.management-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
}

/* Trade Group */
.trade-options {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.trade-partner-select {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Special Group */
.special-info {
  margin-bottom: 1rem;
}

.special-description {
  color: #2c3e50;
  font-size: 0.95rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn.primary {
  background: #27ae60;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #229954;
}

.btn.secondary {
  background: #95a5a6;
  color: white;
}

.btn.secondary:hover {
  background: #7f8c8d;
}

.btn.warning {
  background: #f39c12;
  color: white;
}

.btn.warning:hover:not(:disabled) {
  background: #e67e22;
}

.btn.info {
  background: #3498db;
  color: white;
}

.btn.info:hover {
  background: #2980b9;
}

.btn.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Action History */
.action-history {
  border-top: 1px solid #ecf0f1;
  padding: 1rem;
  background: #f8f9fa;
}

.history-header h5 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.85rem;
}

.history-icon {
  font-size: 1rem;
}

.history-text {
  flex: 1;
  color: #2c3e50;
}

.history-time {
  color: #7f8c8d;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .actions-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .management-options {
    grid-template-columns: 1fr;
  }
  
  .trade-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .trade-partner-select {
    min-width: auto;
  }
}
</style>