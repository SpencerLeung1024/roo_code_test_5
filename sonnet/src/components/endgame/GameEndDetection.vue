<template>
  <div class="game-end-detection">
    <!-- This component runs in the background to monitor game end conditions -->
    <!-- It doesn't render visible content but emits events when game should end -->
    
    <!-- Debug info (only in development) -->
    <div v-if="showDebugInfo" class="debug-info">
      <h4>🔍 Game End Detection Debug</h4>
      <div class="debug-stats">
        <div class="debug-item">
          <span>Active Players:</span>
          <span>{{ activePlayers.length }}</span>
        </div>
        <div class="debug-item">
          <span>Bankrupt Players:</span>
          <span>{{ bankruptPlayers.length }}</span>
        </div>
        <div class="debug-item">
          <span>Game Duration:</span>
          <span>{{ gameDurationMinutes }} minutes</span>
        </div>
        <div class="debug-item">
          <span>Turn Count:</span>
          <span>{{ gameState.turnNumber || 0 }}</span>
        </div>
        <div class="debug-item">
          <span>End Conditions Met:</span>
          <span>{{ endConditionsMet.join(', ') || 'None' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'GameEndDetection',

  props: {
    gameState: {
      type: Object,
      required: true
    },
    winConditions: {
      type: Object,
      default: () => ({
        lastPlayerStanding: true,
        timeLimit: null, // minutes
        assetThreshold: null, // dollar amount
        turnLimit: null, // number of turns
        playerAgreement: false
      })
    },
    enableAutoDetection: {
      type: Boolean,
      default: true
    },
    checkInterval: {
      type: Number,
      default: 5000 // milliseconds
    },
    showDebugInfo: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'game-end-detected',
    'winner-determined',
    'end-condition-met',
    'warning-issued'
  ],

  setup(props, { emit }) {
    const detectionInterval = ref(null)
    const gameStartTime = ref(null)
    const lastCheck = ref(null)
    const endConditionsCache = ref(new Map())

    // Computed properties for game analysis
    const activePlayers = computed(() => {
      return props.gameState.players?.filter(p => p.isActive && !p.isBankrupt) || []
    })

    const bankruptPlayers = computed(() => {
      return props.gameState.players?.filter(p => p.isBankrupt) || []
    })

    const totalPlayers = computed(() => {
      return props.gameState.players?.length || 0
    })

    const gameDurationMinutes = computed(() => {
      if (!gameStartTime.value) return 0
      return Math.floor((Date.now() - gameStartTime.value) / (1000 * 60))
    })

    const playersByNetWorth = computed(() => {
      return [...activePlayers.value].sort((a, b) => {
        const netWorthA = calculatePlayerNetWorth(a)
        const netWorthB = calculatePlayerNetWorth(b)
        return netWorthB - netWorthA
      })
    })

    const leadingPlayer = computed(() => {
      return playersByNetWorth.value[0] || null
    })

    const endConditionsMet = computed(() => {
      const conditions = []
      
      // Check each win condition
      if (checkLastPlayerStanding()) {
        conditions.push('Last Player Standing')
      }
      
      if (checkTimeLimit()) {
        conditions.push('Time Limit Reached')
      }
      
      if (checkAssetThreshold()) {
        conditions.push('Asset Threshold Met')
      }
      
      if (checkTurnLimit()) {
        conditions.push('Turn Limit Reached')
      }
      
      return conditions
    })

    // Game end condition checkers
    const checkLastPlayerStanding = () => {
      if (!props.winConditions.lastPlayerStanding) return false
      return activePlayers.value.length <= 1
    }

    const checkTimeLimit = () => {
      if (!props.winConditions.timeLimit) return false
      return gameDurationMinutes.value >= props.winConditions.timeLimit
    }

    const checkAssetThreshold = () => {
      if (!props.winConditions.assetThreshold) return false
      if (!leadingPlayer.value) return false
      
      const leadingNetWorth = calculatePlayerNetWorth(leadingPlayer.value)
      return leadingNetWorth >= props.winConditions.assetThreshold
    }

    const checkTurnLimit = () => {
      if (!props.winConditions.turnLimit) return false
      return (props.gameState.turnNumber || 0) >= props.winConditions.turnLimit
    }

    const checkPlayerAgreement = () => {
      // This would be triggered externally when players agree to end
      return props.winConditions.playerAgreement
    }

    // Net worth calculation
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
              netWorth -= property.mortgageValue || Math.floor((property.price || 0) / 2)
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

    // Winner determination logic
    const determineWinner = (endReason) => {
      let winner = null
      let winnerDetails = {
        playerId: null,
        player: null,
        reason: endReason,
        netWorth: 0,
        stats: {}
      }

      switch (endReason) {
        case 'Last Player Standing':
          winner = activePlayers.value[0] || null
          if (winner) {
            winnerDetails = {
              ...winnerDetails,
              playerId: winner.id,
              player: winner,
              netWorth: calculatePlayerNetWorth(winner),
              stats: {
                survivedBankruptcies: bankruptPlayers.value.length,
                finalCash: winner.money,
                propertiesOwned: winner.properties?.length || 0,
                totalAssets: (winner.properties?.length || 0) + (winner.railroads?.length || 0) + (winner.utilities?.length || 0)
              }
            }
          }
          break

        case 'Time Limit Reached':
        case 'Turn Limit Reached':
        case 'Asset Threshold Met':
          // Winner is player with highest net worth
          if (playersByNetWorth.value.length > 0) {
            winner = playersByNetWorth.value[0]
            winnerDetails = {
              ...winnerDetails,
              playerId: winner.id,
              player: winner,
              netWorth: calculatePlayerNetWorth(winner),
              stats: {
                finalCash: winner.money,
                propertiesOwned: winner.properties?.length || 0,
                advantage: 'Highest Net Worth',
                competitorCount: activePlayers.value.length - 1
              }
            }
          }
          break

        default:
          // Fallback to highest net worth
          if (activePlayers.value.length > 0) {
            winner = playersByNetWorth.value[0]
            winnerDetails.playerId = winner?.id || null
            winnerDetails.player = winner
            winnerDetails.netWorth = winner ? calculatePlayerNetWorth(winner) : 0
          }
      }

      return winnerDetails
    }

    // Game end detection logic
    const performGameEndCheck = () => {
      if (props.gameState.gamePhase === 'ended' || props.gameState.gamePhase === 'setup') {
        return // Game already ended or not started
      }

      const currentTime = Date.now()
      lastCheck.value = currentTime

      // Check for any end conditions
      const metConditions = endConditionsMet.value
      
      if (metConditions.length > 0) {
        // Issue warnings for approaching conditions first
        issueWarnings(metConditions)

        // Determine primary end reason
        const primaryEndReason = metConditions[0]
        
        // Determine winner
        const winnerDetails = determineWinner(primaryEndReason)
        
        // Emit game end detection
        emit('game-end-detected', {
          reason: primaryEndReason,
          conditions: metConditions,
          winner: winnerDetails,
          gameStats: generateGameStatistics(),
          timestamp: currentTime
        })

        // Emit winner determination
        if (winnerDetails.player) {
          emit('winner-determined', winnerDetails)
        }

        // Emit each condition met
        metConditions.forEach(condition => {
          emit('end-condition-met', {
            condition,
            details: getConditionDetails(condition),
            timestamp: currentTime
          })
        })
      }
    }

    const issueWarnings = (conditions) => {
      // Issue warnings for approaching end conditions
      if (props.winConditions.timeLimit) {
        const timeRemaining = props.winConditions.timeLimit - gameDurationMinutes.value
        if (timeRemaining <= 5 && timeRemaining > 0) {
          emit('warning-issued', {
            type: 'time-warning',
            message: `Game will end in ${timeRemaining} minutes`,
            severity: timeRemaining <= 2 ? 'critical' : 'warning'
          })
        }
      }

      if (activePlayers.value.length === 2) {
        emit('warning-issued', {
          type: 'final-two',
          message: 'Only two players remain!',
          severity: 'info'
        })
      }
    }

    const getConditionDetails = (condition) => {
      switch (condition) {
        case 'Last Player Standing':
          return {
            activePlayers: activePlayers.value.length,
            bankruptPlayers: bankruptPlayers.value.length,
            survivor: activePlayers.value[0] || null
          }
        case 'Time Limit Reached':
          return {
            timeLimit: props.winConditions.timeLimit,
            actualDuration: gameDurationMinutes.value,
            leadingPlayer: leadingPlayer.value
          }
        case 'Asset Threshold Met':
          return {
            threshold: props.winConditions.assetThreshold,
            achievedBy: leadingPlayer.value,
            netWorth: leadingPlayer.value ? calculatePlayerNetWorth(leadingPlayer.value) : 0
          }
        case 'Turn Limit Reached':
          return {
            turnLimit: props.winConditions.turnLimit,
            actualTurns: props.gameState.turnNumber || 0,
            leadingPlayer: leadingPlayer.value
          }
        default:
          return {}
      }
    }

    const generateGameStatistics = () => {
      const stats = {
        duration: gameDurationMinutes.value,
        totalTurns: props.gameState.turnNumber || 0,
        totalPlayers: totalPlayers.value,
        bankruptPlayers: bankruptPlayers.value.length,
        activePlayers: activePlayers.value.length,
        playerRankings: playersByNetWorth.value.map((player, index) => ({
          rank: index + 1,
          playerId: player.id,
          name: player.name,
          netWorth: calculatePlayerNetWorth(player),
          status: player.isBankrupt ? 'bankrupt' : 'active',
          properties: player.properties?.length || 0,
          railroads: player.railroads?.length || 0,
          utilities: player.utilities?.length || 0
        })),
        gameMetrics: {
          averageNetWorth: activePlayers.value.length > 0 ? 
            activePlayers.value.reduce((sum, p) => sum + calculatePlayerNetWorth(p), 0) / activePlayers.value.length : 0,
          totalMoneyInGame: [...activePlayers.value, ...bankruptPlayers.value]
            .reduce((sum, p) => sum + (p.money || 0), 0) + (props.gameState.bank?.money || 0),
          propertiesDistributed: props.gameState.players?.reduce((sum, p) => 
            sum + (p.properties?.length || 0) + (p.railroads?.length || 0) + (p.utilities?.length || 0), 0) || 0
        }
      }

      return stats
    }

    // Manual end game trigger
    const triggerGameEnd = (reason = 'Manual', customWinner = null) => {
      const winnerDetails = customWinner || determineWinner(reason)
      
      emit('game-end-detected', {
        reason,
        conditions: [reason],
        winner: winnerDetails,
        gameStats: generateGameStatistics(),
        timestamp: Date.now(),
        manual: true
      })

      if (winnerDetails.player) {
        emit('winner-determined', winnerDetails)
      }
    }

    // Lifecycle management
    const startDetection = () => {
      if (!props.enableAutoDetection) return

      gameStartTime.value = Date.now()
      
      detectionInterval.value = setInterval(() => {
        performGameEndCheck()
      }, props.checkInterval)
    }

    const stopDetection = () => {
      if (detectionInterval.value) {
        clearInterval(detectionInterval.value)
        detectionInterval.value = null
      }
    }

    // Watch for game phase changes
    watch(() => props.gameState.gamePhase, (newPhase) => {
      if (newPhase === 'playing' && !detectionInterval.value) {
        startDetection()
      } else if (newPhase === 'ended' && detectionInterval.value) {
        stopDetection()
      }
    })

    // Watch for bankruptcy changes
    watch(() => props.gameState.players?.filter(p => p.isBankrupt).length, (newBankruptCount, oldBankruptCount) => {
      if (newBankruptCount > oldBankruptCount) {
        // New bankruptcy occurred, check immediately
        setTimeout(performGameEndCheck, 100)
      }
    })

    onMounted(() => {
      if (props.gameState.gamePhase === 'playing') {
        startDetection()
      }
    })

    onUnmounted(() => {
      stopDetection()
    })

    return {
      // Computed
      activePlayers,
      bankruptPlayers,
      totalPlayers,
      gameDurationMinutes,
      playersByNetWorth,
      leadingPlayer,
      endConditionsMet,

      // Methods
      performGameEndCheck,
      triggerGameEnd,
      calculatePlayerNetWorth,
      determineWinner,
      generateGameStatistics,
      startDetection,
      stopDetection
    }
  }
}
</script>

<style scoped>
.game-end-detection {
  position: relative;
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  z-index: 1000;
  max-width: 250px;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.debug-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.debug-item span:first-child {
  color: #ccc;
}

.debug-item span:last-child {
  color: #fff;
  font-weight: bold;
}
</style>