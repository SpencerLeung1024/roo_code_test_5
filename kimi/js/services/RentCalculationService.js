/**
 * Rent Calculation Service
 * Handles all rent calculations for Monopoly properties, railroads, and utilities
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Service for calculating rent amounts based on Monopoly rules
 */
export class RentCalculationService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.board = gameEngine.board;
    }

    /**
     * Calculate rent for any property type
     * @param {Property} property - The property to calculate rent for
     * @param {Player} landingPlayer - The player who landed on the property
     * @param {number} diceRoll - The dice roll value (for utilities)
     * @returns {Object} Rent calculation result
     */
    calculateRent(property, landingPlayer, diceRoll = 0) {
        if (!property || !property.owner || property.owner === landingPlayer) {
            return { amount: 0, reason: 'No rent due' };
        }

        if (property.isMortgaged) {
            return { amount: 0, reason: 'Property is mortgaged' };
        }

        switch (property.type) {
            case 'property':
                return this.calculatePropertyRent(property, landingPlayer);
            case 'railroad':
                return this.calculateRailroadRent(property, landingPlayer);
            case 'utility':
                return this.calculateUtilityRent(property, landingPlayer, diceRoll);
            default:
                return { amount: 0, reason: 'Invalid property type' };
        }
    }

    /**
     * Calculate rent for regular properties (with houses/hotels)
     * @param {Property} property - The property
     * @param {Player} landingPlayer - The player who landed
     * @returns {Object} Rent calculation details
     */
    calculatePropertyRent(property, landingPlayer) {
        const owner = property.owner;
        let rentAmount = 0;
        let rentDetails = {
            type: 'property',
            baseRent: property.rentData[0],
            houses: property.houses,
            hasHotel: property.hasHotel,
            monopolyBonus: false,
            colorGroup: property.colorGroup
        };

        // Calculate based on development level
        if (property.hasHotel) {
            rentAmount = property.rentData[5]; // Hotel rent
            rentDetails.hotelRent = rentAmount;
        } else if (property.houses > 0) {
            rentAmount = property.rentData[property.houses];
            rentDetails.houseRent = rentAmount;
        } else {
            // Base rent with monopoly bonus
            rentAmount = property.rentData[0];
            
            // Check for monopoly (owning all properties in color group)
            if (this.hasMonopoly(owner, property.colorGroup)) {
                rentAmount *= 2;
                rentDetails.monopolyBonus = true;
                rentDetails.monopolyMultiplier = 2;
            }
            
            rentDetails.finalBaseRent = rentAmount;
        }

        return {
            amount: rentAmount,
            details: rentDetails,
            reason: this.getPropertyRentReason(rentDetails)
        };
    }

    /**
     * Calculate rent for railroads
     * @param {Property} railroad - The railroad property
     * @param {Player} landingPlayer - The player who landed
     * @returns {Object} Rent calculation details
     */
    calculateRailroadRent(railroad, landingPlayer) {
        const owner = railroad.owner;
        const railroadCount = this.getRailroadCount(owner);
        
        const railroadRents = [25, 50, 100, 200];
        const rentAmount = railroadRents[Math.min(railroadCount - 1, 3)];
        
        const rentDetails = {
            type: 'railroad',
            railroadsOwned: railroadCount,
            rentAmount: rentAmount,
            baseRent: 25,
            multiplier: Math.pow(2, railroadCount - 1)
        };

        return {
            amount: rentAmount,
            details: rentDetails,
            reason: `Railroad rent: ${railroadCount} railroad${railroadCount > 1 ? 's' : ''} owned`
        };
    }

    /**
     * Calculate rent for utilities
     * @param {Property} utility - The utility property
     * @param {Player} landingPlayer - The player who landed
     * @param {number} diceRoll - The dice roll value
     * @returns {Object} Rent calculation details
     */
    calculateUtilityRent(utility, landingPlayer, diceRoll) {
        const owner = utility.owner;
        const utilityCount = this.getUtilityCount(owner);
        
        // Default to 7 if no dice roll provided
        const rollValue = diceRoll || this.getLastDiceRoll() || 7;
        
        const multipliers = [4, 10];
        const multiplier = multipliers[Math.min(utilityCount - 1, 1)];
        const rentAmount = rollValue * multiplier;
        
        const rentDetails = {
            type: 'utility',
            utilitiesOwned: utilityCount,
            diceRoll: rollValue,
            multiplier: multiplier,
            rentAmount: rentAmount
        };

        return {
            amount: rentAmount,
            details: rentDetails,
            reason: `Utility rent: ${rollValue} × ${multiplier} = $${rentAmount}`
        };
    }

    /**
     * Check if a player has a monopoly on a color group
     * @param {Player} player - The player
     * @param {string} colorGroup - The color group
     * @returns {boolean} True if monopoly exists
     */
    hasMonopoly(player, colorGroup) {
        if (!colorGroup) return false;
        
        const groupProperties = this.getPropertiesInGroup(colorGroup);
        const ownedInGroup = groupProperties.filter(prop => 
            prop.owner === player && !prop.isMortgaged
        ).length;
        
        return ownedInGroup === groupProperties.length;
    }

    /**
     * Get all properties in a color group
     * @param {string} colorGroup - The color group name
     * @returns {Property[]} Array of properties in the group
     */
    getPropertiesInGroup(colorGroup) {
        const squares = this.board.getSquaresByType('property');
        return squares
            .filter(square => square.data.colorGroup === colorGroup)
            .map(square => square.data);
    }

    /**
     * Get the count of railroads owned by a player
     * @param {Player} player - The player
     * @returns {number} Number of railroads owned
     */
    getRailroadCount(player) {
        return player.properties.filter(prop => prop.type === 'railroad' && !prop.isMortgaged).length;
    }

    /**
     * Get the count of utilities owned by a player
     * @param {Player} player - The player
     * @returns {number} Number of utilities owned
     */
    getUtilityCount(player) {
        return player.properties.filter(prop => prop.type === 'utility' && !prop.isMortgaged).length;
    }

    /**
     * Get the last dice roll from the game engine
     * @returns {number} Last dice roll value
     */
    getLastDiceRoll() {
        if (this.gameEngine.diceManager) {
            const lastRoll = this.gameEngine.diceManager.getLastRoll();
            return lastRoll ? lastRoll.total : 0;
        }
        return 0;
    }

    /**
     * Get detailed rent information for display
     * @param {Property} property - The property
     * @param {Player} landingPlayer - The player who landed
     * @param {number} diceRoll - The dice roll value
     * @returns {Object} Detailed rent information
     */
    getRentDetails(property, landingPlayer, diceRoll = 0) {
        const rentResult = this.calculateRent(property, landingPlayer, diceRoll);
        
        return {
            ...rentResult,
            propertyName: property.name,
            ownerName: property.owner?.name || 'Bank',
            isMortgaged: property.isMortgaged,
            propertyType: property.type,
            displayText: this.generateRentDisplayText(rentResult, property)
        };
    }

    /**
     * Generate human-readable rent display text
     * @param {Object} rentResult - Rent calculation result
     * @param {Property} property - The property
     * @returns {string} Display text
     */
    generateRentDisplayText(rentResult, property) {
        if (rentResult.amount === 0) {
            return rentResult.reason;
        }

        switch (property.type) {
            case 'property':
                return this.generatePropertyRentText(rentResult.details);
            case 'railroad':
                return this.generateRailroadRentText(rentResult.details);
            case 'utility':
                return this.generateUtilityRentText(rentResult.details);
            default:
                return `Rent: $${rentResult.amount}`;
        }
    }

    /**
     * Generate property rent display text
     * @param {Object} details - Rent details
     * @returns {string} Display text
     */
    generatePropertyRentText(details) {
        if (details.hasHotel) {
            return `Hotel rent: $${details.hotelRent}`;
        } else if (details.houses > 0) {
            return `${details.houses} house${details.houses > 1 ? 's' : ''}: $${details.houseRent}`;
        } else {
            let text = `Base rent: $${details.baseRent}`;
            if (details.monopolyBonus) {
                text += ` (monopoly bonus: ×2)`;
            }
            return text;
        }
    }

    /**
     * Generate railroad rent display text
     * @param {Object} details - Rent details
     * @returns {string} Display text
     */
    generateRailroadRentText(details) {
        return `${details.railroadsOwned} railroad${details.railroadsOwned > 1 ? 's' : ''}: $${details.rentAmount}`;
    }

    /**
     * Generate utility rent display text
     * @param {Object} details - Rent details
     * @returns {string} Display text
     */
    generateUtilityRentText(details) {
        return `${details.diceRoll} × ${details.multiplier} = $${details.rentAmount}`;
    }

    /**
     * Get the reason for property rent calculation
     * @param {Object} details - Rent details
     * @returns {string} Reason text
     */
    getPropertyRentReason(details) {
        if (details.hasHotel) {
            return `Hotel rent for ${details.colorGroup} property`;
        } else if (details.houses > 0) {
            return `${details.houses} house${details.houses > 1 ? 's' : ''} on ${details.colorGroup} property`;
        } else if (details.monopolyBonus) {
            return `Monopoly bonus applied to ${details.colorGroup} property`;
        } else {
            return `Base rent for ${details.colorGroup} property`;
        }
    }

    /**
     * Validate if rent can be collected
     * @param {Property} property - The property
     * @param {Player} landingPlayer - The player who landed
     * @returns {Object} Validation result
     */
    validateRentCollection(property, landingPlayer) {
        const issues = [];

        if (!property.owner) {
            issues.push('Property is unowned');
        }

        if (property.owner === landingPlayer) {
            issues.push('Player owns this property');
        }

        if (property.isMortgaged) {
            issues.push('Property is mortgaged');
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Get rent calculation summary for all properties owned by a player
     * @param {Player} owner - The property owner
     * @returns {Object} Rent summary
     */
    getRentSummary(owner) {
        const summary = {
            properties: [],
            railroads: [],
            utilities: [],
            totalPotentialRent: 0
        };

        owner.properties.forEach(property => {
            if (property.isMortgaged) return;

            let rentInfo;
            switch (property.type) {
                case 'property':
                    rentInfo = this.calculatePropertyRent(property, null);
                    summary.properties.push({
                        name: property.name,
                        rent: rentInfo.amount,
                        details: rentInfo.details
                    });
                    break;
                case 'railroad':
                    rentInfo = this.calculateRailroadRent(property, null);
                    summary.railroads.push({
                        name: property.name,
                        rent: rentInfo.amount,
                        details: rentInfo.details
                    });
                    break;
                case 'utility':
                    rentInfo = this.calculateUtilityRent(property, null, 7); // Default dice roll
                    summary.utilities.push({
                        name: property.name,
                        rent: rentInfo.amount,
                        details: rentInfo.details
                    });
                    break;
            }
            
            summary.totalPotentialRent += rentInfo.amount;
        });

        return summary;
    }
}