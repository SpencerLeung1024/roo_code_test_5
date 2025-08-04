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
    logEvent(`Rolled a ${die1} and a ${die2}.`);
    return die1 + die2;
}

/**
 * Moves the current player on the board.
 * @param {number} rollTotal - The total from the dice roll.
 */
export function movePlayer(rollTotal) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.inJail) {
        logEvent(`${currentPlayer.name} is in jail and cannot move.`);
        return; // Safeguard against moving while in jail
    }
    const newPosition = (currentPlayer.position + rollTotal) % gameState.board.length; // Simplified board length

    if (newPosition < currentPlayer.position) {
        // Passed Go
        currentPlayer.money += 200;
        logEvent(`${currentPlayer.name} passed Go and collected $200.`);
    }

    currentPlayer.position = newPosition;
    logEvent(`${currentPlayer.name} moved to ${gameState.board[newPosition].name}.`);

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
        if (player.money >= property.price) {
            // For now, auto-buy if they can afford it
            player.money -= property.price;
            property.owner = player.id;
            player.properties.push(property.id);
            logEvent(`${player.name} bought ${property.name} for $${property.price}.`);
        } else {
            logEvent(`${player.name} cannot afford to buy ${property.name}.`);
        }
    } else if (property.owner !== player.id) {
        // Owned by another player
        const owner = gameState.players.find(p => p.id === property.owner);
        const rent = property.rent[property.houses]; // Simplified rent calculation
        
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
           logEvent(`${player.name} moves to ${gameState.board[player.position].name}.`);
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
   logEvent(`${player.name} has been sent to Jail!`);
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
