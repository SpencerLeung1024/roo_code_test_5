<template>
  <div class="jail-exit">
    <div class="exit-header">
      <h4>Exit Options</h4>
      <div v-if="forcedExit" class="forced-exit-notice">
        <span class="notice-icon">⚠️</span>
        <span>Mandatory Release - Must pay fine</span>
      </div>
    </div>

    <div class="exit-options">
      <div 
        v-for="option in availableOptions" 
        :key="option.id"
        class="exit-option"
        :class="{ 
          'available': option.available, 
          'forced': option.forced,
          'selected': selectedOption === option.id 
        }"
        @click="selectOption(option)"
      >
        <div class="option-header">
          <div class="option-icon">{{ getOptionIcon(option.id) }}</div>
          <div class="option-title">{{ option.name }}</div>
          <div class="option-cost" v-if="option.cost > 0">
            ${{ option.cost }}
          </div>
          <div class="option-cost free" v-else>
            FREE
          </div>
        </div>

        <div class="option-description">
          {{ option.description }}
        </div>

        <div class="option-details" v-if="getOptionDetails(option.id)">
          <div class="detail-item" v-for="detail in getOptionDetails(option.id)" :key="detail.label">
            <span class="detail-label">{{ detail.label }}:</span>
            <span class="detail-value" :class="detail.class">{{ detail.value }}</span>
          </div>
        </div>

        <div class="option-actions" v-if="option.available">
          <button 
            class="btn exit-btn" 
            :class="option.forced ? 'primary' : 'secondary'"
            @click.stop="executeOption(option)"
            :disabled="!canExecuteOption(option)"
          >
            {{ getOptionButtonText(option) }}
          </button>
        </div>

        <div class="option-unavailable" v-if="!option.available">
          <span class="unavailable-reason">{{ getUnavailableReason(option.id) }}</span>
        </div>
      </div>
    </div>

    <!-- Exit Confirmation Modal -->
    <div v-if="showConfirmation" class="confirmation-overlay" @click="cancelConfirmation">
      <div class="confirmation-modal" @click.stop>
        <div class="confirmation-header">
          <h3>Confirm Exit from Jail</h3>
        </div>
        
        <div class="confirmation-content">
          <div class="selected-option-summary">
            <div class="summary-icon">{{ getOptionIcon(selectedOption) }}</div>
            <div class="summary-details">
              <div class="summary-title">{{ getSelectedOptionName() }}</div>
              <div class="summary-description">{{ getSelectedOptionDescription() }}</div>
              <div class="summary-cost" v-if="getSelectedOptionCost() > 0">
                Cost: ${{ getSelectedOptionCost() }}
              </div>
            </div>
          </div>

          <div class="confirmation-warning" v-if="hasWarnings()">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <div v-for="warning in getWarnings()" :key="warning">{{ warning }}</div>
            </div>
          </div>
        </div>

        <div class="confirmation-actions">
          <button class="btn secondary" @click="cancelConfirmation">
            Cancel
          </button>
          <button class="btn primary" @click="confirmExit">
            Confirm Exit
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Failure Feedback -->
    <div v-if="exitResult" class="exit-feedback" :class="exitResult.success ? 'success' : 'error'">
      <div class="feedback-icon">
        {{ exitResult.success ? '✅' : '❌' }}
      </div>
      <div class="feedback-message">
        {{ exitResult.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'JailExit',
  
  props: {
    player: {
      type: Object,
      required: true
    },
    availableOptions: {
      type: Array,
      default: () => []
    },
    forcedExit: {
      type: Boolean,
      default: false
    }
  },

  emits: ['exit-option'],

  setup(props, { emit }) {
    const selectedOption = ref(null)
    const showConfirmation = ref(false)
    const exitResult = ref(null)

    // Option icons mapping
    const optionIcons = {
      'pay-fine': '💸',
      'use-card': '🎫',
      'roll-doubles': '🎲',
      'forced-exit': '⚖️'
    }

    // Computed properties
    const hasAnyAvailableOptions = computed(() => {
      return props.availableOptions.some(option => option.available)
    })

    // Methods
    const getOptionIcon = (optionId) => {
      return optionIcons[optionId] || '❓'
    }

    const getOptionDetails = (optionId) => {
      switch (optionId) {
        case 'pay-fine':
          return [
            {
              label: 'Your Money',
              value: `$${props.player?.money?.toLocaleString() || 0}`,
              class: (props.player?.money || 0) >= 50 ? 'sufficient' : 'insufficient'
            },
            {
              label: 'After Payment',
              value: `$${Math.max(0, (props.player?.money || 0) - 50).toLocaleString()}`,
              class: 'neutral'
            }
          ]
        
        case 'use-card':
          return [
            {
              label: 'Jail Cards',
              value: props.player?.getOutOfJailCards || 0,
              class: (props.player?.getOutOfJailCards || 0) > 0 ? 'sufficient' : 'insufficient'
            },
            {
              label: 'After Use',
              value: Math.max(0, (props.player?.getOutOfJailCards || 0) - 1),
              class: 'neutral'
            }
          ]
        
        case 'roll-doubles':
          return [
            {
              label: 'Success Rate',
              value: '16.7% (1 in 6)',
              class: 'neutral'
            },
            {
              label: 'On Failure',
              value: 'Lose turn, stay in jail',
              class: 'warning'
            }
          ]
        
        case 'forced-exit':
          return [
            {
              label: 'Required Payment',
              value: '$50',
              class: 'required'
            },
            {
              label: 'Turns Served',
              value: '3 (Maximum)',
              class: 'neutral'
            }
          ]
        
        default:
          return null
      }
    }

    const getOptionButtonText = (option) => {
      if (option.forced) return 'Pay Fine & Exit'
      
      switch (option.id) {
        case 'pay-fine':
          return 'Pay $50'
        case 'use-card':
          return 'Use Card'
        case 'roll-doubles':
          return 'Roll Dice'
        case 'forced-exit':
          return 'Pay & Exit'
        default:
          return 'Select'
      }
    }

    const getUnavailableReason = (optionId) => {
      switch (optionId) {
        case 'pay-fine':
          return 'Insufficient funds'
        case 'use-card':
          return 'No jail cards available'
        case 'forced-exit':
          return 'Available after 3 turns'
        default:
          return 'Not available'
      }
    }

    const canExecuteOption = (option) => {
      if (!option.available) return false
      
      switch (option.id) {
        case 'pay-fine':
        case 'forced-exit':
          return (props.player?.money || 0) >= option.cost
        case 'use-card':
          return (props.player?.getOutOfJailCards || 0) > 0
        case 'roll-doubles':
          return true
        default:
          return false
      }
    }

    const selectOption = (option) => {
      if (!option.available) return
      selectedOption.value = option.id
    }

    const executeOption = (option) => {
      if (!canExecuteOption(option)) return
      
      selectedOption.value = option.id
      
      // Show confirmation for costly actions
      if (option.cost > 0 || option.id === 'use-card') {
        showConfirmation.value = true
      } else {
        // Execute immediately for free actions like rolling dice
        confirmExit()
      }
    }

    const getSelectedOptionName = () => {
      const option = props.availableOptions.find(opt => opt.id === selectedOption.value)
      return option?.name || ''
    }

    const getSelectedOptionDescription = () => {
      const option = props.availableOptions.find(opt => opt.id === selectedOption.value)
      return option?.description || ''
    }

    const getSelectedOptionCost = () => {
      const option = props.availableOptions.find(opt => opt.id === selectedOption.value)
      return option?.cost || 0
    }

    const hasWarnings = () => {
      return getWarnings().length > 0
    }

    const getWarnings = () => {
      const warnings = []
      const option = props.availableOptions.find(opt => opt.id === selectedOption.value)
      
      if (!option) return warnings
      
      if (option.id === 'pay-fine' || option.id === 'forced-exit') {
        const remainingMoney = (props.player?.money || 0) - option.cost
        if (remainingMoney < 100) {
          warnings.push(`You will have only $${remainingMoney} remaining after payment`)
        }
      }
      
      if (option.id === 'use-card') {
        const remainingCards = (props.player?.getOutOfJailCards || 0) - 1
        if (remainingCards === 0) {
          warnings.push('This is your last "Get Out of Jail Free" card')
        }
      }
      
      if (option.id === 'roll-doubles') {
        warnings.push('Only 16.7% chance of success - you may stay in jail')
      }
      
      return warnings
    }

    const confirmExit = () => {
      const option = props.availableOptions.find(opt => opt.id === selectedOption.value)
      if (!option) return
      
      // Emit the exit option
      emit('exit-option', option)
      
      // Show success feedback
      exitResult.value = {
        success: true,
        message: `Attempting to exit jail using: ${option.name}`
      }
      
      // Clear confirmation modal
      showConfirmation.value = false
      selectedOption.value = null
      
      // Clear feedback after delay
      setTimeout(() => {
        exitResult.value = null
      }, 3000)
    }

    const cancelConfirmation = () => {
      showConfirmation.value = false
      selectedOption.value = null
    }

    return {
      selectedOption,
      showConfirmation,
      exitResult,
      hasAnyAvailableOptions,
      getOptionIcon,
      getOptionDetails,
      getOptionButtonText,
      getUnavailableReason,
      canExecuteOption,
      selectOption,
      executeOption,
      getSelectedOptionName,
      getSelectedOptionDescription,
      getSelectedOptionCost,
      hasWarnings,
      getWarnings,
      confirmExit,
      cancelConfirmation
    }
  }
}
</script>

<style scoped>
.jail-exit {
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.exit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.exit-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.forced-exit-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 0.875rem;
  font-weight: 500;
}

.notice-icon {
  font-size: 1rem;
}

.exit-options {
  display: grid;
  gap: 1rem;
}

.exit-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-option.available {
  border-color: #28a745;
  background: #d4edda;
  cursor: pointer;
}

.exit-option.available:hover {
  border-color: #1e7e34;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.exit-option.forced {
  border-color: #dc3545;
  background: #f8d7da;
  animation: pulse 2s infinite;
}

.exit-option.selected {
  border-color: #007bff;
  background: #cce7ff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.option-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.option-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.option-cost {
  font-size: 1rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.option-cost:not(.free) {
  background: #e74c3c;
  color: white;
}

.option-cost.free {
  background: #27ae60;
  color: white;
}

.option-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.option-details {
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.detail-label {
  color: #6c757d;
}

.detail-value {
  font-weight: 500;
}

.detail-value.sufficient {
  color: #28a745;
}

.detail-value.insufficient {
  color: #dc3545;
}

.detail-value.warning {
  color: #ffc107;
}

.detail-value.required {
  color: #dc3545;
  font-weight: 600;
}

.detail-value.neutral {
  color: #6c757d;
}

.option-actions {
  text-align: center;
}

.exit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-unavailable {
  text-align: center;
  padding: 0.5rem;
  background: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.unavailable-reason {
  font-size: 0.875rem;
  color: #721c24;
  font-weight: 500;
}

/* Confirmation Modal */
.confirmation-overlay {
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
}

.confirmation-modal {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.confirmation-header h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  text-align: center;
}

.selected-option-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.summary-icon {
  font-size: 2rem;
}

.summary-details {
  flex: 1;
}

.summary-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.summary-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.summary-cost {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e74c3c;
}

.confirmation-warning {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1.5rem;
  color: #856404;
}

.warning-text {
  flex: 1;
  color: #856404;
  font-size: 0.875rem;
  line-height: 1.4;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirmation-actions .btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Exit Feedback */
.exit-feedback {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1001;
  min-width: 300px;
}

.exit-feedback.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.exit-feedback.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.feedback-icon {
  font-size: 1.5rem;
}

.feedback-message {
  flex: 1;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .exit-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .option-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .exit-feedback {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 1rem;
  }
}
</style>