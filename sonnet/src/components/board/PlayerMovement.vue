<template>
  <div class="player-movement-container">
    <!-- Moving Player Piece (rendered during animation) -->
    <div 
      v-if="isMoving"
      class="moving-player-piece"
      :style="movingPieceStyle"
      ref="movingPiece"
    >
      <div 
        class="player-piece-animated"
        :style="{ 
          backgroundColor: movingPlayer?.color,
          borderColor: movingPlayer?.color === '#ffffff' ? '#2c3e50' : '#ffffff'
        }"
      >
        {{ getPlayerPieceSymbol(movingPlayer?.piece) }}
      </div>
    </div>

    <!-- Movement Trail -->
    <div v-if="showTrail && movementTrail.length > 0" class="movement-trail">
      <div 
        v-for="(trailSpace, index) in movementTrail"
        :key="`trail-${index}`"
        class="trail-dot"
        :class="{ 'active': index <= currentTrailIndex }"
        :style="getTrailDotStyle(trailSpace)"
      ></div>
    </div>

    <!-- Movement Effects -->
    <div v-if="showEffects" class="movement-effects">
      <!-- Passing GO Effect -->
      <div 
        v-if="passedGO"
        class="go-effect"
        :style="getGOEffectStyle()"
      >
        <div class="go-bonus">
          <span class="go-icon">💰</span>
          <span class="go-text">+$200</span>
        </div>
      </div>

      <!-- Special Movement Effects -->
      <div 
        v-if="specialMovement"
        class="special-effect"
        :class="specialMovement.type"
        :style="getSpecialEffectStyle()"
      >
        <div class="special-content">
          <span class="special-icon">{{ specialMovement.icon }}</span>
          <span class="special-text">{{ specialMovement.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'PlayerMovement',
  
  props: {
    gameState: {
      type: Object,
      required: true
    },
    isAnimating: {
      type: Boolean,
      default: false
    },
    showTrail: {
      type: Boolean,
      default: true
    },
    showEffects: {
      type: Boolean,
      default: true
    },
    animationSpeed: {
      type: Number,
      default: 1 // 1 = normal, 0.5 = half speed, 2 = double speed
    }
  },

  emits: ['movement-complete', 'space-reached', 'special-event'],

  setup(props, { emit }) {
    const isMoving = ref(false)
    const movingPlayer = ref(null)
    const currentPosition = ref({ x: 0, y: 0 })
    const movementTrail = ref([])
    const currentTrailIndex = ref(-1)
    const passedGO = ref(false)
    const specialMovement = ref(null)
    const movingPiece = ref(null)

    // Game pieces mapping
    const gamePieces = {
      'car': '🚗',
      'dog': '🐕',
      'hat': '🎩',
      'boot': '👢',
      'ship': '🚢',
      'thimble': '🪡',
      'iron': '🔨',
      'wheelbarrow': '🛍️'
    }

    // Board layout calculations
    const boardSize = 600 // Assuming board is 600x600px
    const cornerSize = 80
    const spaceSize = (boardSize - 2 * cornerSize) / 9

    // Calculate position for each board space
    const getBoardSpacePosition = (spaceIndex) => {
      const positions = []
      
      // Bottom row (0-10) - Right to left
      for (let i = 0; i <= 10; i++) {
        positions.push({
          x: boardSize - (i * (spaceSize + (i === 0 || i === 10 ? cornerSize - spaceSize : 0))),
          y: boardSize - cornerSize
        })
      }
      
      // Left side (11-19) - Bottom to top
      for (let i = 1; i <= 9; i++) {
        positions.push({
          x: 0,
          y: boardSize - cornerSize - (i * spaceSize)
        })
      }
      
      // Top row (20-30) - Left to right
      for (let i = 0; i <= 10; i++) {
        positions.push({
          x: i * (spaceSize + (i === 0 || i === 10 ? cornerSize - spaceSize : 0)),
          y: 0
        })
      }
      
      // Right side (31-39) - Top to bottom
      for (let i = 1; i <= 9; i++) {
        positions.push({
          x: boardSize - cornerSize,
          y: i * spaceSize
        })
      }

      return positions[spaceIndex] || { x: 0, y: 0 }
    }

    // Computed styles
    const movingPieceStyle = computed(() => ({
      position: 'absolute',
      left: currentPosition.value.x + 'px',
      top: currentPosition.value.y + 'px',
      zIndex: 1000,
      transition: 'none',
      transform: 'translate(-50%, -50%)'
    }))

    // Get player piece symbol
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    // Get trail dot style
    const getTrailDotStyle = (spaceIndex) => {
      const position = getBoardSpacePosition(spaceIndex)
      return {
        position: 'absolute',
        left: position.x + 'px',
        top: position.y + 'px',
        transform: 'translate(-50%, -50%)'
      }
    }

    // Get GO effect style
    const getGOEffectStyle = () => {
      const goPosition = getBoardSpacePosition(0)
      return {
        position: 'absolute',
        left: goPosition.x + 'px',
        top: goPosition.y - 50 + 'px',
        transform: 'translate(-50%, -50%)'
      }
    }

    // Get special effect style
    const getSpecialEffectStyle = () => {
      return {
        position: 'absolute',
        left: currentPosition.value.x + 'px',
        top: currentPosition.value.y - 60 + 'px',
        transform: 'translate(-50%, -50%)'
      }
    }

    // Calculate movement path
    const calculateMovementPath = (fromSpace, toSpace, spaces) => {
      const path = []
      let current = fromSpace
      
      for (let i = 0; i < spaces; i++) {
        current = (current + 1) % 40
        path.push(current)
      }
      
      return path
    }

    // Animate player movement
    const animatePlayerMovement = async (playerId, fromSpace, toSpace, spacesToMove) => {
      console.log('[PlayerMovement] Starting animation:', { playerId, fromSpace, toSpace, spacesToMove })
      const player = props.gameState.players.find(p => p.id === playerId)
      if (!player) {
        console.error('[PlayerMovement] Player not found:', playerId)
        return
      }

      isMoving.value = true
      movingPlayer.value = player
      console.log('[PlayerMovement] Set isMoving to true')
      
      // Calculate movement path
      const path = calculateMovementPath(fromSpace, toSpace, spacesToMove)
      movementTrail.value = path
      currentTrailIndex.value = -1
      
      // Set initial position
      const startPosition = getBoardSpacePosition(fromSpace)
      currentPosition.value = { ...startPosition }
      
      // Check for special events
      passedGO.value = path.includes(0) && fromSpace !== 0
      
      // Animate each step
      const stepDuration = Math.max(150 / props.animationSpeed, 50) // Minimum 50ms per step
      
      for (let i = 0; i < path.length; i++) {
        const targetSpace = path[i]
        const targetPosition = getBoardSpacePosition(targetSpace)
        
        // Update trail
        currentTrailIndex.value = i
        
        // Animate to target position
        await animateToPosition(targetPosition, stepDuration)
        
        // Emit space reached event
        emit('space-reached', { playerId, spaceIndex: targetSpace })
        
        // Check for passing GO
        if (targetSpace === 0 && passedGO.value) {
          await showGOEffect()
        }
        
        // Check for special movements
        const spaceData = props.gameState.board[targetSpace]
        if (spaceData && spaceData.type === 'special') {
          await showSpecialEffect(spaceData)
        }
      }
      
      // Clean up
      console.log('[PlayerMovement] Movement animation completed, cleaning up...')
      setTimeout(() => {
        console.log('[PlayerMovement] Cleanup timeout triggered')
        isMoving.value = false
        movingPlayer.value = null
        movementTrail.value = []
        passedGO.value = false
        specialMovement.value = null
        
        console.log('[PlayerMovement] Emitting movement-complete event:', { playerId, finalSpace: toSpace })
        emit('movement-complete', { playerId, finalSpace: toSpace })
      }, 500)
    }

    // Animate to specific position
    const animateToPosition = (targetPosition, duration) => {
      return new Promise((resolve) => {
        const startTime = Date.now()
        const startPosition = { ...currentPosition.value }
        const deltaX = targetPosition.x - startPosition.x
        const deltaY = targetPosition.y - startPosition.y
        
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3)
          
          currentPosition.value = {
            x: startPosition.x + (deltaX * easeOut),
            y: startPosition.y + (deltaY * easeOut)
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve()
          }
        }
        
        animate()
      })
    }

    // Show GO passing effect
    const showGOEffect = () => {
      return new Promise((resolve) => {
        emit('special-event', { 
          type: 'passed-go', 
          playerId: movingPlayer.value?.id,
          amount: 200 
        })
        setTimeout(resolve, 1000)
      })
    }

    // Show special movement effect
    const showSpecialEffect = (spaceData) => {
      return new Promise((resolve) => {
        const effects = {
          'go': { icon: '🏠', text: 'Collect $200' },
          'goToJail': { icon: '👮', text: 'Go to Jail!' },
          'jail': { icon: '🔒', text: 'Just Visiting' },
          'freeParking': { icon: '🅿️', text: 'Free Parking' }
        }
        
        const effect = effects[spaceData.specialType] || { icon: '❓', text: 'Special Space' }
        specialMovement.value = { 
          type: spaceData.specialType,
          ...effect 
        }
        
        emit('special-event', { 
          type: spaceData.specialType, 
          playerId: movingPlayer.value?.id,
          spaceData 
        })
        
        setTimeout(() => {
          specialMovement.value = null
          resolve()
        }, 1500)
      })
    }

    // Teleport player (for special movements like Go to Jail)
    const teleportPlayer = async (playerId, toSpace) => {
      const player = props.gameState.players.find(p => p.id === playerId)
      if (!player) return

      isMoving.value = true
      movingPlayer.value = player
      
      const startPosition = getBoardSpacePosition(player.position)
      const targetPosition = getBoardSpacePosition(toSpace)
      
      currentPosition.value = { ...startPosition }
      
      // Special teleport effect
      specialMovement.value = { 
        type: 'teleport', 
        icon: '⚡', 
        text: 'Teleporting...' 
      }
      
      // Quick fade out and in effect
      if (movingPiece.value) {
        movingPiece.value.style.opacity = '0'
        movingPiece.value.style.transform = 'translate(-50%, -50%) scale(0.5)'
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      currentPosition.value = { ...targetPosition }
      
      if (movingPiece.value) {
        movingPiece.value.style.opacity = '1'
        movingPiece.value.style.transform = 'translate(-50%, -50%) scale(1)'
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      isMoving.value = false
      movingPlayer.value = null
      specialMovement.value = null
      
      emit('movement-complete', { playerId, finalSpace: toSpace })
    }

    // Watch for animation requests
    watch(() => props.isAnimating, (newValue) => {
      if (newValue && props.gameState.animations?.playerMoving) {
        // Animation will be triggered by parent component
      }
    })

    return {
      isMoving,
      movingPlayer,
      currentPosition,
      movementTrail,
      currentTrailIndex,
      passedGO,
      specialMovement,
      movingPiece,
      movingPieceStyle,
      getPlayerPieceSymbol,
      getTrailDotStyle,
      getGOEffectStyle,
      getSpecialEffectStyle,
      animatePlayerMovement,
      teleportPlayer
    }
  }
}
</script>

<style scoped>
.player-movement-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.moving-player-piece {
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.player-piece-animated {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: playerBounce 0.6s ease-in-out infinite alternate;
}

.movement-trail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.trail-dot {
  width: 8px;
  height: 8px;
  background: rgba(243, 156, 18, 0.4);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.trail-dot.active {
  background: #f39c12;
  transform: translate(-50%, -50%) scale(1.5);
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.5);
}

.movement-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.go-effect {
  animation: bounceInScale 1s ease-out;
}

.go-bonus {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.go-icon {
  font-size: 1.2rem;
}

.special-effect {
  animation: specialAppear 1.5s ease-out;
}

.special-content {
  background: linear-gradient(45deg, #9b59b6, #8e44ad);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.special-effect.goToJail .special-content {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.special-effect.teleport .special-content {
  background: linear-gradient(45deg, #3498db, #2980b9);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.special-icon {
  font-size: 1.2rem;
}

/* Animations */
@keyframes playerBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

@keyframes bounceInScale {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes specialAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5) rotateY(90deg);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1) rotateY(0deg);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotateY(0deg);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .player-piece-animated {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  
  .trail-dot {
    width: 6px;
    height: 6px;
  }
  
  .go-bonus,
  .special-content {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .go-icon,
  .special-icon {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .player-piece-animated {
    width: 14px;
    height: 14px;
    font-size: 8px;
  }
  
  .trail-dot {
    width: 5px;
    height: 5px;
  }
  
  .go-bonus,
  .special-content {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}
</style>