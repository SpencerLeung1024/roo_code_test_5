<template>
  <div class="property-auction-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Property Auction</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="auction-info" v-if="property">
        <div class="property-showcase">
          <div class="property-name" :style="{ color: property.colorGroup }">
            {{ property.name }}
          </div>
          <div class="property-type">{{ propertyTypeDisplay }}</div>
          <div class="original-price">
            List Price: ${{ property.price.toLocaleString() }}
          </div>
        </div>

        <div class="auction-status">
          <div class="auction-phase">
            <span class="phase-icon">🔨</span>
            <span class="phase-text">{{ auctionPhaseText }}</span>
          </div>
          <div v-if="auction" class="auction-timer">
            <span class="timer-label">Auction Status:</span>
            <span class="timer-value" :class="auction.status">{{ auction.status.toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <div class="auction-content" v-if="auction">
        <!-- Current Bid Information -->
        <div class="current-bid-section">
          <div class="bid-display">
            <div class="bid-amount">
              <span class="currency">$</span>
              <span class="amount">{{ auction.currentBid.toLocaleString() }}</span>
            </div>
            <div class="bid-info">
              <div v-if="auction.currentBidder" class="current-bidder">
                High Bidder: {{ getCurrentBidderName() }}
              </div>
              <div v-else class="no-bids">
                No bids yet - Starting at ${{ auction.currentBid }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bidding Interface -->
        <div class="bidding-section" v-if="auction.status === 'active' && canParticipate">
          <div class="bidding-controls">
            <div class="bid-input-group">
              <label class="bid-label">Your Bid:</label>
              <div class="bid-input-wrapper">
                <span class="currency-symbol">$</span>
                <input 
                  type="number"
                  v-model.number="bidAmount"
                  :min="getMinimumBid()"
                  :max="currentPlayer.money"
                  :step="10"
                  class="bid-input"
                  :disabled="isProcessing"
                  @keyup.enter="placeBid"
                >
              </div>
              <div class="bid-constraints">
                <span class="min-bid">Min: ${{ getMinimumBid().toLocaleString() }}</span>
                <span class="max-bid">Max: ${{ currentPlayer.money.toLocaleString() }}</span>
              </div>
            </div>

            <div class="quick-bid-buttons">
              <button 
                v-for="increment in quickBidIncrements"
                :key="increment"
                @click="setQuickBid(increment)"
                :disabled="!canAffordBid(auction.currentBid + increment) || isProcessing"
                class="btn quick-bid-btn"
              >
                +${{ increment }}
              </button>
            </div>

            <div class="bid-actions">
              <button 
                @click="placeBid"
                :disabled="!canPlaceBid || isProcessing"
                class="btn bid-btn"
                :class="{ loading: isProcessing }"
              >
                <span v-if="!isProcessing">Place Bid</span>
                <span v-else>Placing Bid...</span>
              </button>
              
              <button 
                @click="passOnAuction"
                :disabled="isProcessing"
                class="btn pass-btn"
              >
                Pass
              </button>
            </div>
          </div>

          <div class="bid-warnings" v-if="bidWarnings.length > 0">
            <div 
              v-for="warning in bidWarnings"
              :key="warning"
              class="warning-item"
            >
              ⚠️ {{ warning }}
            </div>
          </div>
        </div>

        <!-- Auction Participants -->
        <div class="participants-section">
          <h5>Auction Participants</h5>
          <div class="participants-list">
            <div 
              v-for="participant in getParticipants()"
              :key="participant.id"
              class="participant-card"
              :class="{ 
                'current-bidder': participant.id === auction.currentBidder,
                'has-passed': participant.hasPassed,
                'current-player': participant.id === currentPlayer.id
              }"
            >
              <div class="participant-info">
                <div class="participant-name" :style="{ color: participant.color }">
                  {{ participant.name }}
                </div>
                <div class="participant-money">
                  ${{ participant.money.toLocaleString() }}
                </div>
              </div>
              <div class="participant-status">
                <span v-if="participant.id === auction.currentBidder" class="status-badge high-bidder">
                  High Bidder
                </span>
                <span v-else-if="participant.hasPassed" class="status-badge passed">
                  Passed
                </span>
                <span v-else-if="participant.id === currentPlayer.id && auction.status === 'active'" class="status-badge your-turn">
                  Your Turn
                </span>
                <span v-else class="status-badge active">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Auction History -->
        <div class="auction-history" v-if="auctionHistory.length > 0">
          <h5>Bidding History</h5>
          <div class="history-list">
            <div 
              v-for="(bid, index) in auctionHistory"
              :key="index"
              class="history-item"
            >
              <div class="bid-details">
                <span class="bidder-name" :style="{ color: bid.bidder.color }">
                  {{ bid.bidder.name }}
                </span>
                <span class="bid-amount">${{ bid.amount.toLocaleString() }}</span>
              </div>
              <div class="bid-time">
                {{ formatTime(bid.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Auction Completed -->
      <div class="auction-completed" v-if="auction && auction.status === 'completed'">
        <div class="completion-info">
          <div v-if="auction.currentBidder" class="winner-announcement">
            <div class="winner-icon">🎉</div>
            <div class="winner-details">
              <div class="winner-title">Auction Won!</div>
              <div class="winner-name">
                {{ getCurrentBidderName() }} wins for ${{ auction.currentBid.toLocaleString() }}
              </div>
            </div>
          </div>
          <div v-else class="no-winner">
            <div class="no-winner-icon">📋</div>
            <div class="no-winner-text">
              <div class="no-winner-title">No Bids</div>
              <div class="no-winner-message">Property returns to bank</div>
            </div>
          </div>
        </div>

        <div class="completion-actions">
          <button @click="closeModal" class="btn close-btn">
            Close Auction
          </button>
        </div>
      </div>

      <!-- Auction Rules -->
      <div class="auction-rules">
        <h5>📋 Auction Rules</h5>
        <ul>
          <li>Bidding starts at $10 (or custom starting amount)</li>
          <li>Each bid must be higher than the current bid</li>
          <li>You cannot bid more money than you have</li>
          <li>The auction ends when all players pass or there's only one active bidder</li>
          <li>The highest bidder wins and pays their bid amount</li>
          <li>If no one bids, the property remains with the bank</li>
        </ul>
      </div>

      <div class="modal-footer" v-if="!auction || auction.status !== 'completed'">
        <div class="footer-info">
          <span class="your-money">Your Money: ${{ currentPlayer.money.toLocaleString() }}</span>
        </div>
        <button 
          @click="closeModal" 
          :disabled="auction && auction.status === 'active' && !canClose"
          class="btn cancel-btn"
        >
          {{ canClose ? 'Close' : 'Cannot Close During Active Auction' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gameState, gameActions } from '../../game/gameState.js'

export default {
  name: 'PropertyAuction',
  
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
    auctionId: {
      type: String,
      default: null
    }
  },

  emits: ['close', 'auction-complete', 'bid-placed'],

  setup(props, { emit }) {
    const bidAmount = ref(0)
    const isProcessing = ref(false)
    const auctionHistory = ref([])
    const participantStates = ref({})

    // Property and auction information
    const property = computed(() => {
      if (!props.propertyId) return null
      return gameState.properties[props.propertyId] ||
             gameState.railroads[props.propertyId] ||
             gameState.utilities[props.propertyId]
    })

    const auction = computed(() => {
      if (!props.auctionId) return null
      return gameState.pendingActions.find(action => action.id === props.auctionId)
    })

    const propertyTypeDisplay = computed(() => {
      if (!property.value) return ''
      if (gameState.properties[props.propertyId]) return 'Property'
      if (gameState.railroads[props.propertyId]) return 'Railroad'
      if (gameState.utilities[props.propertyId]) return 'Utility'
      return 'Property'
    })

    const auctionPhaseText = computed(() => {
      if (!auction.value) return 'Preparing Auction'
      
      const phaseMap = {
        'active': 'Bidding in Progress',
        'completed': 'Auction Complete',
        'cancelled': 'Auction Cancelled'
      }
      
      return phaseMap[auction.value.status] || 'Unknown Phase'
    })

    // Participation and bidding
    const canParticipate = computed(() => {
      return auction.value && 
             auction.value.participants.includes(props.currentPlayer.id) &&
             !participantStates.value[props.currentPlayer.id]?.hasPassed
    })

    const canClose = computed(() => {
      return !auction.value || 
             auction.value.status !== 'active' ||
             !canParticipate.value
    })

    const quickBidIncrements = computed(() => {
      const currentBid = auction.value?.currentBid || 10
      return [10, 25, 50, 100].filter(increment => 
        canAffordBid(currentBid + increment)
      )
    })

    // Bid validation
    const getMinimumBid = () => {
      if (!auction.value) return 10
      return auction.value.currentBid + 1
    }

    const canAffordBid = (amount) => {
      return props.currentPlayer.money >= amount
    }

    const canPlaceBid = computed(() => {
      return bidAmount.value >= getMinimumBid() &&
             canAffordBid(bidAmount.value) &&
             canParticipate.value &&
             !isProcessing.value
    })

    const bidWarnings = computed(() => {
      const warnings = []
      
      if (bidAmount.value > 0) {
        if (bidAmount.value < getMinimumBid()) {
          warnings.push(`Minimum bid is $${getMinimumBid().toLocaleString()}`)
        }
        
        if (bidAmount.value > props.currentPlayer.money) {
          warnings.push('Insufficient funds for this bid')
        }
        
        if (bidAmount.value > property.value?.price * 2) {
          warnings.push('Bid is significantly higher than list price')
        }
      }
      
      return warnings
    })

    // Participant management
    const getParticipants = () => {
      if (!auction.value) return []
      
      return auction.value.participants.map(playerId => {
        const player = gameState.players.find(p => p.id === playerId)
        return {
          ...player,
          hasPassed: participantStates.value[playerId]?.hasPassed || false
        }
      }).filter(Boolean)
    }

    const getCurrentBidderName = () => {
      if (!auction.value?.currentBidder) return ''
      const bidder = gameState.players.find(p => p.id === auction.value.currentBidder)
      return bidder?.name || 'Unknown'
    }

    // Actions
    const setQuickBid = (increment) => {
      if (!auction.value) return
      bidAmount.value = auction.value.currentBid + increment
    }

    const placeBid = async () => {
      if (!canPlaceBid.value || isProcessing.value) return

      isProcessing.value = true

      try {
        const result = gameActions.placeBid(props.auctionId, props.currentPlayer.id, bidAmount.value)
        
        if (result.success) {
          // Add to auction history
          auctionHistory.value.unshift({
            bidder: props.currentPlayer,
            amount: bidAmount.value,
            timestamp: new Date()
          })

          emit('bid-placed', {
            auctionId: props.auctionId,
            playerId: props.currentPlayer.id,
            amount: bidAmount.value
          })

          // Reset bid amount for next bid
          bidAmount.value = getMinimumBid()
        } else {
          alert(`Cannot place bid: ${result.reason}`)
        }
      } catch (error) {
        console.error('Place bid error:', error)
        alert('An error occurred while placing bid. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    const passOnAuction = () => {
      if (!canParticipate.value) return

      // Mark player as passed
      participantStates.value[props.currentPlayer.id] = { hasPassed: true }

      // Check if auction should end
      const activeBidders = getParticipants().filter(p => !p.hasPassed)
      
      if (activeBidders.length <= 1) {
        completeAuction()
      }
    }

    const completeAuction = async () => {
      if (!auction.value) return

      try {
        const result = gameActions.completeAuction(props.auctionId)
        
        if (result.success) {
          emit('auction-complete', {
            auctionId: props.auctionId,
            winner: auction.value.currentBidder,
            finalBid: auction.value.currentBid,
            property: property.value
          })
        }
      } catch (error) {
        console.error('Complete auction error:', error)
      }
    }

    const closeModal = () => {
      if (canClose.value) {
        emit('close')
      }
    }

    // Utility functions
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    // Initialize auction
    const initializeAuction = () => {
      if (auction.value) {
        bidAmount.value = getMinimumBid()
        
        // Initialize participant states
        auction.value.participants.forEach(playerId => {
          participantStates.value[playerId] = { hasPassed: false }
        })
      }
    }

    // Watch for auction changes
    watch(() => props.auctionId, () => {
      initializeAuction()
      auctionHistory.value = []
    })

    watch(() => auction.value?.status, (newStatus) => {
      if (newStatus === 'completed') {
        // Small delay to show final state before allowing close
        setTimeout(() => {
          // Auto-close after completion if desired
          // closeModal()
        }, 2000)
      }
    })

    // Auto-bid simulation for non-current players (simplified)
    const simulateAIBidding = () => {
      if (!auction.value || auction.value.status !== 'active') return

      const otherParticipants = getParticipants().filter(p => 
        p.id !== props.currentPlayer.id && 
        !p.hasPassed &&
        p.id !== auction.value.currentBidder
      )

      // Simple AI: occasionally bid if property value seems reasonable
      otherParticipants.forEach(participant => {
        const shouldBid = Math.random() < 0.3 // 30% chance
        const maxBid = Math.min(participant.money, property.value?.price * 1.2)
        const nextBid = auction.value.currentBid + 10 + Math.floor(Math.random() * 40)

        if (shouldBid && nextBid <= maxBid && nextBid <= participant.money) {
          setTimeout(() => {
            if (auction.value && auction.value.status === 'active') {
              gameActions.placeBid(props.auctionId, participant.id, nextBid)
              
              auctionHistory.value.unshift({
                bidder: participant,
                amount: nextBid,
                timestamp: new Date()
              })
            }
          }, 1000 + Math.random() * 3000) // 1-4 second delay
        } else {
          // Pass after a delay
          setTimeout(() => {
            participantStates.value[participant.id] = { hasPassed: true }
          }, 500 + Math.random() * 2000)
        }
      })
    }

    // Initialize when component mounts
    onMounted(() => {
      initializeAuction()
      
      // Start AI bidding simulation after a delay
      if (auction.value?.status === 'active') {
        setTimeout(simulateAIBidding, 2000)
      }
    })

    return {
      bidAmount,
      isProcessing,
      auctionHistory,
      property,
      auction,
      propertyTypeDisplay,
      auctionPhaseText,
      canParticipate,
      canClose,
      quickBidIncrements,
      getMinimumBid,
      canAffordBid,
      canPlaceBid,
      bidWarnings,
      getParticipants,
      getCurrentBidderName,
      setQuickBid,
      placeBid,
      passOnAuction,
      completeAuction,
      closeModal,
      formatTime
    }
  }
}
</script>

<style scoped>
.property-auction-modal {
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
  max-width: 800px;
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

.auction-info {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.property-showcase {
  text-align: center;
  margin-bottom: 20px;
}

.property-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.property-type {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.original-price {
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.9;
}

.auction-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auction-phase {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phase-icon {
  font-size: 1.5rem;
}

.phase-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.auction-timer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer-label {
  font-weight: 600;
}

.timer-value {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.timer-value.active {
  background: rgba(255, 255, 255, 0.2);
}

.timer-value.completed {
  background: rgba(46, 204, 113, 0.3);
}

.auction-content {
  padding: 24px;
}

.current-bid-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
}

.bid-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bid-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 2rem;
  font-weight: 600;
}

.amount {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
}

.bid-info {
  font-size: 1.1rem;
  font-weight: 600;
}

.current-bidder {
  opacity: 0.95;
}

.no-bids {
  opacity: 0.9;
}

.bidding-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.bidding-controls {
  display: grid;
  gap: 20px;
}

.bid-input-group {
  display: grid;
  gap: 12px;
}

.bid-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.bid-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  font-weight: 600;
  color: #7f8c8d;
  font-size: 1.2rem;
}

.bid-input {
  width: 100%;
  padding: 16px 16px 16px 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  transition: all 0.2s;
}

.bid-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.bid-constraints {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.min-bid {
  color: #e74c3c;
  font-weight: 600;
}

.max-bid {
  color: #27ae60;
  font-weight: 600;
}

.quick-bid-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-bid-btn {
  flex: 1;
  min-width: 80px;
  padding: 10px 16px;
  background: #ecf0f1;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-bid-btn:not(:disabled):hover {
  background: #d5dbdb;
  border-color: #95a5a6;
  transform: translateY(-1px);
}

.quick-bid-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.bid-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.bid-btn {
  background: #27ae60;
  color: white;
}

.bid-btn:not(:disabled):hover {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.pass-btn {
  background: #95a5a6;
  color: white;
}

.pass-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.bid-warnings {
  margin-top: 16px;
  display: grid;
  gap: 8px;
}

.warning-item {
  padding: 8px 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.participants-section {
  margin-bottom: 24px;
}

.participants-section h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.participants-list {
  display: grid;
  gap: 12px;
}

.participant-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s;
}

.participant-card.current-bidder {
  border-color: #f39c12;
  background: #fef9e7;
}

.participant-card.has-passed {
  opacity: 0.6;
  background: #f8f9fa;
}

.participant-card.current-player {
  border-color: #3498db;
  background: #e8f4fd;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.participant-name {
  font-weight: 700;
  font-size: 1rem;
}

.participant-money {
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.high-bidder {
  background: #f39c12;
  color: white;
}

.status-badge.passed {
  background: #95a5a6;
  color: white;
}

.status-badge.your-turn {
  background: #3498db;
  color: white;
}

.status-badge.active {
  background: #27ae60;
  color: white;
}

.auction-history {
  margin-bottom: 24px;
}

.auction-history h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.history-list {
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.bid-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bidder-name {
  font-weight: 600;
}

.bid-amount {
  color: #27ae60;
  font-weight: 700;
}

.bid-time {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.auction-completed {
  padding: 32px 24px;
  text-align: center;
}

.completion-info {
  margin-bottom: 24px;
}

.winner-announcement, .no-winner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
}

.winner-announcement {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.no-winner {
  background: #f8f9fa;
  border: 2px dashed #bdc3c7;
}

.winner-icon, .no-winner-icon {
  font-size: 3rem;
}

.winner-title, .no-winner-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.winner-name, .no-winner-message {
  font-size: 1.1rem;
  opacity: 0.9;
}

.completion-actions {
  display: flex;
  justify-content: center;
}

.auction-rules {
  padding: 20px 24px;
  background: #e8f4fd;
  border-top: 1px solid #e0e0e0;
}

.auction-rules h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.auction-rules ul {
  margin: 0;
  padding-left: 20px;
}

.auction-rules li {
  margin-bottom: 8px;
  color: #34495e;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.footer-info {
  color: #2c3e50;
  font-weight: 600;
}

.your-money {
  font-size: 1.1rem;
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

.cancel-btn:not(:disabled):hover {
  background: #7f8c8d;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .auction-status {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .bid-amount .amount {
    font-size: 2.5rem;
  }
  
  .quick-bid-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bid-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>