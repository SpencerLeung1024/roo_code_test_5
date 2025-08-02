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
          v-if="state.gamePhase === 'playing'"
          @click="openRentHistory"
          class="toggle-btn history-btn"
        >
          📊 Rent History
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

    <!-- Rent Collection System -->
    <RentCollection
      ref="rentCollectionRef"
      :game-state="state"
      @rent-calculated="handleRentCalculated"
      @rent-paid="handleRentPaid"
      @asset-liquidation-needed="handleAssetLiquidationNeeded"
      @bankruptcy-declared="handleBankruptcyDeclared"
      @rent-collection-closed="handleRentCollectionClosed"
    />

    <!-- Rent Payment Modal -->
    <RentPayment
      v-if="rentPaymentData"
      :payment-data="rentPaymentData"
      :liquidation-options="rentLiquidationData"
      @payment-confirmed="handleRentPaid"
      @payment-cancelled="rentPaymentData = null"
      @liquidation-required="handleAssetLiquidationNeeded"
      @payment-completed="rentPaymentData = null"
    />

    <!-- Asset Liquidation Modal -->
    <AssetLiquidation
      v-if="rentLiquidationData"
      :player-id="rentLiquidationData.playerId"
      :required-amount="rentLiquidationData.requiredAmount"
      :liquidation-options="rentLiquidationData.liquidationOptions"
      :game-state="state"
      @liquidation-completed="handleLiquidationCompleted"
      @liquidation-cancelled="handleLiquidationCancelled"
      @assets-liquidated="(data) => console.log('Assets liquidated:', data)"
    />

    <!-- Insufficient Funds / Bankruptcy Modal -->
    <InsufficientFunds
      v-if="rentBankruptcyData"
      :player-id="rentBankruptcyData.playerId"
      :debt-info="rentBankruptcyData"
      :player-assets="rentBankruptcyData.playerAssets || { cash: 0, totalAssetValue: 0, totalWorth: 0 }"
      :game-state="state"
      :allow-negotiation="false"
      :allow-cancel="false"
      @bankruptcy-confirmed="handleBankruptcyConfirmed"
      @bankruptcy-cancelled="handleBankruptcyCancelled"
      @negotiation-proposed="(data) => console.log('Negotiation proposed:', data)"
    />

    <!-- Rent History Modal -->
    <RentHistory
      v-if="showRentHistory"
      :game-state="state"
      @close-history="closeRentHistory"
    />

    <!-- Card System Components -->
    <!-- Card Display Modal -->
    <CardDisplay
      v-if="activeCardDraw"
      :card="activeCardDraw.card"
      :show-card="!!activeCardDraw"
      :card-deck-type="activeCardDraw.deckType === 'chance' ? 'Chance' : 'Community Chest'"
      :processing="processingCard"
      @execute-card="handleExecuteCard"
      @keep-card="handleKeepCard"
      @close-card="handleCloseCard"
    />

    <!-- Card Drawing Interface -->
    <CardDraw
      v-if="showCardDraw"
      :player-id="currentCardPlayer"
      :deck-type="currentCardDeck"
      :auto-draw="autoDrawCard"
      @card-drawn="handleCardDrawn"
      @draw-cancelled="handleCardDrawCancelled"
    />

    <!-- Card History Modal -->
    <CardHistory
      v-if="showCardHistory"
      :card-history="state.cardHistory || []"
      :players="state.players"
      @close-history="closeCardHistory"
    />

    <!-- Bankruptcy and Game End System -->
    <!-- Bankruptcy System -->
    <BankruptcySystem
      ref="bankruptcySystemRef"
      :game-state="state"
      :players="state.players"
      :properties="state.spaces?.filter(s => s.type === 'property') || []"
      @bankruptcy-detected="handleBankruptcyDetected"
      @bankruptcy-process-started="handleBankruptcyProcessStarted"
      @bankruptcy-completed="handleBankruptcyCompleted"
    />

    <!-- Bankruptcy Process Modal -->
    <BankruptcyProcess
      v-if="activeBankruptcyProcess"
      :bankruptcy-data="activeBankruptcyProcess"
      :game-state="state"
      :properties="state.spaces?.filter(s => s.type === 'property') || []"
      @bankruptcy-completed="handleBankruptcyProcessCompleted"
      @process-cancelled="activeBankruptcyProcess = null"
    />

    <!-- Bankruptcy Prevention System -->
    <BankruptcyPrevention
      v-if="state.gamePhase === 'playing'"
      :game-state="state"
      :current-player="currentPlayer"
      :properties="state.spaces?.filter(s => s.type === 'property') || []"
      :enabled="bankruptcyPreventionEnabled"
      @open-property-manager="handleOpenPropertyManager"
      @open-asset-liquidation="handleOpenAssetLiquidation"
      @open-trading="handleOpenTrading"
      @view-rent-history="openRentHistory"
      @execute-suggestion="handleExecuteSuggestion"
    />

    <!-- Game End Detection -->
    <GameEndDetection
      ref="gameEndDetectionRef"
      :game-state="state"
      :players="state.players"
      :properties="state.spaces?.filter(s => s.type === 'property') || []"
      :victory-conditions="gameEndConditions"
      @game-end-detected="handleGameEndDetected"
      @winner-determined="handleWinnerDetermined"
    />

    <!-- Winner Announcement -->
    <WinnerAnnouncement
      v-if="showWinnerAnnouncement"
      :winner-data="winnerAnnouncementData"
      :game-state="state"
      :final-rankings="finalRankings"
      @new-game="handleNewGameFromWinner"
      @view-summary="handleViewGameSummary"
      @close-announcement="handleCloseWinnerAnnouncement"
    />

    <!-- Game Summary -->
    <GameSummary
      v-if="showGameSummary"
      :game-data="gameSummaryData"
      :players="state.players"
      :properties="state.spaces?.filter(s => s.type === 'property') || []"
      @close-summary="handleCloseGameSummary"
      @new-game="handleNewGameFromSummary"
      @export-data="handleExportGameData"
    />

    <!-- Testing Interface (only in development) -->
    <BankruptcySystemTest
      v-if="showTestingSuite && isDevelopment"
    />

    <!-- Modals placeholder -->
    <div class="modals-container">
      <!-- Other game modals will be rendered here -->
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import GameBoard from './components/board/GameBoard.vue'
import GameSetup from './components/setup/GameSetup.vue'
import PlayerDashboard from './components/players/PlayerDashboard.vue'
import PlayerStats from './components/players/PlayerStats.vue'
import TurnManager from './components/controls/TurnManager.vue'
import RentCollection from './components/rent/RentCollection.vue'
import RentPayment from './components/rent/RentPayment.vue'
import AssetLiquidation from './components/rent/AssetLiquidation.vue'
import RentHistory from './components/rent/RentHistory.vue'
import InsufficientFunds from './components/rent/InsufficientFunds.vue'
import CardDisplay from './components/cards/CardDisplay.vue'
import CardDraw from './components/cards/CardDraw.vue'
import CardHistory from './components/cards/CardHistory.vue'
// Bankruptcy and Game End System Components
import BankruptcySystem from './components/bankruptcy/BankruptcySystem.vue'
import BankruptcyProcess from './components/bankruptcy/BankruptcyProcess.vue'
import BankruptcyPrevention from './components/bankruptcy/BankruptcyPrevention.vue'
import AssetLiquidationForced from './components/bankruptcy/AssetLiquidationForced.vue'
import PropertyTransfer from './components/bankruptcy/PropertyTransfer.vue'
import GameEndDetection from './components/endgame/GameEndDetection.vue'
import WinnerAnnouncement from './components/endgame/WinnerAnnouncement.vue'
import GameSummary from './components/endgame/GameSummary.vue'
import BankruptcySystemTest from './tests/BankruptcySystemTest.vue'
import { useGameState } from './composables/useGameState.js'
import { createRentCalculator } from './utils/RentCalculator.js'
import EdgeCaseHandler from './utils/EdgeCaseHandler.js'

export default {
  name: 'App',
  components: {
    GameBoard,
    GameSetup,
    PlayerDashboard,
    PlayerStats,
    TurnManager,
    RentCollection,
    RentPayment,
    AssetLiquidation,
    RentHistory,
    InsufficientFunds,
    CardDisplay,
    CardDraw,
    CardHistory,
    // Bankruptcy and Game End System Components
    BankruptcySystem,
    BankruptcyProcess,
    BankruptcyPrevention,
    AssetLiquidationForced,
    PropertyTransfer,
    GameEndDetection,
    WinnerAnnouncement,
    GameSummary,
    BankruptcySystemTest
  },
  
  setup() {
    const showGameSetup = ref(true)
    const showPlayerStats = ref(false)
    const selectedStatsPlayer = ref(null)
    
    // Rent collection state
    const showRentHistory = ref(false)
    const rentCollectionRef = ref(null)
    const rentPaymentData = ref(null)
    const rentLiquidationData = ref(null)
    const rentBankruptcyData = ref(null)
    const rentCalculator = ref(null)
    
    // Card system state
    const showCardDraw = ref(false)
    const showCardHistory = ref(false)
    const currentCardPlayer = ref(null)
    const currentCardDeck = ref(null)
    const autoDrawCard = ref(false)
    const processingCard = ref(false)

    // Bankruptcy and Game End System state
    const bankruptcySystemRef = ref(null)
    const gameEndDetectionRef = ref(null)
    const activeBankruptcyProcess = ref(null)
    const bankruptcyPreventionEnabled = ref(true)
    const showWinnerAnnouncement = ref(false)
    const showGameSummary = ref(false)
    const showTestingSuite = ref(false)
    const winnerAnnouncementData = ref(null)
    const gameSummaryData = ref(null)
    const finalRankings = ref([])
    const gameEndConditions = ref({
      lastPlayerStanding: true,
      turnLimit: 200,
      timeLimit: null,
      assetThreshold: 10000
    })
    const edgeCaseHandler = ref(null)
    const isDevelopment = ref(process.env.NODE_ENV === 'development')

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
    
    // Card system computed properties
    const activeCardDraw = computed(() => {
      return state.activeCardDraw || null
    })
    
    // Initialize rent calculator when game state is available
    const initializeRentCalculator = () => {
      if (state && !rentCalculator.value) {
        rentCalculator.value = createRentCalculator(state)
      }
    }

    // Initialize edge case handler
    const initializeEdgeCaseHandler = () => {
      if (state && !edgeCaseHandler.value) {
        edgeCaseHandler.value = new EdgeCaseHandler(
          state,
          state.players,
          state.spaces?.filter(s => s.type === 'property') || []
        )
      }
    }
    
    // Watch for card draw changes to auto-show cards
    watch(activeCardDraw, (newCardDraw) => {
      if (newCardDraw) {
        // Auto-show the card when drawn
        console.log('Card drawn:', newCardDraw)
      }
    })

    // Game setup and control
    const handleGameStart = (gameConfig) => {
      setupGame(gameConfig)
      showGameSetup.value = false
      
      // Initialize systems
      initializeRentCalculator()
      initializeEdgeCaseHandler()
      
      // Reset bankruptcy and game end state
      activeBankruptcyProcess.value = null
      showWinnerAnnouncement.value = false
      showGameSummary.value = false
      bankruptcyPreventionEnabled.value = true
    }

    const restartGame = () => {
      showGameSetup.value = true
      showPlayerStats.value = false
      selectedStatsPlayer.value = null
      
      // Reset all bankruptcy and game end state
      activeBankruptcyProcess.value = null
      showWinnerAnnouncement.value = false
      showGameSummary.value = false
      winnerAnnouncementData.value = null
      gameSummaryData.value = null
      finalRankings.value = []
      bankruptcyPreventionEnabled.value = true
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
      console.log('[App] handleRollDice called')
      const result = await rollDice()
      console.log('[App] rollDice result:', result)
      
      if (result.success && result.rollResult) {
        // Trigger dice result celebration on game board
        gameBoard.value?.triggerDiceResult(
          state.dice.total,
          state.dice.isDoubles,
          state.dice.doublesCount
        )
        
        // Check if we should start movement
        if (result.movePlayer) {
          console.log('[App] Movement should start, triggering player movement')
          setTimeout(() => {
            if (gameBoard.value) {
              console.log('[App] Starting player movement animation')
              gameBoard.value.startPlayerMovement(
                currentPlayer.value.id,
                currentPlayer.value.position,
                (currentPlayer.value.position + state.dice.total) % 40,
                state.dice.total
              )
            }
          }, 1000) // Wait for dice animation
        }
        
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
      console.log('[App] handleMovementComplete called:', data)
      gameHandleMovementComplete(data)
      
      // Process space actions based on actual landing space
      if (data.playerId && data.finalSpace !== undefined) {
        const landedSpace = getSpaceById(data.finalSpace)
        console.log('[App] Player landed on space:', { spaceId: data.finalSpace, space: landedSpace })
        
        // Trigger appropriate space actions
        if (landedSpace) {
          setTimeout(() => {
            processSpaceActions(data.playerId, landedSpace)
          }, 500)
        }
      }
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

    // Process space actions based on space type
    const processSpaceActions = (playerId, space) => {
      if (!space || !state.gamePhase === 'playing') return
      
      console.log('[App] Processing space actions for:', { playerId, space })
      
      switch (space.type) {
        case 'property':
        case 'railroad':
        case 'utility':
          // Check for rent collection
          if (rentCalculator.value && rentCollectionRef.value) {
            rentCollectionRef.value.triggerRentCollection(space.id, playerId, state.dice?.total)
          }
          break
          
        case 'tax':
          // Handle tax payment
          handlePlayerAction({
            type: 'pay-tax',
            playerId,
            amount: space.taxAmount || space.amount || 0
          })
          break
          
        case 'card':
          // Handle card drawing
          const deckType = space.cardType || (space.name?.toLowerCase().includes('chance') ? 'chance' : 'communityChest')
          handlePlayerAction({
            type: 'draw-card',
            playerId,
            cardType: deckType
          })
          break
          
        case 'special':
          // Handle special spaces
          if (space.specialType === 'go') {
            // GO space - show manual collect option but don't auto-collect
            console.log('[App] Player landed on GO space')
          } else {
            handlePlayerAction({
              type: 'special-action',
              playerId,
              specialType: space.specialType
            })
          }
          break
          
        default:
          console.log('[App] No action needed for space type:', space.type)
      }
    }

    // Rent Collection System
    const checkRentCollection = (spaceId, playerId) => {
      if (!rentCalculator.value || !state.gamePhase === 'playing') return
      
      // Initialize rent calculator if needed
      initializeRentCalculator()
      
      // Trigger rent collection check
      if (rentCollectionRef.value) {
        rentCollectionRef.value.triggerRentCollection(spaceId, playerId, state.dice?.total)
      }
    }

    const handleRentCalculated = (data) => {
      console.log('Rent calculated:', data)
      // Rent collection component will handle the display
    }

    const handleRentPaid = (data) => {
      console.log('Rent paid:', data)
      
      // Trigger visual effects
      gameBoard.value?.triggerMoneyChange(
        data.payer.id,
        -data.amount,
        data.payer.position
      )
      
      gameBoard.value?.triggerMoneyChange(
        data.receiver.id,
        data.amount,
        data.receiver.position
      )
      
      gameBoard.value?.triggerNotification(
        `${data.payer.name} paid $${data.amount} rent to ${data.receiver.name}`,
        'success',
        '💰'
      )
    }

    const handleAssetLiquidationNeeded = (data) => {
      console.log('Asset liquidation needed:', data)
      rentLiquidationData.value = data
    }

    const handleLiquidationCompleted = (data) => {
      console.log('Liquidation completed:', data)
      rentLiquidationData.value = null
      
      // Show notification
      gameBoard.value?.triggerNotification(
        `Assets liquidated for $${data.totalRaised}`,
        data.canCoverDebt ? 'success' : 'warning',
        '🏠'
      )
    }

    const handleLiquidationCancelled = () => {
      rentLiquidationData.value = null
    }

    const handleBankruptcyDeclared = (data) => {
      console.log('Bankruptcy declared:', data)
      rentBankruptcyData.value = data
    }

    const handleBankruptcyConfirmed = (data) => {
      console.log('Bankruptcy confirmed:', data)
      rentBankruptcyData.value = null
      
      // Update game state
      const player = state.players.find(p => p.id === data.playerId)
      if (player) {
        player.isBankrupt = true
        player.isActive = false
      }
      
      // Show notification
      gameBoard.value?.triggerNotification(
        `${player?.name || 'Player'} has declared bankruptcy`,
        'error',
        '💀'
      )
      
      // Check if game should end
      const activePlayers = state.players.filter(p => p.isActive && !p.isBankrupt)
      if (activePlayers.length <= 1) {
        state.gamePhase = 'ended'
        state.winner = activePlayers[0]?.id || null
        
        gameBoard.value?.triggerNotification(
          `Game Over! ${activePlayers[0]?.name || 'No one'} wins!`,
          'success',
          '🏆',
          10000
        )
      }
    }

    const handleBankruptcyCancelled = () => {
      rentBankruptcyData.value = null
    }

    const handleRentCollectionClosed = () => {
      // Rent collection modal closed, continue game
    }

    const openRentHistory = () => {
      showRentHistory.value = true
    }

    const closeRentHistory = () => {
      showRentHistory.value = false
    }

    // Card System Handlers
    const handleExecuteCard = async (card) => {
      if (processingCard.value) return
      
      processingCard.value = true
      
      try {
        // Execute card effect through game state
        const result = await gameHandlePlayerAction({
          type: 'execute-card',
          card,
          playerId: currentPlayer.value?.id
        })
        
        if (result.success) {
          gameBoard.value?.triggerNotification(
            `Card executed: ${card.title}`,
            'success',
            '🎯'
          )
        }
      } catch (error) {
        console.error('Error executing card:', error)
        gameBoard.value?.triggerNotification(
          'Error executing card',
          'error',
          '❌'
        )
      } finally {
        processingCard.value = false
      }
    }

    const handleKeepCard = async (card) => {
      if (processingCard.value) return
      
      processingCard.value = true
      
      try {
        // Keep jail card
        const result = await gameHandlePlayerAction({
          type: 'keep-jail-card',
          card,
          playerId: currentPlayer.value?.id
        })
        
        if (result.success) {
          gameBoard.value?.triggerNotification(
            'Get Out of Jail Free card saved!',
            'success',
            '💾'
          )
        }
      } catch (error) {
        console.error('Error keeping card:', error)
      } finally {
        processingCard.value = false
      }
    }

    const handleCloseCard = () => {
      // Clear active card draw
      if (state.activeCardDraw) {
        state.activeCardDraw = null
      }
    }

    const handleCardDrawn = (data) => {
      console.log('Card drawn in UI:', data)
      showCardDraw.value = false
    }

    const handleCardDrawCancelled = () => {
      showCardDraw.value = false
      currentCardPlayer.value = null
      currentCardDeck.value = null
    }

    const openCardHistory = () => {
      showCardHistory.value = true
    }

    const closeCardHistory = () => {
      showCardHistory.value = false
    }

    // Stats modal
    const closeStatsModal = () => {
      showPlayerStats.value = false
      selectedStatsPlayer.value = null
    }

    // Bankruptcy System Handlers
    const handleBankruptcyDetected = (bankruptcyData) => {
      console.log('Bankruptcy detected:', bankruptcyData)
      
      // Show notification
      gameBoard.value?.triggerNotification(
        `${bankruptcyData.player.name} is facing bankruptcy!`,
        'warning',
        '⚠️'
      )
    }

    const handleBankruptcyProcessStarted = (processData) => {
      console.log('Bankruptcy process started:', processData)
      activeBankruptcyProcess.value = processData
    }

    const handleBankruptcyCompleted = (completionData) => {
      console.log('Bankruptcy completed:', completionData)
      
      // Update player state
      const player = state.players.find(p => p.id === completionData.playerId)
      if (player) {
        player.isBankrupt = true
        player.isActive = false
      }

      // Show notification
      gameBoard.value?.triggerNotification(
        `${player?.name || 'Player'} has been eliminated by bankruptcy`,
        'error',
        '💀'
      )

      // Check for game end
      checkGameEndConditions()
    }

    const handleBankruptcyProcessCompleted = (processResult) => {
      console.log('Bankruptcy process completed:', processResult)
      activeBankruptcyProcess.value = null
      
      // Handle the completed bankruptcy
      handleBankruptcyCompleted(processResult)
    }

    // Game End System Handlers
    const handleGameEndDetected = (gameEndData) => {
      console.log('Game end detected:', gameEndData)
      
      state.gamePhase = 'ended'
      
      // Calculate final rankings
      finalRankings.value = calculateFinalRankings()
      
      // Prepare winner announcement data
      winnerAnnouncementData.value = {
        winner: gameEndData.winner,
        condition: gameEndData.condition,
        timestamp: Date.now(),
        finalStats: gameEndData.finalStats
      }
      
      // Show winner announcement
      showWinnerAnnouncement.value = true
    }

    const handleWinnerDetermined = (winnerData) => {
      console.log('Winner determined:', winnerData)
      
      state.winner = winnerData.winner.id
      
      // Show celebration notification
      gameBoard.value?.triggerNotification(
        `🏆 ${winnerData.winner.name} wins the game! 🏆`,
        'success',
        '👑',
        10000
      )
    }

    const checkGameEndConditions = () => {
      // Check if only one player remains active
      const activePlayers = state.players.filter(p => p.isActive && !p.isBankrupt)
      
      if (activePlayers.length <= 1) {
        const winner = activePlayers[0] || null
        handleGameEndDetected({
          condition: 'last-player-standing',
          winner,
          finalStats: calculateGameStats(),
          timestamp: Date.now()
        })
      }
      
      // Check turn limit
      if (gameEndConditions.value.turnLimit && state.turnNumber >= gameEndConditions.value.turnLimit) {
        const winner = getWealthiestPlayer()
        handleGameEndDetected({
          condition: 'turn-limit',
          winner,
          finalStats: calculateGameStats(),
          timestamp: Date.now()
        })
      }
      
      // Check asset threshold
      if (gameEndConditions.value.assetThreshold) {
        const wealthiestPlayer = getWealthiestPlayer()
        if (wealthiestPlayer && calculatePlayerNetWorth(wealthiestPlayer) >= gameEndConditions.value.assetThreshold) {
          handleGameEndDetected({
            condition: 'asset-threshold',
            winner: wealthiestPlayer,
            finalStats: calculateGameStats(),
            timestamp: Date.now()
          })
        }
      }
    }

    // Winner Announcement Handlers
    const handleNewGameFromWinner = () => {
      showWinnerAnnouncement.value = false
      restartGame()
    }

    const handleViewGameSummary = () => {
      showWinnerAnnouncement.value = false
      
      // Prepare comprehensive game summary data
      gameSummaryData.value = {
        gameSettings: {
          startTime: state.gameStartTime,
          endTime: Date.now(),
          playerCount: state.players.length,
          turnCount: state.turnNumber
        },
        players: state.players.map(p => ({
          ...p,
          finalNetWorth: calculatePlayerNetWorth(p),
          propertiesOwned: state.spaces?.filter(s => s.type === 'property' && s.owner === p.id) || [],
          totalRentCollected: p.totalRentCollected || 0,
          totalRentPaid: p.totalRentPaid || 0
        })),
        winner: winnerAnnouncementData.value?.winner,
        winCondition: winnerAnnouncementData.value?.condition,
        gameStats: calculateGameStats(),
        propertyDistribution: calculatePropertyDistribution(),
        rankings: finalRankings.value
      }
      
      showGameSummary.value = true
    }

    const handleCloseWinnerAnnouncement = () => {
      showWinnerAnnouncement.value = false
    }

    // Game Summary Handlers
    const handleCloseGameSummary = () => {
      showGameSummary.value = false
    }

    const handleNewGameFromSummary = () => {
      showGameSummary.value = false
      restartGame()
    }

    const handleExportGameData = (exportData) => {
      console.log('Exporting game data:', exportData)
      // Export functionality would be handled here
    }

    // Bankruptcy Prevention Handlers
    const handleOpenPropertyManager = () => {
      console.log('Opening property manager from bankruptcy prevention')
      // Could trigger property management modal
    }

    const handleOpenAssetLiquidation = () => {
      console.log('Opening asset liquidation from bankruptcy prevention')
      // Trigger the existing asset liquidation modal
      rentLiquidationData.value = {
        playerId: currentPlayer.value?.id,
        requiredAmount: 0, // For voluntary liquidation
        liquidationOptions: [],
        isVoluntary: true
      }
    }

    const handleOpenTrading = () => {
      console.log('Opening trading from bankruptcy prevention')
      // Could trigger property trading modal
    }

    const handleExecuteSuggestion = (suggestion) => {
      console.log('Executing bankruptcy prevention suggestion:', suggestion)
      // Execute the suggested action
    }

    // Helper functions
    const calculateFinalRankings = () => {
      return state.players
        .map(p => ({
          ...p,
          finalNetWorth: calculatePlayerNetWorth(p),
          rank: 0
        }))
        .sort((a, b) => b.finalNetWorth - a.finalNetWorth)
        .map((p, index) => ({ ...p, rank: index + 1 }))
    }

    const calculatePlayerNetWorth = (player) => {
      let netWorth = player.money || 0
      
      // Add property values
      const playerProperties = state.spaces?.filter(s =>
        s.type === 'property' && s.owner === player.id
      ) || []
      
      playerProperties.forEach(property => {
        netWorth += property.price || 0
        netWorth += (property.houses || 0) * (property.housePrice || 0)
        netWorth += (property.hotels || 0) * (property.hotelPrice || 0)
      })
      
      return netWorth
    }

    const getWealthiestPlayer = () => {
      let wealthiest = null
      let maxWealth = 0
      
      state.players.forEach(player => {
        const wealth = calculatePlayerNetWorth(player)
        if (wealth > maxWealth) {
          maxWealth = wealth
          wealthiest = player
        }
      })
      
      return wealthiest
    }

    const calculateGameStats = () => {
      const totalTurns = state.turnNumber
      const totalProperties = state.spaces?.filter(s => s.type === 'property').length || 0
      const ownedProperties = state.spaces?.filter(s => s.type === 'property' && s.owner).length || 0
      const totalMoney = state.players.reduce((sum, p) => sum + (p.money || 0), 0)
      
      return {
        duration: Date.now() - (state.gameStartTime || Date.now()),
        totalTurns,
        totalProperties,
        ownedProperties,
        unownedProperties: totalProperties - ownedProperties,
        totalMoney,
        averageWealth: totalMoney / state.players.length
      }
    }

    const calculatePropertyDistribution = () => {
      const distribution = {}
      const properties = state.spaces?.filter(s => s.type === 'property') || []
      
      properties.forEach(property => {
        if (property.owner) {
          distribution[property.owner] = (distribution[property.owner] || 0) + 1
        }
      })
      
      return distribution
    }

    return {
      showGameSetup,
      showPlayerStats,
      selectedStatsPlayer,
      showRentHistory,
      gameBoard,
      rentCollectionRef,
      rentPaymentData,
      rentLiquidationData,
      rentBankruptcyData,
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
      getSpaceById,
      processSpaceActions,
      // Rent collection methods
      handleRentCalculated,
      handleRentPaid,
      handleAssetLiquidationNeeded,
      handleLiquidationCompleted,
      handleLiquidationCancelled,
      handleBankruptcyDeclared,
      handleBankruptcyConfirmed,
      handleBankruptcyCancelled,
      handleRentCollectionClosed,
      openRentHistory,
      closeRentHistory,
      // Card system state and methods
      showCardDraw,
      showCardHistory,
      currentCardPlayer,
      currentCardDeck,
      autoDrawCard,
      processingCard,
      activeCardDraw,
      handleExecuteCard,
      handleKeepCard,
      handleCloseCard,
      handleCardDrawn,
      handleCardDrawCancelled,
      openCardHistory,
      closeCardHistory,
      // Bankruptcy and Game End System state and methods
      bankruptcySystemRef,
      gameEndDetectionRef,
      activeBankruptcyProcess,
      bankruptcyPreventionEnabled,
      showWinnerAnnouncement,
      showGameSummary,
      showTestingSuite,
      winnerAnnouncementData,
      gameSummaryData,
      finalRankings,
      gameEndConditions,
      isDevelopment,
      // Bankruptcy System handlers
      handleBankruptcyDetected,
      handleBankruptcyProcessStarted,
      handleBankruptcyCompleted,
      handleBankruptcyProcessCompleted,
      // Game End System handlers
      handleGameEndDetected,
      handleWinnerDetermined,
      checkGameEndConditions,
      // Winner Announcement handlers
      handleNewGameFromWinner,
      handleViewGameSummary,
      handleCloseWinnerAnnouncement,
      // Game Summary handlers
      handleCloseGameSummary,
      handleNewGameFromSummary,
      handleExportGameData,
      // Bankruptcy Prevention handlers
      handleOpenPropertyManager,
      handleOpenAssetLiquidation,
      handleOpenTrading,
      handleExecuteSuggestion,
      // Helper functions
      calculateFinalRankings,
      calculatePlayerNetWorth,
      getWealthiestPlayer,
      calculateGameStats,
      calculatePropertyDistribution
    }
  }
}
</script>

<style scoped>
/* Enhanced App Component Styling */
#monopoly-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-base);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background-alt) 100%);
  color: var(--color-text-primary);
  position: relative;
}

/* Skip to content link for accessibility */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: var(--spacing-6);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  z-index: var(--z-tooltip);
  transition: var(--transition-all);
}

.skip-to-content:focus {
  top: var(--spacing-6);
}

/* Enhanced Game Header */
.game-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ffffff;
  padding: var(--spacing-4) var(--spacing-6);
  box-shadow: var(--shadow-lg);
  border-bottom: 1px solid #1a252f;
  position: relative;
  z-index: var(--z-sticky);
}

.game-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--color-primary-light) 50%, transparent 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: var(--container-2xl);
  margin: 0 auto;
  gap: var(--spacing-4);
}

.game-header h1 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: var(--letter-spacing-wide);
  background: linear-gradient(45deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
}

.game-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: #ffffff;
}

.current-player-info {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.game-phase-info {
  font-size: var(--font-size-sm);
  opacity: 1;
  background: rgba(255, 255, 255, 0.3);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: #ffffff;
  font-weight: 600;
}

.game-controls-header {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

/* Enhanced Header Buttons */
.toggle-btn,
.restart-btn,
.history-btn {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-inverse);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-all);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  position: relative;
  overflow: hidden;
}

.toggle-btn::before,
.restart-btn::before,
.history-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: var(--transition-normal);
}

.toggle-btn:hover::before,
.restart-btn:hover::before,
.history-btn:hover::before {
  left: 100%;
}

.toggle-btn:hover,
.history-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.history-btn {
  background: rgba(155, 89, 182, 0.8);
  border-color: var(--color-info);
}

.history-btn:hover {
  background: var(--color-info);
}

.restart-btn {
  background: rgba(231, 76, 60, 0.8);
  border-color: var(--color-danger);
}

.restart-btn:hover {
  background: var(--color-danger);
  border-color: var(--color-danger-dark);
}

.restart-btn:active,
.toggle-btn:active,
.history-btn:active {
  transform: translateY(0);
}

/* Enhanced Game Container */
.game-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr var(--panel-width);
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "board panels"
    "controls panels";
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  max-width: var(--container-2xl);
  margin: 0 auto;
  width: 100%;
  min-height: 0;
}

/* Enhanced Game Board Section */
.game-board-section {
  grid-area: board;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--board-size);
  position: relative;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.game-board-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(49, 130, 206, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

/* Enhanced Player Panels Section */
.player-panels-section {
  grid-area: panels;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.panels-header {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%);
  color: var(--color-text-inverse);
  padding: var(--spacing-3) var(--spacing-4);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Enhanced Game Controls Section */
.game-controls-section {
  grid-area: controls;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.controls-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(39, 174, 96, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

/* Enhanced Setup Message */
.setup-message {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  max-width: 400px;
  margin: 0 auto;
}

.setup-message h3 {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.setup-message p {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

/* Enhanced Primary Button */
.btn {
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-xl);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition-all);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: var(--transition-normal);
}

.btn:hover::before {
  left: 100%;
}

.btn.primary {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-success-dark);
}

.btn.primary:hover {
  background: linear-gradient(135deg, var(--color-success-light) 0%, var(--color-success) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn.primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* Enhanced Stats Modal */
.stats-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
  animation: fadeIn 0.3s var(--ease-out);
}

.stats-modal-overlay.closing {
  animation: fadeOut 0.2s var(--ease-in);
}

.stats-modal {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid var(--color-border-light);
  animation: modal-enter 0.3s var(--ease-out);
  width: 100%;
}

.stats-modal.closing {
  animation: modal-leave 0.2s var(--ease-in);
}

.stats-modal::-webkit-scrollbar {
  width: 8px;
}

.stats-modal::-webkit-scrollbar-track {
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
}

.stats-modal::-webkit-scrollbar-thumb {
  background: var(--color-border-medium);
  border-radius: var(--radius-sm);
}

.close-stats-btn {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: var(--transition-all);
  color: var(--color-text-secondary);
  z-index: 10;
}

.close-stats-btn:hover {
  background: var(--color-danger-light);
  border-color: var(--color-danger);
  color: var(--color-text-inverse);
  transform: scale(1.1);
}

.close-stats-btn:active {
  transform: scale(0.95);
}

.close-stats-btn:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Modals Container */
.modals-container {
  position: relative;
  z-index: var(--z-modal);
}

/* Loading States */
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text-secondary);
  gap: var(--spacing-4);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
}

/* Error States */
.app-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-danger);
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  text-align: center;
}

.error-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--spacing-4);
}

.error-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.error-message {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  line-height: var(--line-height-relaxed);
}

/* Enhanced Responsive Design */
@media (max-width: 1200px) {
  .game-container {
    grid-template-columns: 1fr 280px;
  }
  
  .game-header h1 {
    font-size: var(--font-size-2xl);
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
    gap: var(--spacing-3);
  }
  
  .player-panels-section {
    max-height: 40vh;
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--spacing-2);
    text-align: center;
  }
  
  .game-status {
    order: -1;
  }
  
  .game-header h1 {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 768px) {
  .game-container {
    padding: var(--spacing-2);
    gap: var(--spacing-2);
  }
  
  .game-header {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .game-header h1 {
    font-size: var(--font-size-lg);
  }
  
  .game-controls-header {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-1);
  }
  
  .toggle-btn,
  .restart-btn,
  .history-btn {
    width: 100%;
    justify-content: center;
  }
  
  .player-panels-section {
    max-height: 30vh;
  }
  
  .game-controls-section {
    min-height: 180px;
  }
  
  .stats-modal {
    margin: var(--spacing-2);
    max-width: none;
    border-radius: var(--radius-xl);
  }
  
  .setup-message {
    padding: var(--spacing-6);
    margin: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .game-container {
    padding: var(--spacing-1);
    gap: var(--spacing-1);
  }
  
  .game-header {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .game-header h1 {
    font-size: var(--font-size-base);
  }
  
  .toggle-btn,
  .restart-btn,
  .history-btn {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: var(--font-size-xs);
  }
  
  .player-panels-section {
    max-height: 25vh;
  }
  
  .panels-header {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-base);
  }
  
  .game-controls-section {
    min-height: 150px;
  }
  
  .stats-modal {
    margin: var(--spacing-1);
    border-radius: var(--radius-lg);
  }
  
  .setup-message {
    padding: var(--spacing-4);
    margin: var(--spacing-2);
  }
  
  .setup-message h3 {
    font-size: var(--font-size-xl);
  }
  
  .setup-message p {
    font-size: var(--font-size-base);
  }
}

/* Animation Keyframes */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-leave {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .game-header {
    background: #000;
    color: #fff;
  }
  
  .game-board-section,
  .player-panels-section,
  .game-controls-section {
    border-color: #000;
    border-width: 3px;
  }
  
  .toggle-btn,
  .restart-btn,
  .history-btn {
    border-color: #fff;
    border-width: 2px;
  }
  
  .btn.primary {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .toggle-btn,
  .restart-btn,
  .history-btn,
  .btn,
  .close-stats-btn {
    transition: none;
    animation: none;
  }
  
  .toggle-btn:hover,
  .restart-btn:hover,
  .history-btn:hover,
  .btn:hover,
  .close-stats-btn:hover {
    transform: none;
  }
  
  .stats-modal-overlay,
  .stats-modal {
    animation: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}

/* Focus Management */
.game-header:focus-within {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.skip-to-content:focus,
.toggle-btn:focus,
.restart-btn:focus,
.history-btn:focus,
.btn:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  #monopoly-app {
    background: white;
  }
  
  .game-header {
    background: white;
    color: black;
    box-shadow: none;
    border-bottom: 2px solid black;
  }
  
  .game-controls-header {
    display: none;
  }
  
  .game-container {
    display: block;
    padding: 0;
  }
  
  .game-board-section,
  .player-panels-section,
  .game-controls-section {
    box-shadow: none;
    border: 2px solid black;
    margin-bottom: 1rem;
    page-break-inside: avoid;
  }
  
  .game-controls-section {
    display: none;
  }
  
  .stats-modal-overlay {
    position: static;
    background: none;
    backdrop-filter: none;
  }
  
  .stats-modal {
    box-shadow: none;
    border: 2px solid black;
  }
  
  .close-stats-btn {
    display: none;
  }
}
</style>
