// Property Manager for Monopoly Game
// Handles property-related functionality, rent calculations, and property state management

class Property {
    constructor(data) {
        // Basic property information
        this.id = data.id;
        this.name = data.name;
        this.position = data.position;
        this.price = data.price;
        this.baseRent = data.rent;
        this.type = data.type || 'property'; // 'property', 'railroad', or 'utility'
        
        // Property ownership and state
        this.owner = null; // Player ID or null
        this.mortgaged = false;
        
        // Property-specific attributes
        if (this.type === 'property') {
            this.colorGroup = data.colorGroup;
            this.houseCost = data.houseCost;
            this.hotelCost = data.hotelCost;
            this.houses = 0;
            this.hasHotel = false;
            this.rentWithHouse = data.rentWithHouse;
            this.rentWithHotel = data.rentWithHotel;
            this.mortgageValue = data.mortgageValue;
        } else if (this.type === 'railroad') {
            this.mortgageValue = data.mortgageValue;
        } else if (this.type === 'utility') {
            this.rentTwo = data.rentTwo;
            this.mortgageValue = data.mortgageValue;
        }
    }
    
    // Get current rent for this property
    getRent(diceRoll = 0, playerProperties = []) {
        if (this.mortgaged) return 0;
        
        switch (this.type) {
            case 'property':
                // Check if owner has monopoly
                if (this.hasHotel) {
                    return this.rentWithHotel;
                } else if (this.houses > 0) {
                    return this.rentWithHouse[this.houses - 1];
                } else if (this.isMonopoly(playerProperties)) {
                    // Double rent for monopoly with no houses
                    return this.baseRent * 2;
                } else {
                    return this.baseRent;
                }
                
            case 'railroad':
                // Calculate rent based on number of railroads owned
                const railroadsOwned = playerProperties.filter(id => railroadPositions.includes(id)).length;
                return [25, 50, 100, 200][railroadsOwned - 1] || 0;
                
            case 'utility':
                // Calculate rent based on dice roll and number of utilities owned
                const utilitiesOwned = playerProperties.filter(id => utilityPositions.includes(id)).length;
                if (utilitiesOwned === 2) {
                    return diceRoll * this.rentTwo;
                } else {
                    return diceRoll * this.baseRent;
                }
                
            default:
                return this.baseRent;
        }
    }
    
    // Check if property is part of a monopoly
    isMonopoly(playerProperties) {
        if (this.type !== 'property') return false;
        
        // Get all properties in this color group
        const groupProperties = propertyGroups[this.colorGroup];
        if (!groupProperties) return false;
        
        // Check if player owns all properties in the group
        return groupProperties.every(propId => playerProperties.includes(propId));
    }
    
    // Buy property
    buy(playerId) {
        if (this.owner !== null || this.mortgaged) return false;
        
        this.owner = playerId;
        return true;
    }
    
    // Sell property
    sell() {
        if (this.owner === null) return false;
        
        this.owner = null;
        this.mortgaged = false;
        this.houses = 0;
        this.hasHotel = false;
        return true;
    }
    
    // Mortgage property
    mortgage() {
        if (this.owner === null || this.mortgaged || this.houses > 0 || this.hasHotel) return false;
        
        this.mortgaged = true;
        return true;
    }
    
    // Unmortgage property
    unmortgage() {
        if (!this.mortgaged) return false;
        
        this.mortgaged = false;
        return true;
    }
    
    // Build house on property
    buildHouse() {
        if (this.type !== 'property' || this.houses >= 4 || this.hasHotel || this.mortgaged) return false;
        
        this.houses++;
        return true;
    }
    
    // Build hotel on property
    buildHotel() {
        if (this.type !== 'property' || this.houses !== 4 || this.hasHotel || this.mortgaged) return false;
        
        this.houses = 0;
        this.hasHotel = true;
        return true;
    }
    
    // Sell house from property
    sellHouse() {
        if (this.type !== 'property' || this.houses <= 0 || this.hasHotel) return false;
        
        this.houses--;
        return true;
    }
    
    // Sell hotel from property
    sellHotel() {
        if (this.type !== 'property' || !this.hasHotel) return false;
        
        this.hasHotel = false;
        this.houses = 4;
        return true;
    }
    
    // Get current value of property (for selling or mortgaging)
    getValue() {
        if (this.mortgaged) return this.mortgageValue;
        
        let value = this.price;
        
        if (this.type === 'property') {
            if (this.hasHotel) {
                value += this.hotelCost;
            } else {
                value += this.houses * this.houseCost;
            }
        }
        
        return value;
    }
    
    // Get sale price (half of property value)
    getSalePrice() {
        return Math.floor(this.getValue() / 2);
    }
}

class PropertyManager {
    constructor() {
        // Initialize all properties
        this.properties = new Map();
        this.initializeProperties();
    }
    
    // Initialize all properties from data
    initializeProperties() {
        for (const [id, data] of Object.entries(propertyData)) {
            this.properties.set(parseInt(id), new Property(data));
        }
    }
    
    // Get property by ID
    getProperty(id) {
        return this.properties.get(id) || null;
    }
    
    // Get all properties
    getAllProperties() {
        return Array.from(this.properties.values());
    }
    
    // Get properties owned by a player
    getPlayerProperties(playerId) {
        const playerProps = [];
        for (const property of this.properties.values()) {
            if (property.owner === playerId) {
                playerProps.push(property);
            }
        }
        return playerProps;
    }
    
    // Get property IDs owned by a player
    getPlayerPropertyIds(playerId) {
        const playerPropIds = [];
        for (const [id, property] of this.properties.entries()) {
            if (property.owner === playerId) {
                playerPropIds.push(id);
            }
        }
        return playerPropIds;
    }
    
    // Buy property for player
    buyProperty(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property) return false;
        
        return property.buy(playerId);
    }
    
    // Sell property from player
    sellProperty(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        return property.sell();
    }
    
    // Mortgage property
    mortgageProperty(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        return property.mortgage();
    }
    
    // Unmortgage property
    unmortgageProperty(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        return property.unmortgage();
    }
    
    // Build house on property
    buildHouse(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        // Check if player owns monopoly
        const playerProperties = this.getPlayerPropertyIds(playerId);
        if (!property.isMonopoly(playerProperties)) return false;
        
        return property.buildHouse();
    }
    
    // Build hotel on property
    buildHotel(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        // Check if player owns monopoly
        const playerProperties = this.getPlayerPropertyIds(playerId);
        if (!property.isMonopoly(playerProperties)) return false;
        
        return property.buildHotel();
    }
    
    // Sell house from property
    sellHouse(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        return property.sellHouse();
    }
    
    // Sell hotel from property
    sellHotel(propertyId, playerId) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner !== playerId) return false;
        
        return property.sellHotel();
    }
    
    // Calculate rent for landing on a property
    calculateRent(propertyId, playerId, diceRoll = 0) {
        const property = this.getProperty(propertyId);
        if (!property || property.owner === playerId || property.owner === null) return 0;
        
        // Get owner's properties for monopoly calculation
        const ownerProperties = this.getPlayerPropertyIds(property.owner);
        return property.getRent(diceRoll, ownerProperties);
    }
    
    // Check if player owns a monopoly
    hasMonopoly(playerId, colorGroup) {
        const groupProperties = propertyGroups[colorGroup];
        if (!groupProperties) return false;
        
        const playerProperties = this.getPlayerPropertyIds(playerId);
        return groupProperties.every(propId => playerProperties.includes(propId));
    }
    
    // Get all monopolies owned by a player
    getPlayerMonopolies(playerId) {
        const monopolies = [];
        const playerProperties = this.getPlayerPropertyIds(playerId);
        
        for (const [color, groupProps] of Object.entries(propertyGroups)) {
            if (groupProps.every(propId => playerProperties.includes(propId))) {
                monopolies.push(color);
            }
        }
        
        return monopolies;
    }
    
    // Get buildable properties for a player
    getBuildableProperties(playerId) {
        const buildable = [];
        const playerProperties = this.getPlayerPropertyIds(playerId);
        
        for (const [id, property] of this.properties.entries()) {
            if (property.owner === playerId && property.type === 'property') {
                // Check if player owns monopoly
                if (property.isMonopoly(playerProperties)) {
                    // Check if houses/hotels can be built (even development rule)
                    if (this.canBuildEvenly(property, playerProperties)) {
                        buildable.push(id);
                    }
                }
            }
        }
        
        return buildable;
    }
    
    // Check if houses/hotels can be built evenly (even development rule)
    canBuildEvenly(property, playerProperties) {
        const groupProperties = propertyGroups[property.colorGroup];
        if (!groupProperties) return false;
        
        // Get all properties in the group
        const groupProps = groupProperties.map(id => this.getProperty(id));
        
        // Check if all properties in group have similar development
        const houseCounts = groupProps.map(p => p.houses);
        const maxHouses = Math.max(...houseCounts);
        const minHouses = Math.min(...houseCounts);
        
        // Can build if difference is at most 1
        return (maxHouses - minHouses) <= 1;
    }
    
    // Get mortgageable properties for a player
    getMortgageableProperties(playerId) {
        const mortgageable = [];
        
        for (const [id, property] of this.properties.entries()) {
            if (property.owner === playerId && !property.mortgaged && 
                property.houses === 0 && !property.hasHotel) {
                mortgageable.push(id);
            }
        }
        
        return mortgageable;
    }
    
    // Get unmortgageable properties for a player
    getUnmortgageableProperties(playerId) {
        const unmortgageable = [];
        
        for (const [id, property] of this.properties.entries()) {
            if (property.owner === playerId && property.mortgaged) {
                unmortgageable.push(id);
            }
        }
        
        return unmortgageable;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Property, PropertyManager };
} else {
    // In browser environment, attach to window
    window.Property = Property;
    window.PropertyManager = PropertyManager;
}