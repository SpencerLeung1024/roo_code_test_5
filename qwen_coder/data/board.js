// Board layout data for Monopoly Game

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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { boardData, propertyColors };
}