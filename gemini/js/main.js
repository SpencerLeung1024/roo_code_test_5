// Unus Venditor - Core Game Logic
import { updateUI } from './ui.js';
import { drawChanceCard, drawCommunityChestCard } from './cards.js';
import { gameState, nextTurn, checkGameOver, logEvent, createPlayers } from './state.js';

// =========================================================================================
// C O R E   G A M E   L O G I C
// =========================================================================================

/**
 * Rolls the dice and updates the game state.
 * @returns {number} The total of the two dice.
 */
export function rollDice() {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    gameState.dice = [die1, die2];
    return die1 + die2;
}

/**
 * Initiates the dice roll and subsequent turn actions.
 */
export function handleRoll() {
    if (gameState.hasRolled) {
        logEvent("You have already rolled on this turn.");
        return;
    }
    gameState.hasRolled = true;
    
    const rollTotal = rollDice();
    logEvent(`Rolled a ${gameState.dice[0]} and a ${gameState.dice[1]}.`);
    handleTurn(rollTotal);
    
    // Check for game over *after* the turn is handled
    if (checkGameOver()) {
        updateUI(gameState);
        return;
    }

    updateUI(gameState); // Update UI after the move
}

/**
 * Handles a player's complete turn based on a dice roll.
* @param {number} rollTotal - The total from the dice roll.
 */
function handleTurn(rollTotal) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const dice = gameState.dice;

    if (currentPlayer.inJail) {
        handleJailTurn(currentPlayer, dice);
    } else {
        movePlayer(rollTotal);
    }
}

/**
 * Moves the current player on the board.
 * @param {number} rollTotal - The total from the dice roll.
 */
export function movePlayer(rollTotal) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const newPosition = (currentPlayer.position + rollTotal) % gameState.board.length;

    if (newPosition < currentPlayer.position) {
        // Passed Go
        currentPlayer.money += 200;
        logEvent(`${currentPlayer.name} passed Go and collected $200.`);
    }

    currentPlayer.position = newPosition;
    const currentSpace = gameState.board[currentPlayer.position];
    let spaceName = currentSpace.name;
    if (currentSpace.type === 'property') {
        const propertyDetails = gameState.properties.find(p => p.id === currentSpace.id);
        if (propertyDetails) {
            spaceName = propertyDetails.name;
        }
    }
    logEvent(`${currentPlayer.name} moved to ${spaceName}.`);

    handleLanding();
}

/**
 * Handles the logic for when a player lands on a space.
 */
function handleLanding() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentSpace = gameState.board[currentPlayer.position];

    switch (currentSpace.type) {
        case "property":
            handlePropertyLanding(currentPlayer, currentSpace);
            break;
        case "go":
        case "community-chest":
            handleCardLanding(currentPlayer, 'community-chest');
            break;
        case "chance":
            handleCardLanding(currentPlayer, 'chance');
            break;
        case "income-tax":
             // To be implemented
             currentPlayer.money -= 200; // Flat tax for now
             logEvent(`${currentPlayer.name} paid $200 in Income Tax.`);
             break;
        case "go-to-jail":
             goToJail(currentPlayer);
             break;
        default:
            logEvent(`Landed on ${currentSpace.name}.`);
    }
}

/**
 * Handles landing on a property space.
 * @param {object} player - The current player object.
 * @param {object} space - The board space object.
 */
function handlePropertyLanding(player, space) {
    const property = gameState.properties.find(p => p.id === space.id);
    if (!property) return;

    if (property.owner === null) {
        // Unowned property
        // Present the option to buy
        if (player.money >= property.price) {
            logEvent(`${player.name} has the option to buy ${property.name} for $${property.price}.`);
            gameState.purchasePending = true;
        } else {
            logEvent(`${player.name} cannot afford to buy ${property.name}.`);
        }
    } else if (property.owner !== player.id) {
        // Owned by another player
        const owner = gameState.players.find(p => p.id === property.owner);
        let rent = 0;

        if (property.group === 'utility') {
            const diceRoll = gameState.dice[0] + gameState.dice[1];
            const utilitiesOwned = owner.properties.filter(pId => {
                const prop = gameState.properties.find(prop => prop.id === pId);
                return prop && prop.group === 'utility';
            }).length;

            if (utilitiesOwned === 1) {
                rent = diceRoll * 4;
            } else if (utilitiesOwned === 2) {
                rent = diceRoll * 10;
            }
        } else {
            rent = property.rent[property.houses]; // Original rent calculation
        }
        
        player.money -= rent;
        owner.money += rent;
        logEvent(`${player.name} paid $${rent} in rent to ${owner.name}.`);
    } else {
        // Owned by the current player
        logEvent(`${player.name} landed on their own property, ${property.name}.`);
    }
}

/**
* Handles landing on a card space (Chance or Community Chest).
* @param {object} player - The current player object.
* @param {string} cardType - 'chance' or 'community-chest'.
*/
function handleCardLanding(player, cardType) {
   logEvent(`${player.name} landed on ${cardType === 'chance' ? 'Chance' : 'Community Chest'}.`);
   const card = cardType === 'chance' ? drawChanceCard() : drawCommunityChestCard();
   logEvent(`Card drawn: "${card.text}"`);
   applyCardAction(player, card.action);
}

/**
* Applies the effect of a drawn card.
* @param {object} player - The current player.
* @param {object} action - The action object from the card.
*/
function applyCardAction(player, action) {
   switch (action.type) {
       case 'money':
           player.money += action.amount;
           if (action.amount > 0) {
               logEvent(`${player.name} collects $${action.amount}.`);
           } else {
               logEvent(`${player.name} pays $${-action.amount}.`);
           }
           break;
       case 'move_to':
           if (action.collectGo && player.position > action.position) {
               player.money += 200;
               logEvent(`${player.name} passed Go and collected $200.`);
           }
           player.position = action.position;
           const newSpace = gameState.board[player.position];
           let spaceName = newSpace.name;
            if (newSpace.type === 'property') {
                const property = gameState.properties.find(p => p.id === newSpace.id);
                if (property) {
                    spaceName = property.name;
                }
            }
           logEvent(`${player.name} moves to ${spaceName}.`);
           handleLanding(); // Handle the new space
           break;
       case 'go_to_jail':
           goToJail(player);
           break;
       case 'get_out_of_jail_free':
           player.getOutOfJailFreeCards++;
           logEvent(`${player.name} received a "Get Out of Jail Free" card.`);
           break;
       case 'pay_players':
           gameState.players.forEach(p => {
               if (p.id !== player.id) {
                   player.money -= action.amount;
                   p.money += action.amount;
                   logEvent(`${player.name} paid $${action.amount} to ${p.name}.`);
               }
           });
           break;
       case 'collect_from_players':
            gameState.players.forEach(p => {
               if (p.id !== player.id) {
                   p.money -= action.amount;
                   player.money += action.amount;
                   logEvent(`${player.name} collected $${action.amount} from ${p.name}.`);
               }
           });
           break;
   }
}

/**
* Sends a player to jail.
* @param {object} player - The player to send to jail.
*/
function goToJail(player) {
   const jailPosition = gameState.board.findIndex(space => space.type === 'jail'); // Assuming a jail space exists
   if (jailPosition !== -1) {
       player.position = jailPosition;
   }
   player.inJail = true;
   player.jailTurns = 0; // Reset jail turn counter upon entering
   logEvent(`${player.name} has been sent to Jail!`);
}

/**
* Handles the logic for a player's turn while they are in jail.
* @param {object} player - The current player object.
* @param {Array<number>} dice - The two dice values.
*/
function handleJailTurn(player, dice) {
   player.jailTurns++;
   logEvent(`${player.name} is in jail (turn ${player.jailTurns}).`);

   const isDouble = dice[0] === dice[1];

   if (isDouble) {
       logEvent(`They rolled a double! ${player.name} is released from jail.`);
       player.inJail = false;
       player.jailTurns = 0;
       movePlayer(dice[0] + dice[1]); // Move the rolled amount
   } else if (player.jailTurns >= 3) {
       logEvent(`${player.name} has served 3 turns and is released from jail (but misses this turn).`);
       player.inJail = false;
       player.jailTurns = 0;
       // Player does not move on this turn, it just ends.
       endTurn();
   } else {
       logEvent(`${player.name} did not roll a double and remains in jail.`);
       endTurn();
   }
}


/**
* Ends the current player's turn and advances to the next player.
 */
export function endTurn() {
    const currentPlayerName = gameState.players[gameState.currentPlayerIndex].name;
    logEvent(`${currentPlayerName}'s turn has ended.`);
    
    if (checkGameOver()) {
        updateUI(gameState);
        return;
    }

    nextTurn();
    updateUI(gameState);
}

// =========================================================================================
// I N I T I A L I Z A T I O N
// =========================================================================================
export function initGame(numberOfPlayers) {
    createPlayers(numberOfPlayers);
    logEvent(`Starting a new game with ${numberOfPlayers} players!`);
    logEvent("Welcome to Unus Venditor!");
    updateUI(gameState);
}

// Event Listeners for Player Selection
let selectedPlayers = 2; // Default

document.querySelectorAll('.player-option-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        selectedPlayers = parseInt(event.target.dataset.players, 10);
        // Optional: Add some visual feedback for selection
        document.querySelectorAll('.player-option-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
        console.log(`Selected players: ${selectedPlayers}`);
    });
});

document.getElementById('start-game-btn').addEventListener('click', () => {
    const playerSelectionScreen = document.getElementById('player-selection-screen');
    const gameContainer = document.getElementById('game-container');

    if (playerSelectionScreen && gameContainer) {
        playerSelectionScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame(selectedPlayers);
    }
});
