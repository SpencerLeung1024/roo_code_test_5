/**
 * Landing Event Service
 * Handles events when players land on different squares
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';
import { RentCalculationService } from './RentCalculationService.js';

/**
 * Service for handling landing events on the board
 */
export class LandingEventService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.propertyService = gameEngine.propertyService;
        this.playerManager = gameEngine.playerManager;
    }

    /**
     * Handle player landing on a square
     * @param {Player} player - The player who landed
     * @param {number} position - The position landed on
     * @returns {Promise} Promise that resolves when the event is handled
     */
    async handleLandingEvent(player, position) {
        const board = this.gameEngine.board;
        const square = board.getSquare(position);
        
        if (!square) {
            debugLog('error', `Invalid square position: ${position}`);
            return;
        }

        debugLog('info', `${player.name} landed on ${square.name} (${square.type})`);

        switch (square.type) {
            case 'property':
            case 'railroad':
            case 'utility':
                await this.handlePropertyLanding(player, square);
                break;
            case 'tax':
                await this.handleTaxLanding(player, square);
                break;
            case 'chance':
                await this.handleChanceLanding(player);
                break;
            case 'community-chest':
                await this.handleCommunityChestLanding(player);
                break;
            case 'go-to-jail':
                await this.handleGoToJailLanding(player);
                break;
            case 'jail':
                await this.handleJailLanding(player, square);
                break;
            case 'go':
            case 'free-parking':
                // No action needed for these
                break;
            default:
                debugLog('info', `No special action for ${square.type}`);
        }
    }

    /**
     * Handle landing on a property (property, railroad, or utility)
     * @param {Player} player - The player
     * @param {Square} square - The square landed on
     */
    async handlePropertyLanding(player, square) {
        const property = square.data;
        
        if (!property) {
            debugLog('error', 'No property data found for square');
            return;
        }

        // Check if property is unowned
        if (property.owner === null) {
            await this.handleUnownedProperty(player, property);
        } else if (property.owner !== player) {
            await this.handleOwnedProperty(player, property);
        } else {
            // Player owns this property
            debugLog('info', `${player.name} landed on their own property: ${property.name}`);
        }
    }

    /**
     * Handle landing on an unowned property
     * @param {Player} player - The player
     * @param {Property} property - The unowned property
     */
    async handleUnownedProperty(player, property) {
        debugLog('info', `${player.name} landed on unowned property: ${property.name}`);

        // Show purchase modal
        if (this.gameEngine.uiManager && this.gameEngine.uiManager.propertyModal) {
            this.gameEngine.uiManager.propertyModal.showPurchaseModal(property, player);
        } else {
            // Fallback: auto-purchase if player can afford
            if (this.propertyService.canPurchaseProperty(player, property)) {
                const result = this.propertyService.purchaseProperty(player, property);
                if (result.success) {
                    alert(`${player.name} purchased ${property.name} for $${property.price}`);
                }
            } else {
                // Start auction
                const players = this.playerManager.getActivePlayers();
                this.propertyService.startAuction(property, players);
                alert(`Auction started for ${property.name}`);
            }
        }
    }

    /**
     * Handle landing on an owned property (pay rent)
     * @param {Player} player - The player who landed
     * @param {Property} property - The owned property
     */
    async handleOwnedProperty(player, property) {
        const diceRoll = this.gameEngine.diceManager?.getLastRoll()?.total || 0;
        const rentResult = this.rentService.calculateRent(property, player, diceRoll);
        
        if (rentResult.amount === 0) {
            debugLog('info', `${property.name}: ${rentResult.reason}`);
            return;
        }

        const owner = property.owner;
        const rentAmount = rentResult.amount;

        debugLog('info', `${player.name} owes $${rentAmount} rent to ${owner.name} for ${property.name}`);
        
        // Log the rent transaction
        this.logRentTransaction(player, owner, property, rentAmount, rentResult);

        if (player.canAfford(rentAmount)) {
            // Successful rent payment
            const success = player.transferMoney(owner, rentAmount, `Rent for ${property.name}`);
            if (success) {
                // Update statistics
                player.stats.rentPaid += rentAmount;
                owner.stats.rentCollected += rentAmount;
                
                this.showRentPaymentAlert(player, owner, property, rentAmount, rentResult);
            }
        } else {
            // Handle bankruptcy
            await this.handleBankruptcy(player, owner, rentAmount);
        }
    }

    /**
     * Handle landing on a tax square
     * @param {Player} player - The player
     * @param {Square} square - The tax square
     */
    async handleTaxLanding(player, square) {
        const taxAmount = square.data?.amount || 0;
        
        if (taxAmount > 0) {
            debugLog('info', `${player.name} owes $${taxAmount} in taxes`);
            
            if (player.canAfford(taxAmount)) {
                player.removeMoney(taxAmount, square.name);
                alert(`${player.name} paid $${taxAmount} for ${square.name}`);
            } else {
                await this.handleBankruptcy(player, null, taxAmount);
            }
        }
    }

    /**
     * Handle landing on Chance
     * @param {Player} player - The player
     */
    async handleChanceLanding(player) {
        debugLog('info', `${player.name} landed on Chance`);
        // TODO: Implement Chance card drawing
        alert(`${player.name} drew a Chance card (not implemented yet)`);
    }

    /**
     * Handle landing on Community Chest
     * @param {Player} player - The player
     */
    async handleCommunityChestLanding(player) {
        debugLog('info', `${player.name} landed on Community Chest`);
        // TODO: Implement Community Chest card drawing
        alert(`${player.name} drew a Community Chest card (not implemented yet)`);
    }

    /**
     * Handle landing on Go to Jail
     * @param {Player} player - The player
     */
    async handleGoToJailLanding(player) {
        debugLog('info', `${player.name} landed on Go to Jail`);
        player.goToJail();
        alert(`${player.name} went to jail!`);
    }

    /**
     * Handle landing on Jail (just visiting)
     * @param {Player} player - The player
     * @param {Square} square - The jail square
     */
    async handleJailLanding(player, square) {
        if (player.inJail) {
            debugLog('info', `${player.name} is in jail`);
            // Handle jail logic
            if (player.mustLeaveJail()) {
                player.getOutOfJail();
                alert(`${player.name} must leave jail`);
            } else {
                alert(`${player.name} is in jail (turn ${player.jailTurns + 1}/3)`);
            }
        } else {
            debugLog('info', `${player.name} is just visiting jail`);
            alert(`${player.name} is just visiting jail`);
        }
    }

    /**
     * Handle player bankruptcy
     * @param {Player} player - The bankrupt player
     * @param {Player|null} creditor - The player owed money (null if bank)
     * @param {number} amount - The amount owed
     */
    async handleBankruptcy(player, creditor, amount) {
        debugLog('info', `${player.name} cannot pay $${amount}, handling bankruptcy`);
        
        // Check if player can raise funds by mortgaging properties
        const totalMortgageValue = player.getTotalMortgageValue();
        const totalAssets = player.getTotalAssets();
        
        if (totalAssets >= amount) {
            // Player can pay by mortgaging properties
            alert(`${player.name} needs to raise $${amount - player.money} to avoid bankruptcy`);
            this.showMortgageOptions(player, amount - player.money);
        } else {
            // Player is bankrupt
            player.declareBankrupt(creditor);
            alert(`${player.name} has declared bankruptcy!`);
            
            if (creditor) {
                alert(`${creditor.name} receives all of ${player.name}'s properties`);
            }
        }
    }

    /**
     * Show mortgage options to avoid bankruptcy
     * @param {Player} player - The player
     * @param {number} neededAmount - Amount needed
     */
    showMortgageOptions(player, neededAmount) {
        if (this.gameEngine.uiManager && this.gameEngine.uiManager.propertyModal) {
            this.gameEngine.uiManager.propertyModal.showManagementModal(player);
            alert(`You need $${neededAmount}. Mortgage properties to raise funds.`);
        } else {
            // Fallback: auto-mortgage
            const unmortgaged = player.getUnmortgagedProperties();
            let raised = 0;
            
            for (const property of unmortgaged) {
                if (raised >= neededAmount) break;
                
                const mortgageValue = property.getMortgageValue();
                this.propertyService.mortgageProperty(player, property);
                raised += mortgageValue;
            }
            
            alert(`Auto-mortgaged properties to raise $${raised}`);
        }
    }

    /**
     * Check if a player can pay rent
     * @param {Player} player - The player
     * @param {number} amount - The amount needed
     * @returns {boolean} True if player can pay
     */
    canPayRent(player, amount) {
        return player.getTotalAssets() >= amount;
    }

    /**
     * Log rent transaction
     * @param {Player} payer - The player paying rent
     * @param {Player} owner - The property owner
     * @param {Property} property - The property
     * @param {number} amount - The rent amount
     * @param {Object} rentResult - Rent calculation details
     */
    logRentTransaction(payer, owner, property, amount, rentResult) {
        const transaction = {
            type: 'rent_payment',
            payer: payer,
            owner: owner,
            property: property,
            amount: amount,
            details: rentResult.details,
            timestamp: new Date()
        };

        // Dispatch custom event for rent payment
        const event = new CustomEvent('rent:paid', { detail: transaction });
        document.dispatchEvent(event);

        debugLog('info', 'Rent transaction:', transaction);
    }

    /**
     * Show rent payment alert
     * @param {Player} payer - The player paying rent
     * @param {Player} owner - The property owner
     * @param {Property} property - The property
     * @param {number} amount - The rent amount
     * @param {Object} rentResult - Rent calculation details
     */
    showRentPaymentAlert(payer, owner, property, amount, rentResult) {
        const message = `${payer.name} paid $${amount} rent to ${owner.name} for ${property.name}\n\n${rentResult.reason}`;
        
        if (this.gameEngine.uiManager && this.gameEngine.uiManager.notificationService) {
            this.gameEngine.uiManager.notificationService.show({
                type: 'rent_payment',
                title: 'Rent Paid',
                message: message,
                duration: 3000
            });
        } else {
            alert(message);
        }
    }

    /**
     * Get the total rent for a property
     * @param {Property} property - The property
     * @param {Player} owner - The owner
     * @returns {number} Total rent amount
     */
    getTotalRent(property, owner) {
        const diceRoll = this.gameEngine.diceManager?.getLastRoll()?.total || 7;
        const rentResult = this.rentService.calculateRent(property, null, diceRoll);
        return rentResult.amount;
    }
}