<template>
  <div class="bankruptcy-prevention">
    <!-- Financial Health Indicator -->
    <div v-if="showHealthIndicator" class="financial-health-indicator" :class="healthStatus">
      <div class="health-icon">
        <i :class="healthIcon"></i>
      </div>
      <div class="health-info">
        <div class="health-status">{{ healthMessage }}</div>
        <div class="health-details">{{ healthDetails }}</div>
      </div>
      <button v-if="showWarnings" @click="showPreventionModal = true" class="view-suggestions-btn">
        View Suggestions
      </button>
    </div>

    <!-- Prevention Modal -->
    <div v-if="showPreventionModal" class="prevention-modal-overlay" @click="closeModal">
      <div class="prevention-modal" @click.stop>
        <div class="modal-header">
          <h2>Financial Risk Assessment</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-content">
          <!-- Current Financial Status -->
          <div class="financial-overview">
            <h3>Current Financial Status</h3>
            <div class="status-grid">
              <div class="status-item">
                <label>Cash on Hand</label>
                <span class="value">${{ currentPlayer.money.toLocaleString() }}</span>
              </div>
              <div class="status-item">
                <label>Total Assets</label>
                <span class="value">${{ totalAssets.toLocaleString() }}</span>
              </div>
              <div class="status-item">
                <label>Liquid Assets</label>
                <span class="value">${{ liquidAssets.toLocaleString() }}</span>
              </div>
              <div class="status-item">
                <label>Net Worth</label>
                <span class="value">${{ netWorth.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Risk Analysis -->
          <div class="risk-analysis">
            <h3>Risk Analysis</h3>
            <div class="risk-factors">
              <div v-for="risk in riskFactors" :key="risk.type" class="risk-factor" :class="risk.severity">
                <div class="risk-icon">
                  <i :class="risk.icon"></i>
                </div>
                <div class="risk-content">
                  <div class="risk-title">{{ risk.title }}</div>
                  <div class="risk-description">{{ risk.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Improvement Suggestions -->
          <div class="suggestions">
            <h3>Recommended Actions</h3>
            <div class="suggestions-list">
              <div v-for="suggestion in suggestions" :key="suggestion.id" class="suggestion-item">
                <div class="suggestion-header">
                  <div class="suggestion-title">{{ suggestion.title }}</div>
                  <div class="suggestion-impact" :class="suggestion.impactLevel">
                    {{ suggestion.impact }}
                  </div>
                </div>
                <div class="suggestion-description">{{ suggestion.description }}</div>
                <div v-if="suggestion.actions.length > 0" class="suggestion-actions">
                  <button 
                    v-for="action in suggestion.actions" 
                    :key="action.id"
                    @click="executeSuggestion(action)"
                    class="action-btn"
                    :class="action.type"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Scenario Analysis -->
          <div class="scenario-analysis">
            <h3>What-If Scenarios</h3>
            <div class="scenarios">
              <div v-for="scenario in scenarios" :key="scenario.id" class="scenario-item">
                <div class="scenario-title">{{ scenario.title }}</div>
                <div class="scenario-result" :class="scenario.outcome">
                  {{ scenario.description }}
                </div>
                <div class="scenario-details">
                  <span class="detail-item">
                    Cash After: ${{ scenario.cashAfter.toLocaleString() }}
                  </span>
                  <span class="detail-item">
                    Net Worth: ${{ scenario.netWorthAfter.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button @click="openPropertyManager" class="quick-action-btn property">
                <i class="fas fa-building"></i>
                Manage Properties
              </button>
              <button @click="openAssetLiquidation" class="quick-action-btn liquidate">
                <i class="fas fa-dollar-sign"></i>
                Liquidate Assets
              </button>
              <button @click="openTrading" class="quick-action-btn trade">
                <i class="fas fa-handshake"></i>
                Trade Properties
              </button>
              <button @click="viewRentHistory" class="quick-action-btn history">
                <i class="fas fa-history"></i>
                View Rent History
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="dismissWarnings" class="dismiss-btn">
            Don't Show Again This Turn
          </button>
          <button @click="closeModal" class="close-btn-footer">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Warning Widget -->
    <div v-if="showFloatingWarning" class="floating-warning" :class="warningLevel">
      <div class="warning-content">
        <i :class="warningIcon"></i>
        <span class="warning-text">{{ warningMessage }}</span>
        <button @click="showPreventionModal = true" class="expand-btn">
          <i class="fas fa-expand-alt"></i>
        </button>
        <button @click="dismissFloatingWarning" class="dismiss-floating-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'BankruptcyPrevention',
  props: {
    gameState: {
      type: Object,
      required: true
    },
    currentPlayer: {
      type: Object,
      required: true
    },
    properties: {
      type: Array,
      default: () => []
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'open-property-manager',
    'open-asset-liquidation', 
    'open-trading',
    'view-rent-history',
    'execute-suggestion'
  ],
  setup(props, { emit }) {
    const showPreventionModal = ref(false)
    const showFloatingWarning = ref(false)
    const warningsDismissed = ref(false)
    const lastWarningTime = ref(0)
    const monitoringInterval = ref(null)

    // Financial calculations
    const totalAssets = computed(() => {
      if (!props.currentPlayer) return 0
      
      let assets = props.currentPlayer.money || 0
      
      // Add property values
      const playerProperties = props.properties.filter(p => p.owner === props.currentPlayer.id)
      playerProperties.forEach(property => {
        assets += property.price || 0
        assets += (property.houses || 0) * (property.housePrice || 0)
        assets += (property.hotels || 0) * (property.hotelPrice || 0)
      })
      
      return assets
    })

    const liquidAssets = computed(() => {
      if (!props.currentPlayer) return 0
      
      let liquid = props.currentPlayer.money || 0
      
      // Add mortgageable property value (50% of price)
      const playerProperties = props.properties.filter(p => 
        p.owner === props.currentPlayer.id && !p.mortgaged
      )
      playerProperties.forEach(property => {
        liquid += Math.floor((property.price || 0) * 0.5)
      })
      
      return liquid
    })

    const netWorth = computed(() => totalAssets.value)

    const cashRatio = computed(() => {
      if (totalAssets.value === 0) return 0
      return (props.currentPlayer.money || 0) / totalAssets.value
    })

    // Health status assessment
    const healthStatus = computed(() => {
      const cash = props.currentPlayer.money || 0
      const ratio = cashRatio.value
      
      if (cash < 50 || ratio < 0.1) return 'critical'
      if (cash < 200 || ratio < 0.2) return 'warning'  
      if (cash < 500 || ratio < 0.3) return 'caution'
      return 'healthy'
    })

    const healthIcon = computed(() => {
      switch (healthStatus.value) {
        case 'critical': return 'fas fa-exclamation-triangle'
        case 'warning': return 'fas fa-exclamation-circle'
        case 'caution': return 'fas fa-info-circle'
        default: return 'fas fa-check-circle'
      }
    })

    const healthMessage = computed(() => {
      switch (healthStatus.value) {
        case 'critical': return 'Critical Financial Risk'
        case 'warning': return 'High Financial Risk'
        case 'caution': return 'Moderate Financial Risk'
        default: return 'Financial Health Good'
      }
    })

    const healthDetails = computed(() => {
      const cash = props.currentPlayer.money || 0
      switch (healthStatus.value) {
        case 'critical': 
          return `Only $${cash} cash remaining. Immediate action required.`
        case 'warning': 
          return `Low cash reserves ($${cash}). Consider liquidating assets.`
        case 'caution': 
          return `Cash position could be stronger ($${cash}).`
        default: 
          return `Strong financial position with $${cash} cash.`
      }
    })

    const showHealthIndicator = computed(() => 
      props.enabled && healthStatus.value !== 'healthy'
    )

    const showWarnings = computed(() => 
      healthStatus.value === 'critical' || healthStatus.value === 'warning'
    )

    // Risk factor analysis
    const riskFactors = computed(() => {
      const factors = []
      const cash = props.currentPlayer.money || 0
      const playerProperties = props.properties.filter(p => p.owner === props.currentPlayer.id)
      
      if (cash < 100) {
        factors.push({
          type: 'low-cash',
          severity: 'high',
          icon: 'fas fa-dollar-sign',
          title: 'Extremely Low Cash',
          description: `Only $${cash} remaining. You may not be able to pay rent or fees.`
        })
      }
      
      if (cashRatio.value < 0.15) {
        factors.push({
          type: 'cash-ratio',
          severity: 'medium',
          icon: 'fas fa-chart-pie',
          title: 'Poor Cash-to-Assets Ratio',
          description: 'Most wealth is tied up in properties. Consider mortgaging or selling.'
        })
      }
      
      const mortgagedCount = playerProperties.filter(p => p.mortgaged).length
      if (mortgagedCount > playerProperties.length * 0.5) {
        factors.push({
          type: 'over-mortgaged',
          severity: 'medium',
          icon: 'fas fa-home',
          title: 'Over-Mortgaged',
          description: `${mortgagedCount} properties mortgaged. Limited income generation.`
        })
      }
      
      return factors
    })

    // Improvement suggestions
    const suggestions = computed(() => {
      const suggestions = []
      const cash = props.currentPlayer.money || 0
      const playerProperties = props.properties.filter(p => p.owner === props.currentPlayer.id)
      
      if (cash < 200) {
        const mortgageableProps = playerProperties.filter(p => !p.mortgaged)
        if (mortgageableProps.length > 0) {
          suggestions.push({
            id: 'mortgage-properties',
            title: 'Mortgage Properties',
            impact: '+$' + Math.floor(mortgageableProps.reduce((sum, p) => sum + (p.price || 0), 0) * 0.5),
            impactLevel: 'positive',
            description: `Mortgage ${mortgageableProps.length} properties to raise immediate cash.`,
            actions: [{
              id: 'open-property-manager',
              type: 'primary',
              label: 'Manage Properties'
            }]
          })
        }
        
        const housesProps = playerProperties.filter(p => (p.houses || 0) > 0)
        if (housesProps.length > 0) {
          const houseValue = housesProps.reduce((sum, p) => 
            sum + (p.houses || 0) * (p.housePrice || 0) * 0.5, 0
          )
          suggestions.push({
            id: 'sell-houses',
            title: 'Sell Houses',
            impact: '+$' + Math.floor(houseValue),
            impactLevel: 'positive',
            description: 'Sell houses to raise cash while keeping properties.',
            actions: [{
              id: 'open-liquidation',
              type: 'warning',
              label: 'Liquidate Assets'
            }]
          })
        }
      }
      
      if (cashRatio.value < 0.2) {
        suggestions.push({
          id: 'improve-cash-ratio',
          title: 'Improve Cash Position',
          impact: 'Better stability',
          impactLevel: 'neutral',
          description: 'Aim for 20-30% of wealth in cash for safety.',
          actions: []
        })
      }
      
      return suggestions
    })

    // Scenario analysis
    const scenarios = computed(() => {
      const scenarios = []
      const cash = props.currentPlayer.money || 0
      const playerProperties = props.properties.filter(p => p.owner === props.currentPlayer.id)
      
      // Mortgage all properties scenario
      const mortgageableValue = playerProperties
        .filter(p => !p.mortgaged)
        .reduce((sum, p) => sum + Math.floor((p.price || 0) * 0.5), 0)
      
      if (mortgageableValue > 0) {
        scenarios.push({
          id: 'mortgage-all',
          title: 'Mortgage All Properties',
          description: 'Provides maximum immediate cash',
          outcome: 'positive',
          cashAfter: cash + mortgageableValue,
          netWorthAfter: netWorth.value
        })
      }
      
      // Sell houses scenario
      const houseValue = playerProperties.reduce((sum, p) => 
        sum + (p.houses || 0) * (p.housePrice || 0) * 0.5, 0
      )
      
      if (houseValue > 0) {
        scenarios.push({
          id: 'sell-houses',
          title: 'Sell All Houses',
          description: 'Maintains property ownership',
          outcome: 'neutral',
          cashAfter: cash + houseValue,
          netWorthAfter: netWorth.value - houseValue * 0.5
        })
      }
      
      return scenarios
    })

    // Warning system
    const warningLevel = computed(() => {
      switch (healthStatus.value) {
        case 'critical': return 'critical'
        case 'warning': return 'high'
        case 'caution': return 'medium'
        default: return 'low'
      }
    })

    const warningIcon = computed(() => {
      switch (warningLevel.value) {
        case 'critical': return 'fas fa-exclamation-triangle'
        case 'high': return 'fas fa-exclamation-circle'
        default: return 'fas fa-info-circle'
      }
    })

    const warningMessage = computed(() => {
      const cash = props.currentPlayer.money || 0
      switch (warningLevel.value) {
        case 'critical': return `Critical: Only $${cash} remaining!`
        case 'high': return `Warning: Low cash ($${cash})`
        default: return `Caution: Monitor cash flow`
      }
    })

    // Methods
    const closeModal = () => {
      showPreventionModal.value = false
    }

    const dismissWarnings = () => {
      warningsDismissed.value = true
      showPreventionModal.value = false
      showFloatingWarning.value = false
    }

    const dismissFloatingWarning = () => {
      showFloatingWarning.value = false
    }

    const executeSuggestion = (action) => {
      emit('execute-suggestion', action)
      
      switch (action.id) {
        case 'open-property-manager':
          openPropertyManager()
          break
        case 'open-liquidation':
          openAssetLiquidation()
          break
      }
    }

    const openPropertyManager = () => {
      emit('open-property-manager')
      closeModal()
    }

    const openAssetLiquidation = () => {
      emit('open-asset-liquidation')
      closeModal()
    }

    const openTrading = () => {
      emit('open-trading')
      closeModal()
    }

    const viewRentHistory = () => {
      emit('view-rent-history')
      closeModal()
    }

    const checkFinancialStatus = () => {
      if (!props.enabled || warningsDismissed.value) return
      
      const now = Date.now()
      if (now - lastWarningTime.value < 30000) return // Throttle warnings
      
      if (showWarnings.value && !showFloatingWarning.value) {
        showFloatingWarning.value = true
        lastWarningTime.value = now
      }
    }

    // Watchers
    watch(() => props.currentPlayer, () => {
      checkFinancialStatus()
    }, { deep: true })

    watch(() => props.gameState.currentTurn, () => {
      warningsDismissed.value = false
    })

    // Lifecycle
    onMounted(() => {
      monitoringInterval.value = setInterval(checkFinancialStatus, 10000)
    })

    onUnmounted(() => {
      if (monitoringInterval.value) {
        clearInterval(monitoringInterval.value)
      }
    })

    return {
      showPreventionModal,
      showFloatingWarning,
      totalAssets,
      liquidAssets,
      netWorth,
      healthStatus,
      healthIcon,
      healthMessage,
      healthDetails,
      showHealthIndicator,
      showWarnings,
      riskFactors,
      suggestions,
      scenarios,
      warningLevel,
      warningIcon,
      warningMessage,
      closeModal,
      dismissWarnings,
      dismissFloatingWarning,
      executeSuggestion,
      openPropertyManager,
      openAssetLiquidation,
      openTrading,
      viewRentHistory
    }
  }
}
</script>

<style scoped>
.bankruptcy-prevention {
  position: relative;
}

/* Financial Health Indicator */
.financial-health-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.financial-health-indicator.healthy {
  background: #e8f5e8;
  border: 1px solid #4caf50;
  color: #2e7d32;
}

.financial-health-indicator.caution {
  background: #fff8e1;
  border: 1px solid #ff9800;
  color: #f57c00;
}

.financial-health-indicator.warning {
  background: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
}

.financial-health-indicator.critical {
  background: #ffebee;
  border: 2px solid #d32f2f;
  color: #b71c1c;
  animation: pulse 2s infinite;
}

.health-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.health-info {
  flex: 1;
}

.health-status {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.health-details {
  font-size: 14px;
  opacity: 0.8;
}

.view-suggestions-btn {
  background: currentColor;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* Prevention Modal */
.prevention-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.prevention-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Financial Overview */
.financial-overview {
  margin-bottom: 32px;
}

.financial-overview h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.status-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.status-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.status-item .value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* Risk Analysis */
.risk-analysis {
  margin-bottom: 32px;
}

.risk-analysis h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.risk-factors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-factor {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.risk-factor.high {
  background: #ffebee;
  border-left-color: #f44336;
}

.risk-factor.medium {
  background: #fff8e1;
  border-left-color: #ff9800;
}

.risk-factor.low {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.risk-icon {
  font-size: 20px;
  color: inherit;
  flex-shrink: 0;
}

.risk-content {
  flex: 1;
}

.risk-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.risk-description {
  font-size: 14px;
  opacity: 0.8;
}

/* Suggestions */
.suggestions {
  margin-bottom: 32px;
}

.suggestions h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.suggestion-title {
  font-weight: 600;
  color: #333;
}

.suggestion-impact {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.suggestion-impact.positive {
  background: #e8f5e8;
  color: #2e7d32;
}

.suggestion-impact.neutral {
  background: #e3f2fd;
  color: #1976d2;
}

.suggestion-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.action-btn.primary {
  background: #2196f3;
  color: white;
}

.action-btn.warning {
  background: #ff9800;
  color: white;
}

.action-btn:hover {
  opacity: 0.9;
}

/* Scenario Analysis */
.scenario-analysis {
  margin-bottom: 32px;
}

.scenario-analysis h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.scenarios {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scenario-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.scenario-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.scenario-result {
  font-size: 14px;
  margin-bottom: 8px;
}

.scenario-result.positive {
  color: #2e7d32;
}

.scenario-result.neutral {
  color: #1976d2;
}

.scenario-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

/* Quick Actions */
.quick-actions h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.quick-action-btn.property {
  border-color: #4caf50;
  color: #2e7d32;
}

.quick-action-btn.liquidate {
  border-color: #ff9800;
  color: #f57c00;
}

.quick-action-btn.trade {
  border-color: #2196f3;
  color: #1976d2;
}

.quick-action-btn.history {
  border-color: #9c27b0;
  color: #7b1fa2;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.dismiss-btn {
  background: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn-footer {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Floating Warning */
.floating-warning {
  position: fixed;
  top: 100px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
  max-width: 300px;
  animation: slideIn 0.3s ease;
}

.floating-warning.critical {
  border-left: 4px solid #d32f2f;
  animation: slideIn 0.3s ease, shake 1s infinite;
}

.floating-warning.high {
  border-left: 4px solid #f44336;
}

.floating-warning.medium {
  border-left: 4px solid #ff9800;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.warning-content i {
  font-size: 18px;
  color: inherit;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.expand-btn,
.dismiss-floating-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  flex-shrink: 0;
}

.expand-btn:hover,
.dismiss-floating-btn:hover {
  background: #f0f0f0;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* Responsive */
@media (max-width: 768px) {
  .prevention-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .floating-warning {
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>