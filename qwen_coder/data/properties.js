// Property data for Monopoly Game

// Define property groups for monopoly detection
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

// Define railroad positions
const railroadPositions = [5, 15, 25, 35];

// Define utility positions
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { propertyData, propertyGroups, railroadPositions, utilityPositions };
}