<template>
  <div class="property-purchase-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Purchase Property</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="property-info" v-if="property">
        <div class="property-name-section">
          <h4 :style="{ color: property.colorGroup }">{{ property.name }}</h4>
          <div class="property-type">{{ propertyTypeDisplay }}</div>
        </div>

        <div class="property-details">
          <div class="price-section">
            <div class="price-main">
              <span class="price-label">Purchase Price:</span>
              <span class="price-amount">${{ property.price.toLocaleString() }}</span>
            </div>
            
            <div class="rent-info" v-if="property.rent">
              <div class="rent-item">
                <span>Base Rent:</span>
                <span>${{ property.rent[0] }}</span>
              </div>
              <div class="rent-item" v-if="property.rent[1]">
                <span>With 1 House:</span>
                <span>${{ property.rent[1] }}</span>
              </div>
              <div class="rent-item" v-if="property.rent[2]">
                <span>With 2 Houses:</span>
                <span>${{ property.rent[2] }}</span>
              </div>
              <div class="rent-item" v-if="property.rent[3]">
                <span>With 3 Houses:</span>
                <span>${{ property.rent[3] }}</span>
              </div>
              <div class="rent-item" v-if="property.rent[4]">
                <span>With 4 Houses:</span>
                <span>${{ property.rent[4] }}</span>
              </div>
              <div class="rent-item" v-if="property.rent[5]">
                <span>With Hotel:</span>
                <span>${{ property.rent[5] }}</span>
              </div>
            </div>

            <div class="railroad-rent-info" v-if="property.rentSchedule">
              <div class="rent-item">
                <span>1 Railroad:</span>
                <span>${{ property.rentSchedule[0] }}</span>
              </div>
              <div class="rent-item">
                <span>2 Railroads:</span>
                <span>${{ property.rentSchedule[1] }}</span>
              </div>
              <div class="rent-item">
                <span>3 Railroads:</span>
                <span>${{ property.rentSchedule[2] }}</span>
              </div>
              <div class="rent-item">
                <span>4 Railroads:</span>
                <span>${{ property.rentSchedule[3] }}</span>
              </div>
            </div>

            <div class="utility-rent-info" v-if="property.rentMultipliers">
              <div class="rent-item">
                <span>1 Utility:</span>
                <span>{{ property.rentMultipliers[0] }}× dice roll</span>
              </div>
              <div class="rent-item">
                <span>2 Utilities:</span>
                <span>{{ property.rentMultipliers[1] }}× dice roll</span>
              </div>
            </div>

            <div class="development-info" v-if="property.houseCost">
              <div class="development-item">
                <span>House Cost:</span>
                <span>${{ property.houseCost }}</span>
              </div>
              <div class="development-item">
                <span>Mortgage Value:</span>
                <span>${{ property.mortgageValue || Math.floor(property.price / 2) }}</span>
              </div>
            </div>
          </div>

          <div class="color-group-info" v-if="property.colorGroupName">
            <h5>{{ property.colorGroupName }} Properties</h5>
            <div class="group-properties">
              <div 
                v-for="propId in property.groupProperties || []"
                :key="propId"
                class="group-property"
                :class="{ owned: isPropertyOwned(propId) }"
              >
                <span class="property-name">{{ getPropertyName(propId) }}</span>
                <span class="ownership-status">
                  {{ getOwnershipStatus(propId) }}
                </span>
              </div>
            </div>
            <div class="monopoly-potential" v-if="monopolyInfo.canCreateMonopoly">
              <span class="monopoly-label">🏆 Would complete monopoly!</span>
              <span class="monopoly-benefit">Double rent + building eligibility</span>
            </div>
          </div>
        </div>
      </div>

      <div class="purchase-decision">
        <div class="affordability-check">
          <div class="player-money">
            <span class="label">Your Money:</span>
            <span class="amount" :class="{ insufficient: !canAfford }">
              ${{ currentPlayer.money.toLocaleString() }}
            </span>
          </div>
          <div class="after-purchase" v-if="canAfford">
            <span class="label">After Purchase:</span>
            <span class="amount">${{ (currentPlayer.money - property.price).toLocaleString() }}</span>
          </div>
          <div class="insufficient-funds" v-else>
            <span class="warning">⚠️ Insufficient funds</span>
            <span class="needed">Need ${{ (property.price - currentPlayer.money).toLocaleString() }} more</span>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            @click="purchaseProperty"
            :disabled="!canAfford || isPurchasing"
            class="btn purchase-btn"
            :class="{ loading: isPurchasing }"
          >
            <span v-if="!isPurchasing">{{ canAfford ? 'Purchase Property' : 'Cannot Afford' }}</span>
            <span v-else>Purchasing...</span>
          </button>
          
          <button 
            v-if="gameOptions.auctionUnbought"
            @click="declineAndAuction"
            :disabled="isPurchasing"
            class="btn auction-btn"
          >
            Decline (Start Auction)
          </button>
          
          <button 
            @click="closeModal"
            :disabled="isPurchasing"
            class="btn cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>

      <div class="purchase-strategy-tips" v-if="showTips">
        <h5>💡 Purchase Strategy</h5>
        <ul>
          <li v-if="monopolyInfo.canCreateMonopoly">
            This completes a monopoly - excellent investment for development!
          </li>
          <li v-if="monopolyInfo.blocksOpponent">
            Prevents {{ monopolyInfo.opponentName }} from completing their monopoly
          </li>
          <li v-if="property.rentSchedule && currentPlayer.railroads.length > 0">
            Adds to your railroad network ({{ currentPlayer.railroads.length + 1 }} total)
          </li>
          <li v-if="property.rentMultipliers && currentPlayer.utilities.length > 0">
            Completes utility pair for higher rent multiplier
          </li>
          <li v-if="property.price < 150">
            Low-cost property with good rental frequency
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameState, gameActions } from '../../game/gameState.js'

export default {
  name: 'PropertyPurchase',
  
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
    },
    gameOptions: {
      type: Object,
      default: () => ({})
    },
    showTips: {
      type: Boolean,
      default: true
    }
  },

  emits: ['close', 'purchase', 'auction'],

  setup(props, { emit }) {
    const isPurchasing = ref(false)

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

    // Affordability check
    const canAfford = computed(() => {
      return property.value && props.currentPlayer.money >= property.value.price
    })

    // Monopoly analysis
    const monopolyInfo = computed(() => {
      if (!property.value || !property.value.groupProperties) {
        return { canCreateMonopoly: false, blocksOpponent: false }
      }

      const groupProperties = property.value.groupProperties
      const ownedByCurrentPlayer = groupProperties.filter(id => {
        const prop = gameState.properties[id]
        return prop && prop.ownerId === props.currentPlayer.id
      }).length

      const ownedByOthers = groupProperties.filter(id => {
        const prop = gameState.properties[id]
        return prop && prop.ownerId && prop.ownerId !== props.currentPlayer.id
      })

      const canCreateMonopoly = ownedByCurrentPlayer === groupProperties.length - 1
      const blocksOpponent = ownedByOthers.length > 0

      let opponentName = ''
      if (blocksOpponent) {
        const opponentId = ownedByOthers[0] ? gameState.properties[ownedByOthers[0]].ownerId : null
        const opponent = gameState.players.find(p => p.id === opponentId)
        opponentName = opponent ? opponent.name : 'another player'
      }

      return { canCreateMonopoly, blocksOpponent, opponentName }
    })

    // Helper methods
    const isPropertyOwned = (propertyId) => {
      const prop = gameState.properties[propertyId]
      return prop && prop.ownerId
    }

    const getPropertyName = (propertyId) => {
      const prop = gameState.properties[propertyId]
      return prop ? prop.name : `Property ${propertyId}`
    }

    const getOwnershipStatus = (propertyId) => {
      const prop = gameState.properties[propertyId]
      if (!prop || !prop.ownerId) return 'Available'
      if (prop.ownerId === props.currentPlayer.id) return 'You own'
      
      const owner = gameState.players.find(p => p.id === prop.ownerId)
      return owner ? `${owner.name} owns` : 'Owned'
    }

    // Actions
    const purchaseProperty = async () => {
      if (!canAfford.value || isPurchasing.value) return

      isPurchasing.value = true
      
      try {
        const validation = gameActions.validatePropertyPurchase(props.currentPlayer.id, props.propertyId)
        
        if (!validation.valid) {
          alert(`Cannot purchase: ${validation.reason}`)
          return
        }

        const success = gameActions.purchaseProperty(props.currentPlayer.id, props.propertyId)
        
        if (success) {
          emit('purchase', {
            propertyId: props.propertyId,
            price: property.value.price,
            player: props.currentPlayer
          })
          closeModal()
        } else {
          alert('Failed to purchase property. Please try again.')
        }
      } catch (error) {
        console.error('Purchase error:', error)
        alert('An error occurred during purchase. Please try again.')
      } finally {
        isPurchasing.value = false
      }
    }

    const declineAndAuction = () => {
      emit('auction', {
        propertyId: props.propertyId,
        property: property.value
      })
      closeModal()
    }

    const closeModal = () => {
      if (!isPurchasing.value) {
        emit('close')
      }
    }

    // Watch for property changes
    watch(() => props.propertyId, () => {
      isPurchasing.value = false
    })

    return {
      isPurchasing,
      property,
      propertyTypeDisplay,
      canAfford,
      monopolyInfo,
      isPropertyOwned,
      getPropertyName,
      getOwnershipStatus,
      purchaseProperty,
      declineAndAuction,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-purchase-modal {
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
  max-width: 600px;
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

.property-type {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-details {
  display: grid;
  gap: 24px;
}

.price-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.price-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.price-label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.price-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #27ae60;
}

.rent-info, .railroad-rent-info, .utility-rent-info {
  display: grid;
  gap: 8px;
}

.rent-item, .development-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.rent-item:last-child, .development-item:last-child {
  border-bottom: none;
}

.development-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.color-group-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.color-group-info h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.group-properties {
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

.ownership-status {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.group-property.owned .ownership-status {
  color: #27ae60;
  font-weight: 600;
}

.monopoly-potential {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border-radius: 6px;
  text-align: center;
}

.monopoly-label {
  display: block;
  font-weight: 700;
  margin-bottom: 4px;
}

.monopoly-benefit {
  font-size: 0.9rem;
  opacity: 0.9;
}

.purchase-decision {
  padding: 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.affordability-check {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.player-money, .after-purchase {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.after-purchase {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #2c3e50;
}

.amount {
  font-weight: 700;
  color: #27ae60;
}

.amount.insufficient {
  color: #e74c3c;
}

.insufficient-funds {
  text-align: center;
  color: #e74c3c;
}

.warning {
  display: block;
  font-weight: 700;
  margin-bottom: 4px;
}

.needed {
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 140px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.purchase-btn {
  background: #27ae60;
  color: white;
}

.purchase-btn:not(:disabled):hover {
  background: #229954;
  transform: translateY(-1px);
}

.purchase-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.auction-btn {
  background: #f39c12;
  color: white;
}

.auction-btn:hover {
  background: #e67e22;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.purchase-strategy-tips {
  padding: 20px 24px;
  background: #e8f4fd;
  border-top: 1px solid #e0e0e0;
}

.purchase-strategy-tips h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.purchase-strategy-tips ul {
  margin: 0;
  padding-left: 20px;
}

.purchase-strategy-tips li {
  margin-bottom: 8px;
  color: #34495e;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    min-width: auto;
  }
}
</style>