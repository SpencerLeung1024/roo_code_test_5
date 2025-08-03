// Board Manager for Monopoly Game
// Handles rendering and management of the game board

class BoardManager {
    constructor() {
        this.boardElement = null;
        this.spaces = boardData.spaces;
    }

    // Initialize the board
    init() {
        this.boardElement = document.getElementById('game-board');
        if (!this.boardElement) {
            console.error('Game board element not found');
            return;
        }
        this.renderBoard();
    }

    // Render the entire game board
    renderBoard() {
        if (!this.boardElement) {
            console.error('Board element not initialized');
            return;
        }

        // Clear existing content
        this.boardElement.innerHTML = '';

        // Create board structure
        this.createBoardStructure();
        
        // Render all spaces
        this.renderSpaces();
    }

    // Create the basic board structure
    createBoardStructure() {
        // Create the center area
        const center = document.createElement('div');
        center.className = 'center';
        center.innerHTML = '<h2>MONOPOLY</h2>';
        this.boardElement.appendChild(center);

        // Create containers for each side
        const topSpaces = document.createElement('div');
        topSpaces.className = 'top-spaces';
        topSpaces.id = 'top-spaces';
        this.boardElement.appendChild(topSpaces);

        const bottomSpaces = document.createElement('div');
        bottomSpaces.className = 'bottom-spaces';
        bottomSpaces.id = 'bottom-spaces';
        this.boardElement.appendChild(bottomSpaces);

        const leftSpaces = document.createElement('div');
        leftSpaces.className = 'left-spaces';
        leftSpaces.id = 'left-spaces';
        this.boardElement.appendChild(leftSpaces);

        const rightSpaces = document.createElement('div');
        rightSpaces.className = 'right-spaces';
        rightSpaces.id = 'right-spaces';
        this.boardElement.appendChild(rightSpaces);

        // Create corner spaces in correct positions
        this.createCorner('top-left', 'FREE PARKING');
        this.createCorner('top-right', 'GO TO JAIL');
        this.createCorner('bottom-left', 'JAIL');
        this.createCorner('bottom-right', 'GO');
    }

    // Create a corner space
    createCorner(className, text) {
        const corner = document.createElement('div');
        corner.className = `corner ${className}`;
        corner.textContent = text;
        this.boardElement.appendChild(corner);
    }

    // Render all spaces on the board
    renderSpaces() {
        // Render bottom row (positions 9-1) - reversed order from GO to JAIL
        const bottomSpacesContainer = document.getElementById('bottom-spaces');
        for (let i = 9; i >= 1; i--) {
            const space = this.getSpaceByPosition(i);
            if (space) {
                bottomSpacesContainer.appendChild(this.createSpaceElement(space));
            }
        }
        
        // Render left column (positions 11-19)
        const leftSpacesContainer = document.getElementById('left-spaces');
        for (let i = 11; i < 20; i++) {
            const space = this.getSpaceByPosition(i);
            if (space) {
                leftSpacesContainer.appendChild(this.createSpaceElement(space));
            }
        }
        
        // Render top row (positions 30-21) - reversed order from FREE PARKING to GO TO JAIL
        const topSpacesContainer = document.getElementById('top-spaces');
        for (let i = 30; i > 20; i--) {
            const space = this.getSpaceByPosition(i);
            if (space) {
                topSpacesContainer.appendChild(this.createSpaceElement(space));
            }
        }
        
        // Render right column (positions 39-31) - reversed order from GO TO JAIL to GO
        const rightSpacesContainer = document.getElementById('right-spaces');
        for (let i = 39; i >= 31; i--) {
            const space = this.getSpaceByPosition(i);
            if (space) {
                rightSpacesContainer.appendChild(this.createSpaceElement(space));
            }
        }
    }

    // Create a space element
    createSpaceElement(space) {
        const spaceElement = document.createElement('div');
        spaceElement.className = `space ${space.type}`;
        spaceElement.dataset.position = space.position;
        
        // Add property color bar if it's a property
        if (space.type === 'property' && space.colorGroup) {
            const colorBar = document.createElement('div');
            colorBar.className = 'property-color-bar';
            colorBar.style.backgroundColor = propertyColors[space.colorGroup] || '#ccc';
            spaceElement.appendChild(colorBar);
        }
        
        // Add space name
        const nameElement = document.createElement('div');
        nameElement.className = 'space-name';
        nameElement.textContent = space.name;
        spaceElement.appendChild(nameElement);
        
        // Add price for properties, railroads, and utilities
        if (space.price) {
            const priceElement = document.createElement('div');
            priceElement.className = 'space-price';
            priceElement.textContent = `$${space.price}`;
            spaceElement.appendChild(priceElement);
        }
        
        // Add tax amount for tax spaces
        if (space.taxAmount) {
            const taxElement = document.createElement('div');
            taxElement.className = 'space-price';
            taxElement.textContent = `Pay $${space.taxAmount}`;
            spaceElement.appendChild(taxElement);
        }
        
        // Add ownership indicator (will be updated by property manager)
        const ownershipIndicator = document.createElement('div');
        ownershipIndicator.className = 'ownership-indicator';
        ownershipIndicator.style.display = 'none';
        spaceElement.appendChild(ownershipIndicator);
        
        // Add data-info attribute for hover information
        if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
            let infoText = `${space.name}`;
            if (space.price) {
                infoText += ` - Price: $${space.price}`;
            }
            
            // Add rent information for properties
            if (space.type === 'property') {
                const property = propertyData[space.position];
                if (property) {
                    infoText += ` - Rent: $${property.rent}`;
                    infoText += ` - Monopoly Rent: $${property.rent * 2}`;
                }
            }
            
            // Add rent information for railroads
            if (space.type === 'railroad') {
                infoText += " - Rent: $25";
                infoText += " - 2 Railroads: $50";
                infoText += " - 3 Railroads: $100";
                infoText += " - 4 Railroads: $200";
            }
            
            // Add rent information for utilities
            if (space.type === 'utility') {
                infoText += " - Rent: 4x dice roll";
                infoText += " - Both utilities: 10x dice roll";
            }
            
            spaceElement.setAttribute('data-info', infoText);
        }
        
        return spaceElement;
    }

    // Get space by position
    getSpaceByPosition(position) {
        return this.spaces.find(space => space.position === position);
    }

    // Get space by ID
    getSpaceById(id) {
        return this.spaces.find(space => space.id === id);
    }

    // Add player token to a space
    addPlayerToken(position, playerNumber) {
        const space = this.getSpaceByPosition(position);
        if (!space) {
            console.error(`Space at position ${position} not found`);
            return;
        }

        const spaceElement = document.querySelector(`.space[data-position="${position}"]`) ||
                             document.querySelector(`.corner.${this.getCornerClass(position)}`);
        
        if (spaceElement) {
            const token = document.createElement('div');
            token.className = `player-token token-${playerNumber}`;
            spaceElement.appendChild(token);
        }
    }

    // Get corner class based on position
    getCornerClass(position) {
        switch (position) {
            case 0: return 'bottom-right';  // GO
            case 10: return 'bottom-left';  // JAIL
            case 20: return 'top-left';     // FREE PARKING
            case 30: return 'top-right';    // GO TO JAIL
            default: return '';
        }
    }

    // Move player token from one space to another
    movePlayerToken(fromPosition, toPosition, playerNumber) {
        // Remove token from old position
        const fromSpaceElement = document.querySelector(`.space[data-position="${fromPosition}"]`) ||
                                  document.querySelector(`.corner.${this.getCornerClass(fromPosition)}`);
        
        if (fromSpaceElement) {
            const token = fromSpaceElement.querySelector(`.token-${playerNumber}`);
            if (token) {
                token.remove();
            }
        }
        
        // Add token to new position
        this.addPlayerToken(toPosition, playerNumber);
    }
    
    // Update property ownership indicator
    updatePropertyOwnership(position, playerNumber) {
        const spaceElement = document.querySelector(`.space[data-position="${position}"]`);
        if (!spaceElement) return;
        
        const ownershipIndicator = spaceElement.querySelector('.ownership-indicator');
        if (!ownershipIndicator) return;
        
        if (playerNumber !== null) {
            ownershipIndicator.style.display = 'block';
            ownershipIndicator.className = `ownership-indicator player-${playerNumber}`;
        } else {
            ownershipIndicator.style.display = 'none';
        }
    }
    
    // Update all property ownership indicators
    updateAllPropertyOwnerships(propertyManager, playerManager) {
        // Clear all ownership indicators first
        const allSpaces = document.querySelectorAll('.space');
        allSpaces.forEach(space => {
            const ownershipIndicator = space.querySelector('.ownership-indicator');
            if (ownershipIndicator) {
                ownershipIndicator.style.display = 'none';
            }
        });
        
        // Update ownership for all properties
        const allProperties = propertyManager.getAllProperties();
        allProperties.forEach(property => {
            if (property.owner !== null) {
                this.updatePropertyOwnership(property.position, property.owner);
            }
        });
        
        // Update player tokens
        playerManager.renderPlayerTokens(this);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoardManager;
} else {
    // In browser environment, attach to window
    window.BoardManager = BoardManager;
}