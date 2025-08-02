<template>
  <div class="jail-turn">
    <div class="turn-header">
      <h4>Your Turn in Jail</h4>
      <div class="turn-phase-indicator" :class="turnPhase">
        {{ phaseDisplayName }}
      </div>
    </div>

    <!-- Turn Instructions -->
    <div class="turn-instructions">
      <div class="instruction-text">
        {{ getInstructionText() }}
      </div>
      <div class="turn-options-summary">
        Available options: {{ availableOptionsText }}
      </div>
    </div>

    <!-- Jail Turn Actions -->
    <div class="jail-turn-actions">
      <!-- Rolling Phase - Player can choose action before rolling -->
      <div v-if="turnPhase === 'rolling'" class="rolling-phase">
        <div class="pre-roll-options">
          <h5>Choose your action:</h5>
          
          <!-- Pay Fine Option -->
          <div class="action-option" :class="{ 'available': canPayFine }">
            <button 
              class="action-btn pay-fine" 
              :disabled="!canPayFine"
              @click="selectPayFine"
            >
              <span class="action-icon">💸</span>
              <span class="action-text">Pay $50 Fine</span>
              <span class="action-status">{{ canPayFine ? 'Available' : 'Need more money' }}</span>
            </button>
          </div>

          <!-- Use Jail Card Option -->
          <div class="action-option" :class="{ 'available': canUseCard }">
            <button 
              class="action-btn use-card" 
              :disabled="!canUseCard"
              @click="selectUseCard"
            >
              <span class="action-icon">🎫</span>
              <span class="action-text">Use Get Out of Jail Free Card</span>
              <span class="action-status">{{ canUseCard ? 'Available' : 'No cards' }}</span>
            </button>
          </div>

          <!-- Roll for Doubles Option -->
          <div class="action-option available">
            <button 
              class="action-btn roll-doubles" 
              :disabled="isRolling"
              @click="selectRollDoubles"
            >
              <span class="action-icon">🎲</span>
              <span class="action-text">Roll for Doubles</span>
              <span class="action-status">Free attempt ({{ remainingAttempts }} left)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Rolling Animation -->
      <div v-if="isRolling" class="rolling-animation">
        <div class="dice-rolling">
          <div class="rolling-dice">
            <div class="die rolling">🎲</div>
            <div class="die rolling">🎲</div>
          </div>
          <div class="rolling-text">Rolling for doubles...</div>
        </div>
      </div>

      <!-- Roll Result -->
      <div v-if="rollResult && !isRolling" class="roll-result">
        <div class="dice-result">
          <div class="die-display">
            <div class="die">{{ rollResult.die1 }}</div>
            <div class="die">{{ rollResult.die2 }}</div>
          </div>
          <div class="roll-total">Total: {{ rollResult.total }}</div>
        </div>

        <div class="result-outcome" :class="rollResult.isDoubles ? 'success' : 'failure'">
          <div class="outcome-icon">
            {{ rollResult.isDoubles ? '🎉' : '😞' }}
          </div>
          <div class="outcome-text">
            {{ rollResult.isDoubles ? 'DOUBLES! You are free!' : 'No doubles - stay in jail' }}
          </div>
        </div>

        <div class="result-actions">
          <button v-if="rollResult.isDoubles" class="btn primary" @click="exitJail">
            Exit Jail & Continue Turn
          </button>
          <button v-else class="btn secondary" @click="endTurn">
            End Turn
          </button>
        </div>
      </div>

      <!-- Forced Exit (After 3 Turns) -->
      <div v-if="mustPayAndExit" class="forced-exit">
        <div class="forced-notice">
          <div class="notice-icon">⚖️</div>
          <div class="notice-text">
            <strong>Mandatory Release</strong><br>
            You have served 3 turns in jail and must be released.
          </div>
        </div>

        <div class="forced-payment">
          <div class="payment-info">
            <span class="payment-label">Required Payment:</span>
            <span class="payment-amount">$50</span>
          </div>
          <div class="payment-status" :class="canPayFine ? 'sufficient' : 'insufficient'">
            {{ canPayFine ? 'You can afford this' : 'Insufficient funds - must liquidate assets' }}
          </div>
        </div>

        <div class="forced-actions">
          <button 
            class="btn primary" 
            :disabled="!canPayFine"
            @click="forcedPayAndExit"
          >
            Pay $50 & Exit Jail
          </button>
          <button 
            v-if="!canPayFine" 
            class="btn secondary"
            @click="handleInsufficientFunds"
          >
            Liquidate Assets
          </button>
        </div>
      </div>
    </div>

    <!-- Turn Summary -->
    <div class="turn-summary">
      <div class="summary-item">
        <span class="summary-label">Jail Turns Remaining:</span>
        <span class="summary-value">{{ remainingTurns }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Roll Attempts Left:</span>
        <span class="summary-value">{{ remainingAttempts }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Your Money:</span>
        <span class="summary-value">${{ player.money?.toLocaleString() || 0 }}</span>
      </div>
      <div class="summary-item" v-if="player.getOutOfJailCards > 0">
        <span class="summary-label">Jail Cards:</span>
        <span class="summary-value">{{ player.getOutOfJailCards }}</span>
      </div>
    </div>

    <!-- Help Text -->
    <div class="jail-help">
      <details>
        <summary>How to get out of jail</summary>
        <div class="help-content">
          <ul>
            <li><strong>Pay $50:</strong> Immediate release, can roll and move normally</li>
            <li><strong>Use jail card:</strong> Free release, can roll and move normally</li>
            <li><strong>Roll doubles:</strong> Free release if successful, move with that roll</li>
            <li><strong>Serve time:</strong> After 3 turns, must pay $50 and roll</li>
          </ul>
          <p><strong>Note:</strong> You can still collect rent, trade, and manage properties while in jail.</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'JailTurn',
  
  props: {
    player: {
      type: Object,
      required: true
    },
    turnPhase: {
      type: String,
      default: 'rolling'
    },
    dice: {
      type: Object,
      default: () => ({ die1: 1, die2: 1, total: 2, isDoubles: false })
    },
    canRoll: {
      type: Boolean,
      default: true
    },
    canPayFine: {
      type: Boolean,
      default: false
    },
    canUseCard: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'pay-fine',
    'use-jail-card', 
    'roll-for-doubles',
    'end-turn',
    'exit-jail',
    'handle-insufficient-funds'
  ],

  setup(props, { emit }) {
    const isRolling = ref(false)
    const rollResult = ref(null)
    const selectedAction = ref(null)

    // Computed properties
    const phaseDisplayName = computed(() => {
      const phases = {
        'rolling': 'Choose Action',
        'moving': 'Rolling Dice',
        'action': 'Take Action'
      }
      return phases[props.turnPhase] || props.turnPhase
    })

    const remainingTurns = computed(() => {
      return Math.max(0, props.player?.jailTurns || 0)
    })

    const remainingAttempts = computed(() => {
      return Math.max(0, remainingTurns.value)
    })

    const mustPayAndExit = computed(() => {
      return remainingTurns.value <= 0 && props.player?.isInJail
    })

    const availableOptionsText = computed(() => {
      const options = []
      if (props.canPayFine) options.push('Pay fine')
      if (props.canUseCard) options.push('Use card')
      if (props.canRoll) options.push('Roll dice')
      if (mustPayAndExit.value) options.push('Mandatory release')
      
      return options.length > 0 ? options.join(', ') : 'None available'
    })

    // Methods
    const getInstructionText = () => {
      if (mustPayAndExit.value) {
        return 'You have served the maximum 3 turns in jail and must be released by paying the $50 fine.'
      }
      
      if (props.turnPhase === 'rolling') {
        return 'Choose how you want to attempt to get out of jail this turn.'
      }
      
      if (isRolling.value) {
        return 'Rolling dice to try for doubles...'
      }
      
      if (rollResult.value) {
        return rollResult.value.isDoubles ? 
          'Congratulations! You rolled doubles and are free to leave jail.' :
          'No doubles this time. Your turn ends and you remain in jail.'
      }
      
      return 'It\'s your turn in jail. Choose your action.'
    }

    const selectPayFine = () => {
      selectedAction.value = 'pay-fine'
      emit('pay-fine')
    }

    const selectUseCard = () => {
      selectedAction.value = 'use-card'
      emit('use-jail-card')
    }

    const selectRollDoubles = () => {
      selectedAction.value = 'roll-doubles'
      rollForDoubles()
    }

    const rollForDoubles = async () => {
      isRolling.value = true
      rollResult.value = null
      
      // Simulate dice roll animation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Use actual dice result from props or simulate
      rollResult.value = {
        die1: props.dice.die1,
        die2: props.dice.die2,
        total: props.dice.total,
        isDoubles: props.dice.isDoubles
      }
      
      isRolling.value = false
      
      // Emit the roll event
      emit('roll-for-doubles', rollResult.value)
    }

    const exitJail = () => {
      emit('exit-jail', { 
        method: selectedAction.value,
        rollResult: rollResult.value 
      })
    }

    const endTurn = () => {
      emit('end-turn')
      rollResult.value = null
      selectedAction.value = null
    }

    const forcedPayAndExit = () => {
      selectedAction.value = 'forced-exit'
      emit('pay-fine')
    }

    const handleInsufficientFunds = () => {
      emit('handle-insufficient-funds', { 
        amount: 50,
        reason: 'jail-fine' 
      })
    }

    return {
      isRolling,
      rollResult,
      selectedAction,
      phaseDisplayName,
      remainingTurns,
      remainingAttempts,
      mustPayAndExit,
      availableOptionsText,
      getInstructionText,
      selectPayFine,
      selectUseCard,
      selectRollDoubles,
      rollForDoubles,
      exitJail,
      endTurn,
      forcedPayAndExit,
      handleInsufficientFunds
    }
  }
}
</script>

<style scoped>
.jail-turn {
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.turn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.turn-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.turn-phase-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.turn-phase-indicator.rolling {
  background: #e74c3c;
  color: white;
}

.turn-phase-indicator.moving {
  background: #3498db;
  color: white;
}

.turn-phase-indicator.action {
  background: #27ae60;
  color: white;
}

.turn-instructions {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.instruction-text {
  font-size: 0.9rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.turn-options-summary {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.jail-turn-actions {
  margin-bottom: 1rem;
}

.pre-roll-options h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.action-option {
  margin-bottom: 0.75rem;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-option.available .action-btn {
  border-color: #28a745;
  background: #d4edda;
}

.action-option.available .action-btn:hover:not(:disabled) {
  border-color: #1e7e34;
  background: #c3e6cb;
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.action-text {
  flex: 1;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
}

.action-status {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.action-option.available .action-status {
  color: #155724;
}

/* Rolling Animation */
.rolling-animation {
  text-align: center;
  padding: 2rem;
}

.rolling-dice {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.die {
  width: 60px;
  height: 60px;
  background: white;
  border: 3px solid #2c3e50;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.die.rolling {
  animation: diceRoll 0.5s infinite;
}

@keyframes diceRoll {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
}

.rolling-text {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
}

/* Roll Result */
.roll-result {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.dice-result {
  margin-bottom: 1rem;
}

.die-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.roll-total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.result-outcome {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 6px;
}

.result-outcome.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.result-outcome.failure {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.outcome-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.outcome-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.result-outcome.success .outcome-text {
  color: #155724;
}

.result-outcome.failure .outcome-text {
  color: #721c24;
}

/* Forced Exit */
.forced-exit {
  padding: 1rem;
  background: #fff3cd;
  border: 2px solid #ffeaa7;
  border-radius: 8px;
}

.forced-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notice-icon {
  font-size: 2rem;
  color: #856404;
}

.notice-text {
  flex: 1;
  color: #856404;
  line-height: 1.4;
}

.forced-payment {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.payment-label {
  font-weight: 500;
  color: #2c3e50;
}

.payment-amount {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.payment-status {
  font-size: 0.9rem;
  font-weight: 500;
}

.payment-status.sufficient {
  color: #28a745;
}

.payment-status.insufficient {
  color: #dc3545;
}

.forced-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
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

/* Turn Summary */
.turn-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.summary-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Help Section */
.jail-help {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.jail-help details {
  cursor: pointer;
}

.jail-help summary {
  font-weight: 600;
  color: #007bff;
  padding: 0.5rem 0;
}

.help-content {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.help-content ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.help-content li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.help-content p {
  margin: 0;
  font-style: italic;
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .turn-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .die-display {
    gap: 0.5rem;
  }
  
  .die {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .forced-actions {
    flex-direction: column;
  }
  
  .turn-summary {
    grid-template-columns: 1fr;
  }
}
</style>