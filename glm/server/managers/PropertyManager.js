class PropertyManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.transactionHistory = [];
        this.maxHistoryLength = 100;
        this.auctions = new Map();
    }
    
    // Property purchase methods
    purchaseProperty(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if property is already owned
        if (property.ownerId !== null) {
            throw new Error('Property is already owned');
        }
        
        // Check if player can afford the property
        if (!player.canAfford(property.price)) {
            throw new Error('Player cannot afford this property');
        }
        
        // Process purchase
        const purchaseAmount = property.price;
        player.pay(purchaseAmount);
        player.addProperty(property);
        
        // Record transaction
        const transaction = {
            type: 'purchase',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: purchaseAmount,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit purchase event
        this.eventHandler.emit('property:purchased', {
            playerId: player.id,
            propertyId: property.id,
            amount: purchaseAmount
        });
        
        console.log(`${player.name} purchased ${property.name} for $${purchaseAmount}`);
        
        // Check for monopoly
        this.checkMonopoly(player, property.colorGroup);
        
        return true;
    }
    
    // Property sale methods
    sellProperty(player, property, buyer = null, price = null) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property has buildings
        if (property.buildings > 0) {
            throw new Error('Cannot sell property with buildings');
        }
        
        // Determine sale price
        let saleAmount;
        if (buyer && price) {
            // Sale to another player
            saleAmount = price;
            if (!buyer.canAfford(saleAmount)) {
                throw new Error('Buyer cannot afford this property');
            }
            
            // Process sale between players
            buyer.pay(saleAmount);
            player.receive(saleAmount);
            player.removeProperty(property.id);
            buyer.addProperty(property);
            
            // Record transaction
            const transaction = {
                type: 'sale',
                sellerId: player.id,
                sellerName: player.name,
                buyerId: buyer.id,
                buyerName: buyer.name,
                propertyId: property.id,
                propertyName: property.name,
                amount: saleAmount,
                timestamp: new Date()
            };
            
            this.addToHistory(transaction);
            
            // Emit sale event
            this.eventHandler.emit('property:sold', {
                sellerId: player.id,
                buyerId: buyer.id,
                propertyId: property.id,
                amount: saleAmount
            });
            
            console.log(`${player.name} sold ${property.name} to ${buyer.name} for $${saleAmount}`);
        } else {
            // Sale back to bank
            saleAmount = Math.floor(property.price / 2);
            player.receive(saleAmount);
            player.removeProperty(property.id);
            property.ownerId = null;
            
            // Record transaction
            const transaction = {
                type: 'bank_sale',
                playerId: player.id,
                playerName: player.name,
                propertyId: property.id,
                propertyName: property.name,
                amount: saleAmount,
                timestamp: new Date()
            };
            
            this.addToHistory(transaction);
            
            // Emit bank sale event
            this.eventHandler.emit('property:sold_to_bank', {
                playerId: player.id,
                propertyId: property.id,
                amount: saleAmount
            });
            
            console.log(`${player.name} sold ${property.name} to bank for $${saleAmount}`);
        }
        
        return true;
    }
    
    // Mortgage methods
    mortgageProperty(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property is already mortgaged
        if (property.isMortgaged) {
            throw new Error('Property is already mortgaged');
        }
        
        // Check if property has buildings
        if (property.buildings > 0) {
            throw new Error('Cannot mortgage property with buildings');
        }
        
        // Process mortgage
        const mortgageAmount = property.mortgage();
        player.receive(mortgageAmount);
        
        // Record transaction
        const transaction = {
            type: 'mortgage',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: mortgageAmount,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit mortgage event
        this.eventHandler.emit('property:mortgaged', {
            playerId: player.id,
            propertyId: property.id,
            amount: mortgageAmount
        });
        
        console.log(`${player.name} mortgaged ${property.name} for $${mortgageAmount}`);
        
        return true;
    }
    
    unmortgageProperty(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property is mortgaged
        if (!property.isMortgaged) {
            throw new Error('Property is not mortgaged');
        }
        
        // Calculate unmortgage amount (principal + 10% interest)
        const unmortgageAmount = property.unmortgage();
        
        // Check if player can afford to unmortgage
        if (!player.canAfford(unmortgageAmount)) {
            throw new Error('Player cannot afford to unmortgage this property');
        }
        
        // Process unmortgage
        player.pay(unmortgageAmount);
        property.isMortgaged = false;
        
        // Record transaction
        const transaction = {
            type: 'unmortgage',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: unmortgageAmount,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit unmortgage event
        this.eventHandler.emit('property:unmortgaged', {
            playerId: player.id,
            propertyId: property.id,
            amount: unmortgageAmount
        });
        
        console.log(`${player.name} unmortgaged ${property.name} for $${unmortgageAmount}`);
        
        return true;
    }
    
    // Building methods
    buildHouse(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property is a street
        if (property.type !== 'street') {
            throw new Error('Can only build houses on street properties');
        }
        
        // Check if property is mortgaged
        if (property.isMortgaged) {
            throw new Error('Cannot build on mortgaged property');
        }
        
        // Check if player has monopoly
        if (!property.hasMonopoly(player)) {
            throw new Error('Player must own all properties in this color group');
        }
        
        // Check if player can build house
        if (!property.canBuildHouse()) {
            throw new Error('Cannot build house on this property');
        }
        
        // Check if player can afford the house
        if (!player.canAfford(property.houseCost)) {
            throw new Error('Player cannot afford to build a house');
        }
        
        // Process house construction
        const houseCost = property.houseCost;
        player.pay(houseCost);
        property.buildHouse();
        
        // Record transaction
        const transaction = {
            type: 'build_house',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: houseCost,
            buildings: property.buildings,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit building event
        this.eventHandler.emit('building:built', {
            playerId: player.id,
            propertyId: property.id,
            buildingType: 'house',
            amount: houseCost,
            totalBuildings: property.buildings
        });
        
        console.log(`${player.name} built a house on ${property.name} for $${houseCost}`);
        
        return true;
    }
    
    buildHotel(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property is a street
        if (property.type !== 'street') {
            throw new Error('Can only build hotels on street properties');
        }
        
        // Check if property is mortgaged
        if (property.isMortgaged) {
            throw new Error('Cannot build on mortgaged property');
        }
        
        // Check if player can build hotel
        if (!property.canBuildHotel()) {
            throw new Error('Cannot build hotel on this property');
        }
        
        // Check if player can afford the hotel
        if (!player.canAfford(property.hotelCost)) {
            throw new Error('Player cannot afford to build a hotel');
        }
        
        // Process hotel construction
        const hotelCost = property.hotelCost;
        player.pay(hotelCost);
        property.buildHotel();
        
        // Record transaction
        const transaction = {
            type: 'build_hotel',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: hotelCost,
            buildings: property.buildings,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit building event
        this.eventHandler.emit('building:built', {
            playerId: player.id,
            propertyId: property.id,
            buildingType: 'hotel',
            amount: hotelCost,
            totalBuildings: property.buildings
        });
        
        console.log(`${player.name} built a hotel on ${property.name} for $${hotelCost}`);
        
        return true;
    }
    
    sellHouse(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property has houses
        if (property.buildings === 0 || property.buildings === 5) {
            throw new Error('No houses to sell on this property');
        }
        
        // Process house sale
        const saleAmount = property.sellHouse();
        player.receive(saleAmount);
        
        // Record transaction
        const transaction = {
            type: 'sell_house',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: saleAmount,
            buildings: property.buildings,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit building sale event
        this.eventHandler.emit('building:sold', {
            playerId: player.id,
            propertyId: property.id,
            buildingType: 'house',
            amount: saleAmount,
            totalBuildings: property.buildings
        });
        
        console.log(`${player.name} sold a house from ${property.name} for $${saleAmount}`);
        
        return true;
    }
    
    sellHotel(player, property) {
        if (!player || !property) {
            throw new Error('Invalid player or property');
        }
        
        // Check if player owns the property
        if (property.ownerId !== player.id) {
            throw new Error('Player does not own this property');
        }
        
        // Check if property has a hotel
        if (property.buildings !== 5) {
            throw new Error('No hotel to sell on this property');
        }
        
        // Process hotel sale
        const saleAmount = property.sellHotel();
        player.receive(saleAmount);
        
        // Record transaction
        const transaction = {
            type: 'sell_hotel',
            playerId: player.id,
            playerName: player.name,
            propertyId: property.id,
            propertyName: property.name,
            amount: saleAmount,
            buildings: property.buildings,
            timestamp: new Date()
        };
        
        this.addToHistory(transaction);
        
        // Emit building sale event
        this.eventHandler.emit('building:sold', {
            playerId: player.id,
            propertyId: property.id,
            buildingType: 'hotel',
            amount: saleAmount,
            totalBuildings: property.buildings
        });
        
        console.log(`${player.name} sold a hotel from ${property.name} for $${saleAmount}`);
        
        return true;
    }
    
    // Auction methods
    startAuction(property, startingBid = 0) {
        if (!property) {
            throw new Error('Invalid property');
        }
        
        // Check if property is unowned
        if (property.ownerId !== null) {
            throw new Error('Cannot auction owned property');
        }
        
        const auctionId = `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const auction = {
            id: auctionId,
            propertyId: property.id,
            propertyName: property.name,
            startingBid: startingBid,
            currentBid: startingBid,
            highestBidder: null,
            bids: [],
            startTime: new Date(),
            status: 'active'
        };
        
        this.auctions.set(auctionId, auction);
        
        // Emit auction start event
        this.eventHandler.emit('auction:started', {
            auctionId,
            propertyId: property.id,
            startingBid
        });
        
        console.log(`Auction started for ${property.name} with starting bid $${startingBid}`);
        
        return auctionId;
    }
    
    placeBid(auctionId, player, amount) {
        const auction = this.auctions.get(auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }
        
        if (auction.status !== 'active') {
            throw new Error('Auction is not active');
        }
        
        if (amount <= auction.currentBid) {
            throw new Error('Bid must be higher than current bid');
        }
        
        if (!player.canAfford(amount)) {
            throw new Error('Player cannot afford this bid');
        }
        
        // Process bid
        auction.currentBid = amount;
        auction.highestBidder = player.id;
        auction.bids.push({
            playerId: player.id,
            playerName: player.name,
            amount: amount,
            timestamp: new Date()
        });
        
        // Emit bid event
        this.eventHandler.emit('auction:bid', {
            auctionId,
            playerId: player.id,
            amount: amount
        });
        
        console.log(`${player.name} bid $${amount} on ${auction.propertyName}`);
        
        return true;
    }
    
    concludeAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) {
            throw new Error('Auction not found');
        }
        
        auction.status = 'completed';
        
        if (auction.highestBidder) {
            // Complete the purchase
            const winner = this.gameState.getPlayerById(auction.highestBidder);
            const property = this.gameState.getPropertyById(auction.propertyId);
            
            if (winner && property) {
                winner.pay(auction.currentBid);
                winner.addProperty(property);
                
                // Record transaction
                const transaction = {
                    type: 'auction_purchase',
                    playerId: winner.id,
                    playerName: winner.name,
                    propertyId: property.id,
                    propertyName: property.name,
                    amount: auction.currentBid,
                    auctionId: auctionId,
                    timestamp: new Date()
                };
                
                this.addToHistory(transaction);
                
                // Emit auction completion event
                this.eventHandler.emit('auction:ended', {
                    auctionId,
                    winnerId: winner.id,
                    propertyId: property.id,
                    amount: auction.currentBid
                });
                
                console.log(`${winner.name} won auction for ${property.name} with bid $${auction.currentBid}`);
            }
        } else {
            // No bids - property remains unsold
            this.eventHandler.emit('auction:ended', {
                auctionId,
                winnerId: null,
                propertyId: auction.propertyId,
                amount: 0
            });
            
            console.log(`Auction for ${auction.propertyName} ended with no bids`);
        }
        
        // Remove auction from active auctions
        this.auctions.delete(auctionId);
        
        return auction;
    }
    
    // Utility methods
    checkMonopoly(player, colorGroup) {
        const propertiesInGroup = this.gameState.board.filter(
            space => space.type === 'property' && space.colorGroup === colorGroup
        );
        
        const ownedProperties = propertiesInGroup.filter(
            property => property.ownerId === player.id
        );
        
        if (ownedProperties.length === propertiesInGroup.length) {
            // Player has monopoly
            this.eventHandler.emit('player:monopoly_obtained', {
                playerId: player.id,
                colorGroup: colorGroup
            });
            
            console.log(`${player.name} obtained monopoly in ${colorGroup} group`);
            return true;
        }
        
        return false;
    }
    
    // History management
    addToHistory(transaction) {
        this.transactionHistory.push(transaction);
        
        // Keep history at maximum length
        if (this.transactionHistory.length > this.maxHistoryLength) {
            this.transactionHistory = this.transactionHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getTransactionHistory(playerId = null, propertyId = null, count = 10) {
        let history = this.transactionHistory;
        
        if (playerId) {
            history = history.filter(record => record.playerId === playerId);
        }
        
        if (propertyId) {
            history = history.filter(record => record.propertyId === propertyId);
        }
        
        return history.slice(-count);
    }
    
    getFullHistory() {
        return [...this.transactionHistory];
    }
    
    clearHistory() {
        this.transactionHistory = [];
        console.log('Property transaction history cleared');
    }
    
    // Get active auctions
    getActiveAuctions() {
        return Array.from(this.auctions.values()).filter(auction => auction.status === 'active');
    }
    
    getAuction(auctionId) {
        return this.auctions.get(auctionId);
    }
    
    // Statistics
    getPropertyStatistics() {
        const stats = {
            totalProperties: this.gameState.board.filter(space => 
                ['property', 'railroad', 'utility'].includes(space.type)
            ).length,
            ownedProperties: 0,
            mortgagedProperties: 0,
            totalBuildings: 0,
            totalHotels: 0,
            propertyDistribution: {}
        };
        
        this.gameState.board.forEach(space => {
            if (['property', 'railroad', 'utility'].includes(space.type)) {
                if (space.ownerId !== null) {
                    stats.ownedProperties++;
                    
                    if (space.isMortgaged) {
                        stats.mortgagedProperties++;
                    }
                    
                    if (space.buildings > 0) {
                        if (space.buildings === 5) {
                            stats.totalHotels++;
                        } else {
                            stats.totalBuildings += space.buildings;
                        }
                    }
                    
                    // Distribution by color group
                    if (space.colorGroup) {
                        stats.propertyDistribution[space.colorGroup] = 
                            (stats.propertyDistribution[space.colorGroup] || 0) + 1;
                    }
                }
            }
        });
        
        return stats;
    }
    
    // State methods
    getState() {
        return {
            transactionCount: this.transactionHistory.length,
            activeAuctions: this.getActiveAuctions().length,
            lastTransaction: this.transactionHistory.length > 0 ? 
                this.transactionHistory[this.transactionHistory.length - 1] : null
        };
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.rentCalculator = managers.rentCalculator;
        this.eventHandler = managers.eventHandler;
        
        console.log('PropertyManager: All managers linked');
    }
}

module.exports = PropertyManager;