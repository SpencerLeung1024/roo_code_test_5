<template>
  <div class="property-transfer-container">
    <div class="transfer-header">
      <h4>🔄 Property Transfer</h4>
      <div class="transfer-participants">
        <div class="participant from">
          <span class="participant-label">From:</span>
          <span class="participant-name">{{ fromPlayerName }}</span>
        </div>
        <div class="transfer-arrow">➜</div>
        <div class="participant to">
          <span class="participant-label">To:</span>
          <span class="participant-name">{{ toPlayerName }}</span>
        </div>
      </div>
    </div>

    <div class="transfer-content">
      <!-- Transfer Rules -->
      <div class="transfer-rules">
        <h5>📋 Asset Transfer Rules</h5>
        <ul>
          <li>All properties transfer to creditor immediately</li>
          <li>Mortgaged properties transfer with existing mortgage debt</li>
          <li>Houses and hotels transfer with properties</li>
          <li>Creditor assumes all mortgage obligations</li>
          <li>Transfer cannot be reversed once completed</li>
        </ul>
      </div>

      <!-- Assets to Transfer -->
      <div class="assets-to-transfer">
        <h5>📦 Assets Being Transferred</h5>
        
        <!-- Properties -->
        <div v-if="propertiesToTransfer.length > 0" class="asset-category">
          <div class="category-header">
            <span class="category-icon">🏠</span>
            <span class="category-title">Properties ({{ propertiesToTransfer.length }})</span>
          </div>
          <div class="asset-list">
            <div 
              v-for="property in propertiesToTransfer" 
              :key="property.id"
              class="asset-item property-item"
              :style="{ borderLeftColor: getPropertyColor(property) }"
            >
              <div class="asset-info">
                <div class="asset-name">{{ property.name }}</div>
                <div class="asset-details">
                  <span v-if="property.houses > 0" class="development">{{ property.houses }} 🏠</span>
                  <span v-if="property.hasHotel" class="development">🏨</span>
                  <span v-if="property.isMortgaged" class="mortgage-status">MORTGAGED</span>
                  <span v-if="property.isPartOfMonopoly" class="monopoly-status">★ MONOPOLY</span>
                </div>
              </div>
              <div class="asset-value">
                <div class="base-value">${{ property.price?.toLocaleString() }}</div>
                <div v-if="property.isMortgaged" class="mortgage-debt">
                  -${{ (property.mortgageValue || Math.floor(property.price / 2))?.toLocaleString() }} debt
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Railroads -->
        <div v-if="railroadsToTransfer.length > 0" class="asset-category">
          <div class="category-header">
            <span class="category-icon">🚂</span>
            <span class="category-title">Railroads ({{ railroadsToTransfer.length }})</span>
          </div>
          <div class="asset-list">
            <div 
              v-for="railroad in railroadsToTransfer" 
              :key="railroad.id"
              class="asset-item railroad-item"
            >
              <div class="asset-info">
                <div class="asset-name">{{ railroad.name }}</div>
                <div class="asset-details">
                  <span v-if="railroad.isMortgaged" class="mortgage-status">MORTGAGED</span>
                  <span class="rent-info">Current Rent: ${{ railroad.currentRent }}</span>
                </div>
              </div>
              <div class="asset-value">
                <div class="base-value">${{ railroad.price?.toLocaleString() }}</div>
                <div v-if="railroad.isMortgaged" class="mortgage-debt">
                  -${{ (railroad.mortgageValue || 100)?.toLocaleString() }} debt
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Utilities -->
        <div v-if="utilitiesToTransfer.length > 0" class="asset-category">
          <div class="category-header">
            <span class="category-icon">⚡</span>
            <span class="category-title">Utilities ({{ utilitiesToTransfer.length }})</span>
          </div>
          <div class="asset-list">
            <div 
              v-for="utility in utilitiesToTransfer" 
              :key="utility.id"
              class="asset-item utility-item"
            >
              <div class="asset-info">
                <div class="asset-name">{{ utility.name }}</div>
                <div class="asset-details">
                  <span v-if="utility.isMortgaged" class="mortgage-status">MORTGAGED</span>
                  <span class="rent-info">Multiplier: {{ utility.rentMultiplier }}×</span>
                </div>
              </div>
              <div class="asset-value">
                <div class="base-value">${{ utility.price?.toLocaleString() }}</div>
                <div v-if="utility.isMortgaged" class="mortgage-debt">
                  -${{ (utility.mortgageValue || 75)?.toLocaleString() }} debt
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Assets -->
        <div v-if="totalAssetsToTransfer === 0" class="no-assets">
          <div class="no-assets-icon">📭</div>
          <div class="no-assets-text">No assets to transfer</div>
        </div>
      </div>

      <!-- Transfer Summary -->
      <div class="transfer-summary">
        <h5>📊 Transfer Summary</h5>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Properties:</span>
            <span class="summary-value">{{ propertiesToTransfer.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Railroads:</span>
            <span class="summary-value">{{ railroadsToTransfer.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Utilities:</span>
            <span class="summary-value">{{ utilitiesToTransfer.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Assets:</span>
            <span class="summary-value">{{ totalAssetsToTransfer }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Asset Value:</span>
            <span class="summary-value positive">${{ totalAssetValue.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Mortgage Debt:</span>
            <span class="summary-value negative">${{ totalMortgageDebt.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Net Value:</span>
            <span class="summary-value" :class="{ positive: netTransferValue >= 0, negative: netTransferValue < 0 }">
              ${{ netTransferValue.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Creditor Impact -->
      <div class="creditor-impact">
        <h5>🎯 Impact on {{ toPlayerName }}</h5>
        <div class="impact-details">
          <div class="impact-item">
            <span class="impact-icon">🏠</span>
            <div class="impact-content">
              <span class="impact-label">Properties Gained:</span>
              <span class="impact-value">{{ totalAssetsToTransfer }} assets</span>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-icon">💰</span>
            <div class="impact-content">
              <span class="impact-label">Asset Value:</span>
              <span class="impact-value positive">+${{ totalAssetValue.toLocaleString() }}</span>
            </div>
          </div>
          <div v-if="totalMortgageDebt > 0" class="impact-item">
            <span class="impact-icon">🏦</span>
            <div class="impact-content">
              <span class="impact-label">Mortgage Debt:</span>
              <span class="impact-value negative">-${{ totalMortgageDebt.toLocaleString() }}</span>
            </div>
          </div>
          <div v-if="newMonopolies.length > 0" class="impact-item">
            <span class="impact-icon">⭐</span>
            <div class="impact-content">
              <span class="impact-label">New Monopolies:</span>
              <span class="impact-value">{{ newMonopolies.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer Progress -->
      <div v-if="transferInProgress" class="transfer-progress">
        <h5>⚙️ Transfer in Progress</h5>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in transferSteps" 
            :key="step.id"
            class="progress-step"
            :class="{ 
              active: currentTransferStep >= index,
              complete: currentTransferStep > index,
              current: currentTransferStep === index
            }"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>
        <div class="progress-message">{{ transferMessage }}</div>
      </div>
    </div>

    <!-- Transfer Actions -->
    <div class="transfer-actions">
      <button 
        v-if="!transferInProgress && !transferComplete"
        @click="executeTransfer"
        class="action-btn transfer-btn"
        :disabled="totalAssetsToTransfer === 0"
      >
        <span class="btn-icon">🔄</span>
        Execute Transfer ({{ totalAssetsToTransfer }} assets)
      </button>

      <button 
        v-if="transferComplete"
        @click="completeTransfer"
        class="action-btn complete-btn"
      >
        <span class="btn-icon">✅</span>
        Transfer Complete
      </button>
    </div>

    <!-- Processing overlay -->
    <div v-if="transferInProgress" class="processing-overlay">
      <div class="processing-animation">
        <div class="transfer-animation">
          <div class="asset-icon">📦</div>
          <div class="transfer-flow">
            <div class="flow-line"></div>
            <div class="flow-dot"></div>
          </div>
          <div class="recipient-icon">👤</div>
        </div>
        <div class="processing-text">{{ transferMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameActions } from '../../game/gameState.js'
import { PROPERTIES, RAILROADS, UTILITIES, COLOR_GROUPS } from '../../data/boardData.js'

export default {
  name: 'PropertyTransfer',

  props: {
    fromPlayerId: {
      type: String,
      required: true
    },
    toPlayerId: {
      type: String,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    transferAll: {
      type: Boolean,
      default: false
    },
    transferReason: {
      type: String,
      default: 'general'
    },
    specificAssets: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'transfer-completed',
    'transfer-failed',
    'transfer-step-complete'
  ],

  setup(props, { emit }) {
    const transferInProgress = ref(false)
    const transferComplete = ref(false)
    const currentTransferStep = ref(-1)
    const transferMessage = ref('')
    const transferredAssets = ref([])

    const transferSteps = [
      { id: 'validate', label: 'Validate Transfer', icon: '🔍' },
      { id: 'properties', label: 'Transfer Properties', icon: '🏠' },
      { id: 'railroads', label: 'Transfer Railroads', icon: '🚂' },
      { id: 'utilities', label: 'Transfer Utilities', icon: '⚡' },
      { id: 'update', label: 'Update Ownership', icon: '📝' },
      { id: 'complete', label: 'Transfer Complete', icon: '✅' }
    ]

    // Computed properties
    const fromPlayer = computed(() => {
      return props.gameState.players?.find(p => p.id === props.fromPlayerId)
    })

    const toPlayer = computed(() => {
      return props.gameState.players?.find(p => p.id === props.toPlayerId)
    })

    const fromPlayerName = computed(() => {
      return fromPlayer.value?.name || 'Unknown Player'
    })

    const toPlayerName = computed(() => {
      if (!props.toPlayerId) return 'Bank'
      return toPlayer.value?.name || 'Unknown Player'
    })

    const propertiesToTransfer = computed(() => {
      if (!fromPlayer.value) return []
      
      return fromPlayer.value.properties?.map(propId => {
        const property = props.gameState.properties?.[propId]
        const propertyData = PROPERTIES[propId]
        return {
          ...property,
          ...propertyData,
          id: propId
        }
      }).filter(Boolean) || []
    })

    const railroadsToTransfer = computed(() => {
      if (!fromPlayer.value) return []
      
      return fromPlayer.value.railroads?.map(railId => {
        const railroad = props.gameState.railroads?.[railId]
        const railroadData = RAILROADS[railId]
        return {
          ...railroad,
          ...railroadData,
          id: railId
        }
      }).filter(Boolean) || []
    })

    const utilitiesToTransfer = computed(() => {
      if (!fromPlayer.value) return []
      
      return fromPlayer.value.utilities?.map(utilId => {
        const utility = props.gameState.utilities?.[utilId]
        const utilityData = UTILITIES[utilId]
        return {
          ...utility,
          ...utilityData,
          id: utilId
        }
      }).filter(Boolean) || []
    })

    const totalAssetsToTransfer = computed(() => {
      return propertiesToTransfer.value.length + 
             railroadsToTransfer.value.length + 
             utilitiesToTransfer.value.length
    })

    const totalAssetValue = computed(() => {
      let value = 0
      
      propertiesToTransfer.value.forEach(property => {
        value += property.price || 0
        // Add development value
        value += (property.houses || 0) * (property.houseCost || 0)
        if (property.hasHotel) {
          value += property.houseCost || 0
        }
      })
      
      railroadsToTransfer.value.forEach(railroad => {
        value += railroad.price || 200
      })
      
      utilitiesToTransfer.value.forEach(utility => {
        value += utility.price || 150
      })
      
      return value
    })

    const totalMortgageDebt = computed(() => {
      let debt = 0
      
      propertiesToTransfer.value.forEach(property => {
        if (property.isMortgaged) {
          debt += property.mortgageValue || Math.floor((property.price || 0) / 2)
        }
      })
      
      railroadsToTransfer.value.forEach(railroad => {
        if (railroad.isMortgaged) {
          debt += railroad.mortgageValue || 100
        }
      })
      
      utilitiesToTransfer.value.forEach(utility => {
        if (utility.isMortgaged) {
          debt += utility.mortgageValue || 75
        }
      })
      
      return debt
    })

    const netTransferValue = computed(() => {
      return totalAssetValue.value - totalMortgageDebt.value
    })

    const newMonopolies = computed(() => {
      if (!toPlayer.value) return []
      
      const monopolies = []
      const futureProperties = [
        ...(toPlayer.value.properties || []),
        ...propertiesToTransfer.value.map(p => p.id)
      ]
      
      Object.entries(COLOR_GROUPS).forEach(([colorGroup, groupData]) => {
        const ownedInGroup = futureProperties.filter(propId => 
          groupData.properties.includes(propId)
        )
        
        if (ownedInGroup.length === groupData.properties.length) {
          monopolies.push(colorGroup)
        }
      })
      
      return monopolies
    })

    // Methods
    const getPropertyColor = (property) => {
      const colorMap = {
        'brown': '#8B4513',
        'lightblue': '#87CEEB',
        'pink': '#FF1493',
        'orange': '#FFA500',
        'red': '#FF0000',
        'yellow': '#FFFF00',
        'green': '#008000',
        'blue': '#0000FF'
      }
      return colorMap[property.colorGroup] || '#666666'
    }

    const executeTransfer = async () => {
      if (totalAssetsToTransfer.value === 0) return

      transferInProgress.value = true
      currentTransferStep.value = 0
      transferMessage.value = 'Validating transfer...'

      try {
        // Step 1: Validate
        await processTransferStep(0)
        
        // Step 2: Transfer Properties
        if (propertiesToTransfer.value.length > 0) {
          await processTransferStep(1)
        }
        
        // Step 3: Transfer Railroads
        if (railroadsToTransfer.value.length > 0) {
          await processTransferStep(2)
        }
        
        // Step 4: Transfer Utilities
        if (utilitiesToTransfer.value.length > 0) {
          await processTransferStep(3)
        }
        
        // Step 5: Update ownership tracking
        await processTransferStep(4)
        
        // Step 6: Complete
        await processTransferStep(5)
        
        transferComplete.value = true
        
      } catch (error) {
        console.error('Transfer failed:', error)
        emit('transfer-failed', {
          fromPlayerId: props.fromPlayerId,
          toPlayerId: props.toPlayerId,
          error: error.message,
          transferredAssets: transferredAssets.value
        })
      } finally {
        transferInProgress.value = false
      }
    }

    const processTransferStep = async (stepIndex) => {
      currentTransferStep.value = stepIndex
      const step = transferSteps[stepIndex]
      transferMessage.value = `${step.label}...`
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      switch (step.id) {
        case 'validate':
          await validateTransfer()
          break
        case 'properties':
          await transferProperties()
          break
        case 'railroads':
          await transferRailroads()
          break
        case 'utilities':
          await transferUtilities()
          break
        case 'update':
          await updateOwnership()
          break
        case 'complete':
          await finalizeTransfer()
          break
      }
      
      emit('transfer-step-complete', {
        step: step.id,
        stepIndex,
        transferredAssets: transferredAssets.value
      })
    }

    const validateTransfer = async () => {
      if (!fromPlayer.value || (!toPlayer.value && props.toPlayerId)) {
        throw new Error('Invalid player IDs for transfer')
      }
      
      if (totalAssetsToTransfer.value === 0) {
        throw new Error('No assets to transfer')
      }
    }

    const transferProperties = async () => {
      for (const property of propertiesToTransfer.value) {
        // Update property ownership
        const gameProperty = props.gameState.properties[property.id]
        if (gameProperty) {
          gameProperty.ownerId = props.toPlayerId
          
          // Add to transferred assets list
          transferredAssets.value.push({
            type: 'property',
            id: property.id,
            name: property.name,
            value: property.price,
            mortgaged: property.isMortgaged
          })
        }
      }

      // Update player property lists
      if (fromPlayer.value) {
        fromPlayer.value.properties = []
      }
      
      if (toPlayer.value) {
        const newProperties = propertiesToTransfer.value.map(p => p.id)
        toPlayer.value.properties = [...(toPlayer.value.properties || []), ...newProperties]
      }
    }

    const transferRailroads = async () => {
      for (const railroad of railroadsToTransfer.value) {
        // Update railroad ownership
        const gameRailroad = props.gameState.railroads[railroad.id]
        if (gameRailroad) {
          gameRailroad.ownerId = props.toPlayerId
          
          transferredAssets.value.push({
            type: 'railroad',
            id: railroad.id,
            name: railroad.name,
            value: railroad.price,
            mortgaged: railroad.isMortgaged
          })
        }
      }

      // Update player railroad lists
      if (fromPlayer.value) {
        fromPlayer.value.railroads = []
      }
      
      if (toPlayer.value) {
        const newRailroads = railroadsToTransfer.value.map(r => r.id)
        toPlayer.value.railroads = [...(toPlayer.value.railroads || []), ...newRailroads]
      }
    }

    const transferUtilities = async () => {
      for (const utility of utilitiesToTransfer.value) {
        // Update utility ownership
        const gameUtility = props.gameState.utilities[utility.id]
        if (gameUtility) {
          gameUtility.ownerId = props.toPlayerId
          
          transferredAssets.value.push({
            type: 'utility',
            id: utility.id,
            name: utility.name,
            value: utility.price,
            mortgaged: utility.isMortgaged
          })
        }
      }

      // Update player utility lists
      if (fromPlayer.value) {
        fromPlayer.value.utilities = []
      }
      
      if (toPlayer.value) {
        const newUtilities = utilitiesToTransfer.value.map(u => u.id)
        toPlayer.value.utilities = [...(toPlayer.value.utilities || []), ...newUtilities]
      }
    }

    const updateOwnership = async () => {
      // Update monopoly status
      gameActions.updateMonopolyStatus()
      
      // Update railroad rents
      if (toPlayer.value) {
        gameActions.updateRailroadRents(toPlayer.value.id)
        gameActions.updateUtilityRents(toPlayer.value.id)
      }
    }

    const finalizeTransfer = async () => {
      transferMessage.value = 'Transfer completed successfully!'
    }

    const completeTransfer = () => {
      emit('transfer-completed', {
        fromPlayerId: props.fromPlayerId,
        toPlayerId: props.toPlayerId,
        transferredAssets: transferredAssets.value,
        totalAssetValue: totalAssetValue.value,
        totalMortgageDebt: totalMortgageDebt.value,
        netTransferValue: netTransferValue.value,
        newMonopolies: newMonopolies.value
      })
    }

    return {
      // Reactive state
      transferInProgress,
      transferComplete,
      currentTransferStep,
      transferMessage,
      transferredAssets,
      transferSteps,

      // Computed
      fromPlayer,
      toPlayer,
      fromPlayerName,
      toPlayerName,
      propertiesToTransfer,
      railroadsToTransfer,
      utilitiesToTransfer,
      totalAssetsToTransfer,
      totalAssetValue,
      totalMortgageDebt,
      netTransferValue,
      newMonopolies,

      // Methods
      getPropertyColor,
      executeTransfer,
      completeTransfer
    }
  }
}
</script>

<style scoped>
.property-transfer-container {
  background: #e8f4fd;
  border: 2px solid #3498db;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.transfer-header {
  margin-bottom: 24px;
  text-align: center;
}

.transfer-header h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.transfer-participants {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bdc3c7;
}

.participant {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.participant-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: bold;
}

.participant-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

.transfer-arrow {
  font-size: 1.5rem;
  color: #3498db;
  font-weight: bold;
}

.transfer-rules {
  background: #d6eaf8;
  border-left: 4px solid #3498db;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 0 8px 8px 0;
}

.transfer-rules h5 {
  margin: 0 0 12px 0;
  color: #1f4e79;
}

.transfer-rules ul {
  margin: 0;
  padding-left: 20px;
  color: #1f4e79;
}

.transfer-rules li {
  margin-bottom: 4px;
}

.assets-to-transfer {
  margin-bottom: 32px;
}

.assets-to-transfer h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.asset-category {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #bdc3c7;
}

.category-icon {
  font-size: 1.2rem;
}

.category-title {
  font-weight: bold;
  color: #2c3e50;
}

.asset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  border: 1px solid #dee2e6;
}

.property-item {
  border-left-width: 4px;
}

.railroad-item {
  border-left-color: #34495e;
}

.utility-item {
  border-left-color: #f39c12;
}

.asset-info {
  flex: 1;
}

.asset-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.asset-details {
  display: flex;
  gap: 8px;
  font-size: 0.9rem;
}

.development {
  color: #e67e22;
  font-weight: bold;
}

.mortgage-status {
  color: #e74c3c;
  font-weight: bold;
}

.monopoly-status {
  color: #f1c40f;
  font-weight: bold;
}

.rent-info {
  color: #27ae60;
  font-weight: bold;
}

.asset-value {
  text-align: right;
}

.base-value {
  font-weight: bold;
  color: #27ae60;
}

.mortgage-debt {
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: bold;
}

.no-assets {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-assets-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.no-assets-text {
  font-size: 1.1rem;
  font-weight: bold;
}

.transfer-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #dee2e6;
}

.transfer-summary h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
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

.creditor-impact {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.creditor-impact h5 {
  margin: 0 0 16px 0;
  color: #856404;
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
  font-size: 1.3rem;
  min-width: 24px;
}

.impact-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.impact-label {
  color: #856404;
  font-weight: bold;
}

.impact-value {
  font-weight: bold;
  color: #856404;
}

.impact-value.positive {
  color: #27ae60;
}

.impact-value.negative {
  color: #e74c3c;
}

.transfer-progress {
  background: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.transfer-progress h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.progress-step.active {
  opacity: 1;
}

.progress-step.current {
  transform: scale(1.1);
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.progress-step.active .step-icon {
  background: #3498db;
  color: white;
}

.progress-step.complete .step-icon {
  background: #27ae60;
  color: white;
}

.step-label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
}

.progress-message {
  text-align: center;
  font-weight: bold;
  color: #3498db;
}

.transfer-actions {
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
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

.transfer-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.transfer-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.complete-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
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
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.processing-animation {
  text-align: center;
}

.transfer-animation {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.asset-icon,
.recipient-icon {
  font-size: 2rem;
}

.transfer-flow {
  position: relative;
  width: 60px;
  height: 4px;
}

.flow-line {
  width: 100%;
  height: 100%;
  background: #3498db;
  border-radius: 2px;
}

.flow-dot {
  position: absolute;
  top: -4px;
  width: 12px;
  height: 12px;
  background: #e74c3c;
  border-radius: 50%;
  animation: flow 2s linear infinite;
}

@keyframes flow {
  0% { left: -6px; }
  100% { left: 54px; }
}

.processing-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .transfer-participants {
    flex-direction: column;
    gap: 12px;
  }

  .transfer-arrow {
    transform: rotate(90deg);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 12px;
  }

  .progress-step {
    flex: 1;
    min-width: 80px;
  }

  .impact-content {
    flex-direction: column;
    gap: 4px;
  }
}
</style>