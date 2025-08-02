<template>
  <div class="railroad-space-content">
    <!-- Railroad icon/header -->
    <div class="railroad-header">
      <div class="railroad-icon">🚂</div>
    </div>
    
    <!-- Railroad name -->
    <div class="railroad-name">{{ railroad.name }}</div>
    
    <!-- Price -->
    <div class="railroad-price">${{ railroad.price }}</div>
    
    <!-- Ownership indicator -->
    <div class="ownership-section" v-if="railroad.ownerId">
      <div 
        class="owner-indicator" 
        :style="{ backgroundColor: ownerColor }"
        :title="`Owned by ${ownerName}`"
      ></div>
      
      <!-- Mortgage indicator -->
      <div class="mortgage-indicator" v-if="railroad.isMortgaged">
        MORTGAGED
      </div>
    </div>
    
    <!-- Current rent display -->
    <div class="rent-display" v-if="railroad.ownerId && !railroad.isMortgaged">
      Rent: ${{ railroad.currentRent }}
    </div>
    
    <!-- Railroad count indicator -->
    <div class="railroad-count" v-if="railroad.ownerId && railroadCount > 1">
      {{ railroadCount }}/4 RR
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
  name: 'RailroadSpace',
  components: {
    PlayerPieces
  },
  
  props: {
    space: {
      type: Object,
      required: true
    },
    railroad: {
      type: Object,
      required: true
    },
    playersOnSpace: {
      type: Array,
      default: () => []
    }
  },
  
  setup(props) {
    // Get owner information
    const owner = computed(() => {
      if (props.railroad.ownerId) {
        return gameState.players.find(p => p.id === props.railroad.ownerId)
      }
      return null
    })
    
    const ownerName = computed(() => owner.value?.name || '')
    const ownerColor = computed(() => owner.value?.color || '#2c3e50')
    
    // Count how many railroads the owner has
    const railroadCount = computed(() => {
      if (!props.railroad.ownerId) return 0
      return Object.values(gameState.railroads)
        .filter(rr => rr.ownerId === props.railroad.ownerId).length
    })
    
    return {
      owner,
      ownerName,
      ownerColor,
      railroadCount
    }
  }
}
</script>

<style scoped>
.railroad-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.railroad-header {
  background: #000;
  color: white;
  text-align: center;
  padding: 2px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.railroad-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.railroad-name {
  font-size: 0.6rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.1;
  padding: 2px 4px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

.railroad-price {
  font-size: 0.5rem;
  text-align: center;
  color: #ecf0f1;
  padding: 1px 2px;
  background: rgba(0,0,0,0.3);
}

.ownership-section {
  position: relative;
  min-height: 12px;
}

.owner-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid white;
  z-index: 2;
}

.mortgage-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  background: #e74c3c;
  color: white;
  font-size: 0.4rem;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 2px;
  z-index: 3;
  white-space: nowrap;
}

.rent-display {
  font-size: 0.45rem;
  text-align: center;
  color: #f1c40f;
  font-weight: bold;
  background: rgba(0,0,0,0.4);
  padding: 1px;
}

.railroad-count {
  font-size: 0.4rem;
  text-align: center;
  color: #f1c40f;
  font-weight: bold;
  background: rgba(0,0,0,0.5);
  padding: 1px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .railroad-header {
    height: 14px;
  }
  
  .railroad-icon {
    font-size: 0.7rem;
  }
  
  .railroad-name {
    font-size: 0.55rem;
  }
  
  .railroad-price {
    font-size: 0.45rem;
  }
  
  .mortgage-indicator {
    font-size: 0.35rem;
  }
  
  .rent-display, .railroad-count {
    font-size: 0.4rem;
  }
}

@media (max-width: 480px) {
  .railroad-header {
    height: 12px;
    padding: 1px;
  }
  
  .railroad-icon {
    font-size: 0.6rem;
  }
  
  .railroad-name {
    font-size: 0.5rem;
    padding: 1px 2px;
  }
  
  .railroad-price {
    font-size: 0.4rem;
  }
  
  .mortgage-indicator {
    font-size: 0.3rem;
    padding: 1px 3px;
  }
  
  .rent-display, .railroad-count {
    font-size: 0.35rem;
  }
  
  .owner-indicator {
    width: 6px;
    height: 6px;
  }
}
</style>