<template>
  <div 
    class="board-space"
    :class="spaceClasses"
    @click="handleSpaceClick"
  >
    <!-- Property Space -->
    <PropertySpace 
      v-if="space.type === 'property'"
      :space="space"
      :property="propertyData"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Railroad Space -->
    <RailroadSpace 
      v-else-if="space.type === 'railroad'"
      :space="space"
      :railroad="railroadData"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Utility Space -->
    <UtilitySpace 
      v-else-if="space.type === 'utility'"
      :space="space"
      :utility="utilityData"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Special Space (GO, Jail, Free Parking, Go to Jail) -->
    <SpecialSpace 
      v-else-if="space.type === 'special'"
      :space="space"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Card Space (Chance, Community Chest) -->
    <CardSpace 
      v-else-if="space.type === 'card'"
      :space="space"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Tax Space -->
    <TaxSpace 
      v-else-if="space.type === 'tax'"
      :space="space"
      :players-on-space="playersOnSpace"
    />
    
    <!-- Default fallback -->
    <div v-else class="space-content">
      <div class="space-name">{{ space.name }}</div>
      <PlayerPieces :players-on-space="playersOnSpace" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import gameState from '../../game/gameState.js'
import PropertySpace from './PropertySpace.vue'
import RailroadSpace from './RailroadSpace.vue'
import UtilitySpace from './UtilitySpace.vue'
import SpecialSpace from './SpecialSpace.vue'
import CardSpace from './CardSpace.vue'
import TaxSpace from './TaxSpace.vue'
import PlayerPieces from './PlayerPieces.vue'

export default {
  name: 'BoardSpace',
  components: {
    PropertySpace,
    RailroadSpace,
    UtilitySpace,
    SpecialSpace,
    CardSpace,
    TaxSpace,
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
    // Get property data if this is a property space
    const propertyData = computed(() => {
      if (props.space.type === 'property') {
        return gameState.properties[props.space.id]
      }
      return null
    })
    
    // Get railroad data if this is a railroad space
    const railroadData = computed(() => {
      if (props.space.type === 'railroad') {
        return gameState.railroads[props.space.id]
      }
      return null
    })
    
    // Get utility data if this is a utility space
    const utilityData = computed(() => {
      if (props.space.type === 'utility') {
        return gameState.utilities[props.space.id]
      }
      return null
    })
    
    // Generate CSS classes for the space
    const spaceClasses = computed(() => {
      const classes = ['board-space', `space-${props.space.type}`]
      
      // Add side class
      classes.push(`side-${props.space.side}`)
      
      // Add specific type classes
      if (props.space.type === 'special') {
        classes.push(`special-${props.space.specialType}`)
      } else if (props.space.type === 'card') {
        classes.push(`card-${props.space.cardType}`)
      }
      
      // Add corner class for corner spaces
      if ([0, 10, 20, 30].includes(props.space.id)) {
        classes.push('corner-space')
      }
      
      return classes
    })
    
    // Handle space click events
    const handleSpaceClick = () => {
      // Emit space click event or handle property selection
      console.log('Space clicked:', props.space.name)
      
      // For now, just log the space info
      if (props.space.type === 'property' && propertyData.value) {
        console.log('Property data:', propertyData.value)
      }
    }
    
    return {
      propertyData,
      railroadData,
      utilityData,
      spaceClasses,
      handleSpaceClick
    }
  }
}
</script>

<style scoped>
.board-space {
  background: white;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
  min-height: 60px;
  display: flex;
  flex-direction: column;
}

.board-space:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

/* Corner spaces are larger */
.corner-space {
  min-height: 80px;
}

/* Side-specific orientations */
.side-bottom {
  /* Bottom spaces read normally */
}

.side-left {
  /* Left spaces rotate text */
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.side-top {
  /* Top spaces are upside down */
  transform: rotate(180deg);
}

.side-right {
  /* Right spaces rotate text the other way */
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

/* Default space content */
.space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
}

.space-name {
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  color: #2c3e50;
  line-height: 1.1;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .board-space {
    min-height: 50px;
  }
  
  .corner-space {
    min-height: 60px;
  }
  
  .space-name {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .board-space {
    min-height: 40px;
  }
  
  .corner-space {
    min-height: 50px;
  }
  
  .space-name {
    font-size: 0.5rem;
  }
}
</style>