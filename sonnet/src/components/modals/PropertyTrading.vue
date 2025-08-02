<template>
  <div class="property-trading-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Property Trading</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="trade-setup" v-if="!activeTrade">
        <div class="setup-header">
          <h4>Start New Trade</h4>
          <p>Select a trading partner and negotiate property exchanges</p>
        </div>

        <div class="partner-selection">
          <h5>Select Trading Partner</h5>
          <div class="partner-grid">
            <div 
              v-for="player in availablePartners"
              :key="player.id"
              @click="selectPartner(player)"
              class="partner-card"
              :class="{ selected: selectedPartner?.id === player.id }"
            >
              <div class="partner-info">
                <div class="partner-name" :style="{ color: player.color }">
                  {{ player.name }}
                </div>
                <div class="partner-stats">
                  <span class="money">${{ player.money.toLocaleString() }}</span>
                  <span class="properties">{{ getTotalProperties(player) }} properties</span>
                </div>
              </div>
              <div class="partner-portfolio">
                <div class="portfolio-summary">
                  <span v-if="player.properties.length > 0" class="property-count">
                    🏠 {{ player.properties.length }}
                  </span>
                  <span v-if="player.railroads.length > 0" class="railroad-count">
                    🚂 {{ player.railroads.length }}
                  </span>
                  <span v-if="player.utilities.length > 0" class="utility-count">
                    ⚡ {{ player.utilities.length }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="trade-actions" v-if="selectedPartner">
            <button @click="startTrade" class="btn start-trade-btn">
              Start Trade with {{ selectedPartner.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="active-trade" v-if="activeTrade">
        <div class="trade-header">
          <h4>Trading with {{ getPartnerName() }}</h4>
          <div class="trade-status">
            <span class="status-badge" :class="activeTrade.status">
              {{ getTradeStatusText() }}
            </span>
          </div>
        </div>

        <div class="trade-interface">
          <div class="trade-sides">
            <!-- Your Offer -->
            <div class="trade-side your-side">
              <div class="side-header">
                <h5>Your Offer</h5>
                <div class="side-player" :style="{ color: currentPlayer.color }">
                  {{ currentPlayer.name }}
                </div>
              </div>

              <div class="offer-sections">
                <!-- Money Offer -->
                <div class="money-section">
                  <h6>Money</h6>
                  <div class="money-input">
                    <label>Offer money:</label>
                    <input 
                      type="number"
                      v-model.number="yourOffer.money"
                      :max="currentPlayer.money"
                      min="0"
                      step="10"
                      class="money-amount"
                      :disabled="!canEditOffer"
                    >
                    <span class="max-money">/ ${{ currentPlayer.money.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Properties Offer -->
                <div class="properties-section">
                  <h6>Properties</h6>
                  <div class="property-list">
                    <div 
                      v-for="property in getPlayerProperties(currentPlayer)"
                      :key="property.id"
                      @click="togglePropertyOffer(property.id, 'properties')"
                      class="property-item"
                      :class="{ 
                        selected: isPropertyOffered(property.id, 'properties'),
                        disabled: !canOfferProperty(property) || !canEditOffer
                      }"
                    >
                      <div class="property-info">
                        <div class="property-name" :style="{ color: property.colorGroup }">
                          {{ property.name }}
                        </div>
                        <div class="property-details">
                          <span class="property-value">${{ property.price }}</span>
                          <span v-if="property.houses > 0" class="houses">🏠{{ property.houses }}</span>
                          <span v-if="property.hasHotel" class="hotel">🏨</span>
                          <span v-if="property.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Railroads Offer -->
                <div class="railroads-section" v-if="getPlayerRailroads(currentPlayer).length > 0">
                  <h6>Railroads</h6>
                  <div class="property-list">
                    <div 
                      v-for="railroad in getPlayerRailroads(currentPlayer)"
                      :key="railroad.id"
                      @click="togglePropertyOffer(railroad.id, 'railroads')"
                      class="property-item"
                      :class="{ 
                        selected: isPropertyOffered(railroad.id, 'railroads'),
                        disabled: !canEditOffer
                      }"
                    >
                      <div class="property-info">
                        <div class="property-name">{{ railroad.name }}</div>
                        <div class="property-details">
                          <span class="property-value">${{ railroad.price }}</span>
                          <span v-if="railroad.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Utilities Offer -->
                <div class="utilities-section" v-if="getPlayerUtilities(currentPlayer).length > 0">
                  <h6>Utilities</h6>
                  <div class="property-list">
                    <div 
                      v-for="utility in getPlayerUtilities(currentPlayer)"
                      :key="utility.id"
                      @click="togglePropertyOffer(utility.id, 'utilities')"
                      class="property-item"
                      :class="{ 
                        selected: isPropertyOffered(utility.id, 'utilities'),
                        disabled: !canEditOffer
                      }"
                    >
                      <div class="property-info">
                        <div class="property-name">{{ utility.name }}</div>
                        <div class="property-details">
                          <span class="property-value">${{ utility.price }}</span>
                          <span v-if="utility.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="offer-total">
                <div class="total-value">
                  Total Value: ${{ calculateOfferValue(yourOffer).toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Trade Direction -->
            <div class="trade-direction">
              <div class="direction-icon">⇄</div>
              <div class="trade-type">{{ getTradeDirectionText() }}</div>
            </div>

            <!-- Their Offer -->
            <div class="trade-side their-side">
              <div class="side-header">
                <h5>Their Offer</h5>
                <div class="side-player" :style="{ color: getPartner().color }">
                  {{ getPartnerName() }}
                </div>
              </div>

              <div class="offer-sections">
                <!-- Money Request -->
                <div class="money-section">
                  <h6>Money</h6>
                  <div class="money-display">
                    <span class="money-amount">
                      ${{ (theirOffer.money || 0).toLocaleString() }}
                    </span>
                    <span class="max-money">/ ${{ getPartner().money.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Properties Request -->
                <div class="properties-section">
                  <h6>Properties</h6>
                  <div class="property-list">
                    <div 
                      v-for="property in getPlayerProperties(getPartner())"
                      :key="property.id"
                      class="property-item"
                      :class="{ 
                        selected: isPropertyRequested(property.id, 'properties'),
                        disabled: !canOfferProperty(property)
                      }"
                    >
                      <div class="property-info">
                        <div class="property-name" :style="{ color: property.colorGroup }">
                          {{ property.name }}
                        </div>
                        <div class="property-details">
                          <span class="property-value">${{ property.price }}</span>
                          <span v-if="property.houses > 0" class="houses">🏠{{ property.houses }}</span>
                          <span v-if="property.hasHotel" class="hotel">🏨</span>
                          <span v-if="property.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Railroads Request -->
                <div class="railroads-section" v-if="getPlayerRailroads(getPartner()).length > 0">
                  <h6>Railroads</h6>
                  <div class="property-list">
                    <div 
                      v-for="railroad in getPlayerRailroads(getPartner())"
                      :key="railroad.id"
                      class="property-item"
                      :class="{ selected: isPropertyRequested(railroad.id, 'railroads') }"
                    >
                      <div class="property-info">
                        <div class="property-name">{{ railroad.name }}</div>
                        <div class="property-details">
                          <span class="property-value">${{ railroad.price }}</span>
                          <span v-if="railroad.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Utilities Request -->
                <div class="utilities-section" v-if="getPlayerUtilities(getPartner()).length > 0">
                  <h6>Utilities</h6>
                  <div class="property-list">
                    <div 
                      v-for="utility in getPlayerUtilities(getPartner())"
                      :key="utility.id"
                      class="property-item"
                      :class="{ selected: isPropertyRequested(utility.id, 'utilities') }"
                    >
                      <div class="property-info">
                        <div class="property-name">{{ utility.name }}</div>
                        <div class="property-details">
                          <span class="property-value">${{ utility.price }}</span>
                          <span v-if="utility.isMortgaged" class="mortgaged">🏦</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="offer-total">
                <div class="total-value">
                  Total Value: ${{ calculateOfferValue(theirOffer).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <div class="trade-balance">
            <div class="balance-info">
              <span class="balance-label">Trade Balance:</span>
              <span class="balance-value" :class="getBalanceClass()">
                {{ getBalanceText() }}
              </span>
            </div>
          </div>

          <div class="trade-actions">
            <button 
              v-if="canProposeTrade"
              @click="proposeTrade"
              :disabled="!isValidTrade || isProcessing"
              class="btn propose-btn"
            >
              {{ isProcessing ? 'Proposing...' : 'Propose Trade' }}
            </button>
            
            <button 
              v-if="canModifyTrade"
              @click="modifyTrade"
              :disabled="!isValidTrade || isProcessing"
              class="btn modify-btn"
            >
              {{ isProcessing ? 'Updating...' : 'Update Offer' }}
            </button>

            <button 
              @click="cancelTrade"
              :disabled="isProcessing"
              class="btn cancel-trade-btn"
            >
              Cancel Trade
            </button>
          </div>
        </div>
      </div>

      <div class="trade-history" v-if="pendingTrades.length > 0">
        <h5>Pending Trades</h5>
        <div class="pending-trades">
          <div 
            v-for="trade in pendingTrades"
            :key="trade.id"
            class="pending-trade"
          >
            <div class="trade-info">
              <div class="trade-participants">
                {{ getPlayerName(trade.fromPlayer) }} ⇄ {{ getPlayerName(trade.toPlayer) }}
              </div>
              <div class="trade-summary">
                {{ getTradesSummary(trade) }}
              </div>
            </div>
            <div class="trade-actions">
              <button 
                v-if="trade.toPlayer === currentPlayer.id"
                @click="respondToTrade(trade.id, true)"
                class="btn accept-btn small"
              >
                Accept
              </button>
              <button 
                v-if="trade.toPlayer === currentPlayer.id"
                @click="respondToTrade(trade.id, false)"
                class="btn reject-btn small"
              >
                Reject
              </button>
              <button 
                v-if="trade.fromPlayer === currentPlayer.id"
                @click="cancelPendingTrade(trade.id)"
                class="btn cancel-btn small"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="trading-tips">
        <h5>💡 Trading Tips</h5>
        <ul>
          <li>Complete monopolies are valuable - consider the rent potential</li>
          <li>Railroads and utilities work better in groups</li>
          <li>Factor in development potential when trading</li>
          <li>Consider blocking opponents from completing their monopolies</li>
          <li>Cash can be valuable for property development or emergency expenses</li>
        </ul>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { gameState, gameActions } from '../../game/gameState.js'

export default {
  name: 'PropertyTrading',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    currentPlayer: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'trade'],

  setup(props, { emit }) {
    const selectedPartner = ref(null)
    const activeTrade = ref(null)
    const isProcessing = ref(false)
    
    // Trade offers
    const yourOffer = ref({
      money: 0,
      properties: [],
      railroads: [],
      utilities: []
    })
    
    const theirOffer = ref({
      money: 0,
      properties: [],
      railroads: [],
      utilities: []
    })

    // Available trading partners
    const availablePartners = computed(() => {
      return gameState.players.filter(p => 
        p.id !== props.currentPlayer.id && 
        p.isActive && 
        !p.isBankrupt
      )
    })

    // Pending trades
    const pendingTrades = computed(() => {
      return gameState.pendingActions.filter(action => 
        action.id && action.id.startsWith('trade_') &&
        (action.fromPlayer === props.currentPlayer.id || action.toPlayer === props.currentPlayer.id)
      )
    })

    // Trade status
    const canEditOffer = computed(() => {
      return !activeTrade.value || activeTrade.value.status === 'draft'
    })

    const canProposeTrade = computed(() => {
      return !activeTrade.value || activeTrade.value.status === 'draft'
    })

    const canModifyTrade = computed(() => {
      return activeTrade.value && activeTrade.value.status === 'counter'
    })

    const isValidTrade = computed(() => {
      const yourTotal = calculateOfferValue(yourOffer.value)
      const theirTotal = calculateOfferValue(theirOffer.value)
      return yourTotal > 0 || theirTotal > 0
    })

    // Helper methods
    const getTotalProperties = (player) => {
      return (player.properties?.length || 0) + 
             (player.railroads?.length || 0) + 
             (player.utilities?.length || 0)
    }

    const getPlayerProperties = (player) => {
      return player.properties?.map(id => gameState.properties[id]).filter(Boolean) || []
    }

    const getPlayerRailroads = (player) => {
      return player.railroads?.map(id => gameState.railroads[id]).filter(Boolean) || []
    }

    const getPlayerUtilities = (player) => {
      return player.utilities?.map(id => gameState.utilities[id]).filter(Boolean) || []
    }

    const getPartner = () => {
      return selectedPartner.value || gameState.players.find(p => 
        p.id === activeTrade.value?.toPlayer || p.id === activeTrade.value?.fromPlayer
      )
    }

    const getPartnerName = () => {
      return getPartner()?.name || 'Unknown Player'
    }

    const getPlayerName = (playerId) => {
      return gameState.players.find(p => p.id === playerId)?.name || 'Unknown'
    }

    const canOfferProperty = (property) => {
      return property && !property.isMortgaged && property.houses === 0 && !property.hasHotel
    }

    const isPropertyOffered = (propertyId, type) => {
      return yourOffer.value[type].includes(propertyId)
    }

    const isPropertyRequested = (propertyId, type) => {
      return theirOffer.value[type].includes(propertyId)
    }

    const calculateOfferValue = (offer) => {
      let total = offer.money || 0
      
      // Add property values
      offer.properties?.forEach(id => {
        const property = gameState.properties[id]
        if (property) total += property.price
      })
      
      offer.railroads?.forEach(id => {
        const railroad = gameState.railroads[id]
        if (railroad) total += railroad.price
      })
      
      offer.utilities?.forEach(id => {
        const utility = gameState.utilities[id]
        if (utility) total += utility.price
      })
      
      return total
    }

    const getTradeStatusText = () => {
      if (!activeTrade.value) return ''
      
      const statusMap = {
        'draft': 'Draft',
        'pending': 'Waiting for Response',
        'counter': 'Counter Offer Received',
        'accepted': 'Accepted',
        'rejected': 'Rejected'
      }
      
      return statusMap[activeTrade.value.status] || activeTrade.value.status
    }

    const getTradeDirectionText = () => {
      return 'Trade Offer'
    }

    const getBalanceText = () => {
      const yourTotal = calculateOfferValue(yourOffer.value)
      const theirTotal = calculateOfferValue(theirOffer.value)
      const difference = yourTotal - theirTotal
      
      if (difference === 0) return 'Even Trade'
      if (difference > 0) return `You give $${Math.abs(difference).toLocaleString()} more`
      return `You receive $${Math.abs(difference).toLocaleString()} more`
    }

    const getBalanceClass = () => {
      const yourTotal = calculateOfferValue(yourOffer.value)
      const theirTotal = calculateOfferValue(theirOffer.value)
      const difference = yourTotal - theirTotal
      
      if (difference === 0) return 'balanced'
      if (difference > 0) return 'giving-more'
      return 'receiving-more'
    }

    const getTradesSummary = (trade) => {
      const offer = trade.offer
      const items = []
      
      if (offer.money > 0) items.push(`$${offer.money.toLocaleString()}`)
      if (offer.properties?.length > 0) items.push(`${offer.properties.length} properties`)
      if (offer.railroads?.length > 0) items.push(`${offer.railroads.length} railroads`)
      if (offer.utilities?.length > 0) items.push(`${offer.utilities.length} utilities`)
      
      return items.length > 0 ? items.join(', ') : 'No items'
    }

    // Actions
    const selectPartner = (player) => {
      selectedPartner.value = player
    }

    const startTrade = () => {
      if (!selectedPartner.value) return
      
      activeTrade.value = {
        id: 'draft_' + Date.now(),
        fromPlayer: props.currentPlayer.id,
        toPlayer: selectedPartner.value.id,
        status: 'draft'
      }
      
      // Reset offers
      yourOffer.value = {
        money: 0,
        properties: [],
        railroads: [],
        utilities: []
      }
      
      theirOffer.value = {
        money: 0,
        properties: [],
        railroads: [],
        utilities: []
      }
    }

    const togglePropertyOffer = (propertyId, type) => {
      if (!canEditOffer.value) return
      
      const property = gameState.properties[propertyId] || 
                     gameState.railroads[propertyId] || 
                     gameState.utilities[propertyId]
      
      if (!canOfferProperty(property)) return
      
      const index = yourOffer.value[type].indexOf(propertyId)
      if (index === -1) {
        yourOffer.value[type].push(propertyId)
      } else {
        yourOffer.value[type].splice(index, 1)
      }
    }

    const proposeTrade = async () => {
      if (!isValidTrade.value || isProcessing.value) return
      
      isProcessing.value = true
      
      try {
        const result = gameActions.proposePropertyTrade(
          props.currentPlayer.id,
          getPartner().id,
          yourOffer.value
        )
        
        if (result.success) {
          emit('trade', {
            type: 'propose',
            tradeId: result.tradeId,
            partner: getPartner(),
            offer: yourOffer.value
          })
          
          activeTrade.value.status = 'pending'
          activeTrade.value.id = result.tradeId
        } else {
          alert(`Cannot propose trade: ${result.reason}`)
        }
      } catch (error) {
        console.error('Propose trade error:', error)
        alert('An error occurred while proposing trade. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const modifyTrade = async () => {
      // For counter offers - simplified for now
      await proposeTrade()
    }

    const cancelTrade = () => {
      activeTrade.value = null
      selectedPartner.value = null
      yourOffer.value = { money: 0, properties: [], railroads: [], utilities: [] }
      theirOffer.value = { money: 0, properties: [], railroads: [], utilities: [] }
    }

    const respondToTrade = async (tradeId, accept) => {
      isProcessing.value = true
      
      try {
        const result = gameActions.respondToTrade(tradeId, accept)
        
        if (result.success) {
          emit('trade', {
            type: accept ? 'accept' : 'reject',
            tradeId,
            message: result.message
          })
        } else {
          alert(`Cannot respond to trade: ${result.reason}`)
        }
      } catch (error) {
        console.error('Respond to trade error:', error)
        alert('An error occurred while responding to trade. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const cancelPendingTrade = async (tradeId) => {
      // Remove from pending actions
      const tradeIndex = gameState.pendingActions.findIndex(t => t.id === tradeId)
      if (tradeIndex !== -1) {
        gameState.pendingActions.splice(tradeIndex, 1)
        emit('trade', { type: 'cancel', tradeId })
      }
    }

    const closeModal = () => {
      if (!isProcessing.value) {
        emit('close')
      }
    }

    // Reset when modal opens/closes
    watch(() => props.show, (show) => {
      if (!show) {
        cancelTrade()
      }
    })

    return {
      selectedPartner,
      activeTrade,
      isProcessing,
      yourOffer,
      theirOffer,
      availablePartners,
      pendingTrades,
      canEditOffer,
      canProposeTrade,
      canModifyTrade,
      isValidTrade,
      getTotalProperties,
      getPlayerProperties,
      getPlayerRailroads,
      getPlayerUtilities,
      getPartner,
      getPartnerName,
      getPlayerName,
      canOfferProperty,
      isPropertyOffered,
      isPropertyRequested,
      calculateOfferValue,
      getTradeStatusText,
      getTradeDirectionText,
      getBalanceText,
      getBalanceClass,
      getTradesSummary,
      selectPartner,
      startTrade,
      togglePropertyOffer,
      proposeTrade,
      modifyTrade,
      cancelTrade,
      respondToTrade,
      cancelPendingTrade,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-trading-modal {
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
  max-width: 1200px;
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

.trade-setup {
  padding: 24px;
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.setup-header h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.setup-header p {
  margin: 0;
  color: #7f8c8d;
}

.partner-selection h5 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.partner-card {
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.partner-card:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.partner-card.selected {
  border-color: #3498db;
  background: #e8f4fd;
}

.partner-info {
  margin-bottom: 12px;
}

.partner-name {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.partner-stats {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.money {
  font-weight: 600;
  color: #27ae60;
}

.portfolio-summary {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.property-count, .railroad-count, .utility-count {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.trade-actions {
  text-align: center;
}

.start-trade-btn {
  background: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.start-trade-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.active-trade {
  padding: 24px;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.trade-header h4 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.draft {
  background: #e9ecef;
  color: #495057;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.counter {
  background: #e1ecf4;
  color: #0c5460;
}

.trade-interface {
  display: grid;
  gap: 24px;
}

.trade-sides {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: start;
}

.trade-side {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.side-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.side-header h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.side-player {
  font-weight: 600;
  font-size: 0.9rem;
}

.offer-sections {
  padding: 20px;
  display: grid;
  gap: 20px;
}

.money-section h6,
.properties-section h6,
.railroads-section h6,
.utilities-section h6 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.money-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.money-input label {
  font-weight: 600;
  color: #34495e;
  white-space: nowrap;
}

.money-amount {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-weight: 600;
}

.max-money {
  color: #7f8c8d;
  font-size: 0.9rem;
  white-space: nowrap;
}

.money-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.property-list {
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.property-item {
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.property-item:hover:not(.disabled) {
  border-color: #3498db;
  background: #f8f9fa;
}

.property-item.selected {
  border-color: #27ae60;
  background: #e8f5e8;
}

.property-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.property-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.property-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.property-value {
  color: #27ae60;
  font-weight: 600;
}

.houses, .hotel, .mortgaged {
  font-size: 0.8rem;
}

.offer-total {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.total-value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.trade-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.direction-icon {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 8px;
}

.trade-type {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.trade-balance {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.balance-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.balance-label {
  font-weight: 600;
  color: #2c3e50;
}

.balance-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.balance-value.balanced {
  color: #27ae60;
}

.balance-value.giving-more {
  color: #e74c3c;
}

.balance-value.receiving-more {
  color: #3498db;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.propose-btn, .modify-btn {
  background: #27ae60;
  color: white;
}

.propose-btn:not(:disabled):hover,
.modify-btn:not(:disabled):hover {
  background: #229954;
  transform: translateY(-1px);
}

.cancel-trade-btn {
  background: #e74c3c;
  color: white;
}

.cancel-trade-btn:hover {
  background: #c0392b;
}

.btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.accept-btn {
  background: #27ae60;
  color: white;
}

.reject-btn {
  background: #e74c3c;
  color: white;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.pending-trades {
  display: grid;
  gap: 12px;
}

.pending-trade {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.trade-info {
  flex: 1;
}

.trade-participants {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.trade-summary {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.trade-history {
  padding: 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.trade-history h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.trading-tips {
  padding: 20px 24px;
  background: #e8f4fd;
  border-top: 1px solid #e0e0e0;
}

.trading-tips h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.trading-tips ul {
  margin: 0;
  padding-left: 20px;
}

.trading-tips li {
  margin-bottom: 8px;
  color: #34495e;
  line-height: 1.4;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .partner-grid {
    grid-template-columns: 1fr;
  }
  
  .trade-sides {
    grid-template-columns: 1fr;
  }
  
  .trade-direction {
    order: 0;
  }
  
  .your-side {
    order: 1;
  }
  
  .their-side {
    order: 2;
  }
  
  .pending-trade {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>