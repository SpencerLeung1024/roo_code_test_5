<template>
  <div class="jail-status">
    <div class="status-header">
      <h4>Jail Status</h4>
      <div class="status-badge" :class="jailStatusClass">
        {{ jailStatusText }}
      </div>
    </div>

    <div class="status-content">
      <!-- Turns Remaining -->
      <div class="status-item turns-remaining">
        <div class="status-icon">⏱️</div>
        <div class="status-info">
          <span class="status-label">Turns Remaining</span>
          <span class="status-value" :class="{ 'warning': turnsRemaining <= 1 }">
            {{ turnsRemaining }} turn{{ turnsRemaining !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- Get Out of Jail Cards -->
      <div class="status-item jail-cards" v-if="getOutCards > 0">
        <div class="status-icon">🎫</div>
        <div class="status-info">
          <span class="status-label">Jail Cards</span>
          <span class="status-value">{{ getOutCards }}</span>
        </div>
      </div>

      <!-- Money Available -->
      <div class="status-item money-status">
        <div class="status-icon">💰</div>
        <div class="status-info">
          <span class="status-label">Money</span>
          <span class="status-value" :class="{ 'insufficient': player.money < 50 }">
            ${{ player.money?.toLocaleString() || 0 }}
          </span>
        </div>
      </div>

      <!-- Jail Fine Status -->
      <div class="status-item fine-status">
        <div class="status-icon">💸</div>
        <div class="status-info">
          <span class="status-label">Fine to Pay</span>
          <span class="status-value fine-amount">$50</span>
        </div>
        <div class="fine-affordability" :class="canAffordFine ? 'affordable' : 'unaffordable'">
          {{ canAffordFine ? 'Can afford' : 'Cannot afford' }}
        </div>
      </div>
    </div>

    <!-- Exit Options Summary -->
    <div class="exit-options-summary">
      <h5>Available Exit Options</h5>
      <div class="options-list">
        <div class="option-item" :class="{ 'available': canAffordFine }">
          <span class="option-icon">💸</span>
          <span class="option-text">Pay $50 fine</span>
          <span class="option-status">{{ canAffordFine ? 'Available' : 'Need more money' }}</span>
        </div>
        
        <div class="option-item" :class="{ 'available': getOutCards > 0 }">
          <span class="option-icon">🎫</span>
          <span class="option-text">Use jail card</span>
          <span class="option-status">{{ getOutCards > 0 ? 'Available' : 'No cards' }}</span>
        </div>
        
        <div class="option-item available">
          <span class="option-icon">🎲</span>
          <span class="option-text">Roll for doubles</span>
          <span class="option-status">Always available</span>
        </div>
        
        <div class="option-item" :class="{ 'available': turnsRemaining <= 0 }">
          <span class="option-icon">⚖️</span>
          <span class="option-text">Mandatory release</span>
          <span class="option-status">{{ turnsRemaining <= 0 ? 'Must pay $50' : 'After 3 turns' }}</span>
        </div>
      </div>
    </div>

    <!-- Jail Statistics -->
    <div class="jail-statistics" v-if="jailStatistics">
      <h5>Jail History</h5>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Times in Jail</span>
          <span class="stat-value">{{ jailStatistics.timesInJail }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Turns Served</span>
          <span class="stat-value">{{ jailStatistics.totalTurnsInJail }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Money Paid</span>
          <span class="stat-value">${{ jailStatistics.moneyPaidForJail }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar for Remaining Turns -->
    <div class="turns-progress">
      <div class="progress-label">Jail Time Progress</div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: jailProgressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        {{ 3 - turnsRemaining }} of 3 turns served
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'JailStatus',
  
  props: {
    player: {
      type: Object,
      required: true
    },
    turnsRemaining: {
      type: Number,
      default: 3
    },
    getOutCards: {
      type: Number,
      default: 0
    },
    jailStatistics: {
      type: Object,
      default: () => ({ timesInJail: 0, totalTurnsInJail: 0, moneyPaidForJail: 0 })
    }
  },

  setup(props) {
    // Computed properties
    const canAffordFine = computed(() => {
      return (props.player?.money || 0) >= 50
    })

    const jailStatusClass = computed(() => {
      if (props.turnsRemaining <= 0) return 'mandatory-release'
      if (props.turnsRemaining === 1) return 'last-turn'
      return 'serving-time'
    })

    const jailStatusText = computed(() => {
      if (props.turnsRemaining <= 0) return 'Mandatory Release'
      if (props.turnsRemaining === 1) return 'Last Turn'
      return 'Serving Time'
    })

    const jailProgressPercentage = computed(() => {
      const turnsServed = 3 - props.turnsRemaining
      return Math.max(0, Math.min(100, (turnsServed / 3) * 100))
    })

    return {
      canAffordFine,
      jailStatusClass,
      jailStatusText,
      jailProgressPercentage
    }
  }
}
</script>

<style scoped>
.jail-status {
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.status-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.serving-time {
  background: #ffeaa7;
  color: #d63031;
}

.status-badge.last-turn {
  background: #fab1a0;
  color: #e17055;
}

.status-badge.mandatory-release {
  background: #fd79a8;
  color: #e84393;
}

.status-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.status-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.status-value {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.status-value.warning {
  color: #e74c3c;
}

.status-value.insufficient {
  color: #e74c3c;
}

.fine-affordability {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.fine-affordability.affordable {
  color: #27ae60;
}

.fine-affordability.unaffordable {
  color: #e74c3c;
}

.exit-options-summary {
  margin-bottom: 1rem;
}

.exit-options-summary h5 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.option-item.available {
  opacity: 1;
  border-color: #28a745;
  background: #d4edda;
}

.option-icon {
  font-size: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.option-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.option-status {
  font-size: 0.75rem;
  color: #6c757d;
}

.option-item.available .option-status {
  color: #155724;
  font-weight: 600;
}

.jail-statistics {
  margin-bottom: 1rem;
}

.jail-statistics h5 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.turns-progress {
  text-align: center;
}

.progress-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #27ae60 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .status-content {
    grid-template-columns: 1fr;
  }
  
  .status-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .status-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
  
  .status-info {
    align-items: center;
  }
}
</style>