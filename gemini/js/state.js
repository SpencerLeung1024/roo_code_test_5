// Unus Venditor - Game State Management

export const gameState = {
    players: [
        {
            id: 1,
            name: "Player 1",
            token: "car",
            money: 1500,
            position: 0, // Index on the board array
            properties: [], // Array of property IDs
            inJail: false,
            getOutOfJailFreeCards: 0,
            rollsInJail: 0
        },
        {
            id: 2,
            name: "Player 2",
            token: "battleship",
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            getOutOfJailFreeCards: 0,
            rollsInJail: 0
        }
    ],
    properties: [
        { id: "mediterranean-avenue", name: "Mediterranean Avenue", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, group: "brown", owner: null, houses: 0 },
        { id: "baltic-avenue", name: "Baltic Avenue", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, group: "brown", owner: null, houses: 0 },
        { id: "reading-railroad", name: "Reading Railroad", price: 200, rent: [25, 50, 100, 200], group: "railroad", owner: null },
        // Add other properties as needed
    ],
    board: [
        { type: "go", name: "Go" },
        { type: "property", id: "mediterranean-avenue" },
        { type: "community-chest", name: "Community Chest" },
        { type: "property", id: "baltic-avenue" },
        { type: "income-tax", name: "Income Tax" },
        { type: "property", id: "reading-railroad"},
        // Simplified board for now
        { type: "chance", name: "Chance" },
     ],
     currentPlayerIndex: 0,
     dice: [0, 0],
    gameLog: [],
    gameOver: false,
};

/**
 * Advances to the next player's turn.
 */
export function nextTurn() {
    if (gameState.gameOver) return;
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

/**
 * Checks for game over conditions.
 * For now, it just checks if any player has negative money.
 * @returns {boolean} - True if the game is over, false otherwise.
 */
export function checkGameOver() {
    const bankruptPlayer = gameState.players.find(p => p.money < 0);
    if (bankruptPlayer) {
        logEvent(`${bankruptPlayer.name} has gone bankrupt!`);
        gameState.gameOver = true;

        const winner = gameState.players.find(p => p.id !== bankruptPlayer.id);
        if (winner) {
            logEvent(`${winner.name} wins the game!`);
        } else {
            logEvent("Game over!");
        }
        return true;
    }
    return false;
}

/**
 * Logs an event to the game log.
 * This is duplicated here to avoid circular dependencies.
 * A better solution might be a dedicated logger module.
 * @param {string} message - The message to log.
 */
export function logEvent(message) {
    gameState.gameLog.push(message);
    console.log(message);
}