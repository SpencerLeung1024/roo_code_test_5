/**
 * Modal Manager
 * Handles modal dialogs and popups
 */

/**
 * Manages all modal dialogs in the game
 */
export class ModalManager {
    constructor() {
        this.modalContainer = null;
    }

    async init() {
        this.modalContainer = document.getElementById('modal-container');
        console.log('Modal Manager initialized');
    }

    showModal(content) {
        if (!this.modalContainer) return;
        
        this.modalContainer.innerHTML = content;
        this.modalContainer.classList.add('show');
    }

    hideModal() {
        if (!this.modalContainer) return;
        
        this.modalContainer.classList.remove('show');
        this.modalContainer.innerHTML = '';
    }

    async showWelcome() {
        const content = `
            <div class="modal-overlay">
                <div class="modal-container modal-medium">
                    <div class="modal-header">
                        <h2 class="modal-title">Welcome to Monopoly!</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Welcome to the Monopoly game! Get ready to buy properties, build houses, and bankrupt your opponents.</p>
                        <p><strong>How to Play:</strong></p>
                        <ul>
                            <li>Roll dice to move around the board</li>
                            <li>Buy properties when you land on them</li>
                            <li>Build houses and hotels to increase rent</li>
                            <li>Bankrupt other players to win!</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Start Playing</button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    async showGameSetup() {
        return new Promise((resolve) => {
            const content = `
                <div class="modal-overlay">
                    <div class="modal-container modal-large">
                        <div class="modal-header">
                            <h2 class="modal-title">New Game Setup</h2>
                            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="setup-section">
                                <h3>Game Settings</h3>
                                <div class="form-group">
                                    <label for="player-count">Number of Players:</label>
                                    <select id="player-count" class="form-control">
                                        <option value="2">2 Players</option>
                                        <option value="3">3 Players</option>
                                        <option value="4" selected>4 Players</option>
                                        <option value="5">5 Players</option>
                                        <option value="6">6 Players</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="starting-money">Starting Money:</label>
                                    <select id="starting-money" class="form-control">
                                        <option value="1000">$1,000</option>
                                        <option value="1500" selected>$1,500 (Standard)</option>
                                        <option value="2000">$2,000</option>
                                        <option value="2500">$2,500</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="setup-section">
                                <h3>Player Setup</h3>
                                <div id="player-setup-container">
                                    <!-- Player setup cards will be generated here -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button class="btn btn-primary" id="start-game-btn">Start Game</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(content);
            
            // Generate player setup cards
            this.generatePlayerSetupCards();
            
            // Handle player count changes
            document.getElementById('player-count').addEventListener('change', () => {
                this.generatePlayerSetupCards();
            });
            
            document.getElementById('start-game-btn').addEventListener('click', () => {
                const playerCount = parseInt(document.getElementById('player-count').value);
                const startingMoney = parseInt(document.getElementById('starting-money').value);
                const players = [];
                
                for (let i = 0; i < playerCount; i++) {
                    const nameInput = document.getElementById(`player-${i}-name`);
                    const tokenSelect = document.getElementById(`player-${i}-token`);
                    
                    const name = nameInput?.value?.trim() || `Player ${i + 1}`;
                    const tokenIndex = parseInt(tokenSelect?.value || i);
                    const token = constants.TOKENS[tokenIndex].name;
                    
                    players.push({
                        name: name,
                        token: token,
                        money: startingMoney
                    });
                }
                
                this.hideModal();
                resolve({
                    players,
                    settings: {
                        startingMoney,
                        gameMode: 'standard'
                    }
                });
            });
        });
    }

    generatePlayerSetupCards() {
        const container = document.getElementById('player-setup-container');
        const playerCount = parseInt(document.getElementById('player-count').value);
        
        container.innerHTML = '';
        
        for (let i = 0; i < playerCount; i++) {
            const card = this.createPlayerSetupCard(i);
            container.appendChild(card);
        }
    }

    createPlayerSetupCard(index) {
        const card = document.createElement('div');
        card.className = 'player-setup-card';
        
        const token = constants.TOKENS[index];
        
        card.innerHTML = `
            <div class="player-setup-header">
                <div class="player-token-preview" style="background-color: ${token.color}">
                    ${token.emoji}
                </div>
                <h4>Player ${index + 1}</h4>
            </div>
            <div class="player-setup-form">
                <div class="form-group">
                    <label for="player-${index}-name">Name:</label>
                    <input type="text"
                           id="player-${index}-name"
                           class="form-control"
                           value="Player ${index + 1}"
                           maxlength="20"
                           placeholder="Enter player name">
                </div>
                <div class="form-group">
                    <label for="player-${index}-token">Token:</label>
                    <select id="player-${index}-token" class="form-control">
                        ${constants.TOKENS.map((t, i) => `
                            <option value="${i}" ${i === index ? 'selected' : ''}>
                                ${t.emoji} ${t.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
        
        // Handle token changes
        const tokenSelect = card.querySelector(`#player-${index}-token`);
        const tokenPreview = card.querySelector('.player-token-preview');
        
        tokenSelect.addEventListener('change', (e) => {
            const selectedToken = constants.TOKENS[parseInt(e.target.value)];
            tokenPreview.style.backgroundColor = selectedToken.color;
            tokenPreview.textContent = selectedToken.emoji;
        });
        
        return card;
    }

    async showPlayerManagement(players) {
        return new Promise((resolve) => {
            const content = `
                <div class="modal-overlay">
                    <div class="modal-container modal-large">
                        <div class="modal-header">
                            <h2 class="modal-title">Player Management</h2>
                            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="player-management-list">
                                ${players.map((player, index) => `
                                    <div class="player-management-item ${player.isBankrupt ? 'bankrupt' : ''}">
                                        <div class="player-info">
                                            <div class="player-token-small" style="background-color: ${constants.TOKENS[index].color}">
                                                ${constants.TOKENS[index].emoji}
                                            </div>
                                            <div>
                                                <strong>${player.name}</strong>
                                                <div>$${player.money.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div class="player-actions">
                                            ${!player.isBankrupt ? `
                                                <button class="btn btn-sm btn-info" onclick="window.showPlayerDetails('${player.id}')">
                                                    Details
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(content);
        });
    }

    async showConfirm(options) {
        return new Promise((resolve) => {
            const content = `
                <div class="modal-overlay">
                    <div class="modal-container modal-small">
                        <div class="modal-header">
                            <h2 class="modal-title">${options.title}</h2>
                        </div>
                        <div class="modal-body">
                            <p>${options.message}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="cancel-btn">${options.cancelText || 'Cancel'}</button>
                            <button class="btn btn-primary" id="confirm-btn">${options.confirmText || 'OK'}</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(content);
            
            document.getElementById('confirm-btn').addEventListener('click', () => {
                this.hideModal();
                resolve(true);
            });
            
            document.getElementById('cancel-btn').addEventListener('click', () => {
                this.hideModal();
                resolve(false);
            });
        });
    }

    showError(message) {
        const content = `
            <div class="modal-overlay">
                <div class="modal-container modal-small">
                    <div class="modal-header">
                        <h2 class="modal-title">Error</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="text-danger">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    /**
     * Show a modal by ID
     * @param {string} modalId - The ID of the modal to show
     */
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }

    /**
     * Hide a modal by ID
     * @param {string} modalId - The ID of the modal to hide
     */
    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }
}