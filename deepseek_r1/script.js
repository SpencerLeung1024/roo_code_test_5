// Game state
const gameState = {
    players: [],
    currentPlayerIndex: 0,
    properties: {}, // Will be initialized from properties module
    chanceDeck: [],
    communityChestDeck: [],
    gamePhase: 'rolling', // rolling, moving, resolving, trading, ended
    diceRoll: 0
};

// Save game state to localStorage
function saveGameState() {
    const stateToSave = {
        players: gameState.players,
        currentPlayerIndex: gameState.currentPlayerIndex,
        properties: gameState.properties,
        chanceDeck: gameState.chanceDeck,
        communityChestDeck: gameState.communityChestDeck,
        gamePhase: gameState.gamePhase,
        diceRoll: gameState.diceRoll
    };
    localStorage.setItem('unusVenditorState', JSON.stringify(stateToSave));
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('unusVenditorState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Restore players
        gameState.players = parsed.players;
        
        // Restore other state properties
        gameState.currentPlayerIndex = parsed.currentPlayerIndex;
        gameState.properties = parsed.properties;
        gameState.chanceDeck = parsed.chanceDeck;
        gameState.communityChestDeck = parsed.communityChestDeck;
        gameState.gamePhase = parsed.gamePhase;
        gameState.diceRoll = parsed.diceRoll;
        
        return true;
    }
    return false;
}

// Initialize game state
function initGame() {
    // Try to load saved game state
    const loaded = loadGameState();
    
    if (!loaded) {
        // Initialize fresh game
        gameState.players = players;
        gameState.properties = propertyOwnership;
        gameState.chanceDeck = chanceDeck;
        gameState.communityChestDeck = communityChestDeck;
        gameState.gamePhase = 'rolling';
    }
    
    // Update UI
    updateStatus();
    renderPlayers();
    renderBoard();
    
    // Save initial state
    saveGameState();
}

// Roll dice function
function rollDice() {
    if (gameState.gamePhase !== 'rolling') return;
    
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    gameState.diceRoll = dice1 + dice2;
    
    // Update UI with dice roll
    document.getElementById('status').textContent =
        `${gameState.players[gameState.currentPlayerIndex].name} rolled ${dice1} and ${dice2}`;
    
    // Disable roll button
    document.getElementById('roll-dice').disabled = true;
    
    // Move to next phase
    gameState.gamePhase = 'moving';
    movePlayer();
}

// Move player function
function movePlayer() {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.move(gameState.diceRoll);
    
    // Update UI to show new position
    document.getElementById('status').textContent += `, moved to space ${player.position}`;
    
    // Move to resolving phase
    gameState.gamePhase = 'resolving';
    resolveSpace();
}

// Resolve space effects

function resolveSpace() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const spaceId = player.position;
    const space = BOARD_SPACES.find(s => s.id === spaceId);
    
    if (!space) return;
    
    let message = `Landed on ${space.name}. `;
    
    switch (space.type) {
        case 'property':
        case 'railroad':
        case 'utility':
            const property = PROPERTIES[spaceId];
            const ownership = gameState.properties[spaceId];
            
            if (ownership.owner === null) {
                // Show purchase dialog
                showPurchaseDialog(property, player);
                return; // Exit resolveSpace early - dialog will continue flow
            } else if (ownership.owner !== player.id) {
                // Pay rent to owner
                const rent = getRent(spaceId, gameState.diceRoll);
                if (player.money >= rent) {
                    player.pay(rent);
                    const owner = gameState.players.find(p => p.id === ownership.owner);
                    owner.receive(rent);
                    message = `Paid $${rent} rent to ${owner.name}`;
                    saveGameState();
                } else {
                    // Player goes bankrupt
                    const owner = gameState.players.find(p => p.id === ownership.owner);
                    player.pay(player.money); // Transfer remaining money
                    owner.receive(player.money);
                    
                    // Transfer all properties to owner
                    player.properties.forEach(propId => {
                        gameState.properties[propId].owner = owner.id;
                        owner.properties.push(propId);
                    });
                    
                    // Remove player from game
                    gameState.players = gameState.players.filter(p => p.id !== player.id);
                    message = `${player.name} went bankrupt! ${owner.name} takes all properties.`;
                    
                    // Check win condition
                    if (gameState.players.length === 1) {
                        message += ` ${owner.name} wins the game!`;
                        gameState.gamePhase = 'ended';
                    }
                    
                    saveGameState();
                }
            } else {
                message = "You own this property.";
            }
            break;
            
        case 'tax':
            player.pay(space.amount);
            message += `Paid $${space.amount} in taxes.`;
            break;
            
        case 'chance':
            const chanceCard = drawCard(chanceDeck);
            message += `Chance: ${chanceCard.description}`;
            chanceCard.action(player);
            break;
            
        case 'chest':
            const chestCard = drawCard(communityChestDeck);
            message += `Community Chest: ${chestCard.description}`;
            chestCard.action(player);
            break;
            
        case 'jail':
            // Just visiting
            break;
            
        case 'special':
            if (spaceId === 0) {
                player.receive(200);
                message += "Collected $200 for passing Go!";
            }
            break;
    }
    
    // Update status
    document.getElementById('status').textContent = message;
    renderPlayers(); // Update player info display
    
    // Move to end turn phase
    gameState.gamePhase = 'end';
}

// End turn function
function endTurn() {
    saveGameState();
    if (gameState.gamePhase !== 'end') return;
    
    if (gameState.players.length > 1) {
        // Move to next non-bankrupt player
        do {
            gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        } while (gameState.players[gameState.currentPlayerIndex] === undefined);
        
        gameState.gamePhase = 'rolling';
        updateStatus();
    } else {
        document.getElementById('status').textContent = "Game over!";
    }
}

// Update status display
function updateStatus() {
    const player = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('status').textContent = 
        `${player.name}'s turn. Phase: ${gameState.gamePhase}`;
}

// Reset game
function resetGame() {
    localStorage.removeItem('unusVenditorState');
    location.reload();
}

// Show purchase dialog
function showPurchaseDialog(property, player) {
    const dialog = document.getElementById('purchase-dialog');
    const propName = document.getElementById('prop-name');
    const propPrice = document.getElementById('prop-price');
    const buyBtn = document.getElementById('buy-btn');
    const passBtn = document.getElementById('pass-btn');
    
    propName.textContent = property.name;
    propPrice.textContent = `$${property.price}`;
    
    // Enable/disable buy button based on funds
    buyBtn.disabled = player.money < property.price;
    
    // Show dialog
    dialog.style.display = 'block';
    
    // Set up button handlers
    buyBtn.onclick = () => {
        player.pay(property.price);
        gameState.properties[property.id].owner = player.id;
        player.addProperty(property.id);
        document.getElementById('status').textContent = `Bought ${property.name} for $${property.price}`;
        dialog.style.display = 'none';
        endTurn();
    };
    
    passBtn.onclick = () => {
        document.getElementById('status').textContent = `Passed on buying ${property.name}`;
        dialog.style.display = 'none';
        endTurn();
    };
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    document.getElementById('end-turn').addEventListener('click', endTurn);
    document.getElementById('reset-game').addEventListener('click', resetGame);
});