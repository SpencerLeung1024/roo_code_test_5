<template>
  <div class="game-board">
    <!-- 11x11 CSS Grid for the board -->
    <div class="board-grid">
      <!-- Corner spaces -->
      <BoardSpace 
        v-for="space in cornerSpaces" 
        :key="space.id"
        :space="space"
        :players-on-space="space.playersOnSpace || []"
        :class="getSpaceClasses(space)"
        :style="getSpacePosition(space)"
        @space-click="handleSpaceClick"
      />
      
      <!-- Side spaces -->
      <BoardSpace 
        v-for="space in sideSpaces" 
        :key="space.id"
        :space="space"
        :players-on-space="space.playersOnSpace || []"
        :class="getSpaceClasses(space)"
        :style="getSpacePosition(space)"
        @space-click="handleSpaceClick"
      />
      
      <!-- Player Movement Animation Layer -->
      <PlayerMovement
        :game-state="gameState"
        :is-animating="gameState.animations?.movementInProgress"
        :show-trail="true"
        :show-effects="true"
        :animation-speed="gameState.animations?.animationSpeed || 1"
        @movement-complete="handleMovementComplete"
        @space-reached="handleSpaceReached"
        @special-event="handleSpecialEvent"
        ref="playerMovement"
      />
      
      <!-- Movement Effects Layer -->
      <MovementEffects
        :game-state="gameState"
        ref="movementEffects"
        @effect-complete="handleEffectComplete"
      />
      
      <!-- Center area for game information -->
      <div class="board-center">
        <div class="game-info">
          <h2>Monopoly</h2>
          <div class="current-turn" v-if="currentPlayer">
            <div class="turn-indicator">
              <span class="player-name">{{ currentPlayer.name }}</span>
              <div 
                class="player-piece-indicator" 
                :style="{ backgroundColor: currentPlayer.color }"
              ></div>
            </div>
            <div class="turn-phase">{{ gameStatus }}</div>
          </div>
          
          <!-- Movement Status -->
          <div v-if="gameState.animations?.movementInProgress" class="movement-status">
            <div class="movement-info">
              <span class="moving-player">{{ getMovingPlayerName() }} is moving...</span>
              <div class="movement-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: movementProgress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="dice-display" v-if="dice.lastRoll">
            <div class="dice-container">
              <div class="die">{{ dice.die1 }}</div>
              <div class="die">{{ dice.die2 }}</div>
            </div>
            <div class="dice-total">Total: {{ dice.total }}</div>
            <div class="doubles-indicator" v-if="dice.isDoubles">
              DOUBLES! {{ dice.doublesCount > 0 ? `(${dice.doublesCount})` : '' }}
            </div>
          </div>
          
          <div class="game-stats">
            <div class="stat-item">Turn: {{ turnNumber }}</div>
            <div class="stat-item">Properties Owned: {{ propertiesOwnedCount }}</div>
            <div class="stat-item">Bank Houses: {{ bank.houses }}</div>
            <div class="stat-item">Bank Hotels: {{ bank.hotels }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import BoardSpace from './BoardSpace.vue'
import PlayerMovement from './PlayerMovement.vue'
import MovementEffects from './MovementEffects.vue'
import { gameState, gameComputed } from '../../game/gameState.js'

export default {
  name: 'GameBoard',
  components: {
    BoardSpace,
    PlayerMovement,
    MovementEffects
  },

  emits: [
    'space-click', 
    'movement-complete',
    'space-reached', 
    'special-event',
    'money-changed',
    'property-purchased'
  ],
  
  setup(props, { emit }) {
    const playerMovement = ref(null)
    const movementEffects = ref(null)
    const movementProgress = ref(0)

    // Separate spaces by type for easier grid positioning
    const cornerSpaces = computed(() => 
      gameState.board.filter(space => 
        [0, 10, 20, 30].includes(space.id)
      )
    )
    
    const sideSpaces = computed(() => 
      gameState.board.filter(space => 
        ![0, 10, 20, 30].includes(space.id)
      )
    )
    
    // Get CSS classes for each space
    const getSpaceClasses = (space) => {
      const classes = ['board-space', `space-${space.type}`]
      
      if (space.type === 'property') {
        classes.push('property-space')
      } else if (space.type === 'railroad') {
        classes.push('railroad-space')
      } else if (space.type === 'utility') {
        classes.push('utility-space')
      } else if (space.type === 'special') {
        classes.push('special-space', `special-${space.specialType}`)
      } else if (space.type === 'card') {
        classes.push('card-space', `card-${space.cardType}`)
      } else if (space.type === 'tax') {
        classes.push('tax-space')
      }
      
      // Add side class
      classes.push(`side-${space.side}`)
      
      return classes
    }
    
    // Calculate grid position for each space
    const getSpacePosition = (space) => {
      let gridColumn, gridRow
      
      switch (space.side) {
        case 'bottom':
          gridRow = 11
          gridColumn = 11 - space.sidePosition
          break
        case 'left':
          gridColumn = 1
          gridRow = 11 - space.sidePosition
          break
        case 'top':
          gridRow = 1
          gridColumn = 2 + space.sidePosition
          break
        case 'right':
          gridColumn = 11
          gridRow = 2 + space.sidePosition
          break
        default:
          gridRow = 1
          gridColumn = 1
      }
      
      return {
        gridColumn: gridColumn,
        gridRow: gridRow
      }
    }

    // Event handlers
    const handleSpaceClick = (space) => {
      emit('space-click', space)
    }

    const handleMovementComplete = (data) => {
      emit('movement-complete', data)
    }

    const handleSpaceReached = (data) => {
      emit('space-reached', data)
    }

    const handleSpecialEvent = (data) => {
      emit('special-event', data)
      
      // Trigger appropriate effects
      if (data.type === 'passed-go') {
        movementEffects.value?.triggerPassedGO(data.playerId)
      } else if (data.type === 'go-to-jail') {
        movementEffects.value?.triggerSpecialEvent('go-to-jail', 'Go to Jail!', '👮', 10)
      }
    }

    const handleEffectComplete = (data) => {
      // Handle effect completion if needed
    }

    // Get moving player name
    const getMovingPlayerName = () => {
      const playerId = gameState.animations?.currentMovingPlayer
      if (!playerId) return ''
      
      const player = gameState.players?.find(p => p.id === playerId)
      return player?.name || 'Player'
    }

    // Public methods for parent components
    const startPlayerMovement = async (playerId, fromSpace, toSpace, spacesToMove) => {
      if (playerMovement.value) {
        await playerMovement.value.animatePlayerMovement(playerId, fromSpace, toSpace, spacesToMove)
      }
    }

    const teleportPlayer = async (playerId, toSpace) => {
      if (playerMovement.value) {
        await playerMovement.value.teleportPlayer(playerId, toSpace)
      }
    }

    const triggerMoneyChange = (playerId, amount, position) => {
      if (movementEffects.value) {
        movementEffects.value.triggerMoneyChange(playerId, amount, position)
      }
      emit('money-changed', { playerId, amount })
    }

    const triggerPropertyPurchase = (propertyName, spaceIndex) => {
      if (movementEffects.value) {
        movementEffects.value.triggerPropertyPurchase(propertyName, spaceIndex)
      }
      emit('property-purchased', { propertyName, spaceIndex })
    }

    const triggerDiceResult = (diceTotal, isDoubles, doublesCount) => {
      if (movementEffects.value) {
        movementEffects.value.triggerDiceResult(diceTotal, isDoubles, doublesCount)
      }
    }

    const triggerTurnTransition = (player) => {
      if (movementEffects.value) {
        movementEffects.value.triggerTurnTransition(player)
      }
    }

    const triggerNotification = (message, type = 'info', icon = 'ℹ️', duration = 3000) => {
      if (movementEffects.value) {
        movementEffects.value.triggerNotification(message, type, icon, duration)
      }
    }

    // Watch for movement progress updates
    watch(() => gameState.animations?.movementInProgress, (isMoving) => {
      if (isMoving) {
        movementProgress.value = 0
        // Simulate movement progress
        const interval = setInterval(() => {
          movementProgress.value += 10
          if (movementProgress.value >= 100 || !gameState.animations?.movementInProgress) {
            clearInterval(interval)
            movementProgress.value = 100
          }
        }, 200)
      }
    })
    
    return {
      // Refs
      playerMovement,
      movementEffects,
      movementProgress,

      // Game state
      gameState,
      currentPlayer: gameComputed.currentPlayer,
      gameStatus: gameComputed.gameStatus,
      propertiesOwnedCount: gameComputed.propertiesOwnedCount,
      
      // Reactive references
      dice: gameState.dice,
      turnNumber: computed(() => gameState.turnNumber),
      bank: gameState.bank,
      
      // Computed spaces
      cornerSpaces,
      sideSpaces,
      
      // Methods
      getSpaceClasses,
      getSpacePosition,
      handleSpaceClick,
      handleMovementComplete,
      handleSpaceReached,
      handleSpecialEvent,
      handleEffectComplete,
      getMovingPlayerName,
      startPlayerMovement,
      teleportPlayer,
      triggerMoneyChange,
      triggerPropertyPurchase,
      triggerDiceResult,
      triggerTurnTransition,
      triggerNotification
    }
  }
}
</script>

<style scoped>
.game-board {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  grid-template-rows: repeat(11, 1fr);
  gap: 2px;
  width: min(80vh, 80vw);
  height: min(80vh, 80vw);
  background: #2c3e50;
  border: 4px solid #2c3e50;
  border-radius: 8px;
  position: relative;
}

/* Board center area */
.board-center {
  grid-column: 2 / 11;
  grid-row: 2 / 11;
  background: #ecf0f1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.game-info {
  text-align: center;
  color: #2c3e50;
}

.game-info h2 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

/* Current turn display */
.current-turn {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.turn-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.player-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.player-piece-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #2c3e50;
}

.turn-phase {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: capitalize;
}

/* Movement status */
.movement-status {
  margin-bottom: 15px;
  padding: 10px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.movement-info {
  text-align: center;
}

.moving-player {
  font-size: 0.9rem;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.movement-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* Dice display */
.dice-display {
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dice-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 8px;
}

.die {
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #2c3e50;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.dice-total {
  font-weight: bold;
  color: #2c3e50;
}

.doubles-indicator {
  color: #e74c3c;
  font-weight: bold;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* Game stats */
.game-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 0.8rem;
}

.stat-item {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  text-align: center;
  color: #2c3e50;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-board {
    padding: 10px;
  }
  
  .board-grid {
    width: 95vw;
    height: 95vw;
  }
  
  .game-info h2 {
    font-size: 1.8rem;
  }
  
  .game-stats {
    grid-template-columns: 1fr;
    font-size: 0.7rem;
  }
  
  .die {
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
  }

  .movement-status {
    padding: 8px;
    margin-bottom: 10px;
  }

  .moving-player {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .board-center {
    padding: 10px;
  }
  
  .game-info h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .current-turn,
  .dice-display {
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .player-name {
    font-size: 1rem;
  }
  
  .die {
    width: 25px;
    height: 25px;
    font-size: 1rem;
  }

  .movement-status {
    padding: 6px;
  }

  .moving-player {
    font-size: 0.7rem;
  }
}
</style>