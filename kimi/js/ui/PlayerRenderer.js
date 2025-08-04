/**
 * Enhanced Player Renderer
 * Handles rendering of player information, tokens, and advanced UI features
 */

import { constants } from '../config/constants.js';

/**
 * Enhanced player renderer with animations and advanced features
 */
export class PlayerRenderer {
    constructor() {
        this.currentPlayerElement = null;
        this.playerListElement = null;
        this.playerTokensElement = null;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.animationQueue = [];
        this.isAnimating = false;
    }

    async init() {
        this.currentPlayerElement = document.getElementById('current-player');
        this.playerListElement = document.getElementById('player-list');
        this.playerTokensElement = document.getElementById('player-tokens');
        
        console.log('✅ Enhanced Player Renderer initialized');
    }

    renderPlayers(players, currentPlayerIndex = 0) {
        this.players = players;
        this.currentPlayerIndex = currentPlayerIndex;
        
        this.renderCurrentPlayer(players, currentPlayerIndex);
        this.renderPlayerList(players, currentPlayerIndex);
        this.renderPlayerTokens(players);
        this.updateGameStats(players);
    }

    renderCurrentPlayer(players, currentPlayerIndex) {
        if (!this.currentPlayerElement || !players.length) return;
        
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        
        const playerName = document.getElementById('current-player-name');
        const playerMoney = document.getElementById('current-player-money');
        const playerProperties = document.getElementById('current-player-properties');
        const playerStatus = document.getElementById('current-player-status');
        const playerToken = document.getElementById('current-player-token');
        
        if (playerName) {
            playerName.textContent = currentPlayer.name;
            playerName.style.color = this.getTokenColor(currentPlayer.token);
        }
        
        if (playerMoney) {
            playerMoney.textContent = currentPlayer.money.toLocaleString();
            this.animateNumberChange(playerMoney, currentPlayer.money);
        }
        
        if (playerProperties) {
            const propertyCount = currentPlayer.properties.length;
            const buildingCount = this.getTotalBuildings(currentPlayer);
            playerProperties.textContent = `${propertyCount} properties, ${buildingCount.houses}🏠 ${buildingCount.hotels}🏨`;
        }
        
        if (playerStatus) {
            this.updatePlayerStatus(playerStatus, currentPlayer);
        }
        
        if (playerToken) {
            this.updatePlayerTokenDisplay(playerToken, currentPlayer, currentPlayerIndex);
        }
        
        this.updateCurrentPlayerHighlight(currentPlayer);
    }

    updatePlayerTokenDisplay(tokenElement, player, index) {
        const tokenConfig = constants.TOKENS[index] || constants.TOKENS[0];
        
        tokenElement.style.backgroundColor = tokenConfig.color;
        tokenElement.textContent = tokenConfig.emoji;
        tokenElement.className = 'player-token-large';
        
        // Add special effects for jail/bankruptcy
        if (player.inJail) {
            tokenElement.classList.add('in-jail');
            tokenElement.title = `${player.name} (In Jail)`;
        } else if (player.isBankrupt) {
            tokenElement.classList.add('bankrupt');
            tokenElement.title = `${player.name} (Bankrupt)`;
        } else {
            tokenElement.title = player.name;
        }
    }

    updatePlayerStatus(statusElement, player) {
        let status = 'Active';
        let className = 'status-active';
        
        if (player.isBankrupt) {
            status = 'Bankrupt';
            className = 'status-bankrupt';
        } else if (player.inJail) {
            status = `In Jail (${player.jailTurns || 0}/3)`;
            className = 'status-in-jail';
        }
        
        statusElement.textContent = status;
        statusElement.className = className;
    }

    renderPlayerList(players, currentPlayerIndex) {
        if (!this.playerListElement) return;
        
        const container = document.getElementById('players-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Sort players by net worth for ranking
        const sortedPlayers = [...players].sort((a, b) => b.getNetWorth() - a.getNetWorth());
        
        sortedPlayers.forEach((player, sortedIndex) => {
            const originalIndex = players.findIndex(p => p.id === player.id);
            const playerCard = this.createEnhancedPlayerCard(player, originalIndex, originalIndex === currentPlayerIndex, sortedIndex + 1);
            container.appendChild(playerCard);
        });
    }

    createEnhancedPlayerCard(player, index, isCurrent = false, rank = 1) {
        const card = document.createElement('div');
        card.className = `player-card ${player.isBankrupt ? 'bankrupt' : ''} ${isCurrent ? 'current-player-highlight' : ''}`;
        card.dataset.playerId = player.id;
        
        const token = constants.TOKENS[index] || constants.TOKENS[0];
        const buildings = this.getTotalBuildings(player);
        const netWorth = player.getNetWorth();
        
        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-rank">#${rank}</div>
                <div class="player-token-small player-${index + 1}" 
                     style="background-color: ${token.color}"
                     title="${token.name}">
                    ${token.emoji}
                </div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    ${isCurrent ? '<div class="current-indicator">🎯 Your Turn</div>' : ''}
                </div>
            </div>
            
            <div class="player-finances">
                <div class="player-money ${player.money < 0 ? 'negative' : ''}">
                    💰 $${player.money.toLocaleString()}
                </div>
                <div class="player-net-worth">
                    📊 $${netWorth.toLocaleString()}
                </div>
            </div>
            
            <div class="player-stats">
                <div class="stat-item">
                    <span class="stat-icon">📍</span>
                    <span>${this.getPositionName(player.position)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏠</span>
                    <span>${player.properties.length} properties</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🏗️</span>
                    <span>${buildings.houses}🏠 ${buildings.hotels}🏨</span>
                </div>
            </div>
            
            <div class="player-status-badges">
                ${player.inJail ? '<span class="status-badge in-jail">🔒 In Jail</span>' : ''}
                ${player.getOutOfJailFreeCards > 0 ? `<span class="status-badge get-out-free">🎫 ${player.getOutOfJailFreeCards}</span>` : ''}
                ${player.isBankrupt ? '<span class="status-badge bankrupt">💸 Bankrupt</span>' : ''}
            </div>
            
            <div class="player-actions">
                <button class="btn btn-sm view-details-btn" data-player-id="${player.id}">
                    👁️ Details
                </button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-details-btn').addEventListener('click', () => {
            this.showPlayerDetailsModal(player);
        });
        
        return card;
    }

    renderPlayerTokens(players) {
        if (!this.playerTokensElement) return;
        
        this.playerTokensElement.innerHTML = '';
        
        players.forEach((player, index) => {
            if (player.isBankrupt) return;
            
            const token = this.createEnhancedPlayerToken(player, index);
            this.positionToken(token, player.position, index);
            this.playerTokensElement.appendChild(token);
        });
    }

    createEnhancedPlayerToken(player, index) {
        const token = document.createElement('div');
        const tokenConfig = constants.TOKENS[index] || constants.TOKENS[0];
        
        token.className = `player-token player-${index + 1}`;
        token.dataset.playerId = player.id;
        token.dataset.position = player.position;
        
        // Enhanced styling
        token.style.backgroundColor = tokenConfig.color;
        token.style.color = 'white';
        token.style.borderRadius = '50%';
        token.style.width = '28px';
        token.style.height = '28px';
        token.style.display = 'flex';
        token.style.alignItems = 'center';
        token.style.justifyContent = 'center';
        token.style.fontSize = '16px';
        token.style.fontWeight = 'bold';
        token.style.border = '3px solid white';
        token.style.boxShadow = `
            0 4px 8px rgba(0,0,0,0.3),
            0 0 0 1px rgba(0,0,0,0.1),
            0 0 20px ${tokenConfig.color}40
        `;
        token.style.position = 'absolute';
        token.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        token.style.zIndex = '10';
        token.title = `${player.name} - ${this.getPositionName(player.position)}`;
        
        token.textContent = tokenConfig.emoji;
        
        // Add special effects
        if (player.inJail) {
            token.classList.add('in-jail');
            token.style.filter = 'grayscale(50%)';
        }
        
        if (player.isBankrupt) {
            token.classList.add('bankrupt');
            token.style.opacity = '0.5';
        }
        
        return token;
    }

    positionToken(tokenElement, position, playerIndex) {
        const boardElement = document.getElementById('board-grid');
        if (!boardElement) return;
        
        const squareSize = 100 / 11; // 9.09% per square
        let left, top;
        
        // Calculate exact position based on board layout
        if (position >= 0 && position <= 10) {
            // Bottom row (0-10)
            left = (10 - position) * squareSize + squareSize/2;
            top = 10 * squareSize + squareSize/2;
        } else if (position >= 11 && position <= 20) {
            // Right side (11-20)
            left = 10 * squareSize + squareSize/2;
            top = (20 - position) * squareSize + squareSize/2;
        } else if (position >= 21 && position <= 30) {
            // Top row (21-30)
            left = (position - 20) * squareSize + squareSize/2;
            top = 0 * squareSize + squareSize/2;
        } else {
            // Left side (31-39)
            left = 0 * squareSize + squareSize/2;
            top = (position - 30) * squareSize + squareSize/2;
        }
        
        // Offset for multiple tokens on same square
        const offsetX = (playerIndex % 3) * 8 - 8;
        const offsetY = Math.floor(playerIndex / 3) * 8 - 8;
        
        tokenElement.style.left = `calc(${left}% + ${offsetX}px)`;
        tokenElement.style.top = `calc(${top}% + ${offsetY}px)`;
        tokenElement.style.transform = 'translate(-50%, -50%)';
    }

    animatePlayerMove(player, fromPosition, toPosition, isDouble = false) {
        const token = document.querySelector(`[data-player-id="${player.id}"]`);
        if (!token) return;
        
        // Add moving class for animation
        token.classList.add('token-moving');
        
        // Calculate steps for smooth animation
        const steps = this.calculateMoveSteps(fromPosition, toPosition);
        
        this.animateMoveSequence(token, steps, 0, isDouble);
    }

    calculateMoveSteps(from, to) {
        const steps = [];
        let current = from;
        
        while (current !== to) {
            current = (current + 1) % 40;
            steps.push(current);
        }
        
        return steps;
    }

    animateMoveSequence(token, steps, index, isDouble) {
        if (index >= steps.length) {
            token.classList.remove('token-moving');
            if (isDouble) {
                token.classList.add('double-roll');
                setTimeout(() => token.classList.remove('double-roll'), 1000);
            }
            return;
        }
        
        const playerId = token.dataset.playerId;
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        
        this.positionToken(token, steps[index], playerIndex);
        
        setTimeout(() => {
            this.animateMoveSequence(token, steps, index + 1, isDouble);
        }, 200);
    }

    updatePlayerMoney(player, oldAmount, newAmount) {
        // Animate money change
        const moneyElements = document.querySelectorAll(`[data-player-id="${player.id}"] .player-money`);
        moneyElements.forEach(element => {
            this.animateNumberChange(element, newAmount);
            element.classList.toggle('negative', newAmount < 0);
            
            // Add flash animation
            element.classList.add('money-changed');
            setTimeout(() => element.classList.remove('money-changed'), 1000);
        });
        
        // Update net worth
        this.updatePlayerNetWorth(player);
        
        // Show transaction feedback
        this.showTransactionFeedback(player, newAmount - oldAmount);
    }

    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(/[^0-9-]/g, '')) || 0;
        const difference = newValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        
        let step = 0;
        const animate = () => {
            if (step < steps) {
                const displayValue = Math.round(currentValue + (stepValue * step));
                element.textContent = `$${displayValue.toLocaleString()}`;
                step++;
                requestAnimationFrame(animate);
            } else {
                element.textContent = `$${newValue.toLocaleString()}`;
            }
        };
        
        animate();
    }

    updatePlayerNetWorth(player) {
        const netWorthElements = document.querySelectorAll(`[data-player-id="${player.id}"] .player-net-worth`);
        netWorthElements.forEach(element => {
            this.animateNumberChange(element, player.getNetWorth());
        });
    }

    updateGameStats(players) {
        const totalProperties = players.reduce((sum, p) => sum + p.properties.length, 0);
        const totalBuildings = players.reduce((sum, p) => {
            const buildings = this.getTotalBuildings(p);
            return sum + buildings.houses + buildings.hotels;
        }, 0);
        
        // Update statistics display
        const statElements = {
            round: document.getElementById('stat-round'),
            turn: document.getElementById('stat-turn'),
            properties: document.getElementById('stat-properties'),
            rolls: document.getElementById('stat-rolls')
        };
        
        if (statElements.properties) {
            statElements.properties.textContent = `${totalProperties}/28`;
        }
    }

    showPlayerDetailsModal(player) {
        const modal = document.createElement('div');
        modal.className = 'modal player-details-modal';
        modal.id = 'player-details-modal';
        
        const buildings = this.getTotalBuildings(player);
        const propertiesByGroup = this.groupPropertiesByColor(player.properties);
        const totalNetWorth = player.getNetWorth();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>
                        <span class="player-token-small" style="background-color: ${this.getTokenColor(player.token)}">
                            ${constants.TOKENS[this.players.findIndex(p => p.id === player.id)]?.emoji || '🎲'}
                        </span>
                        ${player.name}
                    </h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="player-overview">
                        <div class="overview-card">
                            <h3>💰 Finances</h3>
                            <div class="finance-grid">
                                <div class="finance-item">
                                    <span class="label">Cash</span>
                                    <span class="value ${player.money < 0 ? 'negative' : ''}">$${player.money.toLocaleString()}</span>
                                </div>
                                <div class="finance-item">
                                    <span class="label">Net Worth</span>
                                    <span class="value">$${totalNetWorth.toLocaleString()}</span>
                                </div>
                                <div class="finance-item">
                                    <span class="label">Properties Value</span>
                                    <span class="value">$${this.calculatePropertiesValue(player).toLocaleString()}</span>
                                </div>
                                <div class="finance-item">
                                    <span class="label">Buildings Value</span>
                                    <span class="value">$${this.calculateBuildingsValue(player).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="overview-card">
                            <h3>📊 Statistics</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-icon">📍</span>
                                    <span>Position: ${this.getPositionName(player.position)}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🏠</span>
                                    <span>Properties: ${player.properties.length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🏗️</span>
                                    <span>Houses: ${buildings.houses}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🏨</span>
                                    <span>Hotels: ${buildings.hotels}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🎫</span>
                                    <span>Get Out Free: ${player.getOutOfJailFreeCards}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">${player.inJail ? '🔒' : '✅'}</span>
                                    <span>Status: ${player.inJail ? 'In Jail' : 'Active'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="properties-section">
                        <h3>🏠 Properties</h3>
                        ${Object.entries(propertiesByGroup).map(([group, properties]) => `
                            <div class="property-group">
                                <h4 class="group-header" style="border-left-color: ${this.getGroupColor(group)}">
                                    ${group} (${properties.length})
                                </h4>
                                <div class="properties-list">
                                    ${properties.map(prop => this.createPropertyCard(prop)).join('')}
                                </div>
                            </div>
                        `).join('')}
                        ${player.properties.length === 0 ? '<p class="no-properties">No properties owned</p>' : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Add animation
        setTimeout(() => modal.classList.add('show'), 10);
    }

    createPropertyCard(property) {
        const buildingInfo = this.getBuildingInfo(property);
        const mortgageStatus = property.isMortgaged ? '<span class="mortgaged-badge">Mortgaged</span>' : '';
        
        return `
            <div class="property-card">
                <div class="property-header">
                    <span class="property-name">${property.name}</span>
                    ${mortgageStatus}
                </div>
                <div class="property-details">
                    <span class="property-price">$${property.price.toLocaleString()}</span>
                    ${buildingInfo}
                </div>
            </div>
        `;
    }

    getTotalBuildings(player) {
        if (!player.getBuildingCount) return { houses: 0, hotels: 0 };
        return player.getBuildingCount();
    }

    calculatePropertiesValue(player) {
        return player.properties.reduce((sum, prop) => sum + (prop.price || 0), 0);
    }

    calculateBuildingsValue(player) {
        const buildings = this.getTotalBuildings(player);
        return (buildings.houses * 50) + (buildings.hotels * 200);
    }

    groupPropertiesByColor(properties) {
        const groups = {};
        properties.forEach(prop => {
            const group = prop.colorGroup || 'Other';
            if (!groups[group]) groups[group] = [];
            groups[group].push(prop);
        });
        return groups;
    }

    getBuildingInfo(property) {
        if (property.hasHotel) return '<span class="building-info">🏨 Hotel</span>';
        if (property.houses > 0) return `<span class="building-info">🏠 ${property.houses}</span>`;
        return '';
    }

    getGroupColor(group) {
        const colorMap = {
            'Brown': '#8B4513',
            'Light Blue': '#87CEEB',
            'Pink': '#FF69B4',
            'Orange': '#FFA500',
            'Red': '#FF0000',
            'Yellow': '#FFFF00',
            'Green': '#008000',
            'Dark Blue': '#0000FF',
            'Railroad': '#808080',
            'Utility': '#FFD700'
        };
        return colorMap[group] || '#CCCCCC';
    }

    showTransactionFeedback(player, amount, reason = '') {
        const token = document.querySelector(`[data-player-id="${player.id}"]`);
        if (!token) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'transaction-feedback';
        feedback.textContent = `${amount > 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}${reason ? ` ${reason}` : ''}`;
        feedback.style.cssText = `
            position: absolute;
            left: ${token.style.left};
            top: ${token.style.top};
            color: ${amount > 0 ? '#27ae60' : '#e74c3c'};
            font-weight: bold;
            font-size: 16px;
            pointer-events: none;
            z-index: 100;
            animation: float-up 2s forwards;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        `;
        
        this.playerTokensElement.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }

    highlightBankruptcy(player) {
        const playerElements = document.querySelectorAll(`[data-player-id="${player.id}"]`);
        playerElements.forEach(element => {
            element.classList.add('bankrupt');
            element.style.animation = 'shake 0.5s';
        });
        
        // Add bankruptcy notification
        this.showNotification(`${player.name} has gone bankrupt!`, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        switch(type) {
            case 'success': notification.style.background = '#27ae60'; break;
            case 'error': notification.style.background = '#e74c3c'; break;
            case 'warning': notification.style.background = '#f39c12'; break;
            default: notification.style.background = '#3498db';
        }
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    getPositionName(position) {
        const square = constants.BOARD_SQUARES[position];
        return square ? square.name : `Position ${position}`;
    }

    getTokenColor(tokenName) {
        const token = constants.TOKENS.find(t => t.name === tokenName);
        return token ? token.color : '#3498db';
    }
}
   