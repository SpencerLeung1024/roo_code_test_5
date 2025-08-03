/**
 * Property Model
 * Represents a property, railroad, or utility in Monopoly
 */

import { constants } from '../config/constants.js';

/**
 * Property class for managing property state and calculations
 */
export class Property {
    constructor(name, price, type, rentData, houseCost = 0) {
        this.name = name;
        this.price = price;
        this.type = type; // 'property', 'railroad', 'utility'
        this.colorGroup = type === 'property' ? rentData : null;
        this.baseRent = Array.isArray(rentData) ? rentData[0] : rentData;
        this.rentData = Array.isArray(rentData) ? rentData : null;
        this.houseCost = houseCost;
        
        // State management
        this.owner = null;
        this.isMortgaged = false;
        this.houses = 0;
        this.hasHotel = false;
    }

    /**
     * Get the current rent amount based on property state
     * @param {number} diceRoll - For utilities, the dice roll value
     * @param {number} ownedRailroads - For railroads, number of railroads owned
     * @returns {number} Current rent amount
     */
    getCurrentRent(diceRoll = 0, ownedRailroads = 1) {
        if (this.isMortgaged) {
            return 0;
        }

        switch (this.type) {
            case 'property':
                return this.getPropertyRent();
            case 'railroad':
                return this.getRailroadRent(ownedRailroads);
            case 'utility':
                return this.getUtilityRent(diceRoll);
            default:
                return 0;
        }
    }

    /**
     * Calculate rent for regular properties
     * @returns {number} Rent amount
     */
    getPropertyRent() {
        if (!this.rentData) return 0;

        if (this.hasHotel) {
            return this.rentData[5]; // Hotel rent
        } else if (this.houses > 0) {
            return this.rentData[this.houses]; // House rent
        } else {
            // Base rent, doubled if all properties in group are owned
            const baseRent = this.rentData[0];
            return this.hasMonopoly() ? baseRent * 2 : baseRent;
        }
    }

    /**
     * Calculate rent for railroads
     * @param {number} ownedRailroads - Number of railroads owned by the same player
     * @returns {number} Rent amount
     */
    getRailroadRent(ownedRailroads) {
        const railroadRents = [25, 50, 100, 200];
        return railroadRents[Math.min(ownedRailroads - 1, 3)];
    }

    /**
     * Calculate rent for utilities
     * @param {number} diceRoll - The dice roll value
     * @returns {number} Rent amount
     */
    getUtilityRent(diceRoll) {
        const multipliers = [4, 10];
        const ownedUtilities = this.getOwnedUtilitiesCount();
        const multiplier = multipliers[Math.min(ownedUtilities - 1, 1)];
        return diceRoll * multiplier;
    }

    /**
     * Check if the owner has a monopoly on this color group
     * @returns {boolean} True if monopoly exists
     */
    hasMonopoly() {
        if (this.type !== 'property' || !this.colorGroup || !this.owner) {
            return false;
        }
        
        // Use the owner's method to check for complete group
        return this.owner.ownsCompleteGroup(this.colorGroup);
    }

    /**
     * Get the number of properties owned in this color group
     * @returns {number} Count of owned properties in group
     */
    getOwnedInColorGroup() {
        if (!this.owner || !this.colorGroup) {
            return 0;
        }
        
        return this.owner.getPropertiesByGroup(this.colorGroup).length;
    }

    /**
     * Get the number of utilities owned by the same player
     * @returns {number} Count of owned utilities
     */
    getOwnedUtilitiesCount() {
        if (!this.owner) {
            return 0;
        }
        
        return this.owner.getUtilityCount();
    }

    /**
     * Get the mortgage value of the property
     * @returns {number} Mortgage value
     */
    getMortgageValue() {
        return Math.floor(this.price * constants.PROPERTY.MORTGAGE_RATE);
    }

    /**
     * Get the cost to unmortgage the property
     * @returns {number} Unmortgage cost
     */
    getUnmortgageCost() {
        return Math.floor(this.getMortgageValue() * constants.PROPERTY.UNMORTGAGE_RATE);
    }

    /**
     * Get the cost to build a house
     * @returns {number} House cost
     */
    getHouseCost() {
        return this.houseCost;
    }

    /**
     * Get the cost to build a hotel
     * @returns {number} Hotel cost (typically 4 houses + hotel cost)
     */
    getHotelCost() {
        return this.houseCost; // In Monopoly, hotel cost is same as house cost
    }

    /**
     * Check if houses can be built on this property
     * @returns {boolean} True if houses can be built
     */
    canBuildHouses() {
        return this.type === 'property' && 
               !this.isMortgaged && 
               this.owner !== null &&
               this.hasMonopoly() &&
               this.houses < 4 &&
               !this.hasHotel;
    }

    /**
     * Check if a hotel can be built on this property
     * @returns {boolean} True if hotel can be built
     */
    canBuildHotel() {
        return this.type === 'property' && 
               !this.isMortgaged && 
               this.owner !== null &&
               this.hasMonopoly() &&
               this.houses === 4 &&
               !this.hasHotel;
    }

    /**
     * Build a house on the property
     * @returns {boolean} True if house was built successfully
     */
    buildHouse() {
        if (this.canBuildHouses()) {
            this.houses++;
            return true;
        }
        return false;
    }

    /**
     * Build a hotel on the property
     * @returns {boolean} True if hotel was built successfully
     */
    buildHotel() {
        if (this.canBuildHotel()) {
            this.houses = 0;
            this.hasHotel = true;
            return true;
        }
        return false;
    }

    /**
     * Sell a house from the property
     * @returns {boolean} True if house was sold successfully
     */
    sellHouse() {
        if (this.type === 'property' && this.houses > 0) {
            this.houses--;
            return true;
        }
        return false;
    }

    /**
     * Sell a hotel from the property
     * @returns {boolean} True if hotel was sold successfully
     */
    sellHotel() {
        if (this.type === 'property' && this.hasHotel) {
            this.hasHotel = false;
            this.houses = 4;
            return true;
        }
        return false;
    }

    /**
     * Mortgage the property
     * @returns {number} Mortgage value received
     */
    mortgage() {
        if (!this.isMortgaged && this.owner !== null) {
            this.isMortgaged = true;
            return this.getMortgageValue();
        }
        return 0;
    }

    /**
     * Unmortgage the property
     * @returns {number} Cost to unmortgage
     */
    unmortgage() {
        if (this.isMortgaged && this.owner !== null) {
            this.isMortgaged = false;
            return this.getUnmortgageCost();
        }
        return 0;
    }

    /**
     * Set the owner of the property
     * @param {Player|null} player - The new owner
     */
    setOwner(player) {
        this.owner = player;
    }

    /**
     * Get property information for display
     * @returns {Object} Property information
     */
    getInfo() {
        return {
            name: this.name,
            price: this.price,
            type: this.type,
            colorGroup: this.colorGroup,
            baseRent: this.baseRent,
            rentData: this.rentData,
            houseCost: this.houseCost,
            owner: this.owner?.name || null,
            isMortgaged: this.isMortgaged,
            houses: this.houses,
            hasHotel: this.hasHotel,
            currentRent: this.getCurrentRent(),
            mortgageValue: this.getMortgageValue(),
            canBuildHouses: this.canBuildHouses(),
            canBuildHotel: this.canBuildHotel()
        };
    }

    /**
     * Get the color group name for display
     * @returns {string} Formatted color group name
     */
    getColorGroupName() {
        const colorMap = {
            'brown': 'Brown',
            'light-blue': 'Light Blue',
            'pink': 'Pink',
            'orange': 'Orange',
            'red': 'Red',
            'yellow': 'Yellow',
            'green': 'Green',
            'dark-blue': 'Dark Blue'
        };
        
        return colorMap[this.colorGroup] || this.colorGroup;
    }
}