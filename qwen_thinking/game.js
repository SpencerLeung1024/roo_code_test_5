// Game State
const boardSpaces = [
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

const players = [
    { id: 0, name: "Player 1", position: 0, balance: 1500, properties: [], inJail: false, jailTurns: 0 },
    { id: 1, name: "Player 2", position: 0, balance: 1500, properties: [], inJail: false, jailTurns: 0 }
];
let currentPlayerIndex = 0;
let lastDiceTotal = 0;

// DOM Elements
const currentPlayerEl = document.getElementById('current-player');
const balanceEl = document.getElementById('balance');
const propertiesEl = document.getElementById('properties');
const rollButton = document.getElementById('roll-dice');
const buyButton = document.getElementById('buy-property');
const endTurnButton = document.getElementById('end-turn');

// Game Functions
function updateUI() {
    console.log(`[DEBUG] Updating UI for player ${currentPlayerIndex}`);
    const currentPlayer = players[currentPlayerIndex];
    currentPlayerEl.textContent = currentPlayerIndex + 1;
    balanceEl.textContent = currentPlayer.balance;
    
    // Update player panel styling
    const playerInfo = document.querySelector('.player-info');
    playerInfo.className = 'player-info';
    playerInfo.classList.add(`player-${currentPlayerIndex}`);
    playerInfo.classList.add('current-turn');
    
    propertiesEl.innerHTML = '';
    currentPlayer.properties.forEach(prop => {
        const propEl = document.createElement('div');
        propEl.textContent = prop.name;
        propEl.className = `property ${prop.color}`;
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
    const player = players[currentPlayerIndex];
    if (player.inJail) {
        // Handle jail options
        const jailModal = document.getElementById('jail-modal');
        jailModal.style.display = 'flex';
        
        const rollButton = document.getElementById('jail-roll');
        const payButton = document.getElementById('jail-pay');
        
        rollButton.onclick = () => {
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            const total = die1 + die2;
            
            if (die1 === die2) {
                player.inJail = false;
                createNotification(`${player.name} rolled doubles and got out of jail!`);
                movePlayer(currentPlayerIndex, total);
            } else {
                player.jailTurns++;
                if (player.jailTurns >= 3) {
                    player.balance -= 50;
                    checkBankruptcy(currentPlayerIndex, null);
                    player.inJail = false;
                    createNotification(`${player.name} paid $50 bail after 3 turns`);
                    movePlayer(currentPlayerIndex, total);
                } else {
                    createNotification(`${player.name} failed to roll doubles (turn ${player.jailTurns}/3)`);
                    endTurn();
                }
            }
            jailModal.style.display = 'none';
            rollButton.onclick = null;
            payButton.onclick = null;
        };
        
        payButton.onclick = () => {
            if (player.balance >= 50) {
                player.balance -= 50;
                checkBankruptcy(currentPlayerIndex, null);
                player.inJail = false;
                createNotification(`${player.name} paid $50 bail to get out of jail`);
                const die1 = Math.floor(Math.random() * 6) + 1;
                const die2 = Math.floor(Math.random() * 6) + 1;
                const total = die1 + die2;
                movePlayer(currentPlayerIndex, total);
            } else {
                createNotification(`${player.name} cannot afford $50 bail!`);
            }
            jailModal.style.display = 'none';
            rollButton.onclick = null;
            payButton.onclick = null;
        };
        
        return;
    }
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    console.log(`[DEBUG] Dice roll: ${die1} + ${die2} = ${total}`);
    lastDiceTotal = total;
    
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
            movePlayer(currentPlayerIndex, total);
            
            // Enable appropriate buttons
            buyButton.disabled = true;
            endTurnButton.disabled = false;
            rollButton.disabled = true;
        }
    }, 100);
}

function movePlayer(playerIndex, spaces) {
    const player = players[playerIndex];
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
    const player = players[playerIndex];
    const space = boardSpaces[player.position];
    
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
    
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    rollButton.disabled = false;
    endTurnButton.disabled = true;
    updateUI();

    // If next player is AI, start their turn
    if (players[currentPlayerIndex].id === 1) {
        aiLoading.style.display = 'block';
        rollButton.disabled = true;
        endTurnButton.disabled = true;
        setTimeout(rollDice, 1000);
    }
}
function checkBankruptcy(playerIndex, creditorIndex) {
    const player = players[playerIndex];
    console.log(`[DEBUG] Checking bankruptcy for player ${playerIndex}, balance: ${player.balance}`);
    if (player.balance <= 0) {
        // Transfer properties to creditor if exists
        if (creditorIndex !== null) {
            const creditor = players[creditorIndex];
            player.properties.forEach(property => {
                property.owner = creditorIndex;
                creditor.properties.push(property);
                // Update UI ownership
                const index = boardSpaces.indexOf(property);
                if (index >= 0) {
                    const cell = document.querySelector(`.cell[data-index="${index}"]`);
                    if (cell) {
                        cell.classList.remove(`owned-by-${playerIndex}`);
                        cell.classList.add(`owned-by-${creditorIndex}`);
                    }
                }
            });
        }
        // Remove bankrupt player
        players.splice(playerIndex, 1);
        // Adjust current player index if needed
        if (currentPlayerIndex >= playerIndex) {
            currentPlayerIndex--;
        }
        createNotification(`Player ${playerIndex + 1} is bankrupt!`);
        // Check if game ends
        if (players.length === 1) {
            createNotification(`Player ${players[0].name} wins!`);
            rollButton.disabled = true;
            buyButton.disabled = true;
            endTurnButton.disabled = true;
        }
        updateUI();
    }
}

// Event Listeners
rollButton.addEventListener('click', rollDice);
buyButton.addEventListener('click', buyProperty);
endTurnButton.addEventListener('click', endTurn);

// Initialize Game
updateUI();