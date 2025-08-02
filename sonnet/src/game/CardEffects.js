// Card effect execution system for Monopoly cards
// Handles all card actions and integrates with game state

import { BOARD_SPACES } from '../data/boardData.js';

export class CardEffects {
  constructor(gameState, gameActions) {
    this.gameState = gameState;
    this.gameActions = gameActions;
  }

  // Execute a card's effect
  async executeCardEffect(card, playerId) {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) {
      console.error('Player not found for card effect:', playerId);
      return { success: false, error: 'Player not found' };
    }

    console.log(`Executing card effect: ${card.title} for ${player.name}`);

    try {
      let result;
      
      switch (card.action) {
        // Movement actions
        case 'moveToSpace':
          result = await this.moveToSpace(player, card);
          break;
        case 'moveRelative':
          result = await this.moveRelative(player, card);
          break;
        case 'moveToNearestUtility':
          result = await this.moveToNearestUtility(player, card);
          break;
        case 'moveToNearestRailroad':
          result = await this.moveToNearestRailroad(player, card);
          break;

        // Money actions
        case 'receiveMoney':
          result = this.receiveMoney(player, card);
          break;
        case 'payMoney':
          result = this.payMoney(player, card);
          break;
        case 'receiveFromEachPlayer':
          result = this.receiveFromEachPlayer(player, card);
          break;
        case 'payEachPlayer':
          result = this.payEachPlayer(player, card);
          break;

        // Property actions
        case 'payPerProperty':
          result = this.payPerProperty(player, card);
          break;

        // Special actions
        case 'getOutOfJailFree':
          result = this.getOutOfJailFree(player, card);
          break;
        case 'goToJail':
          result = await this.goToJail(player, card);
          break;

        default:
          console.error('Unknown card action:', card.action);
          result = { success: false, error: 'Unknown card action' };
      }

      // Add effect to game history
      this.addCardEffectToHistory(card, player, result);

      return result;
    } catch (error) {
      console.error('Error executing card effect:', error);
      return { success: false, error: error.message };
    }
  }

  // === MOVEMENT ACTIONS ===

  async moveToSpace(player, card) {
    const currentPosition = player.position;
    const targetPosition = card.targetPosition;
    
    // Check if passing GO
    const passedGO = card.collectGoBonus && (targetPosition < currentPosition || targetPosition === 0);
    
    if (passedGO && targetPosition !== 0) {
      this.gameActions.collectSalary(player.id);
      this.addMessage(`${player.name} passed GO and collected $200`);
    }
    
    // Use existing movement system
    const movementResult = await this.gameActions.movePlayerWithAnimation(
      player.id, 
      this.calculateSpacesToMove(currentPosition, targetPosition)
    );
    
    if (movementResult.success) {
      this.addMessage(`${player.name} moves to ${BOARD_SPACES[targetPosition].name}`);
      
      // Handle landing effects after movement animation completes
      setTimeout(() => {
        this.gameActions.completeMovementAnimation(player.id);
        this.handleLandingEffect(player.id, targetPosition);
      }, 1500); // Wait for animation
    }
    
    return movementResult;
  }

  async moveRelative(player, card) {
    const currentPosition = player.position;
    const spacesToMove = card.effectValue;
    const newPosition = (currentPosition + spacesToMove + 40) % 40;
    
    // Check if passing GO (only when moving forward)
    if (spacesToMove > 0 && newPosition < currentPosition) {
      this.gameActions.collectSalary(player.id);
      this.addMessage(`${player.name} passed GO and collected $200`);
    }
    
    const movementResult = await this.gameActions.movePlayerWithAnimation(player.id, Math.abs(spacesToMove));
    
    if (movementResult.success) {
      const direction = spacesToMove > 0 ? 'forward' : 'backward';
      this.addMessage(`${player.name} moves ${Math.abs(spacesToMove)} spaces ${direction} to ${BOARD_SPACES[newPosition].name}`);
      
      // Handle landing effects
      setTimeout(() => {
        this.gameActions.completeMovementAnimation(player.id);
        this.handleLandingEffect(player.id, newPosition);
      }, 1500);
    }
    
    return movementResult;
  }

  async moveToNearestUtility(player, card) {
    const utilities = [12, 28]; // Electric Company, Water Works
    const currentPos = player.position;
    
    // Find nearest utility
    const nearestUtility = utilities.reduce((nearest, utility) => {
      const distance1 = (utility - currentPos + 40) % 40;
      const distance2 = (nearest - currentPos + 40) % 40;
      return distance1 < distance2 ? utility : nearest;
    });
    
    // Check if passing GO
    if (nearestUtility < currentPos) {
      this.gameActions.collectSalary(player.id);
      this.addMessage(`${player.name} passed GO and collected $200`);
    }
    
    // Move to utility
    const spacesToMove = this.calculateSpacesToMove(currentPos, nearestUtility);
    const movementResult = await this.gameActions.movePlayerWithAnimation(player.id, spacesToMove);
    
    if (movementResult.success) {
      this.addMessage(`${player.name} moves to ${BOARD_SPACES[nearestUtility].name}`);
      
      // Handle special rent if owned
      setTimeout(() => {
        this.gameActions.completeMovementAnimation(player.id);
        this.handleUtilitySpecialRent(player.id, nearestUtility, card.rentMultiplier);
      }, 1500);
    }
    
    return movementResult;
  }

  async moveToNearestRailroad(player, card) {
    const railroads = [5, 15, 25, 35]; // Reading, Pennsylvania, B&O, Short Line
    const currentPos = player.position;
    
    // Find nearest railroad
    const nearestRailroad = railroads.reduce((nearest, railroad) => {
      const distance1 = (railroad - currentPos + 40) % 40;
      const distance2 = (nearest - currentPos + 40) % 40;
      return distance1 < distance2 ? railroad : nearest;
    });
    
    // Check if passing GO
    if (nearestRailroad < currentPos) {
      this.gameActions.collectSalary(player.id);
      this.addMessage(`${player.name} passed GO and collected $200`);
    }
    
    // Move to railroad
    const spacesToMove = this.calculateSpacesToMove(currentPos, nearestRailroad);
    const movementResult = await this.gameActions.movePlayerWithAnimation(player.id, spacesToMove);
    
    if (movementResult.success) {
      this.addMessage(`${player.name} moves to ${BOARD_SPACES[nearestRailroad].name}`);
      
      // Handle special rent if owned
      setTimeout(() => {
        this.gameActions.completeMovementAnimation(player.id);
        this.handleRailroadSpecialRent(player.id, nearestRailroad, card.rentMultiplier);
      }, 1500);
    }
    
    return movementResult;
  }

  // === MONEY ACTIONS ===

  receiveMoney(player, card) {
    const amount = card.effectValue;
    player.money += amount;
    this.gameState.bank.money -= amount;
    
    this.addMessage(`${player.name} receives $${amount} from the bank`);
    
    return { success: true, amount, action: 'received' };
  }

  payMoney(player, card) {
    const amount = card.effectValue;
    
    if (player.money >= amount) {
      player.money -= amount;
      this.gameState.bank.money += amount;
      this.addMessage(`${player.name} pays $${amount} to the bank`);
      return { success: true, amount, action: 'paid' };
    } else {
      // Handle insufficient funds
      this.addMessage(`${player.name} cannot afford to pay $${amount}`);
      this.gameActions.handleInsufficientFunds(player.id, amount);
      return { success: false, amount, reason: 'insufficient_funds' };
    }
  }

  receiveFromEachPlayer(player, card) {
    const amountPerPlayer = card.effectValue;
    const otherPlayers = this.gameState.players.filter(p => p.id !== player.id && p.isActive && !p.isBankrupt);
    let totalReceived = 0;
    
    otherPlayers.forEach(otherPlayer => {
      const amount = Math.min(amountPerPlayer, otherPlayer.money);
      otherPlayer.money -= amount;
      player.money += amount;
      totalReceived += amount;
      
      // Update statistics
      otherPlayer.stats.rentPaid += amount;
      player.stats.rentCollected += amount;
    });
    
    this.addMessage(`${player.name} receives $${totalReceived} from other players ($${amountPerPlayer} each)`);
    
    return { success: true, totalReceived, amountPerPlayer, playersCount: otherPlayers.length };
  }

  payEachPlayer(player, card) {
    const amountPerPlayer = card.effectValue;
    const otherPlayers = this.gameState.players.filter(p => p.id !== player.id && p.isActive && !p.isBankrupt);
    const totalToPay = otherPlayers.length * amountPerPlayer;
    
    if (player.money >= totalToPay) {
      otherPlayers.forEach(otherPlayer => {
        player.money -= amountPerPlayer;
        otherPlayer.money += amountPerPlayer;
        
        // Update statistics
        player.stats.rentPaid += amountPerPlayer;
        otherPlayer.stats.rentCollected += amountPerPlayer;
      });
      
      this.addMessage(`${player.name} pays $${amountPerPlayer} to each player (total: $${totalToPay})`);
      return { success: true, totalPaid: totalToPay, amountPerPlayer, playersCount: otherPlayers.length };
    } else {
      this.addMessage(`${player.name} cannot afford to pay $${totalToPay} to other players`);
      this.gameActions.handleInsufficientFunds(player.id, totalToPay);
      return { success: false, totalToPay, reason: 'insufficient_funds' };
    }
  }

  // === PROPERTY ACTIONS ===

  payPerProperty(player, card) {
    const houseCount = player.houses || 0;
    const hotelCount = player.hotels || 0;
    
    const houseFee = houseCount * card.perHouseAmount;
    const hotelFee = hotelCount * card.perHotelAmount;
    const totalFee = houseFee + hotelFee;
    
    if (totalFee === 0) {
      this.addMessage(`${player.name} has no houses or hotels to pay for`);
      return { success: true, totalFee: 0, houseCount, hotelCount };
    }
    
    if (player.money >= totalFee) {
      player.money -= totalFee;
      this.gameState.bank.money += totalFee;
      
      this.addMessage(`${player.name} pays $${totalFee} (${houseCount} houses × $${card.perHouseAmount} + ${hotelCount} hotels × $${card.perHotelAmount})`);
      return { success: true, totalFee, houseCount, hotelCount, houseFee, hotelFee };
    } else {
      this.addMessage(`${player.name} cannot afford property repairs of $${totalFee}`);
      this.gameActions.handleInsufficientFunds(player.id, totalFee);
      return { success: false, totalFee, reason: 'insufficient_funds' };
    }
  }

  // === SPECIAL ACTIONS ===

  getOutOfJailFree(player, card) {
    player.getOutOfJailCards++;
    this.addMessage(`${player.name} receives a "Get Out of Jail Free" card`);
    
    return { success: true, action: 'jail_card_received' };
  }

  async goToJail(player, card) {
    const result = await this.gameActions.sendToJailWithAnimation(player.id, 'card');
    
    // Reset doubles count
    this.gameState.dice.doublesCount = 0;
    
    return result;
  }

  // === HELPER METHODS ===

  calculateSpacesToMove(fromPosition, toPosition) {
    if (toPosition >= fromPosition) {
      return toPosition - fromPosition;
    } else {
      return (40 - fromPosition) + toPosition;
    }
  }

  handleLandingEffect(playerId, position) {
    const space = BOARD_SPACES[position];
    const spaceAction = this.gameActions.getSpaceAction(space);
    
    if (spaceAction) {
      // Process the landing effect through the existing system
      this.gameActions.handlePlayerAction({
        type: spaceAction.action,
        playerId,
        data: spaceAction.data
      });
    }
  }

  handleUtilitySpecialRent(playerId, utilityPosition, rentMultiplier) {
    const utility = this.gameState.utilities[utilityPosition];
    const player = this.gameState.players.find(p => p.id === playerId);
    
    if (utility && utility.ownerId && utility.ownerId !== playerId) {
      const diceTotal = this.gameState.dice.total;
      const specialRent = diceTotal * rentMultiplier;
      
      if (player.money >= specialRent) {
        player.money -= specialRent;
        const owner = this.gameState.players.find(p => p.id === utility.ownerId);
        if (owner) {
          owner.money += specialRent;
          
          // Update statistics
          player.stats.rentPaid += specialRent;
          owner.stats.rentCollected += specialRent;
        }
        
        this.addMessage(`${player.name} pays $${specialRent} rent (${rentMultiplier}× dice roll of ${diceTotal})`);
      } else {
        this.gameActions.handleInsufficientFunds(playerId, specialRent);
      }
    } else if (!utility.ownerId) {
      // Property is unowned, player may purchase
      this.addMessage(`${BOARD_SPACES[utilityPosition].name} is available for purchase`);
    }
  }

  handleRailroadSpecialRent(playerId, railroadPosition, rentMultiplier) {
    const railroad = this.gameState.railroads[railroadPosition];
    const player = this.gameState.players.find(p => p.id === playerId);
    
    if (railroad && railroad.ownerId && railroad.ownerId !== playerId) {
      const normalRent = railroad.currentRent;
      const specialRent = normalRent * rentMultiplier;
      
      if (player.money >= specialRent) {
        player.money -= specialRent;
        const owner = this.gameState.players.find(p => p.id === railroad.ownerId);
        if (owner) {
          owner.money += specialRent;
          
          // Update statistics
          player.stats.rentPaid += specialRent;
          owner.stats.rentCollected += specialRent;
        }
        
        this.addMessage(`${player.name} pays $${specialRent} rent (${rentMultiplier}× normal rent of $${normalRent})`);
      } else {
        this.gameActions.handleInsufficientFunds(playerId, specialRent);
      }
    } else if (!railroad.ownerId) {
      // Property is unowned, player may purchase
      this.addMessage(`${BOARD_SPACES[railroadPosition].name} is available for purchase`);
    }
  }

  addMessage(message) {
    this.gameState.history.push({
      message,
      timestamp: new Date(),
      type: 'card_effect'
    });
    
    console.log(`Card Effect: ${message}`);
  }

  addCardEffectToHistory(card, player, result) {
    this.gameState.history.push({
      type: 'card_effect',
      card: { ...card },
      player: { id: player.id, name: player.name },
      result: { ...result },
      timestamp: new Date()
    });
  }

  // Validate if card effect can be executed
  canExecuteCard(card, playerId) {
    const player = this.gameState.players.find(p => p.id === playerId);
    
    if (!player || !player.isActive || player.isBankrupt) {
      return { canExecute: false, reason: 'Player not active' };
    }

    // Check specific card requirements
    switch (card.action) {
      case 'payMoney':
      case 'payEachPlayer':
      case 'payPerProperty':
        // These require money, but we'll handle insufficient funds gracefully
        return { canExecute: true };
      
      default:
        return { canExecute: true };
    }
  }
}

// Factory function to create CardEffects instance
export function createCardEffects(gameState, gameActions) {
  return new CardEffects(gameState, gameActions);
}

export default CardEffects;