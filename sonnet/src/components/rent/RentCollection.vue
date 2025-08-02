<template>
  <div class="rent-collection-overlay" v-if="showRentCollection">
    <div class="rent-collection-modal">
      <div class="rent-header">
        <h3>🏠 Rent Due</h3>
        <div class="property-info">
          <div class="property-name">{{ rentCalculation.propertyName }}</div>
          <div class="property-owner">
            Owned by: <span class="owner-name">{{ rentCalculation.owner?.name }}</span>
          </div>
        </div>
      </div>

      <div class="rent-details">
        <!-- Property Type Indicator -->
        <div class="property-type" :class="rentCalculation.propertyType">
          <span class="type-icon">{{ getPropertyTypeIcon() }}</span>
          <span class="type-name">{{ getPropertyTypeName() }}</span>
        </div>

        <!-- Rent Calculation Breakdown -->
        <div class="rent-breakdown">
          <div class="rent-amount">
            <span class="currency">$</span>
            <span class="amount">{{ rentCalculation.rentAmount }}</span>
          </div>
          <div class="rent-description">{{ rentCalculation.rentDescription }}</div>

          <!-- Property Development Info -->
          <div v-if="rentCalculation.development" class="development-info">
            <div v-if="rentCalculation.development.hasHotel" class="development-item hotel">
              🏨 Hotel
            </div>
            <div v-else-if="rentCalculation.development.houses > 0" class="development-item houses">
              🏠 {{ rentCalculation.development.houses }} House{{ rentCalculation.development.houses > 1 ? 's' : '' }}
            </div>
            <div v-else-if="rentCalculation.development.isMonopoly" class="development-item monopoly">
              👑 Monopoly (Double Rent)
            </div>
          </div>

          <!-- Railroad/Utility Details -->
          <div v-if="rentCalculation.propertyType === 'railroad'" class="special-details">
            <div class="count-info">
              {{ rentCalculation.railroadCount }} Railroad{{ rentCalculation.railroadCount > 1 ? 's' : '' }} Owned
            </div>
            <div class="owned-list">
              {{ rentCalculation.ownedRailroads.join(', ') }}
            </div>
          </div>

          <div v-if="rentCalculation.propertyType === 'utility'" class="special-details">
            <div class="utility-calculation">
              {{ rentCalculation.multiplier }}× (dice roll {{ rentCalculation.diceRoll }})
            </div>
            <div class="count-info">
              {{ rentCalculation.utilityCount }} Utilit{{ rentCalculation.utilityCount > 1 ? 'ies' : 'y' }} Owned
            </div>
            <div class="owned-list">
              {{ rentCalculation.ownedUtilities.join(', ') }}
            </div>
          </div>
        </div>

        <!-- Player Payment Status -->
        <div class="payment-status">
          <div class="player-info">
            <div class="player-name">{{ currentPlayer?.name }}</div>
            <div class="player-money">
              Available: <span class="money-amount">${{ currentPlayer?.money || 0 }}</span>
            </div>
          </div>

          <!-- Payment Options -->
          <div v-if="paymentOptions.canPay && !paymentOptions.needsLiquidation" class="payment-ready">
            <div class="status-indicator success">✅ Can Pay</div>
          </div>

          <div v-else-if="paymentOptions.needsLiquidation && paymentOptions.canPay" class="payment-liquidation">
            <div class="status-indicator warning">⚠️ Needs Asset Sale</div>
            <div class="shortfall-info">
              Short: ${{ paymentOptions.shortfall }}
            </div>
          </div>

          <div v-else class="payment-bankruptcy">
            <div class="status-indicator danger">💀 Bankruptcy Risk</div>
            <div class="shortfall-info">
              Cannot cover: ${{ paymentOptions.shortfall }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="rent-actions">
        <button 
          v-if="paymentOptions.canPay && !paymentOptions.needsLiquidation"
          @click="processDirectPayment"
          class="action-btn pay-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">💰</span>
          Pay Rent (${{ rentCalculation.rentAmount }})
        </button>

        <button 
          v-else-if="paymentOptions.needsLiquidation && paymentOptions.canPay"
          @click="openAssetLiquidation"
          class="action-btn liquidate-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">🏠</span>
          Sell Assets to Pay
        </button>

        <button 
          v-else
          @click="declareBankruptcy"
          class="action-btn bankruptcy-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">💀</span>
          Declare Bankruptcy
        </button>

        <!-- Cancel/Info Button -->
        <button 
          @click="closeRentCollection"
          class="action-btn cancel-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">ℹ️</span>
          View Details
        </button>
      </div>

      <!-- Processing Indicator -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-spinner"></div>
        <div class="processing-text">{{ processingMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createRentCalculator } from '../../utils/RentCalculator.js'
import { gameState, gameActions } from '../../game/gameState.js'

export default {
  name: 'RentCollection',

  props: {
    gameState: {
      type: Object,
      required: true
    }
  },

  emits: [
    'rent-calculated',
    'rent-paid',
    'asset-liquidation-needed',
    'bankruptcy-declared',
    'rent-collection-closed'
  ],

  setup(props, { emit }) {
    const showRentCollection = ref(false)
    const rentCalculation = ref(null)
    const paymentOptions = ref(null)
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const rentCalculator = ref(null)

    // Computed properties
    const currentPlayer = computed(() => {
      if (!rentCalculation.value) return null
      return props.gameState.players.find(p => p.id === rentCalculation.value.landingPlayerId)
    })

    // Initialize rent calculator
    onMounted(() => {
      rentCalculator.value = createRentCalculator(props.gameState)
    })

    // Property type display helpers
    const getPropertyTypeIcon = () => {
      switch (rentCalculation.value?.propertyType) {
        case 'property': return '🏠'
        case 'railroad': return '🚂'
        case 'utility': return '⚡'
        default: return '🏢'
      }
    }

    const getPropertyTypeName = () => {
      switch (rentCalculation.value?.propertyType) {
        case 'property': return rentCalculation.value.colorGroup || 'Property'
        case 'railroad': return 'Railroad'
        case 'utility': return 'Utility'
        default: return 'Property'
      }
    }

    // Main rent collection trigger
    const checkForRentCollection = (spaceId, landingPlayerId, diceRoll = null) => {
      if (!rentCalculator.value) return

      // Calculate rent for the space
      const calculation = rentCalculator.value.calculateRentForSpace(
        spaceId, 
        landingPlayerId, 
        diceRoll || props.gameState.dice?.total || 0
      )

      if (calculation.canCollectRent) {
        // Store additional context
        calculation.landingPlayerId = landingPlayerId
        calculation.spaceId = spaceId
        
        rentCalculation.value = calculation
        
        // Calculate payment options
        paymentOptions.value = rentCalculator.value.getPaymentOptions(
          landingPlayerId,
          calculation.rentAmount
        )

        // Show the rent collection modal
        showRentCollection.value = true

        // Emit event for game state management
        emit('rent-calculated', {
          calculation,
          paymentOptions: paymentOptions.value
        })
      }
    }

    // Payment processing methods
    const processDirectPayment = async () => {
      if (!rentCalculation.value || !currentPlayer.value) return

      isProcessing.value = true
      processingMessage.value = 'Processing payment...'

      try {
        // Execute the payment
        const success = gameActions.payRent(
          rentCalculation.value.landingPlayerId,
          rentCalculation.value.ownerId,
          rentCalculation.value.rentAmount
        )

        if (success) {
          processingMessage.value = 'Payment successful!'
          
          // Record transaction in history
          recordRentTransaction('paid')

          // Emit success event
          emit('rent-paid', {
            payer: currentPlayer.value,
            receiver: rentCalculation.value.owner,
            amount: rentCalculation.value.rentAmount,
            property: rentCalculation.value.propertyName,
            method: 'direct'
          })

          // Close modal after brief delay
          setTimeout(() => {
            closeRentCollection()
          }, 1500)
        } else {
          throw new Error('Payment failed')
        }
      } catch (error) {
        console.error('Rent payment failed:', error)
        processingMessage.value = 'Payment failed!'
        setTimeout(() => {
          isProcessing.value = false
        }, 1500)
      }
    }

    const openAssetLiquidation = () => {
      if (!rentCalculation.value) return

      emit('asset-liquidation-needed', {
        playerId: rentCalculation.value.landingPlayerId,
        requiredAmount: rentCalculation.value.rentAmount,
        shortfall: paymentOptions.value.shortfall,
        liquidationOptions: paymentOptions.value.liquidationOptions,
        rentContext: rentCalculation.value
      })

      // Keep modal open but disable interactions
      isProcessing.value = true
      processingMessage.value = 'Opening asset liquidation...'
    }

    const declareBankruptcy = () => {
      if (!rentCalculation.value || !currentPlayer.value) return

      isProcessing.value = true
      processingMessage.value = 'Processing bankruptcy...'

      emit('bankruptcy-declared', {
        playerId: rentCalculation.value.landingPlayerId,
        player: currentPlayer.value,
        owedTo: rentCalculation.value.owner,
        owedAmount: rentCalculation.value.rentAmount,
        rentContext: rentCalculation.value
      })

      // Record bankruptcy transaction
      recordRentTransaction('bankruptcy')

      setTimeout(() => {
        closeRentCollection()
      }, 2000)
    }

    const closeRentCollection = () => {
      showRentCollection.value = false
      rentCalculation.value = null
      paymentOptions.value = null
      isProcessing.value = false
      processingMessage.value = ''

      emit('rent-collection-closed')
    }

    // Transaction recording
    const recordRentTransaction = (outcome) => {
      if (!rentCalculation.value) return

      const transaction = {
        id: `rent_${Date.now()}`,
        type: 'rent',
        timestamp: new Date(),
        payerId: rentCalculation.value.landingPlayerId,
        payerName: currentPlayer.value?.name,
        receiverId: rentCalculation.value.ownerId,
        receiverName: rentCalculation.value.owner?.name,
        amount: rentCalculation.value.rentAmount,
        propertyId: rentCalculation.value.spaceId,
        propertyName: rentCalculation.value.propertyName,
        propertyType: rentCalculation.value.propertyType,
        rentType: rentCalculation.value.rentType,
        outcome, // 'paid', 'bankruptcy', 'liquidation'
        details: {
          rentDescription: rentCalculation.value.rentDescription,
          development: rentCalculation.value.development,
          paymentMethod: outcome === 'paid' ? 'direct' : outcome
        }
      }

      // Add to game history
      if (!props.gameState.history) {
        props.gameState.history = []
      }
      props.gameState.history.push(transaction)
    }

    // Public methods for external components
    const triggerRentCollection = (spaceId, playerId, diceRoll = null) => {
      checkForRentCollection(spaceId, playerId, diceRoll)
    }

    const handleLiquidationComplete = (success, amountRaised) => {
      if (success && amountRaised >= paymentOptions.value.shortfall) {
        // Proceed with payment after liquidation
        processDirectPayment()
      } else {
        // Liquidation failed or insufficient
        isProcessing.value = false
        if (amountRaised < paymentOptions.value.shortfall) {
          // Still bankruptcy
          declareBankruptcy()
        }
      }
    }

    // Watch for external triggers
    watch(() => props.gameState.animations?.movementInProgress, (inProgress, wasInProgress) => {
      if (wasInProgress && !inProgress) {
        // Movement just completed, check for rent collection
        const currentPlayerIndex = props.gameState.currentPlayerIndex
        const player = props.gameState.players[currentPlayerIndex]
        if (player) {
          // Small delay to ensure position is updated
          setTimeout(() => {
            checkForRentCollection(player.position, player.id)
          }, 500)
        }
      }
    })

    return {
      // Reactive state
      showRentCollection,
      rentCalculation,
      paymentOptions,
      isProcessing,
      processingMessage,
      currentPlayer,

      // Methods
      getPropertyTypeIcon,
      getPropertyTypeName,
      processDirectPayment,
      openAssetLiquidation,
      declareBankruptcy,
      closeRentCollection,
      triggerRentCollection,
      handleLiquidationComplete
    }
  }
}
</script>

<style scoped>
.rent-collection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.rent-collection-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.rent-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  text-align: center;
}

.rent-header h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.property-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.property-owner {
  font-size: 0.9rem;
  opacity: 0.9;
}

.owner-name {
  font-weight: bold;
}

.rent-details {
  padding: 24px;
}

.property-type {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
}

.property-type.property {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.property-type.railroad {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
}

.property-type.utility {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.type-icon {
  font-size: 1.5rem;
}

.rent-breakdown {
  text-align: center;
  margin-bottom: 24px;
}

.rent-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.currency {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
}

.amount {
  font-size: 3rem;
  font-weight: bold;
  color: #27ae60;
}

.rent-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 16px;
}

.development-info {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.development-item {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: bold;
}

.development-item.hotel {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.development-item.houses {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.development-item.monopoly {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.special-details {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.count-info {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.owned-list {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.utility-calculation {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.payment-status {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.money-amount {
  font-weight: bold;
  color: #27ae60;
}

.status-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}

.status-indicator.success {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.status-indicator.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.status-indicator.danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.shortfall-info {
  text-align: center;
  font-weight: bold;
  color: #e74c3c;
}

.rent-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.liquidate-btn {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.liquidate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.bankruptcy-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.bankruptcy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.cancel-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.processing-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.processing-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rent-collection-modal {
    width: 95%;
    margin: 20px;
  }

  .rent-header {
    padding: 16px;
  }

  .rent-header h3 {
    font-size: 1.3rem;
  }

  .rent-details {
    padding: 16px;
  }

  .amount {
    font-size: 2.5rem;
  }

  .currency {
    font-size: 1.5rem;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .property-type {
    padding: 10px;
  }

  .type-icon {
    font-size: 1.3rem;
  }
}
</style>