import { gameState, updateState } from './game-state.js';

/**
 * Proposes a trade between players with validation checks
 * @param {number} currentPlayerIndex - Index of player initiating trade
 * @param {number} targetPlayerIndex - Index of player receiving trade
 * @param {number[]} offeredProperties - Space indices of properties offered
 * @param {number} offeredMoney - Amount of money offered
 * @param {number[]} requestedProperties - Space indices of properties requested
 * @param {number} requestedMoney - Amount of money requested
 * @returns {Object} Validation result with success status and error message
 */
export function proposeTrade(currentPlayerIndex, targetPlayerIndex, offeredProperties, offeredMoney, requestedProperties, requestedMoney) {
  const currentPlayer = gameState.players[currentPlayerIndex];
  const targetPlayer = gameState.players[targetPlayerIndex];

  // Validate current player owns all offered properties
  for (const prop of offeredProperties) {
    if (!currentPlayer.properties.includes(prop)) {
      return { success: false, error: 'You do not own all offered properties' };
    }
  }

  // Validate sufficient funds for offered money
  if (currentPlayer.balance < offeredMoney) {
    return { success: false, error: 'Insufficient funds for offered money' };
  }

  // Validate target player owns all requested properties
  for (const prop of requestedProperties) {
    if (!targetPlayer.properties.includes(prop)) {
      return { success: false, error: 'Target player does not own all requested properties' };
    }
  }

  // Validate target player has sufficient funds for requested money
  if (targetPlayer.balance < requestedMoney) {
    return { success: false, error: 'Target player has insufficient funds for requested money' };
  }

  // Check trade cooldown
  if (gameState.hasTradedThisTurn) {
    return { success: false, error: 'You can only trade once per turn' };
  }

  // Create trade proposal
  const tradeProposal = {
    from: currentPlayerIndex,
    to: targetPlayerIndex,
    offered: { properties: offeredProperties, money: offeredMoney },
    requested: { properties: requestedProperties, money: requestedMoney },
    status: 'pending'
  };

  // Update game state
  updateState({
    currentTrade: tradeProposal,
    gamePhase: 'trading'
  });

  return { success: true };
}

/**
 * Executes a validated trade between players
 * @param {Object} trade - Trade proposal object
 */
export function executeTrade(trade) {
  const fromPlayer = gameState.players[trade.from];
  const toPlayer = gameState.players[trade.to];

  // Transfer properties
  trade.offered.properties.forEach(prop => {
    fromPlayer.properties = fromPlayer.properties.filter(p => p !== prop);
    toPlayer.properties.push(prop);
  });

  trade.requested.properties.forEach(prop => {
    toPlayer.properties = toPlayer.properties.filter(p => p !== prop);
    fromPlayer.properties.push(prop);
  });

  // Transfer money
  fromPlayer.balance = fromPlayer.balance - trade.offered.money + trade.requested.money;
  toPlayer.balance = toPlayer.balance + trade.offered.money - trade.requested.money;

  // Update game state
  updateState({
    players: [...gameState.players],
    gamePhase: 'rolling',
    currentTrade: null,
    hasTradedThisTurn: true
  });

  // Add to transaction history
  if (!gameState.transactionHistory) {
    gameState.transactionHistory = [];
  }
  gameState.transactionHistory.push({
    type: 'trade',
    from: fromPlayer.name,
    to: toPlayer.name,
    properties: [...trade.offered.properties, ...trade.requested.properties],
    money: trade.offered.money - trade.requested.money,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handles target player's response to trade proposal
 * @param {boolean} accept - Whether the target player accepts the trade
 * @returns {Object} Result of trade response handling
 */
export function handleTradeResponse(accept) {
  if (!gameState.currentTrade) {
    return { success: false, error: 'No active trade proposal' };
  }

  if (accept) {
    executeTrade(gameState.currentTrade);
    return { success: true, message: 'Trade accepted' };
  } else {
    updateState({
      currentTrade: null,
      gamePhase: 'rolling'
    });
    return { success: true, message: 'Trade declined' };
  }
}