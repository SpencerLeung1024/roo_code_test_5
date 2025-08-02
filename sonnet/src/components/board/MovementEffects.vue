<template>
  <div class="movement-effects-container">
    <!-- Money Change Animations -->
    <div 
      v-for="effect in moneyEffects" 
      :key="effect.id"
      class="money-effect"
      :class="effect.type"
      :style="effect.style"
    >
      <div class="money-change">
        <span class="money-symbol">{{ effect.symbol }}</span>
        <span class="money-amount">${{ effect.amount.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Property Purchase Effects -->
    <div 
      v-for="effect in propertyEffects" 
      :key="effect.id"
      class="property-effect"
      :style="effect.style"
    >
      <div class="property-purchase">
        <span class="property-icon">🏠</span>
        <span class="property-text">{{ effect.text }}</span>
      </div>
    </div>

    <!-- Special Event Effects -->
    <div 
      v-for="effect in specialEffects" 
      :key="effect.id"
      class="special-effect"
      :class="effect.eventType"
      :style="effect.style"
    >
      <div class="special-content">
        <span class="special-icon">{{ effect.icon }}</span>
        <span class="special-text">{{ effect.text }}</span>
      </div>
    </div>

    <!-- Dice Result Celebration -->
    <div 
      v-if="showDiceCelebration"
      class="dice-celebration"
      :class="celebrationType"
    >
      <div class="celebration-content">
        <div class="celebration-icon">{{ celebrationIcon }}</div>
        <div class="celebration-text">{{ celebrationText }}</div>
      </div>
    </div>

    <!-- Turn Transition Effects -->
    <div 
      v-if="showTurnTransition"
      class="turn-transition"
    >
      <div class="transition-content">
        <div class="current-player">
          <span class="player-piece" :style="{ color: currentPlayer?.color }">
            {{ getPlayerPieceSymbol(currentPlayer?.piece) }}
          </span>
          <span class="player-name">{{ currentPlayer?.name }}'s Turn</span>
        </div>
      </div>
    </div>

    <!-- Floating Notifications -->
    <div class="floating-notifications">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="notification.type"
        :style="notification.style"
      >
        <div class="notification-content">
          <span class="notification-icon">{{ notification.icon }}</span>
          <span class="notification-text">{{ notification.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'MovementEffects',
  
  props: {
    gameState: {
      type: Object,
      required: true
    }
  },

  emits: ['effect-complete'],

  setup(props, { emit }) {
    const moneyEffects = ref([])
    const propertyEffects = ref([])
    const specialEffects = ref([])
    const notifications = ref([])
    const showDiceCelebration = ref(false)
    const showTurnTransition = ref(false)
    const celebrationType = ref('')
    const celebrationIcon = ref('')
    const celebrationText = ref('')
    const effectIdCounter = ref(0)

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

    // Computed properties
    const currentPlayer = computed(() => {
      return props.gameState.players?.[props.gameState.currentPlayerIndex]
    })

    // Get player piece symbol
    const getPlayerPieceSymbol = (piece) => {
      return gamePieces[piece] || piece || '❓'
    }

    // Create money change effect
    const createMoneyEffect = (playerId, amount, position = null) => {
      const player = props.gameState.players.find(p => p.id === playerId)
      if (!player) return

      const effectId = `money-${effectIdCounter.value++}`
      const isPositive = amount > 0
      
      // Default position to player's current board position if not provided
      const effectPosition = position || getPlayerBoardPosition(player.position)
      
      const effect = {
        id: effectId,
        type: isPositive ? 'gain' : 'loss',
        symbol: isPositive ? '+' : '-',
        amount: Math.abs(amount),
        style: {
          position: 'absolute',
          left: effectPosition.x + 'px',
          top: effectPosition.y + 'px',
          transform: 'translate(-50%, -100%)',
          animation: 'moneyFloat 2s ease-out forwards'
        }
      }
      
      moneyEffects.value.push(effect)
      
      // Remove effect after animation
      setTimeout(() => {
        const index = moneyEffects.value.findIndex(e => e.id === effectId)
        if (index > -1) {
          moneyEffects.value.splice(index, 1)
        }
      }, 2000)
    }

    // Create property purchase effect
    const createPropertyEffect = (propertyName, position) => {
      const effectId = `property-${effectIdCounter.value++}`
      
      const effect = {
        id: effectId,
        text: `Purchased ${propertyName}!`,
        style: {
          position: 'absolute',
          left: position.x + 'px',
          top: position.y + 'px',
          transform: 'translate(-50%, -100%)',
          animation: 'propertyPop 1.5s ease-out forwards'
        }
      }
      
      propertyEffects.value.push(effect)
      
      setTimeout(() => {
        const index = propertyEffects.value.findIndex(e => e.id === effectId)
        if (index > -1) {
          propertyEffects.value.splice(index, 1)
        }
      }, 1500)
    }

    // Create special event effect
    const createSpecialEffect = (eventType, message, icon, position) => {
      const effectId = `special-${effectIdCounter.value++}`
      
      const effect = {
        id: effectId,
        eventType,
        text: message,
        icon,
        style: {
          position: 'absolute',
          left: position.x + 'px',
          top: position.y + 'px',
          transform: 'translate(-50%, -100%)',
          animation: 'specialBurst 2s ease-out forwards'
        }
      }
      
      specialEffects.value.push(effect)
      
      setTimeout(() => {
        const index = specialEffects.value.findIndex(e => e.id === effectId)
        if (index > -1) {
          specialEffects.value.splice(index, 1)
        }
      }, 2000)
    }

    // Create floating notification
    const createNotification = (message, type = 'info', icon = 'ℹ️', duration = 3000) => {
      const effectId = `notification-${effectIdCounter.value++}`
      
      const notification = {
        id: effectId,
        message,
        type,
        icon,
        style: {
          animation: 'notificationSlide 0.5s ease-out forwards'
        }
      }
      
      notifications.value.push(notification)
      
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === effectId)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }, duration)
    }

    // Show dice celebration effect
    const showDiceResult = (diceTotal, isDoubles, doublesCount) => {
      if (isDoubles) {
        celebrationType.value = 'doubles'
        celebrationIcon.value = '🎲'
        celebrationText.value = doublesCount >= 3 ? 'Three Doubles - Go to Jail!' : 
                                doublesCount > 1 ? `${doublesCount} Doubles in a Row!` : 'Doubles!'
      } else if (diceTotal >= 10) {
        celebrationType.value = 'high-roll'
        celebrationIcon.value = '🔥'
        celebrationText.value = 'Great Roll!'
      } else {
        return // No celebration for normal rolls
      }
      
      showDiceCelebration.value = true
      
      setTimeout(() => {
        showDiceCelebration.value = false
      }, 2000)
    }

    // Show turn transition
    const showPlayerTurnTransition = (player) => {
      showTurnTransition.value = true
      
      setTimeout(() => {
        showTurnTransition.value = false
      }, 2000)
    }

    // Get player board position
    const getPlayerBoardPosition = (spaceIndex) => {
      // This should match the board layout calculation from PlayerMovement
      const boardSize = 600
      const cornerSize = 80
      const spaceSize = (boardSize - 2 * cornerSize) / 9
      
      // Calculate position based on space index (simplified)
      if (spaceIndex <= 10) {
        // Bottom row
        return {
          x: boardSize - (spaceIndex * spaceSize),
          y: boardSize - cornerSize / 2
        }
      } else if (spaceIndex <= 20) {
        // Left side
        return {
          x: cornerSize / 2,
          y: boardSize - cornerSize - ((spaceIndex - 10) * spaceSize)
        }
      } else if (spaceIndex <= 30) {
        // Top row
        return {
          x: (spaceIndex - 20) * spaceSize,
          y: cornerSize / 2
        }
      } else {
        // Right side
        return {
          x: boardSize - cornerSize / 2,
          y: cornerSize + ((spaceIndex - 30) * spaceSize)
        }
      }
    }

    // Public API methods
    const triggerMoneyChange = (playerId, amount, position) => {
      createMoneyEffect(playerId, amount, position)
    }

    const triggerPropertyPurchase = (propertyName, spaceIndex) => {
      const position = getPlayerBoardPosition(spaceIndex)
      createPropertyEffect(propertyName, position)
    }

    const triggerSpecialEvent = (eventType, message, icon, spaceIndex) => {
      const position = getPlayerBoardPosition(spaceIndex)
      createSpecialEffect(eventType, message, icon, position)
    }

    const triggerDiceResult = (diceTotal, isDoubles, doublesCount) => {
      showDiceResult(diceTotal, isDoubles, doublesCount)
    }

    const triggerTurnTransition = (player) => {
      showPlayerTurnTransition(player)
    }

    const triggerNotification = (message, type, icon, duration) => {
      createNotification(message, type, icon, duration)
    }

    // Handle passing GO effect
    const triggerPassedGO = (playerId) => {
      const player = props.gameState.players.find(p => p.id === playerId)
      if (!player) return

      const goPosition = getPlayerBoardPosition(0)
      createMoneyEffect(playerId, 200, goPosition)
      createSpecialEffect('passed-go', 'Passed GO!', '💰', goPosition)
      createNotification(`${player.name} collected $200 for passing GO!`, 'success', '💰')
    }

    return {
      moneyEffects,
      propertyEffects,
      specialEffects,
      notifications,
      showDiceCelebration,
      showTurnTransition,
      celebrationType,
      celebrationIcon,
      celebrationText,
      currentPlayer,
      getPlayerPieceSymbol,
      triggerMoneyChange,
      triggerPropertyPurchase,
      triggerSpecialEvent,
      triggerDiceResult,
      triggerTurnTransition,
      triggerNotification,
      triggerPassedGO
    }
  }
}
</script>

<style scoped>
.movement-effects-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 200;
}

/* Money Effects */
.money-effect {
  pointer-events: none;
}

.money-change {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.money-effect.gain .money-change {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
}

.money-effect.loss .money-change {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
}

.money-symbol {
  font-size: 1.3rem;
}

/* Property Effects */
.property-effect {
  pointer-events: none;
}

.property-purchase {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  white-space: nowrap;
}

.property-icon {
  font-size: 1.2rem;
}

/* Special Effects */
.special-effect {
  pointer-events: none;
}

.special-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.special-effect.passed-go .special-content {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
}

.special-effect.go-to-jail .special-content {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
}

.special-effect.chance .special-content,
.special-effect.community-chest .special-content {
  background: linear-gradient(45deg, #9b59b6, #8e44ad);
  color: white;
}

.special-icon {
  font-size: 1.2rem;
}

/* Dice Celebration */
.dice-celebration {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 30px;
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  border-radius: 15px;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
  animation: celebrationBurst 2s ease-out forwards;
}

.dice-celebration.doubles .celebration-content {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  animation: celebrationShake 2s ease-out forwards;
}

.celebration-icon {
  font-size: 3rem;
}

.celebration-text {
  font-size: 1.3rem;
  text-align: center;
}

/* Turn Transition */
.turn-transition {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

.transition-content {
  padding: 12px 24px;
  background: linear-gradient(45deg, #2c3e50, #34495e);
  color: white;
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(44, 62, 80, 0.3);
  animation: turnSlideDown 2s ease-out forwards;
}

.current-player {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-piece {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Floating Notifications */
.floating-notifications {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 998;
}

.notification {
  max-width: 300px;
  pointer-events: auto;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.notification.success .notification-content {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.notification.error .notification-content {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.notification.info .notification-content {
  background: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.notification.warning .notification-content {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.notification-icon {
  font-size: 1.1rem;
}

/* Animations */
@keyframes moneyFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -150%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -200%) scale(0.8);
  }
}

@keyframes propertyPop {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -120%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -140%) scale(1);
  }
}

@keyframes specialBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(0.3) rotate(-10deg);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -130%) scale(1.2) rotate(5deg);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, -140%) scale(1) rotate(-2deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -160%) scale(0.8) rotate(0deg);
  }
}

@keyframes celebrationBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

@keyframes celebrationShake {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translate(-50%, -50%) scale(1) rotate(-2deg);
  }
  20%, 40%, 60%, 80% {
    transform: translate(-50%, -50%) scale(1) rotate(2deg);
  }
}

@keyframes turnSlideDown {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%);
  }
}

@keyframes notificationSlide {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .floating-notifications {
    right: 10px;
    top: 60px;
  }
  
  .notification {
    max-width: 250px;
  }
  
  .celebration-content {
    padding: 15px 20px;
  }
  
  .celebration-icon {
    font-size: 2.5rem;
  }
  
  .celebration-text {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .money-change,
  .property-purchase,
  .special-content {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  
  .notification {
    max-width: 200px;
  }
  
  .notification-content {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>