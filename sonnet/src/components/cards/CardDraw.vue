<template>
  <div class="card-draw-system">
    <!-- Card Drawing Interface -->
    <div class="card-draw-interface" v-if="isDrawing && !cardDrawn">
      <div class="deck-container" :class="deckTypeClass">
        <div class="deck-stack">
          <!-- Card back animation -->
          <div 
            class="card-back"
            v-for="n in 3"
            :key="n"
            :style="{ zIndex: 4 - n, transform: `translateY(${(n-1) * -2}px) translateX(${(n-1) * -1}px)` }"
          ></div>
          
          <!-- Drawing card -->
          <div 
            class="drawing-card"
            :class="{ 'flipping': isFlipping }"
            v-if="isFlipping"
          >
            <div class="card-face card-back-face"></div>
            <div class="card-face card-front-face" :class="deckTypeClass">
              <div class="card-content-preview">
                <div class="card-icon">{{ deckIcon }}</div>
                <div class="card-type-text">{{ deckTypeText }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="deck-info">
          <h3 class="deck-title">{{ deckTypeText }}</h3>
          <p class="deck-instruction">{{ drawInstructions }}</p>
          <div class="deck-stats">
            <span class="cards-remaining">{{ cardsRemaining }} cards remaining</span>
          </div>
        </div>
      </div>
      
      <!-- Auto-draw timer -->
      <div class="auto-draw-timer" v-if="autoDrawTimer > 0">
        <div class="timer-bar">
          <div 
            class="timer-progress" 
            :style="{ width: `${(autoDrawTimer / 3) * 100}%` }"
          ></div>
        </div>
        <div class="timer-text">Drawing card in {{ Math.ceil(autoDrawTimer) }}s</div>
      </div>
      
      <!-- Manual draw button -->
      <button 
        class="draw-card-btn"
        @click="drawCard"
        :disabled="isFlipping"
        v-if="!autoDrawEnabled || autoDrawTimer <= 0"
      >
        <span class="btn-icon">🎴</span>
        Draw {{ deckTypeText }} Card
      </button>
    </div>
    
    <!-- Card Display -->
    <CardDisplay
      v-if="drawnCard"
      :card="drawnCard"
      :showCard="showCardDisplay"
      :cardDeckType="deckTypeText"
      :processing="processingCardEffect"
      @execute-card="executeCardEffect"
      @keep-card="keepCard"
      @close-card="closeCardDisplay"
    />
    
    <!-- Effect Processing Feedback -->
    <div class="effect-feedback" v-if="effectResult && !showCardDisplay">
      <div class="feedback-container" :class="effectResult.success ? 'success' : 'error'">
        <div class="feedback-icon">
          {{ effectResult.success ? '✅' : '❌' }}
        </div>
        <div class="feedback-message">{{ effectResult.message }}</div>
        <button class="close-feedback-btn" @click="clearEffectResult">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import CardDisplay from './CardDisplay.vue'

export default {
  name: 'CardDraw',
  
  components: {
    CardDisplay
  },
  
  props: {
    deckType: {
      type: String,
      required: true,
      validator: value => ['chance', 'communityChest'].includes(value)
    },
    playerId: {
      type: String,
      required: true
    },
    autoDrawEnabled: {
      type: Boolean,
      default: true
    },
    autoDrawDelay: {
      type: Number,
      default: 3 // seconds
    },
    cardsRemaining: {
      type: Number,
      default: 16
    }
  },
  
  emits: [
    'card-drawn', 
    'card-effect-executed', 
    'jail-card-kept', 
    'draw-complete',
    'draw-cancelled'
  ],
  
  setup(props, { emit }) {
    // Reactive state
    const isDrawing = ref(false)
    const isFlipping = ref(false)
    const cardDrawn = ref(false)
    const drawnCard = ref(null)
    const showCardDisplay = ref(false)
    const processingCardEffect = ref(false)
    const effectResult = ref(null)
    const autoDrawTimer = ref(0)
    
    let autoDrawInterval = null
    
    // Computed properties
    const deckTypeClass = computed(() => {
      return props.deckType === 'chance' ? 'deck-chance' : 'deck-community'
    })
    
    const deckTypeText = computed(() => {
      return props.deckType === 'chance' ? 'Chance' : 'Community Chest'
    })
    
    const deckIcon = computed(() => {
      return props.deckType === 'chance' ? '🎲' : '🏛️'
    })
    
    const drawInstructions = computed(() => {
      if (autoDrawTimer.value > 0) {
        return 'Card will be drawn automatically...'
      }
      return `Draw a ${deckTypeText.value} card`
    })
    
    // Methods
    const startCardDraw = () => {
      isDrawing.value = true
      cardDrawn.value = false
      drawnCard.value = null
      showCardDisplay.value = false
      effectResult.value = null
      
      if (props.autoDrawEnabled) {
        startAutoDrawTimer()
      }
    }
    
    const startAutoDrawTimer = () => {
      autoDrawTimer.value = props.autoDrawDelay
      
      autoDrawInterval = setInterval(() => {
        autoDrawTimer.value -= 0.1
        
        if (autoDrawTimer.value <= 0) {
          clearInterval(autoDrawInterval)
          autoDrawInterval = null
          drawCard()
        }
      }, 100)
    }
    
    const drawCard = async () => {
      if (isFlipping.value) return
      
      // Clear auto-draw timer
      if (autoDrawInterval) {
        clearInterval(autoDrawInterval)
        autoDrawInterval = null
      }
      autoDrawTimer.value = 0
      
      // Start card flip animation
      isFlipping.value = true
      
      // Emit card draw event
      const drawResult = await new Promise(resolve => {
        emit('card-drawn', props.deckType, resolve)
      })
      
      if (drawResult.success) {
        drawnCard.value = drawResult.card
        
        // Wait for flip animation to complete
        setTimeout(() => {
          isFlipping.value = false
          cardDrawn.value = true
          showCardDisplay.value = true
        }, 1500) // Match CSS animation duration
        
      } else {
        // Handle draw failure
        isFlipping.value = false
        effectResult.value = {
          success: false,
          message: drawResult.error || 'Failed to draw card'
        }
        setTimeout(() => {
          emit('draw-complete', { success: false, error: drawResult.error })
        }, 2000)
      }
    }
    
    const executeCardEffect = async (card) => {
      showCardDisplay.value = false
      processingCardEffect.value = true
      
      try {
        const result = await new Promise(resolve => {
          emit('card-effect-executed', card, props.playerId, resolve)
        })
        
        processingCardEffect.value = false
        
        if (result.success) {
          effectResult.value = {
            success: true,
            message: result.message || 'Card effect executed successfully'
          }
        } else {
          effectResult.value = {
            success: false,
            message: result.error || 'Failed to execute card effect'
          }
        }
        
        // Auto-close feedback and complete draw
        setTimeout(() => {
          clearEffectResult()
          completeDraw(result)
        }, 3000)
        
      } catch (error) {
        processingCardEffect.value = false
        effectResult.value = {
          success: false,
          message: 'Error executing card effect'
        }
        
        setTimeout(() => {
          clearEffectResult()
          completeDraw({ success: false, error: error.message })
        }, 3000)
      }
    }
    
    const keepCard = (card) => {
      showCardDisplay.value = false
      
      emit('jail-card-kept', card, props.playerId)
      
      effectResult.value = {
        success: true,
        message: 'Get Out of Jail Free card added to your inventory'
      }
      
      setTimeout(() => {
        clearEffectResult()
        completeDraw({ success: true, cardKept: true })
      }, 2000)
    }
    
    const closeCardDisplay = () => {
      showCardDisplay.value = false
      
      // If it's a normal card, execute immediately
      if (drawnCard.value && !drawnCard.value.isGetOutOfJail) {
        executeCardEffect(drawnCard.value)
      } else {
        // Cancel the draw
        emit('draw-cancelled')
        resetDrawState()
      }
    }
    
    const clearEffectResult = () => {
      effectResult.value = null
    }
    
    const completeDraw = (result) => {
      emit('draw-complete', {
        ...result,
        card: drawnCard.value,
        playerId: props.playerId
      })
      resetDrawState()
    }
    
    const resetDrawState = () => {
      isDrawing.value = false
      isFlipping.value = false
      cardDrawn.value = false
      drawnCard.value = null
      showCardDisplay.value = false
      processingCardEffect.value = false
      effectResult.value = null
      autoDrawTimer.value = 0
      
      if (autoDrawInterval) {
        clearInterval(autoDrawInterval)
        autoDrawInterval = null
      }
    }
    
    const cancelDraw = () => {
      if (autoDrawInterval) {
        clearInterval(autoDrawInterval)
        autoDrawInterval = null
      }
      
      emit('draw-cancelled')
      resetDrawState()
    }
    
    // Lifecycle
    onMounted(() => {
      startCardDraw()
    })
    
    onUnmounted(() => {
      if (autoDrawInterval) {
        clearInterval(autoDrawInterval)
      }
    })
    
    // Watch for prop changes
    watch(() => props.deckType, () => {
      if (isDrawing.value && !cardDrawn.value) {
        resetDrawState()
        startCardDraw()
      }
    })
    
    // Expose methods for parent component
    return {
      // State
      isDrawing,
      isFlipping,
      cardDrawn,
      drawnCard,
      showCardDisplay,
      processingCardEffect,
      effectResult,
      autoDrawTimer,
      
      // Computed
      deckTypeClass,
      deckTypeText,
      deckIcon,
      drawInstructions,
      
      // Methods
      drawCard,
      executeCardEffect,
      keepCard,
      closeCardDisplay,
      clearEffectResult,
      cancelDraw
    }
  }
}
</script>

<style scoped>
.card-draw-system {
  position: relative;
  width: 100%;
  height: 100%;
}

.card-draw-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 20px;
}

.deck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.deck-stack {
  position: relative;
  width: 120px;
  height: 170px;
  perspective: 1000px;
}

.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid #333;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px),
    radial-gradient(circle at center, rgba(255,255,255,0.1) 2px, transparent 2px);
  background-size: auto, 20px 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.drawing-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 1.5s;
  z-index: 10;
}

.drawing-card.flipping {
  animation: cardFlip 1.5s ease-in-out forwards;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  backface-visibility: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.card-back-face {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px),
    radial-gradient(circle at center, rgba(255,255,255,0.1) 2px, transparent 2px);
  background-size: auto, 20px 20px;
  border: 2px solid #333;
}

.card-front-face {
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
}

.card-front-face.deck-chance {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.card-front-face.deck-community {
  background: linear-gradient(135deg, #4ecdc4, #45b7aa);
  color: white;
}

.card-content-preview {
  text-align: center;
}

.card-content-preview .card-icon {
  font-size: 32px;
  margin-bottom: 8px;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.card-type-text {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.deck-info {
  text-align: center;
}

.deck-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2c3e50;
}

.deck-instruction {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.deck-stats {
  font-size: 14px;
  color: #888;
}

.auto-draw-timer {
  margin-bottom: 20px;
  text-align: center;
}

.timer-bar {
  width: 200px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.1s ease;
}

.timer-text {
  font-size: 14px;
  color: #666;
}

.draw-card-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.draw-card-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.draw-card-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 18px;
}

.effect-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1100;
}

.feedback-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  text-align: center;
  min-width: 300px;
  border: 3px solid;
}

.feedback-container.success {
  border-color: #2ecc71;
}

.feedback-container.error {
  border-color: #e74c3c;
}

.feedback-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feedback-message {
  font-size: 16px;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.4;
}

.close-feedback-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@keyframes cardFlip {
  0% {
    transform: rotateY(0deg) translateY(0px);
  }
  50% {
    transform: rotateY(90deg) translateY(-20px);
  }
  100% {
    transform: rotateY(180deg) translateY(0px);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .card-draw-interface {
    padding: 16px;
    min-height: 350px;
  }
  
  .deck-stack {
    width: 100px;
    height: 140px;
  }
  
  .deck-title {
    font-size: 20px;
  }
  
  .draw-card-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>