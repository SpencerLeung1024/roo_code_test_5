<template>
  <div class="property-manager-modal" v-if="show">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Property Portfolio</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="portfolio-overview">
        <div class="player-info">
          <div class="player-name" :style="{ color: currentPlayer.color }">
            {{ currentPlayer.name }}'s Portfolio
          </div>
          <div class="player-money">
            Cash: ${{ currentPlayer.money.toLocaleString() }}
          </div>
        </div>

        <div class="portfolio-stats">
          <div class="stat-card">
            <div class="stat-value">{{ portfolioSummary.totalProperties }}</div>
            <div class="stat-label">Properties</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${{ portfolioSummary.totalValue.toLocaleString() }}</div>
            <div class="stat-label">Portfolio Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${{ portfolioSummary.totalRent.toLocaleString() }}</div>
            <div class="stat-label">Monthly Rent</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ portfolioSummary.monopolies }}</div>
            <div class="stat-label">Monopolies</div>
          </div>
        </div>
      </div>

      <div class="portfolio-tabs">
        <button 
          v-for="tab in portfolioTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">({{ tab.count }})</span>
        </button>
      </div>

      <div class="portfolio-content">
        <!-- Properties Tab -->
        <div v-if="activeTab === 'properties'" class="properties-view">
          <div v-if="playerProperties.length === 0" class="empty-state">
            <div class="empty-icon">🏠</div>
            <div class="empty-text">
              <h4>No Properties Owned</h4>
              <p>Start buying properties to build your monopoly empire!</p>
            </div>
          </div>

          <div v-else class="properties-grid">
            <div 
              v-for="property in playerProperties"
              :key="property.id"
              class="property-card"
              :class="{ 
                monopoly: property.isPartOfMonopoly,
                mortgaged: property.isMortgaged,
                developed: property.houses > 0 || property.hasHotel
              }"
            >
              <div class="property-header">
                <div class="property-name" :style="{ color: property.colorGroup }">
                  {{ property.name }}
                </div>
                <div class="property-badges">
                  <span v-if="property.isPartOfMonopoly" class="badge monopoly-badge">Monopoly</span>
                  <span v-if="property.isMortgaged" class="badge mortgaged-badge">Mortgaged</span>
                  <span v-if="property.houses > 0" class="badge houses-badge">
                    🏠{{ property.houses }}
                  </span>
                  <span v-if="property.hasHotel" class="badge hotel-badge">🏨</span>
                </div>
              </div>

              <div class="property-details">
                <div class="detail-row">
                  <span class="label">Purchase Price:</span>
                  <span class="value">${{ property.price.toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Current Rent:</span>
                  <span class="value rent-value">${{ property.currentRent || 0 }}</span>
                </div>
                <div class="detail-row" v-if="property.isMortgaged">
                  <span class="label">Mortgage Value:</span>
                  <span class="value">${{ getMortgageValue(property).toLocaleString() }}</span>
                </div>
                <div class="detail-row" v-if="getDevelopmentValue(property) > 0">
                  <span class="label">Development Value:</span>
                  <span class="value">${{ getDevelopmentValue(property).toLocaleString() }}</span>
                </div>
              </div>

              <div class="property-actions">
                <button 
                  @click="openPropertyModal(property.id, 'development')"
                  :disabled="!property.canDevelop || property.isMortgaged"
                  class="btn action-btn development-btn"
                >
                  Develop
                </button>
                <button 
                  @click="openPropertyModal(property.id, 'manage')"
                  class="btn action-btn manage-btn"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Railroads Tab -->
        <div v-if="activeTab === 'railroads'" class="railroads-view">
          <div v-if="playerRailroads.length === 0" class="empty-state">
            <div class="empty-icon">🚂</div>
            <div class="empty-text">
              <h4>No Railroads Owned</h4>
              <p>Railroads provide steady income and work better in groups!</p>
            </div>
          </div>

          <div v-else class="railroads-grid">
            <div 
              v-for="railroad in playerRailroads"
              :key="railroad.id"
              class="railroad-card"
              :class="{ mortgaged: railroad.isMortgaged }"
            >
              <div class="railroad-header">
                <div class="railroad-name">{{ railroad.name }}</div>
                <div class="railroad-badges">
                  <span v-if="railroad.isMortgaged" class="badge mortgaged-badge">Mortgaged</span>
                </div>
              </div>

              <div class="railroad-details">
                <div class="detail-row">
                  <span class="label">Purchase Price:</span>
                  <span class="value">${{ railroad.price.toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Current Rent:</span>
                  <span class="value rent-value">${{ railroad.currentRent }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Railroads Owned:</span>
                  <span class="value">{{ playerRailroads.length }}/4</span>
                </div>
              </div>

              <div class="railroad-actions">
                <button 
                  @click="openPropertyModal(railroad.id, 'manage')"
                  class="btn action-btn manage-btn"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div class="railroad-bonus-info">
            <h5>🚂 Railroad Bonus Schedule</h5>
            <div class="bonus-schedule">
              <div class="bonus-item" :class="{ active: playerRailroads.length >= 1 }">
                <span class="count">1 Railroad:</span>
                <span class="rent">$25 rent</span>
              </div>
              <div class="bonus-item" :class="{ active: playerRailroads.length >= 2 }">
                <span class="count">2 Railroads:</span>
                <span class="rent">$50 rent</span>
              </div>
              <div class="bonus-item" :class="{ active: playerRailroads.length >= 3 }">
                <span class="count">3 Railroads:</span>
                <span class="rent">$100 rent</span>
              </div>
              <div class="bonus-item" :class="{ active: playerRailroads.length >= 4 }">
                <span class="count">4 Railroads:</span>
                <span class="rent">$200 rent</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Utilities Tab -->
        <div v-if="activeTab === 'utilities'" class="utilities-view">
          <div v-if="playerUtilities.length === 0" class="empty-state">
            <div class="empty-icon">⚡</div>
            <div class="empty-text">
              <h4>No Utilities Owned</h4>
              <p>Electric Company and Water Works provide variable income based on dice rolls!</p>
            </div>
          </div>

          <div v-else class="utilities-grid">
            <div 
              v-for="utility in playerUtilities"
              :key="utility.id"
              class="utility-card"
              :class="{ mortgaged: utility.isMortgaged }"
            >
              <div class="utility-header">
                <div class="utility-name">{{ utility.name }}</div>
                <div class="utility-badges">
                  <span v-if="utility.isMortgaged" class="badge mortgaged-badge">Mortgaged</span>
                </div>
              </div>

              <div class="utility-details">
                <div class="detail-row">
                  <span class="label">Purchase Price:</span>
                  <span class="value">${{ utility.price.toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Rent Multiplier:</span>
                  <span class="value">{{ utility.rentMultiplier }}× dice roll</span>
                </div>
                <div class="detail-row">
                  <span class="label">Utilities Owned:</span>
                  <span class="value">{{ playerUtilities.length }}/2</span>
                </div>
              </div>

              <div class="utility-actions">
                <button 
                  @click="openPropertyModal(utility.id, 'manage')"
                  class="btn action-btn manage-btn"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div class="utility-bonus-info">
            <h5>⚡ Utility Rent Calculation</h5>
            <div class="bonus-schedule">
              <div class="bonus-item" :class="{ active: playerUtilities.length >= 1 }">
                <span class="count">1 Utility:</span>
                <span class="rent">4× dice roll</span>
              </div>
              <div class="bonus-item" :class="{ active: playerUtilities.length >= 2 }">
                <span class="count">2 Utilities:</span>
                <span class="rent">10× dice roll</span>
              </div>
            </div>
            <div class="utility-example">
              <strong>Example:</strong> With dice roll of 8 and 2 utilities = $80 rent
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="analytics-view">
          <div class="analytics-grid">
            <div class="analytics-card">
              <h5>Color Group Progress</h5>
              <div class="color-groups">
                <div 
                  v-for="group in colorGroupProgress"
                  :key="group.colorGroup"
                  class="color-group-item"
                  :class="{ complete: group.isComplete }"
                >
                  <div class="group-header">
                    <div class="group-name" :style="{ color: group.colorGroup }">
                      {{ group.name }}
                    </div>
                    <div class="group-progress">
                      {{ group.owned }}/{{ group.total }}
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      :style="{ 
                        width: `${(group.owned / group.total) * 100}%`,
                        backgroundColor: group.colorGroup
                      }"
                    ></div>
                  </div>
                  <div v-if="group.isComplete" class="monopoly-indicator">
                    ✅ Monopoly Complete
                  </div>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h5>Investment Analysis</h5>
              <div class="investment-metrics">
                <div class="metric-item">
                  <span class="metric-label">Total Investment:</span>
                  <span class="metric-value">${{ getTotalInvestment().toLocaleString() }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Current Portfolio Value:</span>
                  <span class="metric-value">${{ portfolioSummary.totalValue.toLocaleString() }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Potential Monthly Income:</span>
                  <span class="metric-value">${{ portfolioSummary.totalRent.toLocaleString() }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">ROI Potential:</span>
                  <span class="metric-value">{{ getROIPercentage() }}%</span>
                </div>
              </div>
            </div>

            <div class="analytics-card">
              <h5>Development Opportunities</h5>
              <div class="development-opportunities">
                <div 
                  v-for="opportunity in developmentOpportunities"
                  :key="opportunity.type"
                  class="opportunity-item"
                >
                  <div class="opportunity-icon">{{ opportunity.icon }}</div>
                  <div class="opportunity-content">
                    <div class="opportunity-title">{{ opportunity.title }}</div>
                    <div class="opportunity-description">{{ opportunity.description }}</div>
                  </div>
                  <button 
                    v-if="opportunity.action"
                    @click="opportunity.action()"
                    class="btn opportunity-btn"
                  >
                    {{ opportunity.buttonText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="portfolio-actions">
        <button 
          @click="openDevelopmentModal"
          :disabled="!hasMonopolies"
          class="btn primary-btn"
        >
          🏗️ Develop Properties
        </button>
        
        <button 
          @click="openTradingModal"
          class="btn secondary-btn"
        >
          🤝 Trade Properties
        </button>
        
        <button 
          @click="openBulkManagement"
          :disabled="portfolioSummary.totalProperties === 0"
          class="btn secondary-btn"
        >
          ⚙️ Bulk Actions
        </button>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { gameState } from '../../game/gameState.js'
import { COLOR_GROUPS } from '../../data/boardData.js'

export default {
  name: 'PropertyManager',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    currentPlayer: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'open-modal'],

  setup(props, { emit }) {
    const activeTab = ref('properties')

    // Player's properties
    const playerProperties = computed(() => {
      return props.currentPlayer.properties?.map(id => gameState.properties[id]).filter(Boolean) || []
    })

    const playerRailroads = computed(() => {
      return props.currentPlayer.railroads?.map(id => gameState.railroads[id]).filter(Boolean) || []
    })

    const playerUtilities = computed(() => {
      return props.currentPlayer.utilities?.map(id => gameState.utilities[id]).filter(Boolean) || []
    })

    // Portfolio summary
    const portfolioSummary = computed(() => {
      const totalProperties = playerProperties.value.length + playerRailroads.value.length + playerUtilities.value.length
      
      let totalValue = 0
      let totalRent = 0
      let monopolies = 0

      // Calculate properties value and rent
      playerProperties.value.forEach(property => {
        totalValue += property.price
        if (property.houses > 0) totalValue += property.houses * property.houseCost
        if (property.hasHotel) totalValue += property.houseCost
        if (!property.isMortgaged) {
          totalRent += property.currentRent || 0
        }
        if (property.isPartOfMonopoly) {
          // Count each property in monopoly, we'll deduplicate below
        }
      })

      // Count unique monopolies
      const monopolyGroups = new Set()
      playerProperties.value.forEach(property => {
        if (property.isPartOfMonopoly) {
          monopolyGroups.add(property.colorGroup)
        }
      })
      monopolies = monopolyGroups.size

      // Add railroads
      playerRailroads.value.forEach(railroad => {
        totalValue += railroad.price
        if (!railroad.isMortgaged) {
          totalRent += railroad.currentRent || 0
        }
      })

      // Add utilities (estimated rent)
      playerUtilities.value.forEach(utility => {
        totalValue += utility.price
        if (!utility.isMortgaged) {
          totalRent += utility.rentMultiplier * 7 // Average dice roll
        }
      })

      return {
        totalProperties,
        totalValue,
        totalRent,
        monopolies
      }
    })

    // Tab configuration
    const portfolioTabs = computed(() => [
      {
        id: 'properties',
        label: 'Properties',
        count: playerProperties.value.length
      },
      {
        id: 'railroads',
        label: 'Railroads',
        count: playerRailroads.value.length
      },
      {
        id: 'utilities',
        label: 'Utilities',
        count: playerUtilities.value.length
      },
      {
        id: 'analytics',
        label: 'Analytics',
        count: null
      }
    ])

    // Color group progress
    const colorGroupProgress = computed(() => {
      return Object.entries(COLOR_GROUPS).map(([colorGroup, groupData]) => {
        const owned = groupData.properties.filter(id => 
          props.currentPlayer.properties?.includes(id)
        ).length
        
        return {
          colorGroup,
          name: groupData.name,
          owned,
          total: groupData.properties.length,
          isComplete: owned === groupData.properties.length
        }
      }).filter(group => group.owned > 0 || group.total <= 3) // Show only relevant groups
    })

    // Helper methods
    const getMortgageValue = (property) => {
      return property.mortgageValue || Math.floor(property.price / 2)
    }

    const getDevelopmentValue = (property) => {
      return (property.houses * property.houseCost) + (property.hasHotel ? property.houseCost : 0)
    }

    const getTotalInvestment = () => {
      let total = 0
      
      playerProperties.value.forEach(property => {
        total += property.price
        total += getDevelopmentValue(property)
      })
      
      playerRailroads.value.forEach(railroad => {
        total += railroad.price
      })
      
      playerUtilities.value.forEach(utility => {
        total += utility.price
      })
      
      return total
    }

    const getROIPercentage = () => {
      const investment = getTotalInvestment()
      if (investment === 0) return 0
      return Math.round((portfolioSummary.value.totalRent / investment) * 100)
    }

    const hasMonopolies = computed(() => {
      return portfolioSummary.value.monopolies > 0
    })

    // Development opportunities
    const developmentOpportunities = computed(() => {
      const opportunities = []

      // Check for monopolies that can be developed
      const undevelopedMonopolies = playerProperties.value.filter(p => 
        p.isPartOfMonopoly && p.houses === 0 && !p.hasHotel && !p.isMortgaged
      )
      
      if (undevelopedMonopolies.length > 0) {
        opportunities.push({
          type: 'develop',
          icon: '🏗️',
          title: 'Develop Monopolies',
          description: `${undevelopedMonopolies.length} properties ready for development`,
          buttonText: 'Develop',
          action: () => openDevelopmentModal()
        })
      }

      // Check for trading opportunities
      const incompleteGroups = colorGroupProgress.value.filter(g => 
        g.owned > 0 && g.owned < g.total
      )
      
      if (incompleteGroups.length > 0) {
        opportunities.push({
          type: 'trade',
          icon: '🤝',
          title: 'Complete Color Groups',
          description: `${incompleteGroups.length} groups need 1-2 more properties`,
          buttonText: 'Trade',
          action: () => openTradingModal()
        })
      }

      // Check for mortgage opportunities
      const mortgageableProperties = playerProperties.value.filter(p => 
        !p.isMortgaged && p.houses === 0 && !p.hasHotel
      )
      
      if (mortgageableProperties.length > 0 && props.currentPlayer.money < 500) {
        opportunities.push({
          type: 'mortgage',
          icon: '🏦',
          title: 'Mortgage for Cash',
          description: 'Generate immediate cash from unmortgaged properties',
          buttonText: 'Manage',
          action: () => openBulkManagement()
        })
      }

      return opportunities
    })

    // Actions
    const openPropertyModal = (propertyId, mode) => {
      emit('open-modal', {
        type: 'property-detail',
        propertyId,
        mode
      })
    }

    const openDevelopmentModal = () => {
      emit('open-modal', {
        type: 'development'
      })
    }

    const openTradingModal = () => {
      emit('open-modal', {
        type: 'trading'
      })
    }

    const openBulkManagement = () => {
      emit('open-modal', {
        type: 'bulk-management'
      })
    }

    const closeModal = () => {
      emit('close')
    }

    return {
      activeTab,
      playerProperties,
      playerRailroads,
      playerUtilities,
      portfolioSummary,
      portfolioTabs,
      colorGroupProgress,
      getMortgageValue,
      getDevelopmentValue,
      getTotalInvestment,
      getROIPercentage,
      hasMonopolies,
      developmentOpportunities,
      openPropertyModal,
      openDevelopmentModal,
      openTradingModal,
      openBulkManagement,
      closeModal
    }
  }
}
</script>

<style scoped>
.property-manager-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.portfolio-overview {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.player-info {
  text-align: center;
  margin-bottom: 24px;
}

.player-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.player-money {
  font-size: 1.2rem;
  font-weight: 600;
  opacity: 0.9;
}

.portfolio-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.portfolio-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

.tab-count {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.tab-btn.active .tab-count {
  background: #3498db;
  color: white;
}

.portfolio-content {
  padding: 24px;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.empty-text p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.properties-grid,
.railroads-grid,
.utilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.property-card,
.railroad-card,
.utility-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.2s;
}

.property-card:hover,
.railroad-card:hover,
.utility-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.property-card.monopoly {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff 0%, #fef9e7 100%);
}

.property-card.mortgaged,
.railroad-card.mortgaged,
.utility-card.mortgaged {
  opacity: 0.7;
  background: #f8f9fa;
}

.property-card.developed {
  border-color: #27ae60;
  background: linear-gradient(135deg, #fff 0%, #e8f5e8 100%);
}

.property-header,
.railroad-header,
.utility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.property-name,
.railroad-name,
.utility-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2c3e50;
}

.property-badges,
.railroad-badges,
.utility-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.monopoly-badge {
  background: #f39c12;
  color: white;
}

.mortgaged-badge {
  background: #95a5a6;
  color: white;
}

.houses-badge {
  background: #3498db;
  color: white;
}

.hotel-badge {
  background: #9b59b6;
  color: white;
}

.property-details,
.railroad-details,
.utility-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #7f8c8d;
  font-weight: 600;
}

.value {
  color: #2c3e50;
  font-weight: 600;
}

.rent-value {
  color: #27ae60;
}

.property-actions,
.railroad-actions,
.utility-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.action-btn {
  flex: 1;
}

.development-btn {
  background: #3498db;
  color: white;
}

.development-btn:not(:disabled):hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.manage-btn {
  background: #95a5a6;
  color: white;
}

.manage-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #ecf0f1;
  color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.railroad-bonus-info,
.utility-bonus-info {
  margin-top: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.railroad-bonus-info h5,
.utility-bonus-info h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.bonus-schedule {
  display: grid;
  gap: 8px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.bonus-item.active {
  border-color: #27ae60;
  background: #e8f5e8;
}

.count {
  font-weight: 600;
  color: #2c3e50;
}

.rent {
  color: #27ae60;
  font-weight: 600;
}

.utility-example {
  margin-top: 12px;
  padding: 8px;
  background: #e1ecf4;
  border-radius: 4px;
  color: #2c3e50;
  font-size: 0.9rem;
}

.analytics-view {
  display: grid;
  gap: 24px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.analytics-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.analytics-card h5 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.color-groups {
  display: grid;
  gap: 12px;
}

.color-group-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.color-group-item.complete {
  border-color: #27ae60;
  background: #e8f5e8;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.group-name {
  font-weight: 600;
}

.group-progress {
  font-weight: 600;
  color: #7f8c8d;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.monopoly-indicator {
  margin-top: 8px;
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9rem;
}

.investment-metrics {
  display: grid;
  gap: 12px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  color: #7f8c8d;
  font-weight: 600;
}

.metric-value {
  color: #2c3e50;
  font-weight: 700;
}

.development-opportunities {
  display: grid;
  gap: 16px;
}

.opportunity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.opportunity-icon {
  font-size: 2rem;
}

.opportunity-content {
  flex: 1;
}

.opportunity-title {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.opportunity-description {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.opportunity-btn {
  background: #3498db;
  color: white;
  padding: 8px 16px;
  white-space: nowrap;
}

.opportunity-btn:hover {
  background: #2980b9;
}

.portfolio-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.primary-btn {
  background: #27ae60;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:not(:disabled):hover {
  background: #229954;
  transform: translateY(-1px);
}

.secondary-btn {
  background: #3498db;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:not(:disabled):hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.primary-btn:disabled,
.secondary-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

.modal-footer .close-btn {
  background: #95a5a6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer .close-btn:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .portfolio-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .properties-grid,
  .railroads-grid,
  .utilities-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .portfolio-tabs {
    flex-wrap: wrap;
  }
  
  .portfolio-actions {
    flex-direction: column;
  }
}
</style>