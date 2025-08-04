import { gameState, subscribe } from './game-state.js';

// DOM Elements cache
const elements = {
  currentPlayerEl: null,
  balanceEl: null,
  propertiesEl: null,
  rollButton: null,
  buyButton: null,
  endTurnButton: null,
  notifications: null,
  purchaseModal: null,
  cardModal: null,
  jailModal: null
};

export function initializeUI() {
  // Cache DOM elements
  elements.currentPlayerEl = document.getElementById('current-player');
  elements.balanceEl = document.getElementById('balance');
  elements.propertiesEl = document.getElementById('properties');
  elements.rollButton = document.getElementById('roll-dice');
  elements.buyButton = document.getElementById('buy-property');
  elements.endTurnButton = document.getElementById('end-turn');
  elements.notifications = document.getElementById('notifications');
  elements.purchaseModal = document.getElementById('purchase-modal');
  elements.cardModal = document.getElementById('card-modal');
  elements.jailModal = document.getElementById('jail-modal');
  
  // Set initial state
  updateUI();
  
  // Setup event listeners
  setupEventListeners();
  
  // Subscribe to state changes
  subscribe('stateUpdated', (updates) => {
    console.log('[UI] State updated:', updates);
    updateUI();
    
    // Handle specific state changes
    if (updates.currentAction === 'purchasePrompt') {
      showPurchaseModal(updates.currentSpace);
    } else if (updates.currentAction === 'cardDrawn') {
      showCardModal(updates.currentCardText);
    }
  });
}

function updateUI() {
  if (!gameState.players.length) return;
  
  // Update all players panel
  updateAllPlayersPanel();
  
  // Render player tokens on board
  renderPlayerTokens();
  
  // Highlight current position
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('current-position');
  });
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentCell = document.querySelector(`.cell[data-index="${currentPlayer.position}"]`);
  if (currentCell) {
    currentCell.classList.add('current-position');
    highlightBoardPosition(currentPlayer.position);
  }
  
  // Update button states
  elements.rollButton.disabled = gameState.gamePhase !== 'rolling';
  elements.buyButton.disabled = gameState.currentAction !== 'purchasePrompt';
  elements.endTurnButton.disabled = gameState.gamePhase === 'rolling';
}

function setupEventListeners() {
  elements.rollButton.addEventListener('click', () => {
    if (gameState.gamePhase !== 'rolling') return;
    
    // Simulate dice roll animation
    const diceContainer = document.querySelector('.dice-container');
    diceContainer.classList.add('rolling');
    
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');
    
    let rolls = 5;
    const interval = setInterval(() => {
      if (rolls-- > 0) {
        die1.textContent = Math.floor(Math.random() * 6) + 1;
        die2.textContent = Math.floor(Math.random() * 6) + 1;
      } else {
        clearInterval(interval);
        diceContainer.classList.remove('rolling');
      }
    }, 100);
  });
  
  elements.buyButton.addEventListener('click', () => {
    if (gameState.currentAction === 'purchasePrompt') {
      hidePurchaseModal();
      // Purchase will be handled by board-logic
    }
  });
  
  elements.endTurnButton.addEventListener('click', () => {
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    // This will be handled by game logic
  });
  
  // Modal event handlers
  document.getElementById('buy-yes')?.addEventListener('click', () => {
    hidePurchaseModal();
  });
  
  document.getElementById('buy-no')?.addEventListener('click', () => {
    hidePurchaseModal();
  });
  
  document.getElementById('card-ok')?.addEventListener('click', () => {
    if (gameState.currentCardEffect) {
      const playerId = gameState.players[gameState.currentPlayerIndex].id;
      gameState.currentCardEffect(playerId);
    }
    elements.cardModal.style.display = 'none';
    updateState({
      currentAction: null,
      currentCardText: null,
      currentCardEffect: null
    });
  });
  
  document.getElementById('jail-roll')?.addEventListener('click', () => {
    elements.jailModal.style.display = 'none';
    // Handle jail roll in game logic
  });
  
  document.getElementById('jail-pay')?.addEventListener('click', () => {
    elements.jailModal.style.display = 'none';
    // Handle jail payment in game logic
  });
}

export function highlightBoardPosition(spaceIndex) {
  const cell = document.querySelector(`.cell[data-index="${spaceIndex}"]`);
  if (cell) {
    cell.classList.add('cell-highlight');
    setTimeout(() => {
      cell.classList.remove('cell-highlight');
    }, 600);
  }
}

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.setAttribute('aria-live', 'polite');
  notification.setAttribute('role', 'alert');
  notification.textContent = message;
  
  elements.notifications.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showPurchaseModal(spaceIndex) {
  const space = gameState.boardSpaces[spaceIndex];
  document.getElementById('property-name').textContent = space.name;
  document.getElementById('property-price').textContent = space.price;
  elements.purchaseModal.style.display = 'flex';
}

function hidePurchaseModal() {
  elements.purchaseModal.style.display = 'none';
}

export function showJailModal() {
  elements.jailModal.style.display = 'flex';
}

export function showCardModal(text) {
  document.getElementById('card-text').textContent = text;
  elements.cardModal.style.display = 'flex';
}
export function renderPlayerTokens() {
  // Clear all token containers
  document.querySelectorAll('.token-container').forEach(container => {
    container.innerHTML = '';
  });

  // Group players by position
  const playersByPosition = {};
  gameState.players.forEach(player => {
    if (!playersByPosition[player.position]) {
      playersByPosition[player.position] = [];
    }
    playersByPosition[player.position].push(player);
  });

  // Render tokens for each position
  Object.keys(playersByPosition).forEach(position => {
    const cell = document.querySelector(`.cell[data-index="${position}"]`);
    if (cell) {
      const tokenContainer = cell.querySelector('.token-container');
      if (tokenContainer) {
        const playersHere = playersByPosition[position];
        playersHere.forEach((player, index) => {
          const token = document.createElement('div');
          token.className = `player-token player-${player.id}`;
          token.style.color = player.color;
          token.textContent = '●';
          // Position tokens to avoid overlap
          token.style.position = 'absolute';
          token.style.left = `${index * 15}px`;
          token.style.top = `${index * 15}px`;
          tokenContainer.appendChild(token);
        });
      }
    }
  });
}

export function updateAllPlayersPanel() {
  const playersList = document.getElementById('players-list');
  if (!playersList) return;

  playersList.innerHTML = '';

  gameState.players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = `player-item ${player.id === gameState.currentPlayerIndex ? 'current-player' : ''}`;
    
    // Color indicator
    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'color-indicator';
    colorIndicator.style.backgroundColor = player.color;
    
    // Properties list (initially hidden)
    const propertiesList = document.createElement('div');
    propertiesList.className = 'properties-list';
    propertiesList.style.display = 'none';
    
    player.properties.forEach(spaceIndex => {
      const space = gameState.boardSpaces[spaceIndex];
      const propEl = document.createElement('div');
      propEl.textContent = space.name;
      propEl.className = `property ${space.color}`;
      propertiesList.appendChild(propEl);
    });
    
    // Toggle properties on click
    playerItem.addEventListener('click', () => {
      propertiesList.style.display = propertiesList.style.display === 'none' ? 'block' : 'none';
    });
    
    playerItem.innerHTML = `
      <div class="player-header">
        ${colorIndicator.outerHTML}
        <span class="player-name">${player.name}</span>
        <span class="player-balance">$${player.balance}</span>
        <span class="property-count">(${player.properties.length} props)</span>
      </div>
    `;
    playerItem.appendChild(propertiesList);
    
    playersList.appendChild(playerItem);
  });
}