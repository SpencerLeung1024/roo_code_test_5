<template>
  <div class="utility-space-content">
    <!-- Utility icon/header -->
    <div class="utility-header">
      <div class="utility-icon">{{ utilityIcon }}</div>
    </div>
    
    <!-- Utility name -->
    <div class="utility-name">{{ utility.name }}</div>
    
    <!-- Price -->
    <div class="utility-price">${{ utility.price }}</div>
    
    <!-- Ownership indicator -->
    <div class="ownership-section" v-if="utility.ownerId">
      <div 
        class="owner-indicator" 
        :style="{ backgroundColor: ownerColor }"
        :title="`Owned by ${ownerName}`"
      ></div>
      
      <!-- Mortgage indicator -->
      <div class="mortgage-indicator" v-if="utility.isMortgaged">
        MORTGAGED
      </div>
    </div>
    
    <!-- Current rent display -->
    <div class="rent-display" v-if="utility.ownerId && !utility.isMortgaged">
      {{ utility.rentMultiplier }}× dice
    </div>
    
    <!-- Utility count indicator -->
    <div class="utility-count" v-if="utility.ownerId && utilityCount > 1">
      {{ utilityCount }}/2 Utilities
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
  name: 'UtilitySpace',
  components: {
    PlayerPieces
  },
  
  props: {
    space: {
      type: Object,
      required: true
    },
    utility: {
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
      if (props.utility.ownerId) {
        return gameState.players.find(p => p.id === props.utility.ownerId)
      }
      return null
    })
    
    const ownerName = computed(() => owner.value?.name || '')
    const ownerColor = computed(() => owner.value?.color || '#2c3e50')
    
    // Count how many utilities the owner has
    const utilityCount = computed(() => {
      if (!props.utility.ownerId) return 0
      return Object.values(gameState.utilities)
        .filter(util => util.ownerId === props.utility.ownerId).length
    })
    
    // Get appropriate icon based on utility type
    const utilityIcon = computed(() => {
      if (props.utility.name.includes('Electric')) {
        return '⚡'
      } else if (props.utility.name.includes('Water')) {
        return '💧'
      }
      return '🏭' // Generic utility icon
    })
    
    return {
      owner,
      ownerName,
      ownerColor,
      utilityCount,
      utilityIcon
    }
  }
}
</script>

<style scoped>
.utility-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #2c3e50;
}

.utility-header {
  background: rgba(255,255,255,0.9);
  text-align: center;
  padding: 2px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.utility-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.utility-name {
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
  color: #2c3e50;
}

.utility-price {
  font-size: 0.5rem;
  text-align: center;
  color: #2c3e50;
  padding: 1px 2px;
  background: rgba(255,255,255,0.8);
  font-weight: bold;
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
  color: #2c3e50;
  font-weight: bold;
  background: rgba(255,255,255,0.9);
  padding: 1px;
}

.utility-count {
  font-size: 0.4rem;
  text-align: center;
  color: #2c3e50;
  font-weight: bold;
  background: rgba(255,255,255,0.8);
  padding: 1px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .utility-header {
    height: 14px;
  }
  
  .utility-icon {
    font-size: 0.7rem;
  }
  
  .utility-name {
    font-size: 0.55rem;
  }
  
  .utility-price {
    font-size: 0.45rem;
  }
  
  .mortgage-indicator {
    font-size: 0.35rem;
  }
  
  .rent-display, .utility-count {
    font-size: 0.4rem;
  }
}

@media (max-width: 480px) {
  .utility-header {
    height: 12px;
    padding: 1px;
  }
  
  .utility-icon {
    font-size: 0.6rem;
  }
  
  .utility-name {
    font-size: 0.5rem;
    padding: 1px 2px;
  }
  
  .utility-price {
    font-size: 0.4rem;
  }
  
  .mortgage-indicator {
    font-size: 0.3rem;
    padding: 1px 3px;
  }
  
  .rent-display, .utility-count {
    font-size: 0.35rem;
  }
  
  .owner-indicator {
    width: 6px;
    height: 6px;
  }
}
</style>