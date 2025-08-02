<template>
  <div class="jail-card-manager">
    <!-- Jail Card Inventory Display -->
    <div class="jail-card-inventory" v-if="jailCards.length > 0">
      <h4 class="inventory-title">
        <span class="title-icon">🔓</span>
        Get Out of Jail Free Cards ({{ jailCards.length }})
      </h4>
      
      <div class="jail-cards-container">
        <div 
          class="jail-card"
          v-for="(card, index) in jailCards"
          :key="`jail-card-${index}`"
          :class="{ 'useable': canUseCard, 'tradeable': canTradeCard }"
          @click="selectCard(card, index)"
        >
          <div class="card-mini">
            <div class="card-header">
              <span class="card-type">{{ getCardSource(card) }}</span>
              <span class="card-icon">🆓</span>
            </div>
            <div class="card-content">
              <div class="card-title">Get Out of Jail Free</div>
              <div class="card-subtitle">This card may be kept until needed</div>
            </div>
            <div class="card-actions" v-if="canUseCard || canTradeCard">
              <button 
                v-if="canUseCard"
                class="use-btn"
                @click.stop="useCard(card, index)"
                :disabled="processingCard"
              >
                Use
              </button>
              <button 
                v-if="canTradeCard"
                class="trade-btn"
                @click.stop="openTradeDialog(card, index)"
                :disabled="processingCard"
              >
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div class="no-jail-cards" v-else-if="showEmptyState">
      <div class="empty-icon">🔒</div>
      <div class="empty-message">No "Get Out of Jail Free" cards</div>
      <div class="empty-subtitle">Draw Chance or Community Chest cards to find them</div>
    </div>
    
    <!-- Jail Card Usage Dialog -->
    <div class="jail-card-dialog" v-if="showUsageDialog" @click="closeUsageDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>Use Get Out of Jail Free Card</h3>
          <button class="close-btn" @click="closeUsageDialog">×</button>
        </div>
        
        <div class="dialog-body">
          <div class="card-preview">
            <div class="preview-card">
              <div class="preview-icon">🆓</div>
              <div class="preview-title">Get Out of Jail Free</div>
              <div class="preview-source">From: {{ getCardSource(selectedCard) }}</div>
            </div>
          </div>
          
          <div class="usage-info">
            <p>Using this card will:</p>
            <ul>
              <li>✅ Immediately release you from jail</li>
              <li>📤 Return the card to a card deck</li>
              <li>🎯 Allow you to roll and move this turn</li>
            </ul>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="cancel-btn" @click="closeUsageDialog">Cancel</button>
          <button 
            class="confirm-use-btn" 
            @click="confirmUseCard"
            :disabled="processingCard"
          >
            <span v-if="processingCard">Using...</span>
            <span v-else>Use Card</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Trading Dialog -->
    <div class="jail-card-dialog" v-if="showTradeDialog" @click="closeTradeDialog">
      <div class="dialog-content trade-dialog" @click.stop>
        <div class="dialog-header">
          <h3>Trade Get Out of Jail Free Card</h3>
          <button class="close-btn" @click="closeTradeDialog">×</button>
        </div>
        
        <div class="dialog-body">
          <div class="card-preview">
            <div class="preview-card">
              <div class="preview-icon">🆓</div>
              <div class="preview-title">Get Out of Jail Free</div>
              <div class="preview-source">From: {{ getCardSource(selectedCard) }}</div>
            </div>
          </div>
          
          <div class="trade-options">
            <h4>Trade Options</h4>
            
            <!-- Player Selection -->
            <div class="player-selection">
              <label>Trade with:</label>
              <select v-model="selectedTradePlayer" class="player-select">
                <option value="">Select a player...</option>
                <option 
                  v-for="player in availableTradePartners"
                  :key="player.id"
                  :value="player.id"
                >
                  {{ player.name }} (${{ player.money }})
                </option>
              </select>
            </div>
            
            <!-- Price Input -->
            <div class="price-input">
              <label>Price: $</label>
              <input 
                type="number" 
                v-model.number="tradePrice"
                :min="0"
                :max="selectedTradePlayerMoney"
                placeholder="0"
                class="price-field"
              >
            </div>
            
            <div class="trade-info">
              <p><strong>Note:</strong> Trading jail cards is allowed in official Monopoly rules.</p>
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="cancel-btn" @click="closeTradeDialog">Cancel</button>
          <button 
            class="confirm-trade-btn" 
            @click="confirmTradeCard"
            :disabled="!canConfirmTrade || processingCard"
          >
            <span v-if="processingCard">Trading...</span>
            <span v-else>Propose Trade</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Success/Error Feedback -->
    <div class="feedback-toast" v-if="feedbackMessage" :class="feedbackType">
      <div class="toast-icon">{{ feedbackType === 'success' ? '✅' : '❌' }}</div>
      <div class="toast-message">{{ feedbackMessage }}</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'JailCard',
  
  props: {
    playerId: {
      type: String,
      required: true
    },
    jailCardCount: {
      type: Number,
      default: 0
    },
    isInJail: {
      type: Boolean,
      default: false
    },
    availablePlayers: {
      type: Array,
      default: () => []
    },
    showEmptyState: {
      type: Boolean,
      default: true
    },
    tradingEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  emits: [
    'use-jail-card',
    'trade-jail-card',
    'card-selected'
  ],
  
  setup(props, { emit }) {
    // Reactive state
    const jailCards = ref([])
    const selectedCard = ref(null)
    const selectedCardIndex = ref(-1)
    const showUsageDialog = ref(false)
    const showTradeDialog = ref(false)
    const processingCard = ref(false)
    const selectedTradePlayer = ref('')
    const tradePrice = ref(0)
    const feedbackMessage = ref('')
    const feedbackType = ref('success')
    
    // Computed properties
    const canUseCard = computed(() => {
      return props.isInJail && jailCards.value.length > 0
    })
    
    const canTradeCard = computed(() => {
      return props.tradingEnabled && jailCards.value.length > 0 && !props.isInJail
    })
    
    const availableTradePartners = computed(() => {
      return props.availablePlayers.filter(player => 
        player.id !== props.playerId && 
        player.isActive && 
        !player.isBankrupt
      )
    })
    
    const selectedTradePlayerMoney = computed(() => {
      const player = availableTradePartners.value.find(p => p.id === selectedTradePlayer.value)
      return player ? player.money : 0
    })
    
    const canConfirmTrade = computed(() => {
      return selectedTradePlayer.value && 
             tradePrice.value >= 0 && 
             tradePrice.value <= selectedTradePlayerMoney.value
    })
    
    // Methods
    const generateJailCards = (count) => {
      const cards = []
      for (let i = 0; i < count; i++) {
        cards.push({
          id: `jail-card-${Date.now()}-${i}`,
          source: Math.random() < 0.5 ? 'chance' : 'communityChest',
          acquiredDate: new Date(),
          useable: true,
          tradeable: true
        })
      }
      return cards
    }
    
    const getCardSource = (card) => {
      if (!card) return 'Unknown'
      return card.source === 'chance' ? 'Chance' : 'Community Chest'
    }
    
    const selectCard = (card, index) => {
      selectedCard.value = card
      selectedCardIndex.value = index
      emit('card-selected', { card, index })
    }
    
    const useCard = (card, index) => {
      if (!canUseCard.value || processingCard.value) return
      
      selectedCard.value = card
      selectedCardIndex.value = index
      showUsageDialog.value = true
    }
    
    const openTradeDialog = (card, index) => {
      if (!canTradeCard.value || processingCard.value) return
      
      selectedCard.value = card
      selectedCardIndex.value = index
      selectedTradePlayer.value = ''
      tradePrice.value = 0
      showTradeDialog.value = true
    }
    
    const closeUsageDialog = () => {
      if (processingCard.value) return
      
      showUsageDialog.value = false
      selectedCard.value = null
      selectedCardIndex.value = -1
    }
    
    const closeTradeDialog = () => {
      if (processingCard.value) return
      
      showTradeDialog.value = false
      selectedCard.value = null
      selectedCardIndex.value = -1
      selectedTradePlayer.value = ''
      tradePrice.value = 0
    }
    
    const confirmUseCard = async () => {
      if (!selectedCard.value || processingCard.value) return
      
      processingCard.value = true
      
      try {
        const result = await new Promise(resolve => {
          emit('use-jail-card', {
            card: selectedCard.value,
            cardIndex: selectedCardIndex.value,
            playerId: props.playerId
          }, resolve)
        })
        
        if (result.success) {
          // Remove card from inventory
          jailCards.value.splice(selectedCardIndex.value, 1)
          showFeedback('Used "Get Out of Jail Free" card successfully!', 'success')
          closeUsageDialog()
        } else {
          showFeedback(result.error || 'Failed to use jail card', 'error')
        }
      } catch (error) {
        showFeedback('Error using jail card', 'error')
      } finally {
        processingCard.value = false
      }
    }
    
    const confirmTradeCard = async () => {
      if (!canConfirmTrade.value || processingCard.value) return
      
      processingCard.value = true
      
      try {
        const result = await new Promise(resolve => {
          emit('trade-jail-card', {
            card: selectedCard.value,
            cardIndex: selectedCardIndex.value,
            fromPlayerId: props.playerId,
            toPlayerId: selectedTradePlayer.value,
            price: tradePrice.value
          }, resolve)
        })
        
        if (result.success) {
          // Remove card from inventory
          jailCards.value.splice(selectedCardIndex.value, 1)
          showFeedback(`Traded jail card for $${tradePrice.value}!`, 'success')
          closeTradeDialog()
        } else {
          showFeedback(result.error || 'Trade failed', 'error')
        }
      } catch (error) {
        showFeedback('Error trading jail card', 'error')
      } finally {
        processingCard.value = false
      }
    }
    
    const showFeedback = (message, type = 'success') => {
      feedbackMessage.value = message
      feedbackType.value = type
      
      setTimeout(() => {
        feedbackMessage.value = ''
      }, 3000)
    }
    
    // Watch for jail card count changes
    watch(() => props.jailCardCount, (newCount) => {
      if (newCount > jailCards.value.length) {
        // Add new cards
        const cardsToAdd = newCount - jailCards.value.length
        jailCards.value.push(...generateJailCards(cardsToAdd))
      } else if (newCount < jailCards.value.length) {
        // Remove cards (in case of external changes)
        jailCards.value = jailCards.value.slice(0, newCount)
      }
    }, { immediate: true })
    
    return {
      // State
      jailCards,
      selectedCard,
      selectedCardIndex,
      showUsageDialog,
      showTradeDialog,
      processingCard,
      selectedTradePlayer,
      tradePrice,
      feedbackMessage,
      feedbackType,
      
      // Computed
      canUseCard,
      canTradeCard,
      availableTradePartners,
      selectedTradePlayerMoney,
      canConfirmTrade,
      
      // Methods
      getCardSource,
      selectCard,
      useCard,
      openTradeDialog,
      closeUsageDialog,
      closeTradeDialog,
      confirmUseCard,
      confirmTradeCard
    }
  }
}
</script>

<style scoped>
.jail-card-manager {
  position: relative;
}

.jail-card-inventory {
  margin-bottom: 16px;
}

.inventory-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.title-icon {
  font-size: 18px;
}

.jail-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jail-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.jail-card.useable {
  animation: pulse-green 2s infinite;
}

.jail-card.tradeable:not(.useable) {
  animation: pulse-blue 3s infinite;
}

.card-mini {
  width: 140px;
  height: 100px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  font-size: 12px;
}

.jail-card:hover .card-mini {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  border-color: #6c757d;
}

.jail-card.useable .card-mini {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9, #e8f5e8);
}

.jail-card.tradeable:not(.useable) .card-mini {
  border-color: #007bff;
  background: linear-gradient(135deg, #f8fbff, #e3f2fd);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 10px;
  color: #6c757d;
}

.card-icon {
  font-size: 14px;
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 10px;
  color: #6c757d;
  line-height: 1.1;
}

.card-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.use-btn, .trade-btn {
  flex: 1;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.use-btn {
  background: #28a745;
  color: white;
}

.use-btn:hover:not(:disabled) {
  background: #218838;
}

.trade-btn {
  background: #007bff;
  color: white;
}

.trade-btn:hover:not(:disabled) {
  background: #0056b3;
}

.use-btn:disabled, .trade-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-jail-cards {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-message {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.empty-subtitle {
  font-size: 12px;
}

.jail-card-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.trade-dialog {
  max-width: 500px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.dialog-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #dc3545;
}

.dialog-body {
  padding: 20px;
}

.card-preview {
  text-align: center;
  margin-bottom: 20px;
}

.preview-card {
  display: inline-block;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 16px;
  min-width: 150px;
}

.preview-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.preview-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.preview-source {
  font-size: 12px;
  color: #6c757d;
}

.usage-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.usage-info ul {
  margin: 8px 0 0 0;
  padding-left: 16px;
}

.usage-info li {
  margin-bottom: 4px;
  font-size: 14px;
}

.trade-options h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.player-selection, .price-input {
  margin-bottom: 16px;
}

.player-selection label, .price-input label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #495057;
}

.player-select, .price-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
}

.player-select:focus, .price-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.trade-info {
  background: #e3f2fd;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  color: #1565c0;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
  justify-content: flex-end;
}

.cancel-btn, .confirm-use-btn, .confirm-trade-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #545b62;
}

.confirm-use-btn {
  background: #28a745;
  color: white;
}

.confirm-use-btn:hover:not(:disabled) {
  background: #218838;
}

.confirm-trade-btn {
  background: #007bff;
  color: white;
}

.confirm-trade-btn:hover:not(:disabled) {
  background: #0056b3;
}

.confirm-use-btn:disabled, .confirm-trade-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1200;
  border-left: 4px solid;
}

.feedback-toast.success {
  border-left-color: #28a745;
}

.feedback-toast.error {
  border-left-color: #dc3545;
}

.toast-icon {
  font-size: 18px;
}

.toast-message {
  font-weight: 600;
  color: #2c3e50;
}

@keyframes pulse-green {
  0%, 100% { border-color: #28a745; }
  50% { border-color: #20c997; }
}

@keyframes pulse-blue {
  0%, 100% { border-color: #007bff; }
  50% { border-color: #17a2b8; }
}

/* Responsive design */
@media (max-width: 768px) {
  .jail-cards-container {
    flex-direction: column;
  }
  
  .card-mini {
    width: 100%;
    height: auto;
    min-height: 80px;
  }
  
  .dialog-content {
    width: 95%;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .confirm-use-btn, .confirm-trade-btn {
    width: 100%;
  }
}
</style>