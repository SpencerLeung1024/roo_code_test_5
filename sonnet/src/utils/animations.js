// Animation utilities for game state transitions
export const animations = {
  // Turn transition animations
  fadeInPlayer(element) {
    if (!element) return
    
    element.style.opacity = '0'
    element.style.transform = 'translateY(10px)'
    element.style.transition = 'all 0.3s ease'
    
    requestAnimationFrame(() => {
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    })
  },

  fadeOutPlayer(element) {
    if (!element) return
    
    element.style.transition = 'all 0.3s ease'
    element.style.opacity = '0'
    element.style.transform = 'translateY(-10px)'
  },

  highlightPlayer(element) {
    if (!element) return
    
    element.style.transition = 'all 0.3s ease'
    element.style.transform = 'scale(1.02)'
    element.style.boxShadow = '0 4px 20px rgba(243, 156, 18, 0.4)'
  },

  unhighlightPlayer(element) {
    if (!element) return
    
    element.style.transition = 'all 0.3s ease'
    element.style.transform = 'scale(1)'
    element.style.boxShadow = 'none'
  },

  // Dice rolling animation
  rollDiceAnimation(diceElement1, diceElement2, duration = 1000) {
    if (!diceElement1 || !diceElement2) return
    
    const startTime = Date.now()
    const interval = 100 // Update every 100ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      
      if (elapsed < duration) {
        // Random values during animation
        diceElement1.textContent = Math.floor(Math.random() * 6) + 1
        diceElement2.textContent = Math.floor(Math.random() * 6) + 1
        
        setTimeout(animate, interval)
      }
    }
    
    animate()
  },

  // Money change animation
  animateMoneyChange(element, oldValue, newValue) {
    if (!element) return
    
    const difference = newValue - oldValue
    const isPositive = difference > 0
    
    // Create temporary element for animation
    const changeElement = document.createElement('div')
    changeElement.textContent = `${isPositive ? '+' : ''}$${Math.abs(difference).toLocaleString()}`
    changeElement.style.position = 'absolute'
    changeElement.style.color = isPositive ? '#27ae60' : '#e74c3c'
    changeElement.style.fontWeight = 'bold'
    changeElement.style.fontSize = '0.9rem'
    changeElement.style.opacity = '1'
    changeElement.style.transform = 'translateY(0)'
    changeElement.style.transition = 'all 1s ease'
    changeElement.style.pointerEvents = 'none'
    changeElement.style.zIndex = '1000'
    
    // Position relative to target element
    const rect = element.getBoundingClientRect()
    changeElement.style.left = rect.left + 'px'
    changeElement.style.top = rect.top - 20 + 'px'
    
    document.body.appendChild(changeElement)
    
    // Animate
    requestAnimationFrame(() => {
      changeElement.style.opacity = '0'
      changeElement.style.transform = 'translateY(-30px)'
    })
    
    // Remove after animation
    setTimeout(() => {
      if (changeElement.parentNode) {
        changeElement.parentNode.removeChild(changeElement)
      }
    }, 1000)
  },

  // Property purchase animation
  animatePropertyPurchase(propertyElement) {
    if (!propertyElement) return
    
    propertyElement.style.transition = 'all 0.5s ease'
    propertyElement.style.transform = 'scale(1.1)'
    propertyElement.style.filter = 'brightness(1.2)'
    
    setTimeout(() => {
      propertyElement.style.transform = 'scale(1)'
      propertyElement.style.filter = 'brightness(1)'
    }, 500)
  },

  // Turn indicator pulse
  pulseTurnIndicator(element) {
    if (!element) return
    
    element.style.animation = 'pulse 2s infinite'
  },

  stopPulseTurnIndicator(element) {
    if (!element) return
    
    element.style.animation = 'none'
  },

  // Smooth property count update
  animatePropertyCount(element, oldCount, newCount) {
    if (!element || oldCount === newCount) return
    
    const duration = 800
    const startTime = Date.now()
    const countDiff = newCount - oldCount
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const currentCount = Math.round(oldCount + (countDiff * progress))
      element.textContent = currentCount
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  },

  // Phase transition animation
  animatePhaseTransition(fromElement, toElement) {
    if (fromElement) {
      fromElement.style.transition = 'all 0.3s ease'
      fromElement.style.opacity = '0'
      fromElement.style.transform = 'translateX(-20px)'
    }
    
    if (toElement) {
      toElement.style.opacity = '0'
      toElement.style.transform = 'translateX(20px)'
      toElement.style.transition = 'all 0.3s ease'
      
      setTimeout(() => {
        toElement.style.opacity = '1'
        toElement.style.transform = 'translateX(0)'
      }, 150)
    }
  }
}

// CSS keyframes for animations (to be added to global styles)
export const cssAnimations = `
@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.turn-transition-enter {
  animation: slideInFromRight 0.5s ease;
}

.turn-transition-leave {
  animation: slideInFromLeft 0.5s ease reverse;
}

.player-highlight {
  animation: bounceIn 0.6s ease;
}

.money-change {
  animation: fadeInUp 0.3s ease;
}

.property-purchase {
  animation: bounceIn 0.5s ease;
}

.dice-rolling {
  animation: shake 0.1s infinite;
}

.phase-indicator {
  transition: all 0.3s ease;
}

.phase-indicator.active {
  animation: pulse 2s infinite;
}
`