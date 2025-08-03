// Player Manager for Monopoly Game
// Handles player-related functionality, turn management, and player operations

class Player {
    constructor(id, name, startingBalance = 1500) {
        this.id = id;
        this.name = name;
        this.balance = startingBalance;
        this.position = 0; // Start at GO
        this.properties = []; // Property IDs owned by this player
        this.inJail = false;
        this.jailTurns = 0;
        this.getOutOfJailFreeCards = 0;
        this.bankrupt = false;
    }

    // Move player by a number of spaces
    move(spaces) {
        if (this.bankrupt) return;
        
        this.position = (this.position + spaces) % 40;
        // Handle passing GO
        if (this.position < spaces % 40) {
            this.addMoney(200); // Collect $200 for passing GO
        }
    }

    // Move player to a specific position
    moveTo(position) {
        if (this.bankrupt) return;
        
        // Check if we're passing GO
        if (position < this.position && position !== 30) { // Don't collect for going to jail
            this.addMoney(200); // Collect $200 for passing GO
        }
        
        this.position = position;
    }

    // Add money to player's balance
    addMoney(amount) {
        if (this.bankrupt) return;
        this.balance += amount;
    }

    // Deduct money from player's balance
    deductMoney(amount) {
        if (this.bankrupt) return false;
        if (this.balance >= amount) {
            this.balance -= amount;
            return true;
        }
        return false; // Not enough money
    }

    // Buy a property
    buyProperty(propertyId, price) {
        if (this.bankrupt) return false;
        if (this.deductMoney(price)) {
            this.properties.push(propertyId);
            return true;
        }
        return false; // Not enough money
    }

    // Sell a property
    sellProperty(propertyId, price) {
        const index = this.properties.indexOf(propertyId);
        if (index !== -1) {
            this.properties.splice(index, 1);
            this.addMoney(price);
            return true;
        }
        return false; // Property not owned by player
    }

    // Check if player owns a property
    ownsProperty(propertyId) {
        return this.properties.includes(propertyId);
    }

    // Go to jail
    goToJail() {
        this.inJail = true;
        this.jailTurns = 0;
        this.moveTo(10); // Move to JAIL position
    }

    // Attempt to get out of jail
    attemptToLeaveJail() {
        this.jailTurns++;
        // Player can use a Get Out of Jail Free card if they have one
        if (this.getOutOfJailFreeCards > 0) {
            this.getOutOfJailFreeCards--;
            this.inJail = false;
            this.jailTurns = 0;
            return true;
        }
        // After 3 turns, player must pay $50
        if (this.jailTurns >= 3) {
            if (this.deductMoney(50)) {
                this.inJail = false;
                this.jailTurns = 0;
                return true;
            } else {
                // Player can't afford to get out of jail
                return false;
            }
        }
        return false; // Still in jail
    }

    // Use a Get Out of Jail Free card
    useGetOutOfJailFreeCard() {
        if (this.getOutOfJailFreeCards > 0) {
            this.getOutOfJailFreeCards--;
            this.inJail = false;
            this.jailTurns = 0;
            return true;
        }
        return false;
    }

    // Declare bankruptcy
    declareBankruptcy() {
        this.bankrupt = true;
        // Return all properties to the bank (in a real implementation, this would be handled by the property manager)
        this.properties = [];
    }

    // Get player's net worth (balance + property value)
    getNetWorth(propertyValues = {}) {
        let propertyValue = 0;
        for (const propertyId of this.properties) {
            propertyValue += propertyValues[propertyId] || 0;
        }
        return this.balance + propertyValue;
    }
}

class PlayerManager {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameState = 'setup'; // 'setup', 'playing', 'ended'
    }

    // Initialize players for the game
    initializePlayers(playerData) {
        this.players = [];
        for (let i = 0; i < playerData.length; i++) {
            const player = new Player(i + 1, playerData[i].name, playerData[i].startingBalance || 1500);
            this.players.push(player);
        }
        this.currentPlayerIndex = 0;
        this.gameState = 'playing';
    }

    // Get current player
    getCurrentPlayer() {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }

    // Get player by ID
    getPlayerById(id) {
        return this.players.find(player => player.id === id) || null;
    }

    // Get all players
    getAllPlayers() {
        return this.players;
    }

    // Move to next player's turn
    nextTurn() {
        if (this.players.length === 0) return null;
        
        // Check if current player is bankrupt
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.bankrupt) {
            // Skip bankrupt players
            let attempts = 0;
            do {
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                attempts++;
            } while (this.getCurrentPlayer().bankrupt && attempts < this.players.length);
        } else {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        
        return this.getCurrentPlayer();
    }

    // Check if game has ended (only one player left)
    isGameOver() {
        const activePlayers = this.players.filter(player => !player.bankrupt);
        return activePlayers.length <= 1;
    }

    // Get winner (if game is over)
    getWinner() {
        if (!this.isGameOver()) return null;
        const activePlayers = this.players.filter(player => !player.bankrupt);
        return activePlayers.length === 1 ? activePlayers[0] : null;
    }

    // Update player panel in UI
    updatePlayerPanel(player, panelElement) {
        if (!panelElement) return;
        
        const balanceElement = panelElement.querySelector('.balance');
        const propertiesElement = panelElement.querySelector('.properties');
        
        if (balanceElement) {
            balanceElement.textContent = `Balance: $${player.balance}`;
            // Add visual indicator for low balance
            if (player.balance < 500) {
                balanceElement.style.backgroundColor = '#ffebee';
                balanceElement.style.color = '#c62828';
                balanceElement.style.fontWeight = 'bold';
            } else {
                balanceElement.style.backgroundColor = '';
                balanceElement.style.color = '';
                balanceElement.style.fontWeight = '';
            }
        }
        
        if (propertiesElement) {
            propertiesElement.textContent = `Properties: ${player.properties.length}`;
        }
        
        // Update panel styling based on player status
        if (player.bankrupt) {
            panelElement.classList.add('bankrupt');
        } else {
            panelElement.classList.remove('bankrupt');
        }
        
        // Add jail styling if player is in jail
        if (player.inJail) {
            panelElement.classList.add('in-jail');
        } else {
            panelElement.classList.remove('in-jail');
        }
    }

    // Update all player panels
    updateAllPlayerPanels() {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const panelElement = document.querySelectorAll('.player-panel')[i];
            if (panelElement) {
                this.updatePlayerPanel(player, panelElement);
            }
        }
    }

    // Render player tokens on the board
    renderPlayerTokens(boardManager) {
        // Clear all existing tokens first
        const allSpaces = document.querySelectorAll('.space, .corner');
        allSpaces.forEach(space => {
            const tokens = space.querySelectorAll('.player-token');
            tokens.forEach(token => token.remove());
        });
        
        // Add tokens for each player
        this.players.forEach(player => {
            if (!player.bankrupt) {
                boardManager.addPlayerToken(player.position, player.id);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player, PlayerManager };
} else {
    // In browser environment, attach to window
    window.Player = Player;
    window.PlayerManager = PlayerManager;
}