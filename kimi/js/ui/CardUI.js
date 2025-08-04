/**
 * CardUI - Handles card display modal and animations
 */
import { constants } from '../config/constants.js';

export class CardUI {
    constructor() {
        this.modal = null;
        this.isAnimating = false;
        this.currentCard = null;
        this.onComplete = null;
    }

    /**
     * Initialize the card UI
     */
    init() {
        this.createModal();
        this.bindEvents();
    }

    /**
     * Create the card display modal
     */
    createModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('card-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modalHTML = `
            <div id="card-modal" class="card-modal-overlay">
                <div class="card-modal-container">
                    <div class="card-modal-content">
                        <div class="card-display">
                            <div class="card-flipper">
                                <div class="card-front">
                                    <div class="card-back-design">
                                        <div class="card-pattern"></div>
                                    </div>
                                </div>
                                <div class="card-back">
                                    <div class="card-face">
                                        <div class="card-header">
                                            <div class="card-type-badge"></div>
                                            <div class="card-icon"></div>
                                        </div>
                                        <div class="card-body">
                                            <h3 class="card-title"></h3>
                                            <p class="card-description"></p>
                                        </div>
                                        <div class="card-footer">
                                            <button class="btn btn-primary card-continue-btn">Continue</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('card-modal');
        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.modal) return;

        // Continue button
        const continueBtn = this.modal.querySelector('.card-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideCard();
            });
        }

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideCard();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hideCard();
            }
        });
    }

    /**
     * Show a card with animation
     * @param {Card} card - The card to display
     * @param {Function} onComplete - Callback when card is dismissed
     */
    showCard(card, onComplete = null) {
        if (this.isAnimating) return;

        this.currentCard = card;
        this.onComplete = onComplete;
        this.isAnimating = true;

        const displayData = card.getDisplayData();
        
        // Update card content
        this.updateCardContent(displayData, card);

        // Show modal
        this.modal.classList.add('show');
        
        // Trigger flip animation
        setTimeout(() => {
            const flipper = this.modal.querySelector('.card-flipper');
            flipper.classList.add('flipped');
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 600);
        }, 100);
    }

    /**
     * Update card content based on card data
     * @param {Object} displayData - Card display data
     * @param {Card} card - The card object
     */
    updateCardContent(displayData, card) {
        const modal = this.modal;
        
        // Update type badge
        const typeBadge = modal.querySelector('.card-type-badge');
        typeBadge.textContent = displayData.title;
        typeBadge.style.backgroundColor = displayData.color;

        // Update icon
        const icon = modal.querySelector('.card-icon');
        icon.textContent = displayData.icon;

        // Update title and description
        modal.querySelector('.card-title').textContent = card.title;
        modal.querySelector('.card-description').textContent = card.description;

        // Update card face background color
        const cardFace = modal.querySelector('.card-face');
        cardFace.style.backgroundColor = displayData.color === '#FF8C00' ? '#FF8C00' : '#FFD700';
        cardFace.style.color = displayData.color === '#FF8C00' ? 'white' : '#333';
    }

    /**
     * Hide the card modal
     */
    hideCard() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        
        // Trigger flip back animation
        const flipper = this.modal.querySelector('.card-flipper');
        flipper.classList.remove('flipped');
        
        setTimeout(() => {
            this.modal.classList.remove('show');
            this.isAnimating = false;
            
            if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }, 600);
    }

    /**
     * Show card effect result
     * @param {Object} result - The effect result
     */
    showEffectResult(result) {
        if (!result || !result.message) return;

        const resultDiv = document.createElement('div');
        resultDiv.className = 'card-result';
        resultDiv.innerHTML = `
            <div class="result-message ${result.success ? 'success' : 'error'}">
                ${result.message}
                ${result.moneyChanged ? `<br>Amount: $${result.amount}` : ''}
            </div>
        `;

        const cardBody = this.modal.querySelector('.card-body');
        cardBody.appendChild(resultDiv);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            resultDiv.remove();
        }, 3000);
    }

    /**
     * Add CSS styles for card modal
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .card-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .card-modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .card-modal-container {
                perspective: 1000px;
            }

            .card-display {
                width: 350px;
                height: 500px;
                position: relative;
            }

            .card-flipper {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.6s;
            }

            .card-flipper.flipped {
                transform: rotateY(180deg);
            }

            .card-front,
            .card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .card-front {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .card-back {
                transform: rotateY(180deg);
                padding: 20px;
                display: flex;
                flex-direction: column;
            }

            .card-back-design {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .card-pattern {
                width: 80%;
                height: 80%;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.1) 10px,
                    rgba(255, 255, 255, 0.1) 20px
                );
                border-radius: 5px;
            }

            .card-face {
                width: 100%;
                height: 100%;
                border-radius: 10px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                color: white;
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .card-type-badge {
                font-size: 14px;
                font-weight: bold;
                padding: 5px 10px;
                border-radius: 15px;
                background: rgba(0, 0, 0, 0.2);
            }

            .card-icon {
                font-size: 24px;
            }

            .card-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
            }

            .card-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                line-height: 1.4;
            }

            .card-description {
                font-size: 16px;
                line-height: 1.5;
                opacity: 0.9;
            }

            .card-footer {
                margin-top: 20px;
                text-align: center;
            }

            .card-continue-btn {
                background: rgba(0, 0, 0, 0.2);
                color: white;
                border: 2px solid white;
                padding: 10px 30px;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .card-continue-btn:hover {
                background: white;
                color: #333;
            }

            .card-result {
                margin-top: 15px;
                padding: 10px;
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.1);
            }

            .result-message {
                font-size: 14px;
                font-weight: bold;
            }

            .result-message.success {
                color: #4CAF50;
            }

            .result-message.error {
                color: #f44336;
            }

            @media (max-width: 480px) {
                .card-display {
                    width: 300px;
                    height: 400px;
                }

                .card-face {
                    padding: 15px;
                }

                .card-title {
                    font-size: 16px;
                }

                .card-description {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Destroy the card UI
     */
    destroy() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}