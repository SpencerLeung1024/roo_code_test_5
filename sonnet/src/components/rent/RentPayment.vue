<template>
  <div class="rent-payment-overlay" v-if="showPayment">
    <div class="rent-payment-modal">
      <div class="payment-header">
        <h3>💰 Payment Confirmation</h3>
        <div class="payment-summary">
          <div class="property-name">{{ paymentData.propertyName }}</div>
          <div class="payment-amount">${{ paymentData.amount }}</div>
        </div>
      </div>

      <div class="payment-details">
        <!-- Transaction Summary -->
        <div class="transaction-summary">
          <div class="transaction-row">
            <span class="label">From:</span>
            <div class="player-info">
              <span class="player-name">{{ paymentData.payer?.name }}</span>
              <div class="player-money">(${{ paymentData.payer?.money }})</div>
            </div>
          </div>
          
          <div class="payment-arrow">⬇️</div>
          
          <div class="transaction-row">
            <span class="label">To:</span>
            <div class="player-info">
              <span class="player-name">{{ paymentData.receiver?.name }}</span>
              <div class="player-money">(${{ paymentData.receiver?.money }})</div>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-method">
          <h4>Payment Method</h4>
          <div class="method-options">
            <div 
              class="method-option"
              :class="{ active: selectedMethod === 'cash', disabled: !canPayCash }"
              @click="selectPaymentMethod('cash')"
            >
              <div class="method-icon">💵</div>
              <div class="method-info">
                <div class="method-name">Cash Payment</div>
                <div class="method-description">
                  Pay directly from available funds
                </div>
                <div class="method-status" v-if="!canPayCash">
                  Insufficient funds (need ${{ shortfall }})
                </div>
              </div>
            </div>

            <div 
              class="method-option"
              :class="{ active: selectedMethod === 'liquidation', disabled: !canPayWithLiquidation }"
              @click="selectPaymentMethod('liquidation')"
              v-if="needsLiquidation"
            >
              <div class="method-icon">🏠</div>
              <div class="method-info">
                <div class="method-name">Sell Assets</div>
                <div class="method-description">
                  Sell properties/houses to raise funds
                </div>
                <div class="method-status" v-if="!canPayWithLiquidation">
                  Cannot raise enough (${{ totalShortfall }})
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cash Payment Details -->
        <div v-if="selectedMethod === 'cash'" class="payment-breakdown">
          <div class="breakdown-header">Cash Payment Breakdown</div>
          <div class="breakdown-row">
            <span>Current Balance:</span>
            <span class="amount">${{ paymentData.payer?.money }}</span>
          </div>
          <div class="breakdown-row payment-row">
            <span>Payment Amount:</span>
            <span class="amount negative">-${{ paymentData.amount }}</span>
          </div>
          <div class="breakdown-divider"></div>
          <div class="breakdown-row total-row">
            <span>Remaining Balance:</span>
            <span class="amount" :class="{ negative: remainingBalance < 0 }">
              ${{ remainingBalance }}
            </span>
          </div>
        </div>

        <!-- Liquidation Payment Details -->
        <div v-if="selectedMethod === 'liquidation'" class="liquidation-preview">
          <div class="liquidation-header">Assets to Liquidate</div>
          <div class="liquidation-summary">
            <div class="summary-row">
              <span>Cash Available:</span>
              <span class="amount">${{ paymentData.payer?.money }}</span>
            </div>
            <div class="summary-row">
              <span>Amount Needed:</span>
              <span class="amount negative">${{ shortfall }}</span>
            </div>
            <div class="summary-row">
              <span>From Asset Sales:</span>
              <span class="amount positive">${{ Math.min(shortfall, liquidationPotential) }}</span>
            </div>
          </div>
          
          <div class="asset-preview">
            <div class="asset-item" v-for="asset in previewAssets" :key="asset.id">
              <div class="asset-info">
                <span class="asset-name">{{ asset.name }}</span>
                <span class="asset-type">{{ asset.type }}</span>
              </div>
              <div class="asset-value">${{ asset.value }}</div>
            </div>
          </div>
        </div>

        <!-- Payment Confirmation -->
        <div class="payment-confirmation" v-if="selectedMethod">
          <div class="confirmation-text">
            <span v-if="selectedMethod === 'cash'">
              Confirm cash payment of ${{ paymentData.amount }}?
            </span>
            <span v-else-if="selectedMethod === 'liquidation'">
              Proceed to asset liquidation to raise ${{ shortfall }}?
            </span>
          </div>
          
          <div class="confirmation-warning" v-if="remainingBalance < 100 && selectedMethod === 'cash'">
            ⚠️ Warning: This will leave you with very little cash
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="payment-actions">
        <button 
          @click="confirmPayment"
          class="action-btn confirm-btn"
          :disabled="!selectedMethod || isProcessing"
        >
          <span class="btn-icon">✅</span>
          <span v-if="selectedMethod === 'cash'">Confirm Payment</span>
          <span v-else-if="selectedMethod === 'liquidation'">Liquidate Assets</span>
          <span v-else>Select Payment Method</span>
        </button>

        <button 
          @click="cancelPayment"
          class="action-btn cancel-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">❌</span>
          Cancel
        </button>
      </div>

      <!-- Processing Animation -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-animation">
          <div class="money-transfer">
            <div class="money-from">💰</div>
            <div class="transfer-arrow">
              <div class="arrow-line"></div>
              <div class="arrow-head">▶</div>
            </div>
            <div class="money-to">💰</div>
          </div>
          <div class="processing-text">{{ processingMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameActions } from '../../game/gameState.js'

export default {
  name: 'RentPayment',

  props: {
    paymentData: {
      type: Object,
      default: () => null
    },
    liquidationOptions: {
      type: Object,
      default: () => null
    }
  },

  emits: [
    'payment-confirmed',
    'payment-cancelled',
    'liquidation-required',
    'payment-completed'
  ],

  setup(props, { emit }) {
    const showPayment = ref(false)
    const selectedMethod = ref(null)
    const isProcessing = ref(false)
    const processingMessage = ref('')

    // Computed properties
    const canPayCash = computed(() => {
      return props.paymentData?.payer?.money >= props.paymentData?.amount
    })

    const shortfall = computed(() => {
      if (!props.paymentData) return 0
      return Math.max(0, props.paymentData.amount - props.paymentData.payer.money)
    })

    const needsLiquidation = computed(() => {
      return shortfall.value > 0
    })

    const liquidationPotential = computed(() => {
      return props.liquidationOptions?.totalPotential || 0
    })

    const canPayWithLiquidation = computed(() => {
      return liquidationPotential.value >= shortfall.value
    })

    const totalShortfall = computed(() => {
      return shortfall.value - liquidationPotential.value
    })

    const remainingBalance = computed(() => {
      if (!props.paymentData) return 0
      return props.paymentData.payer.money - props.paymentData.amount
    })

    const previewAssets = computed(() => {
      if (!props.liquidationOptions?.options) return []
      
      // Show assets needed to cover shortfall
      let needed = shortfall.value
      const assets = []
      
      for (const option of props.liquidationOptions.options) {
        if (needed <= 0) break
        
        assets.push({
          id: option.propertyId,
          name: option.propertyName,
          type: option.type,
          value: option.value
        })
        
        needed -= option.value
      }
      
      return assets.slice(0, 3) // Show max 3 assets
    })

    // Methods
    const selectPaymentMethod = (method) => {
      if (method === 'cash' && !canPayCash.value) return
      if (method === 'liquidation' && !canPayWithLiquidation.value) return
      
      selectedMethod.value = method
    }

    const confirmPayment = async () => {
      if (!selectedMethod.value || !props.paymentData) return

      isProcessing.value = true

      if (selectedMethod.value === 'cash') {
        await processCashPayment()
      } else if (selectedMethod.value === 'liquidation') {
        await processLiquidationPayment()
      }
    }

    const processCashPayment = async () => {
      processingMessage.value = 'Processing payment...'

      try {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Execute payment through game actions
        const success = gameActions.payRent(
          props.paymentData.payer.id,
          props.paymentData.receiver.id,
          props.paymentData.amount
        )

        if (success) {
          processingMessage.value = 'Payment successful!'
          
          // Show success animation
          await new Promise(resolve => setTimeout(resolve, 1500))

          emit('payment-completed', {
            method: 'cash',
            amount: props.paymentData.amount,
            payer: props.paymentData.payer,
            receiver: props.paymentData.receiver
          })

          closePayment()
        } else {
          throw new Error('Payment failed')
        }
      } catch (error) {
        console.error('Payment error:', error)
        processingMessage.value = 'Payment failed!'
        
        setTimeout(() => {
          isProcessing.value = false
        }, 2000)
      }
    }

    const processLiquidationPayment = async () => {
      processingMessage.value = 'Preparing asset liquidation...'

      try {
        await new Promise(resolve => setTimeout(resolve, 800))

        emit('liquidation-required', {
          playerId: props.paymentData.payer.id,
          requiredAmount: shortfall.value,
          paymentContext: props.paymentData,
          liquidationOptions: props.liquidationOptions
        })

        // Don't close - let parent handle liquidation flow
        isProcessing.value = false
      } catch (error) {
        console.error('Liquidation setup error:', error)
        processingMessage.value = 'Liquidation setup failed!'
        
        setTimeout(() => {
          isProcessing.value = false
        }, 2000)
      }
    }

    const cancelPayment = () => {
      emit('payment-cancelled')
      closePayment()
    }

    const closePayment = () => {
      showPayment.value = false
      selectedMethod.value = null
      isProcessing.value = false
      processingMessage.value = ''
    }

    const openPayment = (paymentData, liquidationOpts = null) => {
      if (!paymentData) return

      showPayment.value = true
      
      // Auto-select payment method if only one is viable
      if (canPayCash.value && !needsLiquidation.value) {
        selectedMethod.value = 'cash'
      } else if (needsLiquidation.value && canPayWithLiquidation.value) {
        selectedMethod.value = 'liquidation'
      }
    }

    const handleLiquidationComplete = (success, amountRaised) => {
      if (success && amountRaised >= shortfall.value) {
        // Proceed with cash payment after liquidation
        selectedMethod.value = 'cash'
        processCashPayment()
      } else {
        // Liquidation failed
        isProcessing.value = false
        if (!success) {
          processingMessage.value = 'Liquidation cancelled'
        } else {
          processingMessage.value = 'Insufficient assets liquidated'
        }
      }
    }

    // Watch for prop changes
    watch(() => props.paymentData, (newData) => {
      if (newData) {
        openPayment(newData, props.liquidationOptions)
      }
    })

    return {
      // Reactive state
      showPayment,
      selectedMethod,
      isProcessing,
      processingMessage,

      // Computed
      canPayCash,
      shortfall,
      needsLiquidation,
      liquidationPotential,
      canPayWithLiquidation,
      totalShortfall,
      remainingBalance,
      previewAssets,

      // Methods
      selectPaymentMethod,
      confirmPayment,
      cancelPayment,
      openPayment,
      handleLiquidationComplete
    }
  }
}
</script>

<style scoped>
.rent-payment-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  backdrop-filter: blur(4px);
}

.rent-payment-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.payment-header {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  text-align: center;
}

.payment-header h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.payment-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-name {
  font-size: 1.1rem;
  font-weight: bold;
}

.payment-amount {
  font-size: 1.3rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

.payment-details {
  padding: 24px;
}

.transaction-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
}

.transaction-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #2c3e50;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.player-money {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.payment-arrow {
  font-size: 2rem;
  margin: 8px 0;
}

.payment-method {
  margin-bottom: 24px;
}

.payment-method h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-option:hover:not(.disabled) {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.method-option.active {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(34, 153, 84, 0.1));
}

.method-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.method-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.method-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.method-status {
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: bold;
}

.payment-breakdown {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.breakdown-header {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 12px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.breakdown-divider {
  height: 1px;
  background: #bdc3c7;
  margin: 12px 0;
}

.total-row {
  font-weight: bold;
  font-size: 1.1rem;
}

.amount {
  font-weight: bold;
}

.amount.positive {
  color: #27ae60;
}

.amount.negative {
  color: #e74c3c;
}

.liquidation-preview {
  background: #fff3cd;
  border: 2px solid #ffc107;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.liquidation-header {
  font-weight: bold;
  color: #856404;
  margin-bottom: 12px;
}

.liquidation-summary {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.asset-preview {
  border-top: 1px solid #ffc107;
  padding-top: 12px;
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 193, 7, 0.3);
}

.asset-item:last-child {
  border-bottom: none;
}

.asset-info {
  display: flex;
  flex-direction: column;
}

.asset-name {
  font-weight: bold;
  color: #856404;
}

.asset-type {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
}

.asset-value {
  font-weight: bold;
  color: #27ae60;
}

.payment-confirmation {
  background: linear-gradient(135deg, #e8f5e8, #d4edda);
  border: 2px solid #27ae60;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.confirmation-text {
  font-weight: bold;
  color: #155724;
  margin-bottom: 8px;
}

.confirmation-warning {
  color: #856404;
  font-size: 0.9rem;
  font-weight: bold;
}

.payment-actions {
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

.confirm-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
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
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.processing-animation {
  text-align: center;
}

.money-transfer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 2rem;
}

.money-from {
  animation: pulse 1s ease-in-out infinite;
}

.transfer-arrow {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-line {
  width: 40px;
  height: 3px;
  background: #3498db;
  animation: extend 2s ease-in-out infinite;
}

.arrow-head {
  color: #3498db;
  animation: move 2s ease-in-out infinite;
}

.money-to {
  animation: receive 1s ease-in-out infinite 0.5s;
}

.processing-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes extend {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.3); }
}

@keyframes move {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

@keyframes receive {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rent-payment-modal {
    width: 95%;
    margin: 20px;
  }

  .payment-header {
    padding: 16px;
  }

  .payment-summary {
    flex-direction: column;
    gap: 8px;
  }

  .payment-details {
    padding: 16px;
  }

  .method-option {
    padding: 12px;
    gap: 12px;
  }

  .method-icon {
    font-size: 1.5rem;
    min-width: 40px;
  }

  .payment-actions {
    flex-direction: column;
    padding: 16px;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .money-transfer {
    gap: 15px;
    font-size: 1.5rem;
  }

  .arrow-line {
    width: 30px;
  }
}
</style>