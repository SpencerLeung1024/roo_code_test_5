/**
 * Building Manager Service
 * Handles all building rules, validation, and management for houses and hotels
 */

import { constants } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class BuildingManager extends EventEmitter {
    constructor(gameState) {
        super();
        this.gameState = gameState;
        this.board = gameState?.board;
        this.buildingInventory = {
            houses: constants.GAME.MAX_HOUSES,
            hotels: constants.GAME.MAX_HOTELS
        };
        this.buildingStats = {
            totalHousesBuilt: 0,
            totalHotelsBuilt: 0,
            totalHousesSold: 0,
            totalHotelsSold: 0,
            totalBuildingSpent: 0,
            totalBuildingReceived: 0
        };
    }

    /**
     * Get all properties owned by a player in a color group
     * @param {Player} player - The player
     * @param {string} colorGroup - The color group
     * @returns {Property[]} Array of properties in the color group
     */
    getColorGroupProperties(player, colorGroup) {
        if (!player || !colorGroup) return [];
        
        return player.properties.filter(property => 
            property.type === 'property' && 
            property.colorGroup === colorGroup
        );
    }

    /**
     * Check if a player has a monopoly on a color group
     * @param {Player} player - The player
     * @param {string} colorGroup - The color group
     * @returns {boolean} True if player has monopoly
     */
    hasMonopoly(player, colorGroup) {
        const properties = this.getColorGroupProperties(player, colorGroup);
        const expectedCount = this.getColorGroupSize(colorGroup);
        return properties.length === expectedCount;
    }

    /**
     * Get the expected number of properties in a color group
     * @param {string} colorGroup - The color group
     * @returns {number} Expected property count
     */
    getColorGroupSize(colorGroup) {
        const group = constants.PROPERTY_GROUPS[colorGroup.toUpperCase().replace('-', '_')];
        return group ? group.properties.length : 0;
    }

    /**
     * Check if buildings can be built evenly across a color group
     * @param {Player} player - The player
     * @param {string} colorGroup - The color group
     * @param {string} action - 'build' or 'sell'
     * @returns {Object} Validation result with canBuild and reason
     */
    validateEvenBuilding(player, colorGroup, action = 'build') {
        const properties = this.getColorGroupProperties(player, colorGroup);
        
        if (properties.length === 0) {
            return { canBuild: false, reason: 'No properties in this color group' };
        }

        const houseCounts = properties.map(p => p.houses);
        const minHouses = Math.min(...houseCounts);
        const maxHouses = Math.max(...houseCounts);

        if (action === 'build') {
            // For building: max difference should be 0 (all properties must have same count)
            if (maxHouses - minHouses > 0) {
                return { 
                    canBuild: false, 
                    reason: 'Houses must be built evenly across the color group' 
                };
            }
        } else if (action === 'sell') {
            // For selling: max difference should be 1
            if (maxHouses - minHouses > 1) {
                return { 
                    canBuild: false, 
                    reason: 'Houses must be sold evenly across the color group' 
                };
            }
        }

        return { canBuild: true, reason: '' };
    }

    /**
     * Check if a house can be built on a specific property
     * @param {Property} property - The property to build on
     * @param {Player} player - The player attempting to build
     * @returns {Object} Validation result
     */
    canBuildHouse(property, player) {
        if (!property || !player) {
            return { canBuild: false, reason: 'Invalid property or player' };
        }

        // Check if property can have houses
        if (property.type !== 'property') {
            return { canBuild: false, reason: 'Only properties can have houses' };
        }

        // Check ownership
        if (property.owner !== player) {
            return { canBuild: false, reason: 'You do not own this property' };
        }

        // Check mortgage status
        if (property.isMortgaged) {
            return { canBuild: false, reason: 'Property is mortgaged' };
        }

        // Check monopoly
        if (!this.hasMonopoly(player, property.colorGroup)) {
            return { canBuild: false, reason: 'You need a monopoly to build houses' };
        }

        // Check house limit
        if (property.houses >= 4) {
            return { canBuild: false, reason: 'Maximum 4 houses allowed' };
        }

        // Check if hotel already exists
        if (property.hasHotel) {
            return { canBuild: false, reason: 'Hotel already built on this property' };
        }

        // Check even building rule
        const evenBuilding = this.validateEvenBuilding(player, property.colorGroup, 'build');
        if (!evenBuilding.canBuild) {
            return evenBuilding;
        }

        // Check building inventory
        if (this.buildingInventory.houses <= 0) {
            return { canBuild: false, reason: 'No houses available in the bank' };
        }

        // Check player funds
        const houseCost = property.getHouseCost();
        if (player.money < houseCost) {
            return { canBuild: false, reason: `Insufficient funds. Need $${houseCost}` };
        }

        return { canBuild: true, reason: '' };
    }

    /**
     * Check if a hotel can be built on a specific property
     * @param {Property} property - The property to build on
     * @param {Player} player - The player attempting to build
     * @returns {Object} Validation result
     */
    canBuildHotel(property, player) {
        if (!property || !player) {
            return { canBuild: false, reason: 'Invalid property or player' };
        }

        // Check if property can have hotels
        if (property.type !== 'property') {
            return { canBuild: false, reason: 'Only properties can have hotels' };
        }

        // Check ownership
        if (property.owner !== player) {
            return { canBuild: false, reason: 'You do not own this property' };
        }

        // Check mortgage status
        if (property.isMortgaged) {
            return { canBuild: false, reason: 'Property is mortgaged' };
        }

        // Check monopoly
        if (!this.hasMonopoly(player, property.colorGroup)) {
            return { canBuild: false, reason: 'You need a monopoly to build hotels' };
        }

        // Check house requirement (must have 4 houses)
        if (property.houses < 4) {
            return { canBuild: false, reason: 'Need 4 houses before building a hotel' };
        }

        // Check if hotel already exists
        if (property.hasHotel) {
            return { canBuild: false, reason: 'Hotel already built on this property' };
        }

        // Check even building rule for the color group
        const properties = this.getColorGroupProperties(player, property.colorGroup);
        const allHaveFourHouses = properties.every(p => p.houses === 4 || p.hasHotel);
        if (!allHaveFourHouses) {
            return { 
                canBuild: false, 
                reason: 'All properties in the color group must have 4 houses before building hotels' 
            };
        }

        // Check building inventory
        if (this.buildingInventory.hotels <= 0) {
            return { canBuild: false, reason: 'No hotels available in the bank' };
        }

        // Check player funds
        const hotelCost = property.getHotelCost();
        if (player.money < hotelCost) {
            return { canBuild: false, reason: `Insufficient funds. Need $${hotelCost}` };
        }

        return { canBuild: true, reason: '' };
    }

    /**
     * Check if a house can be sold from a specific property
     * @param {Property} property - The property to sell from
     * @param {Player} player - The player attempting to sell
     * @returns {Object} Validation result
     */
    canSellHouse(property, player) {
        if (!property || !player) {
            return { canSell: false, reason: 'Invalid property or player' };
        }

        // Check ownership
        if (property.owner !== player) {
            return { canSell: false, reason: 'You do not own this property' };
        }

        // Check if there are houses to sell
        if (property.houses <= 0) {
            return { canSell: false, reason: 'No houses to sell' };
        }

        // Check even building rule for selling
        const evenBuilding = this.validateEvenBuilding(player, property.colorGroup, 'sell');
        if (!evenBuilding.canBuild) {
            return { canSell: false, reason: evenBuilding.reason };
        }

        return { canSell: true, reason: '' };
    }

    /**
     * Check if a hotel can be sold from a specific property
     * @param {Property} property - The property to sell from
     * @param {Player} player - The player attempting to sell
     * @returns {Object} Validation result
     */
    canSellHotel(property, player) {
        if (!property || !player) {
            return { canSell: false, reason: 'Invalid property or player' };
        }

        // Check ownership
        if (property.owner !== player) {
            return { canSell: false, reason: 'You do not own this property' };
        }

        // Check if there is a hotel to sell
        if (!property.hasHotel) {
            return { canSell: false, reason: 'No hotel to sell' };
        }

        return { canSell: true, reason: '' };
    }

    /**
     * Build a house on a property
     * @param {Property} property - The property to build on
     * @param {Player} player - The player building
     * @returns {Object} Result of the build action
     */
    buildHouse(property, player) {
        const validation = this.canBuildHouse(property, player);
        if (!validation.canBuild) {
            return { success: false, message: validation.reason };
        }

        const cost = property.getHouseCost();
        
        // Update player money
        player.money -= cost;
        
        // Update property
        property.houses++;
        
        // Update inventory
        this.buildingInventory.houses--;
        
        // Update stats
        this.buildingStats.totalHousesBuilt++;
        this.buildingStats.totalBuildingSpent += cost;
        
        // Emit event
        this.emit('house:built', {
            property: property.name,
            player: player.name,
            cost: cost,
            houses: property.houses
        });

        return { 
            success: true, 
            message: `House built on ${property.name} for $${cost}`,
            cost: cost
        };
    }

    /**
     * Build a hotel on a property
     * @param {Property} property - The property to build on
     * @param {Player} player - The player building
     * @returns {Object} Result of the build action
     */
    buildHotel(property, player) {
        const validation = this.canBuildHotel(property, player);
        if (!validation.canBuild) {
            return { success: false, message: validation.reason };
        }

        const cost = property.getHotelCost();
        
        // Update player money
        player.money -= cost;
        
        // Update property (return 4 houses to bank, add 1 hotel)
        property.houses = 0;
        property.hasHotel = true;
        
        // Update inventory
        this.buildingInventory.houses += 4; // Return houses
        this.buildingInventory.hotels--;
        
        // Update stats
        this.buildingStats.totalHotelsBuilt++;
        this.buildingStats.totalHousesSold += 4;
        this.buildingStats.totalBuildingSpent += cost;
        
        // Emit event
        this.emit('hotel:built', {
            property: property.name,
            player: player.name,
            cost: cost
        });

        return { 
            success: true, 
            message: `Hotel built on ${property.name} for $${cost}`,
            cost: cost
        };
    }

    /**
     * Sell a house from a property
     * @param {Property} property - The property to sell from
     * @param {Player} player - The player selling
     * @returns {Object} Result of the sell action
     */
    sellHouse(property, player) {
        const validation = this.canSellHouse(property, player);
        if (!validation.canSell) {
            return { success: false, message: validation.reason };
        }

        const refund = Math.floor(property.getHouseCost() / 2);
        
        // Update player money
        player.money += refund;
        
        // Update property
        property.houses--;
        
        // Update inventory
        this.buildingInventory.houses++;
        
        // Update stats
        this.buildingStats.totalHousesSold++;
        this.buildingStats.totalBuildingReceived += refund;
        
        // Emit event
        this.emit('house:sold', {
            property: property.name,
            player: player.name,
            refund: refund,
            houses: property.houses
        });

        return { 
            success: true, 
            message: `House sold from ${property.name} for $${refund}`,
            refund: refund
        };
    }

    /**
     * Sell a hotel from a property
     * @param {Property} property - The property to sell from
     * @param {Player} player - The player selling
     * @returns {Object} Result of the sell action
     */
    sellHotel(property, player) {
        const validation = this.canSellHotel(property, player);
        if (!validation.canSell) {
            return { success: false, message: validation.reason };
        }

        const refund = Math.floor(property.getHotelCost() / 2);
        
        // Update player money
        player.money += refund;
        
        // Update property (hotel becomes 4 houses)
        property.hasHotel = false;
        property.houses = 4;
        
        // Update inventory
        this.buildingInventory.hotels++;
        this.buildingInventory.houses -= 4;
        
        // Update stats
        this.buildingStats.totalHotelsSold++;
        this.buildingStats.totalHousesBuilt += 4;
        this.buildingStats.totalBuildingReceived += refund;
        
        // Emit event
        this.emit('hotel:sold', {
            property: property.name,
            player: player.name,
            refund: refund
        });

        return { 
            success: true, 
            message: `Hotel sold from ${property.name} for $${refund}`,
            refund: refund
        };
    }

    /**
     * Get building statistics
     * @returns {Object} Building statistics
     */
    getBuildingStats() {
        return { ...this.buildingStats };
    }

    /**
     * Get current building inventory
     * @returns {Object} Current inventory counts
     */
    getBuildingInventory() {
        return { ...this.buildingInventory };
    }

    /**
     * Get all buildable properties for a player
     * @param {Player} player - The player
     * @returns {Object} Properties grouped by color group with build info
     */
    getBuildableProperties(player) {
        if (!player) return {};

        const buildable = {};
        
        // Group properties by color group
        const colorGroups = {};
        player.properties.forEach(property => {
            if (property.type === 'property' && property.colorGroup) {
                if (!colorGroups[property.colorGroup]) {
                    colorGroups[property.colorGroup] = [];
                }
                colorGroups[property.colorGroup].push(property);
            }
        });

        // Check each color group
        Object.keys(colorGroups).forEach(colorGroup => {
            const properties = colorGroups[colorGroup];
            const hasMonopoly = this.hasMonopoly(player, colorGroup);
            
            buildable[colorGroup] = {
                properties: properties.map(prop => ({
                    property: prop,
                    canBuildHouse: this.canBuildHouse(prop, player).canBuild,
                    canBuildHotel: this.canBuildHotel(prop, player).canBuild,
                    canSellHouse: this.canSellHouse(prop, player).canSell,
                    canSellHotel: this.canSellHotel(prop, player).canSell,
                    houseCost: prop.getHouseCost(),
                    hotelCost: prop.getHotelCost()
                })),
                hasMonopoly: hasMonopoly,
                totalHouses: properties.reduce((sum, p) => sum + p.houses, 0),
                totalHotels: properties.filter(p => p.hasHotel).length
            };
        });

        return buildable;
    }

    /**
     * Reset building inventory to initial state
     */
    resetInventory() {
        this.buildingInventory = {
            houses: constants.GAME.MAX_HOUSES,
            hotels: constants.GAME.MAX_HOTELS
        };
    }

    /**
     * Reset building statistics
     */
    resetStats() {
        this.buildingStats = {
            totalHousesBuilt: 0,
            totalHotelsBuilt: 0,
            totalHousesSold: 0,
            totalHotelsSold: 0,
            totalBuildingSpent: 0,
            totalBuildingReceived: 0
        };
    }
}