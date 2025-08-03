// Game State Manager for Monopoly Game
// Handles game state persistence, win conditions, statistics tracking, and game flow management

class GameStateManager {
    constructor() {
        this.gameState = {
            players: [],
            currentPlayerIndex: 0,
            board: null,
            properties: [],
            chanceCards: [],
            communityChestCards: [],
            gameState: 'setup', // 'setup', 'playing', 'paused', 'ended'
            turnPhase: 'roll', // 'roll', 'move', 'action', 'end'
            dice: [0, 0],
            turnCount: 0,
            statistics: {
                totalTurns: 0,
                propertiesBought: 0,
                rentPaid: 0,
                bankruptcies: 0
            },
            pausedAt: null
        };
        this.saveKey = 'monopolyGameState';
    }

    // Initialize game state
    initializeGame(playerData, boardData, propertyData, chanceCards, communityChestCards) {
        // Initialize players
        this.gameState.players = playerData.map((player, index) => ({
            id: index + 1,
            name: player.name,
            balance: player.startingBalance || 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0,
            getOutOfJailFreeCards: 0,
            bankrupt: false
        }));

        // Initialize board
        this.gameState.board = boardData;

        // Initialize properties
        this.gameState.properties = Object.entries(propertyData).map(([id, data]) => ({
            id: parseInt(id),
            name: data.name,
            position: data.position,
            price: data.price,
            baseRent: data.rent,
            type: data.type || 'property',
            owner: null,
            mortgaged: false,
            // Property-specific attributes
            ...(data.type === 'property' && {
                colorGroup: data.colorGroup,
                houseCost: data.houseCost,
                hotelCost: data.hotelCost,
                houses: 0,
                hasHotel: false,
                rentWithHouse: data.rentWithHouse,
                rentWithHotel: data.rentWithHotel,
                mortgageValue: data.mortgageValue
            }),
            ...(data.type === 'railroad' && {
                mortgageValue: data.mortgageValue
            }),
            ...(data.type === 'utility' && {
                rentTwo: data.rentTwo,
                mortgageValue: data.mortgageValue
            })
        }));

        // Initialize cards
        this.gameState.chanceCards = [...chanceCards];
        this.gameState.communityChestCards = [...communityChestCards];

        // Set initial game state
        this.gameState.gameState = 'playing';
        this.gameState.currentPlayerIndex = 0;
        this.gameState.turnPhase = 'roll';
        this.gameState.dice = [0, 0];
        this.gameState.turnCount = 0;
        this.gameState.statistics = {
            totalTurns: 0,
            propertiesBought: 0,
            rentPaid: 0,
            bankruptcies: 0
        };
        this.gameState.pausedAt = null;

        // Save initial state
        this.saveGameState();
    }

    // Get current game state
    getGameState() {
        return { ...this.gameState };
    }

    // Update game state
    updateGameState(updates) {
        this.gameState = { ...this.gameState, ...updates };
        this.saveGameState();
    }

    // Save game state to localStorage
    saveGameState() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.gameState));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    // Load game state from localStorage
    loadGameState() {
        try {
            const savedState = localStorage.getItem(this.saveKey);
            if (savedState) {
                this.gameState = JSON.parse(savedState);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return false;
        }
    }

    // Check if there's a saved game
    hasSavedGame() {
        try {
            return localStorage.getItem(this.saveKey) !== null;
        } catch (error) {
            console.error('Failed to check for saved game:', error);
            return false;
        }
    }

    // Clear saved game state
    clearGameState() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (error) {
            console.error('Failed to clear game state:', error);
            return false;
        }
    }

    // Update player information
    updatePlayer(playerId, updates) {
        const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.gameState.players[playerIndex] = { ...this.gameState.players[playerIndex], ...updates };
            this.saveGameState();
            return true;
        }
        return false;
    }

    // Update property information
    updateProperty(propertyId, updates) {
        const propertyIndex = this.gameState.properties.findIndex(p => p.id === propertyId);
        if (propertyIndex !== -1) {
            this.gameState.properties[propertyIndex] = { ...this.gameState.properties[propertyIndex], ...updates };
            this.saveGameState();
            return true;
        }
        return false;
    }

    // Check win condition (last player remaining)
    checkWinCondition() {
        const activePlayers = this.gameState.players.filter(player => !player.bankrupt);
        return activePlayers.length <= 1;
    }

    // Get winner (if game is over)
    getWinner() {
        if (!this.checkWinCondition()) return null;
        const activePlayers = this.gameState.players.filter(player => !player.bankrupt);
        return activePlayers.length === 1 ? activePlayers[0] : null;
    }

    // Handle bankruptcy
    handleBankruptcy(playerId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player) {
            player.bankrupt = true;
            // Return all properties to the bank
            this.gameState.properties.forEach(property => {
                if (property.owner === playerId) {
                    property.owner = null;
                    property.mortgaged = false;
                    if (property.type === 'property') {
                        property.houses = 0;
                        property.hasHotel = false;
                    }
                }
            });
            
            // Update statistics
            this.gameState.statistics.bankruptcies++;
            
            this.saveGameState();
            return true;
        }
        return false;
    }

    // Update statistics
    updateStatistics(stats) {
        this.gameState.statistics = { ...this.gameState.statistics, ...stats };
        this.saveGameState();
    }

    // Increment turn count
    incrementTurn() {
        this.gameState.turnCount++;
        this.gameState.statistics.totalTurns++;
        this.saveGameState();
    }

    // Pause game
    pauseGame() {
        if (this.gameState.gameState === 'playing') {
            this.gameState.gameState = 'paused';
            this.gameState.pausedAt = new Date().toISOString();
            this.saveGameState();
            return true;
        }
        return false;
    }

    // Resume game
    resumeGame() {
        if (this.gameState.gameState === 'paused') {
            this.gameState.gameState = 'playing';
            this.gameState.pausedAt = null;
            this.saveGameState();
            return true;
        }
        return false;
    }

    // End game
    endGame() {
        this.gameState.gameState = 'ended';
        this.saveGameState();
    }

    // Reset game state for a new game
    resetGameState() {
        this.gameState = {
            players: [],
            currentPlayerIndex: 0,
            board: null,
            properties: [],
            chanceCards: [],
            communityChestCards: [],
            gameState: 'setup',
            turnPhase: 'roll',
            dice: [0, 0],
            turnCount: 0,
            statistics: {
                totalTurns: 0,
                propertiesBought: 0,
                rentPaid: 0,
                bankruptcies: 0
            },
            pausedAt: null
        };
        this.saveGameState();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameStateManager;
} else {
    // In browser environment, attach to window
    window.GameStateManager = GameStateManager;
}