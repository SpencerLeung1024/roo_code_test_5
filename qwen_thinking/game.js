import { gameState, updateState, subscribe } from './game-state.js';

// Initialize game state if not already set
if (gameState.players.length === 0) {
    gameState.players = [
        { id: 0, name: "Player 1", position: 0, balance: 1500, properties: [], inJail: false, jailTurns: 0 },
        { id: 1, name: "Player 2", position: 0, balance: 1500, properties: [], inJail: false, jailTurns: 0 }
    ];
    gameState.currentPlayerIndex = 0;
    gameState.gamePhase = 'rolling';
}

// DOM Elements
const currentPlayerEl = document.getElementById('current-player');
const balanceEl = document.getElementById('balance');
const propertiesEl = document.getElementById('properties');
const rollButton = document.getElementById('roll-dice');
const buyButton = document.getElementById('buy-property');
const endTurnButton = document.getElementById('end-turn');

// Game Functions
function updateUI() {
    console.log(`[DEBUG] Updating UI for player ${gameState.currentPlayerIndex}`);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    currentPlayerEl.textContent = gameState.currentPlayerIndex + 1;
    balanceEl.textContent = currentPlayer.balance;
    
    // Update player panel styling
    const playerInfo = document.querySelector('.player-info');
    if (playerInfo) {
        playerInfo.className = 'player-info';
        playerInfo.classList.add(`player-${gameState.currentPlayerIndex}`);
        playerInfo.classList.add('current-turn');
    }
    
    propertiesEl.innerHTML = '';
    currentPlayer.properties.forEach(spaceIndex => {
        const space = gameState.boardSpaces[spaceIndex];
        const propEl = document.createElement('div');
        propEl.textContent = space.name;
        propEl.className = `property ${space.color}`;
        propertiesEl.appendChild(propEl);
    });
    
    // Highlight current position
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('current-position');
    });
    const currentCell = document.querySelector(`.cell[data-index="${currentPlayer.position}"]`);
    if (currentCell) currentCell.classList.add('current-position');
}

function rollDice() {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.inJail) {
        updateState({ currentAction: 'jailOptions' });
        return;
    }
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    console.log(`[DEBUG] Dice roll: ${die1} + ${die2} = ${total}`);
    
    const diceContainer = document.querySelector('.dice-container');
    diceContainer.classList.add('rolling');
    
    const dice1 = document.getElementById('die1');
    const dice2 = document.getElementById('die2');
    
    let rolls = 5;
    const interval = setInterval(() => {
        if (rolls-- > 0) {
            dice1.textContent = Math.floor(Math.random() * 6) + 1;
            dice2.textContent = Math.floor(Math.random() * 6) + 1;
        } else {
            clearInterval(interval);
            dice1.textContent = die1;
            dice2.textContent = die2;
            diceContainer.classList.remove('rolling');
            
            // Trigger game logic after animation completes
            updateState({
                lastDiceTotal: total,
                gamePhase: 'action'  // Use valid phase instead of 'moving'
            });
        }
    }, 100);
}

function movePlayer(playerIndex, spaces) {
    const player = gameState.players[playerIndex];
    let steps = 0;
    const moveStep = () => {
        if (steps < spaces) {
            const oldPos = player.position;
            player.position = (oldPos + 1) % 40;
            console.log(`[DEBUG] Moving player ${playerIndex} from ${oldPos} to ${player.position}`);
            if (oldPos === 39 && player.position === 0) {
                player.balance += 200;
            }
            // Add movement highlighting
            const currentCell = document.querySelector(`.cell[data-index="${player.position}"]`);
            if (currentCell) {
                currentCell.classList.add('cell-highlight');
                setTimeout(() => {
                    currentCell.classList.remove('cell-highlight');
                }, 300);
            }
            updateUI();
            steps++;
            setTimeout(moveStep, 200);
        } else {
            handleSpace(playerIndex);
        }
    };
    moveStep();
}

function handleSpace(playerIndex) {
    const player = gameState.players[playerIndex];
    const space = gameState.boardSpaces[player.position];
    
    switch(space.type) {
        case 'tax':
            player.balance -= space.amount;
            checkBankruptcy(playerIndex, null);
            createNotification(`${player.name} paid tax: $${space.amount}`);
            break;
        case 'property':
        case 'railroad':
        case 'utility':
            if (space.owner !== undefined && space.owner !== playerIndex) {
                const owner = players[space.owner];
                let rent = 0;
                if (space.type === 'railroad') {
                    const railroadCount = owner.properties.filter(p => p.type === 'railroad').length;
                    rent = space.baseRent * railroadCount;
                    console.log(`[DEBUG] Railroad rent: ${space.name} - Count: ${railroadCount}, Rent: $${rent}`);
               } else if (space.type === 'utility') {
                    const utilityCount = owner.properties.filter(p => p.type === 'utility').length;
                    const multiplier = utilityCount === 2 ? 10 : 4;
                    rent = multiplier * lastDiceTotal;
                   console.log(`[DEBUG] Utility rent: ${space.name} - Count: ${utilityCount}, Multiplier: ${multiplier}, Dice: ${lastDiceTotal}, Rent: $${rent}`);
                } else {
                    rent = space.rent;
                    console.log(`[DEBUG] Property rent: ${space.name} - Base: $${space.rent}, Rent: $${rent}`);
                }
                player.balance -= rent;
                owner.balance += rent;
                checkBankruptcy(playerIndex, space.owner);
                createNotification(`${player.name} paid $${rent} to ${owner.name}`);
            } else if (space.owner === undefined && player.balance >= space.price) {
                const purchaseModal = document.getElementById('purchase-modal');
                const propName = document.getElementById('property-name');
                const propPrice = document.getElementById('property-price');
                propName.textContent = space.name;
                propPrice.textContent = space.price;
                purchaseModal.style.display = 'flex';
                
                const yesButton = document.getElementById('buy-yes');
                const noButton = document.getElementById('buy-no');
                
                yesButton.onclick = () => {
                    buyProperty();
                    purchaseModal.style.display = 'none';
                    yesButton.onclick = null;
                    noButton.onclick = null;
                };
                
                noButton.onclick = () => {
                    purchaseModal.style.display = 'none';
                    yesButton.onclick = null;
                    noButton.onclick = null;
                };
            } else if (space.owner === undefined && player.balance < space.price) {
                createNotification(`${player.name} cannot afford ${space.name} ($${space.price})`);
            }
            break;
        case 'chance':
        case 'community_chest':
            const cardEffects = [
                { text: "Bank pays you $50", effect: () => {
                    player.balance += 50;
                    createNotification(`Bank pays ${player.name} $50`);
                }},
                { text: "Go to jail", effect: () => {
                    player.position = 10;
                    updateUI();
                }},
                { text: "Advance to GO", effect: () => {
                    player.position = 0;
                    player.balance += 200;
                    updateUI();
                }}
            ];
            const randomCard = cardEffects[Math.floor(Math.random() * cardEffects.length)];
            const cardModal = document.getElementById('card-modal');
            const cardText = document.getElementById('card-text');
            cardText.textContent = randomCard.text;
            cardModal.style.display = 'flex';
            
            const okButton = document.getElementById('card-ok');
            okButton.onclick = () => {
                randomCard.effect();
                updateUI();
                cardModal.style.display = 'none';
                okButton.onclick = null;
            };
            break;
        case 'go_to_jail':
            console.log(`[DEBUG] Player ${playerIndex} sent to jail`);
            player.position = 10;
            updateUI();
            break;
        case 'free_parking':
            player.balance += 100;
            createNotification(`${player.name} collected $100 from Free Parking!`);
            break;
        default:
            console.log(`[DEBUG] Unhandled space type: ${space.type} at position ${player.position}`);
            break;
    }
    // If AI player, end turn automatically after a short delay
    if (player.id === 1) {
        setTimeout(endTurn, 1000);
    }
    
    // Add landing effects for special spaces
    if (space.type === 'chance' || space.type === 'community_chest') {
        const currentCell = document.querySelector(`.cell[data-index="${player.position}"]`);
        if (currentCell) {
            currentCell.classList.add('landing-effect');
            setTimeout(() => {
                currentCell.classList.remove('landing-effect');
            }, 600);
        }
    }
    
    // Auto-buy for AI players (Player 2)
    if (player.id === 1 && space.type === 'property' && space.owner === undefined && player.balance >= space.price) {
        buyProperty();
    }
}
function createNotification(message) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('role', 'alert');
    notification.textContent = message;
    notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function buyProperty() {
    const player = players[currentPlayerIndex];
    const space = boardSpaces[player.position];
    
    if (space.type === 'property' && player.balance >= space.price) {
        player.balance -= space.price;
        checkBankruptcy(currentPlayerIndex, null);
        createNotification(`${player.name} bought ${space.name} for $${space.price}`);
        player.properties.push(space);
        space.owner = currentPlayerIndex;
        const cell = document.querySelector(`.cell[data-index="${player.position}"]`);
        if (cell) cell.classList.add(`owned-by-${currentPlayerIndex}`);
        buyButton.disabled = true;
    }
}

function endTurn() {
    const aiLoading = document.getElementById('ai-loading');
    aiLoading.style.display = 'none';
    
    // Update game state for next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateState({
        currentPlayerIndex: nextPlayerIndex,
        gamePhase: 'rolling',
        currentAction: null
    });
    
    // If next player is AI, start their turn
    if (gameState.players[nextPlayerIndex].id === 1) {
        aiLoading.style.display = 'block';
        setTimeout(() => {
            rollDice();
            aiLoading.style.display = 'none';
        }, 1000);
    }
}

function checkBankruptcy(playerIndex, creditorIndex) {
    const player = gameState.players[playerIndex];
    console.log(`[DEBUG] Checking bankruptcy for player ${playerIndex}, balance: ${player.balance}`);
    if (player.balance <= 0) {
        // Transfer properties to creditor if exists
        if (creditorIndex !== null && creditorIndex < gameState.players.length) {
            const creditor = gameState.players[creditorIndex];
            player.properties.forEach(spaceIndex => {
                const space = gameState.boardSpaces[spaceIndex];
                space.owner = creditorIndex;
                
                // Update UI ownership
                const cell = document.querySelector(`.cell[data-index="${spaceIndex}"]`);
                if (cell) {
                    cell.classList.remove(`owned-by-${playerIndex}`);
                    cell.classList.add(`owned-by-${creditorIndex}`);
                }
            });
            
            // Update creditor's properties
            updateState({
                players: gameState.players.map((p, i) =>
                    i === creditorIndex
                        ? { ...p, properties: [...p.properties, ...player.properties] }
                        : p
                )
            });
        }
        
        // Remove bankrupt player
        updateState({
            players: gameState.players.filter((_, i) => i !== playerIndex),
            currentPlayerIndex: gameState.currentPlayerIndex >= playerIndex
                ? Math.max(0, gameState.currentPlayerIndex - 1)
                : gameState.currentPlayerIndex
        });
        
        createNotification(`Player ${playerIndex + 1} is bankrupt!`);
        
        // Check if game ends
        if (gameState.players.length === 1) {
            createNotification(`Player ${gameState.players[0].name} wins!`);
            updateState({ gamePhase: 'ended' });
        }
    }
}

// Event Listeners
buyButton.addEventListener('click', () => {
    if (gameState.currentAction === 'purchasePrompt') {
        buyProperty();
    }
});
endTurnButton.addEventListener('click', endTurn);

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // Set initial game phase
    updateState({ gamePhase: 'rolling' });
    
    // Subscribe to game state changes
    subscribe('stateUpdated', (updates) => {
        console.log(`[STATE] State updated with:`, updates);
        
        // Handle game phase transitions
        if (updates.gamePhase) {
            console.log(`[STATE] Game phase transition: ${gameState.gamePhase} → ${updates.gamePhase}`);
        }
        
        // Handle dice roll progression
        if (updates.gamePhase === 'moving' && updates.lastDiceTotal !== undefined) {
            console.log(`[STATE] Triggering move with dice total: ${updates.lastDiceTotal}`);
            movePlayer(gameState.currentPlayerIndex, updates.lastDiceTotal);
        }
        
        // Handle jail options
        if (updates.currentAction === 'jailOptions') {
            console.log(`[STATE] Showing jail options modal`);
            showJailModal();
        }
        
        // Handle purchase prompt
        if (updates.currentAction === 'purchasePrompt') {
            console.log(`[STATE] Showing purchase modal for space ${updates.currentSpace}`);
        }
        
        // Handle card drawn
        if (updates.currentAction === 'cardDrawn') {
            console.log(`[STATE] Showing card modal with text: ${updates.currentCardText}`);
        }
    });
});