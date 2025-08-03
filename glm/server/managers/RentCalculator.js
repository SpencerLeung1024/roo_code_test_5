class RentCalculator {
    constructor() {
        this.rentMultipliers = {
            monopoly: 2, // Rent doubles with monopoly
            house: [1, 3, 6, 8], // Multipliers for 1-4 houses
            hotel: 10 // Multiplier for hotel
        };
        
        this.utilityMultipliers = {
            single: 4,
            both: 10
        };
        
        this.railroadRents = [25, 50, 100, 200]; // Rent for 1, 2, 3, 4 railroads
    }
    
    // Main rent calculation method
    calculateRent(property, gameState, diceRoll = 0) {
        if (!property || !gameState) {
            throw new Error('Invalid property or game state');
        }
        
        // Check if property is mortgaged
        if (property.isMortgaged) {
            return 0;
        }
        
        // Check if property is owned
        if (property.ownerId === null) {
            return 0;
        }
        
        // Calculate rent based on property type
        switch (property.type) {
            case 'street':
                return this.calculateStreetRent(property, gameState);
            case 'railroad':
                return this.calculateRailroadRent(property, gameState);
            case 'utility':
                return this.calculateUtilityRent(property, gameState, diceRoll);
            default:
                return 0;
        }
    }
    
    // Street property rent calculation
    calculateStreetRent(property, gameState) {
        const owner = gameState.players.find(p => p.id === property.ownerId);
        if (!owner) return 0;
        
        let rent = property.rentLevels[property.buildings] || 0;
        
        // Check for monopoly
        if (property.hasMonopoly(owner)) {
            if (property.buildings === 0) {
                rent *= this.rentMultipliers.monopoly; // Double rent for monopoly with no buildings
            }
        }
        
        return rent;
    }
    
    // Railroad rent calculation
    calculateRailroadRent(property, gameState) {
        const owner = gameState.players.find(p => p.id === property.ownerId);
        if (!owner) return 0;
        
        const railroadsOwned = owner.propertiesOwned.railroads;
        
        if (railroadsOwned > 0 && railroadsOwned <= 4) {
            return this.railroadRents[railroadsOwned - 1];
        }
        
        return 0;
    }
    
    // Utility rent calculation
    calculateUtilityRent(property, gameState, diceRoll) {
        const owner = gameState.players.find(p => p.id === property.ownerId);
        if (!owner) return 0;
        
        const utilitiesOwned = owner.propertiesOwned.utilities;
        
        if (utilitiesOwned === 1) {
            return diceRoll * this.utilityMultipliers.single;
        } else if (utilitiesOwned === 2) {
            return diceRoll * this.utilityMultipliers.both;
        }
        
        return 0;
    }
    
    // Get rent for all buildings on a property
    getRentSchedule(property) {
        if (!property || property.type !== 'street') {
            return [];
        }
        
        const schedule = [];
        
        // Base rent
        schedule.push({
            level: 'Base',
            rent: property.rentLevels[0] || 0,
            description: 'No buildings'
        });
        
        // With monopoly
        if (property.rentLevels[0]) {
            schedule.push({
                level: 'Monopoly',
                rent: (property.rentLevels[0] || 0) * this.rentMultipliers.monopoly,
                description: 'With monopoly, no buildings'
            });
        }
        
        // With houses
        for (let i = 1; i <= 4; i++) {
            if (property.rentLevels[i]) {
                schedule.push({
                    level: `${i} House${i > 1 ? 's' : ''}`,
                    rent: property.rentLevels[i],
                    description: `${i} house${i > 1 ? 's' : ''}`
                });
            }
        }
        
        // With hotel
        if (property.rentLevels[5]) {
            schedule.push({
                level: 'Hotel',
                rent: property.rentLevels[5],
                description: '1 hotel'
            });
        }
        
        return schedule;
    }
    
    // Calculate potential rent if property had monopoly
    calculatePotentialMonopolyRent(property, gameState) {
        if (!property || property.type !== 'street') {
            return this.calculateRent(property, gameState);
        }
        
        // Simulate monopoly ownership
        const tempOwner = {
            propertiesOwned: {
                ...property.colorGroup.reduce((acc, color) => {
                    acc[color] = 0;
                    return acc;
                }, {}),
                [property.colorGroup]: this.gameState.board.filter(
                    space => space.type === 'street' && space.colorGroup === property.colorGroup
                ).length
            }
        };
        
        // Calculate rent with monopoly
        let rent = property.rentLevels[property.buildings] || 0;
        if (property.buildings === 0) {
            rent *= this.rentMultipliers.monopoly;
        }
        
        return rent;
    }
    
    // Calculate total rent collection potential for a player
    calculateTotalRentPotential(player, gameState) {
        if (!player || !gameState) {
            return 0;
        }
        
        let totalPotential = 0;
        
        player.properties.forEach(propertyId => {
            const property = gameState.getPropertyById(propertyId);
            if (property) {
                // Calculate current rent
                const currentRent = this.calculateRent(property, gameState);
                
                // Calculate potential rent with improvements
                let potentialRent = currentRent;
                
                if (property.type === 'street') {
                    // Check if player can afford to build
                    const maxBuildings = property.buildings === 5 ? 5 : 
                        Math.min(property.buildings + 1, 5);
                    
                    if (maxBuildings > property.buildings) {
                        potentialRent = property.rentLevels[maxBuildings] || 0;
                        
                        // Apply monopoly bonus if applicable
                        if (property.hasMonopoly(player) && maxBuildings === 0) {
                            potentialRent *= this.rentMultipliers.monopoly;
                        }
                    }
                }
                
                totalPotential += potentialRent;
            }
        });
        
        return totalPotential;
    }
    
    // Get rent statistics for a player
    getRentStatistics(player, gameState) {
        if (!player || !gameState) {
            return {
                totalProperties: 0,
                totalCurrentRent: 0,
                totalPotentialRent: 0,
                averageRent: 0,
                highestRentProperty: null,
                rentByColorGroup: {}
            };
        }
        
        const stats = {
            totalProperties: player.properties.length,
            totalCurrentRent: 0,
            totalPotentialRent: 0,
            averageRent: 0,
            highestRentProperty: null,
            rentByColorGroup: {}
        };
        
        let highestRent = 0;
        
        player.properties.forEach(propertyId => {
            const property = gameState.getPropertyById(propertyId);
            if (property) {
                const currentRent = this.calculateRent(property, gameState);
                const potentialRent = this.calculateTotalRentPotential(player, gameState);
                
                stats.totalCurrentRent += currentRent;
                stats.totalPotentialRent += potentialRent;
                
                if (currentRent > highestRent) {
                    highestRent = currentRent;
                    stats.highestRentProperty = {
                        id: property.id,
                        name: property.name,
                        rent: currentRent
                    };
                }
                
                // Group by color
                if (property.colorGroup) {
                    if (!stats.rentByColorGroup[property.colorGroup]) {
                        stats.rentByColorGroup[property.colorGroup] = {
                            propertyCount: 0,
                            totalRent: 0,
                            averageRent: 0
                        };
                    }
                    
                    stats.rentByColorGroup[property.colorGroup].propertyCount++;
                    stats.rentByColorGroup[property.colorGroup].totalRent += currentRent;
                }
            }
        });
        
        // Calculate averages
        stats.averageRent = stats.totalProperties > 0 ? 
            Math.round((stats.totalCurrentRent / stats.totalProperties) * 100) / 100 : 0;
        
        // Calculate color group averages
        for (const color in stats.rentByColorGroup) {
            const group = stats.rentByColorGroup[color];
            group.averageRent = group.propertyCount > 0 ? 
                Math.round((group.totalRent / group.propertyCount) * 100) / 100 : 0;
        }
        
        return stats;
    }
    
    // Calculate rent owed when landing on a property
    calculateRentOwed(player, property, gameState, diceRoll = 0) {
        if (!player || !property || !gameState) {
            return 0;
        }
        
        // Check if property is owned by someone else
        if (property.ownerId === null || property.ownerId === player.id) {
            return 0;
        }
        
        // Check if property is mortgaged
        if (property.isMortgaged) {
            return 0;
        }
        
        // Calculate the rent
        const rent = this.calculateRent(property, gameState, diceRoll);
        
        return rent;
    }
    
    // Get rent breakdown for a property
    getRentBreakdown(property, gameState) {
        if (!property || !gameState) {
            return null;
        }
        
        const owner = gameState.players.find(p => p.id === property.ownerId);
        if (!owner) {
            return null;
        }
        
        const breakdown = {
            propertyId: property.id,
            propertyName: property.name,
            propertyType: property.type,
            ownerId: owner.id,
            ownerName: owner.name,
            isMortgaged: property.isMortgaged,
            currentRent: 0,
            rentSchedule: [],
            monopolyBonus: false,
            buildingCount: 0,
            buildingType: 'none'
        };
        
        // Calculate current rent
        breakdown.currentRent = this.calculateRent(property, gameState);
        
        // Get rent schedule
        breakdown.rentSchedule = this.getRentSchedule(property);
        
        // Check for monopoly
        if (property.type === 'street') {
            breakdown.monopolyBonus = property.hasMonopoly(owner);
        }
        
        // Building information
        if (property.buildings > 0) {
            breakdown.buildingCount = property.buildings === 5 ? 1 : property.buildings;
            breakdown.buildingType = property.buildings === 5 ? 'hotel' : 'house';
        }
        
        return breakdown;
    }
    
    // Validate rent calculation
    validateRent(property, gameState, calculatedRent) {
        if (!property || !gameState) {
            return { valid: false, message: 'Invalid property or game state' };
        }
        
        // Check if calculated rent is negative
        if (calculatedRent < 0) {
            return { valid: false, message: 'Rent cannot be negative' };
        }
        
        // Check if mortgaged property has zero rent
        if (property.isMortgaged && calculatedRent !== 0) {
            return { valid: false, message: 'Mortgaged property should have zero rent' };
        }
        
        // Check if unowned property has zero rent
        if (property.ownerId === null && calculatedRent !== 0) {
            return { valid: false, message: 'Unowned property should have zero rent' };
        }
        
        // For street properties, check if rent matches expected value
        if (property.type === 'street') {
            const expectedRent = property.rentLevels[property.buildings] || 0;
            const owner = gameState.players.find(p => p.id === property.ownerId);
            
            if (owner && property.hasMonopoly(owner) && property.buildings === 0) {
                if (calculatedRent !== expectedRent * this.rentMultipliers.monopoly) {
                    return { valid: false, message: 'Monopoly rent calculation incorrect' };
                }
            } else if (calculatedRent !== expectedRent) {
                return { valid: false, message: 'Base rent calculation incorrect' };
            }
        }
        
        return { valid: true, message: 'Rent calculation is valid' };
    }
}

module.exports = RentCalculator;