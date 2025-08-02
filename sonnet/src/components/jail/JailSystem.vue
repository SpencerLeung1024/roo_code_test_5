<template>
  <div class="jail-system">
    <!-- Jail Interface for Current Player -->
    <div v-if="currentPlayerInJail" class="jail-interface">
      <div class="jail-header">
        <div class="jail-title">
          <span class="jail-icon">🔒</span>
          <h3>IN JAIL</h3>
        </div>
        <div class="jail-player-info">
          <span class="player-piece" :style="{ color: currentPlayer?.color }">
            {{ getPlayerPieceSymbol(currentPlayer?.piece) }}
          </span>
          <span class="player-name">{{ currentPlayer?.name }}</span>
        </div>
      </div>

      <!-- Jail Status Display -->
      <JailStatus 
        :player="currentPlayer"
        :turns-remaining="currentPlayer?.jailTurns || 0"
        :get-out-cards="currentPlayer?.getOutOfJailCards || 0"
        :jail-statistics="getJailStatistics(currentPlayer?.id)"
      />

      <!-- Jail Turn Management -->
      <JailTurn
        v-if="isCurrentPlayerTurn"
        :player="currentPlayer"
        :turn-phase="turnPhase"
        :dice="dice"
        :can-roll="canRollInJail"
        :can-pay-fine="canPayJailFine"
        :can-use-card="canUseJailCard"
        @pay-fine="handlePayJailFine"
        @use-jail-card="handleUseJailCard"
        @roll-for-doubles="handleRollForDoubles"
        @end-turn="handleEndTurn"
      />

      <!-- Jail Exit Options -->
      <JailExit
        :player="currentPlayer"
        :available-options="availableJailExitOptions"
        :forced-exit="mustExitJail"
        @exit-option="handleJailExit"
      />
    </div>

    <!-- Jail Status for All Players -->
    <div class="jail-overview">
      <div class="jail-overview-header">
        <h4>Jail Status</h4>
        <span class="players-in-jail-count">
          {{ playersInJail.length }} player{{ playersInJail.length !== 1 ? 's' : '' }} in jail
        </span>
      </div>

      <div class="jail-player-list">
        <div 
          v-for="player in playersInJail" 
          :key="player.id"
          class="jail-player-item"
          :class="{ 'current-player': player.id === currentPlayer?.id }"
        >
          <div class="jail-player-info">
            <span class="player-piece" :style="{ color: player.color }">
              {{ getPlayerPieceSymbol(player.piece) }}
            </span>
            <span class="player-name">{{ player.name }}</span>
          </div>
          
          <div class="jail-player-status">
            <span class="turns-remaining">
              {{ player.jailTurns }} turn{{ player.jailTurns !== 1 ? 's' : '' }} left
            </span>
            <span v-if="player.getOutOfJailCards > 0" class="jail-cards">
              {{ player.getOutOfJailCards }} card{{ player.getOutOfJailCards !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Jail History and Statistics -->
    <JailHistory
      v-if="showJailHistory"
      :game-history="gameHistory"
      :players="allPlayers"
      @close="showJailHistory = false"
    />

    <!-- Jail Actions -->
    <div class="jail-actions" v-if="!currentPlayerInJail">
      <button 
        @click="showJailHistory = true"
        class="btn secondary"
      >
        View Jail History
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameState } from '../../composables/useGameState.js'
import JailStatus from './JailStatus.vue'
import JailTurn from './JailTurn.vue'
import JailExit from './JailExit.vue'
import JailHistory from './JailHistory.vue'

export default {
  name: 'JailSystem',
  components: {
    JailStatus,
    JailTurn,
    JailExit,
    JailHistory
  },

  props: {
    gameState: {
      type: Object,
      required: true
    },
    currentPlayer: {
      type: Object,
      default: null
    },
    turnPhase: {
      type: String,
      default: 'rolling'
    },
    dice: {
      type: Object,
      default: () => ({ die1: 1, die2: 1, total: 2, isDoubles: false })
    }
  },

  emits: [
    'pay-jail-fine',
    'use-jail-card',
    'roll-for-doubles',
    'end-turn',
    'jail-exit'
  ],

  setup(props, { emit }) {
    const { actions, payJailFine, useJailCard } = useGameState()
    const showJailHistory = ref(false)

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
    const currentPlayerInJail = computed(() => {
      return props.currentPlayer?.isInJail || false
    })

    const isCurrentPlayerTurn = computed(() => {
      return props.gameState.players[props.gameState.currentPlayerIndex]?.id === props.currentPlayer?.id
    })

    const playersInJail = computed(() => {
      return props.gameState.players.filter(player => player.isInJail && player.isActive)
    })

    const allPlayers = computed(() => {
      return props.gameState.players || []
    })

    const gameHistory = computed(() => {
      return props.gameState.history || []
    })

    const canRollInJail = computed(() => {
      return props.turnPhase === 'rolling' && 
             currentPlayerInJail.value && 
             isCurrentPlayerTurn.value
    })

    const canPayJailFine = computed(() => {
      return currentPlayerInJail.value && 
             (props.currentPlayer?.money || 0) >= 50 &&
             isCurrentPlayerTurn.value
    })

    const canUseJailCard = computed(() => {
      return currentPlayerInJail.value && 
             (props.currentPlayer?.getOutOfJailCards || 0) > 0 &&
             isCurrentPlayerTurn.value
    })

    const mustExitJail = computed(() => {
      return currentPlayerInJail.value && 
             (props.currentPlayer?.jailTurns || 0) <= 0
    })

    const availableJailExitOptions = computed(() => {
      const options = []
      
      if (canPayJailFine.value) {
        options.push({
          id: 'pay-fine',
          name: 'Pay $50 Fine',
          description: 'Pay $50 to exit jail immediately',
          cost: 50,
          available: true
        })
      }

      if (canUseJailCard.value) {
        options.push({
          id: 'use-card',
          name: 'Use Get Out of Jail Free Card',
          description: 'Use your jail card to exit immediately',
          cost: 0,
          available: true
        })
      }

      if (canRollInJail.value) {
        options.push({
          id: 'roll-doubles',
          name: 'Roll for Doubles',
          description: 'Roll dice to try for doubles (free exit)',
          cost: 0,
          available: true
        })
      }

      if (mustExitJail.value) {
        options.push({
          id: 'forced-exit',
          name: 'Mandatory Release',
          description: 'Must pay $50 and roll (3 turns served)',
          cost: 50,
          available: true,
          forced: true
        })
      }

      return options
    })

    // Methods
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    const getJailStatistics = (playerId) => {
      if (!playerId) return { timesInJail: 0, totalTurnsInJail: 0, moneyPaidForJail: 0 }
      
      const player = props.gameState.players.find(p => p.id === playerId)
      if (!player) return { timesInJail: 0, totalTurnsInJail: 0, moneyPaidForJail: 0 }

      // Calculate from game history
      const jailHistory = gameHistory.value.filter(entry => 
        entry.type === 'game_event' && 
        entry.message.includes(player.name) && 
        entry.message.includes('jail')
      )

      return {
        timesInJail: player.stats?.timesInJail || 0,
        totalTurnsInJail: jailHistory.length,
        moneyPaidForJail: 0 // Could be calculated from history
      }
    }

    const handlePayJailFine = async () => {
      const result = await payJailFine(props.currentPlayer?.id)
      if (result) {
        emit('pay-jail-fine', { 
          playerId: props.currentPlayer?.id, 
          success: true 
        })
      }
    }

    const handleUseJailCard = async () => {
      const result = await useJailCard(props.currentPlayer?.id)
      if (result.success) {
        emit('use-jail-card', { 
          playerId: props.currentPlayer?.id, 
          success: true 
        })
      }
    }

    const handleRollForDoubles = () => {
      emit('roll-for-doubles', { playerId: props.currentPlayer?.id })
    }

    const handleEndTurn = () => {
      emit('end-turn')
    }

    const handleJailExit = (option) => {
      switch (option.id) {
        case 'pay-fine':
          handlePayJailFine()
          break
        case 'use-card':
          handleUseJailCard()
          break
        case 'roll-doubles':
          handleRollForDoubles()
          break
        case 'forced-exit':
          // Force payment and exit
          handlePayJailFine()
          break
      }
      
      emit('jail-exit', { 
        playerId: props.currentPlayer?.id, 
        option: option.id 
      })
    }

    return {
      showJailHistory,
      currentPlayerInJail,
      isCurrentPlayerTurn,
      playersInJail,
      allPlayers,
      gameHistory,
      canRollInJail,
      canPayJailFine,
      canUseJailCard,
      mustExitJail,
      availableJailExitOptions,
      getPlayerPieceSymbol,
      getJailStatistics,
      handlePayJailFine,
      handleUseJailCard,
      handleRollForDoubles,
      handleEndTurn,
      handleJailExit
    }
  }
}
</script>

<style scoped>
.jail-system {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.jail-interface {
  border: 2px solid #e74c3c;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  margin-bottom: 1rem;
}

.jail-header {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jail-icon {
  font-size: 1.5rem;
}

.jail-title h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.jail-player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-piece {
  font-size: 1.2rem;
  font-weight: bold;
}

.player-name {
  font-size: 1rem;
  font-weight: 500;
}

.jail-overview {
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.jail-overview-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jail-overview-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.players-in-jail-count {
  font-size: 0.875rem;
  color: #6c757d;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.jail-player-list {
  padding: 0.5rem;
}

.jail-player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  background: white;
  border: 1px solid #e9ecef;
}

.jail-player-item.current-player {
  border-color: #e74c3c;
  background: #fff5f5;
}

.jail-player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jail-player-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.turns-remaining {
  font-size: 0.875rem;
  color: #e74c3c;
  font-weight: 600;
}

.jail-cards {
  font-size: 0.75rem;
  color: #28a745;
  background: #d4edda;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
}

.jail-actions {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #5a6268;
}

/* Responsive Design */
@media (max-width: 768px) {
  .jail-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .jail-overview-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .jail-player-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .jail-player-status {
    align-items: center;
  }
}
</style>