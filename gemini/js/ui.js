// Unus Venditor - UI Logic

import { rollDice, movePlayer, endTurn } from './main.js';
import { gameState } from './state.js';

// =========================================================================================
// D O M   E L E M E N T S
// =========================================================================================

const rollDiceBtn = document.getElementById('roll-dice-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const playerInfoPanel = document.getElementById('player-info');
const gameLogEntries = document.querySelector('#game-log .log-entries');
const gameBoard = document.getElementById('game-board');

// =========================================================================================
// E V E N T   L I S T E N E R S
// =========================================================================================

/**
 * Initializes all UI event listeners.
 */
function initializeUI() {
    rollDiceBtn.addEventListener('click', () => {
        const roll = rollDice();
        movePlayer(roll);
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
    // In a full implementation, you'd also update the board, property viewer, etc.
    // updateBoard(gameState.players);
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


// Initial call to setup the UI when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});