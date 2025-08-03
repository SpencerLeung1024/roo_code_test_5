class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.money = 1500;
        this.position = 0;
        this.properties = [];
        this.inJail = false;
        this.jailTurns = 0;
        this.getOutOfJailCards = 0;
        this.bankrupt = false;
        this.doubleRolls = 0;
        this.totalRolls = 0;
        this.propertiesOwned = {
            brown: 0,
            lightBlue: 0,
            pink: 0,
            orange: 0,
            red: 0,
            yellow: 0,
            green: 0,
            darkBlue: 0,
            railroads: 0,
            utilities: 0
        };
    }
    
    addProperty(property) {
        this.properties.push(property);
        this.propertiesOwned[property.colorGroup]++;
        property.ownerId = this.id;
    }
    
    removeProperty(propertyId) {
        const index = this.properties.findIndex(p => p.id === propertyId);
        if (index !== -1) {
            const property = this.properties[index];
            this.properties.splice(index, 1);
            this.propertiesOwned[property.colorGroup]--;
            property.ownerId = null;
            return property;
        }
        return null;
    }
    
    canAfford(amount) {
        return this.money >= amount;
    }
    
    pay(amount, recipient = null) {
        if (!this.canAfford(amount)) {
            return false;
        }
        
        this.money -= amount;
        
        if (recipient) {
            recipient.money += amount;
        }
        
        return true;
    }
    
    receive(amount) {
        this.money += amount;
    }
    
    calculateTotalWorth() {
        let totalWorth = this.money;
        
        // Add property values
        this.properties.forEach(property => {
            totalWorth += property.price;
            
            // Add building values
            if (property.buildings > 0) {
                if (property.buildings === 5) {
                    totalWorth += property.hotelCost;
                } else {
                    totalWorth += property.buildings * property.houseCost;
                }
            }
        });
        
        return totalWorth;
    }
    
    sendToJail() {
        this.inJail = true;
        this.jailTurns = 0;
        this.position = 10; // Jail position
    }
    
    releaseFromJail() {
        this.inJail = false;
        this.jailTurns = 0;
    }
    
    incrementJailTurns() {
        this.jailTurns++;
    }
    
    useGetOutOfJailCard() {
        if (this.getOutOfJailCards > 0) {
            this.getOutOfJailCards--;
            this.releaseFromJail();
            return true;
        }
        return false;
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            money: this.money,
            position: this.position,
            properties: this.properties.map(p => p.id),
            inJail: this.inJail,
            jailTurns: this.jailTurns,
            getOutOfJailCards: this.getOutOfJailCards,
            bankrupt: this.bankrupt,
            doubleRolls: this.doubleRolls,
            totalRolls: this.totalRolls,
            propertiesOwned: this.propertiesOwned
        };
    }
}

module.exports = Player;