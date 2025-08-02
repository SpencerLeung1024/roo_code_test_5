<template>
  <div class="property-modal" v-if="show">
    <!-- Property Purchase Modal -->
    <PropertyPurchase 
      v-if="modalMode === 'purchase'"
      :show="true"
      :propertyId="propertyId"
      :currentPlayer="currentPlayer"
      :gameOptions="gameOptions"
      @close="closeModal"
      @purchase="handleTransaction"
      @auction="handleAuction"
    />

    <!-- Property Sale/Management Modal -->
    <PropertySale
      v-if="modalMode === 'manage' || modalMode === 'sell'"
      :show="true"
      :propertyId="propertyId"
      :currentPlayer="currentPlayer"
      @close="closeModal"
      @transaction="handleTransaction"
    />

    <!-- Property Development Modal -->
    <PropertyDevelopment
      v-if="modalMode === 'development'"
      :show="true"
      :currentPlayer="currentPlayer"
      @close="closeModal"
      @development="handleTransaction"
    />

    <!-- Property Trading Modal -->
    <PropertyTrading
      v-if="modalMode === 'trading'"
      :show="true"
      :currentPlayer="currentPlayer"
      @close="closeModal"
      @trade="handleTransaction"
    />

    <!-- Property Auction Modal -->
    <PropertyAuction
      v-if="modalMode === 'auction'"
      :show="true"
      :propertyId="propertyId"
      :currentPlayer="currentPlayer"
      :auctionId="auctionId"
      @close="closeModal"
      @auction-complete="handleAuctionComplete"
      @bid-placed="handleBidPlaced"
    />

    <!-- Property Manager Modal -->
    <PropertyManager
      v-if="modalMode === 'portfolio'"
      :show="true"
      :currentPlayer="currentPlayer"
      @close="closeModal"
      @open-modal="handleOpenModal"
    />

    <!-- Detailed Property Information Modal -->
    <div v-if="modalMode === 'details'" class="property-details-modal">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Property Details</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="property-details" v-if="property">
          <div class="property-showcase">
            <div class="property-name" :style="{ color: property.colorGroup }">
              {{ property.name }}
            </div>
            <div class="property-type">{{ propertyTypeDisplay }}</div>
            
            <div class="ownership-status">
              <div v-if="!property.ownerId" class="status-available">
                <span class="status-icon">🏪</span>
                <span class="status-text">Available for Purchase</span>
                <span class="status-price">${{ property.price.toLocaleString() }}</span>
              </div>
              <div v-else class="status-owned">
                <span class="status-icon">👤</span>
                <span class="status-text">Owned by {{ getOwnerName() }}</span>
                <div class="owner-color" :style="{ backgroundColor: getOwnerColor() }"></div>
              </div>
            </div>
          </div>

          <div class="property-information">
            <!-- Basic Property Info -->
            <div class="info-section">
              <h4>Property Information</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Purchase Price:</span>
                  <span class="value">${{ property.price.toLocaleString() }}</span>
                </div>
                <div class="info-item" v-if="property.mortgageValue">
                  <span class="label">Mortgage Value:</span>
                  <span class="value">${{ property.mortgageValue.toLocaleString() }}</span>
                </div>
                <div class="info-item" v-if="property.houseCost">
                  <span class="label">House Cost:</span>
                  <span class="value">${{ property.houseCost.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Rent Information -->
            <div class="info-section" v-if="property.rent">
              <h4>Rent Schedule</h4>
              <div class="rent-schedule">
                <div class="rent-item">
                  <span class="rent-label">Base Rent:</span>
                  <span class="rent-value">${{ property.rent[0] }}</span>
                </div>
                <div class="rent-item" v-if="property.rent[1]">
                  <span class="rent-label">With 1 House:</span>
                  <span class="rent-value">${{ property.rent[1] }}</span>
                </div>
                <div class="rent-item" v-if="property.rent[2]">
                  <span class="rent-label">With 2 Houses:</span>
                  <span class="rent-value">${{ property.rent[2] }}</span>
                </div>
                <div class="rent-item" v-if="property.rent[3]">
                  <span class="rent-label">With 3 Houses:</span>
                  <span class="rent-value">${{ property.rent[3] }}</span>
                </div>
                <div class="rent-item" v-if="property.rent[4]">
                  <span class="rent-label">With 4 Houses:</span>
                  <span class="rent-value">${{ property.rent[4] }}</span>
                </div>
                <div class="rent-item" v-if="property.rent[5]">
                  <span class="rent-label">With Hotel:</span>
                  <span class="rent-value">${{ property.rent[5] }}</span>
                </div>
              </div>
            </div>

            <!-- Railroad Rent -->
            <div class="info-section" v-if="property.rentSchedule">
              <h4>Railroad Rent</h4>
              <div class="rent-schedule">
                <div class="rent-item">
                  <span class="rent-label">1 Railroad:</span>
                  <span class="rent-value">${{ property.rentSchedule[0] }}</span>
                </div>
                <div class="rent-item">
                  <span class="rent-label">2 Railroads:</span>
                  <span class="rent-value">${{ property.rentSchedule[1] }}</span>
                </div>
                <div class="rent-item">
                  <span class="rent-label">3 Railroads:</span>
                  <span class="rent-value">${{ property.rentSchedule[2] }}</span>
                </div>
                <div class="rent-item">
                  <span class="rent-label">4 Railroads:</span>
                  <span class="rent-value">${{ property.rentSchedule[3] }}</span>
                </div>
              </div>
            </div>

            <!-- Utility Rent -->
            <div class="info-section" v-if="property.rentMultipliers">
              <h4>Utility Rent</h4>
              <div class="rent-schedule">
                <div class="rent-item">
                  <span class="rent-label">1 Utility:</span>
                  <span class="rent-value">{{ property.rentMultipliers[0] }}× dice roll</span>
                </div>
                <div class="rent-item">
                  <span class="rent-label">2 Utilities:</span>
                  <span class="rent-value">{{ property.rentMultipliers[1] }}× dice roll</span>
                </div>
              </div>
            </div>

            <!-- Color Group Information -->
            <div class="info-section" v-if="property.colorGroupName">
              <h4>{{ property.colorGroupName }} Properties</h4>
              <div class="color-group-properties">
                <div 
                  v-for="propId in property.groupProperties || []"
                  :key="propId"
                  class="group-property"
                  :class="{ owned: isPropertyOwned(propId) }"
                >
                  <span class="property-name">{{ getPropertyName(propId) }}</span>
                  <span class="ownership-indicator">
                    {{ getPropertyOwnership(propId) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Current Status -->
            <div class="info-section" v-if="property.ownerId">
              <h4>Current Status</h4>
              <div class="status-grid">
                <div class="status-item" v-if="property.isMortgaged">
                  <span class="status-icon">🏦</span>
                  <span class="status-text">Property is mortgaged</span>
                </div>
                <div class="status-item" v-if="property.houses > 0">
                  <span class="status-icon">🏠</span>
                  <span class="status-text">{{ property.houses }} house{{ property.houses > 1 ? 's' : '' }}</span>
                </div>
                <div class="status-item" v-if="property.hasHotel">
                  <span class="status-icon">🏨</span>
                  <span class="status-text">Hotel built</span>
                </div>
                <div class="status-item" v-if="property.isPartOfMonopoly">
                  <span class="status-icon">👑</span>
                  <span class="status-text">Part of monopoly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            v-if="canPurchase"
            @click="switchMode('purchase')"
            class="btn purchase-btn"
          >
            Purchase Property
          </button>
          
          <button 
            v-if="canManage"
            @click="switchMode('manage')"
            class="btn manage-btn"
          >
            Manage Property
          </button>
          
          <button 
            v-if="canDevelop"
            @click="switchMode('development')"
            class="btn develop-btn"
          >
            Develop Properties
          </button>
          
          <button @click="closeModal" class="btn close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { gameState } from '../../game/gameState.js'
import PropertyPurchase from './PropertyPurchase.vue'
import PropertySale from './PropertySale.vue'
import PropertyDevelopment from './PropertyDevelopment.vue'
import PropertyTrading from './PropertyTrading.vue'
import PropertyAuction from './PropertyAuction.vue'
import PropertyManager from './PropertyManager.vue'

export default {
  name: 'PropertyModal',
  
  components: {
    PropertyPurchase,
    PropertySale,
    PropertyDevelopment,
    PropertyTrading,
    PropertyAuction,
    PropertyManager
  },
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modalMode: {
      type: String,
      default: 'details',
      validator: value => [
        'details', 'purchase', 'manage', 'sell', 'development', 
        'trading', 'auction', 'portfolio'
      ].includes(value)
    },
    propertyId: {
      type: [String, Number],
      default: null
    },
    currentPlayer: {
      type: Object,
      required: true
    },
    gameOptions: {
      type: Object,
      default: () => ({})
    },
    auctionId: {
      type: String,
      default: null
    }
  },

  emits: ['close', 'mode-change', 'transaction', 'auction', 'trade'],

  setup(props, { emit }) {
    // Property information
    const property = computed(() => {
      if (!props.propertyId) return null
      return gameState.properties[props.propertyId] ||
             gameState.railroads[props.propertyId] ||
             gameState.utilities[props.propertyId]
    })

    const propertyTypeDisplay = computed(() => {
      if (!property.value) return ''
      if (gameState.properties[props.propertyId]) return 'Property'
      if (gameState.railroads[props.propertyId]) return 'Railroad'
      if (gameState.utilities[props.propertyId]) return 'Utility'
      return 'Property'
    })

    // Owner information
    const getOwnerName = () => {
      if (!property.value?.ownerId) return ''
      const owner = gameState.players.find(p => p.id === property.value.ownerId)
      return owner?.name || 'Unknown'
    }

    const getOwnerColor = () => {
      if (!property.value?.ownerId) return '#cccccc'
      const owner = gameState.players.find(p => p.id === property.value.ownerId)
      return owner?.color || '#cccccc'
    }

    // Property group helpers
    const isPropertyOwned = (propId) => {
      const prop = gameState.properties[propId]
      return prop && prop.ownerId
    }

    const getPropertyName = (propId) => {
      const prop = gameState.properties[propId]
      return prop?.name || `Property ${propId}`
    }

    const getPropertyOwnership = (propId) => {
      const prop = gameState.properties[propId]
      if (!prop || !prop.ownerId) return 'Available'
      if (prop.ownerId === props.currentPlayer.id) return 'You'
      
      const owner = gameState.players.find(p => p.id === prop.ownerId)
      return owner?.name || 'Owned'
    }

    // Action availability
    const canPurchase = computed(() => {
      return property.value && 
             !property.value.ownerId && 
             props.currentPlayer.money >= property.value.price
    })

    const canManage = computed(() => {
      return property.value && 
             property.value.ownerId === props.currentPlayer.id
    })

    const canDevelop = computed(() => {
      return props.currentPlayer.properties?.some(propId => {
        const prop = gameState.properties[propId]
        return prop && prop.canDevelop
      })
    })

    // Action handlers
    const switchMode = (newMode) => {
      emit('mode-change', newMode)
    }

    const handleTransaction = (transaction) => {
      emit('transaction', transaction)
    }

    const handleAuction = (auctionData) => {
      emit('auction', auctionData)
    }

    const handleAuctionComplete = (result) => {
      emit('auction', { type: 'complete', ...result })
    }

    const handleBidPlaced = (bidData) => {
      emit('auction', { type: 'bid', ...bidData })
    }

    const handleOpenModal = (modalData) => {
      emit('mode-change', modalData.type, modalData)
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      property,
      propertyTypeDisplay,
      getOwnerName,
      getOwnerColor,
      isPropertyOwned,
      getPropertyName,
      getPropertyOwnership,
      canPurchase,
      canManage,
      canDevelop,
      switchMode,
      handleTransaction,
      handleAuction,
      handleAuctionComplete,
      handleBidPlaced,
      handleOpenModal,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-modal {
  /* Base modal styles are handled by individual modal components */
}

.property-details-modal {
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

.property-details {
  padding: 24px;
}

.property-showcase {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.property-name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.property-type {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.ownership-status {
  margin-top: 20px;
}

.status-available,
.status-owned {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-weight: 600;
}

.status-price {
  font-weight: 700;
  font-size: 1.2rem;
}

.owner-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
}

.property-information {
  display: grid;
  gap: 24px;
}

.info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #7f8c8d;
  font-weight: 600;
}

.value {
  color: #2c3e50;
  font-weight: 600;
}

.rent-schedule {
  display: grid;
  gap: 8px;
}

.rent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.rent-label {
  color: #7f8c8d;
  font-weight: 600;
}

.rent-value {
  color: #27ae60;
  font-weight: 700;
}

.color-group-properties {
  display: grid;
  gap: 8px;
}

.group-property {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.group-property.owned {
  background: #e8f5e8;
  border-color: #27ae60;
}

.property-name {
  font-weight: 600;
  color: #2c3e50;
}

.ownership-indicator {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 600;
}

.group-property.owned .ownership-indicator {
  color: #27ae60;
}

.status-grid {
  display: grid;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  color: #2c3e50;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
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

.purchase-btn {
  background: #27ae60;
  color: white;
}

.purchase-btn:hover {
  background: #229954;
  transform: translateY(-1px);
}

.manage-btn {
  background: #3498db;
  color: white;
}

.manage-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.develop-btn {
  background: #9b59b6;
  color: white;
}

.develop-btn:hover {
  background: #8e44ad;
  transform: translateY(-1px);
}

.modal-actions .close-btn {
  background: #95a5a6;
  color: white;
  font-size: 1rem;
  width: auto;
  height: auto;
  border-radius: 6px;
}

.modal-actions .close-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .property-name {
    font-size: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .status-available,
  .status-owned {
    flex-direction: column;
    gap: 8px;
  }
}
</style>