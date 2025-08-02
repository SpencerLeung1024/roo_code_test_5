<template>
  <div class="asset-liquidation-overlay" v-if="showLiquidation">
    <div class="liquidation-modal">
      <div class="liquidation-header">
        <h3>🏠 Asset Liquidation</h3>
        <div class="liquidation-reason">
          <div class="debt-info">Need to raise: <span class="amount-needed">${{ requiredAmount }}</span></div>
          <div class="current-cash">Available cash: <span class="cash-amount">${{ currentCash }}</span></div>
          <div class="shortfall">Shortfall: <span class="shortfall-amount">${{ shortfall }}</span></div>
        </div>
      </div>

      <div class="liquidation-content">
        <!-- Liquidation Rules Info -->
        <div class="liquidation-rules">
          <h4>📋 Liquidation Rules</h4>
          <ul>
            <li>Houses and hotels must be sold before mortgaging properties</li>
            <li>Houses sell for 50% of purchase cost</li>
            <li>Properties can be mortgaged for their mortgage value</li>
            <li>Mortgaged properties earn no rent until unmortgaged</li>
          </ul>
        </div>

        <!-- Available Assets -->
        <div class="available-assets">
          <h4>💎 Available Assets</h4>
          
          <!-- Houses and Hotels Section -->
          <div v-if="developmentAssets.length > 0" class="asset-category">
            <h5>🏠 Houses & Hotels</h5>
            <div class="asset-list">
              <div 
                v-for="asset in developmentAssets" 
                :key="`dev-${asset.propertyId}-${asset.type}`"
                class="asset-item"
                :class="{ selected: isAssetSelected(asset), disabled: !canSelectAsset(asset) }"
                @click="toggleAssetSelection(asset)"
              >
                <div class="asset-info">
                  <div class="asset-header">
                    <span class="asset-icon">{{ asset.type === 'hotel' ? '🏨' : '🏠' }}</span>
                    <span class="asset-name">{{ asset.propertyName }}</span>
                    <span class="asset-count" v-if="asset.type === 'house'">{{ asset.available }} available</span>
                  </div>
                  <div class="asset-details">
                    <span class="asset-type">{{ asset.type === 'hotel' ? 'Hotel' : `Houses (${asset.houseCost}/each)` }}</span>
                    <span class="asset-value">${{ asset.value }}</span>
                  </div>
                  <div class="asset-actions" v-if="asset.type === 'house'">
                    <button 
                      @click.stop="adjustHouseSelection(asset, -1)"
                      :disabled="!getAssetSelection(asset) || getAssetSelection(asset).quantity <= 0"
                      class="quantity-btn"
                    >-</button>
                    <span class="quantity-display">{{ getAssetSelection(asset)?.quantity || 0 }}</span>
                    <button 
                      @click.stop="adjustHouseSelection(asset, 1)"
                      :disabled="(getAssetSelection(asset)?.quantity || 0) >= asset.available"
                      class="quantity-btn"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mortgageable Properties Section -->
          <div v-if="mortgageableAssets.length > 0" class="asset-category">
            <h5>🏦 Mortgageable Properties</h5>
            <div class="asset-list">
              <div 
                v-for="asset in mortgageableAssets" 
                :key="`mortgage-${asset.propertyId}`"
                class="asset-item"
                :class="{ selected: isAssetSelected(asset), disabled: !canSelectAsset(asset) }"
                @click="toggleAssetSelection(asset)"
              >
                <div class="asset-info">
                  <div class="asset-header">
                    <span class="asset-icon">{{ getPropertyIcon(asset.propertyType) }}</span>
                    <span class="asset-name">{{ asset.propertyName }}</span>
                  </div>
                  <div class="asset-details">
                    <span class="asset-type">{{ asset.colorGroup || asset.propertyType }}</span>
                    <span class="asset-value">${{ asset.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Assets Available -->
          <div v-if="developmentAssets.length === 0 && mortgageableAssets.length === 0" class="no-assets">
            <div class="no-assets-icon">😕</div>
            <div class="no-assets-text">No assets available for liquidation</div>
            <div class="bankruptcy-warning">You may need to declare bankruptcy</div>
          </div>
        </div>

        <!-- Liquidation Summary -->
        <div class="liquidation-summary">
          <h4>📊 Liquidation Summary</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Selected Assets:</span>
              <span class="summary-value">{{ selectedAssets.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Value:</span>
              <span class="summary-value positive">${{ totalSelectedValue }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">After Liquidation:</span>
              <span class="summary-value" :class="{ positive: totalAfterLiquidation >= requiredAmount, negative: totalAfterLiquidation < requiredAmount }">
                ${{ totalAfterLiquidation }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Status:</span>
              <span class="summary-value" :class="{ positive: canCoverDebt, negative: !canCoverDebt }">
                {{ canCoverDebt ? '✅ Sufficient' : '❌ Insufficient' }}
              </span>
            </div>
          </div>

          <!-- Selected Assets List -->
          <div v-if="selectedAssets.length > 0" class="selected-assets">
            <h5>Selected for Liquidation:</h5>
            <div class="selected-list">
              <div v-for="selection in selectedAssets" :key="`selected-${selection.asset.propertyId}-${selection.asset.type}`" class="selected-item">
                <span class="selected-name">
                  {{ selection.asset.propertyName }}
                  <span v-if="selection.asset.type === 'house'"> ({{ selection.quantity }} houses)</span>
                  <span v-else-if="selection.asset.type === 'hotel'"> (hotel)</span>
                  <span v-else> (mortgage)</span>
                </span>
                <span class="selected-value">${{ selection.totalValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="liquidation-actions">
        <button 
          @click="executeLiquidation"
          class="action-btn liquidate-btn"
          :disabled="selectedAssets.length === 0 || isProcessing"
        >
          <span class="btn-icon">💰</span>
          Liquidate Selected Assets (${{ totalSelectedValue }})
        </button>

        <button 
          @click="selectOptimalAssets"
          class="action-btn auto-select-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">🎯</span>
          Auto-Select Minimum Assets
        </button>

        <button 
          @click="cancelLiquidation"
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
          <div class="liquidation-steps">
            <div class="step" :class="{ active: currentStep >= 1, complete: currentStep > 1 }">
              <span class="step-icon">🏠</span>
              <span class="step-text">Selling Assets</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 2, complete: currentStep > 2 }">
              <span class="step-icon">💰</span>
              <span class="step-text">Collecting Funds</span>
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
import { ref, computed, watch } from 'vue'
import { gameActions } from '../../game/gameState.js'
import { PROPERTIES, RAILROADS, UTILITIES } from '../../data/boardData.js'

export default {
  name: 'AssetLiquidation',

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
    }
  },

  emits: [
    'liquidation-completed',
    'liquidation-cancelled',
    'assets-liquidated'
  ],

  setup(props, { emit }) {
    const showLiquidation = ref(true)
    const selectedAssets = ref([])
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const currentStep = ref(0)

    // Computed properties
    const player = computed(() => {
      return props.gameState.players.find(p => p.id === props.playerId)
    })

    const currentCash = computed(() => {
      return player.value?.money || 0
    })

    const shortfall = computed(() => {
      return Math.max(0, props.requiredAmount - currentCash.value)
    })

    const developmentAssets = computed(() => {
      if (!props.liquidationOptions?.options) return []
      
      const houses = []
      const hotels = []
      
      props.liquidationOptions.options.forEach(option => {
        if (option.type === 'house') {
          // Group houses by property
          const existing = houses.find(h => h.propertyId === option.propertyId)
          if (existing) {
            existing.available++
            existing.value = existing.available * existing.houseCost
          } else {
            const propertyData = PROPERTIES[option.propertyId]
            houses.push({
              ...option,
              type: 'house',
              available: 1,
              houseCost: option.value,
              value: option.value,
              colorGroup: propertyData?.colorGroupName
            })
          }
        } else if (option.type === 'hotel') {
          hotels.push({
            ...option,
            colorGroup: PROPERTIES[option.propertyId]?.colorGroupName
          })
        }
      })
      
      return [...hotels, ...houses]
    })

    const mortgageableAssets = computed(() => {
      if (!props.liquidationOptions?.options) return []
      
      return props.liquidationOptions.options.filter(option => option.type === 'mortgage').map(option => {
        let propertyData, propertyType, colorGroup
        
        if (PROPERTIES[option.propertyId]) {
          propertyData = PROPERTIES[option.propertyId]
          propertyType = 'property'
          colorGroup = propertyData.colorGroupName
        } else if (RAILROADS[option.propertyId]) {
          propertyData = RAILROADS[option.propertyId]
          propertyType = 'railroad'
        } else if (UTILITIES[option.propertyId]) {
          propertyData = UTILITIES[option.propertyId]
          propertyType = 'utility'
        }
        
        return {
          ...option,
          propertyType,
          colorGroup
        }
      })
    })

    const totalSelectedValue = computed(() => {
      return selectedAssets.value.reduce((total, selection) => total + selection.totalValue, 0)
    })

    const totalAfterLiquidation = computed(() => {
      return currentCash.value + totalSelectedValue.value
    })

    const canCoverDebt = computed(() => {
      return totalAfterLiquidation.value >= props.requiredAmount
    })

    // Methods
    const getPropertyIcon = (propertyType) => {
      switch (propertyType) {
        case 'property': return '🏠'
        case 'railroad': return '🚂'
        case 'utility': return '⚡'
        default: return '🏢'
      }
    }

    const isAssetSelected = (asset) => {
      return selectedAssets.value.some(s => 
        s.asset.propertyId === asset.propertyId && s.asset.type === asset.type
      )
    }

    const getAssetSelection = (asset) => {
      return selectedAssets.value.find(s => 
        s.asset.propertyId === asset.propertyId && s.asset.type === asset.type
      )
    }

    const canSelectAsset = (asset) => {
      // Houses and hotels can always be selected if available
      if (asset.type === 'house' || asset.type === 'hotel') return true
      
      // Mortgages can only be selected if no houses/hotels exist on the property
      if (asset.type === 'mortgage') {
        const property = props.gameState.properties[asset.propertyId]
        return property && property.houses === 0 && !property.hasHotel
      }
      
      return true
    }

    const toggleAssetSelection = (asset) => {
      if (!canSelectAsset(asset)) return

      const existingIndex = selectedAssets.value.findIndex(s => 
        s.asset.propertyId === asset.propertyId && s.asset.type === asset.type
      )

      if (existingIndex >= 0) {
        // Remove selection
        selectedAssets.value.splice(existingIndex, 1)
      } else {
        // Add selection
        const selection = {
          asset,
          quantity: asset.type === 'house' ? 1 : 1,
          totalValue: asset.type === 'house' ? asset.houseCost : asset.value
        }
        selectedAssets.value.push(selection)
      }
    }

    const adjustHouseSelection = (asset, delta) => {
      const selection = getAssetSelection(asset)
      if (!selection) return

      const newQuantity = selection.quantity + delta
      
      if (newQuantity <= 0) {
        // Remove selection
        const index = selectedAssets.value.indexOf(selection)
        selectedAssets.value.splice(index, 1)
      } else if (newQuantity <= asset.available) {
        // Update quantity
        selection.quantity = newQuantity
        selection.totalValue = newQuantity * asset.houseCost
      }
    }

    const selectOptimalAssets = () => {
      selectedAssets.value = []
      let needed = shortfall.value
      
      // Sort assets by value (lowest first to minimize loss)
      const allAssets = [...developmentAssets.value, ...mortgageableAssets.value]
        .filter(canSelectAsset)
        .sort((a, b) => {
          const aValue = a.type === 'house' ? a.houseCost : a.value
          const bValue = b.type === 'house' ? b.houseCost : b.value
          return aValue - bValue
        })

      for (const asset of allAssets) {
        if (needed <= 0) break

        if (asset.type === 'house') {
          // Select minimum houses needed
          const housesNeeded = Math.min(
            Math.ceil(needed / asset.houseCost),
            asset.available
          )
          
          selectedAssets.value.push({
            asset,
            quantity: housesNeeded,
            totalValue: housesNeeded * asset.houseCost
          })
          
          needed -= housesNeeded * asset.houseCost
        } else {
          selectedAssets.value.push({
            asset,
            quantity: 1,
            totalValue: asset.value
          })
          
          needed -= asset.value
        }
      }
    }

    const executeLiquidation = async () => {
      if (selectedAssets.value.length === 0) return

      isProcessing.value = true
      currentStep.value = 1
      processingMessage.value = 'Liquidating selected assets...'

      try {
        let totalRaised = 0

        // Execute asset sales in order
        for (const selection of selectedAssets.value) {
          const asset = selection.asset

          if (asset.type === 'house') {
            // Sell houses
            const result = gameActions.sellHouses(props.playerId, asset.propertyId, selection.quantity)
            if (result.success) {
              totalRaised += result.amount
            }
          } else if (asset.type === 'hotel') {
            // Sell hotel
            const result = gameActions.sellHotel(props.playerId, asset.propertyId)
            if (result.success) {
              totalRaised += result.amount
            }
          } else if (asset.type === 'mortgage') {
            // Mortgage property
            const result = gameActions.mortgageProperty(props.playerId, asset.propertyId)
            if (result.success) {
              totalRaised += result.amount
            }
          }
        }

        currentStep.value = 2
        processingMessage.value = 'Collecting liquidation proceeds...'
        await new Promise(resolve => setTimeout(resolve, 1000))

        currentStep.value = 3
        processingMessage.value = 'Liquidation complete!'
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Emit completion event
        emit('liquidation-completed', {
          totalRaised,
          assetsLiquidated: selectedAssets.value,
          canCoverDebt: totalRaised + currentCash.value >= props.requiredAmount
        })

        emit('assets-liquidated', {
          playerId: props.playerId,
          totalRaised,
          assets: selectedAssets.value
        })

        closeLiquidation()

      } catch (error) {
        console.error('Liquidation error:', error)
        processingMessage.value = 'Liquidation failed!'
        setTimeout(() => {
          isProcessing.value = false
          currentStep.value = 0
        }, 2000)
      }
    }

    const cancelLiquidation = () => {
      emit('liquidation-cancelled')
      closeLiquidation()
    }

    const closeLiquidation = () => {
      showLiquidation.value = false
      selectedAssets.value = []
      isProcessing.value = false
      processingMessage.value = ''
      currentStep.value = 0
    }

    return {
      // Reactive state
      showLiquidation,
      selectedAssets,
      isProcessing,
      processingMessage,
      currentStep,

      // Computed
      player,
      currentCash,
      shortfall,
      developmentAssets,
      mortgageableAssets,
      totalSelectedValue,
      totalAfterLiquidation,
      canCoverDebt,

      // Methods
      getPropertyIcon,
      isAssetSelected,
      getAssetSelection,
      canSelectAsset,
      toggleAssetSelection,
      adjustHouseSelection,
      selectOptimalAssets,
      executeLiquidation,
      cancelLiquidation
    }
  }
}
</script>

<style scoped>
.asset-liquidation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  backdrop-filter: blur(6px);
}

.liquidation-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  max-width: 800px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
}

.liquidation-header {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
}

.liquidation-header h3 {
  margin: 0 0 16px 0;
  font-size: 1.6rem;
  font-weight: bold;
  text-align: center;
}

.liquidation-reason {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  text-align: center;
}

.debt-info, .current-cash, .shortfall {
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.amount-needed, .cash-amount, .shortfall-amount {
  font-weight: bold;
  font-size: 1.1rem;
  display: block;
  margin-top: 4px;
}

.liquidation-content {
  padding: 24px;
}

.liquidation-rules {
  background: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 0 8px 8px 0;
}

.liquidation-rules h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.liquidation-rules ul {
  margin: 0;
  padding-left: 20px;
  color: #34495e;
  font-size: 0.9rem;
}

.liquidation-rules li {
  margin-bottom: 6px;
}

.available-assets h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.asset-category {
  margin-bottom: 32px;
}

.asset-category h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.asset-list {
  display: grid;
  gap: 12px;
}

.asset-item {
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.asset-item:hover:not(.disabled) {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.2);
}

.asset-item.selected {
  border-color: #27ae60;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(34, 153, 84, 0.05));
}

.asset-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.asset-name {
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.asset-count {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.asset-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-type {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.asset-value {
  font-weight: bold;
  color: #27ae60;
  font-size: 1.1rem;
}

.asset-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
  color: #2c3e50;
}

.no-assets {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-assets-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-assets-text {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.bankruptcy-warning {
  color: #e74c3c;
  font-weight: bold;
}

.liquidation-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.liquidation-summary h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.summary-label {
  color: #7f8c8d;
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

.selected-assets h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 6px;
}

.selected-name {
  color: #2c3e50;
  font-weight: bold;
}

.selected-value {
  color: #27ae60;
  font-weight: bold;
}

.liquidation-actions {
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

.liquidate-btn {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.liquidate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.auto-select-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.auto-select-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
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

.liquidation-steps {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
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
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.step.active .step-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
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
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .liquidation-modal {
    width: 98%;
    margin: 10px;
  }

  .liquidation-header {
    padding: 16px;
  }

  .liquidation-reason {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .liquidation-content {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .liquidation-actions {
    flex-direction: column;
    padding: 16px;
  }

  .liquidation-steps {
    gap: 15px;
  }

  .step-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .step-text {
    font-size: 0.8rem;
  }
}
</style>