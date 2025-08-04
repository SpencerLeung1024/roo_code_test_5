/**
 * Jail UI Component
 * Handles jail-related user interface elements and interactions
 */

import { constants } from '../config/constants.js';

/**
 * Jail UI class for managing jail interface elements
 */
export class JailUI {
    constructor() {
        this.jailModal = null;
        this.jailIndicators = new Map();
    }

    /**
     * Initialize the jail UI
     */
    init() {
        this.createJailModal();
        this.createJailStyles();
        debugLog('info', 'JailUI initialized');
    }

    /**
     * Create the jail modal
     */
    createJailModal() {
        if (document.getElementById('jail-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'jail-modal';
        modal.className = 'modal jail-modal';
        modal.innerHTML = `
            <div class="modal-content jail-content">
                <div class="modal-header">
                    <h2>🚨 In Jail 🚨</h2>
                    <button class="close-btn" onclick="jailUI.hideJailModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="jail-status">
                        <div class="jail-icon">🔒</div>
                        <h3 id="jail-player-name">Player</h3>
                        <p id="jail-turn-counter">Turn 1 of 3</p>
                        <div class="jail-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="jail-progress-fill"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="jail-options">
                        <div class="jail-option" id="jail-option-pay">
                            <div class="option-icon">💰</div>
                            <div class="option-details">
                                <h4>Pay $50 Fine</h4>
                                <p>Pay bail to get out immediately</p>
                                <button class="jail-btn primary" onclick="jailUI.handlePayFine()">
                                    Pay $50
                                </button>
                            </div>
                        </div>
                        
                        <div class="jail-option" id="jail-option-card" style="display: none;">
                            <div class="option-icon">🎴</div>
                            <div class="option-details">
                                <h4>Use Get Out of Jail Free Card</h4>
                                <p>Use your card to escape for free</p>
                                <button class="jail-btn secondary" onclick="jailUI.handleUseCard()">
                                    Use Card
                                </button>
                            </div>
                        </div>
                        
                        <div class="jail-option" id="jail-option-roll">
                            <div class="option-icon">🎲</div>
                            <div class="option-details">
                                <h4>Roll for Doubles</h4>
                                <p>Roll doubles to escape for free</p>
                                <button class="jail-btn tertiary" onclick="jailUI.handleRollDoubles()">
                                    Roll Dice
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="jail-info">
                        <p id="jail-info-text">You have 3 attempts to roll doubles.</p>
                        <div class="jail-tips">
                            <small>💡 Tip: You can collect rent while in jail!</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.jailModal = modal;

        // Add event listeners
        this.bindModalEvents();
    }

    /**
     * Bind modal events
     */
    bindModalEvents() {
        // Close modal when clicking outside
        this.jailModal.addEventListener('click', (e) => {
            if (e.target === this.jailModal) {
                this.hideJailModal();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.jailModal.style.display === 'block') {
                this.hideJailModal();
            }
        });
    }

    /**
     * Show jail modal for a player
     * @param {Player} player - The player in jail
     */
    showJailModal(player) {
        if (!this.jailModal || !player) return;

        const modal = this.jailModal;
        
        // Update player info
        modal.querySelector('#jail-player-name').textContent = player.name;
        modal.querySelector('#jail-turn-counter').textContent = 
            `Turn ${player.jailTurns + 1} of ${constants.JAIL.MAX_TURNS_IN_JAIL}`;

        // Update progress bar
        const progressFill = modal.querySelector('#jail-progress-fill');
        const progressPercent = ((player.jailTurns + 1) / constants.JAIL.MAX_TURNS_IN_JAIL) * 100;
        progressFill.style.width = `${progressPercent}%`;

        // Show/hide card option
        const cardOption = modal.querySelector('#jail-option-card');
        if (player.getOutOfJailFreeCards > 0) {
            cardOption.style.display = 'flex';
            cardOption.querySelector('h4').textContent = 
                `Use Get Out of Jail Free Card (${player.getOutOfJailFreeCards} available)`;
        } else {
            cardOption.style.display = 'none';
        }

        // Update info text
        const remainingAttempts = constants.JAIL.MAX_TURNS_IN_JAIL - player.jailTurns;
        modal.querySelector('#jail-info-text').textContent = 
            remainingAttempts === 1 
                ? 'This is your last attempt to roll doubles before you must pay the fine.'
                : `You have ${remainingAttempts} attempts remaining to roll doubles.`;

        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Focus first available button
        setTimeout(() => {
            const firstButton = modal.querySelector('.jail-btn:not([style*="display: none"])');
            if (firstButton) firstButton.focus();
        }, 100);
    }

    /**
     * Hide jail modal
     */
    hideJailModal() {
        if (this.jailModal) {
            this.jailModal.style.display = 'none';
            this.jailModal.classList.remove('active');
        }
    }

    /**
     * Create jail styles
     */
    createJailStyles() {
        if (document.getElementById('jail-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'jail-styles';
        styles.textContent = `
            .jail-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }

            .jail-modal.active {
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }

            .jail-content {
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: white;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                animation: slideIn 0.3s ease-out;
            }

            .jail-status {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
            }

            .jail-icon {
                font-size: 48px;
                margin-bottom: 10px;
                animation: pulse 2s infinite;
            }

            .jail-progress {
                margin-top: 15px;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #e74c3c, #f39c12);
                transition: width 0.3s ease;
                border-radius: 4px;
            }

            .jail-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .jail-option {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                transition: all 0.3s ease;
                border: 1px solid transparent;
            }

            .jail-option:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .option-icon {
                font-size: 32px;
                flex-shrink: 0;
            }

            .option-details {
                flex: 1;
            }

            .option-details h4 {
                margin: 0 0 5px 0;
                color: #ecf0f1;
                font-size: 18px;
            }

            .option-details p {
                margin: 0 0 10px 0;
                color: #bdc3c7;
                font-size: 14px;
            }

            .jail-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 100px;
            }

            .jail-btn.primary {
                background: #3498db;
                color: white;
            }

            .jail-btn.primary:hover {
                background: #2980b9;
                transform: translateY(-1px);
            }

            .jail-btn.secondary {
                background: #2ecc71;
                color: white;
            }

            .jail-btn.secondary:hover {
                background: #27ae60;
                transform: translateY(-1px);
            }

            .jail-btn.tertiary {
                background: #f39c12;
                color: white;
            }

            .jail-btn.tertiary:hover {
                background: #e67e22;
                transform: translateY(-1px);
            }

            .jail-btn:disabled {
                background: #7f8c8d;
                cursor: not-allowed;
                opacity: 0.6;
            }

            .jail-info {
                margin-top: 20px;
                text-align: center;
                padding: 15px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }

            .jail-tips {
                margin-top: 10px;
                color: #95a5a6;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideIn {
                from {
                    transform: translateY(-50px) scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @media (max-width: 600px) {
                .jail-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .jail-option {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Update jail indicators for a player
     * @param {Player} player - The player
     * @param {boolean} isInJail - Whether player is in jail
     */
    updateJailIndicators(player, isInJail) {
        // Update player token
        const token = document.querySelector(`[data-player-id="${player.id}"]`);
        if (token) {
            if (isInJail) {
                token.classList.add('in-jail');
                token.setAttribute('title', `${player.name} (In Jail)`);
            } else {
                token.classList.remove('in-jail');
                token.setAttribute('title', player.name);
            }
        }

        // Update player info panel
        const playerInfo = document.querySelector(`#player-${player.id}-info`);
        if (playerInfo) {
            let jailIndicator = playerInfo.querySelector('.jail-indicator');
            
            if (isInJail) {
                if (!jailIndicator) {
                    jailIndicator = document.createElement('span');
                    jailIndicator.className = 'jail-indicator';
                    jailIndicator.textContent = '🔒 Jail';
                    playerInfo.appendChild(jailIndicator);
                }
            } else if (jailIndicator) {
                jailIndicator.remove();
            }
        }

        // Update jail indicators map
        this.jailIndicators.set(player.id, isInJail);
    }

    /**
     * Show jail notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error)
     */
    showJailNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `jail-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        // Style based on type
        const colors = {
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors[type] || colors.info,
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '1000',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Handle pay fine button click
     */
    handlePayFine() {
        const event = new CustomEvent('jail:pay-fine');
        document.dispatchEvent(event);
    }

    /**
     * Handle use card button click
     */
    handleUseCard() {
        const event = new CustomEvent('jail:use-card');
        document.dispatchEvent(event);
    }

    /**
     * Handle roll doubles button click
     */
    handleRollDoubles() {
        const event = new CustomEvent('jail:roll-doubles');
        document.dispatchEvent(event);
    }

    /**
     * Get jail status display
     * @param {Player} player - The player
     * @returns {string} HTML string for jail status
     */
    getJailStatusDisplay(player) {
        if (!player.inJail) return '';

        return `
            <div class="jail-status-display">
                <span class="jail-icon">🔒</span>
                <span>In Jail - Turn ${player.jailTurns + 1}/3</span>
                ${player.getOutOfJailFreeCards > 0 ? 
                    `<span class="jail-cards">(${player.getOutOfJailFreeCards} cards)</span>` : 
                    ''}
            </div>
        `;
    }

    /**
     * Destroy jail UI
     */
    destroy() {
        if (this.jailModal) {
            this.jailModal.remove();
            this.jailModal = null;
        }

        const styles = document.getElementById('jail-styles');
        if (styles) {
            styles.remove();
        }

        this.jailIndicators.clear();
    }
}

// Create global instance
export const jailUI = new JailUI();