<template>
  <div class="bankruptcy-system">
    <!-- Bankruptcy Detection Component - runs in background -->
    <div v-if="activeBankruptcyProcesses.length > 0" class="bankruptcy-processes">
      <div v-for="process in activeBankruptcyProcesses" :key="process.id" class="bankruptcy-process">
        <BankruptcyProcess
          :process="process"
          :game-state="gameState"
          @bankruptcy-completed="handleBankruptcyCompleted"
          @bankruptcy-cancelled="handleBankruptcyCancelled"
          @asset-transfer-complete="handleAssetTransferComplete"
        />
      </div>
    </div>

    <!-- Bankruptcy Prevention Warnings -->
    <BankruptcyPrevention
      v-if="showPreventionWarnings"
      :at-risk-players="atRiskPlayers"
      :game-state="gameState"
      @warning-dismissed="handleWarningDismissed"
      @emergency-liquidation="handleEmergencyLiquidation"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import BankruptcyProcess from './BankruptcyProcess.vue'
import BankruptcyPrevention from './BankruptcyPrevention.vue'

export default {
  name: 'BankruptcySystem',

  components: {
    BankruptcyProcess,
    BankruptcyPrevention
  },

  props: {
    gameState: {
      type: Object,
      required: true
    },
    enablePreventionWarnings: {
      type: Boolean,
      default: true
    },
    bankruptcyThreshold: {
      type: Number,
      default: 0.1 // 10% of average player wealth
    }
  },

  emits: [
    'bankruptcy-initiated',
    'bankruptcy-completed',
    'player-eliminated',
    'game-end-triggered',
    'asset-transfer-completed'
  ],

  setup(props, { emit }) {
    const activeBankruptcyProcesses = ref([])
    const showPreventionWarnings = ref(false)
    const bankruptcyCheckInterval = ref(null)
    
    // Computed properties for bankruptcy detection
    const activePlayers = computed(() => {
      return props.gameState.players?.filter(p => p.isActive && !p.isBankrupt) || []
    })

    const averagePlayerWealth = computed(() => {
      if (activePlayers.value.length === 0) return 0
      
      const totalWealth = activePlayers.value.reduce((sum, player) => {
        return sum + calculatePlayerNetWorth(player)
      }, 0)
      
      return totalWealth / activePlayers.value.length
    })

    const bankruptcyThresholdAmount = computed(() => {
      return averagePlayerWealth.value * props.bankruptcyThreshold
    })

    const atRiskPlayers = computed(() => {
      return activePlayers.value.filter(player => {
        const netWorth = calculatePlayerNetWorth(player)
        const liquidAssets = calculateLiquidAssets(player)
        
        // Player is at risk if their liquid assets are below threshold
        // and they have debt obligations they might not be able to meet
        return liquidAssets < bankruptcyThresholdAmount.value && 
               hasUpcomingDebtObligations(player)
      })
    })

    // Bankruptcy detection methods
    const calculatePlayerNetWorth = (player) => {
      let netWorth = player.money || 0

      // Add property values
      if (player.properties) {
        player.properties.forEach(propId => {
          const property = props.gameState.properties?.[propId]
          if (property) {
            netWorth += property.price || 0
            // Add development value
            netWorth += (property.houses || 0) * (property.houseCost || 0)
            if (property.hasHotel) {
              netWorth += property.houseCost || 0
            }
            // Subtract mortgage debt
            if (property.isMortgaged) {
              netWorth -= property.mortgageValue || 0
            }
          }
        })
      }

      // Add railroad values
      if (player.railroads) {
        player.railroads.forEach(railId => {
          const railroad = props.gameState.railroads?.[railId]
          if (railroad) {
            netWorth += railroad.price || 200
            if (railroad.isMortgaged) {
              netWorth -= railroad.mortgageValue || 100
            }
          }
        })
      }

      // Add utility values
      if (player.utilities) {
        player.utilities.forEach(utilId => {
          const utility = props.gameState.utilities?.[utilId]
          if (utility) {
            netWorth += utility.price || 150
            if (utility.isMortgaged) {
              netWorth -= utility.mortgageValue || 75
            }
          }
        })
      }

      return Math.max(0, netWorth)
    }

    const calculateLiquidAssets = (player) => {
      let liquidValue = player.money || 0

      // Add potential mortgage value of unmortgaged properties
      if (player.properties) {
        player.properties.forEach(propId => {
          const property = props.gameState.properties?.[propId]
          if (property && !property.isMortgaged) {
            liquidValue += property.mortgageValue || Math.floor((property.price || 0) / 2)
          }
        })
      }

      // Add potential sale value of houses/hotels
      if (player.properties) {
        player.properties.forEach(propId => {
          const property = props.gameState.properties?.[propId]
          if (property) {
            // Houses sell for 50% of cost
            liquidValue += (property.houses || 0) * Math.floor((property.houseCost || 0) / 2)
            if (property.hasHotel) {
              liquidValue += Math.floor((property.houseCost || 0) / 2)
            }
          }
        })
      }

      // Add railroad mortgage values
      if (player.railroads) {
        player.railroads.forEach(railId => {
          const railroad = props.gameState.railroads?.[railId]
          if (railroad && !railroad.isMortgaged) {
            liquidValue += railroad.mortgageValue || 100
          }
        })
      }

      // Add utility mortgage values
      if (player.utilities) {
        player.utilities.forEach(utilId => {
          const utility = props.gameState.utilities?.[utilId]
          if (utility && !utility.isMortgaged) {
            liquidValue += utility.mortgageValue || 75
          }
        })
      }

      return liquidValue
    }

    const hasUpcomingDebtObligations = (player) => {
      // This is a simple heuristic - in a real game you'd track upcoming rents
      // For now, we'll consider players at risk if they're on expensive properties
      // or have low cash relative to their position risk
      const currentSpace = props.gameState.board?.[player.position]
      
      if (!currentSpace) return false

      // Check if player is near expensive properties
      const expensiveSpaces = ['Park Place', 'Boardwalk', 'Pennsylvania Avenue']
      
      // Simple risk assessment based on current cash vs average rent
      return player.money < 200 // Less than typical high rent amount
    }

    const checkForBankruptcy = (playerId, debtAmount, creditorId = null) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      if (!player || player.isBankrupt) return null

      const liquidAssets = calculateLiquidAssets(player)
      
      if (liquidAssets < debtAmount) {
        // Player cannot cover the debt even with full liquidation
        return initiateBankruptcyProcess(playerId, debtAmount, creditorId)
      }

      return null
    }

    const initiateBankruptcyProcess = (playerId, debtAmount, creditorId = null) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      if (!player) return null

      const bankruptcyProcess = {
        id: `bankruptcy_${Date.now()}_${playerId}`,
        playerId,
        debtAmount,
        creditorId,
        startTime: new Date(),
        status: 'initiated',
        playerAssets: {
          cash: player.money || 0,
          properties: [...(player.properties || [])],
          railroads: [...(player.railroads || [])],
          utilities: [...(player.utilities || [])],
          totalNetWorth: calculatePlayerNetWorth(player),
          liquidAssets: calculateLiquidAssets(player)
        }
      }

      activeBankruptcyProcesses.value.push(bankruptcyProcess)

      emit('bankruptcy-initiated', {
        process: bankruptcyProcess,
        player,
        insufficient: debtAmount - bankruptcyProcess.playerAssets.liquidAssets
      })

      return bankruptcyProcess
    }

    const handleBankruptcyCompleted = (processData) => {
      const processIndex = activeBankruptcyProcesses.value.findIndex(p => p.id === processData.processId)
      if (processIndex >= 0) {
        activeBankruptcyProcesses.value.splice(processIndex, 1)
      }

      const player = props.gameState.players?.find(p => p.id === processData.playerId)
      if (player) {
        player.isBankrupt = true
        player.isActive = false
        player.money = 0
        player.properties = []
        player.railroads = []
        player.utilities = []
      }

      emit('bankruptcy-completed', processData)
      emit('player-eliminated', {
        playerId: processData.playerId,
        player,
        reason: 'bankruptcy'
      })

      // Check if game should end
      const remainingPlayers = props.gameState.players?.filter(p => p.isActive && !p.isBankrupt) || []
      if (remainingPlayers.length <= 1) {
        emit('game-end-triggered', {
          reason: 'bankruptcy-elimination',
          winner: remainingPlayers[0] || null,
          finalPlayerCount: remainingPlayers.length
        })
      }
    }

    const handleBankruptcyCancelled = (processData) => {
      const processIndex = activeBankruptcyProcesses.value.findIndex(p => p.id === processData.processId)
      if (processIndex >= 0) {
        activeBankruptcyProcesses.value.splice(processIndex, 1)
      }
    }

    const handleAssetTransferComplete = (transferData) => {
      emit('asset-transfer-completed', transferData)
    }

    const handleWarningDismissed = (playerId) => {
      // Remove player from at-risk warnings temporarily
      console.log(`Bankruptcy warning dismissed for player ${playerId}`)
    }

    const handleEmergencyLiquidation = (data) => {
      // Trigger emergency liquidation for at-risk player
      console.log('Emergency liquidation requested:', data)
    }

    // Periodic bankruptcy monitoring
    const startBankruptcyMonitoring = () => {
      bankruptcyCheckInterval.value = setInterval(() => {
        if (props.enablePreventionWarnings && atRiskPlayers.value.length > 0) {
          showPreventionWarnings.value = true
        }
      }, 10000) // Check every 10 seconds
    }

    const stopBankruptcyMonitoring = () => {
      if (bankruptcyCheckInterval.value) {
        clearInterval(bankruptcyCheckInterval.value)
        bankruptcyCheckInterval.value = null
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      startBankruptcyMonitoring()
    })

    onUnmounted(() => {
      stopBankruptcyMonitoring()
    })

    // Public API for external components
    const triggerBankruptcyCheck = (playerId, debtAmount, creditorId = null) => {
      return checkForBankruptcy(playerId, debtAmount, creditorId)
    }

    const getPlayerFinancialStatus = (playerId) => {
      const player = props.gameState.players?.find(p => p.id === playerId)
      if (!player) return null

      return {
        netWorth: calculatePlayerNetWorth(player),
        liquidAssets: calculateLiquidAssets(player),
        atRisk: atRiskPlayers.value.some(p => p.id === playerId),
        bankruptcyThreshold: bankruptcyThresholdAmount.value
      }
    }

    return {
      // Reactive state
      activeBankruptcyProcesses,
      showPreventionWarnings,
      atRiskPlayers,
      
      // Computed
      activePlayers,
      averagePlayerWealth,
      bankruptcyThresholdAmount,
      
      // Methods
      calculatePlayerNetWorth,
      calculateLiquidAssets,
      triggerBankruptcyCheck,
      getPlayerFinancialStatus,
      handleBankruptcyCompleted,
      handleBankruptcyCancelled,
      handleAssetTransferComplete,
      handleWarningDismissed,
      handleEmergencyLiquidation
    }
  }
}
</script>

<style scoped>
.bankruptcy-system {
  position: relative;
}

.bankruptcy-processes {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2500;
  pointer-events: none;
}

.bankruptcy-process {
  pointer-events: all;
}
</style>