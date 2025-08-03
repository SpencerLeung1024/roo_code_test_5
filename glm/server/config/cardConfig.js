// Chance and Community Chest card configurations
// Contains all standard Monopoly cards

const Card = require('../models/Card');

class CardConfig {
    static getChanceCards() {
        return [
            // Movement cards
            new Card({
                id: 'chance_1',
                type: 'chance',
                text: 'Advance to Go (Collect $200)',
                action: 'move_to',
                moveTo: 0,
                value: 200,
                description: 'Move to Go and collect $200'
            }),
            
            new Card({
                id: 'chance_2',
                type: 'chance',
                text: 'Advance to Illinois Ave',
                action: 'move_to',
                moveTo: 24,
                description: 'Move to Illinois Avenue'
            }),
            
            new Card({
                id: 'chance_3',
                type: 'chance',
                text: 'Advance to St. Charles Place',
                action: 'move_to',
                moveTo: 11,
                description: 'Move to St. Charles Place'
            }),
            
            new Card({
                id: 'chance_4',
                type: 'chance',
                text: 'Advance to nearest Utility',
                action: 'move_to_nearest_utility',
                description: 'Move to nearest Utility'
            }),
            
            new Card({
                id: 'chance_5',
                type: 'chance',
                text: 'Advance to nearest Railroad',
                action: 'move_to_nearest_railroad',
                description: 'Move to nearest Railroad'
            }),
            
            new Card({
                id: 'chance_6',
                type: 'chance',
                text: 'Advance to nearest Railroad',
                action: 'move_to_nearest_railroad',
                description: 'Move to nearest Railroad'
            }),
            
            new Card({
                id: 'chance_7',
                type: 'chance',
                text: 'Advance to nearest Railroad',
                action: 'move_to_nearest_railroad',
                description: 'Move to nearest Railroad'
            }),
            
            new Card({
                id: 'chance_8',
                type: 'chance',
                text: 'Go Back 3 Spaces',
                action: 'move_back',
                value: 3,
                description: 'Move back 3 spaces'
            }),
            
            new Card({
                id: 'chance_9',
                type: 'chance',
                text: 'Go to Jail',
                action: 'go_to_jail',
                description: 'Go directly to Jail'
            }),
            
            // Money cards
            new Card({
                id: 'chance_10',
                type: 'chance',
                text: 'Bank pays you dividend of $50',
                action: 'receive_money',
                value: 50,
                description: 'Receive $50 from the bank'
            }),
            
            new Card({
                id: 'chance_11',
                type: 'chance',
                text: 'Your building loan matures. Collect $150',
                action: 'receive_money',
                value: 150,
                description: 'Collect $150 from the bank'
            }),
            
            new Card({
                id: 'chance_12',
                type: 'chance',
                text: 'You have won a crossword competition. Collect $100',
                action: 'receive_money',
                value: 100,
                description: 'Collect $100 from the bank'
            }),
            
            // Payment cards
            new Card({
                id: 'chance_13',
                type: 'chance',
                text: 'Pay poor tax of $15',
                action: 'pay_money',
                value: 15,
                description: 'Pay $15 to the bank'
            }),
            
            // Special cards
            new Card({
                id: 'chance_14',
                type: 'chance',
                text: 'Get Out of Jail Free',
                action: 'get_out_of_jail_free',
                description: 'Get Out of Jail Free card'
            }),
            
            new Card({
                id: 'chance_15',
                type: 'chance',
                text: 'Make general repairs on all your property',
                action: 'pay_per_house',
                value: { house: 25, hotel: 100 },
                description: 'Pay $25 per house and $100 per hotel'
            }),
            
            new Card({
                id: 'chance_16',
                type: 'chance',
                text: 'Speeding fine $15',
                action: 'pay_money',
                value: 15,
                description: 'Pay $15 speeding fine'
            }),
            
            // Property cards
            new Card({
                id: 'chance_17',
                type: 'chance',
                text: 'Take a trip to Reading Railroad',
                action: 'move_to',
                moveTo: 5,
                description: 'Move to Reading Railroad'
            }),
            
            new Card({
                id: 'chance_18',
                type: 'chance',
                text: 'Take a walk on the Boardwalk',
                action: 'move_to',
                moveTo: 39,
                description: 'Move to Boardwalk'
            }),
            
            // Movement around the board
            new Card({
                id: 'chance_19',
                type: 'chance',
                text: 'Advance to Go',
                action: 'move_to',
                moveTo: 0,
                description: 'Move to Go'
            }),
            
            new Card({
                id: 'chance_20',
                type: 'chance',
                text: 'Advance to Boardwalk',
                action: 'move_to',
                moveTo: 39,
                description: 'Move to Boardwalk'
            })
        ];
    }
    
    static getCommunityChestCards() {
        return [
            // Movement cards
            new Card({
                id: 'community_1',
                type: 'communityChest',
                text: 'Advance to Go (Collect $200)',
                action: 'move_to',
                moveTo: 0,
                value: 200,
                description: 'Move to Go and collect $200'
            }),
            
            new Card({
                id: 'community_2',
                type: 'communityChest',
                text: 'Go to Jail',
                action: 'go_to_jail',
                description: 'Go directly to Jail'
            }),
            
            // Money cards
            new Card({
                id: 'community_3',
                type: 'communityChest',
                text: 'Bank error in your favor. Collect $200',
                action: 'receive_money',
                value: 200,
                description: 'Collect $200 from the bank'
            }),
            
            new Card({
                id: 'community_4',
                type: 'communityChest',
                text: 'Doctor fee. Pay $50',
                action: 'pay_money',
                value: 50,
                description: 'Pay $50 to the bank'
            }),
            
            new Card({
                id: 'community_5',
                type: 'communityChest',
                text: 'From sale of stock you get $50',
                action: 'receive_money',
                value: 50,
                description: 'Collect $50 from the bank'
            }),
            
            new Card({
                id: 'community_6',
                type: 'communityChest',
                text: 'Holiday Fund matures. Receive $100',
                action: 'receive_money',
                value: 100,
                description: 'Collect $100 from the bank'
            }),
            
            new Card({
                id: 'community_7',
                type: 'communityChest',
                text: 'Income tax refund. Collect $20',
                action: 'receive_money',
                value: 20,
                description: 'Collect $20 from the bank'
            }),
            
            new Card({
                id: 'community_8',
                type: 'communityChest',
                text: 'Life insurance matures. Collect $100',
                action: 'receive_money',
                value: 100,
                description: 'Collect $100 from the bank'
            }),
            
            new Card({
                id: 'community_9',
                type: 'communityChest',
                text: 'Pay hospital fees of $100',
                action: 'pay_money',
                value: 100,
                description: 'Pay $100 to the bank'
            }),
            
            new Card({
                id: 'community_10',
                type: 'communityChest',
                text: 'Pay school fees of $150',
                action: 'pay_money',
                value: 150,
                description: 'Pay $150 to the bank'
            }),
            
            new Card({
                id: 'community_11',
                type: 'communityChest',
                text: 'Receive $25 consultancy fee',
                action: 'receive_money',
                value: 25,
                description: 'Collect $25 from the bank'
            }),
            
            new Card({
                id: 'community_12',
                type: 'communityChest',
                text: 'You have won second prize in a beauty contest. Collect $10',
                action: 'receive_money',
                value: 10,
                description: 'Collect $10 from the bank'
            }),
            
            new Card({
                id: 'community_13',
                type: 'communityChest',
                text: 'You inherit $100',
                action: 'receive_money',
                value: 100,
                description: 'Collect $100 from the bank'
            }),
            
            // Special cards
            new Card({
                id: 'community_14',
                type: 'communityChest',
                text: 'Get Out of Jail Free',
                action: 'get_out_of_jail_free',
                description: 'Get Out of Jail Free card'
            }),
            
            // Payment cards
            new Card({
                id: 'community_15',
                type: 'communityChest',
                text: 'Pay $50 for each house and $100 for each hotel you own',
                action: 'pay_per_house',
                value: { house: 50, hotel: 100 },
                description: 'Pay $50 per house and $100 per hotel'
            }),
            
            // Player-to-player payments
            new Card({
                id: 'community_16',
                type: 'communityChest',
                text: 'It is your birthday. Collect $10 from each player',
                action: 'collect_from_players',
                value: 10,
                description: 'Collect $10 from each player'
            })
        ];
    }
    
    static getCardActionHandlers() {
        return {
            // Movement actions
            'move_to': (card, player, game) => {
                const oldPosition = player.position;
                player.position = card.moveTo;
                
                // Check if player passed Go
                if (card.moveTo < oldPosition) {
                    player.receive(game.settings.goAmount);
                    game.eventHandler.emit('player:passed_go', {
                        playerId: player.id,
                        amount: game.settings.goAmount
                    });
                }
                
                // Handle landing on the new space
                const newSpace = game.board[player.position];
                game.handleLandingOnSpace(player, newSpace);
                
                return { success: true, message: `Moved to ${newSpace.name}` };
            },
            
            'move_back': (card, player, game) => {
                player.position = Math.max(0, player.position - card.value);
                const newSpace = game.board[player.position];
                game.handleLandingOnSpace(player, newSpace);
                
                return { success: true, message: `Moved back ${card.value} spaces to ${newSpace.name}` };
            },
            
            'move_to_nearest_utility': (card, player, game) => {
                const utilities = [12, 28]; // Electric Company and Water Works
                let nearestUtility = utilities.find(u => u > player.position);
                
                if (!nearestUtility) {
                    nearestUtility = utilities[0]; // Wrap around
                }
                
                const oldPosition = player.position;
                player.position = nearestUtility;
                
                // Check if player passed Go
                if (nearestUtility < oldPosition) {
                    player.receive(game.settings.goAmount);
                    game.eventHandler.emit('player:passed_go', {
                        playerId: player.id,
                        amount: game.settings.goAmount
                    });
                }
                
                // Double rent if owned by another player
                const utility = game.board[nearestUtility];
                if (utility.ownerId && utility.ownerId !== player.id) {
                    // This will be handled by the rent calculation
                    game.eventHandler.emit('player:landed_on_utility', {
                        playerId: player.id,
                        utilityId: utility.id,
                        doubleRent: true
                    });
                }
                
                return { success: true, message: `Moved to nearest utility: ${utility.name}` };
            },
            
            'move_to_nearest_railroad': (card, player, game) => {
                const railroads = [5, 15, 25, 35];
                let nearestRailroad = railroads.find(r => r > player.position);
                
                if (!nearestRailroad) {
                    nearestRailroad = railroads[0]; // Wrap around
                }
                
                const oldPosition = player.position;
                player.position = nearestRailroad;
                
                // Check if player passed Go
                if (nearestRailroad < oldPosition) {
                    player.receive(game.settings.goAmount);
                    game.eventHandler.emit('player:passed_go', {
                        playerId: player.id,
                        amount: game.settings.goAmount
                    });
                }
                
                // Double rent if owned by another player
                const railroad = game.board[nearestRailroad];
                if (railroad.ownerId && railroad.ownerId !== player.id) {
                    game.eventHandler.emit('player:landed_on_railroad', {
                        playerId: player.id,
                        railroadId: railroad.id,
                        doubleRent: true
                    });
                }
                
                return { success: true, message: `Moved to nearest railroad: ${railroad.name}` };
            },
            
            'go_to_jail': (card, player, game) => {
                game.jailManager.sendToJail(player, 'chance_card');
                return { success: true, message: 'Sent to jail by Chance card' };
            },
            
            // Money actions
            'receive_money': (card, player, game) => {
                player.receive(card.value);
                return { success: true, message: `Received $${card.value} from bank` };
            },
            
            'pay_money': (card, player, game) => {
                if (!player.canAfford(card.value)) {
                    // Handle bankruptcy if player can't pay
                    game.bankruptcyManager.declareBankruptcy(player, null, card.value);
                    return { success: false, message: `Player cannot afford to pay $${card.value}` };
                }
                
                player.pay(card.value);
                return { success: true, message: `Paid $${card.value} to bank` };
            },
            
            'pay_per_house': (card, player, game) => {
                let totalCost = 0;
                let houseCount = 0;
                let hotelCount = 0;
                
                player.properties.forEach(propertyId => {
                    const property = game.getPropertyById(propertyId);
                    if (property) {
                        if (property.buildings === 5) {
                            hotelCount++;
                            totalCost += card.value.hotel;
                        } else if (property.buildings > 0) {
                            houseCount++;
                            totalCost += card.value.house;
                        }
                    }
                });
                
                if (!player.canAfford(totalCost)) {
                    // Handle bankruptcy if player can't pay
                    game.bankruptcyManager.declareBankruptcy(player, null, totalCost);
                    return { success: false, message: `Player cannot afford to pay $${totalCost} for repairs` };
                }
                
                player.pay(totalCost);
                return { 
                    success: true, 
                    message: `Paid $${totalCost} for repairs (${houseCount} houses, ${hotelCount} hotels)` 
                };
            },
            
            'collect_from_players': (card, player, game) => {
                let totalCollected = 0;
                const playersWhoPaid = [];
                
                game.players.forEach(otherPlayer => {
                    if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                        if (otherPlayer.canAfford(card.value)) {
                            otherPlayer.pay(card.value);
                            player.receive(card.value);
                            totalCollected += card.value;
                            playersWhoPaid.push(otherPlayer.name);
                        }
                    }
                });
                
                return { 
                    success: true, 
                    message: `Collected $${totalCollected} from players: ${playersWhoPaid.join(', ')}` 
                };
            },
            
            'get_out_of_jail_free': (card, player, game) => {
                player.getOutOfJailCards++;
                return { success: true, message: 'Received Get Out of Jail Free card' };
            }
        };
    }
}

module.exports = CardConfig;