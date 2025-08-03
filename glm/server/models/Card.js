class Card {
    constructor(data) {
        this.id = data.id;
        this.type = data.type; // 'chance', 'communityChest'
        this.text = data.text;
        this.action = data.action;
        this.value = data.value || 0;
        this.moveTo = data.moveTo || null;
        this.description = data.description;
        this.keepCard = data.keepCard || false;
    }
    
    execute(player, game) {
        game.logMessage(`${player.name} drew a card: "${this.text}"`);
        
        switch (this.action) {
            case 'collect':
                this.handleCollect(player, game);
                break;
            case 'pay':
                this.handlePay(player, game);
                break;
            case 'move':
                this.handleMove(player, game);
                break;
            case 'moveToNearest':
                this.handleMoveToNearest(player, game);
                break;
            case 'getOutOfJail':
                this.handleGetOutOfJail(player, game);
                break;
            case 'goToJail':
                this.handleGoToJail(player, game);
                break;
            case 'payPlayers':
                this.handlePayPlayers(player, game);
                break;
            case 'collectFromPlayers':
                this.handleCollectFromPlayers(player, game);
                break;
            case 'repairs':
                this.handleRepairs(player, game);
                break;
            case 'chairman':
                this.handleChairman(player, game);
                break;
            default:
                game.logMessage(`Unknown card action: ${this.action}`);
        }
    }
    
    handleCollect(player, game) {
        player.receive(this.value);
        game.logMessage(`${player.name} collected $${this.value}.`);
    }
    
    handlePay(player, game) {
        if (player.pay(this.value)) {
            game.logMessage(`${player.name} paid $${this.value}.`);
        } else {
            game.logMessage(`${player.name} cannot afford to pay $${this.value}!`);
            // Handle bankruptcy
            game.bankruptcyManager.handleBankruptcy(player);
        }
    }
    
    handleMove(player, game) {
        const oldPosition = player.position;
        player.position = this.moveTo;
        
        // Check if player passed Go
        if (this.moveTo < oldPosition) {
            player.receive(game.settings.goAmount);
            game.logMessage(`${player.name} passed Go and collected $${game.settings.goAmount}.`);
        }
        
        game.logMessage(`${player.name} moved to ${game.board[player.position].name}.`);
        
        // Handle landing on the new space
        game.movementManager.handleLandingOnSpace(player, game.board[player.position]);
    }
    
    handleMoveToNearest(player, game) {
        const targetPropertyType = this.value; // 'railroad' or 'utility'
        let nearestPosition = -1;
        let minDistance = Infinity;
        
        // Find the nearest property of the specified type
        for (let i = 0; i < game.board.length; i++) {
            const space = game.board[i];
            if (space.type === 'property' && space.data.type === targetPropertyType) {
                let distance = i - player.position;
                if (distance < 0) distance += game.board.length;
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPosition = i;
                }
            }
        }
        
        if (nearestPosition !== -1) {
            const oldPosition = player.position;
            player.position = nearestPosition;
            
            // Check if player passed Go
            if (nearestPosition < oldPosition) {
                player.receive(game.settings.goAmount);
                game.logMessage(`${player.name} passed Go and collected $${game.settings.goAmount}.`);
            }
            
            game.logMessage(`${player.name} moved to nearest ${targetPropertyType} at ${game.board[nearestPosition].name}.`);
            
            // Handle landing on the new space
            game.movementManager.handleLandingOnSpace(player, game.board[nearestPosition]);
        }
    }
    
    handleGetOutOfJail(player, game) {
        if (this.keepCard) {
            player.getOutOfJailCards++;
            game.logMessage(`${player.name} received a Get Out of Jail Free card.`);
        } else {
            if (player.inJail) {
                player.releaseFromJail();
                game.logMessage(`${player.name} was released from Jail.`);
            }
        }
    }
    
    handleGoToJail(player, game) {
        player.sendToJail();
        game.logMessage(`${player.name} was sent to Jail!`);
    }
    
    handlePayPlayers(player, game) {
        const totalPayment = this.value * (game.players.length - 1);
        
        if (player.canAfford(totalPayment)) {
            game.players.forEach(otherPlayer => {
                if (otherPlayer.id !== player.id) {
                    player.pay(this.value, otherPlayer);
                }
            });
            game.logMessage(`${player.name} paid $${this.value} to each player ($${totalPayment} total).`);
        } else {
            game.logMessage(`${player.name} cannot afford to pay $${this.value} to each player!`);
            // Handle bankruptcy
            game.bankruptcyManager.handleBankruptcy(player);
        }
    }
    
    handleCollectFromPlayers(player, game) {
        const totalCollection = this.value * (game.players.length - 1);
        
        game.players.forEach(otherPlayer => {
            if (otherPlayer.id !== player.id) {
                if (otherPlayer.pay(this.value, player)) {
                    game.logMessage(`${otherPlayer.name} paid $${this.value} to ${player.name}.`);
                } else {
                    game.logMessage(`${otherPlayer.name} cannot afford to pay $${this.value}!`);
                    // Handle bankruptcy
                    game.bankruptcyManager.handleBankruptcy(otherPlayer);
                }
            }
        });
        
        game.logMessage(`${player.name} collected $${this.value} from each player ($${totalCollection} total).`);
    }
    
    handleRepairs(player, game) {
        const houseCost = this.value;
        const hotelCost = this.moveTo; // Reusing moveTo field for hotel cost
        
        let totalCost = 0;
        player.properties.forEach(property => {
            if (property.buildings > 0) {
                if (property.buildings === 5) {
                    totalCost += hotelCost;
                } else {
                    totalCost += property.buildings * houseCost;
                }
            }
        });
        
        if (player.pay(totalCost)) {
            game.logMessage(`${player.name} paid $${totalCost} for repairs ($${houseCost} per house, $${hotelCost} per hotel).`);
        } else {
            game.logMessage(`${player.name} cannot afford to pay $${totalCost} for repairs!`);
            // Handle bankruptcy
            game.bankruptcyManager.handleBankruptcy(player);
        }
    }
    
    handleChairman(player, game) {
        // Pay each player $50
        this.handlePayPlayers(player, game);
    }
    
    getDisplayText() {
        return this.text;
    }
    
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            text: this.text,
            action: this.action,
            value: this.value,
            moveTo: this.moveTo,
            description: this.description,
            keepCard: this.keepCard
        };
    }
}

module.exports = Card;