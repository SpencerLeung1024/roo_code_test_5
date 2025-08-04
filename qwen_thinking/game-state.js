const initialBoardSpaces = [
    { name: "Go", type: "go" },
    { name: "Mediterranean Ave", type: "property", color: "brown", price: 60, rent: 2 },
    { name: "Community Chest", type: "community_chest" },
    { name: "Baltic Ave", type: "property", color: "brown", price: 60, rent: 4 },
    { name: "Income Tax", type: "tax", amount: 200 },
    { name: "Reading Railroad", type: "railroad", color: "railroad", price: 200, baseRent: 25 },
    { name: "Oriental Ave", type: "property", color: "light-blue", price: 100, rent: 6 },
    { name: "Chance", type: "chance" },
    { name: "Vermont Ave", type: "property", color: "light-blue", price: 100, rent: 6 },
    { name: "Connecticut Ave", type: "property", color: "light-blue", price: 120, rent: 8 },
    { name: "Jail", type: "jail" },
    { name: "St. Charles Place", type: "property", color: "pink", price: 140, rent: 10 },
    { name: "Electric Company", type: "utility", color: "utility", price: 150, multiplier: 4 },
    { name: "States Ave", type: "property", color: "pink", price: 140, rent: 10 },
    { name: "Virginia Ave", type: "property", color: "pink", price: 160, rent: 12 },
    { name: "Pennsylvania Railroad", type: "railroad", color: "railroad", price: 200, baseRent: 25 },
    { name: "St. James Place", type: "property", color: "orange", price: 180, rent: 14 },
    { name: "Community Chest", type: "community_chest" },
    { name: "Tennessee Ave", type: "property", color: "orange", price: 180, rent: 14 },
    { name: "New York Ave", type: "property", color: "orange", price: 200, rent: 16 },
    { name: "Free Parking", type: "free_parking" },
    { name: "Kentucky Ave", type: "property", color: "red", price: 220, rent: 18 },
    { name: "Chance", type: "chance" },
    { name: "Indiana Ave", type: "property", color: "red", price: 220, rent: 18 },
    { name: "Illinois Ave", type: "property", color: "red", price: 240, rent: 20 },
    { name: "B&O Railroad", type: "railroad", color: "railroad", price: 200, baseRent: 25 },
    { name: "Atlantic Ave", type: "property", color: "yellow", price: 260, rent: 22 },
    { name: "Ventnor Ave", type: "property", color: "yellow", price: 260, rent: 22 },
    { name: "Water Works", type: "utility", color: "utility", price: 150, multiplier: 4 },
    { name: "Marvin Gardens", type: "property", color: "yellow", price: 280, rent: 24 },
    { name: "Go To Jail", type: "go_to_jail" },
    { name: "Pacific Ave", type: "property", color: "green", price: 300, rent: 26 },
    { name: "North Carolina Ave", type: "property", color: "green", price: 300, rent: 26 },
    { name: "Community Chest", type: "community_chest" },
    { name: "Pennsylvania Ave", type: "property", color: "green", price: 320, rent: 28 },
    { name: "Short Line", type: "railroad", color: "railroad", price: 200, baseRent: 25 },
    { name: "Chance", type: "chance" },
    { name: "Park Place", type: "property", color: "blue", price: 350, rent: 35 },
    { name: "Luxury Tax", type: "tax", amount: 75 },
    { name: "Boardwalk", type: "property", color: "blue", price: 400, rent: 50 }
];

export const gameState = {
    players: [],
    boardSpaces: initialBoardSpaces,
    currentPlayerIndex: 0,
    gamePhase: 'setup', // 'setup', 'rolling', 'buying', 'trading', 'ended'
    lastDiceTotal: 0
};

let subscribers = {};

export function subscribe(event, callback) {
    if (!subscribers[event]) {
        subscribers[event] = [];
    }
    subscribers[event].push(callback);
}

export function updateState(updates) {
    Object.assign(gameState, updates);
    if (subscribers['stateUpdated']) {
        subscribers['stateUpdated'].forEach(callback => callback(updates));
    }
}