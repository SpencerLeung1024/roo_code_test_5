/**
 * Building UI Component
 * Provides the user interface for building houses and hotels
 */

import { constants } from '../config/constants.js';

export class BuildingUI {
    constructor(buildingManager, gameState) {
        this.buildingManager = buildingManager;
        this.gameState = gameState;
        this.modal = null;
        this.currentPlayer = null;
    }

    init() {
        this.createModal();
    }

    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = 'building-modal';
        this.modal.className = 'building-modal modal';
        this.modal.style.display = 'none';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Build Houses & Hotels</h2>
                    <button class="close-btn" onclick="buildingUI.hide()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="building-info">
                        <div class="inventory-info">
                            <span>Houses: <span id="modal-houses-count">32</span></span>
                            <span>Hotels: <span id="modal-hotels-count">12</span></span>
                        </div>
                        <div class="player-money">
                            Your Money: $<span id="modal-player-money">1500</span>
                        </div>
                    </div>
                    <div id="color-groups" class="color-groups">
                        <!-- Color groups will be populated here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
    }

    show(player) {
        if (!player) return;
        
        this.currentPlayer = player;
        this.updateModalContent();
        this.modal.style.display = 'block';
    }

    hide() {
        this.modal.style.display = 'none';
    }

    updateModalContent() {
        if (!this.currentPlayer) return;

        // Update player money
        document.getElementById('modal-player-money').textContent = this.currentPlayer.money;

        // Update inventory
        const inventory = this.buildingManager.getBuildingInventory();
        document.getElementById('modal-houses-count').textContent = inventory.houses;
        document.getElementById('modal-hotels-count').textContent = inventory.hotels;

        // Update color groups
        this.updateColorGroups();
    }

    updateColorGroups() {
        const container = document.getElementById('color-groups');
        container.innerHTML = '';

        const buildable = this.buildingManager.getBuildableProperties(this.currentPlayer);

        Object.keys(buildable).forEach(colorGroup => {
            const group = buildable[colorGroup];
            const groupElement = this.createColorGroupElement(colorGroup, group);
            container.appendChild(groupElement);
        });

        if (Object.keys(buildable).length === 0) {
            container.innerHTML = '<p>No buildable properties. You need to own all properties in a color group.</p>';
        }
    }

    createColorGroupElement(colorGroup, group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'color-group';

        const colorName = this.formatColorName(colorGroup);
        const hasMonopoly = group.hasMonopoly;

        groupDiv.innerHTML = `
            <h3 class="color-group-title" style="color: ${this.getColorHex(colorGroup)}">
                ${colorName} ${hasMonopoly ? '✅' : '❌'}
            </h3>
            <div class="color-group-info">
                <span>Total Houses: ${group.totalHouses}</span>
                <span>Total Hotels: ${group.totalHotels}</span>
            </div>
            <div class="properties-list">
                ${group.properties.map(prop => this.createPropertyElement(prop)).join('')}
            </div>
        `;

        return groupDiv;
    }

    createPropertyElement(prop) {
        const property = prop.property;
        const canBuildHouse = prop.canBuildHouse;
        const canBuildHotel = prop.canBuildHotel;
        const canSellHouse = prop.canSellHouse;
        const canSellHotel = prop.canSellHotel;

        return `
            <div class="property-item">
                <div class="property-header">
                    <span class="property-name">${property.name}</span>
                    <span class="property-buildings">
                        ${property.hasHotel ? '🏨 Hotel' : property.houses > 0 ? '🏠'.repeat(property.houses) : 'No buildings'}
                    </span>
                </div>
                <div class="property-actions">
                    <button class="btn btn-build-house" 
                            ${!canBuildHouse ? 'disabled' : ''}
                            onclick="buildingUI.buildHouse('${property.name}')"
                            title="${!canBuildHouse ? 'Cannot build house' : `Build house for $${prop.houseCost}`}">
                        Build House ($${prop.houseCost})
                    </button>
                    <button class="btn btn-build-hotel" 
                            ${!canBuildHotel ? 'disabled' : ''}
                            onclick="buildingUI.buildHotel('${property.name}')"
                            title="${!canBuildHotel ? 'Cannot build hotel' : `Build hotel for $${prop.hotelCost}`}">
                        Build Hotel ($${prop.hotelCost})
                    </button>
                    <button class="btn btn-sell-house" 
                            ${!canSellHouse ? 'disabled' : ''}
                            onclick="buildingUI.sellHouse('${property.name}')"
                            title="${!canSellHouse ? 'Cannot sell house' : 'Sell house for half price'}">
                        Sell House
                    </button>
                    <button class="btn btn-sell-hotel" 
                            ${!canSellHotel ? 'disabled' : ''}
                            onclick="buildingUI.sellHotel('${property.name}')"
                            title="${!canSellHotel ? 'Cannot sell hotel' : 'Sell hotel for half price'}">
                        Sell Hotel
                    </button>
                </div>
            </div>
        `;
    }

    buildHouse(propertyName) {
        const property = this.findProperty(propertyName);
        if (property) {
            const result = this.buildingManager.buildHouse(property, this.currentPlayer);
            if (result.success) {
                this.updateModalContent();
                this.updateGameUI();
            } else {
                alert(result.message);
            }
        }
    }

    buildHotel(propertyName) {
        const property = this.findProperty(propertyName);
        if (property) {
            const result = this.buildingManager.buildHotel(property, this.currentPlayer);
            if (result.success) {
                this.updateModalContent();
                this.updateGameUI();
            } else {
                alert(result.message);
            }
        }
    }

    sellHouse(propertyName) {
        const property = this.findProperty(propertyName);
        if (property) {
            const result = this.buildingManager.sellHouse(property, this.currentPlayer);
            if (result.success) {
                this.updateModalContent();
                this.updateGameUI();
            } else {
                alert(result.message);
            }
        }
    }

    sellHotel(propertyName) {
        const property = this.findProperty(propertyName);
        if (property) {
            const result = this.buildingManager.sellHotel(property, this.currentPlayer);
            if (result.success) {
                this.updateModalContent();
                this.updateGameUI();
            } else {
                alert(result.message);
            }
        }
    }

    findProperty(propertyName) {
        for (let square of this.gameState.board.getSquares()) {
            if (square.type === 'property' && square.data && square.data.name === propertyName) {
                return square.data;
            }
        }
        return null;
    }

    updatePlayer(player) {
        this.currentPlayer = player;
        if (this.modal.style.display === 'block') {
            this.updateModalContent();
        }
    }

    updateGameUI() {
        // This method should be overridden by the parent application
        // to update the main game UI when buildings change
        if (window.buildingDemo) {
            window.buildingDemo.updateUI();
        }
    }

    formatColorName(colorGroup) {
        const nameMap = {
            'brown': 'Brown',
            'light-blue': 'Light Blue',
            'pink': 'Pink',
            'orange': 'Orange',
            'red': 'Red',
            'yellow': 'Yellow',
            'green': 'Green',
            'dark-blue': 'Dark Blue'
        };
        return nameMap[colorGroup] || colorGroup;
    }

    getColorHex(colorGroup) {
        const colorMap = {
            'brown': '#8B4513',
            'light-blue': '#87CEEB',
            'pink': '#FF69B4',
            'orange': '#FFA500',
            'red': '#FF0000',
            'yellow': '#FFFF00',
            'green': '#008000',
            'dark-blue': '#0000FF'
        };
        return colorMap[colorGroup] || '#000000';
    }
}

// Create global instance
window.buildingUI = new BuildingUI(null, null);