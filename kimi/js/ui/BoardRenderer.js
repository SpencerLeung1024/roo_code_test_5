/**
 * Board Renderer
 * Handles rendering of the game board
 */

import { constants } from '../config/constants.js';

/**
 * Renders the game board and squares
 */
export class BoardRenderer {
    constructor() {
        this.boardElement = null;
        this.squares = [];
    }

    async init() {
        this.boardElement = document.getElementById('board-grid');
        if (!this.boardElement) {
            throw new Error('Board element not found');
        }
        
        console.log('Board Renderer initialized');
    }

    renderBoard(board) {
        if (!this.boardElement || !board) return;
        
        this.boardElement.innerHTML = '';
        this.squares = [];
        
        board.getSquares().forEach((square, index) => {
            const squareElement = this.createSquareElement(square, index);
            this.boardElement.appendChild(squareElement);
            this.squares.push(squareElement);
        });
        
        console.log('Board rendered with', board.getSquares().length, 'squares');
    }

    createSquareElement(square, position) {
        const element = document.createElement('div');
        element.className = `square ${square.type}`;
        element.dataset.position = position;
        element.dataset.type = square.type;
        
        // Add square content based on type
        switch (square.type) {
            case 'property':
                const colorClass = square.data?.colorGroup ? `color-${square.data.colorGroup}` : '';
                element.innerHTML = `
                    <div class="color-bar ${colorClass}"></div>
                    <div class="property-name">${square.name}</div>
                    <div class="property-price">$${square.data?.price || 0}</div>
                    <div class="property-houses" id="houses-${position}"></div>
                `;
                break;
                
            case 'railroad':
                element.innerHTML = `
                    <div class="square-icon">🚂</div>
                    <div class="square-name">${square.name}</div>
                    <div class="square-price">$${square.data?.price || 0}</div>
                `;
                break;
                
            case 'utility':
                element.innerHTML = `
                    <div class="square-icon">⚡</div>
                    <div class="square-name">${square.name}</div>
                    <div class="square-price">$${square.data?.price || 0}</div>
                `;
                break;
                
            case 'tax':
                element.innerHTML = `
                    <div class="square-icon">💰</div>
                    <div class="square-name">${square.name}</div>
                    <div class="square-price">$${square.data?.amount || 0}</div>
                `;
                break;
                
            case 'chance':
                element.innerHTML = `
                    <div class="square-icon">?</div>
                    <div class="square-name">${square.name}</div>
                `;
                break;
                
            case 'community-chest':
                element.innerHTML = `
                    <div class="square-icon">🎁</div>
                    <div class="square-name">${square.name}</div>
                `;
                break;
                
            case 'go':
                element.innerHTML = `
                    <div class="square-icon">🏁</div>
                    <div class="square-name">${square.name}</div>
                    <div class="square-description">Collect $${square.data?.salary || 0}</div>
                `;
                break;
                
            case 'jail':
                element.innerHTML = `
                    <div class="square-icon">🔒</div>
                    <div class="square-name">${square.name}</div>
                    <div class="square-description">Just Visiting</div>
                `;
                break;
                
            case 'free-parking':
                element.innerHTML = `
                    <div class="square-icon">🅿️</div>
                    <div class="square-name">${square.name}</div>
                `;
                break;
                
            case 'go-to-jail':
                element.innerHTML = `
                    <div class="square-icon">🚔</div>
                    <div class="square-name">${square.name}</div>
                `;
                break;
                
            default:
                element.innerHTML = `
                    <div class="square-name">${square.name}</div>
                `;
        }
        
        // Add event listeners for interaction
        element.addEventListener('click', () => this.handleSquareClick(square, position));
        element.addEventListener('mouseenter', () => this.handleSquareHover(square, position));
        element.addEventListener('mouseleave', () => this.handleSquareLeave(square, position));
        
        return element;
    }

    highlightSquare(position) {
        this.squares.forEach(square => square.classList.remove('active'));
        if (this.squares[position]) {
            this.squares[position].classList.add('active');
        }
    }

    updatePlayerTokens(players) {
        const tokensContainer = document.getElementById('player-tokens');
        if (!tokensContainer) return;
        
        tokensContainer.innerHTML = '';
        
        players.forEach((player, index) => {
            const token = document.createElement('div');
            token.className = `player-token player-${index + 1}`;
            token.textContent = constants.TOKENS[index]?.emoji || (index + 1);
            token.style.backgroundColor = constants.TOKENS[index]?.color || '#999';
            
            // Calculate position on the board
            const position = this.calculateTokenPosition(player.position);
            token.style.left = position.left;
            token.style.top = position.top;
            token.title = player.name;
            tokensContainer.appendChild(token);
        });
    }

    /**
     * Calculate the exact position for a token on the board
     * @param {number} position - Board position (0-39)
     * @returns {Object} Position object with left and top percentages
     */
    calculateTokenPosition(position) {
        const squareSize = 9.09; // 100% / 11 squares
        const offset = 0.5; // Small offset for centering
        
        if (position >= 0 && position <= 10) {
            // Bottom row (0-10)
            return {
                left: `${(10 - position) * squareSize + offset}%`,
                top: `${10 * squareSize + offset}%`
            };
        } else if (position >= 11 && position <= 20) {
            // Right side (11-20)
            return {
                left: `${10 * squareSize + offset}%`,
                top: `${(20 - position) * squareSize + offset}%`
            };
        } else if (position >= 21 && position <= 30) {
            // Top row (21-30)
            return {
                left: `${(position - 20) * squareSize + offset}%`,
                top: `${0 + offset}%`
            };
        } else {
            // Left side (31-39)
            return {
                left: `${0 + offset}%`,
                top: `${(position - 30) * squareSize + offset}%`
            };
        }
    }

    /**
     * Update the visual state of a property (houses, hotels, ownership)
     * @param {Square} square - The square to update
     * @param {number} position - Position on the board
     * @param {Player} owner - The owner of the property
     */
    updatePropertyState(square, position, owner) {
        const squareElement = this.squares[position];
        if (!squareElement || square.type !== 'property') return;

        // Update ownership indicator
        if (owner) {
            squareElement.classList.add('owned');
            squareElement.style.setProperty('--owner-color', owner.color || '#3498db');
        } else {
            squareElement.classList.remove('owned');
        }

        // Update houses/hotels
        const housesContainer = squareElement.querySelector(`#houses-${position}`);
        if (housesContainer && square.data) {
            housesContainer.innerHTML = '';
            
            if (square.data.hasHotel) {
                housesContainer.innerHTML = '<div class="hotel"></div>';
            } else if (square.data.houses > 0) {
                for (let i = 0; i < square.data.houses; i++) {
                    const house = document.createElement('div');
                    house.className = 'house';
                    housesContainer.appendChild(house);
                }
            }
        }

        // Update mortgaged state
        if (square.data?.isMortgaged) {
            squareElement.classList.add('mortgaged');
        } else {
            squareElement.classList.remove('mortgaged');
        }
    }

    /**
     * Handle square click events
     * @param {Square} square - The clicked square
     * @param {number} position - Position on the board
     */
    handleSquareClick(square, position) {
        // Dispatch custom event for square click
        const event = new CustomEvent('square:click', {
            detail: { square, position }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle square hover events
     * @param {Square} square - The hovered square
     * @param {number} position - Position on the board
     */
    handleSquareHover(square, position) {
        // Dispatch custom event for square hover
        const event = new CustomEvent('square:hover', {
            detail: { square, position }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle square leave events
     * @param {Square} square - The left square
     * @param {number} position - Position on the board
     */
    handleSquareLeave(square, position) {
        // Dispatch custom event for square leave
        const event = new CustomEvent('square:leave', {
            detail: { square, position }
        });
        document.dispatchEvent(event);
    }

    /**
     * Animate token movement from one position to another
     * @param {number} playerIndex - Index of the player
     * @param {number} fromPosition - Starting position
     * @param {number} toPosition - Ending position
     */
    animateTokenMovement(playerIndex, fromPosition, toPosition) {
        const token = document.querySelector(`.player-token.player-${playerIndex + 1}`);
        if (!token) return;

        token.classList.add('token-moving');
        
        const newPosition = this.calculateTokenPosition(toPosition);
        token.style.left = newPosition.left;
        token.style.top = newPosition.top;

        setTimeout(() => {
            token.classList.remove('token-moving');
        }, 500);
    }

    /**
     * Show property details in a tooltip
     * @param {Square} square - The property square
     * @param {number} position - Position on the board
     */
    showPropertyTooltip(square, position) {
        if (square.type !== 'property') return;

        const element = this.squares[position];
        if (!element) return;

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'property-tooltip';
        tooltip.innerHTML = `
            <h4>${square.name}</h4>
            <p>Price: $${square.data?.price || 0}</p>
            <p>Rent: $${square.data?.baseRent || 0}</p>
            ${square.data?.colorGroup ? `<p>Color Group: ${square.data.getColorGroupName?.() || square.data.colorGroup}</p>` : ''}
            ${square.data?.owner ? `<p>Owner: ${square.data.owner}</p>` : '<p>Unowned</p>'}
            ${square.data?.houses ? `<p>Houses: ${square.data.houses}</p>` : ''}
            ${square.data?.hasHotel ? '<p>Hotel: Yes</p>' : ''}
            ${square.data?.isMortgaged ? '<p style="color: red;">Mortgaged</p>' : ''}
        `;

        // Position tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1000';
        tooltip.style.background = 'white';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.borderRadius = '4px';
        tooltip.style.padding = '10px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        tooltip.style.maxWidth = '200px';

        document.body.appendChild(tooltip);

        // Position near the square
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;

        return tooltip;
    }
}