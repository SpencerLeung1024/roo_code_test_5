/**
 * Card Model for Monopoly Chance and Community Chest cards
 */
export class Card {
    constructor(type, id, title, description, effect, amount = 0, target = null) {
        this.type = type; // 'chance' or 'community-chest'
        this.id = id;
        this.title = title;
        this.description = description;
        this.effect = effect; // Effect type
        this.amount = amount; // Money amount for transactions
        this.target = target; // Target position, property, etc.
    }

    /**
     * Execute the card effect
     * @param {Player} player - The player drawing the card
     * @param {GameEngine} gameEngine - The game engine instance
     * @returns {Object} Result of the effect execution
     */
    execute(player, gameEngine) {
        const result = {
            success: true,
            message: '',
            playerMoved: false,
            moneyChanged: false,
            amount: 0
        };

        switch (this.effect) {
            case 'move-to':
                result = this.executeMoveTo(player, gameEngine);
                break;
            case 'move-near':
                result = this.executeMoveNear(player, gameEngine);
                break;
            case 'move-back':
                result = this.executeMoveBack(player, gameEngine);
                break;
            case 'money-from-bank':
                result = this.executeMoneyFromBank(player);
                break;
            case 'money-to-bank':
                result = this.executeMoneyToBank(player);
                break;
            case 'money-from-players':
                result = this.executeMoneyFromPlayers(player, gameEngine);
                break;
            case 'money-to-players':
                result = this.executeMoneyToPlayers(player, gameEngine);
                break;
            case 'get-out-of-jail':
                result = this.executeGetOutOfJail(player);
                break;
            case 'repairs':
                result = this.executeRepairs(player);
                break;
            case 'go-to-jail':
                result = this.executeGoToJail(player, gameEngine);
                break;
            default:
                result.success = false;
                result.message = 'Unknown card effect';
        }

        return result;
    }

    executeMoveTo(player, gameEngine) {
        const oldPosition = player.position;
        player.position = this.target;
        
        // Handle passing GO
        if (this.target < oldPosition && this.target !== 10) { // Not going to jail
            player.money += 200;
        }
        
        return {
            success: true,
            message: `Moved to ${gameEngine.board.getSquare(this.target).name}`,
            playerMoved: true,
            moneyChanged: this.target < oldPosition && this.target !== 10,
            amount: this.target < oldPosition && this.target !== 10 ? 200 : 0
        };
    }

    executeMoveNear(player, gameEngine) {
        const targetType = this.target;
        let nearestPosition = player.position;
        
        // Find nearest railroad or utility
        for (let i = 1; i <= 40; i++) {
            const pos = (player.position + i) % 40;
            const square = gameEngine.board.getSquare(pos);
            
            if ((targetType === 'railroad' && square.type === 'railroad') ||
                (targetType === 'utility' && square.type === 'utility')) {
                nearestPosition = pos;
                break;
            }
        }
        
        const oldPosition = player.position;
        player.position = nearestPosition;
        
        // Handle passing GO
        if (nearestPosition < oldPosition) {
            player.money += 200;
        }
        
        return {
            success: true,
            message: `Moved to nearest ${targetType}`,
            playerMoved: true,
            moneyChanged: nearestPosition < oldPosition,
            amount: nearestPosition < oldPosition ? 200 : 0
        };
    }

    executeMoveBack(player, gameEngine) {
        const oldPosition = player.position;
        player.position = (player.position - 3 + 40) % 40;
        
        return {
            success: true,
            message: 'Moved back 3 spaces',
            playerMoved: true,
            moneyChanged: false,
            amount: 0
        };
    }

    executeMoneyFromBank(player) {
        player.money += this.amount;
        return {
            success: true,
            message: `Received $${this.amount} from bank`,
            playerMoved: false,
            moneyChanged: true,
            amount: this.amount
        };
    }

    executeMoneyToBank(player) {
        player.money -= this.amount;
        return {
            success: true,
            message: `Paid $${this.amount} to bank`,
            playerMoved: false,
            moneyChanged: true,
            amount: -this.amount
        };
    }

    executeMoneyFromPlayers(player, gameEngine) {
        const players = gameEngine.players.filter(p => p.id !== player.id);
        const totalAmount = players.length * this.amount;
        
        players.forEach(p => {
            p.money -= this.amount;
        });
        player.money += totalAmount;
        
        return {
            success: true,
            message: `Collected $${this.amount} from each player`,
            playerMoved: false,
            moneyChanged: true,
            amount: totalAmount
        };
    }

    executeMoneyToPlayers(player, gameEngine) {
        const players = gameEngine.players.filter(p => p.id !== player.id);
        const totalAmount = players.length * this.amount;
        
        players.forEach(p => {
            p.money += this.amount;
        });
        player.money -= totalAmount;
        
        return {
            success: true,
            message: `Paid $${this.amount} to each player`,
            playerMoved: false,
            moneyChanged: true,
            amount: -totalAmount
        };
    }

    executeGetOutOfJail(player) {
        player.getOutOfJailFreeCards++;
        return {
            success: true,
            message: 'Received Get Out of Jail Free card',
            playerMoved: false,
            moneyChanged: false,
            amount: 0
        };
    }

    executeRepairs(player) {
        const houses = player.properties.reduce((total, prop) => 
            total + (prop.houses || 0), 0);
        const hotels = player.properties.reduce((total, prop) => 
            total + (prop.hotel ? 1 : 0), 0);
        
        const houseCost = this.target.house || 25;
        const hotelCost = this.target.hotel || 100;
        
        const totalCost = (houses * houseCost) + (hotels * hotelCost);
        player.money -= totalCost;
        
        return {
            success: true,
            message: `Paid $${totalCost} for repairs (${houses} houses, ${hotels} hotels)`,
            playerMoved: false,
            moneyChanged: true,
            amount: -totalCost
        };
    }

    executeGoToJail(player, gameEngine) {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        
        return {
            success: true,
            message: 'Go directly to Jail',
            playerMoved: true,
            moneyChanged: false,
            amount: 0
        };
    }

    /**
     * Get card display data
     * @returns {Object} Card display information
     */
    getDisplayData() {
        return {
            type: this.type,
            title: this.type === 'chance' ? 'CHANCE' : 'COMMUNITY CHEST',
            description: this.description,
            color: this.type === 'chance' ? '#FF8C00' : '#FFD700',
            icon: this.type === 'chance' ? '?' : '🎁'
        };
    }
}