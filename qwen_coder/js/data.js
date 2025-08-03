// Data script for Monopoly Game
// This file contains all the game data as global variables

// Board layout data
const boardData = {
    spaces: [
        // Bottom row (GO to JAIL) - positions 0-10
        { id: 0, name: "GO", type: "corner", position: 0 },
        { id: 1, name: "Mediterranean Avenue", type: "property", position: 1, colorGroup: "brown", price: 60 },
        { id: 2, name: "Community Chest", type: "card", position: 2 },
        { id: 3, name: "Baltic Avenue", type: "property", position: 3, colorGroup: "brown", price: 60 },
        { id: 4, name: "Income Tax", type: "tax", position: 4, taxAmount: 200 },
        { id: 5, name: "Reading Railroad", type: "railroad", position: 5, price: 200 },
        { id: 6, name: "Oriental Avenue", type: "property", position: 6, colorGroup: "lightblue", price: 100 },
        { id: 7, name: "Chance", type: "card", position: 7 },
        { id: 8, name: "Vermont Avenue", type: "property", position: 8, colorGroup: "lightblue", price: 100 },
        { id: 9, name: "Connecticut Avenue", type: "property", position: 9, colorGroup: "lightblue", price: 120 },
        { id: 10, name: "JAIL", type: "corner", position: 10 },
        
        // Left column (JAIL to FREE PARKING) - positions 11-20
        { id: 11, name: "St. Charles Place", type: "property", position: 11, colorGroup: "pink", price: 140 },
        { id: 12, name: "Electric Company", type: "utility", position: 12, price: 150 },
        { id: 13, name: "States Avenue", type: "property", position: 13, colorGroup: "pink", price: 140 },
        { id: 14, name: "Virginia Avenue", type: "property", position: 14, colorGroup: "pink", price: 160 },
        { id: 15, name: "Pennsylvania Railroad", type: "railroad", position: 15, price: 200 },
        { id: 16, name: "St. James Place", type: "property", position: 16, colorGroup: "orange", price: 180 },
        { id: 17, name: "Community Chest", type: "card", position: 17 },
        { id: 18, name: "Tennessee Avenue", type: "property", position: 18, colorGroup: "orange", price: 180 },
        { id: 19, name: "New York Avenue", type: "property", position: 19, colorGroup: "orange", price: 200 },
        { id: 20, name: "FREE PARKING", type: "corner", position: 20 },
        
        // Top row (FREE PARKING to GO TO JAIL) - positions 21-30
        { id: 21, name: "Kentucky Avenue", type: "property", position: 21, colorGroup: "red", price: 220 },
        { id: 22, name: "Chance", type: "card", position: 22 },
        { id: 23, name: "Indiana Avenue", type: "property", position: 23, colorGroup: "red", price: 220 },
        { id: 24, name: "Illinois Avenue", type: "property", position: 24, colorGroup: "red", price: 240 },
        { id: 25, name: "B. & O. Railroad", type: "railroad", position: 25, price: 200 },
        { id: 26, name: "Atlantic Avenue", type: "property", position: 26, colorGroup: "yellow", price: 260 },
        { id: 27, name: "Ventnor Avenue", type: "property", position: 27, colorGroup: "yellow", price: 260 },
        { id: 28, name: "Water Works", type: "utility", position: 28, price: 150 },
        { id: 29, name: "Marvin Gardens", type: "property", position: 29, colorGroup: "yellow", price: 280 },
        { id: 30, name: "GO TO JAIL", type: "corner", position: 30 },
        
        // Right column (GO TO JAIL to GO) - positions 31-39
        { id: 31, name: "Pacific Avenue", type: "property", position: 31, colorGroup: "green", price: 300 },
        { id: 32, name: "North Carolina Avenue", type: "property", position: 32, colorGroup: "green", price: 300 },
        { id: 33, name: "Community Chest", type: "card", position: 33 },
        { id: 34, name: "Pennsylvania Avenue", type: "property", position: 34, colorGroup: "green", price: 320 },
        { id: 35, name: "Short Line", type: "railroad", position: 35, price: 200 },
        { id: 36, name: "Chance", type: "card", position: 36 },
        { id: 37, name: "Park Place", type: "property", position: 37, colorGroup: "darkblue", price: 350 },
        { id: 38, name: "Luxury Tax", type: "tax", position: 38, taxAmount: 100 },
        { id: 39, name: "Boardwalk", type: "property", position: 39, colorGroup: "darkblue", price: 400 }
    ],
    size: 40
};

// Color mapping for property groups
const propertyColors = {
    "brown": "#8B4513",
    "lightblue": "#87CEEB",
    "pink": "#FF69B4",
    "orange": "#FFA500",
    "red": "#FF0000",
    "yellow": "#FFFF00",
    "green": "#008000",
    "darkblue": "#00008B"
};

// Property groups for monopoly detection
const propertyGroups = {
    "brown": [1, 3],
    "lightblue": [6, 8, 9],
    "pink": [11, 13, 14],
    "orange": [16, 18, 19],
    "red": [21, 23, 24],
    "yellow": [26, 27, 29],
    "green": [31, 32, 34],
    "darkblue": [37, 39]
};

// Railroad positions
const railroadPositions = [5, 15, 25, 35];

// Utility positions
const utilityPositions = [12, 28];

// Detailed property information
const propertyData = {
    // Brown properties
    1: {
        id: 1,
        name: "Mediterranean Avenue",
        position: 1,
        price: 60,
        rent: 2,
        colorGroup: "brown",
        houseCost: 50,
        hotelCost: 50,
        rentWithHouse: [10, 30, 90, 160],
        rentWithHotel: 250,
        mortgageValue: 30
    },
    3: {
        id: 3,
        name: "Baltic Avenue",
        position: 3,
        price: 60,
        rent: 4,
        colorGroup: "brown",
        houseCost: 50,
        hotelCost: 50,
        rentWithHouse: [20, 60, 180, 320],
        rentWithHotel: 450,
        mortgageValue: 30
    },
    
    // Light Blue properties
    6: {
        id: 6,
        name: "Oriental Avenue",
        position: 6,
        price: 100,
        rent: 6,
        colorGroup: "lightblue",
        houseCost: 50,
        hotelCost: 50,
        rentWithHouse: [30, 90, 270, 400],
        rentWithHotel: 550,
        mortgageValue: 50
    },
    8: {
        id: 8,
        name: "Vermont Avenue",
        position: 8,
        price: 100,
        rent: 6,
        colorGroup: "lightblue",
        houseCost: 50,
        hotelCost: 50,
        rentWithHouse: [30, 90, 270, 400],
        rentWithHotel: 550,
        mortgageValue: 50
    },
    9: {
        id: 9,
        name: "Connecticut Avenue",
        position: 9,
        price: 120,
        rent: 8,
        colorGroup: "lightblue",
        houseCost: 50,
        hotelCost: 50,
        rentWithHouse: [40, 100, 300, 450],
        rentWithHotel: 600,
        mortgageValue: 60
    },
    
    // Pink properties
    11: {
        id: 11,
        name: "St. Charles Place",
        position: 11,
        price: 140,
        rent: 10,
        colorGroup: "pink",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [50, 150, 450, 625],
        rentWithHotel: 750,
        mortgageValue: 70
    },
    13: {
        id: 13,
        name: "States Avenue",
        position: 13,
        price: 140,
        rent: 10,
        colorGroup: "pink",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [50, 150, 450, 625],
        rentWithHotel: 750,
        mortgageValue: 70
    },
    14: {
        id: 14,
        name: "Virginia Avenue",
        position: 14,
        price: 160,
        rent: 12,
        colorGroup: "pink",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [60, 180, 500, 700],
        rentWithHotel: 900,
        mortgageValue: 80
    },
    
    // Orange properties
    16: {
        id: 16,
        name: "St. James Place",
        position: 16,
        price: 180,
        rent: 14,
        colorGroup: "orange",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [70, 200, 550, 750],
        rentWithHotel: 950,
        mortgageValue: 90
    },
    18: {
        id: 18,
        name: "Tennessee Avenue",
        position: 18,
        price: 180,
        rent: 14,
        colorGroup: "orange",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [70, 200, 550, 750],
        rentWithHotel: 950,
        mortgageValue: 90
    },
    19: {
        id: 19,
        name: "New York Avenue",
        position: 19,
        price: 200,
        rent: 16,
        colorGroup: "orange",
        houseCost: 100,
        hotelCost: 100,
        rentWithHouse: [80, 220, 600, 800],
        rentWithHotel: 1000,
        mortgageValue: 100
    },
    
    // Red properties
    21: {
        id: 21,
        name: "Kentucky Avenue",
        position: 21,
        price: 220,
        rent: 18,
        colorGroup: "red",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [90, 250, 700, 875],
        rentWithHotel: 1050,
        mortgageValue: 110
    },
    23: {
        id: 23,
        name: "Indiana Avenue",
        position: 23,
        price: 220,
        rent: 18,
        colorGroup: "red",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [90, 250, 700, 875],
        rentWithHotel: 1050,
        mortgageValue: 110
    },
    24: {
        id: 24,
        name: "Illinois Avenue",
        position: 24,
        price: 240,
        rent: 20,
        colorGroup: "red",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [100, 300, 750, 925],
        rentWithHotel: 1100,
        mortgageValue: 120
    },
    
    // Yellow properties
    26: {
        id: 26,
        name: "Atlantic Avenue",
        position: 26,
        price: 260,
        rent: 22,
        colorGroup: "yellow",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [110, 330, 800, 975],
        rentWithHotel: 1150,
        mortgageValue: 130
    },
    27: {
        id: 27,
        name: "Ventnor Avenue",
        position: 27,
        price: 260,
        rent: 22,
        colorGroup: "yellow",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [110, 330, 800, 975],
        rentWithHotel: 1150,
        mortgageValue: 130
    },
    29: {
        id: 29,
        name: "Marvin Gardens",
        position: 29,
        price: 280,
        rent: 24,
        colorGroup: "yellow",
        houseCost: 150,
        hotelCost: 150,
        rentWithHouse: [120, 360, 850, 1025],
        rentWithHotel: 1200,
        mortgageValue: 140
    },
    
    // Green properties
    31: {
        id: 31,
        name: "Pacific Avenue",
        position: 31,
        price: 300,
        rent: 26,
        colorGroup: "green",
        houseCost: 200,
        hotelCost: 200,
        rentWithHouse: [130, 390, 900, 1100],
        rentWithHotel: 1275,
        mortgageValue: 150
    },
    32: {
        id: 32,
        name: "North Carolina Avenue",
        position: 32,
        price: 300,
        rent: 26,
        colorGroup: "green",
        houseCost: 200,
        hotelCost: 200,
        rentWithHouse: [130, 390, 900, 1100],
        rentWithHotel: 1275,
        mortgageValue: 150
    },
    34: {
        id: 34,
        name: "Pennsylvania Avenue",
        position: 34,
        price: 320,
        rent: 28,
        colorGroup: "green",
        houseCost: 200,
        hotelCost: 200,
        rentWithHouse: [150, 450, 1000, 1200],
        rentWithHotel: 1400,
        mortgageValue: 160
    },
    
    // Dark Blue properties
    37: {
        id: 37,
        name: "Park Place",
        position: 37,
        price: 350,
        rent: 35,
        colorGroup: "darkblue",
        houseCost: 200,
        hotelCost: 200,
        rentWithHouse: [175, 500, 1100, 1300],
        rentWithHotel: 1500,
        mortgageValue: 175
    },
    39: {
        id: 39,
        name: "Boardwalk",
        position: 39,
        price: 400,
        rent: 50,
        colorGroup: "darkblue",
        houseCost: 200,
        hotelCost: 200,
        rentWithHouse: [200, 600, 1400, 1700],
        rentWithHotel: 2000,
        mortgageValue: 200
    },
    
    // Railroads
    5: {
        id: 5,
        name: "Reading Railroad",
        position: 5,
        price: 200,
        rent: 25,
        type: "railroad",
        mortgageValue: 100
    },
    15: {
        id: 15,
        name: "Pennsylvania Railroad",
        position: 15,
        price: 200,
        rent: 25,
        type: "railroad",
        mortgageValue: 100
    },
    25: {
        id: 25,
        name: "B. & O. Railroad",
        position: 25,
        price: 200,
        rent: 25,
        type: "railroad",
        mortgageValue: 100
    },
    35: {
        id: 35,
        name: "Short Line",
        position: 35,
        price: 200,
        rent: 25,
        type: "railroad",
        mortgageValue: 100
    },
    
    // Utilities
    12: {
        id: 12,
        name: "Electric Company",
        position: 12,
        price: 150,
        rent: 4, // Multiplied by dice roll when one utility is owned
        type: "utility",
        rentTwo: 10, // Multiplied by dice roll when two utilities are owned
        mortgageValue: 75
    },
    28: {
        id: 28,
        name: "Water Works",
        position: 28,
        price: 150,
        rent: 4, // Multiplied by dice roll when one utility is owned
        type: "utility",
        rentTwo: 10, // Multiplied by dice roll when two utilities are owned
        mortgageValue: 75
    }
};

// Chance cards
const chanceCards = [
    {
        id: 1,
        type: "chance",
        text: "Advance to GO (Collect $200)",
        action: (player, playerManager, boardManager) => {
            player.moveTo(0);
            player.addMoney(200);
            return "Advanced to GO and collected $200!";
        }
    },
    {
        id: 2,
        type: "chance",
        text: "Advance to Illinois Ave. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(24);
            if (oldPosition > 24) {
                player.addMoney(200);
                return "Advanced to Illinois Ave and collected $200 for passing GO!";
            }
            return "Advanced to Illinois Ave!";
        }
    },
    {
        id: 3,
        type: "chance",
        text: "Advance to St. Charles Place. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(11);
            if (oldPosition > 11 && oldPosition <= 30) {
                player.addMoney(200);
                return "Advanced to St. Charles Place and collected $200 for passing GO!";
            }
            return "Advanced to St. Charles Place!";
        }
    },
    {
        id: 4,
        type: "chance",
        text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.",
        action: (player, playerManager, boardManager, diceRoll) => {
            if (player.position < 12 || player.position > 28) {
                player.moveTo(12);
            } else {
                player.moveTo(28);
            }
            return "Advanced to nearest Utility!";
        }
    },
    {
        id: 5,
        type: "chance",
        text: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.",
        action: (player, playerManager, boardManager) => {
            if (player.position < 5) {
                player.moveTo(5);
            } else if (player.position < 15) {
                player.moveTo(15);
            } else if (player.position < 25) {
                player.moveTo(25);
            } else if (player.position < 35) {
                player.moveTo(35);
            } else {
                player.moveTo(5);
            }
            return "Advanced to nearest Railroad!";
        }
    },
    {
        id: 6,
        type: "chance",
        text: "Bank pays you dividend of $50",
        action: (player, playerManager, boardManager) => {
            player.addMoney(50);
            return "Received $50 dividend from the Bank!";
        }
    },
    {
        id: 7,
        type: "chance",
        text: "Get out of Jail Free. This card may be kept until needed, or traded/sold",
        action: (player, playerManager, boardManager) => {
            player.getOutOfJailFreeCards++;
            return "Received a Get Out of Jail Free card!";
        }
    },
    {
        id: 8,
        type: "chance",
        text: "Go Back 3 Spaces",
        action: (player, playerManager, boardManager) => {
            player.moveTo((player.position - 3 + 40) % 40);
            return "Went back 3 spaces!";
        }
    },
    {
        id: 9,
        type: "chance",
        text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200",
        action: (player, playerManager, boardManager) => {
            player.goToJail();
            return "Went to Jail!";
        }
    },
    {
        id: 10,
        type: "chance",
        text: "Make general repairs on all your property. For each house pay $25. For each hotel pay $100",
        action: (player, playerManager, boardManager) => {
            // Simplified implementation - just deduct a fixed amount
            player.deductMoney(50);
            return "Made general repairs and paid $50!";
        }
    },
    {
        id: 11,
        type: "chance",
        text: "Pay poor tax of $15",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(15);
            return "Paid poor tax of $15!";
        }
    },
    {
        id: 12,
        type: "chance",
        text: "Take a trip to Reading Railroad. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(5);
            if (oldPosition > 5 && oldPosition <= 30) {
                player.addMoney(200);
                return "Took a trip to Reading Railroad and collected $200 for passing GO!";
            }
            return "Took a trip to Reading Railroad!";
        }
    },
    {
        id: 13,
        type: "chance",
        text: "Take a walk on the Boardwalk. Advance token to Boardwalk",
        action: (player, playerManager, boardManager) => {
            player.moveTo(39);
            return "Took a walk on the Boardwalk!";
        }
    },
    {
        id: 14,
        type: "chance",
        text: "You have been elected Chairman of the Board. Pay each player $50",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalPaid = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (player.deductMoney(50)) {
                        otherPlayer.addMoney(50);
                        totalPaid += 50;
                    }
                }
            }
            return `Elected Chairman of the Board and paid $${totalPaid} to other players!`;
        }
    },
    {
        id: 15,
        type: "chance",
        text: "Your building loan matures. Collect $150",
        action: (player, playerManager, boardManager) => {
            player.addMoney(150);
            return "Building loan matured and collected $150!";
        }
    },
    {
        id: 16,
        type: "chance",
        text: "You have won a crossword competition. Collect $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Won a crossword competition and collected $100!";
        }
    }
];

// Community Chest cards
const communityChestCards = [
    {
        id: 1,
        type: "community",
        text: "Advance to GO (Collect $200)",
        action: (player, playerManager, boardManager) => {
            player.moveTo(0);
            player.addMoney(200);
            return "Advanced to GO and collected $200!";
        }
    },
    {
        id: 2,
        type: "community",
        text: "Bank error in your favor. Collect $200",
        action: (player, playerManager, boardManager) => {
            player.addMoney(200);
            return "Bank error in your favor. Collected $200!";
        }
    },
    {
        id: 3,
        type: "community",
        text: "Doctor's fees. Pay $50",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(50);
            return "Paid Doctor's fees of $50!";
        }
    },
    {
        id: 4,
        type: "community",
        text: "Get out of Jail Free. This card may be kept until needed, or traded/sold",
        action: (player, playerManager, boardManager) => {
            player.getOutOfJailFreeCards++;
            return "Received a Get Out of Jail Free card!";
        }
    },
    {
        id: 5,
        type: "community",
        text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200",
        action: (player, playerManager, boardManager) => {
            player.goToJail();
            return "Went to Jail!";
        }
    },
    {
        id: 6,
        type: "community",
        text: "Grand Opera Night. Collect $50 from every player for opening night seats",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalCollected = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (otherPlayer.deductMoney(50)) {
                        player.addMoney(50);
                        totalCollected += 50;
                    }
                }
            }
            return `Grand Opera Night! Collected $${totalCollected} from other players!`;
        }
    },
    {
        id: 7,
        type: "community",
        text: "Holiday Fund matures. Receive $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Holiday Fund matured. Received $100!";
        }
    },
    {
        id: 8,
        type: "community",
        text: "Income tax refund. Collect $20",
        action: (player, playerManager, boardManager) => {
            player.addMoney(20);
            return "Income tax refund. Collected $20!";
        }
    },
    {
        id: 9,
        type: "community",
        text: "It is your birthday. Collect $10 from every player",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalCollected = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (otherPlayer.deductMoney(10)) {
                        player.addMoney(10);
                        totalCollected += 10;
                    }
                }
            }
            return `It is your birthday! Collected $${totalCollected} from other players!`;
        }
    },
    {
        id: 10,
        type: "community",
        text: "Life insurance matures. Collect $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Life insurance matured. Collected $100!";
        }
    },
    {
        id: 11,
        type: "community",
        text: "Pay hospital fees of $100",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(100);
            return "Paid hospital fees of $100!";
        }
    },
    {
        id: 12,
        type: "community",
        text: "Pay school fees of $150",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(150);
            return "Paid school fees of $150!";
        }
    },
    {
        id: 13,
        type: "community",
        text: "Receive $25 consultancy fee",
        action: (player, playerManager, boardManager) => {
            player.addMoney(25);
            return "Received $25 consultancy fee!";
        }
    },
    {
        id: 14,
        type: "community",
        text: "You are assessed for street repairs. $40 per house. $115 per hotel",
        action: (player, playerManager, boardManager) => {
            // Simplified implementation - just deduct a fixed amount
            player.deductMoney(50);
            return "Assessed for street repairs and paid $50!";
        }
    },
    {
        id: 15,
        type: "community",
        text: "You have won second prize in a beauty contest. Collect $10",
        action: (player, playerManager, boardManager) => {
            player.addMoney(10);
            return "Won second prize in a beauty contest. Collected $10!";
        }
    },
    {
        id: 16,
        type: "community",
        text: "You inherit $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Inherited $100!";
        }
    }
];