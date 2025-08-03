/**
 * Game Constants and Configuration
 */

export const constants = {
    // Game Settings
    GAME: {
        VERSION: '1.0.0',
        NAME: 'Monopoly Game',
        MIN_PLAYERS: 2,
        MAX_PLAYERS: 6,
        STARTING_MONEY: 1500,
        SALARY: 200,
        MAX_HOUSES: 32,
        MAX_HOTELS: 12
    },

    // Board Configuration
    BOARD: {
        SIZE: 40,
        GO_POSITION: 0,
        JAIL_POSITION: 10,
        FREE_PARKING_POSITION: 20,
        GO_TO_JAIL_POSITION: 30
    },

    // Dice Configuration
    DICE: {
        MIN_VALUE: 1,
        MAX_VALUE: 6,
        DOUBLES_ROLL_AGAIN: true,
        MAX_DOUBLE_ROLLS: 3
    },

    // Jail Configuration
    JAIL: {
        BAIL_AMOUNT: 50,
        MAX_TURNS_IN_JAIL: 3,
        GET_OUT_OF_JAIL_FREE_CARDS: 2
    },

    // Property Configuration
    PROPERTY: {
        HOUSE_COST_MULTIPLIER: 1,
        HOTEL_COST_MULTIPLIER: 1,
        MORTGAGE_RATE: 0.5,
        UNMORTGAGE_RATE: 1.1
    },

    // Tax Configuration
    TAX: {
        INCOME_TAX: 200,
        LUXURY_TAX: 100,
        INCOME_TAX_PERCENT: 0.1
    },

    // Storage Configuration
    STORAGE: {
        GAME_STATE_KEY: 'monopoly_game_state',
        SETTINGS_KEY: 'monopoly_settings',
        MAX_SAVED_GAMES: 5
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        DICE_ROLL_DURATION: 1000,
        TOKEN_MOVE_DURATION: 500,
        MODAL_ANIMATION_DURATION: 300
    },

    // Event Names
    EVENTS: {
        GAME_START: 'game:start',
        GAME_END: 'game:end',
        TURN_START: 'turn:start',
        TURN_END: 'turn:end',
        DICE_ROLLED: 'dice:rolled',
        PLAYER_MOVE: 'player:move',
        PROPERTY_LANDED: 'property:landed',
        CARD_DRAWN: 'card:drawn',
        MONEY_CHANGED: 'money:changed',
        PROPERTY_PURCHASED: 'property:purchased',
        HOUSE_BUILT: 'house:built',
        HOTEL_BUILT: 'hotel:built',
        TRADE_PROPOSED: 'trade:proposed',
        TRADE_COMPLETED: 'trade:completed',
        PLAYER_BANKRUPT: 'player:bankrupt',
        JAIL_ENTERED: 'jail:entered',
        JAIL_EXITED: 'jail:exited'
    },

    // Player Tokens
    TOKENS: [
        { name: 'Hat', emoji: '🎩', color: '#e74c3c' },
        { name: 'Car', emoji: '🚗', color: '#3498db' },
        { name: 'Ship', emoji: '🚢', color: '#2ecc71' },
        { name: 'Dog', emoji: '🐕', color: '#f39c12' },
        { name: 'Cat', emoji: '🐈', color: '#9b59b6' },
        { name: 'Thimble', emoji: '🪡', color: '#1abc9c' }
    ],

    // Property Groups with complete Monopoly data
    PROPERTY_GROUPS: {
        BROWN: {
            name: 'Brown',
            color: '#8B4513',
            properties: ['Mediterranean Avenue', 'Baltic Avenue'],
            prices: [60, 60],
            rents: [[2, 10, 30, 90, 160, 250], [4, 20, 60, 180, 320, 450]],
            houseCosts: [50, 50]
        },
        LIGHT_BLUE: {
            name: 'Light Blue',
            color: '#87CEEB',
            properties: ['Oriental Avenue', 'Vermont Avenue', 'Connecticut Avenue'],
            prices: [100, 100, 120],
            rents: [[6, 30, 90, 270, 400, 550], [6, 30, 90, 270, 400, 550], [8, 40, 100, 300, 450, 600]],
            houseCosts: [50, 50, 50]
        },
        PINK: {
            name: 'Pink',
            color: '#FF69B4',
            properties: ['St. Charles Place', 'States Avenue', 'Virginia Avenue'],
            prices: [140, 140, 160],
            rents: [[10, 50, 150, 450, 625, 750], [10, 50, 150, 450, 625, 750], [12, 60, 180, 500, 700, 900]],
            houseCosts: [100, 100, 100]
        },
        ORANGE: {
            name: 'Orange',
            color: '#FFA500',
            properties: ['St. James Place', 'Tennessee Avenue', 'New York Avenue'],
            prices: [180, 180, 200],
            rents: [[14, 70, 200, 550, 750, 950], [14, 70, 200, 550, 750, 950], [16, 80, 220, 600, 800, 1000]],
            houseCosts: [100, 100, 100]
        },
        RED: {
            name: 'Red',
            color: '#FF0000',
            properties: ['Kentucky Avenue', 'Indiana Avenue', 'Illinois Avenue'],
            prices: [220, 220, 240],
            rents: [[18, 90, 250, 700, 875, 1050], [18, 90, 250, 700, 875, 1050], [20, 100, 300, 750, 925, 1100]],
            houseCosts: [150, 150, 150]
        },
        YELLOW: {
            name: 'Yellow',
            color: '#FFFF00',
            properties: ['Atlantic Avenue', 'Ventnor Avenue', 'Marvin Gardens'],
            prices: [260, 260, 280],
            rents: [[22, 110, 330, 800, 975, 1150], [22, 110, 330, 800, 975, 1150], [24, 120, 360, 850, 1025, 1200]],
            houseCosts: [150, 150, 150]
        },
        GREEN: {
            name: 'Green',
            color: '#008000',
            properties: ['Pacific Avenue', 'North Carolina Avenue', 'Pennsylvania Avenue'],
            prices: [300, 300, 320],
            rents: [[26, 130, 390, 900, 1100, 1275], [26, 130, 390, 900, 1100, 1275], [28, 150, 450, 1000, 1200, 1400]],
            houseCosts: [200, 200, 200]
        },
        DARK_BLUE: {
            name: 'Dark Blue',
            color: '#0000FF',
            properties: ['Park Place', 'Boardwalk'],
            prices: [350, 400],
            rents: [[35, 175, 500, 1100, 1300, 1500], [50, 200, 600, 1400, 1700, 2000]],
            houseCosts: [200, 200]
        }
    },

    // Railroad Configuration with names
    RAILROADS: {
        COUNT: 4,
        NAMES: ['Reading Railroad', 'Pennsylvania Railroad', 'B&O Railroad', 'Short Line Railroad'],
        PRICES: [200, 200, 200, 200],
        RENTS: [25, 50, 100, 200]
    },

    // Utility Configuration with names
    UTILITIES: {
        COUNT: 2,
        NAMES: ['Electric Company', 'Water Works'],
        PRICES: [150, 150],
        RENT_MULTIPLIERS: [4, 10]
    },

    // Complete board square data
    BOARD_SQUARES: [
        { position: 0, type: 'go', name: 'GO', salary: 200 },
        { position: 1, type: 'property', name: 'Mediterranean Avenue', price: 60, color: 'brown', rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
        { position: 2, type: 'community-chest', name: 'Community Chest' },
        { position: 3, type: 'property', name: 'Baltic Avenue', price: 60, color: 'brown', rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
        { position: 4, type: 'tax', name: 'Income Tax', amount: 200 },
        { position: 5, type: 'railroad', name: 'Reading Railroad', price: 200 },
        { position: 6, type: 'property', name: 'Oriental Avenue', price: 100, color: 'light-blue', rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
        { position: 7, type: 'chance', name: 'Chance' },
        { position: 8, type: 'property', name: 'Vermont Avenue', price: 100, color: 'light-blue', rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
        { position: 9, type: 'property', name: 'Connecticut Avenue', price: 120, color: 'light-blue', rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
        { position: 10, type: 'jail', name: 'Jail' },
        { position: 11, type: 'property', name: 'St. Charles Place', price: 140, color: 'pink', rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
        { position: 12, type: 'utility', name: 'Electric Company', price: 150 },
        { position: 13, type: 'property', name: 'States Avenue', price: 140, color: 'pink', rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
        { position: 14, type: 'property', name: 'Virginia Avenue', price: 160, color: 'pink', rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
        { position: 15, type: 'railroad', name: 'Pennsylvania Railroad', price: 200 },
        { position: 16, type: 'property', name: 'St. James Place', price: 180, color: 'orange', rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
        { position: 17, type: 'community-chest', name: 'Community Chest' },
        { position: 18, type: 'property', name: 'Tennessee Avenue', price: 180, color: 'orange', rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
        { position: 19, type: 'property', name: 'New York Avenue', price: 200, color: 'orange', rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },
        { position: 20, type: 'free-parking', name: 'Free Parking' },
        { position: 21, type: 'property', name: 'Kentucky Avenue', price: 220, color: 'red', rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
        { position: 22, type: 'chance', name: 'Chance' },
        { position: 23, type: 'property', name: 'Indiana Avenue', price: 220, color: 'red', rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
        { position: 24, type: 'property', name: 'Illinois Avenue', price: 240, color: 'red', rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
        { position: 25, type: 'railroad', name: 'B&O Railroad', price: 200 },
        { position: 26, type: 'property', name: 'Atlantic Avenue', price: 260, color: 'yellow', rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
        { position: 27, type: 'property', name: 'Ventnor Avenue', price: 260, color: 'yellow', rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
        { position: 28, type: 'utility', name: 'Water Works', price: 150 },
        { position: 29, type: 'property', name: 'Marvin Gardens', price: 280, color: 'yellow', rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 },
        { position: 30, type: 'go-to-jail', name: 'Go to Jail' },
        { position: 31, type: 'property', name: 'Pacific Avenue', price: 300, color: 'green', rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
        { position: 32, type: 'property', name: 'North Carolina Avenue', price: 300, color: 'green', rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
        { position: 33, type: 'community-chest', name: 'Community Chest' },
        { position: 34, type: 'property', name: 'Pennsylvania Avenue', price: 320, color: 'green', rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
        { position: 35, type: 'railroad', name: 'Short Line Railroad', price: 200 },
        { position: 36, type: 'chance', name: 'Chance' },
        { position: 37, type: 'property', name: 'Park Place', price: 350, color: 'dark-blue', rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
        { position: 38, type: 'tax', name: 'Luxury Tax', amount: 100 },
        { position: 39, type: 'property', name: 'Boardwalk', price: 400, color: 'dark-blue', rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 }
    ],

    // Chance and Community Chest Cards
    CARDS: {
        CHANCE_COUNT: 16,
        COMMUNITY_CHEST_COUNT: 16
    },

    // Validation Rules
    VALIDATION: {
        MIN_PLAYER_NAME_LENGTH: 1,
        MAX_PLAYER_NAME_LENGTH: 20,
        MIN_BID_AMOUNT: 1,
        MAX_BID_AMOUNT: 10000
    },

    // Debug Configuration
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        SHOW_COORDINATES: false,
        FAST_MODE: false
    }
};

/**
 * Utility function to get a constant value
 * @param {string} path - Dot notation path to the constant
 * @returns {*} The constant value
 */
export function getConstant(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], constants);
}

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export function isDebugMode() {
    return constants.DEBUG.ENABLED || window.location.search.includes('debug=true');
}

/**
 * Log debug message
 * @param {string} level - Log level
 * @param {...any} args - Arguments to log
 */
export function debugLog(level, ...args) {
    if (isDebugMode()) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevel = levels.indexOf(constants.DEBUG.LOG_LEVEL);
        const messageLevel = levels.indexOf(level);
        
        if (messageLevel >= currentLevel) {
            console[level](`[Monopoly:${level.toUpperCase()}]`, ...args);
        }
    }
}