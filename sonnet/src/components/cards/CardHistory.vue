<template>
  <div class="card-history-panel">
    <!-- Header with toggle controls -->
    <div class="history-header">
      <h3 class="history-title">
        <span class="title-icon">📜</span>
        Card History
      </h3>
      
      <div class="history-controls">
        <div class="view-toggle">
          <button 
            class="toggle-btn"
            :class="{ active: currentView === 'recent' }"
            @click="setView('recent')"
          >
            Recent
          </button>
          <button 
            class="toggle-btn"
            :class="{ active: currentView === 'stats' }"
            @click="setView('stats')"
          >
            Statistics
          </button>
        </div>
        
        <button 
          class="collapse-btn"
          @click="toggleCollapsed"
          :class="{ collapsed: isCollapsed }"
        >
          {{ isCollapsed ? '▲' : '▼' }}
        </button>
      </div>
    </div>
    
    <!-- Main content area -->
    <div class="history-content" v-if="!isCollapsed">
      <!-- Recent Cards View -->
      <div class="recent-cards-view" v-if="currentView === 'recent'">
        <div class="recent-header">
          <div class="filter-controls">
            <select v-model="playerFilter" class="player-filter">
              <option value="">All Players</option>
              <option 
                v-for="player in availablePlayers"
                :key="player.id"
                :value="player.id"
              >
                {{ player.name }}
              </option>
            </select>
            
            <select v-model="deckFilter" class="deck-filter">
              <option value="">All Decks</option>
              <option value="chance">Chance</option>
              <option value="communityChest">Community Chest</option>
            </select>
          </div>
          
          <div class="results-info">
            Showing {{ filteredHistory.length }} of {{ cardHistory.length }} cards
          </div>
        </div>
        
        <div class="history-list">
          <div 
            class="history-item"
            v-for="(entry, index) in filteredHistory"
            :key="`history-${index}`"
            :class="getHistoryItemClass(entry)"
          >
            <div class="item-header">
              <div class="deck-badge" :class="getDeckClass(entry.deckType)">
                {{ getDeckIcon(entry.deckType) }}
              </div>
              <div class="player-info">
                <span class="player-name">{{ getPlayerName(entry.playerId) }}</span>
                <span class="timestamp">{{ formatTime(entry.timestamp) }}</span>
              </div>
            </div>
            
            <div class="card-info">
              <div class="card-title">{{ entry.card.title }}</div>
              <div class="card-effect">{{ getEffectSummary(entry.card) }}</div>
            </div>
            
            <div class="execution-result" v-if="entry.result">
              <div class="result-badge" :class="entry.result.success ? 'success' : 'failure'">
                {{ entry.result.success ? '✅' : '❌' }}
              </div>
            </div>
          </div>
          
          <div class="empty-history" v-if="filteredHistory.length === 0">
            <div class="empty-icon">🎴</div>
            <div class="empty-message">
              {{ cardHistory.length === 0 ? 'No cards drawn yet' : 'No cards match current filters' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics View -->
      <div class="statistics-view" v-if="currentView === 'stats'">
        <!-- Overall Statistics -->
        <div class="stats-section">
          <h4 class="stats-title">Overall Statistics</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalCardsDrawn }}</div>
              <div class="stat-label">Total Cards Drawn</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ chanceCardsDrawn }}</div>
              <div class="stat-label">Chance Cards</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ communityCardsDrawn }}</div>
              <div class="stat-label">Community Chest</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ jailCardsDrawn }}</div>
              <div class="stat-label">Jail Cards</div>
            </div>
          </div>
        </div>
        
        <!-- Card Type Distribution -->
        <div class="stats-section">
          <h4 class="stats-title">Card Type Distribution</h4>
          <div class="type-stats">
            <div 
              class="type-bar"
              v-for="(count, type) in cardTypeStats"
              :key="type"
            >
              <div class="type-label">{{ formatTypeName(type) }}</div>
              <div class="type-progress">
                <div 
                  class="type-fill"
                  :style="{ width: `${(count / Math.max(totalCardsDrawn, 1)) * 100}%` }"
                  :class="getTypeClass(type)"
                ></div>
              </div>
              <div class="type-count">{{ count }}</div>
            </div>
          </div>
        </div>
        
        <!-- Player Statistics -->
        <div class="stats-section">
          <h4 class="stats-title">Player Statistics</h4>
          <div class="player-stats">
            <div 
              class="player-stat"
              v-for="(stats, playerId) in playerStats"
              :key="playerId"
            >
              <div class="player-header">
                <span class="player-name">{{ getPlayerName(playerId) }}</span>
                <span class="player-total">{{ stats.total }} cards</span>
              </div>
              <div class="player-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Chance:</span>
                  <span class="breakdown-value">{{ stats.chance }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Community:</span>
                  <span class="breakdown-value">{{ stats.communityChest }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Jail Cards:</span>
                  <span class="breakdown-value">{{ stats.jailCards }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Most Common Cards -->
        <div class="stats-section">
          <h4 class="stats-title">Most Common Cards</h4>
          <div class="common-cards">
            <div 
              class="common-card"
              v-for="(card, index) in mostCommonCards"
              :key="`common-${index}`"
            >
              <div class="card-rank">{{ index + 1 }}</div>
              <div class="card-details">
                <div class="card-name">{{ card.title }}</div>
                <div class="card-meta">
                  <span class="deck-type">{{ card.deckType }}</span>
                  <span class="draw-count">{{ card.count }} times</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick stats (always visible) -->
    <div class="quick-stats" v-if="isCollapsed">
      <span class="quick-stat">{{ totalCardsDrawn }} total</span>
      <span class="quick-stat">{{ chanceCardsDrawn }}C</span>
      <span class="quick-stat">{{ communityCardsDrawn }}CC</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CardHistory',
  
  props: {
    cardHistory: {
      type: Array,
      default: () => []
    },
    availablePlayers: {
      type: Array,
      default: () => []
    },
    showQuickStats: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props) {
    // Reactive state
    const currentView = ref('recent')
    const isCollapsed = ref(false)
    const playerFilter = ref('')
    const deckFilter = ref('')
    
    // Computed properties for filtering
    const filteredHistory = computed(() => {
      let filtered = [...props.cardHistory].reverse() // Most recent first
      
      if (playerFilter.value) {
        filtered = filtered.filter(entry => entry.playerId === playerFilter.value)
      }
      
      if (deckFilter.value) {
        filtered = filtered.filter(entry => entry.deckType === deckFilter.value)
      }
      
      return filtered.slice(0, 50) // Limit to last 50 entries
    })
    
    // Overall statistics
    const totalCardsDrawn = computed(() => props.cardHistory.length)
    
    const chanceCardsDrawn = computed(() => 
      props.cardHistory.filter(entry => entry.deckType === 'chance').length
    )
    
    const communityCardsDrawn = computed(() => 
      props.cardHistory.filter(entry => entry.deckType === 'communityChest').length
    )
    
    const jailCardsDrawn = computed(() => 
      props.cardHistory.filter(entry => entry.card.isGetOutOfJail).length
    )
    
    // Card type statistics
    const cardTypeStats = computed(() => {
      const stats = {}
      props.cardHistory.forEach(entry => {
        const type = entry.card.type || 'unknown'
        stats[type] = (stats[type] || 0) + 1
      })
      return stats
    })
    
    // Player statistics
    const playerStats = computed(() => {
      const stats = {}
      props.cardHistory.forEach(entry => {
        const playerId = entry.playerId
        if (!stats[playerId]) {
          stats[playerId] = {
            total: 0,
            chance: 0,
            communityChest: 0,
            jailCards: 0
          }
        }
        
        stats[playerId].total++
        if (entry.deckType === 'chance') stats[playerId].chance++
        if (entry.deckType === 'communityChest') stats[playerId].communityChest++
        if (entry.card.isGetOutOfJail) stats[playerId].jailCards++
      })
      return stats
    })
    
    // Most common cards
    const mostCommonCards = computed(() => {
      const cardCounts = {}
      props.cardHistory.forEach(entry => {
        const cardKey = `${entry.card.id}-${entry.deckType}`
        if (!cardCounts[cardKey]) {
          cardCounts[cardKey] = {
            title: entry.card.title,
            deckType: entry.deckType === 'chance' ? 'Chance' : 'Community Chest',
            count: 0
          }
        }
        cardCounts[cardKey].count++
      })
      
      return Object.values(cardCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    })
    
    // Methods
    const setView = (view) => {
      currentView.value = view
    }
    
    const toggleCollapsed = () => {
      isCollapsed.value = !isCollapsed.value
    }
    
    const getPlayerName = (playerId) => {
      const player = props.availablePlayers.find(p => p.id === playerId)
      return player ? player.name : 'Unknown Player'
    }
    
    const getDeckIcon = (deckType) => {
      return deckType === 'chance' ? '🎲' : '🏛️'
    }
    
    const getDeckClass = (deckType) => {
      return deckType === 'chance' ? 'deck-chance' : 'deck-community'
    }
    
    const getHistoryItemClass = (entry) => {
      const classes = ['history-item']
      if (entry.card.isGetOutOfJail) classes.push('jail-card')
      if (entry.result && !entry.result.success) classes.push('failed-execution')
      return classes.join(' ')
    }
    
    const getEffectSummary = (card) => {
      switch (card.type) {
        case 'money':
          if (card.action === 'receiveMoney') return `+$${card.effectValue}`
          if (card.action === 'payMoney') return `-$${card.effectValue}`
          if (card.action === 'receiveFromEachPlayer') return `Collect $${card.effectValue} from each player`
          if (card.action === 'payEachPlayer') return `Pay $${card.effectValue} to each player`
          break
        case 'move':
          if (card.action === 'moveToSpace') return 'Move to specific location'
          if (card.action === 'moveRelative') return `Move ${Math.abs(card.effectValue)} spaces`
          if (card.action.includes('Nearest')) return 'Move to nearest property'
          break
        case 'property':
          return 'Pay property fees'
        case 'special':
          if (card.isGetOutOfJail) return 'Get Out of Jail Free'
          if (card.action === 'goToJail') return 'Go to Jail'
          break
        default:
          return card.description || 'Unknown effect'
      }
      return card.description || 'Unknown effect'
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
      return date.toLocaleDateString()
    }
    
    const formatTypeName = (type) => {
      const names = {
        money: 'Money',
        move: 'Movement',
        property: 'Property',
        special: 'Special'
      }
      return names[type] || type.charAt(0).toUpperCase() + type.slice(1)
    }
    
    const getTypeClass = (type) => {
      return `type-${type}`
    }
    
    return {
      // State
      currentView,
      isCollapsed,
      playerFilter,
      deckFilter,
      
      // Computed
      filteredHistory,
      totalCardsDrawn,
      chanceCardsDrawn,
      communityCardsDrawn,
      jailCardsDrawn,
      cardTypeStats,
      playerStats,
      mostCommonCards,
      
      // Methods
      setView,
      toggleCollapsed,
      getPlayerName,
      getDeckIcon,
      getDeckClass,
      getHistoryItemClass,
      getEffectSummary,
      formatTime,
      formatTypeName,
      getTypeClass
    }
  }
}
</script>

<style scoped>
.card-history-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #dee2e6;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  font-size: 20px;
}

.history-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #007bff;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: #f8f9fa;
  color: #495057;
}

.collapse-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(0,0,0,0.05);
}

.collapse-btn.collapsed {
  transform: rotate(180deg);
}

.history-content {
  max-height: 500px;
  overflow-y: auto;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.filter-controls {
  display: flex;
  gap: 8px;
}

.player-filter, .deck-filter {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.results-info {
  font-size: 14px;
  color: #6c757d;
}

.history-list {
  padding: 12px 20px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-left: 4px solid #dee2e6;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.history-item.jail-card {
  border-left-color: #28a745;
  background: #f8fff9;
}

.history-item.failed-execution {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.deck-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  font-weight: bold;
}

.deck-badge.deck-chance {
  background: #ff6b6b;
}

.deck-badge.deck-community {
  background: #4ecdc4;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.timestamp {
  font-size: 12px;
  color: #6c757d;
}

.card-info {
  flex-grow: 1;
  min-width: 0;
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  font-size: 14px;
}

.card-effect {
  font-size: 12px;
  color: #6c757d;
}

.execution-result {
  margin-left: auto;
}

.result-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.result-badge.success {
  background: #d4edda;
}

.result-badge.failure {
  background: #f8d7da;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-message {
  font-size: 16px;
}

.statistics-view {
  padding: 20px;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.type-label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.type-progress {
  flex-grow: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.type-fill.type-money {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.type-fill.type-move {
  background: linear-gradient(90deg, #007bff, #17a2b8);
}

.type-fill.type-property {
  background: linear-gradient(90deg, #fd7e14, #e83e8c);
}

.type-fill.type-special {
  background: linear-gradient(90deg, #6f42c1, #e83e8c);
}

.type-count {
  min-width: 30px;
  text-align: right;
  font-weight: 600;
  color: #495057;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-stat {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.player-name {
  font-weight: 600;
  color: #2c3e50;
}

.player-total {
  font-size: 14px;
  color: #6c757d;
}

.player-breakdown {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.breakdown-item {
  display: flex;
  gap: 4px;
  font-size: 14px;
}

.breakdown-label {
  color: #6c757d;
}

.breakdown-value {
  font-weight: 600;
  color: #495057;
}

.common-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.common-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.card-rank {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.card-details {
  flex-grow: 1;
}

.card-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.card-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.deck-type {
  padding: 2px 6px;
  background: #e9ecef;
  border-radius: 4px;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.quick-stat {
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .history-controls {
    justify-content: space-between;
  }
  
  .recent-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .item-header {
    min-width: auto;
  }
  
  .execution-result {
    margin-left: 0;
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .player-breakdown {
    flex-direction: column;
    gap: 8px;
  }
  
  .type-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .type-label {
    min-width: auto;
  }
}
</style>