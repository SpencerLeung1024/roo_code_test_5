<template>
  <div class="forced-liquidation-container">
    <div class="liquidation-header">
      <h4>🔨 Forced Asset Liquidation</h4>
      <div class="liquidation-status">
        <span class="status-label">Required:</span>
        <span class="status-amount">${{ requiredAmount.toLocaleString() }}</span>
      </div>
    </div>

    <div class="liquidation-process">
      <!-- Liquidation Rules -->
      <div class="liquidation-rules">
        <h5>📋 Forced Liquidation Rules</h5>
        <ul>
          <li>Assets are liquidated in optimal order to maximize value</li>
          <li>Houses and hotels are sold first (50% of cost)</li>
          <li>Properties are mortgaged automatically</li>
          <li>All liquid assets are applied to debt</li>
          <li>Process cannot be cancelled once started</li>
        </ul>
      </div>

      <!-- Liquidation Order Display -->
      <div class="liquidation-order">
        <h5>🎯 Liquidation Order</h5>
        <div class="order-steps">
          <div 
            v-for="(step, index) in liquidationSteps" 
            :key="step.id"
            class="order-step"
            :class="{ 
              active: currentOrderStep >= index,
              complete: currentOrderStep > index,
              processing: currentOrderStep === index && isProcessing
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-value">+${{ step.value.toLocaleString() }}</div>
            </div>
            <div class="step-status">
              <span v-if="currentOrderStep > index" class="status-complete">✅</span>
              <span v-else-if="currentOrderStep === index && isProcessing" class="status-processing">⚙️</span>
              <span v-else class="status-pending">⏳</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Liquidation Progress -->
      <div class="liquidation-progress">
        <h5>📊 Liquidation Progress</h5>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Assets Liquidated:</span>
            <span class="stat-value">${{ totalLiquidated.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Remaining Needed:</span>
            <span class="stat-value" :class="{ negative: remainingNeeded > 0 }">
              ${{ remainingNeeded.toLocaleString() }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Progress:</span>
            <span class="stat-value">{{ liquidationProgress }}%</span>
          </div>
        </div>

        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: liquidationProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Current Liquidation Step Details -->
      <div v-if="currentStep" class="current-step-details">
        <h5>🔄 Currently Processing</h5>
        <div class="step-detail-card">
          <div class="detail-header">
            <span class="detail-icon">{{ currentStep.icon }}</span>
            <span class="detail-title">{{ currentStep.title }}</span>
          </div>
          <div class="detail-content">
            <div class="detail-items">
              <div v-for="item in currentStep.items" :key="item.id" class="detail-item">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-value">+${{ item.value.toLocaleString() }}</span>
              </div>
            </div>
            <div class="detail-total">
              <span class="total-label">Step Total:</span>
              <span class="total-value">+${{ currentStep.value.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Liquidation Summary -->
      <div v-if="liquidationComplete" class="liquidation-summary">
        <h5>✅ Liquidation Complete</h5>
        <div class="summary-card">
          <div class="summary-header">
            <div class="summary-icon">💰</div>
            <div class="summary-title">Final Liquidation Results</div>
          </div>
          <div class="summary-details">
            <div class="summary-row">
              <span class="summary-label">Total Assets Liquidated:</span>
              <span class="summary-value positive">${{ totalLiquidated.toLocaleString() }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Original Debt:</span>
              <span class="summary-value">${{ requiredAmount.toLocaleString() }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Debt Coverage:</span>
              <span class="summary-value" :class="{ positive: debtCoverage >= 100, negative: debtCoverage < 100 }">
                {{ debtCoverage }}%
              </span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Remaining Shortfall:</span>
              <span class="summary-value" :class="{ positive: remainingNeeded <= 0, negative: remainingNeeded > 0 }">
                ${{ Math.max(0, remainingNeeded).toLocaleString() }}
              </span>
            </div>
          </div>
          
          <div v-if="remainingNeeded > 0" class="bankruptcy-notice">
            <div class="notice-icon">⚠️</div>
            <div class="notice-text">
              <strong>Insufficient Assets:</strong> Player cannot cover full debt amount. 
              Bankruptcy proceedings will continue with asset transfer.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-processing indicator -->
    <div v-if="isProcessing" class="processing-indicator">
      <div class="processing-animation">
        <div class="processing-spinner">⚙️</div>
        <div class="processing-text">{{ processingMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { gameActions } from '../../game/gameState.js'
import { PROPERTIES, RAILROADS, UTILITIES } from '../../data/boardData.js'

export default {
  name: 'AssetLiquidationForced',

  props: {
    playerId: {
      type: String,
      required: true
    },
    requiredAmount: {
      type: Number,
      required: true
    },
    liquidationOptions: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    forceOptimal: {
      type: Boolean,
      default: true
    },
    autoProcess: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'liquidation-completed',
    'liquidation-failed',
    'liquidation-step-complete'
  ],

  setup(props, { emit }) {
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const currentOrderStep = ref(-1)
    const totalLiquidated = ref(0)
    const liquidationComplete = ref(false)
    const liquidationSteps = ref([])

    // Computed properties
    const player = computed(() => {
      return props.gameState.players?.find(p => p.id === props.playerId)
    })

    const remainingNeeded = computed(() => {
      return Math.max(0, props.requiredAmount - totalLiquidated.value)
    })

    const liquidationProgress = computed(() => {
      if (props.requiredAmount === 0) return 100
      return Math.min(100, Math.round((totalLiquidated.value / props.requiredAmount) * 100))
    })

    const debtCoverage = computed(() => {
      if (props.requiredAmount === 0) return 100
      return Math.round((totalLiquidated.value / props.requiredAmount) * 100)
    })

    const currentStep = computed(() => {
      if (currentOrderStep.value >= 0 && currentOrderStep.value < liquidationSteps.value.length) {
        return liquidationSteps.value[currentOrderStep.value]
      }
      return null
    })

    // Generate optimal liquidation order
    const generateLiquidationOrder = () => {
      const steps = []
      
      if (!player.value || !props.liquidationOptions.options) return steps

      // Step 1: Sell houses first (highest liquidity)
      const houseOptions = props.liquidationOptions.options.filter(opt => opt.type === 'house')
      if (houseOptions.length > 0) {
        const houseValue = houseOptions.reduce((sum, opt) => sum + opt.value, 0)
        steps.push({
          id: 'houses',
          title: 'Sell Houses',
          description: `Sell ${houseOptions.length} houses at 50% value`,
          icon: '🏠',
          value: houseValue,
          items: houseOptions.map(opt => ({
            id: opt.propertyId,
            name: opt.propertyName,
            value: opt.value
          }))
        })
      }

      // Step 2: Sell hotels
      const hotelOptions = props.liquidationOptions.options.filter(opt => opt.type === 'hotel')
      if (hotelOptions.length > 0) {
        const hotelValue = hotelOptions.reduce((sum, opt) => sum + opt.value, 0)
        steps.push({
          id: 'hotels',
          title: 'Sell Hotels',
          description: `Sell ${hotelOptions.length} hotels at 50% value`,
          icon: '🏨',
          value: hotelValue,
          items: hotelOptions.map(opt => ({
            id: opt.propertyId,
            name: opt.propertyName,
            value: opt.value
          }))
        })
      }

      // Step 3: Mortgage properties
      const mortgageOptions = props.liquidationOptions.options.filter(opt => opt.type === 'mortgage')
      if (mortgageOptions.length > 0) {
        const mortgageValue = mortgageOptions.reduce((sum, opt) => sum + opt.value, 0)
        steps.push({
          id: 'mortgages',
          title: 'Mortgage Properties',
          description: `Mortgage ${mortgageOptions.length} properties`,
          icon: '🏦',
          value: mortgageValue,
          items: mortgageOptions.map(opt => ({
            id: opt.propertyId,
            name: opt.propertyName,
            value: opt.value
          }))
        })
      }

      // Step 4: Apply remaining cash
      if (player.value.money > 0) {
        steps.push({
          id: 'cash',
          title: 'Apply Cash',
          description: 'Apply all remaining cash to debt',
          icon: '💵',
          value: player.value.money,
          items: [{
            id: 'cash',
            name: 'Available Cash',
            value: player.value.money
          }]
        })
      }

      return steps
    }

    const executeLiquidationStep = async (stepIndex) => {
      if (stepIndex >= liquidationSteps.value.length) return

      const step = liquidationSteps.value[stepIndex]
      isProcessing.value = true
      processingMessage.value = `Processing: ${step.title}...`

      try {
        let stepTotal = 0

        switch (step.id) {
          case 'houses':
            stepTotal = await liquidateHouses(step.items)
            break
          case 'hotels':
            stepTotal = await liquidateHotels(step.items)
            break
          case 'mortgages':
            stepTotal = await mortgageProperties(step.items)
            break
          case 'cash':
            stepTotal = step.value // Cash is already available
            break
        }

        totalLiquidated.value += stepTotal
        currentOrderStep.value = stepIndex
        
        emit('liquidation-step-complete', {
          step: step.id,
          stepValue: stepTotal,
          totalLiquidated: totalLiquidated.value,
          remainingNeeded: remainingNeeded.value
        })

        // Wait a moment for visual feedback
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Proceed to next step if still needed and available
        if (remainingNeeded.value > 0 && stepIndex + 1 < liquidationSteps.value.length) {
          await executeLiquidationStep(stepIndex + 1)
        } else {
          completeLiquidation()
        }

      } catch (error) {
        console.error('Error executing liquidation step:', error)
        emit('liquidation-failed', {
          step: step.id,
          error: error.message,
          totalLiquidated: totalLiquidated.value
        })
      } finally {
        isProcessing.value = false
        processingMessage.value = ''
      }
    }

    const liquidateHouses = async (houseItems) => {
      let total = 0
      
      for (const item of houseItems) {
        const property = props.gameState.properties[item.id]
        if (property && property.houses > 0) {
          const result = gameActions.sellHouses(props.playerId, item.id, property.houses)
          if (result.success) {
            total += result.amount
          }
        }
      }
      
      return total
    }

    const liquidateHotels = async (hotelItems) => {
      let total = 0
      
      for (const item of hotelItems) {
        const property = props.gameState.properties[item.id]
        if (property && property.hasHotel) {
          const result = gameActions.sellHotel(props.playerId, item.id)
          if (result.success) {
            total += result.amount
          }
        }
      }
      
      return total
    }

    const mortgageProperties = async (mortgageItems) => {
      let total = 0
      
      for (const item of mortgageItems) {
        // Try properties first
        let result = gameActions.mortgageProperty(props.playerId, item.id)
        
        if (!result.success) {
          // Try railroads
          const railroad = props.gameState.railroads[item.id]
          if (railroad && railroad.ownerId === props.playerId && !railroad.isMortgaged) {
            railroad.isMortgaged = true
            player.value.money += railroad.mortgageValue || 100
            total += railroad.mortgageValue || 100
            continue
          }
          
          // Try utilities
          const utility = props.gameState.utilities[item.id]
          if (utility && utility.ownerId === props.playerId && !utility.isMortgaged) {
            utility.isMortgaged = true
            player.value.money += utility.mortgageValue || 75
            total += utility.mortgageValue || 75
            continue
          }
        } else {
          total += result.amount
        }
      }
      
      return total
    }

    const completeLiquidation = () => {
      liquidationComplete.value = true
      currentOrderStep.value = liquidationSteps.value.length

      emit('liquidation-completed', {
        totalLiquidated: totalLiquidated.value,
        debtCoverage: debtCoverage.value,
        remainingShortfall: remainingNeeded.value,
        canCoverDebt: remainingNeeded.value <= 0,
        liquidationSteps: liquidationSteps.value
      })
    }

    const startLiquidation = async () => {
      liquidationSteps.value = generateLiquidationOrder()
      
      if (liquidationSteps.value.length === 0) {
        emit('liquidation-failed', {
          error: 'No assets available for liquidation',
          totalLiquidated: 0
        })
        return
      }

      // Start with the first step
      await executeLiquidationStep(0)
    }

    // Auto-start liquidation when component mounts
    onMounted(() => {
      if (props.autoProcess) {
        setTimeout(() => {
          startLiquidation()
        }, 1000) // Brief delay to show initial state
      }
    })

    return {
      // Reactive state
      isProcessing,
      processingMessage,
      currentOrderStep,
      totalLiquidated,
      liquidationComplete,
      liquidationSteps,

      // Computed
      player,
      remainingNeeded,
      liquidationProgress,
      debtCoverage,
      currentStep,

      // Methods
      startLiquidation
    }
  }
}
</script>

<style scoped>
.forced-liquidation-container {
  background: #fff5f5;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.liquidation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f5c6cb;
}

.liquidation-header h4 {
  margin: 0;
  color: #721c24;
  font-size: 1.3rem;
}

.liquidation-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: #6c757d;
  font-weight: bold;
}

.status-amount {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.2rem;
}

.liquidation-rules {
  background: #f8d7da;
  border-left: 4px solid #e74c3c;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 0 8px 8px 0;
}

.liquidation-rules h5 {
  margin: 0 0 12px 0;
  color: #721c24;
}

.liquidation-rules ul {
  margin: 0;
  padding-left: 20px;
  color: #721c24;
}

.liquidation-rules li {
  margin-bottom: 4px;
}

.liquidation-order {
  margin-bottom: 32px;
}

.liquidation-order h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.order-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-step {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #ecf0f1;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.order-step.active {
  opacity: 1;
  border-color: #3498db;
}

.order-step.complete {
  opacity: 1;
  border-color: #27ae60;
  background: #d4edda;
}

.order-step.processing {
  opacity: 1;
  border-color: #f39c12;
  background: #fff3cd;
  animation: pulse 1s ease-in-out infinite;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2c3e50;
}

.order-step.active .step-number {
  background: #3498db;
  color: white;
}

.order-step.complete .step-number {
  background: #27ae60;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.step-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.step-value {
  color: #27ae60;
  font-weight: bold;
}

.step-status {
  font-size: 1.2rem;
}

.status-complete {
  color: #27ae60;
}

.status-processing {
  color: #f39c12;
  animation: spin 2s linear infinite;
}

.status-pending {
  color: #6c757d;
}

.liquidation-progress {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #dee2e6;
}

.liquidation-progress h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #6c757d;
  font-weight: bold;
}

.stat-value {
  color: #2c3e50;
  font-weight: bold;
}

.stat-value.negative {
  color: #e74c3c;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  transition: width 0.5s ease;
}

.current-step-details {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.current-step-details h5 {
  margin: 0 0 16px 0;
  color: #856404;
}

.step-detail-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-icon {
  font-size: 1.5rem;
}

.detail-title {
  font-weight: bold;
  color: #2c3e50;
}

.detail-items {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-item:last-child {
  border-bottom: none;
}

.item-name {
  color: #2c3e50;
}

.item-value {
  color: #27ae60;
  font-weight: bold;
}

.detail-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 2px solid #ecf0f1;
  font-weight: bold;
}

.total-label {
  color: #2c3e50;
}

.total-value {
  color: #27ae60;
}

.liquidation-summary {
  background: #d4edda;
  border: 2px solid #27ae60;
  border-radius: 8px;
  padding: 20px;
}

.liquidation-summary h5 {
  margin: 0 0 16px 0;
  color: #155724;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-icon {
  font-size: 2rem;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ecf0f1;
}

.summary-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.summary-label {
  color: #6c757d;
  font-weight: bold;
}

.summary-value {
  font-weight: bold;
  color: #2c3e50;
}

.summary-value.positive {
  color: #27ae60;
}

.summary-value.negative {
  color: #e74c3c;
}

.bankruptcy-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
}

.notice-icon {
  font-size: 1.5rem;
  color: #721c24;
}

.notice-text {
  color: #721c24;
  font-size: 0.9rem;
}

.processing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.processing-animation {
  text-align: center;
}

.processing-spinner {
  font-size: 3rem;
  animation: spin 2s linear infinite;
  margin-bottom: 16px;
}

.processing-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .liquidation-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }

  .order-step {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .step-content {
    order: 1;
  }
  
  .step-number {
    order: 0;
  }
  
  .step-status {
    order: 2;
  }
}
</style>