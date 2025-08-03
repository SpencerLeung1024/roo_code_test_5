class Property {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type; // 'street', 'railroad', 'utility'
        this.position = data.position;
        this.colorGroup = data.colorGroup;
        this.price = data.price;
        this.mortgageValue = data.mortgageValue || Math.floor(data.price / 2);
        this.isMortgaged = false;
        this.ownerId = null;
        this.buildings = 0; // 0-4 for houses, 5 for hotel
        this.rentLevels = data.rentLevels; // Array of rent amounts
        this.houseCost = data.houseCost || 0;
        this.hotelCost = data.hotelCost || 0;
        this.monopolyGroup = data.monopolyGroup || [];
    }
    
    calculateRent(diceRoll = 0, gameState) {
        if (this.isMortgaged) {
            return 0;
        }
        
        if (this.type === 'railroad') {
            return this.calculateRailroadRent(gameState);
        }
        
        if (this.type === 'utility') {
            return this.calculateUtilityRent(diceRoll, gameState);
        }
        
        // Street property rent calculation
        const owner = gameState.players.find(p => p.id === this.ownerId);
        if (!owner) return 0;
        
        let rent = this.rentLevels[this.buildings];
        
        // Check for monopoly
        if (this.hasMonopoly(owner)) {
            if (this.buildings === 0) {
                rent *= 2; // Double rent for monopoly with no buildings
            }
        }
        
        return rent;
    }
    
    calculateRailroadRent(gameState) {
        const owner = gameState.players.find(p => p.id === this.ownerId);
        if (!owner) return 0;
        
        const railroadsOwned = owner.propertiesOwned.railroads;
        const baseRent = 25;
        
        switch (railroadsOwned) {
            case 1: return baseRent;
            case 2: return baseRent * 2;
            case 3: return baseRent * 4;
            case 4: return baseRent * 8;
            default: return 0;
        }
    }
    
    calculateUtilityRent(diceRoll, gameState) {
        const owner = gameState.players.find(p => p.id === this.ownerId);
        if (!owner) return 0;
        
        const utilitiesOwned = owner.propertiesOwned.utilities;
        
        if (utilitiesOwned === 1) {
            return diceRoll * 4;
        } else if (utilitiesOwned === 2) {
            return diceRoll * 10;
        }
        
        return 0;
    }
    
    canBuildHouse(gameState) {
        if (this.type !== 'street' || this.isMortgaged) {
            return false;
        }
        
        if (this.buildings >= 4) {
            return false; // Already has 4 houses, need to build hotel
        }
        
        const owner = gameState.players.find(p => p.id === this.ownerId);
        if (!owner || !this.hasMonopoly(owner)) {
            return false;
        }
        
        // Check if other properties in group have same number of buildings
        for (const propertyId of this.monopolyGroup) {
            if (propertyId === this.id) continue;
            
            const property = gameState.board.find(p => p.id === propertyId);
            if (property && property.buildings < this.buildings) {
                return false; // Must build evenly
            }
        }
        
        return true;
    }
    
    canBuildHotel(gameState) {
        if (this.type !== 'street' || this.isMortgaged) {
            return false;
        }
        
        if (this.buildings !== 4) {
            return false; // Need 4 houses first
        }
        
        const owner = gameState.players.find(p => p.id === this.ownerId);
        if (!owner || !this.hasMonopoly(owner)) {
            return false;
        }
        
        // Check if other properties in group have 4 houses
        for (const propertyId of this.monopolyGroup) {
            if (propertyId === this.id) continue;
            
            const property = gameState.board.find(p => p.id === propertyId);
            if (property && property.buildings !== 4) {
                return false; // All properties must have 4 houses
            }
        }
        
        return true;
    }
    
    hasMonopoly(player) {
        if (this.type === 'railroad' || this.type === 'utility') {
            return player.propertiesOwned[this.colorGroup] === this.monopolyGroup.length;
        }
        
        return player.propertiesOwned[this.colorGroup] === this.monopolyGroup.length;
    }
    
    mortgage() {
        if (!this.isMortgaged && this.buildings === 0) {
            this.isMortgaged = true;
            return this.mortgageValue;
        }
        return 0;
    }
    
    unmortgage() {
        if (this.isMortgaged) {
            this.isMortgaged = false;
            return Math.floor(this.mortgageValue * 1.1); // 10% interest
        }
        return 0;
    }
    
    buildHouse() {
        if (this.canBuildHouse()) {
            this.buildings++;
            return true;
        }
        return false;
    }
    
    buildHotel() {
        if (this.canBuildHotel()) {
            this.buildings = 5; // 5 represents hotel
            return true;
        }
        return false;
    }
    
    sellHouse() {
        if (this.buildings > 0 && this.buildings <= 4) {
            this.buildings--;
            return Math.floor(this.houseCost / 2);
        }
        return 0;
    }
    
    sellHotel() {
        if (this.buildings === 5) {
            this.buildings = 4; // Convert back to 4 houses
            return Math.floor(this.hotelCost / 2);
        }
        return 0;
    }
    
    getRentLevel() {
        if (this.buildings === 5) return 'Hotel';
        if (this.buildings > 0) return `${this.buildings} House${this.buildings > 1 ? 's' : ''}`;
        return 'Base Rent';
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            position: this.position,
            colorGroup: this.colorGroup,
            price: this.price,
            mortgageValue: this.mortgageValue,
            isMortgaged: this.isMortgaged,
            ownerId: this.ownerId,
            buildings: this.buildings,
            rentLevels: this.rentLevels,
            houseCost: this.houseCost,
            hotelCost: this.hotelCost,
            monopolyGroup: this.monopolyGroup
        };
    }
}

module.exports = Property;