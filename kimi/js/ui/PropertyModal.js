/**
 * Property Modal Manager
 * Handles property-related modals and UI interactions
 */

import { constants } from '../config/constants.js';

/**
 * Manages property purchase, auction, and management modals
 */
export class PropertyModal {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentModal = null;
        this.currentProperty = null;
    }

    /**
     * Show property purchase modal
     * @param {Property} property - The property to purchase
     * @param {Player} player - The current player
     */
    showPurchaseModal(property, player) {
        this.currentProperty = property;
        
        const modal = this.createModal('property-purchase-modal');
        const content = this.createPurchaseContent(property, player);
        
        modal.querySelector('.modal-content').innerHTML = content;
        document.body.appendChild(modal);
        
        this.currentModal = modal;
        this.bindPurchaseEvents(modal, property, player);
    }

    /**
     * Show auction modal
     * @param {Property} property - The property being auctioned
     * @param {Player[]} players - All players participating
     */
    showAuctionModal(property, players) {
        this.currentProperty = property;
        
        const modal = this.createModal('property-auction-modal');
        const content = this.createAuctionContent(property, players);
        
        modal.querySelector('.modal-content').innerHTML = content;
        document.body.appendChild(modal);
        
        this.currentModal = modal;
        this.bindAuctionEvents(modal, property, players);
    }

    /**
     * Show property management modal
     * @param {Player} player - The player managing properties
     */
    showManagementModal(player) {
        const modal = this.createModal('property-management-modal');
        const content = this.createManagementContent(player);
        
        modal.querySelector('.modal-content').innerHTML = content;
        document.body.appendChild(modal);
        
        this.currentModal = modal;
        this.bindManagementEvents(modal, player);
    }

    /**
     * Create a basic modal structure
     * @param {string} className - CSS class for the modal
     * @returns {HTMLElement} Modal element
     */
    createModal(className) {
        const modal = document.createElement('div');
        modal.className = `modal ${className}`;
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-content"></div>
            </div>
        `;
        
        // Close modal on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        return modal;
    }

    /**
     * Create purchase modal content
     * @param {Property} property - The property
     * @param {Player} player - The player
     * @returns {string} HTML content
     */
    createPurchaseContent(property, player) {
        const canAfford = player.canAfford(property.price);
        const rentInfo = this.getRentInfo(property);
        
        return `
            <div class="modal-header">
                <h2>Purchase Property</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="property-details">
                    <h3>${property.name}</h3>
                    <div class="property-info">
                        <p><strong>Type:</strong> ${this.formatPropertyType(property.type)}</p>
                        ${property.colorGroup ? `<p><strong>Color Group:</strong> ${this.formatColorGroup(property.colorGroup)}</p>` : ''}
                        <p><strong>Price:</strong> $${property.price}</p>
                        <p><strong>Mortgage Value:</strong> $${property.getMortgageValue()}</p>
                    </div>
                    
                    <div class="rent-info">
                        <h4>Rent Information</h4>
                        ${rentInfo}
                    </div>
                    
                    <div class="player-info">
                        <h4>Your Information</h4>
                        <p><strong>Current Money:</strong> $${player.money}</p>
                        <p><strong>Can Afford:</strong> ${canAfford ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary purchase-btn" ${!canAfford ? 'disabled' : ''}>
                    Purchase for $${property.price}
                </button>
                <button class="btn btn-secondary decline-btn">Decline</button>
                <button class="btn btn-warning auction-btn">Start Auction</button>
            </div>
        `;
    }

    /**
     * Create auction modal content
     * @param {Property} property - The property
     * @param {Player[]} players - All players
     * @returns {string} HTML content
     */
    createAuctionContent(property, players) {
        const rentInfo = this.getRentInfo(property);
        
        return `
            <div class="modal-header">
                <h2>Property Auction</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="property-details">
                    <h3>${property.name}</h3>
                    <div class="property-info">
                        <p><strong>Type:</strong> ${this.formatPropertyType(property.type)}</p>
                        ${property.colorGroup ? `<p><strong>Color Group:</strong> ${this.formatColorGroup(property.colorGroup)}</p>` : ''}
                        <p><strong>Starting Bid:</strong> $1</p>
                    </div>
                    
                    <div class="rent-info">
                        <h4>Rent Information</h4>
                        ${rentInfo}
                    </div>
                </div>
                
                <div class="auction-controls">
                    <div class="current-bid">
                        <h4>Current Bid: $<span id="current-bid">0</span></h4>
                        <p>Leader: <span id="current-leader">None</span></p>
                    </div>
                    
                    <div class="bid-input">
                        <label for="bid-amount">Your Bid:</label>
                        <input type="number" id="bid-amount" min="1" max="9999" value="1">
                        <button class="btn btn-primary place-bid-btn">Place Bid</button>
                    </div>
                    
                    <div class="auction-players">
                        <h4>Players</h4>
                        <ul>
                            ${players.map(player => `
                                <li class="player-status" data-player-id="${player.id}">
                                    ${player.name} - $${player.money}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary skip-bid-btn">Skip Bid</button>
                <button class="btn btn-warning end-auction-btn" style="display: none;">End Auction</button>
            </div>
        `;
    }

    /**
     * Create property management modal content
     * @param {Player} player - The player
     * @returns {string} HTML content
     */
    createManagementContent(player) {
        const properties = player.properties;
        const groupedProperties = this.groupPropertiesByType(properties);
        
        return `
            <div class="modal-header">
                <h2>Property Management</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="player-summary">
                    <h3>${player.name}'s Properties</h3>
                    <p><strong>Total Properties:</strong> ${properties.length}</p>
                    <p><strong>Current Money:</strong> $${player.money}</p>
                </div>
                
                <div class="properties-list">
                    ${Object.entries(groupedProperties).map(([type, props]) => `
                        <div class="property-group">
                            <h4>${type}</h4>
                            <div class="properties-grid">
                                ${props.map(property => this.createPropertyCard(property)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mortgage-summary">
                    <h4>Mortgage Summary</h4>
                    <p><strong>Total Mortgage Value:</strong> $${player.getTotalMortgageValue()}</p>
                    <p><strong>Total Unmortgage Cost:</strong> $${player.getTotalUnmortgageCost()}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-btn">Close</button>
            </div>
        `;
    }

    /**
     * Create a property card for management view
     * @param {Property} property - The property
     * @returns {string} HTML card
     */
    createPropertyCard(property) {
        const isMortgaged = property.isMortgaged;
        const mortgageValue = property.getMortgageValue();
        const unmortgageCost = property.getUnmortgageCost();
        
        return `
            <div class="property-card ${isMortgaged ? 'mortgaged' : ''}" data-property-id="${property.name}">
                <h5>${property.name}</h5>
                <p><strong>Type:</strong> ${this.formatPropertyType(property.type)}</p>
                ${property.colorGroup ? `<p><strong>Group:</strong> ${this.formatColorGroup(property.colorGroup)}</p>` : ''}
                <p><strong>Price:</strong> $${property.price}</p>
                <p><strong>Houses:</strong> ${property.houses}${property.hasHotel ? ' + Hotel' : ''}</p>
                
                ${isMortgaged ? `
                    <p class="mortgage-status">Mortgaged</p>
                    <p><strong>Unmortgage Cost:</strong> $${unmortgageCost}</p>
                    <button class="btn btn-sm btn-success unmortgage-btn" data-property="${property.name}">
                        Unmortgage ($${unmortgageCost})
                    </button>
                ` : `
                    <p><strong>Mortgage Value:</strong> $${mortgageValue}</p>
                    <button class="btn btn-sm btn-warning mortgage-btn" data-property="${property.name}">
                        Mortgage ($${mortgageValue})
                    </button>
                `}
            </div>
        `;
    }

    /**
     * Get rent information for display
     * @param {Property} property - The property
     * @returns {string} HTML rent info
     */
    getRentInfo(property) {
        if (property.type === 'property' && property.rentData) {
            return `
                <table class="rent-table">
                    <tr><td>Base Rent:</td><td>$${property.rentData[0]}</td></tr>
                    <tr><td>1 House:</td><td>$${property.rentData[1]}</td></tr>
                    <tr><td>2 Houses:</td><td>$${property.rentData[2]}</td></tr>
                    <tr><td>3 Houses:</td><td>$${property.rentData[3]}</td></tr>
                    <tr><td>4 Houses:</td><td>$${property.rentData[4]}</td></tr>
                    <tr><td>Hotel:</td><td>$${property.rentData[5]}</td></tr>
                </table>
            `;
        } else if (property.type === 'railroad') {
            return `
                <table class="rent-table">
                    <tr><td>1 Railroad:</td><td>$25</td></tr>
                    <tr><td>2 Railroads:</td><td>$50</td></tr>
                    <tr><td>3 Railroads:</td><td>$100</td></tr>
                    <tr><td>4 Railroads:</td><td>$200</td></tr>
                </table>
            `;
        } else if (property.type === 'utility') {
            return `
                <table class="rent-table">
                    <tr><td>1 Utility:</td><td>4 × dice roll</td></tr>
                    <tr><td>2 Utilities:</td><td>10 × dice roll</td></tr>
                </table>
            `;
        }
        return '<p>Rent varies</p>';
    }

    /**
     * Bind events for purchase modal
     * @param {HTMLElement} modal - The modal
     * @param {Property} property - The property
     * @param {Player} player - The player
     */
    bindPurchaseEvents(modal, property, player) {
        modal.querySelector('.purchase-btn').addEventListener('click', () => {
            this.handlePurchase(property, player);
        });

        modal.querySelector('.decline-btn').addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('.auction-btn').addEventListener('click', () => {
            this.closeModal();
            this.startAuction(property);
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    /**
     * Bind events for auction modal
     * @param {HTMLElement} modal - The modal
     * @param {Property} property - The property
     * @param {Player[]} players - All players
     */
    bindAuctionEvents(modal, property, players) {
        // These events would be handled by the game engine
        modal.querySelector('.place-bid-btn').addEventListener('click', () => {
            const amount = parseInt(modal.querySelector('#bid-amount').value);
            this.handleAuctionBid(property, amount);
        });

        modal.querySelector('.skip-bid-btn').addEventListener('click', () => {
            this.handleSkipBid();
        });

        modal.querySelector('.end-auction-btn').addEventListener('click', () => {
            this.handleEndAuction();
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    /**
     * Bind events for management modal
     * @param {HTMLElement} modal - The modal
     * @param {Player} player - The player
     */
    bindManagementEvents(modal, player) {
        // Mortgage buttons
        modal.querySelectorAll('.mortgage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyName = e.target.dataset.property;
                this.handleMortgage(player, propertyName);
            });
        });

        // Unmortgage buttons
        modal.querySelectorAll('.unmortgage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyName = e.target.dataset.property;
                this.handleUnmortgage(player, propertyName);
            });
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    /**
     * Handle property purchase
     * @param {Property} property - The property
     * @param {Player} player - The player
     */
    handlePurchase(property, player) {
        const result = this.gameEngine.propertyService.purchaseProperty(player, property);
        if (result.success) {
            this.closeModal();
            this.gameEngine.updateUI();
        } else {
            alert(`Cannot purchase: ${result.reason}`);
        }
    }

    /**
     * Handle auction start
     * @param {Property} property - The property
     */
    startAuction(property) {
        const players = this.gameEngine.playerManager.getActivePlayers();
        this.gameEngine.propertyService.startAuction(property, players);
    }

    /**
     * Handle mortgage action
     * @param {Player} player - The player
     * @param {string} propertyName - The property name
     */
    handleMortgage(player, propertyName) {
        const property = player.properties.find(p => p.name === propertyName);
        if (property) {
            const result = this.gameEngine.propertyService.mortgageProperty(player, property);
            if (result.success) {
                this.refreshManagementModal(player);
            } else {
                alert(`Cannot mortgage: ${result.reason}`);
            }
        }
    }

    /**
     * Handle unmortgage action
     * @param {Player} player - The player
     * @param {string} propertyName - The property name
     */
    handleUnmortgage(player, propertyName) {
        const property = player.properties.find(p => p.name === propertyName);
        if (property) {
            const result = this.gameEngine.propertyService.unmortgageProperty(player, property);
            if (result.success) {
                this.refreshManagementModal(player);
            } else {
                alert(`Cannot unmortgage: ${result.reason}`);
            }
        }
    }

    /**
     * Refresh the management modal
     * @param {Player} player - The player
     */
    refreshManagementModal(player) {
        if (this.currentModal && this.currentModal.classList.contains('property-management-modal')) {
            const content = this.createManagementContent(player);
            this.currentModal.querySelector('.modal-content').innerHTML = content;
            this.bindManagementEvents(this.currentModal, player);
        }
    }

    /**
     * Close the current modal
     */
    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
            this.currentProperty = null;
        }
    }

    /**
     * Group properties by type
     * @param {Property[]} properties - Properties to group
     * @returns {Object} Grouped properties
     */
    groupPropertiesByType(properties) {
        const groups = {};
        properties.forEach(property => {
            const type = this.formatPropertyType(property.type);
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(property);
        });
        return groups;
    }

    /**
     * Format property type for display
     * @param {string} type - Property type
     * @returns {string} Formatted type
     */
    formatPropertyType(type) {
        const typeMap = {
            'property': 'Street',
            'railroad': 'Railroad',
            'utility': 'Utility'
        };
        return typeMap[type] || type;
    }

    /**
     * Format color group for display
     * @param {string} colorGroup - Color group
     * @returns {string} Formatted color group
     */
    formatColorGroup(colorGroup) {
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
        return colorMap[colorGroup] || colorGroup;
    }
}