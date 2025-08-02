// Property definitions - all 40 board spaces
const PROPERTIES = {
    // Special spaces
    0: { id: 0, name: "Ire", type: "special" },
    2: { id: 2, name: "Communis Thesaurus", type: "chest" },
    4: { id: 4, name: "Tributum", type: "tax", amount: 200 },
    7: { id: 7, name: "Fortuna", type: "chance" },
    10: { id: 10, name: "Carcer", type: "jail" },
    17: { id: 17, name: "Communis Thesaurus", type: "chest" },
    20: { id: 20, name: "Parking Liberum", type: "special" },
    22: { id: 22, name: "Fortuna", type: "chance" },
    30: { id: 30, name: "Ite ad Carcerem", type: "special" },
    33: { id: 33, name: "Communis Thesaurus", type: "chest" },
    36: { id: 36, name: "Fortuna", type: "chance" },
    38: { id: 38, name: "Taxus Altus", type: "tax", amount: 100 },
    
    // Properties
    1: { id: 1, name: "Via Mediterranea", type: "property", colorGroup: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
    3: { id: 3, name: "Via Baltica", type: "property", colorGroup: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
    6: { id: 6, name: "Via Orientalis", type: "property", colorGroup: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
    8: { id: 8, name: "Via Viridis Montis", type: "property", colorGroup: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
    9: { id: 9, name: "Via Connecticuta", type: "property", colorGroup: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
    11: { id: 11, name: "Forum Aureum", type: "property", colorGroup: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
    13: { id: 13, name: "Via Stellarum", type: "property", colorGroup: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
    14: { id: 14, name: "Domus Viridis", type: "property", colorGroup: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
    16: { id: 16, name: "Portus Rubicundus", type: "property", colorGroup: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
    18: { id: 18, name: "Via Rubra", type: "property", colorGroup: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
    19: { id: 19, name: "Forum Magnum", type: "property", colorGroup: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },
    21: { id: 21, name: "Ager Indicus", type: "property", colorGroup: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
    23: { id: 23, name: "Via Lazuli", type: "property", colorGroup: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
    24: { id: 24, name: "Platea Alba", type: "property", colorGroup: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
    26: { id: 26, name: "Portus Caeruleus", type: "property", colorGroup: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
    27: { id: 27, name: "Domus Purpurea", type: "property", colorGroup: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
    29: { id: 29, name: "Portus Violaceus", type: "property", colorGroup: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 },
    31: { id: 31, name: "Domus Viridis", type: "property", colorGroup: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
    32: { id: 32, name: "Domus Caerulea", type: "property", colorGroup: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
    34: { id: 34, name: "Domus Prasina", type: "property", colorGroup: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
    37: { id: 37, name: "Via Amethysti", type: "property", colorGroup: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
    39: { id: 39, name: "Portus Argenteus", type: "property", colorGroup: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 },
    
    // Railroads
    5: { id: 5, name: "Ferrovia Legentium", type: "railroad", price: 200 },
    15: { id: 15, name: "Ferrovia Septentrionis", type: "railroad", price: 200 },
    25: { id: 25, name: "Ferrovia Orientalis", type: "railroad", price: 200 },
    35: { id: 35, name: "Ferrovia Occidentalis", type: "railroad", price: 200 },
    
    // Utilities
    12: { id: 12, name: "Aqua Electrica", type: "utility", price: 150 },
    28: { id: 28, name: "Aqua Publica", type: "utility", price: 150 },
};

// Property ownership tracking
const propertyOwnership = {};

// Initialize property ownership
function initPropertyOwnership() {
    Object.keys(PROPERTIES).forEach(id => {
        propertyOwnership[id] = {
            owner: null,
            houses: 0,
            mortgaged: false
        };
    });
}

// Get rent amount for a property
function getRent(propertyId, diceRoll = 0) {
    const property = PROPERTIES[propertyId];
    const ownership = propertyOwnership[propertyId];
    
    // Return 0 if property not found or no ownership data
    if (!property || !ownership) return 0;
    
    // Return 0 if property not owned
    if (ownership.owner === null) return 0;
    
    switch (property.type) {
        case 'property':
            return property.rent[ownership.houses];
        case 'railroad':
            // Rent based on number of railroads owned
            const owner = ownership.owner;
            const railroadsOwned = Object.values(propertyOwnership).filter(
                p => p.owner === owner && PROPERTIES[p.id]?.type === 'railroad'
            ).length;
            return 25 * railroadsOwned;
        case 'utility':
            // Rent based on dice roll
            const utilitiesOwned = Object.values(propertyOwnership).filter(
                p => p.owner === owner && PROPERTIES[p.id]?.type === 'utility'
            ).length;
            return diceRoll * (utilitiesOwned === 1 ? 4 : 10);
        default:
            return 0;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initPropertyOwnership);