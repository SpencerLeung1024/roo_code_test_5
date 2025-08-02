<template>
  <div class="dice-roller">
    <!-- Dice Container -->
    <div class="dice-container">
      <div 
        class="dice-3d" 
        :class="{ 
          'rolling': isRolling, 
          'bounce': showBounce 
        }"
        ref="dice1"
      >
        <div class="dice-face dice-face-1">
          <div class="dot center"></div>
        </div>
        <div class="dice-face dice-face-2">
          <div class="dot top-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-3">
          <div class="dot top-left"></div>
          <div class="dot center"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-4">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-5">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot center"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-6">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot middle-left"></div>
          <div class="dot middle-right"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
      </div>

      <div 
        class="dice-3d" 
        :class="{ 
          'rolling': isRolling, 
          'bounce': showBounce 
        }"
        ref="dice2"
      >
        <div class="dice-face dice-face-1">
          <div class="dot center"></div>
        </div>
        <div class="dice-face dice-face-2">
          <div class="dot top-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-3">
          <div class="dot top-left"></div>
          <div class="dot center"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-4">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-5">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot center"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
        <div class="dice-face dice-face-6">
          <div class="dot top-left"></div>
          <div class="dot top-right"></div>
          <div class="dot middle-left"></div>
          <div class="dot middle-right"></div>
          <div class="dot bottom-left"></div>
          <div class="dot bottom-right"></div>
        </div>
      </div>
    </div>

    <!-- Roll Result Display -->
    <div v-if="lastRoll" class="roll-result">
      <div class="roll-total">
        <span class="total-value">{{ total }}</span>
        <span class="total-label">Total</span>
      </div>
      
      <div v-if="isDoubles" class="doubles-indicator">
        <span class="doubles-icon">🎲</span>
        <span class="doubles-text">
          Doubles! 
          <span v-if="doublesCount > 1" class="doubles-count">
            ({{ doublesCount }} in a row)
          </span>
        </span>
      </div>
      
      <div v-if="doublesCount >= 3" class="jail-warning">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">Three doubles - Go to Jail!</span>
      </div>
    </div>

    <!-- Roll Button -->
    <button 
      @click="handleRoll"
      :disabled="!canRoll || isRolling"
      class="roll-button"
      :class="{
        'rolling': isRolling,
        'can-roll': canRoll && !isRolling,
        'disabled': !canRoll || isRolling
      }"
    >
      <span v-if="isRolling" class="button-content">
        <span class="rolling-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
        Rolling...
      </span>
      <span v-else class="button-content">
        <span class="dice-icon">🎲</span>
        Roll Dice
      </span>
    </button>

    <!-- Sound Toggle -->
    <button 
      @click="toggleSound" 
      class="sound-toggle"
      :class="{ 'muted': !soundEnabled }"
      title="Toggle sound effects"
    >
      <span v-if="soundEnabled">🔊</span>
      <span v-else>🔇</span>
    </button>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'

export default {
  name: 'DiceRoller',
  
  props: {
    die1: {
      type: Number,
      default: 1
    },
    die2: {
      type: Number,
      default: 1
    },
    canRoll: {
      type: Boolean,
      default: false
    },
    doublesCount: {
      type: Number,
      default: 0
    },
    lastRoll: {
      type: Date,
      default: null
    }
  },

  emits: ['roll-dice', 'animation-complete'],

  setup(props, { emit }) {
    const isRolling = ref(false)
    const showBounce = ref(false)
    const soundEnabled = ref(true)
    const dice1 = ref(null)
    const dice2 = ref(null)

    // Computed properties
    const total = computed(() => props.die1 + props.die2)
    const isDoubles = computed(() => props.die1 === props.die2)

    // Dice face rotations for 3D effect
    const diceRotations = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: -90, y: 0, z: 0 },
      3: { x: 0, y: -90, z: 0 },
      4: { x: 0, y: 90, z: 0 },
      5: { x: 90, y: 0, z: 0 },
      6: { x: 180, y: 0, z: 0 }
    }

    // Sound effects (using Web Audio API or HTML5 Audio)
    const playSound = (soundType) => {
      if (!soundEnabled.value) return

      // Create audio context for dice sounds
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        if (soundType === 'roll') {
          // Generate dice rolling sound
          const duration = 0.8
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + duration)
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        } else if (soundType === 'land') {
          // Generate dice landing sound
          const duration = 0.2
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration)
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        }
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }

    // Set dice rotation to show specific face
    const setDiceRotation = (diceElement, value) => {
      if (!diceElement) return
      
      const rotation = diceRotations[value]
      diceElement.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
    }

    // Animate dice rolling with realistic physics
    const animateRoll = async () => {
      if (!dice1.value || !dice2.value) return

      isRolling.value = true
      playSound('roll')

      // Multiple rotation cycles for realistic effect
      const rollDuration = 1200
      const rotationSteps = 12
      const stepDuration = rollDuration / rotationSteps

      for (let i = 0; i < rotationSteps; i++) {
        const progress = i / rotationSteps
        const easing = 1 - Math.pow(1 - progress, 3) // Ease out cubic
        
        // Random rotations during animation
        const randomX1 = Math.random() * 360 * (3 - easing * 2)
        const randomY1 = Math.random() * 360 * (3 - easing * 2)
        const randomZ1 = Math.random() * 360 * (3 - easing * 2)
        
        const randomX2 = Math.random() * 360 * (3 - easing * 2)
        const randomY2 = Math.random() * 360 * (3 - easing * 2)
        const randomZ2 = Math.random() * 360 * (3 - easing * 2)

        dice1.value.style.transform = `rotateX(${randomX1}deg) rotateY(${randomY1}deg) rotateZ(${randomZ1}deg)`
        dice2.value.style.transform = `rotateX(${randomX2}deg) rotateY(${randomY2}deg) rotateZ(${randomZ2}deg)`

        await new Promise(resolve => setTimeout(resolve, stepDuration))
      }

      // Set final rotation to show rolled values
      setDiceRotation(dice1.value, props.die1)
      setDiceRotation(dice2.value, props.die2)

      // Add bounce effect
      showBounce.value = true
      setTimeout(() => {
        showBounce.value = false
      }, 600)

      playSound('land')
      isRolling.value = false
      
      emit('animation-complete')
    }

    // Handle roll button click
    const handleRoll = async () => {
      if (!props.canRoll || isRolling.value) return
      
      emit('roll-dice')
      
      // Wait for dice values to update, then animate
      await nextTick()
      animateRoll()
    }

    // Toggle sound effects
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }

    // Initialize dice rotation
    const initializeDice = () => {
      nextTick(() => {
        setDiceRotation(dice1.value, props.die1)
        setDiceRotation(dice2.value, props.die2)
      })
    }

    // Initialize on mount
    initializeDice()

    return {
      isRolling,
      showBounce,
      soundEnabled,
      dice1,
      dice2,
      total,
      isDoubles,
      handleRoll,
      toggleSound
    }
  }
}
</script>

<style scoped>
.dice-roller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

.dice-container {
  display: flex;
  gap: 2rem;
  perspective: 1000px;
}

.dice-3d {
  position: relative;
  width: 60px;
  height: 60px;
  transform-style: preserve-3d;
  transition: transform 0.1s ease;
}

.dice-3d.rolling {
  animation: diceShake 0.1s infinite;
}

.dice-3d.bounce {
  animation: diceBounce 0.6s ease-out;
}

.dice-face {
  position: absolute;
  width: 60px;
  height: 60px;
  background: #ffffff;
  border: 2px solid #2c3e50;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 0 3px #ffffff, 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dice-face-1 { transform: rotateY(0deg) translateZ(30px); }
.dice-face-2 { transform: rotateX(-90deg) translateZ(30px); }
.dice-face-3 { transform: rotateY(-90deg) translateZ(30px); }
.dice-face-4 { transform: rotateY(90deg) translateZ(30px); }
.dice-face-5 { transform: rotateX(90deg) translateZ(30px); }
.dice-face-6 { transform: rotateY(180deg) translateZ(30px); }

.dot {
  width: 8px;
  height: 8px;
  background: #2c3e50;
  border-radius: 50%;
  position: absolute;
}

/* Dot positions for each face */
.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.top-left { top: 15%; left: 15%; }
.top-right { top: 15%; right: 15%; }
.middle-left { top: 50%; left: 15%; transform: translateY(-50%); }
.middle-right { top: 50%; right: 15%; transform: translateY(-50%); }
.bottom-left { bottom: 15%; left: 15%; }
.bottom-right { bottom: 15%; right: 15%; }

.roll-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: fadeInUp 0.5s ease;
}

.roll-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.total-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.total-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.doubles-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
  animation: pulse 1s ease-in-out infinite alternate;
}

.doubles-icon {
  font-size: 1.2rem;
}

.doubles-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

.jail-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  animation: shake 0.5s ease-in-out;
}

.warning-icon {
  font-size: 1.2rem;
}

.roll-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 150px;
}

.roll-button.can-roll {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
  transform: translateY(-2px);
}

.roll-button.can-roll:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
}

.roll-button.rolling {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
  cursor: not-allowed;
}

.roll-button.disabled {
  background: #bdc3c7;
  color: #7f8c8d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.dice-icon {
  font-size: 1.2rem;
}

.rolling-dots {
  display: flex;
  gap: 3px;
}

.rolling-dots .dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  animation: loadingDots 1s ease-in-out infinite;
}

.rolling-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.rolling-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

.sound-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.sound-toggle:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.sound-toggle.muted {
  opacity: 0.5;
}

/* Animations */
@keyframes diceShake {
  0%, 100% { transform: translateX(0) translateY(0) rotateZ(0deg); }
  25% { transform: translateX(-2px) translateY(-2px) rotateZ(-1deg); }
  50% { transform: translateX(2px) translateY(2px) rotateZ(1deg); }
  75% { transform: translateX(-1px) translateY(1px) rotateZ(-0.5deg); }
}

@keyframes diceBounce {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-10px) scale(1.05); }
  60% { transform: translateY(-5px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes loadingDots {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .dice-container {
    gap: 1.5rem;
  }
  
  .dice-3d {
    width: 50px;
    height: 50px;
  }
  
  .dice-face {
    width: 50px;
    height: 50px;
  }
  
  .dice-face-1 { transform: rotateY(0deg) translateZ(25px); }
  .dice-face-2 { transform: rotateX(-90deg) translateZ(25px); }
  .dice-face-3 { transform: rotateY(-90deg) translateZ(25px); }
  .dice-face-4 { transform: rotateY(90deg) translateZ(25px); }
  .dice-face-5 { transform: rotateX(90deg) translateZ(25px); }
  .dice-face-6 { transform: rotateY(180deg) translateZ(25px); }
  
  .roll-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    min-width: 130px;
  }
  
  .total-value {
    font-size: 1.5rem;
  }
}
</style>