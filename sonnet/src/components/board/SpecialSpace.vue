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
    
    <!-- Jail status for players -->
    <div class="jail-info" v-if="space.specialType === 'jail' && playersInJail.length > 0">
      <div class="jail-indicator">
        In Jail: {{ playersInJail.length }}
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
    
    return {
      specialIcon,
      specialDescription,
      playersInJail
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
  background: rgba(0,0,0,0.3);
  padding: 2px;
}

.jail-indicator {
  font-size: 0.4rem;
  text-align: center;
  color: #fff;
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