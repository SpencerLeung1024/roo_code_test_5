/**
 * Property Transaction Service
 * Handles all property-related transactions in the game
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Service for managing property transactions
 */
export class PropertyTransactionService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.transactions = [];
        this.auctionInProgress = false;
        this.currentAuction = null;
    }

    /**
     * Purchase a property from the bank
     * @param {Player} player - The player purchasing the property
     * @param {Property} property - The property to purchase
     * @returns {Object} Transaction result
     */
    purchaseProperty(player, property) {
        if (!this.canPurchaseProperty(player, property)) {
            return {
                success: false,
                error: 'Cannot purchase property',
                reason: this.getPurchaseError(player, property)
            };
        }

        const transaction = {
            id: this.generateTransactionId(),
            type: 'purchase',
            player: player,
            property: property,
            amount: property.price,
            timestamp: new Date(),
            status: 'completed'
        };

        // Execute transaction
        player.removeMoney(property.price, `Purchased ${property.name}`);
        player.addProperty(property);
        property.setOwner(player);

        this.transactions.push(transaction);
        this.logTransaction(transaction);

        // Dispatch event
        this.dispatchEvent('property:purchased', {
            transaction: transaction,
            player: player,
            property: property
        });

        return {
            success: true,
            transaction: transaction
        };
    }

    /**
     * Check if a player can purchase a property
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {boolean} True if purchase is possible
     */
    canPurchaseProperty(player, property) {
        return (
            property.owner === null &&
            !property.isMortgaged &&
            player.canAfford(property.price) &&
            !player.isBankrupt &&
            player.isActive
        );
    }

    /**
     * Get the reason why a property cannot be purchased
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {string} Error message
     */
    getPurchaseError(player, property) {
        if (property.owner !== null) {
            return 'Property is already owned';
        }
        if (property.isMortgaged) {
            return 'Property is mortgaged';
        }
        if (!player.canAfford(property.price)) {
            return 'Insufficient funds';
        }
        if (player.isBankrupt) {
            return 'Player is bankrupt';
        }
        if (!player.isActive) {
            return 'Player is not active';
        }
        return 'Unknown error';
    }

    /**
     * Start an auction for a property
     * @param {Property} property - The property to auction
     * @param {Player[]} players - All players who can participate
     * @returns {Object} Auction object
     */
    startAuction(property, players) {
        if (this.auctionInProgress) {
            return {
                success: false,
                error: 'Auction already in progress'
            };
        }

        const eligiblePlayers = players.filter(p => p.isActive && !p.isBankrupt);
        
        this.currentAuction = {
            id: this.generateTransactionId(),
            property: property,
            players: eligiblePlayers,
            bids: {},
            currentBid: 0,
            currentLeader: null,
            round: 0,
            status: 'active',
            startTime: new Date()
        };

        this.auctionInProgress = true;
        
        // Dispatch event
        this.dispatchEvent('auction:started', {
            auction: this.currentAuction
        });

        return {
            success: true,
            auction: this.currentAuction
        };
    }

    /**
     * Place a bid in the current auction
     * @param {Player} player - The player bidding
     * @param {number} amount - The bid amount
     * @returns {Object} Bid result
     */
    placeBid(player, amount) {
        if (!this.auctionInProgress || !this.currentAuction) {
            return {
                success: false,
                error: 'No active auction'
            };
        }

        if (!this.currentAuction.players.includes(player)) {
            return {
                success: false,
                error: 'Player not eligible for auction'
            };
        }

        if (amount <= this.currentAuction.currentBid) {
            return {
                success: false,
                error: 'Bid must be higher than current bid'
            };
        }

        if (!player.canAfford(amount)) {
            return {
                success: false,
                error: 'Insufficient funds'
            };
        }

        this.currentAuction.bids[player.id] = amount;
        this.currentAuction.currentBid = amount;
        this.currentAuction.currentLeader = player;

        // Dispatch event
        this.dispatchEvent('auction:bid', {
            auction: this.currentAuction,
            player: player,
            amount: amount
        });

        return {
            success: true,
            auction: this.currentAuction
        };
    }

    /**
     * End the current auction and transfer property
     * @returns {Object} Auction result
     */
    endAuction() {
        if (!this.auctionInProgress || !this.currentAuction) {
            return {
                success: false,
                error: 'No active auction'
            };
        }

        const auction = this.currentAuction;
        const winner = auction.currentLeader;
        
        if (winner && auction.currentBid > 0) {
            // Execute auction sale
            const transaction = {
                id: auction.id,
                type: 'auction',
                player: winner,
                property: auction.property,
                amount: auction.currentBid,
                timestamp: new Date(),
                status: 'completed',
                bids: auction.bids
            };

            winner.removeMoney(auction.currentBid, `Won auction for ${auction.property.name}`);
            winner.addProperty(auction.property);
            auction.property.setOwner(winner);

            this.transactions.push(transaction);
            this.logTransaction(transaction);

            // Dispatch event
            this.dispatchEvent('auction:completed', {
                auction: auction,
                winner: winner,
                amount: auction.currentBid
            });
        }

        this.auctionInProgress = false;
        this.currentAuction = null;

        return {
            success: true,
            winner: winner,
            amount: auction.currentBid
        };
    }

    /**
     * Mortgage a property
     * @param {Player} player - The player mortgaging the property
     * @param {Property} property - The property to mortgage
     * @returns {Object} Transaction result
     */
    mortgageProperty(player, property) {
        if (!this.canMortgageProperty(player, property)) {
            return {
                success: false,
                error: 'Cannot mortgage property',
                reason: this.getMortgageError(player, property)
            };
        }

        const mortgageValue = property.getMortgageValue();
        const transaction = {
            id: this.generateTransactionId(),
            type: 'mortgage',
            player: player,
            property: property,
            amount: mortgageValue,
            timestamp: new Date(),
            status: 'completed'
        };

        // Execute mortgage
        player.addMoney(mortgageValue, `Mortgaged ${property.name}`);
        property.mortgage();

        this.transactions.push(transaction);
        this.logTransaction(transaction);

        // Dispatch event
        this.dispatchEvent('property:mortgaged', {
            transaction: transaction,
            player: player,
            property: property,
            amount: mortgageValue
        });

        return {
            success: true,
            transaction: transaction,
            amount: mortgageValue
        };
    }

    /**
     * Unmortgage a property
     * @param {Player} player - The player unmortgaging the property
     * @param {Property} property - The property to unmortgage
     * @returns {Object} Transaction result
     */
    unmortgageProperty(player, property) {
        if (!this.canUnmortgageProperty(player, property)) {
            return {
                success: false,
                error: 'Cannot unmortgage property',
                reason: this.getUnmortgageError(player, property)
            };
        }

        const unmortgageCost = property.getUnmortgageCost();
        const transaction = {
            id: this.generateTransactionId(),
            type: 'unmortgage',
            player: player,
            property: property,
            amount: unmortgageCost,
            timestamp: new Date(),
            status: 'completed'
        };

        // Execute unmortgage
        player.removeMoney(unmortgageCost, `Unmortgaged ${property.name}`);
        property.unmortgage();

        this.transactions.push(transaction);
        this.logTransaction(transaction);

        // Dispatch event
        this.dispatchEvent('property:unmortgaged', {
            transaction: transaction,
            player: player,
            property: property,
            amount: unmortgageCost
        });

        return {
            success: true,
            transaction: transaction,
            amount: unmortgageCost
        };
    }

    /**
     * Trade properties between players
     * @param {Player} fromPlayer - Player giving properties/money
     * @param {Player} toPlayer - Player receiving properties/money
     * @param {Object} trade - Trade details
     * @returns {Object} Trade result
     */
    tradeProperties(fromPlayer, toPlayer, trade) {
        const { propertiesFrom, propertiesTo, moneyFrom, moneyTo } = trade;

        // Validate trade
        const validation = this.validateTrade(fromPlayer, toPlayer, trade);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }

        const transaction = {
            id: this.generateTransactionId(),
            type: 'trade',
            fromPlayer: fromPlayer,
            toPlayer: toPlayer,
            propertiesFrom: propertiesFrom,
            propertiesTo: propertiesTo,
            moneyFrom: moneyFrom || 0,
            moneyTo: moneyTo || 0,
            timestamp: new Date(),
            status: 'completed'
        };

        // Execute trade
        if (moneyFrom) {
            fromPlayer.removeMoney(moneyFrom, `Trade with ${toPlayer.name}`);
            toPlayer.addMoney(moneyFrom, `Trade with ${fromPlayer.name}`);
        }

        if (moneyTo) {
            toPlayer.removeMoney(moneyTo, `Trade with ${fromPlayer.name}`);
            fromPlayer.addMoney(moneyTo, `Trade with ${toPlayer.name}`);
        }

        // Transfer properties
        propertiesFrom.forEach(property => {
            fromPlayer.removeProperty(property);
            toPlayer.addProperty(property);
        });

        propertiesTo.forEach(property => {
            toPlayer.removeProperty(property);
            fromPlayer.addProperty(property);
        });

        this.transactions.push(transaction);
        this.logTransaction(transaction);

        // Dispatch event
        this.dispatchEvent('property:traded', {
            transaction: transaction,
            fromPlayer: fromPlayer,
            toPlayer: toPlayer
        });

        return {
            success: true,
            transaction: transaction
        };
    }

    /**
     * Validate a trade between players
     * @param {Player} fromPlayer - Player giving properties/money
     * @param {Player} toPlayer - Player receiving properties/money
     * @param {Object} trade - Trade details
     * @returns {Object} Validation result
     */
    validateTrade(fromPlayer, toPlayer, trade) {
        const { propertiesFrom, propertiesTo, moneyFrom, moneyTo } = trade;

        // Check if players are valid
        if (!fromPlayer || !toPlayer || fromPlayer === toPlayer) {
            return { valid: false, error: 'Invalid players' };
        }

        if (fromPlayer.isBankrupt || toPlayer.isBankrupt) {
            return { valid: false, error: 'Cannot trade with bankrupt players' };
        }

        if (!fromPlayer.isActive || !toPlayer.isActive) {
            return { valid: false, error: 'Cannot trade with inactive players' };
        }

        // Check if players own the properties they're trading
        for (const property of propertiesFrom) {
            if (property.owner !== fromPlayer) {
                return { valid: false, error: `${fromPlayer.name} does not own ${property.name}` };
            }
        }

        for (const property of propertiesTo) {
            if (property.owner !== toPlayer) {
                return { valid: false, error: `${toPlayer.name} does not own ${property.name}` };
            }
        }

        // Check if players can afford the money
        if (moneyFrom && !fromPlayer.canAfford(moneyFrom)) {
            return { valid: false, error: `${fromPlayer.name} cannot afford $${moneyFrom}` };
        }

        if (moneyTo && !toPlayer.canAfford(moneyTo)) {
            return { valid: false, error: `${toPlayer.name} cannot afford $${moneyTo}` };
        }

        return { valid: true };
    }

    /**
     * Check if a property can be mortgaged
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {boolean} True if mortgage is possible
     */
    canMortgageProperty(player, property) {
        return (
            property.owner === player &&
            !property.isMortgaged &&
            !player.isBankrupt &&
            player.isActive
        );
    }

    /**
     * Check if a property can be unmortgaged
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {boolean} True if unmortgage is possible
     */
    canUnmortgageProperty(player, property) {
        return (
            property.owner === player &&
            property.isMortgaged &&
            player.canAfford(property.getUnmortgageCost()) &&
            !player.isBankrupt &&
            player.isActive
        );
    }

    /**
     * Get the reason why a property cannot be mortgaged
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {string} Error message
     */
    getMortgageError(player, property) {
        if (property.owner !== player) {
            return 'Player does not own this property';
        }
        if (property.isMortgaged) {
            return 'Property is already mortgaged';
        }
        if (player.isBankrupt) {
            return 'Player is bankrupt';
        }
        if (!player.isActive) {
            return 'Player is not active';
        }
        return 'Unknown error';
    }

    /**
     * Get the reason why a property cannot be unmortgaged
     * @param {Player} player - The player
     * @param {Property} property - The property
     * @returns {string} Error message
     */
    getUnmortgageError(player, property) {
        if (property.owner !== player) {
            return 'Player does not own this property';
        }
        if (!property.isMortgaged) {
            return 'Property is not mortgaged';
        }
        if (!player.canAfford(property.getUnmortgageCost())) {
            return 'Insufficient funds';
        }
        if (player.isBankrupt) {
            return 'Player is bankrupt';
        }
        if (!player.isActive) {
            return 'Player is not active';
        }
        return 'Unknown error';
    }

    /**
     * Get all transactions for a player
     * @param {Player} player - The player
     * @returns {Array} Array of transactions
     */
    getPlayerTransactions(player) {
        return this.transactions.filter(t => 
            t.player === player || 
            t.fromPlayer === player || 
            t.toPlayer === player
        );
    }

    /**
     * Get all transactions for a property
     * @param {Property} property - The property
     * @returns {Array} Array of transactions
     */
    getPropertyTransactions(property) {
        return this.transactions.filter(t => 
            t.property === property || 
            t.propertiesFrom?.includes(property) || 
            t.propertiesTo?.includes(property)
        );
    }

    /**
     * Generate a unique transaction ID
     * @returns {string} Transaction ID
     */
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log a transaction
     * @param {Object} transaction - The transaction to log
     */
    logTransaction(transaction) {
        debugLog('info', 'Transaction:', transaction);
    }

    /**
     * Dispatch a custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Get transaction history
     * @returns {Array} All transactions
     */
    getTransactionHistory() {
        return [...this.transactions];
    }

    /**
     * Clear transaction history
     */
    clearTransactionHistory() {
        this.transactions = [];
    }

    /**
     * Get current auction status
     * @returns {Object|null} Current auction or null
     */
    getCurrentAuction() {
        return this.currentAuction;
    }

    /**
     * Check if an auction is in progress
     * @returns {boolean} True if auction is active
     */
    isAuctionInProgress() {
        return this.auctionInProgress;
    }
}