import { gameState, updateState } from './game-state.js';
import { drawCard } from './card-system.js';
import { calculateRentWithImprovements } from './property-system.js';

export function movePlayer(playerId, spaces) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return { newPosition: 0, passedGo: false };
    
    const oldPosition = player.position;
    const newPosition = (oldPosition + spaces) % 40;
    const passedGo = (oldPosition + spaces) >= 40;
    
    // Update position and handle GO bonus
    const updates = {
        players: gameState.players.map(p => 
            p.id === playerId 
                ? { ...p, position: newPosition } 
                : p
        )
    };
    
    if (passedGo) {
        updates.players = updates.players.map(p =>
            p.id === playerId 
                ? { ...p, balance: p.balance + 200 } 
                : p
        );
        console.log(`[BOARD] Player ${playerId} passed GO, +$200`);
    }
    
    updateState(updates);
    return { newPosition, passedGo };
}

export function handleSpaceInteraction(playerId, spaceIndex) {
    const space = gameState.boardSpaces[spaceIndex];
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) return;
    
    console.log(`[BOARD] Handling space ${spaceIndex}: ${space.name} (${space.type})`);
    
    switch (space.type) {
        case 'tax':
            updateState({
                players: gameState.players.map(p => 
                    p.id === playerId 
                        ? { ...p, balance: p.balance - space.amount } 
                        : p
                )
            });
            console.log(`[BOARD] Player ${playerId} paid tax: $${space.amount}`);
            break;
            
        case 'jail':
            // Handle jail entry (separate from "Just Visiting")
            if (spaceIndex === 10 && player.position !== 10) {
                updateState({
                    players: gameState.players.map(p => 
                        p.id === playerId 
                            ? { ...p, position: 10, inJail: true, jailTurns: 0 } 
                            : p
                    )
                });
                console.log(`[BOARD] Player ${playerId} sent to jail`);
            }
            break;
            
        case 'go_to_jail':
            updateState({
                players: gameState.players.map(p => 
                    p.id === playerId 
                        ? { ...p, position: 10, inJail: true, jailTurns: 0 } 
                        : p
                )
            });
            console.log(`[BOARD] Player ${playerId} sent to jail from Go To Jail`);
            break;
            
        case 'free_parking':
            updateState({
                players: gameState.players.map(p => 
                    p.id === playerId 
                        ? { ...p, balance: p.balance + 100 } 
                        : p
                )
            });
            console.log(`[BOARD] Player ${playerId} collected $100 from Free Parking`);
            break;
            
        case 'property':
        case 'railroad':
        case 'utility':
            if (space.owner === undefined) {
                // Property purchase validation (fix duplication bug)
                updateState({ 
                    currentAction: 'purchasePrompt', 
                    currentSpace: spaceIndex 
                });
                console.log(`[BOARD] Purchase opportunity for ${space.name}`);
            } else if (space.owner !== playerId) {
                // Rent payment logic
                const owner = gameState.players.find(p => p.id === space.owner);
                let rent = 0;
                
                if (space.type === 'railroad') {
                    const railroadCount = owner.properties.filter(p => 
                        gameState.boardSpaces[p].type === 'railroad'
                    ).length;
                    rent = space.baseRent * railroadCount;
                } else if (space.type === 'utility') {
                    const utilityCount = owner.properties.filter(p => 
                        gameState.boardSpaces[p].type === 'utility'
                    ).length;
                    const multiplier = utilityCount === 2 ? 10 : 4;
                    rent = multiplier * gameState.lastDiceTotal;
                } else {
                    rent = calculateRentWithImprovements(space);
                }
                
                updateState({
                    players: gameState.players.map(p => {
                        if (p.id === playerId) return { ...p, balance: p.balance - rent };
                        if (p.id === owner.id) return { ...p, balance: p.balance + rent };
                        return p;
                    })
                });
                console.log(`[BOARD] Player ${playerId} paid $${rent} to player ${owner.id}`);
            }
            break;
            
        case 'chance':
            {
                const { card } = drawCard('chance');
                updateState({
                    currentAction: 'cardDrawn',
                    currentCardText: card.text,
                    currentCardEffect: card.effect
                });
                console.log(`[CARD] Drew Chance card: ${card.text}`);
            }
            break;
        case 'community_chest':
            {
                const { card } = drawCard('community');
                updateState({
                    currentAction: 'cardDrawn',
                    currentCardText: card.text,
                    currentCardEffect: card.effect
                });
                console.log(`[CARD] Drew Community Chest card: ${card.text}`);
            }
            break;
            
        default:
            console.log(`[BOARD] Unhandled space type: ${space.type}`);
    }
}

export function purchaseProperty(playerId, spaceIndex) {
    const player = gameState.players.find(p => p.id === playerId);
    const space = gameState.boardSpaces[spaceIndex];
    
    if (!player || !space || space.owner !== undefined) {
        console.error(`[BOARD] Invalid purchase attempt for space ${spaceIndex}`);
        return false;
    }
    
    if (player.balance < space.price) {
        console.log(`[BOARD] Player ${playerId} cannot afford ${space.name}`);
        return false;
    }
    
    // Update ownership
    const updatedSpaces = [...gameState.boardSpaces];
    updatedSpaces[spaceIndex] = { ...space, owner: playerId };
    
    // Update player properties
    const updatedPlayers = gameState.players.map(p => 
        p.id === playerId 
            ? { 
                ...p, 
                balance: p.balance - space.price,
                properties: [...p.properties, spaceIndex] 
              } 
            : p
    );
    
    updateState({
        boardSpaces: updatedSpaces,
        players: updatedPlayers,
        currentAction: null
    });
    
    console.log(`[BOARD] Player ${playerId} purchased ${space.name} for $${space.price}`);
    return true;
}