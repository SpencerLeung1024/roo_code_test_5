<template>
  <div class="property-space-content">
    <!-- Color bar for property group -->
    <div 
      class="color-bar" 
      :style="{ backgroundColor: property.colorGroup }"
    ></div>
    
    <!-- Property name -->
    <div class="property-name">{{ property.name }}</div>
    
    <!-- Price -->
    <div class="property-price">${{ property.price }}</div>
    
    <!-- Ownership indicator -->
    <div class="ownership-section" v-if="property.ownerId">
      <div 
        class="owner-indicator" 
        :style="{ backgroundColor: ownerColor }"
        :title="`Owned by ${ownerName}`"
      ></div>
      
      <!-- Development indicators -->
      <div class="development-row" v-if="property.houses > 0 || property.hasHotel">
        <div class="house" v-for="n in property.houses" :key="`house-${n}`">🏠</div>
        <div class="hotel" v-if="property.hasHotel">🏨</div>
      </div>
      
      <!-- Mortgage indicator -->
      <div class="mortgage-indicator" v-if="property.isMortgaged">
        MORTGAGED
      </div>
    </div>
    
    <!-- Current rent display -->
    <div class="rent-display" v-if="property.ownerId && !property.isMortgaged">
      Rent: ${{ property.currentRent }}
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
  name: 'PropertySpace',
  components: {
    PlayerPieces
  },
  
  props: {
    space: {
      type: Object,
      required: true
    },
    property: {
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
      if (props.property.ownerId) {
        return gameState.players.find(p => p.id === props.property.ownerId)
      }
      return null
    })
    
    const ownerName = computed(() => owner.value?.name || '')
    const ownerColor = computed(() => owner.value?.color || '#2c3e50')
    
    return {
      owner,
      ownerName,
      ownerColor
    }
  }
}
</script>

<style scoped>
.property-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.color-bar {
  height: 8px;
  width: 100%;
  flex-shrink: 0;
}

.property-name {
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  color: #2c3e50;
  line-height: 1.2;
  padding: 2px 4px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  min-height: 24px;
  background: rgba(255, 255, 255, 0.9);
}

.property-price {
  font-size: 0.55rem;
  text-align: center;
  color: #2c3e50;
  font-weight: 600;
  padding: 2px 4px;
  background: rgba(255,255,255,0.95);
  border-top: 1px solid #ecf0f1;
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

.development-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1px;
  padding: 1px;
  background: rgba(255,255,255,0.9);
  font-size: 0.6rem;
}

.house, .hotel {
  line-height: 1;
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
  color: #27ae60;
  font-weight: bold;
  background: rgba(255,255,255,0.9);
  padding: 1px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-name {
    font-size: 0.55rem;
  }
  
  .property-price {
    font-size: 0.45rem;
  }
  
  .development-row {
    font-size: 0.5rem;
  }
  
  .mortgage-indicator {
    font-size: 0.35rem;
  }
  
  .rent-display {
    font-size: 0.4rem;
  }
}

@media (max-width: 480px) {
  .color-bar {
    height: 6px;
  }
  
  .property-name {
    font-size: 0.5rem;
    padding: 1px 2px;
  }
  
  .property-price {
    font-size: 0.4rem;
  }
  
  .development-row {
    font-size: 0.45rem;
  }
  
  .mortgage-indicator {
    font-size: 0.3rem;
    padding: 1px 3px;
  }
  
  .rent-display {
    font-size: 0.35rem;
  }
  
  .owner-indicator {
    width: 6px;
    height: 6px;
  }
}
</style>