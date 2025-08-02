<template>
  <div class="jail-history-modal" @click="$emit('close')">
    <div class="jail-history-container" @click.stop>
      <div class="history-header">
        <h3>Jail History & Statistics</h3>
        <button class="close-btn" @click="$emit('close')">
          <span>✕</span>
        </button>
      </div>

      <div class="history-content">
        <!-- Overall Statistics -->
        <div class="statistics-section">
          <h4>Overall Jail Statistics</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <div class="stat-value">{{ totalPlayersJailed }}</div>
                <div class="stat-label">Players Jailed</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🔒</div>
              <div class="stat-info">
                <div class="stat-value">{{ totalJailEntries }}</div>
                <div class="stat-label">Total Jail Entries</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <div class="stat-value">${{ totalMoneyPaid }}</div>
                <div class="stat-label">Total Fines Paid</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎫</div>
              <div class="stat-info">
                <div class="stat-value">{{ totalCardsUsed }}</div>
                <div class="stat-label">Jail Cards Used</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Player Statistics -->
        <div class="player-stats-section">
          <h4>Player Jail Statistics</h4>
          <div class="player-stats-table">
            <div class="stats-table-header">
              <div class="header-cell player-col">Player</div>
              <div class="header-cell">Times Jailed</div>
              <div class="header-cell">Turns Served</div>
              <div class="header-cell">Fines Paid</div>
              <div class="header-cell">Cards Used</div>
              <div class="header-cell">Success Rate</div>
            </div>
            
            <div class="stats-table-body">
              <div 
                v-for="playerStat in playerStatistics" 
                :key="playerStat.playerId"
                class="stats-row"
              >
                <div class="stats-cell player-col">
                  <div class="player-info">
                    <span class="player-piece" :style="{ color: playerStat.color }">
                      {{ getPlayerPieceSymbol(playerStat.piece) }}
                    </span>
                    <span class="player-name">{{ playerStat.name }}</span>
                  </div>
                </div>
                <div class="stats-cell">{{ playerStat.timesJailed }}</div>
                <div class="stats-cell">{{ playerStat.turnsServed }}</div>
                <div class="stats-cell">${{ playerStat.finesPaid }}</div>
                <div class="stats-cell">{{ playerStat.cardsUsed }}</div>
                <div class="stats-cell">
                  <span class="success-rate" :class="getSuccessRateClass(playerStat.successRate)">
                    {{ playerStat.successRate }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Jail Event History -->
        <div class="history-section">
          <div class="history-controls">
            <h4>Jail Event History</h4>
            <div class="filter-controls">
              <select v-model="selectedPlayer" class="filter-select">
                <option value="">All Players</option>
                <option v-for="player in players" :key="player.id" :value="player.id">
                  {{ player.name }}
                </option>
              </select>
              
              <select v-model="selectedEventType" class="filter-select">
                <option value="">All Events</option>
                <option value="jail-entry">Jail Entries</option>
                <option value="jail-exit">Jail Exits</option>
                <option value="jail-attempt">Exit Attempts</option>
              </select>
            </div>
          </div>

          <div class="history-timeline">
            <div 
              v-for="event in filteredJailEvents" 
              :key="event.id"
              class="timeline-event"
              :class="event.type"
            >
              <div class="event-icon">
                {{ getEventIcon(event.type, event.method) }}
              </div>
              
              <div class="event-content">
                <div class="event-header">
                  <span class="event-player" :style="{ color: event.playerColor }">
                    {{ getPlayerPieceSymbol(event.playerPiece) }} {{ event.playerName }}
                  </span>
                  <span class="event-time">{{ formatEventTime(event.timestamp) }}</span>
                </div>
                
                <div class="event-description">
                  {{ getEventDescription(event) }}
                </div>
                
                <div class="event-details" v-if="event.details">
                  <span v-for="detail in event.details" :key="detail" class="detail-item">
                    {{ detail }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="filteredJailEvents.length === 0" class="no-events">
              <div class="no-events-icon">📝</div>
              <div class="no-events-text">No jail events found for the selected filters.</div>
            </div>
          </div>
        </div>

        <!-- Jail Records -->
        <div class="records-section">
          <h4>Jail Records</h4>
          <div class="records-grid">
            <div class="record-item">
              <div class="record-icon">🏆</div>
              <div class="record-info">
                <div class="record-title">Most Time in Jail</div>
                <div class="record-value">{{ mostJailedPlayer?.name || 'None' }}</div>
                <div class="record-detail">{{ mostJailedPlayer?.times || 0 }} times</div>
              </div>
            </div>
            
            <div class="record-item">
              <div class="record-icon">💸</div>
              <div class="record-info">
                <div class="record-title">Highest Fines Paid</div>
                <div class="record-value">{{ highestFinesPlayer?.name || 'None' }}</div>
                <div class="record-detail">${{ highestFinesPlayer?.amount || 0 }}</div>
              </div>
            </div>
            
            <div class="record-item">
              <div class="record-icon">🎲</div>
              <div class="record-info">
                <div class="record-title">Best Escape Rate</div>
                <div class="record-value">{{ bestEscapePlayer?.name || 'None' }}</div>
                <div class="record-detail">{{ bestEscapePlayer?.rate || 0 }}% success</div>
              </div>
            </div>
            
            <div class="record-item">
              <div class="record-icon">🎫</div>
              <div class="record-info">
                <div class="record-title">Most Cards Used</div>
                <div class="record-value">{{ mostCardsPlayer?.name || 'None' }}</div>
                <div class="record-detail">{{ mostCardsPlayer?.cards || 0 }} cards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'JailHistory',
  
  props: {
    gameHistory: {
      type: Array,
      default: () => []
    },
    players: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close'],

  setup(props) {
    const selectedPlayer = ref('')
    const selectedEventType = ref('')

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

    // Extract jail events from game history
    const jailEvents = computed(() => {
      const events = []
      let eventId = 1

      props.gameHistory.forEach(entry => {
        if (entry.message && typeof entry.message === 'string') {
          const message = entry.message.toLowerCase()
          const player = props.players.find(p => entry.message.includes(p.name))
          
          if (!player) return

          // Jail entry events
          if (message.includes('goes to jail') || message.includes('sent to jail')) {
            let reason = 'unknown'
            let method = 'general'
            
            if (message.includes('three consecutive doubles')) {
              reason = 'Three consecutive doubles'
              method = 'doubles'
            } else if (message.includes('go to jail space')) {
              reason = 'Landed on Go to Jail space'
              method = 'space'
            } else if (message.includes('card')) {
              reason = 'Drew Go to Jail card'
              method = 'card'
            }

            events.push({
              id: eventId++,
              type: 'jail-entry',
              method,
              playerId: player.id,
              playerName: player.name,
              playerColor: player.color,
              playerPiece: player.piece,
              timestamp: entry.timestamp,
              reason,
              details: [reason]
            })
          }
          
          // Jail exit events
          if (message.includes('out of jail') || message.includes('released from jail')) {
            let method = 'unknown'
            let cost = 0
            
            if (message.includes('pays $50') || message.includes('fine')) {
              method = 'fine'
              cost = 50
            } else if (message.includes('jail card') || message.includes('get out of jail free')) {
              method = 'card'
            } else if (message.includes('doubles')) {
              method = 'doubles'
            }

            events.push({
              id: eventId++,
              type: 'jail-exit',
              method,
              playerId: player.id,
              playerName: player.name,
              playerColor: player.color,
              playerPiece: player.piece,
              timestamp: entry.timestamp,
              cost,
              details: cost > 0 ? [`Paid $${cost}`] : ['Free exit']
            })
          }
        }
      })

      return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    // Filtered jail events
    const filteredJailEvents = computed(() => {
      let filtered = jailEvents.value

      if (selectedPlayer.value) {
        filtered = filtered.filter(event => event.playerId === selectedPlayer.value)
      }

      if (selectedEventType.value) {
        filtered = filtered.filter(event => event.type === selectedEventType.value)
      }

      return filtered
    })

    // Player statistics
    const playerStatistics = computed(() => {
      return props.players.map(player => {
        const playerEvents = jailEvents.value.filter(event => event.playerId === player.id)
        const entries = playerEvents.filter(event => event.type === 'jail-entry')
        const exits = playerEvents.filter(event => event.type === 'jail-exit')
        
        const finesPaid = exits
          .filter(event => event.method === 'fine')
          .reduce((total, event) => total + (event.cost || 0), 0)
        
        const cardsUsed = exits.filter(event => event.method === 'card').length
        const doublesSuccess = exits.filter(event => event.method === 'doubles').length
        
        const successRate = entries.length > 0 ? 
          Math.round(((exits.length / entries.length) * 100)) : 0

        return {
          playerId: player.id,
          name: player.name,
          color: player.color,
          piece: player.piece,
          timesJailed: entries.length,
          turnsServed: entries.length * 2, // Estimate
          finesPaid,
          cardsUsed,
          doublesSuccess,
          successRate
        }
      })
    })

    // Overall statistics
    const totalPlayersJailed = computed(() => {
      return playerStatistics.value.filter(stat => stat.timesJailed > 0).length
    })

    const totalJailEntries = computed(() => {
      return playerStatistics.value.reduce((total, stat) => total + stat.timesJailed, 0)
    })

    const totalMoneyPaid = computed(() => {
      return playerStatistics.value.reduce((total, stat) => total + stat.finesPaid, 0)
    })

    const totalCardsUsed = computed(() => {
      return playerStatistics.value.reduce((total, stat) => total + stat.cardsUsed, 0)
    })

    // Records
    const mostJailedPlayer = computed(() => {
      const player = playerStatistics.value.reduce((max, current) => 
        current.timesJailed > (max?.timesJailed || 0) ? current : max, null)
      return player ? { name: player.name, times: player.timesJailed } : null
    })

    const highestFinesPlayer = computed(() => {
      const player = playerStatistics.value.reduce((max, current) => 
        current.finesPaid > (max?.finesPaid || 0) ? current : max, null)
      return player ? { name: player.name, amount: player.finesPaid } : null
    })

    const bestEscapePlayer = computed(() => {
      const player = playerStatistics.value
        .filter(stat => stat.timesJailed > 0)
        .reduce((max, current) => 
          current.successRate > (max?.successRate || 0) ? current : max, null)
      return player ? { name: player.name, rate: player.successRate } : null
    })

    const mostCardsPlayer = computed(() => {
      const player = playerStatistics.value.reduce((max, current) => 
        current.cardsUsed > (max?.cardsUsed || 0) ? current : max, null)
      return player ? { name: player.name, cards: player.cardsUsed } : null
    })

    // Methods
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    const getEventIcon = (type, method) => {
      if (type === 'jail-entry') {
        switch (method) {
          case 'doubles': return '🎲'
          case 'space': return '🏃'
          case 'card': return '🎫'
          default: return '🔒'
        }
      } else if (type === 'jail-exit') {
        switch (method) {
          case 'fine': return '💸'
          case 'card': return '🎫'
          case 'doubles': return '🎲'
          default: return '🔓'
        }
      }
      return '📋'
    }

    const getEventDescription = (event) => {
      if (event.type === 'jail-entry') {
        return `Sent to jail: ${event.reason}`
      } else if (event.type === 'jail-exit') {
        switch (event.method) {
          case 'fine':
            return `Released by paying $${event.cost} fine`
          case 'card':
            return 'Released using Get Out of Jail Free card'
          case 'doubles':
            return 'Released by rolling doubles'
          default:
            return 'Released from jail'
        }
      }
      return event.reason || 'Jail event'
    }

    const formatEventTime = (timestamp) => {
      if (!timestamp) return 'Unknown time'
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getSuccessRateClass = (rate) => {
      if (rate >= 80) return 'excellent'
      if (rate >= 60) return 'good'
      if (rate >= 40) return 'average'
      return 'poor'
    }

    return {
      selectedPlayer,
      selectedEventType,
      jailEvents,
      filteredJailEvents,
      playerStatistics,
      totalPlayersJailed,
      totalJailEntries,
      totalMoneyPaid,
      totalCardsUsed,
      mostJailedPlayer,
      highestFinesPlayer,
      bestEscapePlayer,
      mostCardsPlayer,
      getPlayerPieceSymbol,
      getEventIcon,
      getEventDescription,
      formatEventTime,
      getSuccessRateClass
    }
  }
}
</script>

<style scoped>
.jail-history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.jail-history-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.history-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.statistics-section,
.player-stats-section,
.history-section,
.records-section {
  margin-bottom: 2rem;
}

.statistics-section h4,
.player-stats-section h4,
.history-section h4,
.records-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-icon {
  font-size: 2rem;
  min-width: 3rem;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Player Statistics Table */
.player-stats-table {
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.stats-table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  background: #e9ecef;
  font-weight: 600;
  color: #2c3e50;
}

.header-cell {
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid #dee2e6;
}

.header-cell.player-col {
  text-align: left;
}

.stats-table-body {
  background: white;
}

.stats-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e9ecef;
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-cell {
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid #e9ecef;
}

.stats-cell.player-col {
  text-align: left;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-piece {
  font-size: 1rem;
  font-weight: bold;
}

.player-name {
  font-weight: 500;
}

.success-rate.excellent { color: #28a745; }
.success-rate.good { color: #17a2b8; }
.success-rate.average { color: #ffc107; }
.success-rate.poor { color: #dc3545; }

/* History Controls */
.history-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

/* Timeline */
.history-timeline {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.timeline-event {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.timeline-event.jail-entry {
  border-left: 4px solid #e74c3c;
}

.timeline-event.jail-exit {
  border-left: 4px solid #28a745;
}

.event-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.event-content {
  flex: 1;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.event-player {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.event-description {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.event-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 0.75rem;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  color: #6c757d;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-events-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Records Grid */
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 6px;
  border: 1px solid #ffd60a;
}

.record-icon {
  font-size: 2rem;
  min-width: 3rem;
  text-align: center;
}

.record-title {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.record-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.record-detail {
  font-size: 0.875rem;
  color: #856404;
}

/* Responsive Design */
@media (max-width: 768px) {
  .jail-history-modal {
    padding: 0.5rem;
  }
  
  .history-header {
    padding: 1rem;
  }
  
  .history-content {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-table-header,
  .stats-row {
    grid-template-columns: 1fr;
    text-align: left;
  }
  
  .header-cell,
  .stats-cell {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 0.5rem;
  }
  
  .history-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .timeline-event {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .records-grid {
    grid-template-columns: 1fr;
  }
}
</style>