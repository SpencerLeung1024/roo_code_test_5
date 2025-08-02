<template>
  <div class="player-stats">
    <div class="stats-header">
      <h4>{{ player.name }} - Statistics</h4>
      <div class="player-indicator">
        <span class="player-piece" :style="{ color: player.color }">
          {{ getPlayerPieceSymbol() }}
        </span>
      </div>
    </div>

    <div class="stats-content">
      <!-- Financial Overview -->
      <div class="stats-section financial">
        <div class="section-title">
          <span class="section-icon">💰</span>
          <span>Financial Overview</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item primary">
            <div class="stat-label">Cash on Hand</div>
            <div class="stat-value">${{ player.money.toLocaleString() }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Net Worth</div>
            <div class="stat-value">${{ netWorth.toLocaleString() }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Property Value</div>
            <div class="stat-value">${{ propertyValue.toLocaleString() }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Development Value</div>
            <div class="stat-value">${{ developmentValue.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Property Portfolio -->
      <div class="stats-section portfolio">
        <div class="section-title">
          <span class="section-icon">🏠</span>
          <span>Property Portfolio</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Properties Owned</div>
            <div class="stat-value">{{ totalProperties }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Monopolies</div>
            <div class="stat-value">{{ monopolyCount }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Houses Built</div>
            <div class="stat-value">{{ player.houses || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Hotels Built</div>
            <div class="stat-value">{{ player.hotels || 0 }}</div>
          </div>
        </div>

        <!-- Property Breakdown -->
        <div class="property-breakdown">
          <div class="breakdown-row">
            <span class="breakdown-label">Regular Properties:</span>
            <span class="breakdown-value">{{ player.properties?.length || 0 }}</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Railroads:</span>
            <span class="breakdown-value">{{ player.railroads?.length || 0 }}/4</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Utilities:</span>
            <span class="breakdown-value">{{ player.utilities?.length || 0 }}/2</span>
          </div>
        </div>
      </div>

      <!-- Income Analysis -->
      <div class="stats-section income">
        <div class="section-title">
          <span class="section-icon">📈</span>
          <span>Income Analysis</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Potential Rent Income</div>
            <div class="stat-value">${{ potentialRentIncome.toLocaleString() }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Rent Collected</div>
            <div class="stat-value">${{ player.stats?.rentCollected?.toLocaleString() || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Rent Paid</div>
            <div class="stat-value">${{ player.stats?.rentPaid?.toLocaleString() || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Net Rent</div>
            <div class="stat-value" :class="netRentClass">
              ${{ netRent.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Game Activity -->
      <div class="stats-section activity">
        <div class="section-title">
          <span class="section-icon">🎮</span>
          <span>Game Activity</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Turns Played</div>
            <div class="stat-value">{{ player.stats?.turnsPlayed || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Properties Bought</div>
            <div class="stat-value">{{ player.stats?.propertiesBought || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Times in Jail</div>
            <div class="stat-value">{{ player.stats?.timesInJail || 0 }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">Current Position</div>
            <div class="stat-value">{{ currentPositionName }}</div>
          </div>
        </div>
      </div>

      <!-- Color Group Analysis -->
      <div v-if="colorGroupAnalysis.length > 0" class="stats-section color-groups">
        <div class="section-title">
          <span class="section-icon">🎨</span>
          <span>Color Group Progress</span>
        </div>
        
        <div class="color-groups-list">
          <div 
            v-for="group in colorGroupAnalysis"
            :key="group.color"
            class="color-group-item"
          >
            <div class="group-header">
              <div 
                class="group-color-indicator"
                :style="{ backgroundColor: group.colorHex }"
              ></div>
              <div class="group-name">{{ group.colorName }}</div>
              <div class="group-progress">{{ group.owned }}/{{ group.total }}</div>
            </div>
            
            <div class="group-details">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ 
                    width: group.progressPercent + '%',
                    backgroundColor: group.colorHex
                  }"
                ></div>
              </div>
              
              <div v-if="group.isMonopoly" class="monopoly-badge">
                ⭐ MONOPOLY
              </div>
              
              <div class="group-properties">
                <span 
                  v-for="property in group.properties"
                  :key="property.id"
                  :class="['property-tag', { owned: property.owned }]"
                >
                  {{ property.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Status -->
      <div class="stats-section status">
        <div class="section-title">
          <span class="section-icon">⚡</span>
          <span>Current Status</span>
        </div>
        
        <div class="status-indicators">
          <div class="status-item" :class="player.isActive ? 'active' : 'inactive'">
            <span class="status-icon">{{ player.isActive ? '✅' : '❌' }}</span>
            <span class="status-text">{{ player.isActive ? 'Active' : 'Inactive' }}</span>
          </div>
          
          <div v-if="player.isBankrupt" class="status-item bankrupt">
            <span class="status-icon">💸</span>
            <span class="status-text">Bankrupt</span>
          </div>
          
          <div v-if="player.isInJail" class="status-item jail">
            <span class="status-icon">🔒</span>
            <span class="status-text">In Jail ({{ player.jailTurns }} turns)</span>
          </div>
          
          <div v-if="player.getOutOfJailCards > 0" class="status-item special">
            <span class="status-icon">🗝️</span>
            <span class="status-text">{{ player.getOutOfJailCards }} Jail Card(s)</span>
          </div>
        </div>
      </div>

      <!-- Comparison with Other Players -->
      <div v-if="showComparison && playerRankings" class="stats-section comparison">
        <div class="section-title">
          <span class="section-icon">🏆</span>
          <span>Player Rankings</span>
        </div>
        
        <div class="rankings-list">
          <div 
            v-for="(ranking, index) in playerRankings"
            :key="ranking.playerId"
            :class="['ranking-item', { 'current-player': ranking.playerId === player.id }]"
          >
            <div class="rank-position">{{ index + 1 }}</div>
            <div class="rank-player">
              <span class="rank-piece" :style="{ color: ranking.color }">
                {{ getPlayerPieceSymbol(ranking.piece) }}
              </span>
              <span class="rank-name">{{ ranking.name }}</span>
            </div>
            <div class="rank-worth">${{ ranking.netWorth.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PlayerStats',
  
  props: {
    player: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    showComparison: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
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

    // Color group mappings
    const colorGroupColors = {
      'brown': '#8B4513',
      'lightblue': '#87CEEB',
      'pink': '#FF1493',
      'orange': '#FFA500',
      'red': '#FF0000',
      'yellow': '#FFFF00',
      'green': '#008000',
      'blue': '#0000FF'
    }

    const colorGroupNames = {
      'brown': 'Brown',
      'lightblue': 'Light Blue',
      'pink': 'Pink',
      'orange': 'Orange',
      'red': 'Red',
      'yellow': 'Yellow',
      'green': 'Green',
      'blue': 'Dark Blue'
    }

    // Computed properties
    const currentPositionName = computed(() => {
      const space = props.gameState.board?.[props.player.position]
      return space?.name || `Space ${props.player.position}`
    })

    const totalProperties = computed(() => {
      return (props.player.properties?.length || 0) +
             (props.player.railroads?.length || 0) +
             (props.player.utilities?.length || 0)
    })

    const propertyValue = computed(() => {
      let value = 0

      // Regular properties
      props.player.properties?.forEach(propId => {
        const property = props.gameState.properties?.[propId]
        if (property) {
          value += property.price || 0
        }
      })

      // Railroads
      props.player.railroads?.forEach(railId => {
        const railroad = props.gameState.railroads?.[railId]
        if (railroad) {
          value += railroad.price || 200
        }
      })

      // Utilities
      props.player.utilities?.forEach(utilId => {
        const utility = props.gameState.utilities?.[utilId]
        if (utility) {
          value += utility.price || 150
        }
      })

      return value
    })

    const developmentValue = computed(() => {
      let value = 0

      props.player.properties?.forEach(propId => {
        const property = props.gameState.properties?.[propId]
        if (property) {
          value += (property.houses || 0) * (property.houseCost || 0)
          if (property.hasHotel) {
            value += property.houseCost || 0
          }
        }
      })

      return value
    })

    const netWorth = computed(() => {
      return props.player.money + propertyValue.value + developmentValue.value
    })

    const potentialRentIncome = computed(() => {
      let income = 0

      // Regular properties
      props.player.properties?.forEach(propId => {
        const property = props.gameState.properties?.[propId]
        if (property && !property.isMortgaged) {
          income += property.currentRent || property.rent?.[0] || 0
        }
      })

      // Railroads
      props.player.railroads?.forEach(railId => {
        const railroad = props.gameState.railroads?.[railId]
        if (railroad && !railroad.isMortgaged) {
          income += railroad.currentRent || 0
        }
      })

      return income
    })

    const netRent = computed(() => {
      const collected = props.player.stats?.rentCollected || 0
      const paid = props.player.stats?.rentPaid || 0
      return collected - paid
    })

    const netRentClass = computed(() => {
      if (netRent.value > 0) return 'positive'
      if (netRent.value < 0) return 'negative'
      return 'neutral'
    })

    const monopolyCount = computed(() => {
      let count = 0
      const propertyGroups = {}

      // Group properties by color
      props.player.properties?.forEach(propId => {
        const property = props.gameState.properties?.[propId]
        if (property && property.isPartOfMonopoly) {
          if (!propertyGroups[property.colorGroup]) {
            propertyGroups[property.colorGroup] = true
            count++
          }
        }
      })

      return count
    })

    const colorGroupAnalysis = computed(() => {
      if (!props.gameState.properties) return []

      const groups = {}
      
      // Initialize all color groups
      Object.values(props.gameState.properties).forEach(property => {
        const group = property.colorGroup
        if (!groups[group]) {
          groups[group] = {
            color: group,
            colorName: colorGroupNames[group] || group,
            colorHex: colorGroupColors[group] || '#666666',
            total: 0,
            owned: 0,
            properties: [],
            isMonopoly: false
          }
        }
        groups[group].total++
        groups[group].properties.push({
          id: property.id,
          name: property.name,
          owned: props.player.properties?.includes(property.id) || false
        })
        
        if (props.player.properties?.includes(property.id)) {
          groups[group].owned++
        }
      })

      // Calculate progress and monopoly status
      Object.values(groups).forEach(group => {
        group.progressPercent = (group.owned / group.total) * 100
        group.isMonopoly = group.owned === group.total && group.owned > 0
      })

      // Return only groups where player owns at least one property
      return Object.values(groups).filter(group => group.owned > 0)
    })

    const playerRankings = computed(() => {
      if (!props.gameState.players) return null

      return props.gameState.players
        .filter(p => p.isActive && !p.isBankrupt)
        .map(p => {
          // Calculate net worth for each player
          let playerNetWorth = p.money
          
          // Add property values (simplified calculation)
          p.properties?.forEach(propId => {
            const property = props.gameState.properties?.[propId]
            if (property) {
              playerNetWorth += property.price || 0
              playerNetWorth += (property.houses || 0) * (property.houseCost || 0)
              if (property.hasHotel) {
                playerNetWorth += property.houseCost || 0
              }
            }
          })

          p.railroads?.forEach(() => {
            playerNetWorth += 200 // Standard railroad price
          })

          p.utilities?.forEach(() => {
            playerNetWorth += 150 // Standard utility price
          })

          return {
            playerId: p.id,
            name: p.name,
            color: p.color,
            piece: p.piece,
            netWorth: playerNetWorth
          }
        })
        .sort((a, b) => b.netWorth - a.netWorth)
    })

    // Methods
    const getPlayerPieceSymbol = (piece = props.player.piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    return {
      currentPositionName,
      totalProperties,
      propertyValue,
      developmentValue,
      netWorth,
      potentialRentIncome,
      netRent,
      netRentClass,
      monopolyCount,
      colorGroupAnalysis,
      playerRankings,
      getPlayerPieceSymbol
    }
  }
}
</script>

<style scoped>
.player-stats {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-header h4 {
  margin: 0;
  font-size: 1.2rem;
}

.player-indicator {
  display: flex;
  align-items: center;
}

.player-piece {
  font-size: 1.5rem;
  font-weight: bold;
}

.stats-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Stats Sections */
.stats-section {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  background: #f8f9fa;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 1px solid #ecf0f1;
}

.section-icon {
  font-size: 1.1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ecf0f1;
}

.stat-item.primary {
  background: linear-gradient(135deg, #d5f4e6 0%, #ffffff 100%);
  border-color: #27ae60;
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

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.stat-value.neutral {
  color: #95a5a6;
}

/* Property Breakdown */
.property-breakdown {
  padding: 1rem;
  border-top: 1px solid #ecf0f1;
  background: #f8f9fa;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.breakdown-label {
  color: #7f8c8d;
}

.breakdown-value {
  font-weight: bold;
  color: #2c3e50;
}

/* Color Groups */
.color-groups-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-group-item {
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
}

.group-header {
  background: #f8f9fa;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.group-color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #2c3e50;
}

.group-name {
  flex: 1;
  font-weight: bold;
  color: #2c3e50;
}

.group-progress {
  font-weight: bold;
  color: #7f8c8d;
}

.group-details {
  padding: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.monopoly-badge {
  color: #f39c12;
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.group-properties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.property-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: #ecf0f1;
  border-radius: 12px;
  color: #7f8c8d;
}

.property-tag.owned {
  background: #d5f4e6;
  color: #27ae60;
  font-weight: bold;
}

/* Status Indicators */
.status-indicators {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-item.active {
  background: #d5f4e6;
  color: #27ae60;
}

.status-item.inactive {
  background: #fadbd8;
  color: #e74c3c;
}

.status-item.bankrupt {
  background: #fadbd8;
  color: #e74c3c;
}

.status-item.jail {
  background: #fdeaa7;
  color: #f39c12;
}

.status-item.special {
  background: #d6eaf8;
  color: #3498db;
}

.status-icon {
  font-size: 1rem;
}

/* Rankings */
.rankings-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ecf0f1;
}

.ranking-item.current-player {
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  border-color: #f39c12;
}

.rank-position {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  min-width: 30px;
  text-align: center;
}

.rank-player {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-piece {
  font-size: 1.2rem;
  font-weight: bold;
}

.rank-name {
  font-weight: 500;
  color: #2c3e50;
}

.rank-worth {
  font-weight: bold;
  color: #27ae60;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .group-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .status-indicators {
    flex-direction: column;
  }
  
  .ranking-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .rank-player {
    flex-basis: 100%;
  }
}
</style>