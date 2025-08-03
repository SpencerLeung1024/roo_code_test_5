class Space {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type; // 'property', 'go', 'jail', 'freeParking', 'goToJail', 'tax', 'communityChest', 'chance'
        this.position = data.position;
        this.action = data.action || null;
        this.data = data.data || {}; // Additional data specific to space type
    }
    
    onLand(player, game) {
        switch (this.type) {
            case 'go':
                this.handleGo(player, game);
                break;
            case 'jail':
                this.handleJail(player, game);
                break;
            case 'goToJail':
                this.handleGoToJail(player, game);
                break;
            case 'freeParking':
                this.handleFreeParking(player, game);
                break;
            case 'tax':
                this.handleTax(player, game);
                break;
            case 'communityChest':
                this.handleCommunityChest(player, game);
                break;
            case 'chance':
                this.handleChance(player, game);
                break;
            default:
                // Property spaces are handled by PropertyManager
                break;
        }
    }
    
    handleGo(player, game) {
        // Landing on Go doesn't give money, passing Go does
        game.logMessage(`${player.name} landed on Go.`);
    }
    
    handleJail(player, game) {
        // Just visiting jail
        game.logMessage(`${player.name} is just visiting Jail.`);
    }
    
    handleGoToJail(player, game) {
        player.sendToJail();
        game.logMessage(`${player.name} was sent to Jail!`);
    }
    
    handleFreeParking(player, game) {
        // In some rules, Free Parking collects taxes and fines
        game.logMessage(`${player.name} landed on Free Parking.`);
    }
    
    handleTax(player, game) {
        const taxAmount = this.data.amount || 0;
        if (player.pay(taxAmount)) {
            game.logMessage(`${player.name} paid $${taxAmount} in ${this.name}.`);
        } else {
            game.logMessage(`${player.name} cannot afford to pay $${taxAmount} in ${this.name}!`);
            // Handle bankruptcy
            game.bankruptcyManager.handleBankruptcy(player);
        }
    }
    
    handleCommunityChest(player, game) {
        game.logMessage(`${player.name} landed on Community Chest.`);
        // Draw a Community Chest card
        const card = game.cardManager.drawCommunityChest();
        if (card) {
            game.cardManager.executeCard(card, player, game);
        }
    }
    
    handleChance(player, game) {
        game.logMessage(`${player.name} landed on Chance.`);
        // Draw a Chance card
        const card = game.cardManager.drawChance();
        if (card) {
            game.cardManager.executeCard(card, player, game);
        }
    }
    
    getDisplayInfo() {
        const info = {
            name: this.name,
            type: this.type,
            position: this.position
        };
        
        switch (this.type) {
            case 'tax':
                info.amount = this.data.amount;
                break;
            case 'property':
                // Property spaces will have additional info from Property model
                break;
        }
        
        return info;
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            position: this.position,
            action: this.action,
            data: this.data
        };
    }
}

module.exports = Space;