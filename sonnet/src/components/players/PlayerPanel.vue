<template>
  <div 
    :class="[
      'player-panel',
      { 
        'current-player': isCurrent,
        'next-player': isNext,
        'bankrupt': player.isBankrupt,
        'in-jail': player.isInJail
      }
    ]"
  >
    <!-- Player Header -->
    <div class="player-header">
      <div class="player-identity">
        <div class="player-piece" :style="{ color: player.color }">
          {{ getPlayerPieceSymbol() }}
        </div>
        <div class="player-info">
          <div class="player-name">{{ player.name }}</div>
          <div class="player-status">
            <span v-if="player.isBankrupt" class="status-bankrupt">Bankrupt</span>
            <span v-else-if="player.isInJail" class="status-jail">
              <span class="jail-icon">🔒</span>
              In Jail ({{ player.jailTurns }} turns)
              <span v-if="player.getOutOfJailCards > 0" class="jail-card-indicator">
                🎫{{ player.getOutOfJailCards }}
              </span>
            </span>
            <span v-else-if="isCurrent" class="status-current">Current Turn</span>
            <span v-else-if="isNext" class="status-next">Next</span>
            <span v-else class="status-waiting">Waiting</span>
          </div>
        </div>
      </div>
      
      <div class="turn-indicator" v-if="isCurrent">
        <div class="indicator-crown">👑</div>
      </div>
    </div>

    <!-- Player Stats -->
    <div class="player-stats">
      <div class="stat-row">
        <div class="stat-item money">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">Money</div>
            <div class="stat-value">${{ player.money.toLocaleString() }}</div>
          </div>
        </div>
        
        <div class="stat-item position">
          <div class="stat-icon">📍</div>
          <div class="stat-content">
            <div class="stat-label">Position</div>
            <div class="stat-value">{{ currentPositionName }}</div>
          </div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-item net-worth">
          <div class="stat-icon">💎</div>
          <div class="stat-content">
            <div class="stat-label">Net Worth</div>
            <div class="stat-value">${{ netWorth.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Properties Overview -->
    <div class="properties-section" v-if="hasProperties">
      <div class="section-header">
        <h4>Properties ({{ totalProperties }})</h4>
        <button 
          @click="togglePropertiesExpanded"
          class="expand-btn"
          :class="{ expanded: propertiesExpanded }"
        >
          {{ propertiesExpanded ? '▼' : '▶' }}
        </button>
      </div>
      
      <div v-if="propertiesExpanded" class="properties-list">
        <!-- Regular Properties -->
        <div v-if="ownedProperties.length > 0" class="property-group">
          <div class="group-header">Properties</div>
          <div class="property-items">
            <div
              v-for="property in ownedProperties"
              :key="property.id"
              class="property-item"
              :style="{ borderColor: getPropertyColor(property) }"
              @click="selectProperty(property.id)"
            >
              <div class="property-name">{{ property.name }}</div>
              <div class="property-details">
                <span v-if="property.houses > 0" class="houses">
                  🏠{{ property.houses }}
                </span>
                <span v-if="property.hasHotel" class="hotel">🏨</span>
                <span v-if="property.isMortgaged" class="mortgaged">M</span>
                <span v-if="property.isPartOfMonopoly" class="monopoly">★</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Railroads -->
        <div v-if="ownedRailroads.length > 0" class="property-group">
          <div class="group-header">Railroads ({{ ownedRailroads.length }})</div>
          <div class="property-items">
            <div
              v-for="railroad in ownedRailroads"
              :key="railroad.id"
              class="property-item railroad"
              @click="selectProperty(railroad.id)"
            >
              <div class="property-name">{{ railroad.name }}</div>
              <div class="property-rent">${{ railroad.currentRent }}</div>
            </div>
          </div>
        </div>

        <!-- Utilities -->
        <div v-if="ownedUtilities.length > 0" class="property-group">
          <div class="group-header">Utilities ({{ ownedUtilities.length }})</div>
          <div class="property-items">
            <div
              v-for="utility in ownedUtilities"
              :key="utility.id"
              class="property-item utility"
              @click="selectProperty(utility.id)"
            >
              <div class="property-name">{{ utility.name }}</div>
              <div class="property-rent">{{ utility.rentMultiplier }}× dice</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Jail Card Management -->
    <div v-if="player.getOutOfJailCards > 0 || showJailCardManager" class="jail-cards-section">
      <JailCard
        :player-id="player.id"
        :jail-card-count="player.getOutOfJailCards"
        :is-in-jail="player.isInJail"
        :available-players="otherActivePlayers"
        :show-empty-state="false"
        :trading-enabled="!player.isInJail"
        @use-jail-card="handleUseJailCard"
        @trade-jail-card="handleTradeJailCard"
        @card-selected="handleJailCardSelected"
      />
    </div>

    <!-- Player Actions (only show for current player) -->
    <div v-if="isCurrent && !player.isBankrupt" class="player-actions">
      <slot name="actions" :player="player"></slot>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import JailCard from '../cards/JailCard.vue'

export default {
  name: 'PlayerPanel',
  components: {
    JailCard
  },
  
  props: {
    player: {
      type: Object,
      required: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    isNext: {
      type: Boolean,
      default: false
    },
    gameState: {
      type: Object,
      required: true
    }
  },

  emits: [
    'player-action',
    'pay-jail-fine',
    'use-jail-card',
    'roll-for-doubles'
  ],

  setup(props, { emit }) {
    const propertiesExpanded = ref(false)

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
    const currentPositionName = computed(() => {
      const space = props.gameState.board?.[props.player.position]
      return space?.name || `Space ${props.player.position}`
    })

    const ownedProperties = computed(() => {
      if (!props.gameState.properties) return []
      return props.player.properties.map(id => props.gameState.properties[id]).filter(Boolean)
    })

    const ownedRailroads = computed(() => {
      if (!props.gameState.railroads) return []
      return props.player.railroads.map(id => props.gameState.railroads[id]).filter(Boolean)
    })

    const ownedUtilities = computed(() => {
      if (!props.gameState.utilities) return []
      return props.player.utilities.map(id => props.gameState.utilities[id]).filter(Boolean)
    })

    const totalProperties = computed(() => 
      ownedProperties.value.length + ownedRailroads.value.length + ownedUtilities.value.length
    )

    const hasProperties = computed(() => totalProperties.value > 0)

    const netWorth = computed(() => {
      let worth = props.player.money

      // Add property values
      ownedProperties.value.forEach(property => {
        worth += property.price || 0
        worth += (property.houses || 0) * (property.houseCost || 0)
        if (property.hasHotel) {
          worth += property.houseCost || 0 // Hotel cost
        }
      })

      // Add railroad values
      ownedRailroads.value.forEach(railroad => {
        worth += railroad.price || 200
      })

      // Add utility values
      ownedUtilities.value.forEach(utility => {
        worth += utility.price || 150
      })

      return worth
    })

    // Jail card management
    const showJailCardManager = computed(() => {
      return props.isCurrent && (props.player.getOutOfJailCards > 0 || props.player.isInJail)
    })

    const otherActivePlayers = computed(() => {
      return props.gameState.players?.filter(p =>
        p.id !== props.player.id &&
        p.isActive &&
        !p.isBankrupt
      ) || []
    })

    // Methods
    const getPlayerPieceSymbol = () => {
      return gamePieces[props.player.piece] || props.player.piece || '❓'
    }

    const getPropertyColor = (property) => {
      const colorMap = {
        'brown': '#8B4513',
        'lightblue': '#87CEEB',
        'pink': '#FF1493',
        'orange': '#FFA500',
        'red': '#FF0000',
        'yellow': '#FFFF00',
        'green': '#008000',
        'blue': '#0000FF'
      }
      return colorMap[property.colorGroup] || '#666666'
    }

    const togglePropertiesExpanded = () => {
      propertiesExpanded.value = !propertiesExpanded.value
    }

    const selectProperty = (propertyId) => {
      emit('player-action', {
        type: 'property-selected',
        playerId: props.player.id,
        propertyId: propertyId
      })
    }

    // Jail card handlers
    const handleUseJailCard = (data, callback) => {
      emit('player-action', {
        type: 'use-jail-card',
        playerId: data.playerId,
        card: data.card,
        cardIndex: data.cardIndex
      })
      
      // Simulate success for the callback
      if (callback) {
        setTimeout(() => {
          callback({ success: true })
        }, 100)
      }
    }

    const handleTradeJailCard = (data, callback) => {
      emit('player-action', {
        type: 'trade-jail-card',
        fromPlayerId: data.fromPlayerId,
        toPlayerId: data.toPlayerId,
        price: data.price,
        card: data.card,
        cardIndex: data.cardIndex
      })
      
      // Simulate success for the callback
      if (callback) {
        setTimeout(() => {
          callback({ success: true })
        }, 100)
      }
    }

    const handleJailCardSelected = (data) => {
      console.log('Jail card selected:', data)
    }

    return {
      propertiesExpanded,
      currentPositionName,
      ownedProperties,
      ownedRailroads,
      ownedUtilities,
      totalProperties,
      hasProperties,
      netWorth,
      showJailCardManager,
      otherActivePlayers,
      getPlayerPieceSymbol,
      getPropertyColor,
      togglePropertiesExpanded,
      selectProperty,
      handleUseJailCard,
      handleTradeJailCard,
      handleJailCardSelected
    }
  }
}
</script>

<style scoped>
.player-panel {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.player-panel.current-player {
  border-color: #f39c12;
  box-shadow: 0 0 15px rgba(243, 156, 18, 0.3);
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.player-panel.next-player {
  border-color: #3498db;
  background: linear-gradient(135deg, #e8f4fd 0%, #ffffff 100%);
}

.player-panel.bankrupt {
  opacity: 0.6;
  border-color: #e74c3c;
  background: #fdf2f2;
}

.player-panel.in-jail {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  position: relative;
}

.player-panel.in-jail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    #e74c3c 0px,
    #e74c3c 10px,
    transparent 10px,
    transparent 20px
  );
  animation: jailStripes 2s linear infinite;
}

@keyframes jailStripes {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}

/* Player Header */
.player-header {
  background: #2c3e50;
  color: #ffffff;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-piece {
  font-size: 1.5rem;
  font-weight: bold;
}

.player-name {
  font-weight: 600;
  font-size: 1rem;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.player-status {
  font-size: 0.85rem;
  opacity: 1;
  color: #ffffff;
  font-weight: 500;
}

.status-current {
  color: #f1c40f;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.status-next {
  color: #74b9ff;
  font-weight: 500;
}

.status-waiting {
  color: #ddd;
  font-weight: 500;
}

.status-bankrupt {
  color: #ff7675;
  font-weight: 500;
}

.status-jail {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: jailPulse 3s infinite;
}

.jail-icon {
  font-size: 0.9rem;
}

.jail-card-indicator {
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 8px;
  color: #2ecc71;
}

@keyframes jailPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.turn-indicator {
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Player Stats */
.player-stats {
  padding: 0.75rem;
}

.stat-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.1rem;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* Properties Section */
.properties-section {
  border-top: 1px solid #ecf0f1;
  padding: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #2c3e50;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: #7f8c8d;
  transition: transform 0.2s ease;
}

.expand-btn.expanded {
  transform: rotate(90deg);
}

.properties-list {
  max-height: 200px;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 0.75rem;
}

.group-header {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #bdc3c7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.property-item:hover {
  background: #e9ecef;
  transform: translateX(2px);
}

.property-item.railroad {
  border-left-color: #34495e;
}

.property-item.utility {
  border-left-color: #f39c12;
}

.property-name {
  font-size: 0.8rem;
  color: #2c3e50;
  flex: 1;
}

.property-details {
  display: flex;
  gap: 0.25rem;
  font-size: 0.7rem;
}

.property-rent {
  font-size: 0.8rem;
  color: #27ae60;
  font-weight: bold;
}

.houses, .hotel {
  color: #e67e22;
}

.mortgaged {
  color: #e74c3c;
  font-weight: bold;
}

.monopoly {
  color: #f1c40f;
}

/* Jail Cards Section */
.jail-cards-section {
  border-top: 1px solid #ecf0f1;
  padding: 0.75rem;
  background: #f8f9fa;
}

/* Special Cards */
.special-cards {
  border-top: 1px solid #ecf0f1;
  padding: 0.75rem;
  background: #f8f9fa;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #2c3e50;
}

.card-icon {
  font-size: 1rem;
}

/* Player Actions */
.player-actions {
  border-top: 1px solid #ecf0f1;
  padding: 0.75rem;
  background: #fff9e6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 0.4rem;
  }
  
  .player-piece {
    font-size: 1.2rem;
  }
  
  .player-name {
    font-size: 0.9rem;
  }
  
  .properties-list {
    max-height: 150px;
  }
}
</style>