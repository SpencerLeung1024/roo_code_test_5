<template>
  <div class="rent-history-overlay" v-if="showHistory">
    <div class="rent-history-modal">
      <div class="history-header">
        <h3>📊 Rent Transaction History</h3>
        <button @click="closeHistory" class="close-btn">✕</button>
      </div>

      <div class="history-content">
        <!-- Summary Statistics -->
        <div class="history-summary">
          <div class="summary-cards">
            <div class="summary-card total">
              <div class="card-icon">💰</div>
              <div class="card-content">
                <div class="card-value">${{ totalRentTransacted }}</div>
                <div class="card-label">Total Rent Transacted</div>
              </div>
            </div>
            
            <div class="summary-card collected">
              <div class="card-icon">📈</div>
              <div class="card-content">
                <div class="card-value">${{ totalRentCollected }}</div>
                <div class="card-label">Total Rent Collected</div>
              </div>
            </div>
            
            <div class="summary-card paid">
              <div class="card-icon">📉</div>
              <div class="card-content">
                <div class="card-value">${{ totalRentPaid }}</div>
                <div class="card-label">Total Rent Paid</div>
              </div>
            </div>
            
            <div class="summary-card transactions">
              <div class="card-icon">🔄</div>
              <div class="card-content">
                <div class="card-value">{{ totalTransactions }}</div>
                <div class="card-label">Total Transactions</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Controls -->
        <div class="history-controls">
          <div class="control-group">
            <label>Filter by Player:</label>
            <select v-model="selectedPlayer" @change="applyFilters">
              <option value="">All Players</option>
              <option v-for="player in allPlayers" :key="player.id" :value="player.id">
                {{ player.name }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>Property Type:</label>
            <select v-model="selectedPropertyType" @change="applyFilters">
              <option value="">All Types</option>
              <option value="property">Properties</option>
              <option value="railroad">Railroads</option>
              <option value="utility">Utilities</option>
            </select>
          </div>

          <div class="control-group">
            <label>Transaction Type:</label>
            <select v-model="selectedTransactionType" @change="applyFilters">
              <option value="">All Transactions</option>
              <option value="paid">Rent Paid</option>
              <option value="bankruptcy">Bankruptcy</option>
              <option value="liquidation">With Asset Sale</option>
            </select>
          </div>

          <div class="control-group">
            <label>View Mode:</label>
            <div class="view-toggle">
              <button 
                @click="viewMode = 'list'"
                :class="{ active: viewMode === 'list' }"
                class="toggle-btn"
              >
                📋 List
              </button>
              <button 
                @click="viewMode = 'stats'"
                :class="{ active: viewMode === 'stats' }"
                class="toggle-btn"
              >
                📊 Stats
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction List View -->
        <div v-if="viewMode === 'list'" class="transactions-list">
          <div class="list-header">
            <h4>📋 Transaction History</h4>
            <div class="list-info">
              Showing {{ filteredTransactions.length }} of {{ allTransactions.length }} transactions
            </div>
          </div>

          <div class="transactions-container">
            <div 
              v-for="transaction in paginatedTransactions" 
              :key="transaction.id"
              class="transaction-item"
              :class="{ 
                'rent-paid': transaction.outcome === 'paid',
                'bankruptcy': transaction.outcome === 'bankruptcy',
                'liquidation': transaction.outcome === 'liquidation'
              }"
            >
              <div class="transaction-header">
                <div class="transaction-type">
                  <span class="type-icon">{{ getTransactionIcon(transaction) }}</span>
                  <span class="type-text">{{ getTransactionType(transaction) }}</span>
                </div>
                <div class="transaction-time">
                  {{ formatTime(transaction.timestamp) }}
                </div>
              </div>

              <div class="transaction-details">
                <div class="transaction-players">
                  <div class="player payer">
                    <span class="player-label">Payer:</span>
                    <span class="player-name">{{ transaction.payerName }}</span>
                  </div>
                  <div class="payment-arrow">→</div>
                  <div class="player receiver">
                    <span class="player-label">Receiver:</span>
                    <span class="player-name">{{ transaction.receiverName }}</span>
                  </div>
                </div>

                <div class="transaction-property">
                  <div class="property-info">
                    <span class="property-icon">{{ getPropertyIcon(transaction.propertyType) }}</span>
                    <span class="property-name">{{ transaction.propertyName }}</span>
                    <span class="property-type">{{ transaction.propertyType }}</span>
                  </div>
                  <div class="rent-details">
                    <span class="rent-type">{{ transaction.rentType }}</span>
                    <span class="rent-description">{{ transaction.details?.rentDescription }}</span>
                  </div>
                </div>

                <div class="transaction-amount">
                  <span class="amount-label">Amount:</span>
                  <span class="amount-value" :class="getAmountClass(transaction)">
                    ${{ transaction.amount }}
                  </span>
                </div>

                <!-- Development Info -->
                <div v-if="transaction.details?.development" class="development-info">
                  <span v-if="transaction.details.development.hasHotel" class="dev-tag hotel">
                    🏨 Hotel
                  </span>
                  <span v-else-if="transaction.details.development.houses > 0" class="dev-tag houses">
                    🏠 {{ transaction.details.development.houses }} House{{ transaction.details.development.houses > 1 ? 's' : '' }}
                  </span>
                  <span v-else-if="transaction.details.development.isMonopoly" class="dev-tag monopoly">
                    👑 Monopoly
                  </span>
                </div>

                <!-- Special Outcomes -->
                <div v-if="transaction.outcome !== 'paid'" class="outcome-info">
                  <span class="outcome-badge" :class="transaction.outcome">
                    {{ getOutcomeText(transaction.outcome) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- No Transactions Message -->
            <div v-if="filteredTransactions.length === 0" class="no-transactions">
              <div class="no-transactions-icon">📝</div>
              <div class="no-transactions-text">No rent transactions found</div>
              <div class="no-transactions-subtext">
                {{ selectedPlayer || selectedPropertyType ? 'Try adjusting your filters' : 'Start playing to see rent history' }}
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="currentPage--"
              :disabled="currentPage <= 1"
              class="page-btn"
            >
              ‹ Previous
            </button>
            
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="page-btn"
            >
              Next ›
            </button>
          </div>
        </div>

        <!-- Statistics View -->
        <div v-if="viewMode === 'stats'" class="statistics-view">
          <div class="stats-header">
            <h4>📊 Rent Statistics</h4>
          </div>

          <!-- Player Statistics -->
          <div class="player-stats">
            <h5>👥 Player Statistics</h5>
            <div class="player-stats-grid">
              <div 
                v-for="player in playerStats" 
                :key="player.id"
                class="player-stat-card"
              >
                <div class="player-stat-header">
                  <span class="player-name">{{ player.name }}</span>
                  <div class="player-color" :style="{ backgroundColor: player.color }"></div>
                </div>
                <div class="player-stat-details">
                  <div class="stat-row">
                    <span class="stat-label">Rent Collected:</span>
                    <span class="stat-value positive">${{ player.rentCollected }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Rent Paid:</span>
                    <span class="stat-value negative">${{ player.rentPaid }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Net Income:</span>
                    <span class="stat-value" :class="{ positive: player.netIncome >= 0, negative: player.netIncome < 0 }">
                      ${{ player.netIncome }}
                    </span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Transactions:</span>
                    <span class="stat-value">{{ player.totalTransactions }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Type Statistics -->
          <div class="property-type-stats">
            <h5>🏠 Property Type Statistics</h5>
            <div class="property-type-grid">
              <div 
                v-for="typeStats in propertyTypeStats" 
                :key="typeStats.type"
                class="property-type-card"
              >
                <div class="type-header">
                  <span class="type-icon">{{ getPropertyIcon(typeStats.type) }}</span>
                  <span class="type-name">{{ typeStats.type }}</span>
                </div>
                <div class="type-stats">
                  <div class="stat-item">
                    <span class="stat-label">Total Rent:</span>
                    <span class="stat-value">${{ typeStats.totalRent }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Transactions:</span>
                    <span class="stat-value">{{ typeStats.transactions }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Avg. Rent:</span>
                    <span class="stat-value">${{ typeStats.averageRent }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Properties -->
          <div class="top-properties">
            <h5>🏆 Highest Rent Properties</h5>
            <div class="top-properties-list">
              <div 
                v-for="(property, index) in topRentProperties" 
                :key="property.propertyName"
                class="top-property-item"
              >
                <div class="property-rank">{{ index + 1 }}</div>
                <div class="property-details">
                  <span class="property-name">{{ property.propertyName }}</span>
                  <span class="property-type">{{ property.propertyType }}</span>
                </div>
                <div class="property-earnings">
                  <span class="total-rent">${{ property.totalRent }}</span>
                  <span class="transaction-count">{{ property.transactions }} transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="history-footer">
        <button @click="exportHistory" class="action-btn export-btn">
          <span class="btn-icon">📁</span>
          Export History
        </button>
        
        <button @click="clearHistory" class="action-btn clear-btn" :disabled="allTransactions.length === 0">
          <span class="btn-icon">🗑️</span>
          Clear History
        </button>
        
        <button @click="closeHistory" class="action-btn close-btn">
          <span class="btn-icon">✕</span>
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'RentHistory',

  props: {
    gameState: {
      type: Object,
      required: true
    }
  },

  emits: ['close-history'],

  setup(props, { emit }) {
    const showHistory = ref(true)
    const viewMode = ref('list')
    const selectedPlayer = ref('')
    const selectedPropertyType = ref('')
    const selectedTransactionType = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    // Computed properties
    const allTransactions = computed(() => {
      return (props.gameState.history || []).filter(h => h.type === 'rent')
    })

    const allPlayers = computed(() => {
      return props.gameState.players || []
    })

    const filteredTransactions = computed(() => {
      let transactions = [...allTransactions.value]

      if (selectedPlayer.value) {
        transactions = transactions.filter(t => 
          t.payerId === selectedPlayer.value || t.receiverId === selectedPlayer.value
        )
      }

      if (selectedPropertyType.value) {
        transactions = transactions.filter(t => t.propertyType === selectedPropertyType.value)
      }

      if (selectedTransactionType.value) {
        transactions = transactions.filter(t => t.outcome === selectedTransactionType.value)
      }

      return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredTransactions.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / itemsPerPage)
    })

    const totalTransactions = computed(() => {
      return allTransactions.value.length
    })

    const totalRentTransacted = computed(() => {
      return allTransactions.value.reduce((total, t) => total + t.amount, 0)
    })

    const totalRentCollected = computed(() => {
      return allTransactions.value
        .filter(t => t.outcome === 'paid')
        .reduce((total, t) => total + t.amount, 0)
    })

    const totalRentPaid = computed(() => {
      return totalRentTransacted.value
    })

    const playerStats = computed(() => {
      const stats = {}
      
      allPlayers.value.forEach(player => {
        stats[player.id] = {
          id: player.id,
          name: player.name,
          color: player.color,
          rentCollected: 0,
          rentPaid: 0,
          totalTransactions: 0,
          netIncome: 0
        }
      })

      allTransactions.value.forEach(transaction => {
        if (stats[transaction.receiverId]) {
          stats[transaction.receiverId].rentCollected += transaction.amount
          stats[transaction.receiverId].totalTransactions++
        }
        
        if (stats[transaction.payerId]) {
          stats[transaction.payerId].rentPaid += transaction.amount
          stats[transaction.payerId].totalTransactions++
        }
      })

      Object.values(stats).forEach(stat => {
        stat.netIncome = stat.rentCollected - stat.rentPaid
      })

      return Object.values(stats).sort((a, b) => b.netIncome - a.netIncome)
    })

    const propertyTypeStats = computed(() => {
      const stats = {}
      
      allTransactions.value.forEach(transaction => {
        if (!stats[transaction.propertyType]) {
          stats[transaction.propertyType] = {
            type: transaction.propertyType,
            totalRent: 0,
            transactions: 0,
            averageRent: 0
          }
        }
        
        stats[transaction.propertyType].totalRent += transaction.amount
        stats[transaction.propertyType].transactions++
      })

      Object.values(stats).forEach(stat => {
        stat.averageRent = Math.round(stat.totalRent / stat.transactions) || 0
      })

      return Object.values(stats).sort((a, b) => b.totalRent - a.totalRent)
    })

    const topRentProperties = computed(() => {
      const propertyStats = {}
      
      allTransactions.value.forEach(transaction => {
        if (!propertyStats[transaction.propertyName]) {
          propertyStats[transaction.propertyName] = {
            propertyName: transaction.propertyName,
            propertyType: transaction.propertyType,
            totalRent: 0,
            transactions: 0
          }
        }
        
        propertyStats[transaction.propertyName].totalRent += transaction.amount
        propertyStats[transaction.propertyName].transactions++
      })

      return Object.values(propertyStats)
        .sort((a, b) => b.totalRent - a.totalRent)
        .slice(0, 10)
    })

    // Methods
    const getTransactionIcon = (transaction) => {
      switch (transaction.outcome) {
        case 'paid': return '💰'
        case 'bankruptcy': return '💀'
        case 'liquidation': return '🏠'
        default: return '💳'
      }
    }

    const getTransactionType = (transaction) => {
      switch (transaction.outcome) {
        case 'paid': return 'Rent Payment'
        case 'bankruptcy': return 'Bankruptcy'
        case 'liquidation': return 'Asset Liquidation'
        default: return 'Transaction'
      }
    }

    const getPropertyIcon = (propertyType) => {
      switch (propertyType) {
        case 'property': return '🏠'
        case 'railroad': return '🚂'
        case 'utility': return '⚡'
        default: return '🏢'
      }
    }

    const getAmountClass = (transaction) => {
      switch (transaction.outcome) {
        case 'paid': return 'amount-paid'
        case 'bankruptcy': return 'amount-bankruptcy'
        default: return 'amount-normal'
      }
    }

    const getOutcomeText = (outcome) => {
      switch (outcome) {
        case 'bankruptcy': return 'Player Bankrupt'
        case 'liquidation': return 'Assets Sold'
        default: return outcome
      }
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString()
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const exportHistory = () => {
      const data = {
        summary: {
          totalTransactions: totalTransactions.value,
          totalRentTransacted: totalRentTransacted.value,
          totalRentCollected: totalRentCollected.value,
          totalRentPaid: totalRentPaid.value
        },
        transactions: allTransactions.value,
        playerStats: playerStats.value,
        propertyTypeStats: propertyTypeStats.value,
        topRentProperties: topRentProperties.value,
        exportedAt: new Date().toISOString()
      }

      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `monopoly-rent-history-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    }

    const clearHistory = () => {
      if (confirm('Are you sure you want to clear all rent history? This action cannot be undone.')) {
        props.gameState.history = props.gameState.history.filter(h => h.type !== 'rent')
      }
    }

    const closeHistory = () => {
      showHistory.value = false
      emit('close-history')
    }

    // Watch for filter changes
    watch([selectedPlayer, selectedPropertyType, selectedTransactionType], () => {
      currentPage.value = 1
    })

    return {
      // Reactive state
      showHistory,
      viewMode,
      selectedPlayer,
      selectedPropertyType,
      selectedTransactionType,
      currentPage,

      // Computed
      allTransactions,
      allPlayers,
      filteredTransactions,
      paginatedTransactions,
      totalPages,
      totalTransactions,
      totalRentTransacted,
      totalRentCollected,
      totalRentPaid,
      playerStats,
      propertyTypeStats,
      topRentProperties,

      // Methods
      getTransactionIcon,
      getTransactionType,
      getPropertyIcon,
      getAmountClass,
      getOutcomeText,
      formatTime,
      applyFilters,
      exportHistory,
      clearHistory,
      closeHistory
    }
  }
}
</script>

<style scoped>
.rent-history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2300;
  backdrop-filter: blur(4px);
}

.rent-history-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-header {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.history-summary {
  margin-bottom: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #ecf0f1;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card.total {
  border-color: #3498db;
}

.summary-card.collected {
  border-color: #27ae60;
}

.summary-card.paid {
  border-color: #e74c3c;
}

.summary-card.transactions {
  border-color: #f39c12;
}

.card-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.history-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: end;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.control-group label {
  font-size: 0.9rem;
  font-weight: bold;
  color: #2c3e50;
}

.control-group select {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 0.9rem;
}

.control-group select:focus {
  outline: none;
  border-color: #3498db;
}

.view-toggle {
  display: flex;
  gap: 4px;
}

.toggle-btn {
  padding: 8px 16px;
  border: 2px solid #ecf0f1;
  background: white;
  color: #7f8c8d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: bold;
}

.toggle-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-color: #3498db;
}

.transactions-list {
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h4 {
  margin: 0;
  color: #2c3e50;
}

.list-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.transaction-item {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  border-color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.transaction-item.rent-paid {
  border-left: 4px solid #27ae60;
}

.transaction-item.bankruptcy {
  border-left: 4px solid #e74c3c;
}

.transaction-item.liquidation {
  border-left: 4px solid #f39c12;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.transaction-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.type-icon {
  font-size: 1.2rem;
}

.transaction-time {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-players {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.payment-arrow {
  font-size: 1.2rem;
  color: #3498db;
  font-weight: bold;
}

.transaction-property {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-icon {
  font-size: 1.1rem;
}

.property-name {
  font-weight: bold;
  color: #2c3e50;
}

.property-type {
  color: #7f8c8d;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.rent-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.rent-type {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: capitalize;
}

.rent-description {
  font-size: 0.8rem;
  color: #95a5a6;
}

.transaction-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.amount-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.amount-value.amount-paid {
  color: #27ae60;
}

.amount-value.amount-bankruptcy {
  color: #e74c3c;
}

.amount-value.amount-normal {
  color: #2c3e50;
}

.development-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dev-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.dev-tag.hotel {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.dev-tag.houses {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.dev-tag.monopoly {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.outcome-info {
  display: flex;
  justify-content: center;
}

.outcome-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.outcome-badge.bankruptcy {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.outcome-badge.liquidation {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-transactions-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-transactions-text {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #2c3e50;
  font-weight: bold;
}

.statistics-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-header h4 {
  margin: 0;
  color: #2c3e50;
}

.player-stats h5,
.property-type-stats h5,
.top-properties h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.player-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.player-stat-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 16px;
}

.player-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.player-name {
  font-weight: bold;
  color: #2c3e50;
}

.player-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #2c3e50;
}

.player-stat-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.property-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.property-type-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.type-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.type-icon {
  font-size: 1.5rem;
}

.type-name {
  font-weight: bold;
  color: #2c3e50;
  text-transform: capitalize;
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.top-properties-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-property-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
}

.property-rank {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.property-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-details .property-name {
  font-weight: bold;
  color: #2c3e50;
}

.property-details .property-type {
  color: #7f8c8d;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.property-earnings {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.total-rent {
  font-weight: bold;
  color: #27ae60;
  font-size: 1.1rem;
}

.transaction-count {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.history-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.clear-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.history-footer .close-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.history-footer .close-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rent-history-modal {
    width: 98%;
    margin: 10px;
    max-height: 98vh;
  }

  .history-header {
    padding: 16px;
  }

  .history-header h3 {
    font-size: 1.3rem;
  }

  .history-content {
    padding: 16px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-controls {
    flex-direction: column;
    gap: 12px;
  }

  .control-group {
    min-width: auto;
  }

  .view-toggle {
    flex-direction: row;
    width: 100%;
  }

  .toggle-btn {
    flex: 1;
  }

  .player-stats-grid {
    grid-template-columns: 1fr;
  }

  .property-type-grid {
    grid-template-columns: 1fr;
  }

  .transaction-players {
    flex-direction: column;
    gap: 8px;
  }

  .payment-arrow {
    transform: rotate(90deg);
  }

  .transaction-property {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .history-footer {
    flex-direction: column;
    padding: 16px;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>