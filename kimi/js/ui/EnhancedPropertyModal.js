/**
 * Enhanced Property Modal Manager
 * Enhanced version with rent calculation service integration
 */

import { constants } from '../config/constants.js';

/**
 * Enhanced property modal with rent calculation integration
 */
export class EnhancedPropertyModal {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentModal = null;
        this.currentProperty = null;
        this.rentService = gameEngine.rentService || null;
    }

    /**
     * Show property details modal with rent information
     * @param {Property} property - The property to display
     * @param {Player} viewer - The player viewing the property
     */
    showPropertyDetails(property, viewer) {
        this.currentProperty = property;
        
        const modal = this.createModal('property-details-modal');
        const content = this.createPropertyDetailsContent(property, viewer);
        
        modal.querySelector('.modal-content').innerHTML = content;
        document.body.appendChild(modal);
        
        this.currentModal = modal;
        this.bindDetailsEvents(modal, property, viewer);
    }

    /**
     * Show rent calculation modal
     * @param {Property} property - The property
     * @param {Player} landingPlayer - The player who landed
     * @param {number} diceRoll - The dice roll value
     */
    showRentCalculation(property, landingPlayer, diceRoll = 0) {
        if (!this.rentService) {
            console.error('Rent service not available');
            return;
        }

        const rentDetails = this.rentService.getRentDetails(property, landingPlayer, diceRoll);
        
        const modal = this.createModal('rent-calculation-modal');
        const content = this.createRentCalculationContent(rentDetails, landingPlayer);
        
        modal.querySelector('.modal-content').innerHTML = content;
        document.body.appendChild(modal);
        
        this.currentModal = modal;
        this.bindRentEvents(modal);
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
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        return modal;
    }

    /**
     * Create property details content with enhanced rent information
     * @param {Property} property - The property
     * @param {Player} viewer - The player viewing
     * @returns {string} HTML content
     */
    createPropertyDetailsContent(property, viewer) {
        const ownerInfo = property.owner ? 
            `<p><strong>Owner:</strong> ${property.owner.name}</p>` : 
            '<p><strong>Owner:</strong> Unowned</p>';
        
        const mortgageInfo = property.isMortgaged ? 
            '<p class="mortgage-warning"><strong>⚠️ Property is mortgaged - no rent collected</strong></p>' : '';
        
        const rentInfo = this.createEnhancedRentInfo(property, viewer);
        
        return `
            <div class="modal-header">
                <h2>${property.name}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="property-details">
                    <div class="property-header">
                        <h3>${property.name}</h3>
                        ${property.colorGroup ? `<span class="color-badge ${property.colorGroup}">${this.formatColorGroup(property.colorGroup)}</span>` : ''}
                    </div>
                    
                    <div class="property-info">
                        <p><strong>Type:</strong> ${this.formatPropertyType(property.type)}</p>
                        <p><strong>Price:</strong> $${property.price}</p>
                        ${ownerInfo}
                        ${mortgageInfo}
                    </div>
                    
                    <div class="development-info">
                        ${this.createDevelopmentInfo(property)}
                    </div>
                    
                    <div class="rent-info">
                        <h4>Rent Information</h4>
                        ${rentInfo}
                    </div>
                    
                    ${this.createMonopolyInfo(property)}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-btn">Close</button>
            </div>
        `;
    }

    /**
     * Create enhanced rent information
     * @param {Property} property - The property
     * @param {Player} viewer - The player viewing
     * @returns {string} HTML content
     */
    createEnhancedRentInfo(property, viewer) {
        if (!this.rentService) {
            return this.createBasicRentInfo(property);
        }

        const rentDetails = this.rentService.getRentDetails(property, viewer);
        
        if (rentDetails.amount === 0) {
            return `
                <div class="rent-zero">
                    <p>${rentDetails.reason}</p>
                </div>
            `;
        }

        let content = '';
        
        switch (property.type) {
            case 'property':
                content = this.createPropertyRentTable(property, rentDetails);
                break;
            case 'railroad':
                content = this.createRailroadRentTable(property, rentDetails);
                break;
            case 'utility':
                content = this.createUtilityRentTable(property, rentDetails);
                break;
        }

        return content;
    }

    /**
     * Create property rent table with detailed information
     * @param {Property} property - The property
     * @param {Object} rentDetails - Rent calculation details
     * @returns {string} HTML content
     */
    createPropertyRentTable(property, rentDetails) {
        const hasMonopoly = property.owner ? 
            this.rentService.hasMonopoly(property.owner, property.colorGroup) : false;
        
        return `
            <table class="rent-table enhanced">
                <thead>
                    <tr>
                        <th>Development</th>
                        <th>Rent</th>
                        <th>With Monopoly</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="${property.houses === 0 && !property.hasHotel ? 'current' : ''}">
                        <td>Base Rent</td>
                        <td>$${property.rentData[0]}</td>
                        <td>$${property.rentData[0] * 2}</td>
                    </tr>
                    <tr class="${property.houses === 1 ? 'current' : ''}">
                        <td>1 House</td>
                        <td>$${property.rentData[1]}</td>
                        <td>-</td>
                    </tr>
                    <tr class="${property.houses === 2 ? 'current' : ''}">
                        <td>2 Houses</td>
                        <td>$${property.rentData[2]}</td>
                        <td>-</td>
                    </tr>
                    <tr class="${property.houses === 3 ? 'current' : ''}">
                        <td>3 Houses</td>
                        <td>$${property.rentData[3]}</td>
                        <td>-</td>
                    </tr>
                    <tr class="${property.houses === 4 ? 'current' : ''}">
                        <td>4 Houses</td>
                        <td>$${property.rentData[4]}</td>
                        <td>-</td>
                    </tr>
                    <tr class="${property.hasHotel ? 'current' : ''}">
                        <td>Hotel</td>
                        <td>$${property.rentData[5]}</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
            ${hasMonopoly ? '<p class="monopoly-bonus">✅ Monopoly bonus active!</p>' : ''}
        `;
    }

    /**
     * Create railroad rent table
     * @param {Property} property - The railroad
     * @param {Object} rentDetails - Rent details
     * @returns {string} HTML content
     */
    createRailroadRentTable(property, rentDetails) {
        const railroadCount = property.owner ? 
            this.rentService.getRailroadCount(property.owner) : 0;
        
        return `
            <table class="rent-table enhanced">
                <thead>
                    <tr>
                        <th>Railroads Owned</th>
                        <th>Rent</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="${railroadCount === 1 ? 'current' : ''}">
                        <td>1 Railroad</td>
                        <td>$25</td>
                        <td>${railroadCount === 1 ? '✅ Current' : ''}</td>
                    </tr>
                    <tr class="${railroadCount === 2 ? 'current' : ''}">
                        <td>2 Railroads</td>
                        <td>$50</td>
                        <td>${railroadCount === 2 ? '✅ Current' : ''}</td>
                    </tr>
                    <tr class="${railroadCount === 3 ? 'current' : ''}">
                        <td>3 Railroads</td>
                        <td>$100</td>
                        <td>${railroadCount === 3 ? '✅ Current' : ''}</td>
                    </tr>
                    <tr class="${railroadCount === 4 ? 'current' : ''}">
                        <td>4 Railroads</td>
                        <td>$200</td>
                        <td>${railroadCount === 4 ? '✅ Current' : ''}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Create utility rent table
     * @param {Property} property - The utility
     * @param {Object} rentDetails - Rent details
     * @returns {string} HTML content
     */
    createUtilityRentTable(property, rentDetails) {
        const utilityCount = property.owner ? 
            this.rentService.getUtilityCount(property.owner) : 0;
        
        return `
            <table class="rent-table enhanced">
                <thead>
                    <tr>
                        <th>Utilities Owned</th>
                        <th>Multiplier</th>
                        <th>Example (Dice Roll 7)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="${utilityCount === 1 ? 'current' : ''}">
                        <td>1 Utility</td>
                        <td>4× dice roll</td>
                        <td>$28</td>
                        <td>${utilityCount === 1 ? '✅ Current' : ''}</td>
                    </tr>
                    <tr class="${utilityCount === 2 ? 'current' : ''}">
                        <td>2 Utilities</td>
                        <td>10× dice roll</td>
                        <td>$70</td>
                        <td>${utilityCount === 2 ? '✅ Current' : ''}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    /**
     * Create development information
     * @param {Property} property - The property
     * @returns {string} HTML content
     */
    createDevelopmentInfo(property) {
        if (property.type !== 'property') {
            return '';
        }

        return `
            <div class="development-info">
                <h4>Development</h4>
                <p><strong>Houses:</strong> ${property.houses}</p>
                <p><strong>Hotel:</strong> ${property.hasHotel ? 'Yes' : 'No'}</p>
                <p><strong>House Cost:</strong> $${property.houseCost}</p>
                <p><strong>Can Build Houses:</strong> ${property.canBuildHouses() ? 'Yes' : 'No'}</p>
                <p><strong>Can Build Hotel:</strong> ${property.canBuildHotel() ? 'Yes' : 'No'}</p>
            </div>
        `;
    }

    /**
     * Create monopoly information
     * @param {Property} property - The property
     * @returns {string} HTML content
     */
    createMonopolyInfo(property) {
        if (!property.colorGroup || !this.rentService) {
            return '';
        }

        const groupProperties = this.rentService.getPropertiesInGroup(property.colorGroup);
        const ownedCount = groupProperties.filter(p => p.owner === property.owner).length;
        const totalCount = groupProperties.length;
        const hasMonopoly = ownedCount === totalCount;

        return `
            <div class="monopoly-info">
                <h4>Color Group: ${this.formatColorGroup(property.colorGroup)}</h4>
                <p><strong>Properties in Group:</strong> ${totalCount}</p>
                <p><strong>Owned by Current Owner:</strong> ${ownedCount}</p>
                <p><strong>Monopoly Status:</strong> ${hasMonopoly ? '✅ Complete' : '❌ Incomplete'}</p>
            </div>
        `;
    }

    /**
     * Create rent calculation content
     * @param {Object} rentDetails - Rent calculation details
     * @param {Player} landingPlayer - The player who landed
     * @returns {string} HTML content
     */
    createRentCalculationContent(rentDetails, landingPlayer) {
        return `
            <div class="modal-header">
                <h2>Rent Calculation</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="rent-calculation">
                    <h3>${rentDetails.propertyName}</h3>
                    <p><strong>Owner:</strong> ${rentDetails.ownerName}</p>
                    <p><strong>Current Rent:</strong> $${rentDetails.amount}</p>
                    
                    <div class="rent-breakdown">
                        <h4>Calculation Breakdown:</h4>
                        <p>${rentDetails.displayText}</p>
                        
                        ${rentDetails.details ? this.createRentBreakdown(rentDetails.details) : ''}
                    </div>
                    
                    ${rentDetails.isMortgaged ? 
                        '<div class="mortgage-warning">⚠️ Property is mortgaged - no rent due</div>' : 
                        ''
                    }
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary pay-rent-btn">Pay Rent ($${rentDetails.amount})</button>
                <button class="btn btn-secondary close-btn">Close</button>
            </div>
        `;
    }

    /**
     * Create rent breakdown details
     * @param {Object} details - Rent details
     * @returns {string} HTML content
     */
    createRentBreakdown(details) {
        let breakdown = '<ul class="rent-breakdown-list">';
        
        switch (details.type) {
            case 'property':
                if (details.hasHotel) {
                    breakdown += `<li>Hotel rent: $${details.hotelRent}</li>`;
                } else if (details.houses > 0) {
                    breakdown += `<li>${details.houses} house${details.houses > 1 ? 's' : ''}: $${details.houseRent}</li>`;
                } else {
                    breakdown += `<li>Base rent: $${details.baseRent}</li>`;
                    if (details.monopolyBonus) {
                        breakdown += `<li>Monopoly bonus: ×2 = $${details.finalBaseRent}</li>`;
                    }
                }
                break;
            case 'railroad':
                breakdown += `<li>${details.railroadsOwned} railroad${details.railroadsOwned > 1 ? 's' : ''}: $${details.rentAmount}</li>`;
                break;
            case 'utility':
                breakdown += `<li>Dice roll: ${details.diceRoll}</li>`;
                breakdown += `<li>Multiplier: ${details.multiplier}×</li>`;
                breakdown += `<li>Total: ${details.diceRoll} × ${details.multiplier} = $${details.rentAmount}</li>`;
                break;
        }
        
        breakdown += '</ul>';
        return breakdown;
    }

    /**
     * Bind events for details modal
     * @param {HTMLElement} modal - The modal
     * @param {Property} property - The property
     * @param {Player} viewer - The player viewing
     */
    bindDetailsEvents(modal, property, viewer) {
        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    /**
     * Bind events for rent calculation modal
     * @param {HTMLElement} modal - The modal
     */
    bindRentEvents(modal) {
        modal.querySelector('.pay-rent-btn').addEventListener('click', () => {
            // This would trigger the actual rent payment
            this.closeModal();
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    /**
     * Create basic rent information (fallback)
     * @param {Property} property - The property
     * @returns {string} HTML content
     */
    createBasicRentInfo(property) {
        return this.getRentInfo(property);
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
     * Get rent information for display (compatibility method)
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
}