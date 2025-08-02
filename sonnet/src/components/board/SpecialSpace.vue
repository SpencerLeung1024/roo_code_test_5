<template>
  <div class="special-space-content" :class="`special-${space.specialType}`">
    <!-- Special space icon/header -->
    <div class="special-header">
      <div class="special-icon">{{ specialIcon }}</div>
    </div>
    
    <!-- Special space name -->
    <div class="special-name">{{ space.name }}</div>
    
    <!-- Special space description/action -->
    <div class="special-description">{{ specialDescription }}</div>
    
    <!-- GO salary indicator -->
    <div class="go-salary" v-if="space.specialType === 'go'">
      Collect $200
    </div>
    
    <!-- Enhanced Jail status for players -->
    <div class="jail-info" v-if="space.specialType === 'jail'">
      <div class="jail-sections">
        <!-- Just Visiting Section -->
        <div class="jail-section visiting-section">
          <div class="section-label">Visiting</div>
          <div class="visiting-players">
            <div
              v-for="player in visitingPlayers"
              :key="player.id"
              class="visiting-player"
              :style="{ backgroundColor: player.color }"
              :title="player.name + ' - Just Visiting'"
            >
              {{ getPlayerPieceSymbol(player.piece) }}
            </div>
          </div>
        </div>
        
        <!-- In Jail Section -->
        <div class="jail-section imprisoned-section" v-if="playersInJail.length > 0">
          <div class="section-label">In Jail</div>
          <div class="imprisoned-players">
            <div
              v-for="player in playersInJail"
              :key="player.id"
              class="imprisoned-player"
              :style="{ backgroundColor: player.color }"
              :title="player.name + ' - ' + player.jailTurns + ' turns left'"
            >
              <span class="player-piece">{{ getPlayerPieceSymbol(player.piece) }}</span>
              <span class="jail-turns">{{ player.jailTurns }}</span>
            </div>
          </div>
        </div>
        
        <!-- Jail Bars Visual Effect -->
        <div class="jail-bars" v-if="playersInJail.length > 0">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </div>
    </div>
    
    <!-- Player pieces on this space -->
    <PlayerPieces :players-on-space="playersOnSpace" />
  </div>
</template>

<script>
import { computed } from 'vue'
import gameState from '../../game/gameState.js'
import PlayerPieces from './PlayerPieces.vue'

export default {
  name: 'SpecialSpace',
  components: {
    PlayerPieces
  },
  
  props: {
    space: {
      type: Object,
      required: true
    },
    playersOnSpace: {
      type: Array,
      default: () => []
    }
  },
  
  setup(props) {
    // Get appropriate icon based on special space type
    const specialIcon = computed(() => {
      switch (props.space.specialType) {
        case 'go':
          return '🏁'
        case 'jail':
          return '🔒'
        case 'freeParking':
          return '🅿️'
        case 'goToJail':
          return '👮'
        default:
          return '❓'
      }
    })
    
    // Get description based on special space type
    const specialDescription = computed(() => {
      switch (props.space.specialType) {
        case 'go':
          return 'START'
        case 'jail':
          return 'Just Visiting'
        case 'freeParking':
          return 'Free Parking'
        case 'goToJail':
          return 'Go to Jail'
        default:
          return ''
      }
    })
    
    // Get players currently in jail (for jail space)
    const playersInJail = computed(() => {
      if (props.space.specialType === 'jail') {
        return gameState.players.filter(player => player.isInJail)
      }
      return []
    })

    // Get players just visiting jail (on space but not in jail)
    const visitingPlayers = computed(() => {
      if (props.space.specialType === 'jail') {
        const playersOnSpace = props.playersOnSpace || []
        return gameState.players.filter(player =>
          playersOnSpace.includes(player.id) && !player.isInJail
        )
      }
      return []
    })

    // Get player piece symbol
    const getPlayerPieceSymbol = (piece) => {
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
      return gamePieces[piece] || piece || '❓'
    }
    
    return {
      specialIcon,
      specialDescription,
      playersInJail,
      visitingPlayers,
      getPlayerPieceSymbol
    }
  }
}
</script>

<style scoped>
.special-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: white;
  font-weight: bold;
}

/* GO space styling */
.special-go {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

/* Jail space styling */
.special-jail {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

/* Free Parking space styling */
.special-freeParking {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
}

/* Go to Jail space styling */
.special-goToJail {
  background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
}

.special-header {
  background: rgba(0,0,0,0.2);
  text-align: center;
  padding: 4px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

.special-icon {
  font-size: 1rem;
  line-height: 1;
}

.special-name {
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.1;
  padding: 4px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.special-description {
  font-size: 0.5rem;
  text-align: center;
  padding: 2px;
  background: rgba(255,255,255,0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.go-salary {
  font-size: 0.45rem;
  text-align: center;
  background: rgba(255,255,255,0.3);
  padding: 2px;
  color: #fff;
  font-weight: bold;
}

.jail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.jail-sections {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.jail-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-label {
  font-size: 0.4rem;
  color: #fff;
  background: rgba(0,0,0,0.5);
  padding: 1px 4px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
}

.visiting-section {
  background: rgba(52, 152, 219, 0.3);
}

.imprisoned-section {
  background: rgba(231, 76, 60, 0.5);
  border-top: 1px solid rgba(255,255,255,0.3);
}

.visiting-players,
.imprisoned-players {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  padding: 2px;
  flex: 1;
  align-content: flex-start;
}

.visiting-player,
.imprisoned-player {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.4rem;
  color: #fff;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.imprisoned-player {
  border: 1px solid #e74c3c;
  animation: prisonPulse 2s infinite;
}

.imprisoned-player .jail-turns {
  position: absolute;
  bottom: -8px;
  right: -4px;
  font-size: 0.3rem;
  background: #e74c3c;
  color: #fff;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.jail-bars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  pointer-events: none;
  z-index: 1;
}

.jail-bars .bar {
  width: 2px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%);
  box-shadow: 1px 0 2px rgba(0,0,0,0.3);
}

@keyframes prisonPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

/* Corner space specific styling */
.board-space.corner-space .special-space-content {
  padding: 4px;
}

.board-space.corner-space .special-header {
  height: 24px;
}

.board-space.corner-space .special-icon {
  font-size: 1.2rem;
}

.board-space.corner-space .special-name {
  font-size: 0.8rem;
}

.board-space.corner-space .special-description {
  font-size: 0.6rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .special-header {
    height: 16px;
    padding: 2px;
  }
  
  .special-icon {
    font-size: 0.8rem;
  }
  
  .special-name {
    font-size: 0.6rem;
    padding: 2px;
  }
  
  .special-description {
    font-size: 0.45rem;
  }
  
  .go-salary {
    font-size: 0.4rem;
  }
  
  .jail-indicator {
    font-size: 0.35rem;
  }
  
  .board-space.corner-space .special-header {
    height: 20px;
  }
  
  .board-space.corner-space .special-icon {
    font-size: 1rem;
  }
  
  .board-space.corner-space .special-name {
    font-size: 0.7rem;
  }
  
  .board-space.corner-space .special-description {
    font-size: 0.5rem;
  }
}

@media (max-width: 480px) {
  .special-header {
    height: 14px;
    padding: 1px;
  }
  
  .special-icon {
    font-size: 0.7rem;
  }
  
  .special-name {
    font-size: 0.55rem;
    padding: 1px;
  }
  
  .special-description {
    font-size: 0.4rem;
  }
  
  .go-salary {
    font-size: 0.35rem;
  }
  
  .jail-indicator {
    font-size: 0.3rem;
  }
  
  .board-space.corner-space .special-header {
    height: 16px;
  }
  
  .board-space.corner-space .special-icon {
    font-size: 0.9rem;
  }
  
  .board-space.corner-space .special-name {
    font-size: 0.6rem;
  }
  
  .board-space.corner-space .special-description {
    font-size: 0.45rem;
  }
}
</style>