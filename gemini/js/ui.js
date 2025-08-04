// Unus Venditor - UI Logic

import { rollDice, movePlayer, endTurn } from './main.js';
import { gameState, logEvent } from './state.js';

// =========================================================================================
// D O M   E L E M E N T S
// =========================================================================================

const rollDiceBtn = document.getElementById('roll-dice-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const playerInfoPanel = document.getElementById('player-info');
const gameLogEntries = document.querySelector('#game-log .log-entries');
const gameBoard = document.getElementById('game-board');
const propertyViewer = document.getElementById('property-viewer');
const propertyDetails = document.getElementById('property-details');
const propertyName = document.getElementById('property-name');
const propertyOwner = document.getElementById('property-owner');
const propertyPrice = document.getElementById('property-price');
const propertyRent = document.getElementById('property-rent');

// =========================================================================================
// D O M   E L E M E N T S
// =========================================================================================

const playerTokensContainer = document.getElementById('player-tokens');

// =========================================================================================
// E V E N T   L I S T E N E R S
// =========================================================================================

/**
 * Initializes all UI event listeners.
 */
function initializeUI() {
    rollDiceBtn.addEventListener('click', () => {
        if (gameState.hasRolled) {
            console.log("You have already rolled this turn.");
            return;
        }

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer.inJail) {
            logEvent(`${currentPlayer.name} is in jail and cannot move.`);
            // For now, they just miss their turn on a roll attempt.
            // Full jail logic (rolling doubles, paying fine) can be added later.
            gameState.hasRolled = true; // Mark as rolled even for a failed attempt
            updateUI(gameState);
            return;
        }

        const roll = rollDice();
        movePlayer(roll);
        gameState.hasRolled = true;
        updateUI(gameState);
    });

    endTurnBtn.addEventListener('click', () => {
        endTurn();
    });

    console.log("UI Initialized.");
}

// =========================================================================================
// U I   U P D A T E   F U N C T I O N S
// =========================================================================================

/**
 * Main function to update the entire UI based on the game state.
 * @param {object} gameState - The current state of the game.
 */
export function updateUI(gameState) {
    updatePlayerInfo(gameState.players, gameState.currentPlayerIndex);
    updateGameLog(gameState.gameLog);
    updateAllPlayerPositions(gameState.players);
    updateBoardOwnership();
}

/**
 * Updates the positions of all player tokens on the board.
 * @param {Array} players - The array of player objects.
 */
function updateAllPlayerPositions(players) {
    players.forEach(player => {
        updatePlayerPosition(player);
    });
}

/**
 * Updates a single player's token position on the UI.
 * @param {object} player - The player object to update.
 */
export function updatePlayerPosition(player) {
    const tokenElement = document.getElementById(`player-token-${player.id}`);
    const spaceElement = document.querySelector(`.space-${player.position}`);

    if (tokenElement && spaceElement) {
        // Position the token within the board container, not the space itself
        const boardRect = gameBoard.getBoundingClientRect();
        const spaceRect = spaceElement.getBoundingClientRect();

        // Calculate position relative to the game-board-container
        const top = spaceRect.top - boardRect.top + (spaceRect.height / 2) - (tokenElement.offsetHeight / 2);
        const left = spaceRect.left - boardRect.left + (spaceRect.width / 2) - (tokenElement.offsetWidth / 2);

        tokenElement.style.top = `${top}px`;
        tokenElement.style.left = `${left}px`;

        console.log(`Moved ${player.name} token to ${player.position}`);
    } else {
        if (!tokenElement) console.error(`Token for player ${player.id} not found.`);
        if (!spaceElement) console.error(`Space element for position ${player.position} not found.`);
    }
}

/**
 * Updates the player information panel.
 * @param {Array} players - The array of player objects.
 * @param {number} currentPlayerIndex - The index of the active player.
 */
function updatePlayerInfo(players, currentPlayerIndex) {
    if (!playerInfoPanel) return;
    playerInfoPanel.innerHTML = '<h2>Players</h2>'; // Clear previous state
    players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${index === currentPlayerIndex ? 'active' : ''}`;
        playerCard.innerHTML = `
            <h3>${player.name}</h3>
            <h3>${player.name} ${player.inJail ? ' (Jailed)' : ''}</h3>
            <p>Money: $${player.money}</p>
            <p>Token: ${player.token}</p>
        `;
        playerInfoPanel.appendChild(playerCard);
    });
}

/**
 * Updates the game log display.
 * @param {Array<string>} logMessages - An array of log messages.
 */
function updateGameLog(logMessages) {
    if (!gameLogEntries) return;
    gameLogEntries.innerHTML = ''; // Clear previous entries
    logMessages.forEach(message => {
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        gameLogEntries.appendChild(logEntry);
    });
    // Auto-scroll to the bottom
    gameLogEntries.scrollTop = gameLogEntries.scrollHeight;
}


/**
 * Draws the game board spaces.
 */
export function drawBoard() {
    if (!gameBoard) return;
    gameBoard.innerHTML = ''; // Clear existing board

    gameState.board.forEach((space, index) => {
        const spaceDiv = document.createElement('div');
        spaceDiv.className = `space space-${index} space-type--${space.type}`;

        let spaceName = space.name;
        if (space.type === 'property') {
            const propDetails = gameState.properties.find(p => p.id === space.id);
            if (propDetails) {
                spaceName = propDetails.name;
                spaceDiv.addEventListener('click', () => showPropertyDetails(propDetails.id));
            }
        }

        spaceDiv.textContent = spaceName;
        gameBoard.appendChild(spaceDiv);
    });

    updateBoardOwnership();
}

/**
 * Updates the board to show property ownership.
 */
function updateBoardOwnership() {
    gameState.properties.forEach(prop => {
        const space = gameState.board.find(s => s.id === prop.id);
        if (!space) return;
        const spaceIndex = gameState.board.indexOf(space);
        const spaceDiv = document.querySelector(`.space-${spaceIndex}`);
        if (!spaceDiv) return;

        // Remove any existing indicator
        const existingIndicator = spaceDiv.querySelector('.property-owner-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Add a new one if the property is owned
        if (prop.owner !== null) {
            const ownerIndicator = document.createElement('div');
            ownerIndicator.className = `property-owner-indicator player-${prop.owner}`;
            spaceDiv.appendChild(ownerIndicator);
        }
    });
}

/**
 * Shows property details in the viewer.
 * @param {string} propertyId - The ID of the property to show.
 */
function showPropertyDetails(propertyId) {
    const prop = gameState.properties.find(p => p.id === propertyId);
    if (!prop) return;

    const viewerTitle = document.getElementById('property-viewer-title');
    propertyName.textContent = prop.name;

    if (prop.owner !== null) {
        const owner = gameState.players.find(p => p.id === prop.owner);
        propertyOwner.textContent = owner ? `Owner: ${owner.name}` : "Owner: Unknown";
    } else {
        propertyOwner.textContent = "Owner: Unowned";
    }

    propertyPrice.textContent = `Price: $${prop.price}`;

    let rentText = 'N/A';
    if (prop.group === 'utility') {
        rentText = '4x Dice (1) / 10x Dice (2)';
    } else if (prop.group === 'railroad') {
        rentText = '$25 / $50 / $100 / $200';
    } else if (prop.rent && prop.rent.length > 0) {
        rentText = `$${prop.rent[prop.houses || 0]}`;
    }
    propertyRent.textContent = `Rent: ${rentText}`;

    propertyDetails.style.display = 'block';
    if (viewerTitle) {
        viewerTitle.style.display = 'none';
    }
}

/**
 * Creates and draws the player tokens on the board.
 */
export function drawPlayerTokens() {
    if (!playerTokensContainer) return;
    playerTokensContainer.innerHTML = ''; // Clear existing tokens

    gameState.players.forEach(player => {
        const tokenDiv = document.createElement('div');
        tokenDiv.id = `player-token-${player.id}`;
        tokenDiv.className = `player-token player-${player.id}`;
        tokenDiv.textContent = player.token.charAt(0).toUpperCase(); // e.g., 'C' for car
        playerTokensContainer.appendChild(tokenDiv);
        updatePlayerPosition(player); // Set initial position
    });
}


// Initial call to setup the UI when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    drawBoard();
    drawPlayerTokens();
});