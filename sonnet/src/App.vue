<template>
  <div id="monopoly-app">
    <!-- Game Setup Modal -->
    <GameSetup
      v-if="showGameSetup"
      @start-game="handleGameStart"
      @cancel-setup="showGameSetup = false"
    />

    <header class="game-header">
      <h1>Monopoly Game</h1>
      <div class="game-status">
        <span>{{ gameStatus }}</span>
      </div>
      <div class="game-controls-header">
        <button
          v-if="state.gamePhase === 'playing'"
          @click="showPlayerStats = !showPlayerStats"
          class="toggle-btn"
        >
          {{ showPlayerStats ? 'Hide Stats' : 'Show Stats' }}
        </button>
        <button
          @click="restartGame"
          class="restart-btn"
        >
          New Game
        </button>
      </div>
    </header>

    <main class="game-container" v-if="!showGameSetup">
      <div class="game-board-section">
        <GameBoard
          ref="gameBoard"
          @space-click="handleSpaceClick"
          @movement-complete="handleMovementComplete"
          @space-reached="handleSpaceReached"
          @special-event="handleSpecialEvent"
          @money-changed="handleMoneyChanged"
          @property-purchased="handlePropertyPurchased"
        />
      </div>

      <aside class="player-panels-section">
        <PlayerDashboard
          :players="state.players"
          :current-player="currentPlayer"
          :game-state="state"
          :turn-number="state.turnNumber"
          @player-action="handlePlayerAction"
        />
      </aside>

      <section class="game-controls-section">
        <TurnManager
          v-if="currentPlayer && state.gamePhase === 'playing'"
          :current-player="currentPlayer"
          :turn-number="state.turnNumber"
          :turn-phase="state.turnPhase"
          :dice="state.dice"
          :game-state="state"
          :can-roll-dice="canRollDice"
          :can-end-turn="canEndTurn"
          @roll-dice="handleRollDice"
          @end-turn="endTurn"
          @player-action="handlePlayerAction"
          @pay-jail-fine="handlePayJailFine"
          @use-jail-card="handleUseJailCard"
          @start-movement="handleStartMovement"
          @movement-complete="handleMovementComplete"
        />
        
        <div v-else class="setup-message">
          <h3>Game Setup</h3>
          <p>Configure your game settings and players to begin.</p>
          <button @click="showGameSetup = true" class="btn primary">
            Setup Game
          </button>
        </div>
      </section>
    </main>

    <!-- Player Stats Modal -->
    <div v-if="showPlayerStats && selectedStatsPlayer" class="stats-modal-overlay" @click="closeStatsModal">
      <div class="stats-modal" @click.stop>
        <PlayerStats
          :player="selectedStatsPlayer"
          :game-state="state"
        />
        <button @click="closeStatsModal" class="close-stats-btn">Close</button>
      </div>
    </div>

    <!-- Modals placeholder -->
    <div class="modals-container">
      <!-- Game modals will be rendered here -->
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import GameBoard from './components/board/GameBoard.vue'
import GameSetup from './components/setup/GameSetup.vue'
import PlayerDashboard from './components/players/PlayerDashboard.vue'
import PlayerStats from './components/players/PlayerStats.vue'
import TurnManager from './components/controls/TurnManager.vue'
import { useGameState } from './composables/useGameState.js'

export default {
  name: 'App',
  components: {
    GameBoard,
    GameSetup,
    PlayerDashboard,
    PlayerStats,
    TurnManager
  },
  
  setup() {
    const showGameSetup = ref(true)
    const showPlayerStats = ref(false)
    const selectedStatsPlayer = ref(null)

    // Use the game state composable
    const {
      state,
      currentPlayer,
      gameStatus,
      canRollDice,
      canEndTurn,
      rollDice,
      endTurn,
      setupGame,
      handlePlayerAction: gameHandlePlayerAction,
      payJailFine,
      useJailCard,
      getSpaceById,
      startPlayerMovement,
      handleMovementComplete: gameHandleMovementComplete,
      handleSpaceReached: gameHandleSpaceReached,
      handleSpecialEvent: gameHandleSpecialEvent,
      handleDiceAnimationComplete
    } = useGameState()

    const gameBoard = ref(null)

    // Game setup and control
    const handleGameStart = (gameConfig) => {
      setupGame(gameConfig)
      showGameSetup.value = false
    }

    const restartGame = () => {
      showGameSetup.value = true
      showPlayerStats.value = false
      selectedStatsPlayer.value = null
    }

    // Player action handling
    const handlePlayerAction = (action) => {
      console.log('Player action:', action)
      
      // Handle specific UI actions
      switch (action.type) {
        case 'property-selected':
          // Could open property details modal
          console.log('Property selected:', action.propertyId)
          break
          
        case 'show-player-stats':
          selectedStatsPlayer.value = state.players.find(p => p.id === action.playerId)
          showPlayerStats.value = true
          break
          
        default:
          // Pass through to game state handler
          gameHandlePlayerAction(action)
      }
    }

    // Jail actions
    const handlePayJailFine = () => {
      if (currentPlayer.value) {
        payJailFine(currentPlayer.value.id)
      }
    }

    const handleUseJailCard = () => {
      if (currentPlayer.value) {
        useJailCard(currentPlayer.value.id)
      }
    }

    // Enhanced dice rolling with animation
    const handleRollDice = async () => {
      const result = await rollDice()
      
      if (result.success && result.rollResult) {
        // Trigger dice result celebration on game board
        gameBoard.value?.triggerDiceResult(
          state.dice.total,
          state.dice.isDoubles,
          state.dice.doublesCount
        )
        
        // Handle special actions
        if (result.specialAction) {
          switch (result.specialAction) {
            case 'threeDoubles':
              gameBoard.value?.triggerNotification(
                'Three doubles in a row - Go to Jail!',
                'warning',
                '⚠️'
              )
              break
            case 'freedFromJail':
              gameBoard.value?.triggerNotification(
                'Doubles! You are freed from jail!',
                'success',
                '🎲'
              )
              break
            case 'stayInJail':
              gameBoard.value?.triggerNotification(
                'No doubles - remain in jail',
                'info',
                '🔒'
              )
              break
          }
        }
      }
      
      return result
    }

    // Movement animation handling
    const handleStartMovement = async (data) => {
      if (gameBoard.value) {
        const player = state.players.find(p => p.id === data.playerId)
        if (player) {
          await gameBoard.value.startPlayerMovement(
            data.playerId,
            player.position,
            (player.position + data.spaces) % 40,
            data.spaces
          )
        }
      }
    }

    const handleMovementComplete = (data) => {
      gameHandleMovementComplete(data)
    }

    const handleSpaceReached = (data) => {
      gameHandleSpaceReached(data)
    }

    const handleSpecialEvent = (data) => {
      gameHandleSpecialEvent(data)
    }

    // Board interaction handlers
    const handleSpaceClick = (space) => {
      console.log('Space clicked:', space)
      // Handle space click logic here
    }

    const handleMoneyChanged = (data) => {
      console.log('Money changed:', data)
      // Could trigger additional UI updates
    }

    const handlePropertyPurchased = (data) => {
      console.log('Property purchased:', data)
      // Could trigger additional UI updates
    }

    // Stats modal
    const closeStatsModal = () => {
      showPlayerStats.value = false
      selectedStatsPlayer.value = null
    }

    return {
      showGameSetup,
      showPlayerStats,
      selectedStatsPlayer,
      gameBoard,
      state,
      currentPlayer,
      gameStatus,
      canRollDice,
      canEndTurn,
      handleRollDice,
      endTurn,
      handleGameStart,
      restartGame,
      handlePlayerAction,
      handlePayJailFine,
      handleUseJailCard,
      handleStartMovement,
      handleMovementComplete,
      handleSpaceReached,
      handleSpecialEvent,
      handleSpaceClick,
      handleMoneyChanged,
      handlePropertyPurchased,
      closeStatsModal,
      getSpaceById
    }
  }
}
</script>

<style scoped>
#monopoly-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.game-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-header h1 {
  margin: 0;
  font-size: 2rem;
}

.game-status {
  font-size: 1.1rem;
  text-align: center;
  flex: 1;
}

.game-controls-header {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn,
.restart-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.toggle-btn {
  background: #3498db;
}

.toggle-btn:hover {
  background: #2980b9;
}

.restart-btn {
  background: #e74c3c;
}

.restart-btn:hover {
  background: #c0392b;
}

.game-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "board panels"
    "controls panels";
  gap: 1rem;
  padding: 1rem;
  background: #ecf0f1;
}

.game-board-section {
  grid-area: board;
  background: white;
  border: 2px solid #34495e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-panels-section {
  grid-area: panels;
  overflow: hidden;
}

.game-controls-section {
  grid-area: controls;
  background: white;
  border: 2px solid #34495e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.setup-message {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.setup-message h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.setup-message p {
  margin: 0 0 1.5rem 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn.primary {
  background: #27ae60;
  color: white;
}

.btn.primary:hover {
  background: #229954;
}

/* Stats Modal */
.stats-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.stats-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-stats-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  z-index: 10;
}

.close-stats-btn:hover {
  background: #c0392b;
}

.modals-container {
  position: relative;
}

/* Responsive design */
@media (max-width: 1200px) {
  .game-container {
    grid-template-columns: 1fr 280px;
  }
}

@media (max-width: 1024px) {
  .game-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto auto;
    grid-template-areas:
      "board"
      "panels"
      "controls";
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-status {
    order: -1;
  }
}

@media (max-width: 768px) {
  .game-header h1 {
    font-size: 1.5rem;
  }
  
  .game-controls-header {
    flex-direction: column;
    width: 100%;
  }
  
  .toggle-btn,
  .restart-btn {
    width: 100%;
  }
  
  .stats-modal {
    margin: 0.5rem;
    max-width: none;
  }
}
</style>
