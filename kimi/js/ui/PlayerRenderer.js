/**
 * Player Renderer
 * Handles rendering of player information and tokens
 */

import { constants } from '../config/constants.js';

/**
 * Renders player information, tokens, and controls
 */
export class PlayerRenderer {
    constructor() {
        this.currentPlayerElement = null;
        this.playerListElement = null;
        this.playerTokensElement = null;
        this.players = [];
        this.currentPlayerIndex = 0;
    }

    async init() {
        this.currentPlayerElement = document.getElementById('current-player');
        this.playerListElement = document.getElementById('player-list');
        this.playerTokensElement = document.getElementById('player-tokens');
        
        console.log('Player Renderer initialized');
    }

    renderPlayers(players, currentPlayerIndex = 0) {
        this.players = players;
        this.currentPlayerIndex = currentPlayerIndex;
        
        this.renderCurrentPlayer(players, currentPlayerIndex);
        this.renderPlayerList(players, currentPlayerIndex);
        this.renderPlayerTokens(players);
    }

    renderCurrentPlayer(players, currentPlayerIndex) {
        if (!this.currentPlayerElement || !players.length) return;
        
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        
        const playerName = this.currentPlayerElement.querySelector('#player-name');
        const playerMoney = this.currentPlayerElement.querySelector('#player-money');
        
        if (playerName) {
            playerName.textContent = currentPlayer.name;
            playerName.style.color = this.getTokenColor(currentPlayer.token);
        }
        if (playerMoney) {
            playerMoney.textContent = `$${currentPlayer.money.toLocaleString()}`;
            playerMoney.className = `player-money ${currentPlayer.money < 0 ? 'negative' : ''}`;
        }
        
        // Update current player highlight
        this.updateCurrentPlayerHighlight(currentPlayer);
    }

    renderPlayerList(players, currentPlayerIndex) {
        if (!this.playerListElement) return;
        
        const container = this.playerListElement.querySelector('.players-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerCard = this.createPlayerCard(player, index, index === currentPlayerIndex);
            container.appendChild(playerCard);
        });
    }

    createPlayerCard(player, index, isCurrent = false) {
        const card = document.createElement('div');
        card.className = `player-card ${player.isBankrupt ? 'bankrupt' : ''} ${isCurrent ? 'current-player-highlight' : ''}`;
        card.dataset.playerId = player.id;
        
        const token = constants.TOKENS[index] || constants.TOKENS[0];
        const buildings = player.getBuildingCount ? player.getBuildingCount() : { houses: 0, hotels: 0 };
        
        card.innerHTML = `
            <div class="player-header">
                <div class="player-token-small player-${index + 1}"
                     style="background-color: ${token.color}"
                     title="${token.name}">
                    ${token.emoji}
                </div>
                <span class="player-name">${player.name}</span>
                ${isCurrent ? '<span class="current-indicator">→</span>' : ''}
            </div>
            <div class="player-money ${player.money < 0 ? 'negative' : ''}">
                $${player.money.toLocaleString()}
            </div>
            <div class="player-details">
                <div class="player-position">Position: ${this.getPositionName(player.position)}</div>
                <div class="player-properties">
                    Properties: ${player.properties.length}
                    ${buildings.houses > 0 ? `<span class="building-count">H:${buildings.houses}</span>` : ''}
                    ${buildings.hotels > 0 ? `<span class="building-count">T:${buildings.hotels}</span>` : ''}
                </div>
                <div class="player-status">
                    ${player.inJail ? '<span class="status-badge in-jail">In Jail</span>' : ''}
                    ${player.getOutOfJailFreeCards > 0 ? `<span class="status-badge get-out-free">${player.getOutOfJailFreeCards}× Get Out Free</span>` : ''}
                    ${player.isBankrupt ? '<span class="status-badge bankrupt">Bankrupt</span>' : ''}
                </div>
            </div>
            <div class="player-net-worth">
                Net Worth: $${player.getNetWorth().toLocaleString()}
            </div>
        `;
        
        return card;
    }

    renderPlayerTokens(players) {
        if (!this.playerTokensElement) return;
        
        this.playerTokensElement.innerHTML = '';
        
        players.forEach((player, index) => {
            if (player.isBankrupt) return;
            
            const token = this.createPlayerToken(player, index);
            this.positionToken(token, player.position, index);
            this.playerTokensElement.appendChild(token);
        });
    }

    createPlayerToken(player, index) {
        const token = document.createElement('div');
        const tokenConfig = constants.TOKENS[index] || constants.TOKENS[0];
        
        token.className = 'player-token';
        token.dataset.playerId = player.id;
        token.style.backgroundColor = tokenConfig.color;
        token.style.color = 'white';
        token.style.borderRadius = '50%';
        token.style.width = '24px';
        token.style.height = '24px';
        token.style.display = 'flex';
        token.style.alignItems = 'center';
        token.style.justifyContent = 'center';
        token.style.fontSize = '14px';
        token.style.fontWeight = 'bold';
        token.style.border = '2px solid white';
        token.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        token.style.position = 'absolute';
        token.style.transition = 'all 0.5s ease';
        token.style.zIndex = '10';
        token.title = player.name;
        
        token.textContent = tokenConfig.emoji;
        
        return token;
    }

    positionToken(tokenElement, position, playerIndex) {
        // Calculate position on board (simplified for now)
        const boardElement = document.getElementById('board-grid');
        if (!boardElement) return;
        
        const squares = boardElement.querySelectorAll('.board-square');
        if (!squares[position]) return;
        
        const square = squares[position];
        const squareRect = square.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();
        
        // Offset tokens to avoid overlap
        const offsetX = (playerIndex % 3) * 8 - 8;
        const offsetY = Math.floor(playerIndex / 3) * 8 - 8;
        
        const left = squareRect.left - boardRect.left + offsetX + 10;
        const top = squareRect.top - boardRect.top + offsetY + 10;
        
        tokenElement.style.left = `${left}px`;
        tokenElement.style.top = `${top}px`;
    }

    updateCurrentPlayerHighlight(currentPlayer) {
        // Remove previous highlights
        document.querySelectorAll('.current-player-highlight').forEach(el => {
            el.classList.remove('current-player-highlight');
        });
        
        // Add highlight to current player card
        const currentCard = document.querySelector(`[data-player-id="${currentPlayer.id}"]`);
        if (currentCard) {
            currentCard.classList.add('current-player-highlight');
        }
    }

    animatePlayerMove(player, fromPosition, toPosition) {
        const token = document.querySelector(`[data-player-id="${player.id}"]`);
        if (!token) return;
        
        // Animate through intermediate positions
        const steps = Math.abs(toPosition - fromPosition);
        const direction = toPosition > fromPosition ? 1 : -1;
        
        let currentStep = 0;
        const animateStep = () => {
            if (currentStep <= steps) {
                const intermediatePosition = fromPosition + (currentStep * direction);
                this.positionToken(token, intermediatePosition, this.players.findIndex(p => p.id === player.id));
                currentStep++;
                setTimeout(animateStep, 100);
            }
        };
        
        animateStep();
    }

    updatePlayerMoney(player, oldAmount, newAmount) {
        // Update money display with animation
        const moneyElements = document.querySelectorAll(`[data-player-id="${player.id}"] .player-money`);
        moneyElements.forEach(element => {
            element.textContent = `$${newAmount.toLocaleString()}`;
            element.classList.toggle('negative', newAmount < 0);
            
            // Add flash animation
            element.classList.add('money-changed');
            setTimeout(() => element.classList.remove('money-changed'), 1000);
        });
        
        // Update net worth
        this.updatePlayerNetWorth(player);
    }

    updatePlayerNetWorth(player) {
        const netWorthElements = document.querySelectorAll(`[data-player-id="${player.id}"] .player-net-worth`);
        netWorthElements.forEach(element => {
            element.textContent = `Net Worth: $${player.getNetWorth().toLocaleString()}`;
        });
    }

    showPlayerDetailsModal(player) {
        // Create detailed player info modal
        const modal = document.createElement('div');
        modal.className = 'modal player-details-modal';
        
        const buildings = player.getBuildingCount ? player.getBuildingCount() : { houses: 0, hotels: 0 };
        const propertiesByGroup = player.getPropertiesByColorGroup ? player.getPropertiesByColorGroup() : {};
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${player.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="player-stats">
                        <div class="stat-item">
                            <span class="stat-label">Money:</span>
                            <span class="stat-value">$${player.money.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Net Worth:</span>
                            <span class="stat-value">$${player.getNetWorth().toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Position:</span>
                            <span class="stat-value">${this.getPositionName(player.position)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Properties:</span>
                            <span class="stat-value">${player.properties.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Houses:</span>
                            <span class="stat-value">${buildings.houses}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Hotels:</span>
                            <span class="stat-value">${buildings.hotels}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Get Out of Jail Free:</span>
                            <span class="stat-value">${player.getOutOfJailFreeCards}</span>
                        </div>
                    </div>
                    
                    <div class="player-properties">
                        <h3>Properties</h3>
                        ${Object.entries(propertiesByGroup).map(([group, properties]) => `
                            <div class="property-group">
                                <h4>${group}</h4>
                                <ul>
                                    ${properties.map(prop => `
                                        <li>${prop.name} ${prop.isMortgaged ? '(Mortgaged)' : ''}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    getPositionName(position) {
        const square = constants.BOARD_SQUARES[position];
        return square ? square.name : `Position ${position}`;
    }

    getTokenColor(tokenName) {
        const token = constants.TOKENS.find(t => t.name === tokenName);
        return token ? token.color : '#3498db';
    }

    highlightBankruptcy(player) {
        const playerElements = document.querySelectorAll(`[data-player-id="${player.id}"]`);
        playerElements.forEach(element => {
            element.classList.add('bankrupt');
            element.style.animation = 'shake 0.5s';
        });
    }

    showTransactionFeedback(player, amount, reason = '') {
        const token = document.querySelector(`[data-player-id="${player.id}"]`);
        if (!token) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'transaction-feedback';
        feedback.textContent = `${amount > 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}${reason ? ` ${reason}` : ''}`;
        feedback.style.position = 'absolute';
        feedback.style.left = token.style.left;
        feedback.style.top = token.style.top;
        feedback.style.color = amount > 0 ? '#27ae60' : '#e74c3c';
        feedback.style.fontWeight = 'bold';
        feedback.style.fontSize = '14px';
        feedback.style.pointerEvents = 'none';
        feedback.style.animation = 'float-up 2s forwards';
        
        this.playerTokensElement.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 2000);
    }
}