import { gameState, subscribe, updateState } from './game-state.js';
import { proposeTrade, handleTradeResponse } from './player-system.js';

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
  jailModal: null,
  tradeButton: null,
  buildButton: null,
  buildModal: null,
  groupSelect: null,
  buildPropertyGrid: null,
  buildCostDisplay: null,
  buildConfirmButton: null,
  buildCancelButton: null,
  tradeModal: null,
  tradePlayerSelect: null,
  offerProperties: null,
  requestProperties: null,
  offerMoney: null,
  requestMoney: null,
  proposeTradeButton: null,
  cancelTradeButton: null
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
  elements.tradeButton = document.getElementById('trade-button');
  elements.buildButton = document.getElementById('build-button');
  elements.buildModal = document.getElementById('build-modal');
  elements.groupSelect = document.getElementById('group-select');
  elements.buildPropertyGrid = document.getElementById('build-property-grid');
  elements.buildCostDisplay = document.getElementById('build-cost-display');
  elements.buildConfirmButton = document.getElementById('build-confirm');
  elements.buildCancelButton = document.getElementById('build-cancel');
  elements.tradeModal = document.getElementById('trade-modal');
  elements.tradePlayerSelect = document.getElementById('trade-player-select');
  elements.offerProperties = document.getElementById('offer-properties');
  elements.requestProperties = document.getElementById('request-properties');
  elements.offerMoney = document.getElementById('offer-money');
  elements.requestMoney = document.getElementById('request-money');
  elements.proposeTradeButton = document.getElementById('propose-trade');
  elements.cancelTradeButton = document.getElementById('cancel-trade');
  
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
  
  // Update board with building indicators
  updateBoardWithBuildings();
  
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
  elements.tradeButton.disabled = gameState.gamePhase !== 'rolling' || !currentPlayer.properties.length;
  elements.buildButton.disabled = gameState.gamePhase !== 'rolling' || !currentPlayer.properties.length;
}
 
// Building system implementation
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
        
        // Trigger game logic after animation completes
        const die1Value = parseInt(die1.textContent);
        const die2Value = parseInt(die2.textContent);
        const total = die1Value + die2Value;
        updateState({
          lastDiceTotal: total,
          gamePhase: 'moving'
        });
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

  // Trade functionality
  if (elements.tradeButton) {
    elements.tradeButton.addEventListener('click', () => {
      if (gameState.gamePhase !== 'rolling' || !gameState.players[gameState.currentPlayerIndex].properties.length) return;
      showTradeModal();
    });
  }
  
  // Building functionality
  if (elements.buildButton) {
    elements.buildButton.addEventListener('click', () => {
      if (gameState.gamePhase !== 'rolling') return;
      showBuildModal();
    });
  }
  
  if (elements.buildConfirmButton) {
    elements.buildConfirmButton.addEventListener('click', () => {
      const selectedProperty = document.querySelector('.build-property.selected');
      const buildType = document.querySelector('input[name="build-type"]:checked')?.value;
      
      if (!selectedProperty || !buildType) {
        showNotification('Please select a property and building type', 'error');
        return;
      }
      
      const propertyId = parseInt(selectedProperty.dataset.spaceIndex);
      const result = buildStructure(propertyId, buildType);
      
      if (result.success) {
        hideBuildModal();
        showNotification(`Successfully built ${buildType}!`, 'success');
        updateUI();
      } else {
        showNotification(`Build failed: ${result.error}`, 'error');
      }
    });
  }
  
  if (elements.buildCancelButton) {
    elements.buildCancelButton.addEventListener('click', () => {
      hideBuildModal();
    });
  }
  
  if (elements.groupSelect) {
    elements.groupSelect.addEventListener('change', () => {
      renderBuildPropertyGrid();
    });
  }
  
  if (elements.proposeTradeButton) {
    elements.proposeTradeButton.addEventListener('click', () => {
      const targetPlayerIndex = parseInt(elements.tradePlayerSelect.value);
      const offeredProperties = Array.from(elements.offerProperties.querySelectorAll('.selected-property'))
        .map(el => parseInt(el.dataset.spaceIndex));
      const offeredMoney = parseInt(elements.offerMoney.value) || 0;
      const requestedProperties = Array.from(elements.requestProperties.querySelectorAll('.selected-property'))
        .map(el => parseInt(el.dataset.spaceIndex));
      const requestedMoney = parseInt(elements.requestMoney.value) || 0;

      const result = proposeTrade(
        gameState.currentPlayerIndex,
        targetPlayerIndex,
        offeredProperties,
        offeredMoney,
        requestedProperties,
        requestedMoney
      );

      if (result.success) {
        hideTradeModal();
        showNotification('Trade proposal sent!', 'success');
      } else {
        showNotification(`Trade error: ${result.error}`, 'error');
      }
    });
  }

  if (elements.cancelTradeButton) {
    elements.cancelTradeButton.addEventListener('click', () => {
      hideTradeModal();
    });
  }
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

// Building system UI functions
export function showBuildModal() {
 // Populate color groups dropdown
 elements.groupSelect.innerHTML = '';
 
 const currentPlayer = gameState.players[gameState.currentPlayerIndex];
 const ownedProperties = currentPlayer.properties.map(idx => gameState.boardSpaces[idx]);
 
 // Get unique color groups where player owns all properties
 const fullGroups = new Set();
 ownedProperties.forEach(prop => {
   if (prop.type === 'property') {
     const groupProperties = gameState.boardSpaces.filter(s =>
       s.type === 'property' && s.color === prop.color
     );
     if (groupProperties.every(p => currentPlayer.properties.includes(gameState.boardSpaces.indexOf(p)))) {
       fullGroups.add(prop.color);
     }
   }
 });
 
 // Add options to dropdown
 fullGroups.forEach(color => {
   const option = document.createElement('option');
   option.value = color;
   option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
   elements.groupSelect.appendChild(option);
 });
 
 if (elements.groupSelect.options.length > 0) {
   elements.groupSelect.selectedIndex = 0;
   renderBuildPropertyGrid();
 } else {
   elements.buildPropertyGrid.innerHTML = '<p>No complete color groups to build on</p>';
 }
 
 elements.buildModal.style.display = 'flex';
}

function renderBuildPropertyGrid() {
 const color = elements.groupSelect.value;
 if (!color) return;
 
 elements.buildPropertyGrid.innerHTML = '';
 
 const groupProperties = gameState.boardSpaces
   .filter(space => space.type === 'property' && space.color === color)
   .map(space => ({
     ...space,
     index: gameState.boardSpaces.indexOf(space)
   }));
 
 groupProperties.forEach(property => {
   const propEl = document.createElement('div');
   propEl.className = 'build-property';
   propEl.dataset.spaceIndex = property.index;
   
   // Add selection click handler
   propEl.addEventListener('click', () => {
     document.querySelectorAll('.build-property').forEach(el => {
       el.classList.remove('selected');
     });
     propEl.classList.add('selected');
   });
   
   // Property name and status
   const status = property.hotels > 0
     ? '★'
     : '▲'.repeat(property.houses);
   
   propEl.innerHTML = `
     <div class="build-property-header">
       <span class="property-name">${property.name}</span>
       <span class="property-status">${status}</span>
     </div>
     <div class="build-options">
       ${property.houses < 4 && !property.hotels ?
         `<button class="build-type" data-type="house">+ House ($${property.buildCost})</button>` : ''}
       ${property.houses === 4 ?
         `<button class="build-type" data-type="hotel">+ Hotel ($${property.buildCost})</button>` : ''}
     </div>
   `;
   
   elements.buildPropertyGrid.appendChild(propEl);
 });
}

export function hideBuildModal() {
 elements.buildModal.style.display = 'none';
}

// Update UI to show building indicators
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
      // Add building indicators
      if (space.type === 'property') {
        const status = space.hotels > 0
          ? ' ★'
          : ' ' + '▲'.repeat(space.houses);
        propEl.textContent += status;
      }
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

// Update board cells to show building indicators
export function updateBoardWithBuildings() {
 document.querySelectorAll('.cell[data-index]').forEach(cell => {
   const index = parseInt(cell.dataset.index);
   const space = gameState.boardSpaces[index];
   
   if (space.type === 'property') {
     // Find the text node containing the property name
     const textNode = Array.from(cell.childNodes).find(node =>
       node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
     );
     
     if (textNode) {
       const baseName = space.name;
       let status = '';
       
       if (space.hotels > 0) {
         status = ' ★';
       } else if (space.houses > 0) {
         status = ' ' + '▲'.repeat(space.houses);
       }
       
       textNode.textContent = baseName + status;
     }
   }
 });
}

export function showTradeModal() {
  // Populate player dropdown (excluding current player)
  elements.tradePlayerSelect.innerHTML = '';
  gameState.players.forEach((player, index) => {
    if (index !== gameState.currentPlayerIndex) {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = player.name;
      elements.tradePlayerSelect.appendChild(option);
    }
  });

  // Clear previous selections
  elements.offerProperties.innerHTML = '';
  elements.requestProperties.innerHTML = '';
  elements.offerMoney.value = '0';
  elements.requestMoney.value = '0';

  // Populate property grids
  renderTradePropertyGrid(elements.offerProperties, gameState.players[gameState.currentPlayerIndex].properties);
  renderTradePropertyGrid(elements.requestProperties, []);

  elements.tradeModal.style.display = 'flex';
}

export function hideTradeModal() {
  elements.tradeModal.style.display = 'none';
}

function renderTradePropertyGrid(container, propertyIndices) {
  container.innerHTML = '';
  propertyIndices.forEach(spaceIndex => {
    const space = gameState.boardSpaces[spaceIndex];
    const propEl = document.createElement('div');
    propEl.className = 'trade-property';
    propEl.dataset.spaceIndex = spaceIndex;
    propEl.textContent = space.name;
    propEl.addEventListener('click', () => {
      propEl.classList.toggle('selected-property');
    });
    container.appendChild(propEl);
  });
}