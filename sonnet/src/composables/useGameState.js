import { computed, onMounted } from 'vue'
import gameState, { gameActions, gameComputed } from '../game/gameState.js'

// Composable to provide game state and actions to components
export function useGameState() {
  // Initialize the game when the composable is first used
  onMounted(() => {
    if (gameState.gamePhase === 'setup' && gameState.players.length === 0) {
      gameActions.initializeGame()
    }
  })
  
  // Reactive game state
  const state = gameState
  
  // Game actions
  const actions = gameActions
  
  // Computed properties
  const currentPlayer = gameComputed.currentPlayer
  const gameStatus = gameComputed.gameStatus
  const totalMoneyInGame = gameComputed.totalMoneyInGame
  const propertiesOwnedCount = gameComputed.propertiesOwnedCount
  
  // Helper functions
  const canRollDice = computed(() => {
    return state.gamePhase === 'playing' && 
           state.turnPhase === 'rolling' && 
           !state.animations.diceRolling
  })
  
  const canEndTurn = computed(() => {
    return state.gamePhase === 'playing' && 
           state.turnPhase === 'action' && 
           !state.dice.isDoubles
  })
  
  const currentPlayerCanAct = computed(() => {
    return state.gamePhase === 'playing' && 
           currentPlayer.value && 
           currentPlayer.value.isActive && 
           !currentPlayer.value.isBankrupt
  })
  
  // Enhanced dice rolling with animation support
  const rollDice = async () => {
    if (!canRollDice.value) return { success: false, reason: 'Cannot roll dice' }
    
    try {
      // Use enhanced rollDice method that returns movement info
      const rollResult = await actions.rollDice()
      
      if (rollResult.movePlayer) {
        // Start movement animation - let the UI components handle this
        return {
          success: true,
          rollResult,
          movePlayer: true,
          spaces: state.dice.total
        }
      } else {
        // Handle special cases (jail, three doubles, etc.)
        // Transition to action phase for non-moving scenarios
        setTimeout(() => {
          state.turnPhase = 'action'
        }, 1000)
        
        return {
          success: true,
          rollResult,
          specialAction: rollResult.specialAction
        }
      }
    } catch (error) {
      console.error('Error during dice roll:', error)
      state.animations.diceRolling = false
      return { success: false, error }
    }
  }
  
  const endTurn = () => {
    if (!canEndTurn.value) return false
    actions.endTurn()
    return true
  }
  
  const purchaseProperty = (propertyId) => {
    if (!currentPlayerCanAct.value) return false
    return actions.purchaseProperty(currentPlayer.value.id, propertyId)
  }

  // Enhanced game control functions
  const setupGame = (gameConfig) => {
    return actions.setupGame(gameConfig)
  }

  const handlePlayerAction = (action) => {
    return actions.handlePlayerAction(action)
  }

  const payJailFine = (playerId) => {
    return actions.payJailFine(playerId)
  }

  const useJailCard = (playerId) => {
    return actions.useJailCard(playerId)
  }

  const setTurnPhase = (phase) => {
    actions.setTurnPhase(phase)
  }
  
  // Utility functions
  const getPlayerById = (playerId) => {
    return state.players.find(p => p.id === playerId)
  }
  
  const getPropertyById = (propertyId) => {
    return state.properties[propertyId] || 
           state.railroads[propertyId] || 
           state.utilities[propertyId]
  }
  
  const getSpaceById = (spaceId) => {
    return state.board.find(space => space.id === spaceId)
  }

  // Movement and animation handling
  const startPlayerMovement = async (playerId, spaces) => {
    try {
      const movementResult = await actions.movePlayerWithAnimation(playerId, spaces)
      return movementResult
    } catch (error) {
      console.error('Error during player movement:', error)
      return { success: false, error }
    }
  }

  const completeMovementAnimation = (playerId) => {
    actions.completeMovementAnimation(playerId)
  }

  const handleMovementComplete = (data) => {
    console.log('Movement completed:', data)
    completeMovementAnimation(data.playerId)
    
    // Transition to action phase after movement completes
    setTimeout(() => {
      state.turnPhase = 'action'
    }, 500)
  }

  const handleSpaceReached = (data) => {
    console.log('Space reached:', data)
    // Handle any space-specific logic
  }

  const handleSpecialEvent = (data) => {
    console.log('Special event:', data)
    
    switch (data.type) {
      case 'passed-go':
        // Already handled in game state, just log
        console.log(`${data.playerId} passed GO and collected $200`)
        break
        
      case 'go-to-jail':
        // Handle go to jail animation
        actions.sendToJailWithAnimation(data.playerId)
        break
        
      default:
        console.log('Unhandled special event:', data.type)
    }
  }

  // Dice animation handling
  const handleDiceAnimationComplete = () => {
    state.animations.diceRolling = false
    
    // Check if movement should start
    if (state.turnPhase === 'moving' && !state.animations.movementInProgress) {
      startPlayerMovement(currentPlayer.value?.id, state.dice.total)
    }
  }
  
  return {
    // State
    state,
    
    // Computed properties
    currentPlayer,
    gameStatus,
    totalMoneyInGame,
    propertiesOwnedCount,
    canRollDice,
    canEndTurn,
    currentPlayerCanAct,
    
    // Actions
    rollDice,
    endTurn,
    purchaseProperty,
    setupGame,
    handlePlayerAction,
    payJailFine,
    useJailCard,
    setTurnPhase,
    
    // Raw actions (for advanced use)
    actions,
    
    // Utility functions
    getPlayerById,
    getPropertyById,
    getSpaceById,
    
    // Animation and movement
    startPlayerMovement,
    completeMovementAnimation,
    handleMovementComplete,
    handleSpaceReached,
    handleSpecialEvent,
    handleDiceAnimationComplete
  }
}

// Export individual parts for direct access if needed
export { gameState, gameActions, gameComputed }