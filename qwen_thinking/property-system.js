import { gameState, updateState } from './game-state.js';

export function canBuildOnGroup(playerId, color) {
  const propertiesInGroup = gameState.boardSpaces.filter(space => 
    space.type === 'property' && space.color === color
  );
  return propertiesInGroup.every(space => 
    space.owner === playerId
  );
}

export function buildStructure(propertyId, type) {
  const property = gameState.boardSpaces[propertyId];
  if (!property || property.type !== 'property') {
    return { success: false, error: 'Invalid property' };
  }

  const player = gameState.players.find(p => p.id === property.owner);
  if (!player) {
    return { success: false, error: 'Property not owned' };
  }

  // Check if player owns all in group
  if (!canBuildOnGroup(player.id, property.color)) {
    return { success: false, error: 'Must own all properties in the color group' };
  }

  // Check building type
  if (type === 'house') {
    // Check house limit
    if (property.houses >= 4) {
      return { success: false, error: 'Maximum houses already built' };
    }
    
    // Check even building
    const groupProperties = gameState.boardSpaces.filter(space => 
      space.type === 'property' && space.color === property.color
    );
    const maxHouses = Math.max(...groupProperties.map(p => p.houses));
    if (property.houses < maxHouses - 1) {
      return { success: false, error: 'Must build evenly across the color group' };
    }
    
    // Check cost
    if (player.balance < property.buildCost) {
      return { success: false, error: 'Insufficient funds' };
    }
    
    // Deduct cost and add house
    const updatedPlayers = gameState.players.map(p => 
      p.id === player.id 
        ? { ...p, balance: p.balance - property.buildCost } 
        : p
    );
    
    const updatedSpaces = [...gameState.boardSpaces];
    updatedSpaces[propertyId] = { 
      ...property, 
      houses: property.houses + 1 
    };
    
    updateState({
      players: updatedPlayers,
      boardSpaces: updatedSpaces
    });
    
    return { success: true };
  } else if (type === 'hotel') {
    // Must have 4 houses to convert
    if (property.houses !== 4) {
      return { success: false, error: 'Need 4 houses to build a hotel' };
    }
    
    // Check cost (assuming same as house cost)
    if (player.balance < property.buildCost) {
      return { success: false, error: 'Insufficient funds' };
    }
    
    // Convert to hotel
    const updatedPlayers = gameState.players.map(p => 
      p.id === player.id 
        ? { ...p, balance: p.balance - property.buildCost } 
        : p
    );
    
    const updatedSpaces = [...gameState.boardSpaces];
    updatedSpaces[propertyId] = { 
      ...property, 
      houses: 0,
      hotels: 1
    };
    
    updateState({
      players: updatedPlayers,
      boardSpaces: updatedSpaces
    });
    
    return { success: true };
  }
  
  return { success: false, error: 'Invalid building type' };
}

export function calculateRentWithImprovements(property) {
  if (property.hotels > 0) {
    return property.rent * 5;
  } else if (property.houses > 0) {
    // 1 house = 2x, 2=3x, 3=4x, 4=5x
    return property.rent * (property.houses + 1);
  }
  return property.rent;
}