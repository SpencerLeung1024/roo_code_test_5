/**
 * Player Model
 * Represents a player in the game
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Player class representing a game participant
 */
export class Player {
    /**
     * Create a new player
     * @param {Object} config - Player configuration
     * @param {string} config.id - Unique player ID
     * @param {string} config.name - Player name
     * @param {string} config.token - Player token identifier
     * @param {number} [config.money] - Starting money (default: 1500)
     */
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.token = config.token;
        this.money = config.money || constants.GAME.STARTING_MONEY;
        this.properties = [];
        this.position = 0;
        this.inJail = false;
        this.jailTurns = 0;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = false;
        this.isActive = true;
        
        // Statistics
        this.stats = {
            totalDiceRolls: 0,
            doublesRolled: 0,
            propertiesOwned: 0,
            housesBuilt: 0,
            hotelsBuilt: 0,
            rentCollected: 0,
            rentPaid: 0,
            moneySpent: 0,
            moneyEarned: 0,
            turnsInJail: 0,
            timesBankrupt: 0
        };
        
        debugLog('info', `Player created: ${this.name} (${this.id})`);
    }

    /**
     * Get player's current position
     * @returns {number} Current board position
     */
    getPosition() {
        return this.position;
    }

    /**
     * Move player to a new position
     * @param {number} newPosition - New board position
     * @returns {number} Number of spaces moved
     */
    moveTo(newPosition) {
        const oldPosition = this.position;
        this.position = newPosition;
        
        // Handle passing GO
        if (newPosition < oldPosition && oldPosition !== 0) {
            this.addMoney(constants.GAME.SALARY);
            debugLog('info', `${this.name} passed GO and collected $${constants.GAME.SALARY}`);
        }
        
        debugLog('info', `${this.name} moved from ${oldPosition} to ${newPosition}`);
        return Math.abs(newPosition - oldPosition);
    }

    /**
     * Add money to player's balance
     * @param {number} amount - Amount to add
     * @param {string} [reason] - Reason for adding money
     */
    addMoney(amount, reason = '') {
        if (amount <= 0) return;
        
        this.money += amount;
        this.stats.moneyEarned += amount;
        
        debugLog('info', `${this.name} received $${amount}${reason ? ` for ${reason}` : ''}`);
        
        // Dispatch event
        this.dispatchEvent('money:changed', {
            player: this,
            amount: amount,
            reason: reason,
            newBalance: this.money
        });
    }

    /**
     * Remove money from player's balance
     * @param {number} amount - Amount to remove
     * @param {string} [reason] - Reason for removing money
     * @returns {boolean} True if successful, false if insufficient funds
     */
    removeMoney(amount, reason = '') {
        if (amount <= 0) return true;
        
        if (this.money >= amount) {
            this.money -= amount;
            this.stats.moneySpent += amount;
            
            debugLog('info', `${this.name} paid $${amount}${reason ? ` for ${reason}` : ''}`);
            
            // Dispatch event
            this.dispatchEvent('money:changed', {
                player: this,
                amount: -amount,
                reason: reason,
                newBalance: this.money
            });
            
            return true;
        }
        
        debugLog('warn', `${this.name} has insufficient funds for $${amount}`);
        return false;
    }

    /**
     * Transfer money to another player
     * @param {Player} recipient - Player to transfer money to
     * @param {number} amount - Amount to transfer
     * @param {string} [reason] - Reason for transfer
     * @returns {boolean} True if successful
     */
    transferMoney(recipient, amount, reason = '') {
        if (this.removeMoney(amount, reason)) {
            recipient.addMoney(amount, reason);
            return true;
        }
        return false;
    }

    /**
     * Add a property to player's portfolio
     * @param {Property} property - Property to add
     */
    addProperty(property) {
        if (!this.properties.find(p => p.id === property.id)) {
            this.properties.push(property);
            property.owner = this;
            this.stats.propertiesOwned++;
            
            debugLog('info', `${this.name} acquired ${property.name}`);
            
            // Dispatch event
            this.dispatchEvent('property:acquired', {
                player: this,
                property: property
            });
        }
    }

    /**
     * Remove a property from player's portfolio
     * @param {Property} property - Property to remove
     */
    removeProperty(property) {
        const index = this.properties.findIndex(p => p.id === property.id);
        if (index !== -1) {
            this.properties.splice(index, 1);
            property.owner = null;
            this.stats.propertiesOwned--;
            
            debugLog('info', `${this.name} lost ${property.name}`);
            
            // Dispatch event
            this.dispatchEvent('property:removed', {
                player: this,
                property: property
            });
        }
    }

    /**
     * Get total value of player's assets
     * @returns {number} Total asset value
     */
    getTotalAssets() {
        let total = this.money;
        
        // Add property values
        this.properties.forEach(property => {
            total += property.getValue();
        });
        
        // Add card values
        total += this.getOutOfJailFreeCards * 50; // Estimated value
        
        return total;
    }

    /**
     * Get net worth of player
     * @returns {number} Net worth
     */
    getNetWorth() {
        return this.getTotalAssets();
    }

    /**
     * Send player to jail
     */
    goToJail() {
        this.inJail = true;
        this.jailTurns = 0;
        this.position = constants.BOARD.JAIL_POSITION;
        
        debugLog('info', `${this.name} went to jail`);
        
        // Dispatch event
        this.dispatchEvent('jail:entered', {
            player: this
        });
    }

    /**
     * Release player from jail
     * @param {boolean} [usedCard=false] - Whether a Get Out of Jail Free card was used
     */
    getOutOfJail(usedCard = false) {
        this.inJail = false;
        this.jailTurns = 0;
        
        if (usedCard && this.getOutOfJailFreeCards > 0) {
            this.getOutOfJailFreeCards--;
        }
        
        debugLog('info', `${this.name} got out of jail`);
        
        // Dispatch event
        this.dispatchEvent('jail:exited', {
            player: this,
            usedCard: usedCard
        });
    }

    /**
     * Declare player bankrupt
     * @param {Player} [creditor=null] - Player who caused bankruptcy
     */
    declareBankrupt(creditor = null) {
        this.isBankrupt = true;
        this.isActive = false;
        this.stats.timesBankrupt++;
        
        // Transfer all properties to creditor
        if (creditor) {
            const propertiesToTransfer = [...this.properties];
            propertiesToTransfer.forEach(property => {
                this.removeProperty(property);
                creditor.addProperty(property);
            });
        } else {
            // Return properties to bank
            this.properties.forEach(property => {
                this.removeProperty(property);
            });
        }
        
        debugLog('info', `${this.name} declared bankruptcy`);
        
        // Dispatch event
        this.dispatchEvent('player:bankrupt', {
            player: this,
            creditor: creditor
        });
    }

    /**
     * Check if player can afford a purchase
     * @param {number} amount - Amount to check
     * @returns {boolean} True if player can afford
     */
    canAfford(amount) {
        return this.money >= amount;
    }

    /**
     * Get player's properties by group
     * @param {string} group - Property group name
     * @returns {Property[]} Properties in the group
     */
    getPropertiesByGroup(group) {
        return this.properties.filter(property => property.colorGroup === group);
    }

    /**
     * Check if player owns all properties in a group
     * @param {string} group - Property group name
     * @returns {boolean} True if owns all properties
     */
    ownsCompleteGroup(group) {
        const groupProperties = this.getPropertiesByGroup(group);
        const totalInGroup = this.getTotalPropertiesInGroup(group);
        return groupProperties.length === totalInGroup;
    }

    /**
     * Get total number of properties in a group
     * @param {string} group - Property group name
     * @returns {number} Total properties in group
     */
    getTotalPropertiesInGroup(group) {
        const groupConfig = constants.PROPERTY_GROUPS[group.toUpperCase()];
        return groupConfig ? 2 : 0; // Most groups have 2 properties
    }

    /**
     * Get player's railroad count
     * @returns {number} Number of railroads owned
     */
    getRailroadCount() {
        return this.properties.filter(p => p.type === 'railroad').length;
    }

    /**
     * Get player's utility count
     * @returns {number} Number of utilities owned
     */
    getUtilityCount() {
        return this.properties.filter(p => p.type === 'utility').length;
    }

    /**
     * Serialize player data for saving
     * @returns {Object} Serialized player data
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            token: this.token,
            money: this.money,
            position: this.position,
            inJail: this.inJail,
            jailTurns: this.jailTurns,
            getOutOfJailFreeCards: this.getOutOfJailFreeCards,
            isBankrupt: this.isBankrupt,
            isActive: this.isActive,
            stats: { ...this.stats },
            properties: this.properties.map(p => p.id)
        };
    }

    /**
     * Deserialize player data from saved state
     * @param {Object} data - Serialized player data
     * @returns {Player} Player instance
     */
    static deserialize(data) {
        const player = new Player({
            id: data.id,
            name: data.name,
            token: data.token,
            money: data.money
        });
        
        player.position = data.position;
        player.inJail = data.inJail;
        player.jailTurns = data.jailTurns;
        player.getOutOfJailFreeCards = data.getOutOfJailFreeCards;
        player.isBankrupt = data.isBankrupt;
        player.isActive = data.isActive;
        player.stats = { ...data.stats };
        
        return player;
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Get player display info
     * @returns {Object} Display information
     */
    getDisplayInfo() {
        return {
            id: this.id,
            name: this.name,
            token: this.token,
            money: this.money,
            position: this.position,
            inJail: this.inJail,
            jailTurns: this.jailTurns,
            getOutOfJailFreeCards: this.getOutOfJailFreeCards,
            isBankrupt: this.isBankrupt,
            isActive: this.isActive,
            propertiesCount: this.properties.length,
            netWorth: this.getNetWorth()
        };
    }

    /**
     * Get player's properties organized by color group
     * @returns {Object} Properties grouped by color
     */
    getPropertiesByColorGroup() {
        const groups = {};
        
        this.properties.forEach(property => {
            const group = property.colorGroup || property.type;
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(property);
        });
        
        return groups;
    }

    /**
     * Get total number of houses and hotels
     * @returns {Object} Count of houses and hotels
     */
    getBuildingCount() {
        let houses = 0;
        let hotels = 0;
        
        this.properties.forEach(property => {
            if (property.houses) {
                if (property.houses === 5) {
                    hotels++;
                } else {
                    houses += property.houses;
                }
            }
        });
        
        return { houses, hotels };
    }

    /**
     * Get mortgaged properties
     * @returns {Property[]} Mortgaged properties
     */
    getMortgagedProperties() {
        return this.properties.filter(property => property.isMortgaged);
    }

    /**
     * Get unmortgaged properties
     * @returns {Property[]} Unmortgaged properties
     */
    getUnmortgagedProperties() {
        return this.properties.filter(property => !property.isMortgaged);
    }

    /**
     * Check if player has any mortgaged properties
     * @returns {boolean} True if has mortgaged properties
     */
    hasMortgagedProperties() {
        return this.getMortgagedProperties().length > 0;
    }

    /**
     * Get total mortgage value of all properties
     * @returns {number} Total mortgage value
     */
    getTotalMortgageValue() {
        return this.properties.reduce((total, property) => {
            return total + (property.mortgageValue || 0);
        }, 0);
    }

    /**
     * Get total unmortgage cost for all mortgaged properties
     * @returns {number} Total unmortgage cost
     */
    getTotalUnmortgageCost() {
        return this.properties.reduce((total, property) => {
            if (property.isMortgaged) {
                return total + Math.floor((property.mortgageValue || 0) * 1.1);
            }
            return total;
        }, 0);
    }

    /**
     * Check if player can build houses on a color group
     * @param {string} colorGroup - Color group name
     * @returns {boolean} True if can build houses
     */
    canBuildHouses(colorGroup) {
        if (!this.ownsCompleteGroup(colorGroup)) return false;
        
        const groupProperties = this.getPropertiesByGroup(colorGroup);
        return groupProperties.every(property => !property.isMortgaged);
    }

    /**
     * Get next jail turn
     * @returns {number} Next jail turn number
     */
    getNextJailTurn() {
        if (!this.inJail) return 0;
        return this.jailTurns + 1;
    }

    /**
     * Check if player must leave jail next turn
     * @returns {boolean} True if must leave jail
     */
    mustLeaveJail() {
        return this.inJail && this.jailTurns >= 2;
    }

    /**
     * Get player's ranking among all players
     * @param {Player[]} allPlayers - All players in the game
     * @returns {number} Player's rank (1-based)
     */
    getRank(allPlayers) {
        const sortedPlayers = allPlayers
            .filter(p => !p.isBankrupt)
            .sort((a, b) => b.getNetWorth() - a.getNetWorth());
        
        const rank = sortedPlayers.findIndex(p => p.id === this.id) + 1;
        return rank || allPlayers.length; // Return last place if bankrupt
    }

    /**
     * Get player summary for game over screen
     * @returns {Object} Player summary
     */
    getGameSummary() {
        const buildings = this.getBuildingCount();
        
        return {
            name: this.name,
            token: this.token,
            finalMoney: this.money,
            netWorth: this.getNetWorth(),
            propertiesOwned: this.properties.length,
            housesBuilt: buildings.houses,
            hotelsBuilt: buildings.hotels,
            timesInJail: this.stats.turnsInJail,
            totalDiceRolls: this.stats.totalDiceRolls,
            isBankrupt: this.isBankrupt
        };
    }

    /**
     * Reset player to initial state
     */
    reset() {
        this.money = constants.GAME.STARTING_MONEY;
        this.properties = [];
        this.position = 0;
        this.inJail = false;
        this.jailTurns = 0;
        this.getOutOfJailFreeCards = 0;
        this.isBankrupt = false;
        this.isActive = true;
        
        // Reset stats
        this.stats = {
            totalDiceRolls: 0,
            doublesRolled: 0,
            propertiesOwned: 0,
            housesBuilt: 0,
            hotelsBuilt: 0,
            rentCollected: 0,
            rentPaid: 0,
            moneySpent: 0,
            moneyEarned: 0,
            turnsInJail: 0,
            timesBankrupt: 0
        };
        
        debugLog('info', `Player reset: ${this.name}`);
    }

    /**
     * Clone player for undo functionality
     * @returns {Player} Cloned player
     */
    clone() {
        const cloned = new Player({
            id: this.id,
            name: this.name,
            token: this.token,
            money: this.money
        });
        
        cloned.position = this.position;
        cloned.inJail = this.inJail;
        cloned.jailTurns = this.jailTurns;
        cloned.getOutOfJailFreeCards = this.getOutOfJailFreeCards;
        cloned.isBankrupt = this.isBankrupt;
        cloned.isActive = this.isActive;
        cloned.stats = { ...this.stats };
        
        // Note: Properties are not cloned, they should be re-associated
        return cloned;
    }
}