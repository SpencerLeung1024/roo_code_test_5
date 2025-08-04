// Unus Venditor - Game State Management

export const gameState = {
    players: [],
    properties: [
        { id: "mediterranean-avenue", name: "Via Mediterranea", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, group: "brown", owner: null, houses: 0 },
        { id: "baltic-avenue", name: "Avenida Baltica", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, group: "brown", owner: null, houses: 0 },
        { id: "reading-railroad", name: "Ferrovia Legens", price: 200, rent: [25, 50, 100, 200], group: "railroad", owner: null },
        { id: "oriental-avenue", name: "Avenida Orientalis", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, group: "light-blue", owner: null, houses: 0 },
        { id: "vermont-avenue", name: "Avenida Montis Viridis", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, group: "light-blue", owner: null, houses: 0 },
        { id: "connecticut-avenue", name: "Avenida Connecticuta", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, group: "light-blue", owner: null, houses: 0 },
        { id: "pennsylvania-railroad", name: "Ferrovia Pennsylvania", price: 200, rent: [25, 50, 100, 200], group: "railroad", owner: null },
        { id: "st-charles-place", name: "Locus Sancti Caroli", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, group: "pink", owner: null, houses: 0 },
        { id: "states-avenue", name: "Avenida Civitatum", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, group: "pink", owner: null, houses: 0 },
        { id: "virginia-avenue", name: "Avenida Virginia", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, group: "pink", owner: null, houses: 0 },
        { id: "b-o-railroad", name: "Ferrovia B. & O.", price: 200, rent: [25, 50, 100, 200], group: "railroad", owner: null },
        { id: "st-james-place", name: "Locus Sancti Jacobi", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, group: "orange", owner: null, houses: 0},
        { id: "tennessee-avenue", name: "Avenida Tennesia", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, group: "orange", owner: null, houses: 0},
        { id: "new-york-avenue", name: "Avenida Novi Eboraci", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, group: "orange", owner: null, houses: 0},
        { id: "short-line-railroad", name: "Ferrovia Brevis", price: 200, rent: [25, 50, 100, 200], group: "railroad", owner: null },
        { id: "kentucky-avenue", name: "Avenida Kentukia", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, group: "red", owner: null, houses: 0},
        { id: "indiana-avenue", name: "Avenida Indiana", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, group: "red", owner: null, houses: 0},
        { id: "illinois-avenue", name: "Avenida Illinoesia", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, group: "red", owner: null, houses: 0},
        { id: "atlantic-avenue", name: "Avenida Atlantica", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, group: "yellow", owner: null, houses: 0},
        { id: "ventnor-avenue", name: "Avenida Ventnor", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, group: "yellow", owner: null, houses: 0},
        { id: "marvin-gardens", name: "Horti Marvinus", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, group: "yellow", owner: null, houses: 0},
        { id: "pacific-avenue", name: "Avenida Pacifica", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, group: "green", owner: null, houses: 0},
        { id: "north-carolina-avenue", name: "Avenida Carolinae Septentrionalis", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, group: "green", owner: null, houses: 0},
        { id: "pennsylvania-avenue", name: "Avenida Pennsylvania", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, group: "green", owner: null, houses: 0},
        { id: "park-place", name: "Locus Parkus", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, group: "dark-blue", owner: null, houses: 0},
        { id: "boardwalk", name: "Via Ambulare", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, group: "dark-blue", owner: null, houses: 0},
        { id: "electric-company", name: "Societas Electrica", price: 150, rent: [], group: "utility", owner: null },
        { id: "water-works", name: "Opera Aquarum", price: 150, rent: [], group: "utility", owner: null }
    ],
    board: [
        { type: "go", name: "Go" },
        { type: "property", id: "mediterranean-avenue" },
        { type: "community-chest", name: "Community Chest" },
        { type: "property", id: "baltic-avenue" },
        { type: "income-tax", name: "Income Tax" },
        { type: "property", id: "reading-railroad"},
        { type: "property", id: "oriental-avenue" },
        { type: "chance", name: "Chance" },
        { type: "property", id: "vermont-avenue" },
        { type: "property", id: "connecticut-avenue" },
        { type: "jail", name: "Jail" },
        { type: "property", id: "st-charles-place" },
        { type: "property", id: "electric-company" },
        { type: "property", id: "states-avenue" },
        { type: "property", id: "virginia-avenue" },
        { type: "property", id: "pennsylvania-railroad" },
        { type: "property", id: "st-james-place" },
        { type: "community-chest", name: "Community Chest" },
        { type: "property", id: "tennessee-avenue" },
        { type: "property", id: "new-york-avenue" },
        { type: "free-parking", name: "Free Parking" },
        { type: "property", id: "kentucky-avenue" },
        { type: "chance", name: "Chance" },
        { type: "property", id: "indiana-avenue" },
        { type: "property", id: "illinois-avenue" },
        { type: "property", id: "b-o-railroad" },
        { type: "property", id: "atlantic-avenue" },
        { type: "property", id: "ventnor-avenue" },
        { type: "property", id: "water-works" },
        { type: "property", id: "marvin-gardens" },
        { type: "go-to-jail", name: "Go To Jail" },
        { type: "property", id: "pacific-avenue" },
        { type: "property", id: "north-carolina-avenue" },
        { type: "community-chest", name: "Community Chest" },
        { type: "property", id: "pennsylvania-avenue" },
        { type: "property", id: "short-line-railroad" },
        { type: "chance", name: "Chance" },
        { type: "property", id: "park-place" },
        { type: "luxury-tax", name: "Luxury Tax" },
        { type: "property", id: "boardwalk" }
     ],
     currentPlayerIndex: 0,
     dice: [0, 0],
    gameLog: [],
    gameOver: false,
    hasRolled: false,
};

/**
 * Creates the player objects based on the selected number.
 * @param {number} numberOfPlayers - The number of players to create.
 */
export function createPlayers(numberOfPlayers) {
    const tokens = ["car", "battleship", "top-hat", "thimble"]; // Add more if needed
    for (let i = 1; i <= numberOfPlayers; i++) {
        gameState.players.push({
            id: i,
            name: `Player ${i}`,
            token: tokens[i - 1],
            money: 1500,
            position: 0,
            properties: [],
            inJail: false,
            getOutOfJailFreeCards: 0,
            rollsInJail: 0
        });
    }
}

/**
 * Advances to the next player's turn.
 */
export function nextTurn() {
    if (gameState.gameOver) return;
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.hasRolled = false; // Reset for the new turn
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