<template>
  <div class="property-sale-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Property Management</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="property-info" v-if="property">
        <div class="property-name-section">
          <h4 :style="{ color: property.colorGroup }">{{ property.name }}</h4>
          <div class="property-status">
            <span class="status-owned">✓ Owned by {{ currentPlayer.name }}</span>
            <span v-if="property.isMortgaged" class="status-mortgaged">🏦 Mortgaged</span>
            <span v-if="property.houses > 0" class="status-developed">
              🏠 {{ property.houses }} house{{ property.houses > 1 ? 's' : '' }}
            </span>
            <span v-if="property.hasHotel" class="status-developed">🏨 Hotel</span>
          </div>
        </div>

        <div class="current-value-section">
          <div class="value-item">
            <span class="label">Purchase Price:</span>
            <span class="amount">${{ property.price.toLocaleString() }}</span>
          </div>
          <div class="value-item">
            <span class="label">Current Rent:</span>
            <span class="amount">${{ getCurrentRent() }}</span>
          </div>
          <div class="value-item">
            <span class="label">Mortgage Value:</span>
            <span class="amount">${{ getMortgageValue().toLocaleString() }}</span>
          </div>
        </div>

        <div class="development-status" v-if="property.houses > 0 || property.hasHotel">
          <h5>Development Status</h5>
          <div class="development-details">
            <div class="development-item">
              <span>Houses Built:</span>
              <span>{{ property.houses }}</span>
            </div>
            <div class="development-item" v-if="property.hasHotel">
              <span>Hotel:</span>
              <span>Yes</span>
            </div>
            <div class="development-item">
              <span>Development Value:</span>
              <span>${{ getDevelopmentValue().toLocaleString() }}</span>
            </div>
            <div class="development-warning">
              ⚠️ Must sell all houses/hotels before selling or mortgaging property
            </div>
          </div>
        </div>
      </div>

      <div class="action-tabs">
        <button 
          v-for="tab in availableTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          :disabled="!tab.enabled"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Sell Property Tab -->
        <div v-if="activeTab === 'sell'" class="sell-section">
          <div class="action-info">
            <h5>Sell Property to Bank</h5>
            <p>Sell this property back to the bank for 50% of its purchase price.</p>
          </div>
          
          <div class="transaction-details">
            <div class="detail-item">
              <span class="label">Sale Price:</span>
              <span class="amount positive">${{ getSalePrice().toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Your Money After Sale:</span>
              <span class="amount">${{ (currentPlayer.money + getSalePrice()).toLocaleString() }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              @click="sellProperty"
              :disabled="!canSellProperty || isProcessing"
              class="btn sell-btn"
              :class="{ loading: isProcessing }"
            >
              <span v-if="!isProcessing">Sell Property</span>
              <span v-else>Selling...</span>
            </button>
          </div>

          <div class="warnings" v-if="!canSellProperty">
            <div class="warning-item">
              ⚠️ {{ getSellWarning() }}
            </div>
          </div>
        </div>

        <!-- Mortgage Tab -->
        <div v-if="activeTab === 'mortgage'" class="mortgage-section">
          <div class="action-info" v-if="!property.isMortgaged">
            <h5>Mortgage Property</h5>
            <p>Mortgage this property to receive immediate cash. You won't collect rent while mortgaged.</p>
          </div>
          
          <div class="action-info" v-else>
            <h5>Unmortgage Property</h5>
            <p>Pay to unmortgage this property. Includes 10% interest on mortgage value.</p>
          </div>
          
          <div class="transaction-details">
            <div class="detail-item" v-if="!property.isMortgaged">
              <span class="label">Mortgage Amount:</span>
              <span class="amount positive">${{ getMortgageValue().toLocaleString() }}</span>
            </div>
            <div class="detail-item" v-else>
              <span class="label">Unmortgage Cost:</span>
              <span class="amount negative">${{ getUnmortgageCost().toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Your Money After:</span>
              <span class="amount">${{ getMoneyAfterMortgageAction().toLocaleString() }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              v-if="!property.isMortgaged"
              @click="mortgageProperty"
              :disabled="!canMortgageProperty || isProcessing"
              class="btn mortgage-btn"
              :class="{ loading: isProcessing }"
            >
              <span v-if="!isProcessing">Mortgage Property</span>
              <span v-else>Mortgaging...</span>
            </button>
            
            <button 
              v-else
              @click="unmortgageProperty"
              :disabled="!canUnmortgageProperty || isProcessing"
              class="btn unmortgage-btn"
              :class="{ loading: isProcessing }"
            >
              <span v-if="!isProcessing">Unmortgage Property</span>
              <span v-else>Unmortgaging...</span>
            </button>
          </div>

          <div class="warnings">
            <div class="warning-item" v-if="!canMortgageProperty && !property.isMortgaged">
              ⚠️ {{ getMortgageWarning() }}
            </div>
            <div class="warning-item" v-if="!canUnmortgageProperty && property.isMortgaged">
              ⚠️ Insufficient funds to unmortgage
            </div>
            <div class="info-item" v-if="property.isMortgaged">
              💡 No rent is collected while property is mortgaged
            </div>
          </div>
        </div>

        <!-- Development Tab -->
        <div v-if="activeTab === 'development'" class="development-section">
          <div class="action-info">
            <h5>Sell Houses & Hotels</h5>
            <p>Sell development back to the bank for 50% of build cost.</p>
          </div>

          <div class="development-inventory" v-if="property.houses > 0 || property.hasHotel">
            <div class="inventory-item" v-if="property.hasHotel">
              <div class="item-info">
                <span class="item-icon">🏨</span>
                <span class="item-name">Hotel</span>
                <span class="item-value">Sell for ${{ Math.floor(property.houseCost / 2) }}</span>
              </div>
              <button 
                @click="sellHotel"
                :disabled="!canSellHotel || isProcessing"
                class="btn sell-development-btn"
              >
                Sell Hotel
              </button>
            </div>

            <div class="inventory-item" v-if="property.houses > 0">
              <div class="item-info">
                <span class="item-icon">🏠</span>
                <span class="item-name">{{ property.houses }} House{{ property.houses > 1 ? 's' : '' }}</span>
                <span class="item-value">Sell each for ${{ Math.floor(property.houseCost / 2) }}</span>
              </div>
              <div class="house-controls">
                <div class="house-selector">
                  <label>Houses to sell:</label>
                  <input 
                    type="number" 
                    v-model.number="housesToSell"
                    :min="1"
                    :max="property.houses"
                    class="house-input"
                  >
                </div>
                <button 
                  @click="sellHouses"
                  :disabled="!canSellHouses || isProcessing"
                  class="btn sell-development-btn"
                >
                  Sell {{ housesToSell }} House{{ housesToSell > 1 ? 's' : '' }}
                </button>
              </div>
            </div>
          </div>

          <div class="no-development" v-else>
            <div class="info-item">
              💡 No houses or hotels to sell on this property
            </div>
          </div>

          <div class="warnings" v-if="!canSellHotel && property.hasHotel">
            <div class="warning-item">
              ⚠️ Not enough houses in bank to replace hotel
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn cancel-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameState, gameActions } from '../../game/gameState.js'

export default {
  name: 'PropertySale',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    propertyId: {
      type: [String, Number],
      required: true
    },
    currentPlayer: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'transaction'],

  setup(props, { emit }) {
    const activeTab = ref('sell')
    const isProcessing = ref(false)
    const housesToSell = ref(1)

    // Property information
    const property = computed(() => {
      if (!props.propertyId) return null
      return gameState.properties[props.propertyId] ||
             gameState.railroads[props.propertyId] ||
             gameState.utilities[props.propertyId]
    })

    // Available tabs based on property state
    const availableTabs = computed(() => {
      const tabs = [
        {
          id: 'sell',
          label: 'Sell Property',
          enabled: true
        },
        {
          id: 'mortgage',
          label: property.value?.isMortgaged ? 'Unmortgage' : 'Mortgage',
          enabled: true
        }
      ]

      // Add development tab if property has houses/hotels
      if (property.value && (property.value.houses > 0 || property.value.hasHotel)) {
        tabs.push({
          id: 'development',
          label: 'Sell Development',
          enabled: true
        })
      }

      return tabs
    })

    // Value calculations
    const getMortgageValue = () => {
      if (!property.value) return 0
      return property.value.mortgageValue || Math.floor(property.value.price / 2)
    }

    const getUnmortgageCost = () => {
      const mortgageValue = getMortgageValue()
      return Math.floor(mortgageValue * 1.1) // 10% interest
    }

    const getSalePrice = () => {
      if (!property.value) return 0
      return Math.floor(property.value.price / 2)
    }

    const getDevelopmentValue = () => {
      if (!property.value) return 0
      return (property.value.houses * property.value.houseCost) + 
             (property.value.hasHotel ? property.value.houseCost : 0)
    }

    const getCurrentRent = () => {
      if (!property.value) return 0
      if (property.value.isMortgaged) return 0
      return property.value.currentRent || 0
    }

    const getMoneyAfterMortgageAction = () => {
      if (!property.value) return props.currentPlayer.money
      
      if (property.value.isMortgaged) {
        return props.currentPlayer.money - getUnmortgageCost()
      } else {
        return props.currentPlayer.money + getMortgageValue()
      }
    }

    // Validation
    const canSellProperty = computed(() => {
      if (!property.value) return false
      return property.value.houses === 0 && !property.value.hasHotel
    })

    const canMortgageProperty = computed(() => {
      if (!property.value || property.value.isMortgaged) return false
      return property.value.houses === 0 && !property.value.hasHotel
    })

    const canUnmortgageProperty = computed(() => {
      if (!property.value || !property.value.isMortgaged) return false
      return props.currentPlayer.money >= getUnmortgageCost()
    })

    const canSellHouses = computed(() => {
      return property.value && property.value.houses > 0 && housesToSell.value > 0
    })

    const canSellHotel = computed(() => {
      if (!property.value || !property.value.hasHotel) return false
      return gameState.bank.houses >= 4 // Need 4 houses to replace hotel
    })

    // Warning messages
    const getSellWarning = () => {
      if (!property.value) return 'Property not found'
      if (property.value.houses > 0 || property.value.hasHotel) {
        return 'Must sell all houses and hotels first'
      }
      return 'Cannot sell property'
    }

    const getMortgageWarning = () => {
      if (!property.value) return 'Property not found'
      if (property.value.isMortgaged) return 'Property already mortgaged'
      if (property.value.houses > 0 || property.value.hasHotel) {
        return 'Must sell all houses and hotels first'
      }
      return 'Cannot mortgage property'
    }

    // Actions
    const sellProperty = async () => {
      if (!canSellProperty.value || isProcessing.value) return

      isProcessing.value = true
      
      try {
        const result = gameActions.sellPropertyToBank(props.currentPlayer.id, props.propertyId)
        
        if (result.success) {
          emit('transaction', {
            type: 'sell',
            propertyId: props.propertyId,
            amount: result.salePrice,
            player: props.currentPlayer
          })
          closeModal()
        } else {
          alert(`Cannot sell property: ${result.reason}`)
        }
      } catch (error) {
        console.error('Sell property error:', error)
        alert('An error occurred while selling. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const mortgageProperty = async () => {
      if (!canMortgageProperty.value || isProcessing.value) return

      isProcessing.value = true
      
      try {
        const result = gameActions.mortgageProperty(props.currentPlayer.id, props.propertyId)
        
        if (result.success) {
          emit('transaction', {
            type: 'mortgage',
            propertyId: props.propertyId,
            amount: result.amount,
            player: props.currentPlayer
          })
        } else {
          alert(`Cannot mortgage property: ${result.reason}`)
        }
      } catch (error) {
        console.error('Mortgage property error:', error)
        alert('An error occurred while mortgaging. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const unmortgageProperty = async () => {
      if (!canUnmortgageProperty.value || isProcessing.value) return

      isProcessing.value = true
      
      try {
        const result = gameActions.unmortgageProperty(props.currentPlayer.id, props.propertyId)
        
        if (result.success) {
          emit('transaction', {
            type: 'unmortgage',
            propertyId: props.propertyId,
            amount: result.cost,
            player: props.currentPlayer
          })
        } else {
          alert(`Cannot unmortgage property: ${result.reason}`)
        }
      } catch (error) {
        console.error('Unmortgage property error:', error)
        alert('An error occurred while unmortgaging. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const sellHouses = async () => {
      if (!canSellHouses.value || isProcessing.value) return

      isProcessing.value = true
      
      try {
        const result = gameActions.sellHouses(props.currentPlayer.id, props.propertyId, housesToSell.value)
        
        if (result.success) {
          emit('transaction', {
            type: 'sell-houses',
            propertyId: props.propertyId,
            amount: result.amount,
            housesSold: result.housesSold,
            player: props.currentPlayer
          })
          
          // Reset houses to sell if no more houses
          if (property.value.houses === 0) {
            housesToSell.value = 1
          } else {
            housesToSell.value = Math.min(housesToSell.value, property.value.houses)
          }
        } else {
          alert(`Cannot sell houses: ${result.reason}`)
        }
      } catch (error) {
        console.error('Sell houses error:', error)
        alert('An error occurred while selling houses. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const sellHotel = async () => {
      if (!canSellHotel.value || isProcessing.value) return

      isProcessing.value = true
      
      try {
        const result = gameActions.sellHotel(props.currentPlayer.id, props.propertyId)
        
        if (result.success) {
          emit('transaction', {
            type: 'sell-hotel',
            propertyId: props.propertyId,
            amount: result.amount,
            player: props.currentPlayer
          })
          
          // Switch to houses tab since hotel becomes houses
          activeTab.value = 'development'
        } else {
          alert(`Cannot sell hotel: ${result.reason}`)
        }
      } catch (error) {
        console.error('Sell hotel error:', error)
        alert('An error occurred while selling hotel. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const closeModal = () => {
      if (!isProcessing.value) {
        emit('close')
      }
    }

    // Watch for property changes
    watch(() => props.propertyId, () => {
      isProcessing.value = false
      activeTab.value = 'sell'
      housesToSell.value = 1
    })

    // Watch for houses count changes
    watch(() => property.value?.houses, (newHouses) => {
      if (newHouses !== undefined) {
        housesToSell.value = Math.min(housesToSell.value, Math.max(1, newHouses))
      }
    })

    return {
      activeTab,
      isProcessing,
      housesToSell,
      property,
      availableTabs,
      getMortgageValue,
      getUnmortgageCost,
      getSalePrice,
      getDevelopmentValue,
      getCurrentRent,
      getMoneyAfterMortgageAction,
      canSellProperty,
      canMortgageProperty,
      canUnmortgageProperty,
      canSellHouses,
      canSellHotel,
      getSellWarning,
      getMortgageWarning,
      sellProperty,
      mortgageProperty,
      unmortgageProperty,
      sellHouses,
      sellHotel,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-sale-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.property-info {
  padding: 24px;
}

.property-name-section {
  text-align: center;
  margin-bottom: 24px;
}

.property-name-section h4 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.property-status {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.property-status span {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-owned {
  background: #e8f5e8;
  color: #27ae60;
}

.status-mortgaged {
  background: #fff3cd;
  color: #856404;
}

.status-developed {
  background: #e1ecf4;
  color: #0c5460;
}

.current-value-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.value-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #2c3e50;
}

.amount {
  font-weight: 700;
  color: #27ae60;
}

.amount.positive {
  color: #27ae60;
}

.amount.negative {
  color: #e74c3c;
}

.development-status {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.development-status h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.development-details {
  display: grid;
  gap: 12px;
}

.development-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.development-warning {
  padding: 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}

.action-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover:not(:disabled) {
  background: #f8f9fa;
  color: #2c3e50;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-content {
  padding: 24px;
}

.action-info {
  margin-bottom: 24px;
}

.action-info h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.action-info p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.transaction-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sell-btn {
  background: #e74c3c;
  color: white;
}

.sell-btn:not(:disabled):hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.mortgage-btn {
  background: #f39c12;
  color: white;
}

.mortgage-btn:not(:disabled):hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.unmortgage-btn {
  background: #27ae60;
  color: white;
}

.unmortgage-btn:not(:disabled):hover {
  background: #229954;
  transform: translateY(-1px);
}

.sell-development-btn {
  background: #9b59b6;
  color: white;
  flex: none;
  min-width: 120px;
}

.sell-development-btn:not(:disabled):hover {
  background: #8e44ad;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.warnings, .development-inventory {
  display: grid;
  gap: 12px;
}

.warning-item {
  padding: 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 6px;
  font-weight: 600;
}

.info-item {
  padding: 12px;
  background: #e1ecf4;
  color: #0c5460;
  border-radius: 6px;
  font-weight: 600;
}

.inventory-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
}

.item-value {
  margin-left: auto;
  color: #27ae60;
  font-weight: 600;
}

.house-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.house-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.house-selector label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.house-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
}

.no-development {
  text-align: center;
  padding: 40px 20px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .action-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: 1px solid #e0e0e0;
    border-right: none;
  }
  
  .tab-btn.active {
    border-bottom-color: #e0e0e0;
    border-left: 3px solid #3498db;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .house-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>