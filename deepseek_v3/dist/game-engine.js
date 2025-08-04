"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jail_mechanics_1 = require("./jail-mechanics");
class MonopolyEngine {
    constructor(initialState) {
        this.state = initialState || this.createInitialState();
    }
    createInitialState() {
        return {
            players: [],
            currentPlayer: '',
            diceRoll: null,
            phase: 'setup',
            properties: this.createProperties(),
            chanceCards: this.createCards('chance'),
            communityChestCards: this.createCards('community_chest'),
            bankBalance: 0
        };
    }
    createProperties() {
        // Standard Monopoly properties
        return [
            // Brown properties
            { id: 'mediterranean', name: 'Mediterranean Avenue', position: 1, price: 60, mortgageValue: 30,
                owner: null, houses: 0, hotel: false, rent: [2, 10, 30, 90, 160, 250], colorGroup: 'brown', mortgaged: false,
                housePrice: 50, hotelPrice: 50 },
            { id: 'baltic', name: 'Baltic Avenue', position: 3, price: 60, mortgageValue: 30,
                owner: null, houses: 0, hotel: false, rent: [4, 20, 60, 180, 320, 450], colorGroup: 'brown', mortgaged: false,
                housePrice: 50, hotelPrice: 50 },
            // ... (rest of property definitions)
        ];
    }
    createCards(type) {
        const cards = [];
        if (type === 'chance') {
            cards.push({ id: 'chance1', type, description: 'Advance to Go', action: (game) => {
                    const player = game.players.find(p => p.id === game.currentPlayer);
                    if (player)
                        player.position = 0;
                } });
        }
        else {
            cards.push({ id: 'cc1', type, description: 'Bank error in your favor. Collect $200', action: (game) => {
                    const player = game.players.find(p => p.id === game.currentPlayer);
                    if (player)
                        player.balance += 200;
                } });
        }
        return cards;
    }
    addPlayer(name) {
        const player = {
            id: `player_${Date.now()}`,
            name,
            balance: 1500,
            position: 0,
            properties: [],
            inJail: false,
            jailTurns: 0,
            hasGetOutOfJailFree: false,
            bankrupt: false
        };
        this.state.players.push(player);
        if (this.state.players.length === 1) {
            this.state.currentPlayer = player.id;
        }
        return player;
    }
    rollDice(playerId) {
        if (this.state.currentPlayer !== playerId) {
            throw new Error('Not your turn');
        }
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        this.state.diceRoll = [dice1, dice2];
        return [dice1, dice2];
    }
    movePlayer(playerId, spaces) {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player)
            throw new Error('Player not found');
        if (player.inJail) {
            throw new Error('Cannot move while in jail - must resolve jail status first');
        }
        player.position = (player.position + spaces) % 40;
        this.handleLanding(player);
    }
    handleLanding(player) {
        const property = this.state.properties.find(p => p.position === player.position);
        if (!property)
            return;
        if (property.owner) {
            // Pay rent
            if (property.owner !== player.id) {
                const owner = this.state.players.find(p => p.id === property.owner);
                if (owner) {
                    const rent = property.rent[property.hotel ? 5 : property.houses];
                    player.balance -= rent;
                    owner.balance += rent;
                }
            }
        }
        else {
            // Offer to buy property
            if (player.balance >= property.price) {
                this.purchaseProperty(player.id, property.id);
            }
        }
    }
    handleJailAction(playerId, action) {
        return jail_mechanics_1.JailMechanics.handleJailAction(this.state, playerId, action);
    }
    endTurn() {
        const currentPlayer = this.state.players.find(p => p.id === this.state.currentPlayer);
        if (currentPlayer?.inJail) {
            currentPlayer.jailTurns++;
        }
        const currentIndex = this.state.players.findIndex(p => p.id === this.state.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.state.players.length;
        this.state.currentPlayer = this.state.players[nextIndex].id;
        this.state.diceRoll = null;
    }
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    purchaseProperty(playerId, propertyId) {
        const player = this.state.players.find(p => p.id === playerId);
        const property = this.state.properties.find(p => p.id === propertyId);
        if (!player || !property || property.owner !== null || player.balance < property.price) {
            return false;
        }
        player.balance -= property.price;
        property.owner = playerId;
        player.properties.push(propertyId);
        return true;
    }
    declinePurchase(playerId, propertyId) {
        this.startAuction(propertyId);
    }
    startAuction(propertyId) {
        const property = this.state.properties.find(p => p.id === propertyId);
        if (!property || property.owner)
            return;
        this.state.auction = {
            propertyId,
            currentBid: property.price / 2,
            currentBidder: null,
            activeBidders: this.state.players
                .filter(p => !p.bankrupt)
                .map(p => p.id)
        };
    }
    placeBid(playerId, amount) {
        if (!this.state.auction ||
            !this.state.auction.activeBidders.includes(playerId) ||
            amount <= this.state.auction.currentBid) {
            return false;
        }
        const player = this.state.players.find(p => p.id === playerId);
        if (!player || player.balance < amount)
            return false;
        this.state.auction.currentBid = amount;
        this.state.auction.currentBidder = playerId;
        return true;
    }
    resolveAuction() {
        if (!this.state.auction)
            return;
        const { propertyId, currentBid, currentBidder } = this.state.auction;
        const property = this.state.properties.find(p => p.id === propertyId);
        const player = currentBidder ? this.state.players.find(p => p.id === currentBidder) : null;
        if (property && player && currentBidder) {
            player.balance -= currentBid;
            property.owner = currentBidder;
            player.properties.push(propertyId);
        }
        this.state.auction = undefined;
    }
}
exports.default = MonopolyEngine;
