class BuildingManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.buildingRules = {
            maxHousesPerProperty: 4,
            maxHotelsPerProperty: 1,
            mustBuildEvenly: true,
            needMonopoly: true
        };
    }

    // Build a house on a property
    buildHouse(playerId, propertyId) {
        try {
            const player = this.gameState.getPlayerById(playerId);
            const property = this.gameState.getPropertyById(propertyId);

            if (!player || !property) {
                throw new Error('Player or property not found');
            }

            if (player.id !== this.gameState.getCurrentPlayer().id) {
                throw new Error('Not your turn');
            }

            if (!this.canBuildHouse(player, property)) {
                throw new Error('Cannot build house on this property');
            }

            if (!player.canAfford(property.houseCost)) {
                throw new Error('Insufficient funds to build house');
            }

            // Process the house purchase
            player.pay(property.houseCost);
            property.buildings++;

            this.eventHandler.emit('building:built', {
                playerId,
                propertyId,
                propertyName: property.name,
                buildingType: 'house',
                buildingCount: property.buildings,
                cost: property.houseCost
            });

            this.gameState.updateLastAction({
                type: 'build_house',
                playerId,
                propertyId,
                cost: property.houseCost
            });

            return {
                success: true,
                message: `House built on ${property.name}`,
                buildingCount: property.buildings
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Build a hotel on a property
    buildHotel(playerId, propertyId) {
        try {
            const player = this.gameState.getPlayerById(playerId);
            const property = this.gameState.getPropertyById(propertyId);

            if (!player || !property) {
                throw new Error('Player or property not found');
            }

            if (player.id !== this.gameState.getCurrentPlayer().id) {
                throw new Error('Not your turn');
            }

            if (!this.canBuildHotel(player, property)) {
                throw new Error('Cannot build hotel on this property');
            }

            if (!player.canAfford(property.hotelCost)) {
                throw new Error('Insufficient funds to build hotel');
            }

            // Process the hotel purchase
            player.pay(property.hotelCost);
            property.buildings = 5; // 5 represents hotel

            this.eventHandler.emit('building:built', {
                playerId,
                propertyId,
                propertyName: property.name,
                buildingType: 'hotel',
                buildingCount: 1,
                cost: property.hotelCost
            });

            this.gameState.updateLastAction({
                type: 'build_hotel',
                playerId,
                propertyId,
                cost: property.hotelCost
            });

            return {
                success: true,
                message: `Hotel built on ${property.name}`,
                buildingCount: 1
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Sell a house from a property
    sellHouse(playerId, propertyId) {
        try {
            const player = this.gameState.getPlayerById(playerId);
            const property = this.gameState.getPropertyById(propertyId);

            if (!player || !property) {
                throw new Error('Player or property not found');
            }

            if (player.id !== this.gameState.getCurrentPlayer().id) {
                throw new Error('Not your turn');
            }

            if (!this.canSellHouse(player, property)) {
                throw new Error('Cannot sell house from this property');
            }

            // Process the house sale
            const salePrice = Math.floor(property.houseCost / 2);
            property.buildings--;
            player.receive(salePrice);

            this.eventHandler.emit('building:sold', {
                playerId,
                propertyId,
                propertyName: property.name,
                buildingType: 'house',
                buildingCount: property.buildings,
                salePrice
            });

            this.gameState.updateLastAction({
                type: 'sell_house',
                playerId,
                propertyId,
                salePrice
            });

            return {
                success: true,
                message: `House sold from ${property.name}`,
                buildingCount: property.buildings,
                salePrice
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Sell a hotel from a property
    sellHotel(playerId, propertyId) {
        try {
            const player = this.gameState.getPlayerById(playerId);
            const property = this.gameState.getPropertyById(propertyId);

            if (!player || !property) {
                throw new Error('Player or property not found');
            }

            if (player.id !== this.gameState.getCurrentPlayer().id) {
                throw new Error('Not your turn');
            }

            if (!this.canSellHotel(player, property)) {
                throw new Error('Cannot sell hotel from this property');
            }

            // Process the hotel sale
            const salePrice = Math.floor(property.hotelCost / 2);
            property.buildings = 4; // Convert back to 4 houses
            player.receive(salePrice);

            this.eventHandler.emit('building:sold', {
                playerId,
                propertyId,
                propertyName: property.name,
                buildingType: 'hotel',
                buildingCount: 0,
                salePrice
            });

            this.gameState.updateLastAction({
                type: 'sell_hotel',
                playerId,
                propertyId,
                salePrice
            });

            return {
                success: true,
                message: `Hotel sold from ${property.name}`,
                buildingCount: 0,
                salePrice
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Check if a house can be built on a property
    canBuildHouse(player, property) {
        if (property.type !== 'street') {
            return false;
        }

        if (property.isMortgaged) {
            return false;
        }

        if (property.buildings >= this.buildingRules.maxHousesPerProperty) {
            return false;
        }

        if (this.buildingRules.needMonopoly && !property.hasMonopoly(player)) {
            return false;
        }

        if (this.buildingRules.mustBuildEvenly) {
            // Check if other properties in group have same number of buildings
            for (const propertyId of property.monopolyGroup) {
                if (propertyId === property.id) continue;
                
                const groupProperty = this.gameState.board.find(p => p.id === propertyId);
                if (groupProperty && groupProperty.buildings < property.buildings) {
                    return false;
                }
            }
        }

        return true;
    }

    // Check if a hotel can be built on a property
    canBuildHotel(player, property) {
        if (property.type !== 'street') {
            return false;
        }

        if (property.isMortgaged) {
            return false;
        }

        if (property.buildings !== this.buildingRules.maxHousesPerProperty) {
            return false;
        }

        if (this.buildingRules.needMonopoly && !property.hasMonopoly(player)) {
            return false;
        }

        if (this.buildingRules.mustBuildEvenly) {
            // Check if all properties in group have 4 houses
            for (const propertyId of property.monopolyGroup) {
                if (propertyId === property.id) continue;
                
                const groupProperty = this.gameState.board.find(p => p.id === propertyId);
                if (groupProperty && groupProperty.buildings !== this.buildingRules.maxHousesPerProperty) {
                    return false;
                }
            }
        }

        return true;
    }

    // Check if a house can be sold from a property
    canSellHouse(player, property) {
        if (property.type !== 'street') {
            return false;
        }

        if (property.buildings <= 0) {
            return false;
        }

        if (property.buildings === 5) {
            return false; // Cannot sell house when hotel is present
        }

        if (this.buildingRules.mustBuildEvenly) {
            // Check if other properties in group have same or fewer buildings
            for (const propertyId of property.monopolyGroup) {
                if (propertyId === property.id) continue;
                
                const groupProperty = this.gameState.board.find(p => p.id === propertyId);
                if (groupProperty && groupProperty.buildings > property.buildings) {
                    return false;
                }
            }
        }

        return true;
    }

    // Check if a hotel can be sold from a property
    canSellHotel(player, property) {
        if (property.type !== 'street') {
            return false;
        }

        if (property.buildings !== 5) {
            return false;
        }

        return true;
    }

    // Get building information for a property
    getBuildingInfo(propertyId) {
        const property = this.gameState.getPropertyById(propertyId);
        if (!property) {
            return null;
        }

        return {
            propertyId,
            propertyName: property.name,
            buildingCount: property.buildings,
            buildingType: property.buildings === 5 ? 'hotel' : (property.buildings > 0 ? 'houses' : 'none'),
            canBuildHouse: this.canBuildHouse(this.gameState.getPlayerById(property.ownerId), property),
            canBuildHotel: this.canBuildHotel(this.gameState.getPlayerById(property.ownerId), property),
            canSellHouse: this.canSellHouse(this.gameState.getPlayerById(property.ownerId), property),
            canSellHotel: this.canSellHotel(this.gameState.getPlayerById(property.ownerId), property),
            houseCost: property.houseCost,
            hotelCost: property.hotelCost,
            houseSalePrice: Math.floor(property.houseCost / 2),
            hotelSalePrice: Math.floor(property.hotelCost / 2)
        };
    }

    // Get all properties that can have buildings
    getBuildableProperties(playerId) {
        const player = this.gameState.getPlayerById(playerId);
        if (!player) {
            return [];
        }

        return player.properties.map(propertyId => {
            const property = this.gameState.getPropertyById(propertyId);
            return this.getBuildingInfo(propertyId);
        }).filter(info => info && (info.canBuildHouse || info.canBuildHotel));
    }

    // Get total building count for a player
    getPlayerBuildingStats(playerId) {
        const player = this.gameState.getPlayerById(playerId);
        if (!player) {
            return null;
        }

        let totalHouses = 0;
        let totalHotels = 0;
        let totalBuildingValue = 0;

        player.properties.forEach(propertyId => {
            const property = this.gameState.getPropertyById(propertyId);
            if (property) {
                if (property.buildings === 5) {
                    totalHotels++;
                    totalBuildingValue += property.hotelCost;
                } else {
                    totalHouses += property.buildings;
                    totalBuildingValue += property.buildings * property.houseCost;
                }
            }
        });

        return {
            playerId,
            playerName: player.name,
            totalHouses,
            totalHotels,
            totalBuildingValue
        };
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.gameStateManager = managers.gameStateManager;
        this.eventHandler = managers.eventHandler;
        
        console.log('BuildingManager: All managers linked');
    }
}

module.exports = BuildingManager;