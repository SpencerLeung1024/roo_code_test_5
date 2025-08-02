// Board configuration
const BOARD_SPACES = [
    { id: 0, name: "Ire", type: "special" }, // Latin for "Go"
    { id: 1, name: "Via Mediterranea", type: "property", colorGroup: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250] },
    { id: 2, name: "Communis Thesaurus", type: "chest" }, // Latin for "Community Chest"
    { id: 3, name: "Via Baltica", type: "property", colorGroup: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450] },
    { id: 4, name: "Tributum", type: "tax", amount: 200 }, // Latin for "Tax"
    { id: 5, name: "Ferrovia Legentium", type: "railroad", price: 200 }, // Latin for "Reading Railroad"
    { id: 6, name: "Via Orientalis", type: "property", colorGroup: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550] },
    { id: 7, name: "Fortuna", type: "chance" }, // Latin for "Chance"
    { id: 8, name: "Via Viridis Montis", type: "property", colorGroup: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550] },
    { id: 9, name: "Via Connecticuta", type: "property", colorGroup: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600] },
    { id: 10, name: "Carcer", type: "jail" }, // Latin for "Jail"
    { id: 11, name: "Forum Aureum", type: "property", colorGroup: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750] },
    { id: 12, name: "Aqua Electrica", type: "utility", price: 150 },
    { id: 13, name: "Via Stellarum", type: "property", colorGroup: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750] },
    { id: 14, name: "Domus Viridis", type: "property", colorGroup: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900] },
    { id: 15, name: "Ferrovia Septentrionis", type: "railroad", price: 200 },
    { id: 16, name: "Portus Rubicundus", type: "property", colorGroup: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950] },
    { id: 17, name: "Communis Thesaurus", type: "chest" },
    { id: 18, name: "Via Rubra", type: "property", colorGroup: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950] },
    { id: 19, name: "Forum Magnum", type: "property", colorGroup: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000] },
    { id: 20, name: "Parking Liberum", type: "special" },
    { id: 21, name: "Ager Indicus", type: "property", colorGroup: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 22, name: "Fortuna", type: "chance" },
    { id: 23, name: "Via Lazuli", type: "property", colorGroup: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 24, name: "Platea Alba", type: "property", colorGroup: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100] },
    { id: 25, name: "Ferrovia Orientalis", type: "railroad", price: 200 },
    { id: 26, name: "Portus Caeruleus", type: "property", colorGroup: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 27, name: "Domus Purpurea", type: "property", colorGroup: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 28, name: "Aqua Publica", type: "utility", price: 150 },
    { id: 29, name: "Portus Violaceus", type: "property", colorGroup: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200] },
    { id: 30, name: "Ite ad Carcerem", type: "special" },
    { id: 31, name: "Domus Viridis", type: "property", colorGroup: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
    { id: 32, name: "Domus Caerulea", type: "property", colorGroup: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
    { id: 33, name: "Communis Thesaurus", type: "chest" },
    { id: 34, name: "Domus Prasina", type: "property", colorGroup: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400] },
    { id: 35, name: "Ferrovia Occidentalis", type: "railroad", price: 200 },
    { id: 36, name: "Fortuna", type: "chance" },
    { id: 37, name: "Via Amethysti", type: "property", colorGroup: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500] },
    { id: 38, name: "Taxus Altus", type: "tax", amount: 100 },
    { id: 39, name: "Portus Argenteus", type: "property", colorGroup: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000] }
];

// Render the game board with player tokens
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    BOARD_SPACES.forEach(space => {
        const spaceElement = document.createElement('div');
        spaceElement.className = `board-space space-${space.type}`;
        spaceElement.dataset.id = space.id;
        
        // Add color coding for properties
        if (space.colorGroup) {
            spaceElement.style.backgroundColor = getColorForGroup(space.colorGroup);
        }
        
        // Space name
        const nameElement = document.createElement('div');
        nameElement.className = 'space-name';
        nameElement.textContent = space.name;
        spaceElement.appendChild(nameElement);
        
        // Player tokens container
        const tokensContainer = document.createElement('div');
        tokensContainer.className = 'tokens-container';
        spaceElement.appendChild(tokensContainer);
        
        boardElement.appendChild(spaceElement);
    });
}

// Update player tokens on board
function updatePlayerTokens() {
    // Clear all tokens first
    document.querySelectorAll('.token').forEach(token => token.remove());
    
    // Add tokens for each player
    players.forEach(player => {
        const spaceElement = document.querySelector(`.board-space[data-id="${player.position}"]`);
        if (spaceElement) {
            const tokensContainer = spaceElement.querySelector('.tokens-container');
            if (tokensContainer) {
                const token = document.createElement('div');
                token.className = 'token';
                token.style.backgroundColor = PLAYER_COLORS[player.id];
                tokensContainer.appendChild(token);
            }
        }
    });
}

// Helper function for property colors
function getColorForGroup(group) {
    const colors = {
        'brown': '#8B4513',
        'lightblue': '#87CEEB',
        'pink': '#FFC0CB',
        'orange': '#FFA500',
        'red': '#FF0000',
        'yellow': '#FFFF00',
        'green': '#008000',
        'blue': '#0000FF'
    };
    return colors[group] || '#FFFFFF';
}

// Initialize board and update tokens
document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
    updatePlayerTokens();
});