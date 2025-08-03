class AuctionManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.activeAuctions = new Map();
        this.auctionHistory = [];
        this.maxHistoryLength = 50;
        this.auctionSettings = {
            defaultTimeout: 30000, // 30 seconds
            minBidIncrement: 10,
            autoEndAfterNoBids: 10000 // 10 seconds
        };
    }

    // Start a new auction for a property
    startAuction(propertyId, startingBid = 0) {
        try {
            const property = this.gameState.getPropertyById(propertyId);
            
            if (!property) {
                throw new Error('Property not found');
            }

            if (property.ownerId !== null) {
                throw new Error('Property is already owned');
            }

            const auctionId = `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const auction = {
                id: auctionId,
                propertyId,
                propertyName: property.name,
                startingBid,
                currentBid: startingBid,
                highestBidder: null,
                bids: [],
                startTime: new Date(),
                status: 'active',
                timeout: null,
                lastBidTime: null
            };

            this.activeAuctions.set(auctionId, auction);

            // Set auction timeout
            auction.timeout = setTimeout(() => {
                this.endAuction(auctionId, 'timeout');
            }, this.auctionSettings.defaultTimeout);

            this.eventHandler.emit('auction:started', {
                auctionId,
                propertyId,
                propertyName: property.name,
                startingBid
            });

            this.gameState.updateLastAction({
                type: 'auction_started',
                auctionId,
                propertyId
            });

            return {
                success: true,
                auctionId,
                auction
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Place a bid in an auction
    placeBid(auctionId, playerId, bidAmount) {
        try {
            const auction = this.activeAuctions.get(auctionId);
            
            if (!auction) {
                throw new Error('Auction not found');
            }

            if (auction.status !== 'active') {
                throw new Error('Auction is not active');
            }

            const player = this.gameState.getPlayerById(playerId);
            
            if (!player) {
                throw new Error('Player not found');
            }

            if (player.bankrupt) {
                throw new Error('Bankrupt players cannot bid');
            }

            // Validate bid amount
            if (bidAmount <= auction.currentBid) {
                throw new Error('Bid must be higher than current bid');
            }

            if (bidAmount - auction.currentBid < this.auctionSettings.minBidIncrement) {
                throw new Error(`Bid must be at least $${this.auctionSettings.minBidIncrement} higher than current bid`);
            }

            if (!player.canAfford(bidAmount)) {
                throw new Error('Player cannot afford this bid');
            }

            // Process the bid
            auction.currentBid = bidAmount;
            auction.highestBidder = playerId;
            auction.lastBidTime = new Date();

            const bid = {
                playerId,
                playerName: player.name,
                amount: bidAmount,
                timestamp: new Date()
            };

            auction.bids.push(bid);

            // Reset auction timeout
            if (auction.timeout) {
                clearTimeout(auction.timeout);
            }
            
            auction.timeout = setTimeout(() => {
                this.endAuction(auctionId, 'timeout');
            }, this.auctionSettings.autoEndAfterNoBids);

            this.eventHandler.emit('auction:bid_placed', {
                auctionId,
                playerId,
                playerName: player.name,
                bidAmount,
                currentBid: auction.currentBid
            });

            return {
                success: true,
                message: `Bid of $${bidAmount} placed by ${player.name}`,
                currentBid: auction.currentBid
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // End an auction
    endAuction(auctionId, reason = 'manual') {
        try {
            const auction = this.activeAuctions.get(auctionId);
            
            if (!auction) {
                throw new Error('Auction not found');
            }

            if (auction.status !== 'active') {
                throw new Error('Auction is already ended');
            }

            // Clear timeout
            if (auction.timeout) {
                clearTimeout(auction.timeout);
            }

            auction.status = 'ended';
            auction.endTime = new Date();
            auction.endReason = reason;

            let result = {
                auctionId,
                propertyId: auction.propertyId,
                propertyName: auction.propertyName,
                reason,
                winner: null,
                finalPrice: 0
            };

            // Process the auction result
            if (auction.highestBidder) {
                const winner = this.gameState.getPlayerById(auction.highestBidder);
                const property = this.gameState.getPropertyById(auction.propertyId);

                if (winner && property) {
                    // Complete the purchase
                    winner.pay(auction.currentBid);
                    winner.addProperty(property);

                    result.winner = {
                        id: winner.id,
                        name: winner.name
                    };
                    result.finalPrice = auction.currentBid;

                    this.eventHandler.emit('auction:ended', {
                        auctionId,
                        winnerId: winner.id,
                        winnerName: winner.name,
                        propertyId: auction.propertyId,
                        finalPrice: auction.currentBid,
                        reason
                    });

                    this.gameState.updateLastAction({
                        type: 'auction_won',
                        playerId: winner.id,
                        propertyId: auction.propertyId,
                        amount: auction.currentBid,
                        auctionId
                    });
                }
            } else {
                // No winner - property remains unsold
                this.eventHandler.emit('auction:ended', {
                    auctionId,
                    winnerId: null,
                    propertyId: auction.propertyId,
                    finalPrice: 0,
                    reason: 'no_bids'
                });

                this.gameState.updateLastAction({
                    type: 'auction_no_winner',
                    propertyId: auction.propertyId,
                    auctionId
                });
            }

            // Move to history
            this.addToHistory(auction);
            
            // Remove from active auctions
            this.activeAuctions.delete(auctionId);

            return {
                success: true,
                result
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Cancel an auction
    cancelAuction(auctionId) {
        try {
            const auction = this.activeAuctions.get(auctionId);
            
            if (!auction) {
                throw new Error('Auction not found');
            }

            if (auction.status !== 'active') {
                throw new Error('Auction is not active');
            }

            // Clear timeout
            if (auction.timeout) {
                clearTimeout(auction.timeout);
            }

            auction.status = 'cancelled';
            auction.endTime = new Date();

            this.eventHandler.emit('auction:cancelled', {
                auctionId,
                propertyId: auction.propertyId
            });

            // Move to history
            this.addToHistory(auction);
            
            // Remove from active auctions
            this.activeAuctions.delete(auctionId);

            return {
                success: true,
                message: 'Auction cancelled'
            };
        } catch (error) {
            this.eventHandler.emit('error:occurred', { message: error.message });
            return { success: false, message: error.message };
        }
    }

    // Get auction details
    getAuction(auctionId) {
        const auction = this.activeAuctions.get(auctionId);
        if (!auction) {
            return null;
        }

        return {
            ...auction,
            timeRemaining: auction.timeout ? this.getTimeRemaining(auction) : 0,
            bidCount: auction.bids.length
        };
    }

    // Get all active auctions
    getActiveAuctions() {
        return Array.from(this.activeAuctions.values()).map(auction => ({
            ...auction,
            timeRemaining: auction.timeout ? this.getTimeRemaining(auction) : 0,
            bidCount: auction.bids.length
        }));
    }

    // Get auction history
    getAuctionHistory(limit = 10) {
        return this.auctionHistory.slice(-limit);
    }

    // Get player's auction history
    getPlayerAuctionHistory(playerId, limit = 10) {
        return this.auctionHistory
            .filter(auction => 
                auction.bids.some(bid => bid.playerId === playerId) || 
                auction.winner?.id === playerId
            )
            .slice(-limit);
    }

    // Check if player can bid in auction
    canPlayerBid(playerId, auctionId) {
        const auction = this.activeAuctions.get(auctionId);
        if (!auction || auction.status !== 'active') {
            return { canBid: false, reason: 'Auction not active' };
        }

        const player = this.gameState.getPlayerById(playerId);
        if (!player) {
            return { canBid: false, reason: 'Player not found' };
        }

        if (player.bankrupt) {
            return { canBid: false, reason: 'Player is bankrupt' };
        }

        const minNextBid = auction.currentBid + this.auctionSettings.minBidIncrement;
        if (!player.canAfford(minNextBid)) {
            return { canBid: false, reason: 'Insufficient funds' };
        }

        return { canBid: true, minNextBid };
    }

    // Get auction statistics
    getAuctionStatistics() {
        const stats = {
            totalAuctions: this.auctionHistory.length,
            activeAuctions: this.activeAuctions.size,
            completedAuctions: this.auctionHistory.filter(a => a.status === 'ended').length,
            cancelledAuctions: this.auctionHistory.filter(a => a.status === 'cancelled').length,
            averageFinalPrice: 0,
            mostActiveBidders: this.getMostActiveBidders()
        };

        // Calculate average final price
        const completedAuctions = this.auctionHistory.filter(a => a.status === 'ended' && a.finalPrice > 0);
        if (completedAuctions.length > 0) {
            const totalPrices = completedAuctions.reduce((sum, a) => sum + a.finalPrice, 0);
            stats.averageFinalPrice = Math.round(totalPrices / completedAuctions.length);
        }

        return stats;
    }

    // Private helper methods
    getTimeRemaining(auction) {
        if (!auction.timeout) return 0;
        
        const elapsed = Date.now() - auction.lastBidTime || auction.startTime;
        const remaining = this.auctionSettings.autoEndAfterNoBids - elapsed;
        return Math.max(0, remaining);
    }

    getMostActiveBidders() {
        const bidderStats = {};
        
        this.auctionHistory.forEach(auction => {
            auction.bids.forEach(bid => {
                if (!bidderStats[bid.playerId]) {
                    bidderStats[bid.playerId] = {
                        playerId: bid.playerId,
                        playerName: bid.playerName,
                        bidCount: 0,
                        totalAmount: 0,
                        auctionsWon: 0
                    };
                }
                bidderStats[bid.playerId].bidCount++;
                bidderStats[bid.playerId].totalAmount += bid.amount;
            });
            
            if (auction.winner) {
                if (!bidderStats[auction.winner.id]) {
                    bidderStats[auction.winner.id] = {
                        playerId: auction.winner.id,
                        playerName: auction.winner.name,
                        bidCount: 0,
                        totalAmount: 0,
                        auctionsWon: 0
                    };
                }
                bidderStats[auction.winner.id].auctionsWon++;
            }
        });

        return Object.values(bidderStats)
            .sort((a, b) => b.bidCount - a.bidCount)
            .slice(0, 5);
    }

    addToHistory(auction) {
        const historyRecord = {
            id: auction.id,
            propertyId: auction.propertyId,
            propertyName: auction.propertyName,
            startingBid: auction.startingBid,
            finalPrice: auction.currentBid,
            winner: auction.highestBidder ? {
                id: auction.highestBidder,
                name: this.gameState.getPlayerById(auction.highestBidder)?.name || 'Unknown'
            } : null,
            bidCount: auction.bids.length,
            status: auction.status,
            startTime: auction.startTime,
            endTime: auction.endTime || new Date(),
            endReason: auction.endReason || 'manual'
        };

        this.auctionHistory.push(historyRecord);

        // Keep history at maximum length
        if (this.auctionHistory.length > this.maxHistoryLength) {
            this.auctionHistory = this.auctionHistory.slice(-this.maxHistoryLength);
        }
    }
    
    // Set up cross-references to other managers
    setManagers(managers) {
        this.gameStateManager = managers.gameStateManager;
        this.eventHandler = managers.eventHandler;
        
        console.log('AuctionManager: All managers linked');
    }
}

module.exports = AuctionManager;