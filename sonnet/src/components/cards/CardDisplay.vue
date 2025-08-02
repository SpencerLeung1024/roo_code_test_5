<template>
  <div class="card-overlay" v-if="showCard" @click="closeCard">
    <!-- Particle effects background -->
    <div class="particle-container">
      <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
    </div>
    
    <div class="card-container" @click.stop>
      <!-- Card flip container -->
      <div class="card-flip-container" :class="{ 'flipped': isRevealed }">
        <!-- Card back -->
        <div class="card-back" :class="cardDeckType.toLowerCase().replace(' ', '-')">
          <div class="card-back-pattern"></div>
          <div class="card-back-logo">{{ cardIcon }}</div>
          <div class="card-back-title">{{ cardDeckType }}</div>
        </div>
        
        <!-- Card front -->
        <div class="card card-front" :class="cardClass">
          <!-- Glow effect for special cards -->
          <div class="card-glow" v-if="card.isGetOutOfJail || card.type === 'special'"></div>
          
          <!-- Card Header -->
          <div class="card-header">
            <h2 class="card-type">{{ cardDeckType }}</h2>
            <div class="card-icon animated-icon">{{ cardIcon }}</div>
          </div>
          
          <!-- Card Content -->
          <div class="card-content">
            <h3 class="card-title typewriter-text">{{ card.title }}</h3>
            <p class="card-description fade-in-text">{{ card.description }}</p>
            
            <!-- Card effect preview -->
            <div class="card-effect-preview pulse-effect" v-if="effectPreview">
              <div class="effect-type">{{ effectPreview.type }}</div>
              <div class="effect-details">{{ effectPreview.details }}</div>
            </div>
          </div>
          
          <!-- Card Actions -->
          <div class="card-actions">
            <button
              v-if="card.isGetOutOfJail"
              class="btn keep-card ripple-btn"
              @click="keepCard"
              :disabled="processing"
            >
              <span class="btn-icon">💾</span>
              Keep Card
              <div class="ripple"></div>
            </button>
            <button
              class="btn execute-card ripple-btn"
              @click="executeCard"
              :disabled="processing"
            >
              <span class="btn-icon">{{ card.isGetOutOfJail ? '⚡' : '✅' }}</span>
              {{ card.isGetOutOfJail ? 'Use Now' : 'Continue' }}
              <div class="ripple"></div>
            </button>
          </div>
          
          <!-- Processing indicator -->
          <div class="processing-overlay" v-if="processing">
            <div class="spinner-enhanced"></div>
            <div class="processing-text">Executing card effect...</div>
            <div class="progress-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sound effect visualization -->
    <div class="sound-waves" v-if="showSoundEffect">
      <div class="wave" v-for="n in 3" :key="n" :style="`animation-delay: ${n * 0.2}s`"></div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'

export default {
  name: 'CardDisplay',
  
  props: {
    card: {
      type: Object,
      required: true
    },
    showCard: {
      type: Boolean,
      default: false
    },
    cardDeckType: {
      type: String,
      required: true,
      validator: value => ['Chance', 'Community Chest'].includes(value)
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['execute-card', 'keep-card', 'close-card'],
  
  setup(props, { emit }) {
    // Animation state
    const isRevealed = ref(false)
    const showSoundEffect = ref(false)
    
    // Computed properties for card styling and content
    const cardIcon = computed(() => {
      return props.cardDeckType === 'Chance' ? '🎲' : '🏛️'
    })
    
    const cardClass = computed(() => {
      const baseClass = props.cardDeckType === 'Chance' ? 'card-chance' : 'card-community'
      const typeClass = `card-type-${props.card.type}`
      return `${baseClass} ${typeClass}`
    })
    
    // Generate particle animation styles
    const getParticleStyle = (index) => {
      const delay = Math.random() * 2
      const duration = 3 + Math.random() * 2
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = 2 + Math.random() * 4
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    }
    
    // Generate effect preview text
    const effectPreview = computed(() => {
      if (!props.card) return null
      
      switch (props.card.type) {
        case 'money':
          if (props.card.action === 'receiveMoney') {
            return {
              type: 'Money Gain',
              details: `+$${props.card.effectValue}`
            }
          } else if (props.card.action === 'payMoney') {
            return {
              type: 'Payment Required',
              details: `-$${props.card.effectValue}`
            }
          } else if (props.card.action === 'receiveFromEachPlayer') {
            return {
              type: 'Collect from Players',
              details: `$${props.card.effectValue} from each player`
            }
          } else if (props.card.action === 'payEachPlayer') {
            return {
              type: 'Pay Each Player',
              details: `$${props.card.effectValue} to each player`
            }
          }
          break
          
        case 'move':
          if (props.card.action === 'moveToSpace') {
            return {
              type: 'Movement',
              details: `Move to specific location`
            }
          } else if (props.card.action === 'moveRelative') {
            const direction = props.card.effectValue > 0 ? 'forward' : 'backward'
            return {
              type: 'Movement',
              details: `Move ${Math.abs(props.card.effectValue)} spaces ${direction}`
            }
          } else if (props.card.action.includes('Nearest')) {
            return {
              type: 'Movement',
              details: 'Move to nearest property'
            }
          }
          break
          
        case 'property':
          return {
            type: 'Property Fees',
            details: `$${props.card.perHouseAmount}/house, $${props.card.perHotelAmount}/hotel`
          }
          
        case 'special':
          if (props.card.isGetOutOfJail) {
            return {
              type: 'Special Card',
              details: 'Keep or use when needed'
            }
          } else if (props.card.action === 'goToJail') {
            return {
              type: 'Go to Jail',
              details: 'Do not pass GO'
            }
          }
          break
      }
      
      return null
    })
    
    // Animation control
    const startCardReveal = () => {
      // Show sound effect
      showSoundEffect.value = true
      setTimeout(() => {
        showSoundEffect.value = false
      }, 1000)
      
      // Delay card flip for dramatic effect
      setTimeout(() => {
        isRevealed.value = true
      }, 500)
    }
    
    // Watch for card visibility changes
    watch(() => props.showCard, (newValue) => {
      if (newValue) {
        isRevealed.value = false
        startCardReveal()
      }
    })
    
    // Event handlers with enhanced feedback
    const executeCard = () => {
      if (!props.processing) {
        // Add button click animation
        showSoundEffect.value = true
        setTimeout(() => {
          showSoundEffect.value = false
        }, 300)
        
        emit('execute-card', props.card)
      }
    }
    
    const keepCard = () => {
      if (!props.processing) {
        // Add button click animation
        showSoundEffect.value = true
        setTimeout(() => {
          showSoundEffect.value = false
        }, 300)
        
        emit('keep-card', props.card)
      }
    }
    
    const closeCard = () => {
      if (!props.processing) {
        emit('close-card')
      }
    }
    
    // Initialize animation when component mounts
    onMounted(() => {
      if (props.showCard) {
        startCardReveal()
      }
    })
    
    return {
      cardIcon,
      cardClass,
      effectPreview,
      executeCard,
      keepCard,
      closeCard,
      isRevealed,
      showSoundEffect,
      getParticleStyle
    }
  }
}
</script>

<style scoped>
.card-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.4s ease-in-out;
  backdrop-filter: blur(4px);
}

/* Particle Effects */
.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.card-container {
  animation: bounceIn 0.6s ease-out;
  max-width: 90vw;
  max-height: 90vh;
  perspective: 1000px;
}

/* Card Flip Container */
.card-flip-container {
  position: relative;
  width: 420px;
  height: 350px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-flip-container.flipped {
  transform: rotateY(180deg);
}

/* Card Back */
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-back.chance {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  border: 3px solid #d32f2f;
}

.card-back.community-chest {
  background: linear-gradient(135deg, #4ecdc4, #26a69a);
  border: 3px solid #00695c;
}

.card-back-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px);
  background-size: 20px 20px;
  animation: patternShift 4s linear infinite;
}

@keyframes patternShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

.card-back-logo {
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  animation: pulse 2s infinite;
}

.card-back-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Card Front */
.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
}

.card {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Card Glow Effect */
.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  border-radius: 22px;
  z-index: -1;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { opacity: 0.5; transform: scale(1); }
  to { opacity: 0.8; transform: scale(1.02); }
}

/* Card type styling */
.card-chance {
  border-top: 6px solid #ff6b6b;
  background: linear-gradient(145deg, #fff5f5, #ffe8e8);
}

.card-community {
  border-top: 6px solid #4ecdc4;
  background: linear-gradient(145deg, #f0fffe, #e6fffe);
}

/* Card type specific effects */
.card-type-money {
  border-left: 4px solid #2ecc71;
}

.card-type-move {
  border-left: 4px solid #3498db;
}

.card-type-property {
  border-left: 4px solid #e67e22;
}

.card-type-special {
  border-left: 4px solid #9b59b6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.card-type {
  color: #333;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: slideInLeft 0.6s ease-out 0.8s both;
}

.animated-icon {
  font-size: 28px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
  animation: bounceIcon 1s ease-out 1s both;
}

@keyframes bounceIcon {
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.card-content {
  margin-bottom: 24px;
}

.typewriter-text {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  animation: typewriter 1s steps(20) 1.2s both;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid #2c3e50;
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.fade-in-text {
  color: #555;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
  padding: 0 8px;
  animation: fadeInUp 0.6s ease-out 1.8s both;
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

.pulse-effect {
  background: rgba(52, 152, 219, 0.1);
  border-radius: 12px;
  padding: 12px;
  margin-top: 16px;
  border: 1px solid rgba(52, 152, 219, 0.2);
  animation: pulse 2s infinite, slideInUp 0.6s ease-out 2.2s both;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.effect-type {
  font-size: 14px;
  font-weight: 600;
  color: #3498db;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.effect-details {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  animation: slideInUp 0.6s ease-out 2.4s both;
}

/* Enhanced Buttons with Ripple Effect */
.ripple-btn {
  position: relative;
  overflow: hidden;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.ripple-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple-btn:active .ripple {
  animation: ripple-animation 0.6s linear;
}

.keep-card {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.keep-card:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(243, 156, 18, 0.4);
}

.execute-card {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.execute-card:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(46, 204, 113, 0.4);
}

.btn-icon {
  font-size: 18px;
  animation: iconBounce 0.3s ease-out;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Enhanced Processing Overlay */
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  backdrop-filter: blur(2px);
}

.spinner-enhanced {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-right: 4px solid #e74c3c;
  border-radius: 50%;
  animation: spinEnhanced 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spinEnhanced {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-text {
  color: #666;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.progress-dots {
  display: flex;
  gap: 4px;
}

.progress-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3498db;
  animation: dotPulse 1.5s infinite ease-in-out;
}

.progress-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.progress-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* Sound Wave Effect */
.sound-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.wave {
  position: absolute;
  border: 2px solid rgba(52, 152, 219, 0.6);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: waveExpand 1s ease-out;
  top: -50px;
  left: -50px;
}

@keyframes waveExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* Main animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(0);
    opacity: 0.8;
  }
  70% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .card-flip-container {
    width: 90vw;
    max-width: 350px;
    height: 320px;
  }
  
  .card {
    padding: 20px;
  }
  
  .typewriter-text {
    font-size: 20px;
    white-space: normal;
    border-right: none;
    animation: fadeInUp 0.6s ease-out 1.2s both;
  }
  
  .fade-in-text {
    font-size: 14px;
  }
  
  .ripple-btn {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .card-flip-container {
    width: 95vw;
    max-width: 300px;
    height: 300px;
  }
  
  .card {
    padding: 16px;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .ripple-btn {
    width: 100%;
  }
}

/* Print styles */
@media print {
  .card-overlay {
    display: none;
  }
}
</style>