<template>
  <div class="game-summary-overlay" v-if="showSummary">
    <div class="summary-modal">
      <div class="summary-header">
        <h2>📊 Game Summary & Statistics</h2>
        <div class="summary-subtitle">
          Complete analysis of your Monopoly game
        </div>
        <button @click="closeSummary" class="close-btn">✖️</button>
      </div>

      <div class="summary-content">
        <!-- Game Overview -->
        <section class="summary-section">
          <h3>🎮 Game Overview</h3>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="card-icon">⏱️</div>
              <div class="card-content">
                <div class="card-title">Game Duration</div>
                <div class="card-value">{{ formatDuration(gameStats.duration) }}</div>
                <div class="card-subtitle">{{ gameStats.totalTurns }} total turns</div>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="card-icon">👥</div>
              <div class="card-content">
                <div class="card-title">Players</div>
                <div class="card-value">{{ gameStats.totalPlayers }}</div>
                <div class="card-subtitle">{{ gameStats.activePlayers }} survived</div>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <div class="card-title">Total Money</div>
                <div class="card-value">${{ Math.round(gameStats.gameMetrics.totalMoneyInGame).toLocaleString() }}</div>
                <div class="card-subtitle">In circulation</div>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="card-icon">🏠</div>
              <div class="card-content">
                <div class="card-title">Properties</div>
                <div class="card-value">{{ gameStats.propertiesDistributed }}</div>
                <div class="card-subtitle">Total owned</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Winner Spotlight -->
        <section v-if="winnerData.player" class="summary-section">
          <h3>🏆 Winner Spotlight</h3>
          <div class="winner-spotlight">
            <div class="spotlight-avatar">
              <div class="player-piece" :style="{ color: winnerData.player.color }">
                {{ getPlayerPieceSymbol(winnerData.player.piece) }}
              </div>
              <div class="winner-crown">👑</div>
            </div>
            
            <div class="spotlight-info">
              <div class="spotlight-name">{{ winnerData.player.name }}</div>
              <div class="spotlight-reason">{{ endReason }}</div>
              
              <div class="spotlight-stats">
                <div class="spotlight-stat">
                  <span class="stat-label">Final Net Worth:</span>
                  <span class="stat-value">${{ winnerData.netWorth.toLocaleString() }}</span>
                </div>
                <div class="spotlight-stat">
                  <span class="stat-label">Cash on Hand:</span>
                  <span class="stat-value">${{ winnerData.player.money.toLocaleString() }}</span>
                </div>
                <div class="spotlight-stat">
                  <span class="stat-label">Properties Owned:</span>
                  <span class="stat-value">{{ getTotalAssets(winnerData.player) }}</span>
                </div>
                <div class="spotlight-stat">
                  <span class="stat-label">Advantage Margin:</span>
                  <span class="stat-value">{{ calculateAdvantageMargin() }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Player Performance Breakdown -->
        <section class="summary-section">
          <h3>📈 Player Performance</h3>
          <div class="performance-table">
            <div class="table-header">
              <div class="col-rank">Rank</div>
              <div class="col-player">Player</div>
              <div class="col-status">Status</div>
              <div class="col-networth">Net Worth</div>
              <div class="col-cash">Cash</div>
              <div class="col-properties">Assets</div>
              <div class="col-performance">Performance</div>
            </div>
            
            <div 
              v-for="(player, index) in gameStats.playerRankings" 
              :key="player.playerId"
              class="table-row"
              :class="{ 
                winner: index === 0 && player.status !== 'bankrupt',
                bankrupt: player.status === 'bankrupt'
              }"
            >
              <div class="col-rank">
                <span class="rank-number">{{ player.rank }}</span>
                <span v-if="index === 0 && player.status !== 'bankrupt'" class="rank-medal">🥇</span>
                <span v-else-if="index === 1 && player.status !== 'bankrupt'" class="rank-medal">🥈</span>
                <span v-else-if="index === 2 && player.status !== 'bankrupt'" class="rank-medal">🥉</span>
              </div>
              
              <div class="col-player">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-piece-small">{{ getPlayerPieceSymbol(getPlayerPiece(player.playerId)) }}</div>
              </div>
              
              <div class="col-status">
                <span class="status-badge" :class="{ active: player.status === 'active', bankrupt: player.status === 'bankrupt' }">
                  {{ player.status.toUpperCase() }}
                </span>
              </div>
              
              <div class="col-networth">
                <span class="networth-value">${{ player.netWorth.toLocaleString() }}</span>
              </div>
              
              <div class="col-cash">
                <span class="cash-value">${{ getPlayerCash(player.playerId).toLocaleString() }}</span>
              </div>
              
              <div class="col-properties">
                <div class="assets-breakdown">
                  <span class="asset-count">{{ player.properties + player.railroads + player.utilities }}</span>
                  <div class="asset-details">
                    <span v-if="player.properties > 0">🏠{{ player.properties }}</span>
                    <span v-if="player.railroads > 0">🚂{{ player.railroads }}</span>
                    <span v-if="player.utilities > 0">⚡{{ player.utilities }}</span>
                  </div>
                </div>
              </div>
              
              <div class="col-performance">
                <div class="performance-indicators">
                  <span v-if="isPropertyMogul(player)" class="indicator property">🏰</span>
                  <span v-if="isCashKing(player)" class="indicator cash">💰</span>
                  <span v-if="isMonopolist(player)" class="indicator monopoly">⭐</span>
                  <span v-if="player.status === 'bankrupt'" class="indicator bankrupt">💀</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Property Distribution -->
        <section class="summary-section">
          <h3>🏠 Property Distribution</h3>
          <div class="property-distribution">
            <div class="distribution-chart">
              <div class="chart-title">Properties by Color Group</div>
              <div class="color-groups">
                <div 
                  v-for="group in propertyDistribution" 
                  :key="group.colorGroup"
                  class="color-group"
                >
                  <div class="group-header">
                    <div class="group-color" :style="{ backgroundColor: group.color }"></div>
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-count">{{ group.totalProperties }} properties</div>
                  </div>
                  
                  <div class="group-ownership">
                    <div 
                      v-for="owner in group.ownership" 
                      :key="owner.playerId"
                      class="ownership-bar"
                      :style="{ 
                        width: (owner.count / group.totalProperties * 100) + '%',
                        backgroundColor: owner.playerColor 
                      }"
                      :title="`${owner.playerName}: ${owner.count} properties`"
                    ></div>
                  </div>
                  
                  <div class="group-details">
                    <span v-if="group.monopolyOwner" class="monopoly-indicator">
                      ⭐ Monopoly: {{ group.monopolyOwner }}
                    </span>
                    <span v-else class="no-monopoly">No monopoly</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="distribution-stats">
              <div class="stat-card">
                <div class="stat-title">Total Monopolies</div>
                <div class="stat-value">{{ totalMonopolies }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">Most Properties</div>
                <div class="stat-value">{{ mostPropertiesPlayer.name }}</div>
                <div class="stat-subtitle">{{ mostPropertiesPlayer.count }} properties</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">Development Leader</div>
                <div class="stat-value">{{ developmentLeader.name }}</div>
                <div class="stat-subtitle">{{ developmentLeader.developments }} developments</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Financial Analysis -->
        <section class="summary-section">
          <h3>💹 Financial Analysis</h3>
          <div class="financial-analysis">
            <div class="wealth-progression">
              <div class="chart-title">Wealth Progression Over Time</div>
              <div class="progression-chart">
                <!-- Simplified wealth progression visualization -->
                <div 
                  v-for="(player, index) in gameStats.playerRankings" 
                  :key="player.playerId"
                  class="wealth-line"
                  :style="{ '--player-color': getPlayerColor(player.playerId) }"
                >
                  <div class="line-player">{{ player.name }}</div>
                  <div class="line-bar" :style="{ width: (player.netWorth / maxNetWorth * 100) + '%' }"></div>
                  <div class="line-value">${{ player.netWorth.toLocaleString() }}</div>
                </div>
              </div>
            </div>
            
            <div class="financial-metrics">
              <div class="metric-card">
                <div class="metric-icon">📊</div>
                <div class="metric-content">
                  <div class="metric-title">Average Net Worth</div>
                  <div class="metric-value">${{ Math.round(gameStats.gameMetrics.averageNetWorth).toLocaleString() }}</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">💰</div>
                <div class="metric-content">
                  <div class="metric-title">Wealth Inequality</div>
                  <div class="metric-value">{{ wealthInequality }}%</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">🏦</div>
                <div class="metric-content">
                  <div class="metric-title">Bank Balance</div>
                  <div class="metric-value">${{ bankBalance.toLocaleString() }}</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">📈</div>
                <div class="metric-content">
                  <div class="metric-title">Economic Activity</div>
                  <div class="metric-value">{{ economicActivity.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Game Highlights -->
        <section class="summary-section">
          <h3>⭐ Game Highlights</h3>
          <div class="game-highlights">
            <div class="highlights-grid">
              <div v-for="highlight in gameHighlights" :key="highlight.id" class="highlight-card">
                <div class="highlight-icon">{{ highlight.icon }}</div>
                <div class="highlight-content">
                  <div class="highlight-title">{{ highlight.title }}</div>
                  <div class="highlight-description">{{ highlight.description }}</div>
                  <div class="highlight-player">{{ highlight.player }}</div>
                </div>
                <div class="highlight-value">{{ highlight.value }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Export Options -->
        <section class="summary-section">
          <h3>📤 Export & Share</h3>
          <div class="export-options">
            <button @click="exportToJSON" class="export-btn">
              <span class="export-icon">📄</span>
              Export as JSON
            </button>
            <button @click="exportToCSV" class="export-btn">
              <span class="export-icon">📊</span>
              Export as CSV
            </button>
            <button @click="shareResults" class="export-btn">
              <span class="export-icon">📱</span>
              Share Results
            </button>
            <button @click="printSummary" class="export-btn">
              <span class="export-icon">🖨️</span>
              Print Summary
            </button>
          </div>
        </section>
      </div>

      <div class="summary-actions">
        <button @click="startNewGame" class="action-btn new-game-btn">
          <span class="btn-icon">🎮</span>
          Start New Game
        </button>
        <button @click="closeSummary" class="action-btn close-btn">
          <span class="btn-icon">✅</span>
          Close Summary
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { COLOR_GROUPS } from '../../data/boardData.js'

export default {
  name: 'GameSummary',

  props: {
    winnerData: {
      type: Object,
      required: true
    },
    gameStats: {
      type: Object,
      required: true
    },
    endReason: {
      type: String,
      default: 'Last Player Standing'
    },
    gameState: {
      type: Object,
      required: true
    }
  },

  emits: [
    'start-new-game',
    'close-summary'
  ],

  setup(props, { emit }) {
    const showSummary = ref(true)

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
    const maxNetWorth = computed(() => {
      return Math.max(...props.gameStats.playerRankings.map(p => p.netWorth), 1)
    })

    const totalMonopolies = computed(() => {
      return propertyDistribution.value.filter(group => group.monopolyOwner).length
    })

    const mostPropertiesPlayer = computed(() => {
      const player = props.gameStats.playerRankings.reduce((max, current) => {
        const currentTotal = current.properties + current.railroads + current.utilities
        const maxTotal = max.properties + max.railroads + max.utilities
        return currentTotal > maxTotal ? current : max
      }, props.gameStats.playerRankings[0])
      
      return {
        name: player.name,
        count: player.properties + player.railroads + player.utilities
      }
    })

    const developmentLeader = computed(() => {
      // This would track house/hotel developments - simplified for now
      const leader = props.gameStats.playerRankings[0]
      return {
        name: leader.name,
        developments: leader.properties * 2 // Simplified metric
      }
    })

    const propertyDistribution = computed(() => {
      const distribution = []
      
      Object.entries(COLOR_GROUPS).forEach(([colorKey, colorData]) => {
        const group = {
          colorGroup: colorKey,
          name: colorData.name,
          color: colorData.color,
          totalProperties: colorData.properties.length,
          ownership: [],
          monopolyOwner: null
        }

        // Calculate ownership for this color group
        const ownershipMap = new Map()
        
        colorData.properties.forEach(propId => {
          const property = props.gameState.properties?.[propId]
          if (property && property.ownerId) {
            const player = props.gameState.players?.find(p => p.id === property.ownerId)
            if (player) {
              const current = ownershipMap.get(property.ownerId) || { 
                playerId: property.ownerId, 
                playerName: player.name, 
                playerColor: player.color,
                count: 0 
              }
              current.count++
              ownershipMap.set(property.ownerId, current)
            }
          }
        })

        group.ownership = Array.from(ownershipMap.values())
        
        // Check for monopoly
        const monopolyOwner = group.ownership.find(owner => owner.count === group.totalProperties)
        if (monopolyOwner) {
          group.monopolyOwner = monopolyOwner.playerName
        }

        distribution.push(group)
      })

      return distribution
    })

    const wealthInequality = computed(() => {
      const netWorths = props.gameStats.playerRankings.map(p => p.netWorth)
      const max = Math.max(...netWorths)
      const min = Math.min(...netWorths)
      
      if (max === 0) return 0
      return Math.round(((max - min) / max) * 100)
    })

    const bankBalance = computed(() => {
      return props.gameState.bank?.money || 0
    })

    const economicActivity = computed(() => {
      // Simplified metric based on property distribution
      const totalProperties = 28 // Total properties in standard Monopoly
      const ownedProperties = props.gameStats.propertiesDistributed
      return (ownedProperties / totalProperties) * 100
    })

    const gameHighlights = computed(() => {
      const highlights = []
      
      // Biggest spender
      const spenderCandidate = props.gameStats.playerRankings.reduce((max, current) => {
        const currentAssets = current.properties + current.railroads + current.utilities
        const maxAssets = max.properties + max.railroads + max.utilities
        return currentAssets > maxAssets ? current : max
      })
      
      highlights.push({
        id: 'biggest-spender',
        icon: '💸',
        title: 'Biggest Spender',
        description: 'Most properties purchased',
        player: spenderCandidate.name,
        value: `${spenderCandidate.properties + spenderCandidate.railroads + spenderCandidate.utilities} assets`
      })

      // Cash hoarder
      const cashKing = props.gameStats.playerRankings.reduce((max, current) => {
        const currentCash = getPlayerCash(current.playerId)
        const maxCash = getPlayerCash(max.playerId)
        return currentCash > maxCash ? current : max
      })
      
      highlights.push({
        id: 'cash-king',
        icon: '💰',
        title: 'Cash King',
        description: 'Highest cash reserves',
        player: cashKing.name,
        value: `$${getPlayerCash(cashKing.playerId).toLocaleString()}`
      })

      // Longest survival
      if (props.gameStats.bankruptPlayers > 0) {
        highlights.push({
          id: 'survivor',
          icon: '🛡️',
          title: 'Ultimate Survivor',
          description: 'Lasted longest in game',
          player: props.winnerData.player?.name || 'Winner',
          value: `${formatDuration(props.gameStats.duration)}`
        })
      }

      // Property diversification
      const diversified = props.gameStats.playerRankings.find(p => 
        p.properties > 0 && p.railroads > 0 && p.utilities > 0
      )
      
      if (diversified) {
        highlights.push({
          id: 'diversified',
          icon: '🎯',
          title: 'Diversified Portfolio',
          description: 'Owned all asset types',
          player: diversified.name,
          value: 'Mixed assets'
        })
      }

      return highlights
    })

    // Methods
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    const getPlayerPiece = (playerId) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      return player?.piece || 'car'
    }

    const getPlayerCash = (playerId) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      return player?.money || 0
    }

    const getPlayerColor = (playerId) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      return player?.color || '#666666'
    }

    const getTotalAssets = (player) => {
      return (player.properties?.length || 0) + 
             (player.railroads?.length || 0) + 
             (player.utilities?.length || 0)
    }

    const calculateAdvantageMargin = () => {
      if (props.gameStats.playerRankings.length < 2) return 'N/A'
      
      const winner = props.gameStats.playerRankings[0]
      const runnerUp = props.gameStats.playerRankings[1]
      
      if (winner.netWorth === 0) return 'N/A'
      
      const advantage = ((winner.netWorth - runnerUp.netWorth) / winner.netWorth) * 100
      return `${Math.round(advantage)}%`
    }

    const formatDuration = (minutes) => {
      if (minutes < 60) {
        return `${minutes} minutes`
      } else {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
      }
    }

    const isPropertyMogul = (player) => {
      return (player.properties + player.railroads + player.utilities) >= 8
    }

    const isCashKing = (player) => {
      const playerCash = getPlayerCash(player.playerId)
      const maxCash = Math.max(...props.gameStats.playerRankings.map(p => getPlayerCash(p.playerId)))
      return playerCash === maxCash && playerCash > 1000
    }

    const isMonopolist = (player) => {
      return totalMonopolies.value > 0 && 
             propertyDistribution.value.some(group => group.monopolyOwner === player.name)
    }

    // Export functions
    const exportToJSON = () => {
      const data = {
        gameStats: props.gameStats,
        winnerData: props.winnerData,
        endReason: props.endReason,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monopoly-game-summary-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    const exportToCSV = () => {
      const headers = ['Rank', 'Player', 'Status', 'Net Worth', 'Cash', 'Properties', 'Railroads', 'Utilities']
      const rows = props.gameStats.playerRankings.map(player => [
        player.rank,
        player.name,
        player.status,
        player.netWorth,
        getPlayerCash(player.playerId),
        player.properties,
        player.railroads,
        player.utilities
      ])
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monopoly-rankings-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }

    const shareResults = () => {
      if (navigator.share) {
        navigator.share({
          title: 'Monopoly Game Results',
          text: `${props.winnerData.player?.name || 'Someone'} won our Monopoly game! Final net worth: $${props.winnerData.netWorth.toLocaleString()}`,
          url: window.location.href
        })
      } else {
        // Fallback to clipboard
        const shareText = `🎉 ${props.winnerData.player?.name || 'Someone'} won our Monopoly game!\n💰 Final net worth: $${props.winnerData.netWorth.toLocaleString()}\n⏱️ Game duration: ${formatDuration(props.gameStats.duration)}\n👥 ${props.gameStats.totalPlayers} players competed`
        navigator.clipboard.writeText(shareText)
        alert('Game results copied to clipboard!')
      }
    }

    const printSummary = () => {
      window.print()
    }

    const startNewGame = () => {
      emit('start-new-game')
    }

    const closeSummary = () => {
      showSummary.value = false
      emit('close-summary')
    }

    return {
      // Reactive state
      showSummary,

      // Computed
      maxNetWorth,
      totalMonopolies,
      mostPropertiesPlayer,
      developmentLeader,
      propertyDistribution,
      wealthInequality,
      bankBalance,
      economicActivity,
      gameHighlights,

      // Methods
      getPlayerPieceSymbol,
      getPlayerPiece,
      getPlayerCash,
      getPlayerColor,
      getTotalAssets,
      calculateAdvantageMargin,
      formatDuration,
      isPropertyMogul,
      isCashKing,
      isMonopolist,
      exportToJSON,
      exportToCSV,
      shareResults,
      printSummary,
      startNewGame,
      closeSummary
    }
  }
}
</script>

<style scoped>
.game-summary-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3100;
  backdrop-filter: blur(8px);
}

.summary-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
}

.summary-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 24px;
  border-radius: 16px 16px 0 0;
  position: relative;
}

.summary-header h2 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: bold;
}

.summary-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.summary-content {
  padding: 32px;
}

.summary-section {
  margin-bottom: 40px;
}

.summary-section h3 {
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 8px;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
  min-width: 50px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Winner Spotlight */
.winner-spotlight {
  background: linear-gradient(135deg, #fff3cd, #fef9e7);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.spotlight-avatar {
  position: relative;
  text-align: center;
}

.player-piece {
  font-size: 3rem;
  font-weight: bold;
}

.winner-crown {
  font-size: 1.5rem;
  position: absolute;
  top: -10px;
  right: -10px;
  animation: crown-float 2s ease-in-out infinite;
}

@keyframes crown-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.spotlight-info {
  flex: 1;
}

.spotlight-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #856404;
  margin-bottom: 8px;
}

.spotlight-reason {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 16px;
}

.spotlight-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.spotlight-stat {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.stat-label {
  color: #6c757d;
  font-weight: bold;
}

.stat-value {
  color: #856404;
  font-weight: bold;
}

/* Performance Table */
.performance-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.table-header {
  background: #f8f9fa;
  display: grid;
  grid-template-columns: 60px 1fr 80px 120px 100px 100px 120px;
  gap: 12px;
  padding: 16px;
  font-weight: bold;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 120px 100px 100px 120px;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f8f9fa;
  align-items: center;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.winner {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.1), rgba(243, 156, 18, 0.1));
  border-color: #f1c40f;
}

.table-row.bankrupt {
  opacity: 0.6;
  background: rgba(231, 76, 60, 0.05);
}

.col-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.rank-medal {
  font-size: 1rem;
}

.col-player {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.player-piece-small {
  font-size: 1rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.bankrupt {
  background: #f8d7da;
  color: #721c24;
}

.networth-value,
.cash-value {
  font-weight: bold;
  color: #27ae60;
}

.assets-breakdown {
  text-align: center;
}

.asset-count {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  display: block;
  margin-bottom: 4px;
}

.asset-details {
  display: flex;
  gap: 4px;
  font-size: 0.8rem;
  justify-content: center;
}

.performance-indicators {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.indicator {
  font-size: 1.2rem;
  cursor: help;
}

/* Property Distribution */
.property-distribution {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.distribution-chart {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 16px;
  text-align: center;
}

.color-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-group {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #dee2e6;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #ccc;
}

.group-name {
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.group-count {
  font-size: 0.9rem;
  color: #6c757d;
}

.group-ownership {
  display: flex;
  height: 12px;
  background: #ecf0f1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.ownership-bar {
  transition: all 0.3s ease;
}

.group-details {
  text-align: center;
  font-size: 0.9rem;
}

.monopoly-indicator {
  color: #f39c12;
  font-weight: bold;
}

.no-monopoly {
  color: #6c757d;
}

.distribution-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  text-align: center;
}

.stat-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Financial Analysis */
.financial-analysis {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.wealth-progression {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.progression-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wealth-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.line-player {
  min-width: 100px;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: bold;
}

.line-bar {
  height: 20px;
  background: var(--player-color, #3498db);
  border-radius: 10px;
  min-width: 20px;
  transition: all 0.3s ease;
}

.line-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: bold;
  min-width: 80px;
}

.financial-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Game Highlights */
.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.highlight-card {
  background: linear-gradient(135deg, #fff, #f8f9fa);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.highlight-icon {
  font-size: 2rem;
  min-width: 40px;
}

.highlight-content {
  flex: 1;
}

.highlight-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.highlight-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.highlight-player {
  font-size: 0.9rem;
  color: #3498db;
  font-weight: bold;
}

.highlight-value {
  font-size: 0.9rem;
  color: #27ae60;
  font-weight: bold;
  text-align: right;
}

/* Export Options */
.export-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.export-icon {
  font-size: 1rem;
}

/* Summary Actions */
.summary-actions {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-game-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.new-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
}

.close-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .summary-modal {
    width: 98%;
    margin: 10px;
  }

  .summary-content {
    padding: 20px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .winner-spotlight {
    flex-direction: column;
    text-align: center;
  }

  .spotlight-stats {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .property-distribution,
  .financial-analysis {
    grid-template-columns: 1fr;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
  }

  .export-options {
    flex-direction: column;
  }

  .summary-actions {
    flex-direction: column;
  }
}

/* Print styles */
@media print {
  .game-summary-overlay {
    position: static;
    background: none;
  }

  .summary-modal {
    box-shadow: none;
    max-width: none;
    max-height: none;
  }

  .close-btn,
  .summary-actions,
  .export-options {
    display: none;
  }
}
</style>