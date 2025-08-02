<template>
  <div class="player-dashboard">
    <div class="dashboard-header">
      <h3>Players</h3>
      <div class="game-info">
        <span>Turn {{ turnNumber }}</span>
        <span class="separator">•</span>
        <span>{{ activePlayers }} active</span>
      </div>
    </div>

    <div class="players-container">
      <PlayerPanel
        v-for="player in players"
        :key="player.id"
        :player="player"
        :is-current="player.id === currentPlayer?.id"
        :is-next="isNextPlayer(player.id)"
        :game-state="gameState"
        @player-action="handlePlayerAction"
      />
    </div>

    <div class="dashboard-summary" v-if="showSummary">
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-label">Total Money</div>
          <div class="stat-value">${{ totalMoney.toLocaleString() }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Properties Owned</div>
          <div class="stat-value">{{ totalPropertiesOwned }}/28</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Monopolies</div>
          <div class="stat-value">{{ totalMonopolies }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import PlayerPanel from './PlayerPanel.vue'

export default {
  name: 'PlayerDashboard',
  components: {
    PlayerPanel
  },
  
  props: {
    players: {
      type: Array,
      required: true
    },
    currentPlayer: {
      type: Object,
      default: null
    },
    gameState: {
      type: Object,
      required: true
    },
    turnNumber: {
      type: Number,
      default: 1
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  },

  emits: ['player-action'],

  setup(props, { emit }) {
    // Computed properties
    const activePlayers = computed(() => 
      props.players.filter(p => p.isActive && !p.isBankrupt).length
    )

    const totalMoney = computed(() => 
      props.players.reduce((sum, player) => sum + player.money, 0)
    )

    const totalPropertiesOwned = computed(() => 
      props.players.reduce((sum, player) => 
        sum + player.properties.length + player.railroads.length + player.utilities.length, 0
      )
    )

    const totalMonopolies = computed(() => {
      if (!props.gameState.properties) return 0
      
      // Count monopolies by checking color groups
      const colorGroups = {}
      
      Object.values(props.gameState.properties).forEach(property => {
        if (property.ownerId && property.isPartOfMonopoly) {
          const group = property.colorGroup
          if (!colorGroups[group]) {
            colorGroups[group] = new Set()
          }
          colorGroups[group].add(property.ownerId)
        }
      })

      // Count unique monopolies (each color group counts as 1)
      return Object.keys(colorGroups).length
    })

    // Methods
    const isNextPlayer = (playerId) => {
      if (!props.currentPlayer) return false
      
      const currentIndex = props.players.findIndex(p => p.id === props.currentPlayer.id)
      const nextIndex = (currentIndex + 1) % props.players.length
      
      return props.players[nextIndex]?.id === playerId
    }

    const handlePlayerAction = (action) => {
      emit('player-action', action)
    }

    return {
      activePlayers,
      totalMoney,
      totalPropertiesOwned,
      totalMonopolies,
      isNextPlayer,
      handlePlayerAction
    }
  }
}
</script>

<style scoped>
.player-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.dashboard-header {
  background: #34495e;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.game-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.separator {
  margin: 0 0.5rem;
}

.players-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-summary {
  background: #f8f9fa;
  border-top: 1px solid #ecf0f1;
  padding: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-label {
    margin-bottom: 0;
    text-align: left;
  }
}
</style>