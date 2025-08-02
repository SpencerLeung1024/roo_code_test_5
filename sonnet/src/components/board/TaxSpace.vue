<template>
  <div class="tax-space-content">
    <!-- Tax space icon/header -->
    <div class="tax-header">
      <div class="tax-icon">💰</div>
    </div>
    
    <!-- Tax space name -->
    <div class="tax-name">{{ space.name }}</div>
    
    <!-- Tax amount -->
    <div class="tax-amount">Pay ${{ space.taxAmount }}</div>
    
    <!-- Tax description -->
    <div class="tax-description">{{ taxDescription }}</div>
    
    <!-- Player pieces on this space -->
    <PlayerPieces :players-on-space="playersOnSpace" />
  </div>
</template>

<script>
import { computed } from 'vue'
import PlayerPieces from './PlayerPieces.vue'

export default {
  name: 'TaxSpace',
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
    // Get description based on tax type
    const taxDescription = computed(() => {
      if (props.space.name.includes('Income')) {
        return 'Income Tax'
      } else if (props.space.name.includes('Luxury')) {
        return 'Luxury Tax'
      }
      return 'Tax'
    })
    
    return {
      taxDescription
    }
  }
}
</script>

<style scoped>
.tax-space-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: #2c3e50;
  font-weight: bold;
}

.tax-header {
  background: rgba(255,255,255,0.3);
  text-align: center;
  padding: 3px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0,0,0,0.2);
}

.tax-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.tax-name {
  font-size: 0.6rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.1;
  padding: 3px 4px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
}

.tax-amount {
  font-size: 0.5rem;
  text-align: center;
  color: #e74c3c;
  padding: 2px;
  background: rgba(255,255,255,0.8);
  font-weight: bold;
  border-top: 1px solid rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.tax-description {
  font-size: 0.45rem;
  text-align: center;
  padding: 1px;
  background: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #2c3e50;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tax-header {
    height: 14px;
    padding: 2px;
  }
  
  .tax-icon {
    font-size: 0.7rem;
  }
  
  .tax-name {
    font-size: 0.55rem;
    padding: 2px;
  }
  
  .tax-amount {
    font-size: 0.45rem;
  }
  
  .tax-description {
    font-size: 0.4rem;
  }
}

@media (max-width: 480px) {
  .tax-header {
    height: 12px;
    padding: 1px;
  }
  
  .tax-icon {
    font-size: 0.6rem;
  }
  
  .tax-name {
    font-size: 0.5rem;
    padding: 1px 2px;
  }
  
  .tax-amount {
    font-size: 0.4rem;
  }
  
  .tax-description {
    font-size: 0.35rem;
  }
}
</style>