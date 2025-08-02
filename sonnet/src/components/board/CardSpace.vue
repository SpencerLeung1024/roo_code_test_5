<template>
  <div class="card-space-content" :class="`card-${space.cardType}`">
    <!-- Card space icon/header -->
    <div class="card-header">
      <div class="card-icon">{{ cardIcon }}</div>
    </div>
    
    <!-- Card space name -->
    <div class="card-name">{{ space.name }}</div>
    
    <!-- Card space description -->
    <div class="card-description">{{ cardDescription }}</div>
    
    <!-- Player pieces on this space -->
    <PlayerPieces :players-on-space="playersOnSpace" />
  </div>
</template>

<script>
import { computed } from 'vue'
import PlayerPieces from './PlayerPieces.vue'

export default {
  name: 'CardSpace',
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
    // Get appropriate icon based on card type
    const cardIcon = computed(() => {
      switch (props.space.cardType) {
        case 'chance':
          return '?'
        case 'communityChest':
          return '📦'
        default:
          return '🎴'
      }
    })
    
    // Get description based on card type
    const cardDescription = computed(() => {
      switch (props.space.cardType) {
        case 'chance':
          return 'Draw a Chance card'
        case 'communityChest':
          return 'Draw a Community Chest card'
        default:
          return 'Draw a card'
      }
    })
    
    return {
      cardIcon,
      cardDescription
    }
  }
}
</script>

<style scoped>
.card-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: white;
  font-weight: bold;
}

/* Chance card styling */
.card-chance {
  background: linear-gradient(135deg, #ff6347 0%, #e5532b 100%);
}

/* Community Chest card styling */
.card-communityChest {
  background: linear-gradient(135deg, #87ceeb 0%, #6bb5d4 100%);
  color: #2c3e50;
}

.card-header {
  background: rgba(0,0,0,0.2);
  text-align: center;
  padding: 4px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

.card-communityChest .card-header {
  background: rgba(255,255,255,0.3);
  border-bottom: 1px solid rgba(0,0,0,0.2);
}

.card-icon {
  font-size: 0.9rem;
  line-height: 1;
  font-weight: bold;
}

.card-name {
  font-size: 0.6rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.1;
  padding: 3px 4px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.card-communityChest .card-name {
  text-shadow: none;
}

.card-description {
  font-size: 0.45rem;
  text-align: center;
  padding: 2px;
  background: rgba(0,0,0,0.3);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.card-communityChest .card-description {
  background: rgba(255,255,255,0.4);
  color: #2c3e50;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    height: 16px;
    padding: 2px;
  }
  
  .card-icon {
    font-size: 0.8rem;
  }
  
  .card-name {
    font-size: 0.55rem;
    padding: 2px;
  }
  
  .card-description {
    font-size: 0.4rem;
  }
}

@media (max-width: 480px) {
  .card-header {
    height: 14px;
    padding: 1px;
  }
  
  .card-icon {
    font-size: 0.7rem;
  }
  
  .card-name {
    font-size: 0.5rem;
    padding: 1px 2px;
  }
  
  .card-description {
    font-size: 0.35rem;
  }
}
</style>