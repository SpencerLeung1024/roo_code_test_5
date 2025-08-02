<template>
  <div class="turn-manager">
    <div class="turn-header">
      <div class="turn-info">
        <h3>Turn {{ turnNumber }}</h3>
        <div class="current-player-info">
          <span class="player-piece" :style="{ color: currentPlayer?.color }">
            {{ getPlayerPieceSymbol(currentPlayer?.piece) }}
          </span>
          <span class="player-name">{{ currentPlayer?.name }}'s Turn</span>
        </div>
      </div>
      
      <div class="phase-indicator">
        <div class="phase-badge" :class="turnPhase">
          {{ phaseDisplayName }}
        </div>
      </div>
    </div>

    <!-- Turn Phase Content -->
    <div class="turn-content">
      <!-- Rolling Phase -->
      <div v-if="turnPhase === 'rolling'" class="phase-content rolling-phase">
        <!-- Enhanced Dice Roller Component -->
        <DiceRoller
          :die1="dice.die1"
          :die2="dice.die2"
          :can-roll="canRollDice && !isRolling"
          :doubles-count="dice.doublesCount"
          :last-roll="dice.lastRoll"
          @roll-dice="handleRollDice"
          @animation-complete="handleDiceAnimationComplete"
        />
        
        <!-- Jail System Integration -->
        <JailSystem
          v-if="currentPlayer?.isInJail"
          :game-state="gameState"
          :current-player="currentPlayer"
          :turn-phase="turnPhase"
          :dice="dice"
          @pay-jail-fine="handlePayJailFine"
          @use-jail-card="handleUseJailCard"
          @roll-for-doubles="handleRollForDoubles"
          @end-turn="handleEndTurn"
          @jail-exit="handleJailExit"
        />
      </div>

      <!-- Moving Phase -->
      <div v-else-if="turnPhase === 'moving'" class="phase-content moving-phase">
        <div class="movement-info">
          <div class="move-summary">
            <span class="player-piece" :style="{ color: currentPlayer?.color }">
              {{ getPlayerPieceSymbol(currentPlayer?.piece) }}
            </span>
            <span>Moving {{ dice.total }} spaces...</span>
          </div>
          
          <div class="move-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: moveProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Phase -->
      <div v-else-if="turnPhase === 'action'" class="phase-content action-phase">
        <div class="landed-space-info">
          <div class="space-name">{{ landedSpaceName }}</div>
          <div class="space-type">{{ landedSpaceType }}</div>
        </div>

        <!-- Available Actions based on space type -->
        <div class="available-actions">
          <PlayerActions
            :player="currentPlayer"
            :current-space="landedSpace"
            :game-state="gameState"
            :can-end-turn="canEndTurn"
            @action="handlePlayerAction"
          />
        </div>
      </div>

      <!-- Trading Phase -->
      <div v-else-if="turnPhase === 'trading'" class="phase-content trading-phase">
        <div class="trading-info">
          <div class="phase-message">
            <span>🤝 Trading in progress...</span>
          </div>
          <button @click="cancelTrade" class="btn secondary">Cancel Trade</button>
        </div>
      </div>

      <!-- Developing Phase -->
      <div v-else-if="turnPhase === 'developing'" class="phase-content developing-phase">
        <div class="developing-info">
          <div class="phase-message">
            <span>🏗️ Managing properties...</span>
          </div>
          <button @click="finishDeveloping" class="btn secondary">Done</button>
        </div>
      </div>
    </div>

    <!-- Turn Actions -->
    <div class="turn-actions">
      <div class="action-buttons">
        <button 
          v-if="canEndTurn"
          @click="endTurn"
          class="btn primary end-turn-btn"
        >
          End Turn
        </button>
        
        <button 
          v-if="canManageProperties"
          @click="openPropertyManagement"
          class="btn secondary"
        >
          Manage Properties
        </button>
        
        <button 
          v-if="canInitiateTrade"
          @click="openTradeModal"
          class="btn secondary"
        >
          Trade
        </button>
      </div>

      <!-- Turn Timer (optional) -->
      <div v-if="showTimer" class="turn-timer">
        <div class="timer-display">{{ formatTime(turnTimeRemaining) }}</div>
        <div class="timer-bar">
          <div 
            class="timer-fill" 
            :style="{ width: timerProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Quick Info -->
    <div class="quick-info">
      <div class="info-item">
        <span class="info-label">Money:</span>
        <span class="info-value">${{ currentPlayer?.money?.toLocaleString() }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Properties:</span>
        <span class="info-value">{{ currentPlayerProperties }}</span>
      </div>
      <div class="info-item" v-if="dice.isDoubles">
        <span class="info-label">Roll Again:</span>
        <span class="info-value doubles">Yes!</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import PlayerActions from './PlayerActions.vue'
import DiceRoller from './DiceRoller.vue'
import JailSystem from '../jail/JailSystem.vue'

export default {
  name: 'TurnManager',
  components: {
    PlayerActions,
    DiceRoller,
    JailSystem
  },
  
  props: {
    currentPlayer: {
      type: Object,
      required: true
    },
    turnNumber: {
      type: Number,
      required: true
    },
    turnPhase: {
      type: String,
      required: true
    },
    dice: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    canRollDice: {
      type: Boolean,
      default: false
    },
    canEndTurn: {
      type: Boolean,
      default: false
    },
    showTimer: {
      type: Boolean,
      default: false
    },
    turnTimeLimit: {
      type: Number,
      default: 120 // seconds
    }
  },

  emits: [
    'roll-dice',
    'end-turn',
    'player-action',
    'pay-jail-fine',
    'use-jail-card',
    'cancel-trade',
    'finish-developing',
    'open-property-management',
    'open-trade-modal',
    'start-movement',
    'movement-complete'
  ],

  setup(props, { emit }) {
    const isRolling = ref(false)
    const moveProgress = ref(0)
    const turnTimeRemaining = ref(props.turnTimeLimit)
    const timerInterval = ref(null)

    // Game pieces mapping
    const gamePieces = {
      'car': '🚗',
      'dog': '🐕',
      'hat': '🎩',
      'boot': '👢',
      'ship': '🚢',
      'thimble': '🪡',
      'iron': '🔨',
      'wheelbarrow': '🛍️'
    }

    // Computed properties
    const phaseDisplayName = computed(() => {
      const phases = {
        'rolling': 'Roll Dice',
        'moving': 'Moving',
        'action': 'Take Action',
        'trading': 'Trading',
        'developing': 'Developing'
      }
      return phases[props.turnPhase] || props.turnPhase
    })

    const landedSpace = computed(() => {
      if (!props.currentPlayer) return null
      return props.gameState.board?.[props.currentPlayer.position]
    })

    const landedSpaceName = computed(() => {
      return landedSpace.value?.name || 'Unknown Space'
    })

    const landedSpaceType = computed(() => {
      const space = landedSpace.value
      if (!space) return ''
      
      const typeNames = {
        'property': 'Property',
        'railroad': 'Railroad',
        'utility': 'Utility',
        'tax': 'Tax',
        'chance': 'Chance',
        'communityChest': 'Community Chest',
        'special': 'Special Space'
      }
      
      return typeNames[space.type] || space.type
    })

    const currentPlayerProperties = computed(() => {
      if (!props.currentPlayer) return 0
      return (props.currentPlayer.properties?.length || 0) +
             (props.currentPlayer.railroads?.length || 0) +
             (props.currentPlayer.utilities?.length || 0)
    })

    const canManageProperties = computed(() => {
      return props.turnPhase === 'action' && currentPlayerProperties.value > 0
    })

    const canInitiateTrade = computed(() => {
      return props.turnPhase === 'action' && 
             props.gameState.players?.filter(p => p.isActive && !p.isBankrupt).length > 1
    })

    const timerProgress = computed(() => {
      return (turnTimeRemaining.value / props.turnTimeLimit) * 100
    })

    // Watch for phase changes
    watch(() => props.turnPhase, (newPhase) => {
      if (newPhase === 'moving') {
        simulateMovement()
      } else if (newPhase === 'rolling') {
        resetTimer()
      }
    })

    // Watch for turn changes
    watch(() => props.turnNumber, () => {
      resetTimer()
    })

    // Methods
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    const handleRollDice = async () => {
      if (isRolling.value || !props.canRollDice) return
      
      isRolling.value = true
      emit('roll-dice')
    }

    const handleDiceAnimationComplete = () => {
      isRolling.value = false
      
      // Check if movement should start
      if (props.turnPhase === 'moving') {
        emit('start-movement', {
          playerId: props.currentPlayer?.id,
          spaces: props.dice.total
        })
      }
    }

    const simulateMovement = () => {
      moveProgress.value = 0
      const duration = 2000 // 2 seconds
      const interval = 50 // 50ms updates
      const increment = 100 / (duration / interval)
      
      const progressInterval = setInterval(() => {
        moveProgress.value += increment
        if (moveProgress.value >= 100) {
          moveProgress.value = 100
          clearInterval(progressInterval)
        }
      }, interval)
    }

    const resetTimer = () => {
      if (!props.showTimer) return
      
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      
      turnTimeRemaining.value = props.turnTimeLimit
      
      timerInterval.value = setInterval(() => {
        if (turnTimeRemaining.value > 0) {
          turnTimeRemaining.value--
        } else {
          clearInterval(timerInterval.value)
          // Auto-end turn when time runs out
          emit('end-turn')
        }
      }, 1000)
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const endTurn = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      emit('end-turn')
    }

    const handlePlayerAction = (action) => {
      emit('player-action', action)
    }

    const handlePayJailFine = () => {
      emit('pay-jail-fine')
    }

    const handleUseJailCard = () => {
      emit('use-jail-card')
    }

    const handleRollForDoubles = () => {
      emit('roll-dice')
    }

    const handleEndTurn = () => {
      emit('end-turn')
    }

    const handleJailExit = (data) => {
      // Handle different jail exit methods
      switch (data.option) {
        case 'pay-fine':
          emit('pay-jail-fine')
          break
        case 'use-card':
          emit('use-jail-card')
          break
        case 'roll-doubles':
          emit('roll-dice')
          break
        default:
          console.log('Jail exit:', data)
      }
    }

    const cancelTrade = () => {
      emit('cancel-trade')
    }

    const finishDeveloping = () => {
      emit('finish-developing')
    }

    const openPropertyManagement = () => {
      emit('open-property-management')
    }

    const openTradeModal = () => {
      emit('open-trade-modal')
    }

    // Cleanup on unmount
    const cleanup = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    }

    return {
      isRolling,
      moveProgress,
      turnTimeRemaining,
      phaseDisplayName,
      landedSpace,
      landedSpaceName,
      landedSpaceType,
      currentPlayerProperties,
      canManageProperties,
      canInitiateTrade,
      timerProgress,
      getPlayerPieceSymbol,
      handleRollDice,
      handleDiceAnimationComplete,
      endTurn,
      handlePlayerAction,
      handlePayJailFine,
      handleUseJailCard,
      handleRollForDoubles,
      handleEndTurn,
      handleJailExit,
      cancelTrade,
      finishDeveloping,
      openPropertyManagement,
      openTradeModal,
      formatTime,
      cleanup
    }
  },

  beforeUnmount() {
    this.cleanup()
  }
}
</script>

<style scoped>
.turn-manager {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.turn-header {
  background: #2c3e50;
  color: #ffffff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.turn-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #ffffff;
  font-weight: 600;
}

.current-player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
}

.player-piece {
  font-size: 1.5rem;
  font-weight: bold;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.phase-indicator {
  text-align: right;
}

.phase-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.phase-badge.rolling {
  background: #e74c3c;
  color: white;
}

.phase-badge.moving {
  background: #3498db;
  color: white;
}

.phase-badge.action {
  background: #27ae60;
  color: white;
}

.phase-badge.trading {
  background: #f39c12;
  color: white;
}

.phase-badge.developing {
  background: #9b59b6;
  color: white;
}

/* Turn Content */
.turn-content {
  padding: 1.5rem;
}

.phase-content {
  text-align: center;
}

/* Rolling Phase */
.dice-section {
  margin-bottom: 1.5rem;
}

.dice-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.die {
  width: 60px;
  height: 60px;
  background: white;
  border: 3px solid #34495e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.die.rolling {
  animation: diceRoll 0.5s infinite;
}

@keyframes diceRoll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
}

.dice-result {
  color: #2c3e50;
}

.roll-total {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.doubles-indicator {
  color: #f39c12;
  font-weight: bold;
}

.jail-warning {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 0.5rem;
}

.roll-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.roll-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
}

.jail-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Moving Phase */
.movement-info {
  max-width: 300px;
  margin: 0 auto;
}

.move-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.move-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.1s ease;
}

/* Action Phase */
.landed-space-info {
  margin-bottom: 1.5rem;
  text-align: center;
}

.space-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.space-type {
  color: #7f8c8d;
  font-size: 1rem;
}

/* Turn Actions */
.turn-actions {
  border-top: 1px solid #ecf0f1;
  padding: 1rem;
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn.primary {
  background: #27ae60;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #229954;
}

.btn.secondary {
  background: #95a5a6;
  color: white;
}

.btn.secondary:hover {
  background: #7f8c8d;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.end-turn-btn {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

/* Timer */
.turn-timer {
  max-width: 200px;
  margin: 0 auto;
}

.timer-display {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.timer-bar {
  width: 100%;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #27ae60 100%);
  transition: width 1s ease;
}

/* Quick Info */
.quick-info {
  border-top: 1px solid #ecf0f1;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.info-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: bold;
  color: #2c3e50;
}

.info-value.doubles {
  color: #f39c12;
}

/* Responsive Design */
@media (max-width: 768px) {
  .turn-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dice-display {
    gap: 0.5rem;
  }
  
  .die {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
  }
  
  .quick-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>