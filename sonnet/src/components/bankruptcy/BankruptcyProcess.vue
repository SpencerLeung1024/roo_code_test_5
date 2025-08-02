<template>
  <div class="bankruptcy-process-overlay" v-if="showProcess">
    <div class="bankruptcy-process-modal">
      <div class="process-header">
        <h3>💀 Bankruptcy Process</h3>
        <div class="process-info">
          <span class="player-name">{{ playerName }}</span>
          <span class="debt-amount">Debt: ${{ process.debtAmount.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Process Steps -->
      <div class="process-steps">
        <div class="steps-progress">
          <div 
            v-for="(step, index) in bankruptcySteps" 
            :key="step.id"
            class="step"
            :class="{ 
              active: currentStep >= index,
              complete: currentStep > index,
              current: currentStep === index
            }"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>
      </div>

      <!-- Current Step Content -->
      <div class="step-content">
        <!-- Step 1: Asset Assessment -->
        <div v-if="currentStep === 0" class="asset-assessment">
          <h4>📊 Asset Assessment</h4>
          <div class="assessment-grid">
            <div class="assessment-item">
              <span class="label">Current Cash:</span>
              <span class="value">${{ process.playerAssets.cash.toLocaleString() }}</span>
            </div>
            <div class="assessment-item">
              <span class="label">Total Net Worth:</span>
              <span class="value">${{ process.playerAssets.totalNetWorth.toLocaleString() }}</span>
            </div>
            <div class="assessment-item">
              <span class="label">Liquid Assets:</span>
              <span class="value">${{ process.playerAssets.liquidAssets.toLocaleString() }}</span>
            </div>
            <div class="assessment-item">
              <span class="label">Outstanding Debt:</span>
              <span class="value negative">${{ process.debtAmount.toLocaleString() }}</span>
            </div>
            <div class="assessment-item">
              <span class="label">Shortfall:</span>
              <span class="value negative">
                ${{ Math.max(0, process.debtAmount - process.playerAssets.liquidAssets).toLocaleString() }}
              </span>
            </div>
          </div>
          
          <div class="assessment-conclusion">
            <div v-if="canCoverDebt" class="sufficient-assets">
              ✅ Player has sufficient assets to cover debt through liquidation
            </div>
            <div v-else class="insufficient-assets">
              ❌ Player cannot cover debt even with full asset liquidation
            </div>
          </div>
        </div>

        <!-- Step 2: Forced Liquidation -->
        <div v-if="currentStep === 1" class="forced-liquidation">
          <h4>🏠 Forced Asset Liquidation</h4>
          <AssetLiquidationForced
            :player-id="process.playerId"
            :required-amount="process.debtAmount"
            :liquidation-options="liquidationOptions"
            :game-state="gameState"
            :force-optimal="true"
            @liquidation-completed="handleLiquidationCompleted"
            @liquidation-failed="handleLiquidationFailed"
          />
        </div>

        <!-- Step 3: Asset Transfer -->
        <div v-if="currentStep === 2" class="asset-transfer">
          <h4>🔄 Asset Transfer to Creditor</h4>
          <PropertyTransfer
            :from-player-id="process.playerId"
            :to-player-id="process.creditorId"
            :transfer-all="true"
            :transfer-reason="'bankruptcy'"
            :game-state="gameState"
            @transfer-completed="handleTransferCompleted"
            @transfer-failed="handleTransferFailed"
          />
        </div>

        <!-- Step 4: Player Elimination -->
        <div v-if="currentStep === 3" class="player-elimination">
          <h4>💀 Player Elimination</h4>
          <div class="elimination-summary">
            <div class="elimination-info">
              <div class="info-row">
                <span class="info-label">Player Eliminated:</span>
                <span class="info-value">{{ playerName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Debt:</span>
                <span class="info-value">${{ process.debtAmount.toLocaleString() }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Assets Liquidated:</span>
                <span class="info-value">${{ liquidationTotal.toLocaleString() }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Remaining Debt:</span>
                <span class="info-value">
                  ${{ Math.max(0, process.debtAmount - liquidationTotal).toLocaleString() }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Properties Transferred:</span>
                <span class="info-value">{{ transferredProperties.length }}</span>
              </div>
            </div>

            <div class="game-impact">
              <h5>🎮 Game Impact</h5>
              <div class="impact-item">
                <span class="impact-icon">👥</span>
                <span class="impact-text">{{ remainingActivePlayers }} players remaining</span>
              </div>
              <div class="impact-item">
                <span class="impact-icon">🏠</span>
                <span class="impact-text">{{ transferredProperties.length }} properties redistributed</span>
              </div>
              <div v-if="gameWillEnd" class="impact-item">
                <span class="impact-icon">🏆</span>
                <span class="impact-text">Game will end - winner determined!</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Complete -->
        <div v-if="currentStep === 4" class="process-complete">
          <h4>✅ Bankruptcy Process Complete</h4>
          <div class="completion-summary">
            <div class="completion-icon">🎯</div>
            <div class="completion-text">
              <p>{{ playerName }} has been eliminated from the game due to bankruptcy.</p>
              <p v-if="gameWillEnd">
                The game will now end as only one player remains!
              </p>
              <p v-else>
                The game continues with {{ remainingActivePlayers }} players.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Process Actions -->
      <div class="process-actions">
        <button 
          v-if="currentStep < 4"
          @click="proceedToNextStep"
          class="action-btn proceed-btn"
          :disabled="!canProceed || isProcessing"
        >
          <span class="btn-icon">▶️</span>
          {{ getNextStepButtonText() }}
        </button>

        <button 
          v-if="currentStep === 4"
          @click="completeProcess"
          class="action-btn complete-btn"
        >
          <span class="btn-icon">✅</span>
          Complete Bankruptcy Process
        </button>

        <button 
          v-if="allowCancel && currentStep < 3"
          @click="cancelProcess"
          class="action-btn cancel-btn"
          :disabled="isProcessing"
        >
          <span class="btn-icon">❌</span>
          Cancel Process
        </button>
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-animation">
          <div class="processing-spinner">⚙️</div>
          <div class="processing-text">{{ processingMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import AssetLiquidationForced from './AssetLiquidationForced.vue'
import PropertyTransfer from './PropertyTransfer.vue'

export default {
  name: 'BankruptcyProcess',

  components: {
    AssetLiquidationForced,
    PropertyTransfer
  },

  props: {
    process: {
      type: Object,
      required: true
    },
    gameState: {
      type: Object,
      required: true
    },
    allowCancel: {
      type: Boolean,
      default: false
    },
    autoAdvance: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'bankruptcy-completed',
    'bankruptcy-cancelled',
    'asset-transfer-complete',
    'step-completed'
  ],

  setup(props, { emit }) {
    const showProcess = ref(true)
    const currentStep = ref(0)
    const isProcessing = ref(false)
    const processingMessage = ref('')
    const liquidationTotal = ref(0)
    const transferredProperties = ref([])
    const canProceed = ref(true)

    const bankruptcySteps = [
      { id: 'assessment', label: 'Asset Assessment', icon: '📊' },
      { id: 'liquidation', label: 'Forced Liquidation', icon: '🏠' },
      { id: 'transfer', label: 'Asset Transfer', icon: '🔄' },
      { id: 'elimination', label: 'Player Elimination', icon: '💀' },
      { id: 'complete', label: 'Process Complete', icon: '✅' }
    ]

    // Computed properties
    const player = computed(() => {
      return props.gameState.players?.find(p => p.id === props.process.playerId)
    })

    const playerName = computed(() => {
      return player.value?.name || 'Unknown Player'
    })

    const creditor = computed(() => {
      if (!props.process.creditorId) return null
      return props.gameState.players?.find(p => p.id === props.process.creditorId)
    })

    const canCoverDebt = computed(() => {
      return props.process.playerAssets.liquidAssets >= props.process.debtAmount
    })

    const liquidationOptions = computed(() => {
      // Generate liquidation options for the AssetLiquidationForced component
      const options = []

      if (player.value) {
        // Add houses and hotels for liquidation
        player.value.properties?.forEach(propId => {
          const property = props.gameState.properties?.[propId]
          if (property) {
            if (property.houses > 0) {
              for (let i = 0; i < property.houses; i++) {
                options.push({
                  type: 'house',
                  propertyId: propId,
                  propertyName: property.name,
                  value: Math.floor((property.houseCost || 0) / 2)
                })
              }
            }
            if (property.hasHotel) {
              options.push({
                type: 'hotel',
                propertyId: propId,
                propertyName: property.name,
                value: Math.floor((property.houseCost || 0) / 2)
              })
            }
            if (!property.isMortgaged) {
              options.push({
                type: 'mortgage',
                propertyId: propId,
                propertyName: property.name,
                value: property.mortgageValue || Math.floor((property.price || 0) / 2)
              })
            }
          }
        })

        // Add railroads for mortgage
        player.value.railroads?.forEach(railId => {
          const railroad = props.gameState.railroads?.[railId]
          if (railroad && !railroad.isMortgaged) {
            options.push({
              type: 'mortgage',
              propertyId: railId,
              propertyName: railroad.name,
              value: railroad.mortgageValue || 100
            })
          }
        })

        // Add utilities for mortgage
        player.value.utilities?.forEach(utilId => {
          const utility = props.gameState.utilities?.[utilId]
          if (utility && !utility.isMortgaged) {
            options.push({
              type: 'mortgage',
              propertyId: utilId,
              propertyName: utility.name,
              value: utility.mortgageValue || 75
            })
          }
        })
      }

      return { options }
    })

    const remainingActivePlayers = computed(() => {
      return props.gameState.players?.filter(p => p.isActive && !p.isBankrupt && p.id !== props.process.playerId).length || 0
    })

    const gameWillEnd = computed(() => {
      return remainingActivePlayers.value <= 1
    })

    // Methods
    const proceedToNextStep = async () => {
      if (currentStep.value >= bankruptcySteps.length - 1) return

      isProcessing.value = true
      processingMessage.value = `Processing ${bankruptcySteps[currentStep.value + 1].label}...`

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        currentStep.value++
        emit('step-completed', {
          processId: props.process.id,
          step: bankruptcySteps[currentStep.value - 1].id,
          stepIndex: currentStep.value - 1
        })

        // Auto-advance certain steps if enabled
        if (props.autoAdvance && (currentStep.value === 3 || currentStep.value === 4)) {
          setTimeout(() => {
            if (currentStep.value === 3) {
              proceedToNextStep()
            }
          }, 2000)
        }

      } catch (error) {
        console.error('Error proceeding to next step:', error)
      } finally {
        isProcessing.value = false
        processingMessage.value = ''
      }
    }

    const handleLiquidationCompleted = (data) => {
      liquidationTotal.value = data.totalRaised || 0
      canProceed.value = true
      
      if (props.autoAdvance) {
        setTimeout(() => proceedToNextStep(), 1500)
      }
    }

    const handleLiquidationFailed = (error) => {
      console.error('Liquidation failed:', error)
      liquidationTotal.value = 0
      canProceed.value = true // Still proceed with what was liquidated
    }

    const handleTransferCompleted = (data) => {
      transferredProperties.value = data.transferredAssets || []
      canProceed.value = true

      emit('asset-transfer-complete', {
        processId: props.process.id,
        fromPlayerId: props.process.playerId,
        toPlayerId: props.process.creditorId,
        transferredAssets: transferredProperties.value
      })

      if (props.autoAdvance) {
        setTimeout(() => proceedToNextStep(), 1500)
      }
    }

    const handleTransferFailed = (error) => {
      console.error('Transfer failed:', error)
      canProceed.value = true // Still proceed even if transfer fails
    }

    const completeProcess = () => {
      emit('bankruptcy-completed', {
        processId: props.process.id,
        playerId: props.process.playerId,
        debtAmount: props.process.debtAmount,
        liquidationTotal: liquidationTotal.value,
        transferredProperties: transferredProperties.value,
        gameWillEnd: gameWillEnd.value,
        remainingPlayers: remainingActivePlayers.value
      })

      showProcess.value = false
    }

    const cancelProcess = () => {
      emit('bankruptcy-cancelled', {
        processId: props.process.id,
        playerId: props.process.playerId,
        step: bankruptcySteps[currentStep.value].id
      })

      showProcess.value = false
    }

    const getNextStepButtonText = () => {
      const nextStep = bankruptcySteps[currentStep.value + 1]
      return nextStep ? `Proceed to ${nextStep.label}` : 'Complete Process'
    }

    // Initialize first step
    if (props.autoAdvance) {
      setTimeout(() => {
        if (currentStep.value === 0) {
          proceedToNextStep()
        }
      }, 3000) // Give time to review assessment
    }

    return {
      // Reactive state
      showProcess,
      currentStep,
      isProcessing,
      processingMessage,
      liquidationTotal,
      transferredProperties,
      canProceed,
      bankruptcySteps,

      // Computed
      player,
      playerName,
      creditor,
      canCoverDebt,
      liquidationOptions,
      remainingActivePlayers,
      gameWillEnd,

      // Methods
      proceedToNextStep,
      handleLiquidationCompleted,
      handleLiquidationFailed,
      handleTransferCompleted,
      handleTransferFailed,
      completeProcess,
      cancelProcess,
      getNextStepButtonText
    }
  }
}
</script>

<style scoped>
.bankruptcy-process-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2600;
  backdrop-filter: blur(8px);
}

.bankruptcy-process-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  max-width: 1000px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  border: 4px solid #e74c3c;
}

.process-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 24px;
  border-radius: 20px 20px 0 0;
  text-align: center;
}

.process-header h3 {
  margin: 0 0 16px 0;
  font-size: 2.2rem;
  font-weight: bold;
}

.process-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  border-radius: 12px;
}

.player-name {
  font-size: 1.3rem;
  font-weight: bold;
}

.debt-amount {
  font-size: 1.2rem;
  color: #ffecdb;
}

/* Process Steps */
.process-steps {
  padding: 24px;
  background: #f8f9fa;
  border-bottom: 2px solid #ecf0f1;
}

.steps-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  opacity: 0.4;
  transition: all 0.5s ease;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 25px;
  left: 60%;
  width: 80%;
  height: 4px;
  background: #ecf0f1;
  transition: all 0.5s ease;
}

.step.active {
  opacity: 1;
}

.step.active:not(:last-child)::after {
  background: #27ae60;
}

.step.current {
  transform: scale(1.1);
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 3px solid #bdc3c7;
  transition: all 0.5s ease;
}

.step.active .step-icon {
  background: #27ae60;
  border-color: #229954;
  color: white;
}

.step.current .step-icon {
  background: #3498db;
  border-color: #2980b9;
  animation: pulse 1s ease-in-out infinite;
}

.step-label {
  font-size: 0.9rem;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Step Content */
.step-content {
  padding: 32px;
  min-height: 400px;
}

.step-content h4 {
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  text-align: center;
}

/* Asset Assessment */
.assessment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.assessment-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.assessment-item .label {
  font-weight: bold;
  color: #2c3e50;
}

.assessment-item .value {
  font-weight: bold;
  color: #27ae60;
}

.assessment-item .value.negative {
  color: #e74c3c;
}

.assessment-conclusion {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
}

.sufficient-assets {
  background: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.insufficient-assets {
  background: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

/* Player Elimination */
.elimination-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.elimination-info {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #e74c3c;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ecf0f1;
}

.info-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.info-label {
  color: #7f8c8d;
  font-weight: bold;
}

.info-value {
  color: #2c3e50;
  font-weight: bold;
}

.game-impact {
  background: #fff9e6;
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #f39c12;
}

.game-impact h5 {
  margin: 0 0 16px 0;
  color: #e67e22;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.impact-icon {
  font-size: 1.3rem;
  min-width: 24px;
}

.impact-text {
  color: #2c3e50;
  font-weight: bold;
}

/* Process Complete */
.process-complete {
  text-align: center;
  padding: 40px 20px;
}

.completion-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.completion-icon {
  font-size: 4rem;
  animation: celebration 2s ease-in-out infinite;
}

@keyframes celebration {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

.completion-text {
  max-width: 600px;
}

.completion-text p {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
}

/* Process Actions */
.process-actions {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 0 0 20px 20px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.proceed-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.proceed-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.complete-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

.cancel-btn {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Processing Overlay */
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.processing-animation {
  text-align: center;
}

.processing-spinner {
  font-size: 3rem;
  animation: spin 2s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .bankruptcy-process-modal {
    width: 98%;
    margin: 10px;
  }

  .process-header {
    padding: 20px;
  }

  .process-header h3 {
    font-size: 1.8rem;
  }

  .process-info {
    flex-direction: column;
    gap: 8px;
  }

  .steps-progress {
    flex-direction: column;
    gap: 16px;
  }

  .step::after {
    display: none;
  }

  .assessment-grid {
    grid-template-columns: 1fr;
  }

  .elimination-summary {
    grid-template-columns: 1fr;
  }

  .process-actions {
    flex-direction: column;
  }
}
</style>