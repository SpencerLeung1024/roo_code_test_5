/**
 * Enhanced Dice UI Component
 * Provides sophisticated dice rolling animations and effects
 */

export class DiceUI {
    constructor() {
        this.diceContainer = null;
        this.dice1 = null;
        this.dice2 = null;
        this.isRolling = false;
        this.animationDuration = 1500;
    }

    async init() {
        this.diceContainer = document.getElementById('dice-container');
        this.dice1 = document.getElementById('dice-1');
        this.dice2 = document.getElementById('dice-2');
        
        if (!this.diceContainer || !this.dice1 || !this.dice2) {
            console.warn('Dice elements not found');
            return;
        }
        
        this.setupEventListeners();
        console.log('✅ Enhanced Dice UI initialized');
    }

    setupEventListeners() {
        // Add click handlers for dice
        [this.dice1, this.dice2].forEach(dice => {
            if (dice) {
                dice.addEventListener('click', () => this.showDiceDetails());
            }
        });
    }

    async rollDice(diceValues = null) {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const values = diceValues || [this.getRandomDiceValue(), this.getRandomDiceValue()];
        
        // Start rolling animation
        this.startRollingAnimation();
        
        // Wait for animation to complete
        await this.delay(this.animationDuration);
        
        // Show final values
        this.showFinalValues(values);
        
        // Check for doubles
        const isDouble = values[0] === values[1];
        
        // Update result display
        this.updateResultDisplay(values, isDouble);
        
        this.isRolling = false;
        
        return { values, isDouble, total: values[0] + values[1] };
    }

    startRollingAnimation() {
        // Add rolling class
        this.diceContainer.classList.add('rolling');
        
        // Start rapid dice changes
        const interval = setInterval(() => {
            this.setDiceValue(this.dice1, this.getRandomDiceValue());
            this.setDiceValue(this.dice2, this.getRandomDiceValue());
        }, 100);
        
        // Stop after animation duration
        setTimeout(() => {
            clearInterval(interval);
            this.diceContainer.classList.remove('rolling');
        }, this.animationDuration - 200);
    }

    showFinalValues(values) {
        // Add final animation
        this.dice1.classList.add('final-roll');
        this.dice2.classList.add('final-roll');
        
        this.setDiceValue(this.dice1, values[0]);
        this.setDiceValue(this.dice2, values[1]);
        
        // Remove animation class
        setTimeout(() => {
            this.dice1.classList.remove('final-roll');
            this.dice2.classList.remove('final-roll');
        }, 500);
    }

    setDiceValue(diceElement, value) {
        if (!diceElement) return;
        
        const diceFace = diceElement.querySelector('.dice-face');
        if (!diceFace) return;
        
        // Clear existing dots
        diceFace.innerHTML = '';
        
        // Create dots based on value
        const dotPositions = this.getDotPositions(value);
        
        dotPositions.forEach(position => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.cssText = `
                position: absolute;
                width: 20%;
                height: 20%;
                background: #2c3e50;
                border-radius: 50%;
                top: ${position.top};
                left: ${position.left};
                transform: translate(-50%, -50%);
            `;
            diceFace.appendChild(dot);
        });
        
        // Add value attribute for accessibility
        diceElement.setAttribute('data-value', value);
    }

    getDotPositions(value) {
        const positions = {
            1: [{ top: '50%', left: '50%' }],
            2: [
                { top: '25%', left: '25%' },
                { top: '75%', left: '75%' }
            ],
            3: [
                { top: '25%', left: '25%' },
                { top: '50%', left: '50%' },
                { top: '75%', left: '75%' }
            ],
            4: [
                { top: '25%', left: '25%' },
                { top: '25%', left: '75%' },
                { top: '75%', left: '25%' },
                { top: '75%', left: '75%' }
            ],
            5: [
                { top: '25%', left: '25%' },
                { top: '25%', left: '75%' },
                { top: '50%', left: '50%' },
                { top: '75%', left: '25%' },
                { top: '75%', left: '75%' }
            ],
            6: [
                { top: '25%', left: '25%' },
                { top: '25%', left: '75%' },
                { top: '50%', left: '25%' },
                { top: '50%', left: '75%' },
                { top: '75%', left: '25%' },
                { top: '75%', left: '75%' }
            ]
        };
        
        return positions[value] || positions[1];
    }

    updateResultDisplay(values, isDouble) {
        const resultElement = document.getElementById('dice-result');
        if (!resultElement) return;
        
        const total = values[0] + values[1];
        const doubleText = isDouble ? ' 🎲 DOUBLES!' : '';
        
        resultElement.innerHTML = `
            <div class="dice-result-content">
                <span class="dice-values">${values[0]} + ${values[1]} = ${total}</span>
                <span class="double-indicator">${doubleText}</span>
            </div>
        `;
        
        // Add celebration effect for doubles
        if (isDouble) {
            this.celebrateDoubles();
        }
    }

    celebrateDoubles() {
        // Create confetti effect
        this.createConfetti();
        
        // Add glow effect
        this.diceContainer.classList.add('doubles-glow');
        setTimeout(() => {
            this.diceContainer.classList.remove('doubles-glow');
        }, 2000);
    }

    createConfetti() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        
        for (let i = 0; i < 10; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: 50%;
                top: 50%;
                border-radius: 50%;
                animation: confetti-fall 1s ease-out forwards;
                z-index: 100;
            `;
            
            this.diceContainer.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 1000);
        }
    }

    showDiceDetails() {
        // Create modal with dice statistics
        const modal = document.createElement('div');
        modal.className = 'modal dice-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎲 Dice Statistics</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="dice-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Rolls:</span>
                            <span class="stat-value" id="total-rolls">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Doubles:</span>
                            <span class="stat-value" id="total-doubles">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Average Roll:</span>
                            <span class="stat-value" id="average-roll">0</span>
                        </div>
                    </div>
                    <div class="dice-distribution">
                        <h3>Roll Distribution</h3>
                        <div class="distribution-chart" id="distribution-chart"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    getRandomDiceValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external use
    setEnabled(enabled) {
        if (this.diceContainer) {
            this.diceContainer.style.pointerEvents = enabled ? 'auto' : 'none';
            this.diceContainer.style.opacity = enabled ? '1' : '0.6';
        }
    }

    reset() {
        if (this.dice1) this.setDiceValue(this.dice1, 1);
        if (this.dice2) this.setDiceValue(this.dice2, 1);
        
        const resultElement = document.getElementById('dice-result');
        if (resultElement) {
            resultElement.innerHTML = '<div class="dice-result-content">Roll the dice to start</div>';
        }
    }

    // Animation presets
    setAnimationDuration(duration) {
        this.animationDuration = duration;
    }

    // Add CSS for animations
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .dice-container.rolling .dice {
                animation: diceRoll 0.1s infinite;
            }
            
            @keyframes diceRoll {
                0% { transform: rotateX(0deg) rotateY(0deg); }
                25% { transform: rotateX(90deg) rotateY(90deg); }
                50% { transform: rotateX(180deg) rotateY(180deg); }
                75% { transform: rotateX(270deg) rotateY(270deg); }
                100% { transform: rotateX(360deg) rotateY(360deg); }
            }
            
            .dice.final-roll {
                animation: finalRoll 0.5s ease-out;
            }
            
            @keyframes finalRoll {
                0% { transform: scale(1.2) rotate(360deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            .dice-container.doubles-glow {
                animation: doublesGlow 2s ease-in-out;
            }
            
            @keyframes doublesGlow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
                50% { box-shadow: 0 0 20px 10px rgba(212, 175, 55, 0.3); }
            }
            
            @keyframes confetti-fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            .dice-result-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .dice-values {
                font-size: 18px;
                font-weight: bold;
                color: var(--primary-color);
            }
            
            .double-indicator {
                font-size: 14px;
                color: var(--accent-color);
                font-weight: bold;
                animation: pulse 1s infinite;
            }
        `;
        
        document.head.appendChild(style);
    }
}