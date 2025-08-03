class BankruptcyManager {
    constructor(gameState, eventHandler, propertyManager) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.propertyManager = propertyManager;
        this.bankruptcyHistory = [];
        this.maxHistoryLength = 50;
    }
    
    // Declare bankruptcy for a player
    declareBankruptcy(player, creditor = null, debtAmount = 0) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        if (player.bankrupt) {
            throw new Error('Player is already bankrupt');
        }
        
        // Record bankruptcy details
        const bankruptcyRecord = {
            playerId: player.id,
            playerName: player.name,
            creditorId: creditor ? creditor.id : null,
            creditorName: creditor ? creditor.name : 'bank',
            debtAmount: debtAmount,
            totalAssets: player.calculateTotalWorth(),
            timestamp: new Date()
        };
        
        // Mark player as bankrupt
        player.bankrupt = true;
        
        // Process asset liquidation
        const liquidationResult = this.liquidateAssets(player, creditor);
        
        // Record bankruptcy
        this.addToHistory(bankruptcyRecord);
        
        // Emit bankruptcy event
        this.eventHandler.emit('player:bankrupt', {
            playerId: player.id,
            creditorId: creditor ? creditor.id : null,
            debtAmount: debtAmount,
            liquidationResult: liquidationResult
        });
        
        console.log(`${player.name} declared bankruptcy to ${creditor ? creditor.name : 'bank'} with debt of $${debtAmount}`);
        
        // Check if game should end
        this.checkGameEndCondition();
        
        return {
            success: true,
            player: player.name,
            creditor: creditor ? creditor.name : 'bank',
            debtAmount: debtAmount,
            liquidationResult: liquidationResult
        };
    }
    
    // Liquidate player's assets
    liquidateAssets(player, creditor = null) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        const liquidationResult = {
            propertiesSold: 0,
            buildingsSold: 0,
            propertiesMortgaged: 0,
            totalValue: 0,
            propertiesTransferred: [],
            buildingsSold: [],
            cashReceived: 0
        };
        
        // First, sell all buildings
        const buildingsToSell = [];
        player.properties.forEach(propertyId => {
            const property = this.gameState.getPropertyById(propertyId);
            if (property && property.buildings > 0) {
                buildingsToSell.push(property);
            }
        });
        
        // Sort properties by building count (sell hotels first)
        buildingsToSell.sort((a, b) => b.buildings - a.buildings);
        
        // Sell buildings
        buildingsToSell.forEach(property => {
            while (property.buildings > 0) {
                let saleAmount = 0;
                if (property.buildings === 5) {
                    saleAmount = property.sellHotel();
                    liquidationResult.buildingsSold.push({
                        propertyId: property.id,
                        propertyName: property.name,
                        buildingType: 'hotel',
                        amount: saleAmount
                    });
                } else {
                    saleAmount = property.sellHouse();
                    liquidationResult.buildingsSold.push({
                        propertyId: property.id,
                        propertyName: property.name,
                        buildingType: 'house',
                        amount: saleAmount
                    });
                }
                
                liquidationResult.buildingsSold++;
                liquidationResult.totalValue += saleAmount;
                player.receive(saleAmount);
            }
        });
        
        // Next, handle properties
        if (creditor) {
            // Transfer properties to creditor
            player.properties.forEach(propertyId => {
                const property = this.gameState.getPropertyById(propertyId);
                if (property) {
                    // Unmortgage property if necessary
                    if (property.isMortgaged) {
                        const unmortgageCost = Math.floor(property.mortgageValue * 1.1);
                        if (creditor.canAfford(unmortgageCost)) {
                            creditor.pay(unmortgageCost);
                            property.isMortgaged = false;
                        }
                    }
                    
                    // Transfer property
                    player.removeProperty(propertyId);
                    creditor.addProperty(property);
                    
                    liquidationResult.propertiesTransferred.push({
                        propertyId: property.id,
                        propertyName: property.name,
                        toPlayerId: creditor.id,
                        toPlayerName: creditor.name
                    });
                    
                    liquidationResult.propertiesSold++;
                    liquidationResult.totalValue += property.price;
                }
            });
        } else {
            // Sell properties to bank
            player.properties.forEach(propertyId => {
                const property = this.gameState.getPropertyById(propertyId);
                if (property) {
                    // Mortgage property if not already mortgaged
                    if (!property.isMortgaged) {
                        const mortgageAmount = property.mortgage();
                        player.receive(mortgageAmount);
                        liquidationResult.propertiesMortgaged++;
                        liquidationResult.totalValue += mortgageAmount;
                    }
                    
                    // Remove property from player
                    player.removeProperty(propertyId);
                    property.ownerId = null;
                    
                    liquidationResult.propertiesSold++;
                }
            });
        }
        
        // Add remaining cash to total value
        liquidationResult.cashReceived = player.money;
        liquidationResult.totalValue += player.money;
        
        // Clear player's cash
        player.money = 0;
        
        return liquidationResult;
    }
    
    // Check if player can pay a debt
    canPayDebt(player, amount) {
        if (!player) {
            return false;
        }
        
        // Check if player has enough cash
        if (player.money >= amount) {
            return true;
        }
        
        // Calculate total assets
        const totalAssets = player.calculateTotalWorth();
        
        return totalAssets >= amount;
    }
    
    // Calculate total assets for a player
    calculateTotalAssets(player) {
        if (!player) {
            return 0;
        }
        
        return player.calculateTotalWorth();
    }
    
    // Get player's financial status
    getFinancialStatus(player) {
        if (!player) {
            return null;
        }
        
        const totalAssets = this.calculateTotalAssets(player);
        const liquidAssets = player.money;
        const propertyAssets = player.properties.reduce((sum, propertyId) => {
            const property = this.gameState.getPropertyById(propertyId);
            if (property) {
                let propertyValue = property.price;
                
                // Add building values
                if (property.buildings > 0) {
                    if (property.buildings === 5) {
                        propertyValue += property.hotelCost;
                    } else {
                        propertyValue += property.buildings * property.houseCost;
                    }
                }
                
                // Subtract mortgage value if mortgaged
                if (property.isMortgaged) {
                    propertyValue -= property.mortgageValue;
                }
                
                return sum + propertyValue;
            }
            return sum;
        }, 0);
        
        const buildingAssets = player.properties.reduce((sum, propertyId) => {
            const property = this.gameState.getPropertyById(propertyId);
            if (property && property.buildings > 0) {
                if (property.buildings === 5) {
                    return sum + property.hotelCost;
                } else {
                    return sum + property.buildings * property.houseCost;
                }
            }
            return sum;
        }, 0);
        
        return {
            playerId: player.id,
            playerName: player.name,
            cash: liquidAssets,
            propertyCount: player.properties.length,
            propertyAssets: propertyAssets,
            buildingAssets: buildingAssets,
            totalAssets: totalAssets,
            netWorth: totalAssets,
            canPayMinimumDebt: liquidAssets > 0,
            bankruptcyRisk: totalAssets < 1000 // Arbitrary threshold
        };
    }
    
    // Check bankruptcy conditions for a player
    checkBankruptcyConditions(player) {
        if (!player || player.bankrupt) {
            return { atRisk: false, reason: 'already_bankrupt' };
        }
        
        const financialStatus = this.getFinancialStatus(player);
        
        // Check if player has no cash and no assets
        if (financialStatus.cash <= 0 && financialStatus.totalAssets <= 0) {
            return { atRisk: true, reason: 'no_assets', severity: 'critical' };
        }
        
        // Check if player has very low assets
        if (financialStatus.totalAssets < 100) {
            return { atRisk: true, reason: 'very_low_assets', severity: 'high' };
        }
        
        // Check if player has no cash but has assets
        if (financialStatus.cash <= 0 && financialStatus.totalAssets > 0) {
            return { atRisk: true, reason: 'no_cash', severity: 'medium' };
        }
        
        // Check if player has low assets
        if (financialStatus.totalAssets < 500) {
            return { atRisk: true, reason: 'low_assets', severity: 'low' };
        }
        
        return { atRisk: false, reason: 'stable' };
    }
    
    // Get all players at risk of bankruptcy
    getPlayersAtRisk() {
        const playersAtRisk = [];
        
        this.gameState.players.forEach(player => {
            if (!player.bankrupt) {
                const riskAssessment = this.checkBankruptcyConditions(player);
                if (riskAssessment.atRisk) {
                    playersAtRisk.push({
                        player: player,
                        ...riskAssessment,
                        financialStatus: this.getFinancialStatus(player)
                    });
                }
            }
        });
        
        // Sort by severity
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        playersAtRisk.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
        
        return playersAtRisk;
    }
    
    // Check if game should end
    checkGameEndCondition() {
        const activePlayers = this.gameState.players.filter(p => !p.bankrupt);
        
        // Game ends when only one player remains
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            
            this.eventHandler.emit('game:ended', {
                reason: 'bankruptcy',
                winnerId: winner.id,
                winnerName: winner.name
            });
            
            console.log(`Game ended! ${winner.name} is the winner!`);
            
            return {
                gameEnded: true,
                winner: winner,
                reason: 'bankruptcy'
            };
        }
        
        // Game ends when all players but one are bankrupt
        if (activePlayers.length <= 1) {
            const winner = activePlayers[0] || null;
            
            this.eventHandler.emit('game:ended', {
                reason: 'all_bankrupt',
                winnerId: winner ? winner.id : null,
                winnerName: winner ? winner.name : null
            });
            
            console.log(`Game ended! ${winner ? winner.name + ' is the winner!' : 'No winner - all players bankrupt'}`);
            
            return {
                gameEnded: true,
                winner: winner,
                reason: 'all_bankrupt'
            };
        }
        
        return { gameEnded: false };
    }
    
    // Get bankruptcy statistics
    getBankruptcyStatistics() {
        const totalBankruptcies = this.bankruptcyHistory.length;
        const activePlayers = this.gameState.players.filter(p => !p.bankrupt);
        const bankruptPlayers = this.gameState.players.filter(p => p.bankrupt);
        
        // Calculate bankruptcy reasons
        const bankruptcyReasons = {};
        this.bankruptcyHistory.forEach(record => {
            const reason = record.creditorName === 'bank' ? 'debt_to_bank' : 'debt_to_player';
            bankruptcyReasons[reason] = (bankruptcyReasons[reason] || 0) + 1;
        });
        
        // Calculate average debt amount
        const totalDebt = this.bankruptcyHistory.reduce((sum, record) => sum + record.debtAmount, 0);
        const averageDebt = totalBankruptcies > 0 ? totalDebt / totalBankruptcies : 0;
        
        return {
            totalPlayers: this.gameState.players.length,
            activePlayers: activePlayers.length,
            bankruptPlayers: bankruptPlayers.length,
            totalBankruptcies,
            bankruptcyRate: this.gameState.players.length > 0 ? 
                (bankruptPlayers.length / this.gameState.players.length) * 100 : 0,
            bankruptcyReasons,
            averageDebt: Math.round(averageDebt),
            totalDebtLost: totalDebt
        };
    }
    
    // History management
    addToHistory(record) {
        this.bankruptcyHistory.push(record);
        
        // Keep history at maximum length
        if (this.bankruptcyHistory.length > this.maxHistoryLength) {
            this.bankruptcyHistory = this.bankruptcyHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getBankruptcyHistory(playerId = null, count = 10) {
        let history = this.bankruptcyHistory;
        
        if (playerId) {
            history = history.filter(record => record.playerId === playerId);
        }
        
        return history.slice(-count);
    }
    
    getFullHistory() {
        return [...this.bankruptcyHistory];
    }
    
    clearHistory() {
        this.bankruptcyHistory = [];
        console.log('Bankruptcy history cleared');
    }
    
    // Validate bankruptcy action
    validateBankruptcy(player, debtAmount = 0) {
        if (!player) {
            return { valid: false, message: 'Invalid player' };
        }
        
        if (player.bankrupt) {
            return { valid: false, message: 'Player is already bankrupt' };
        }
        
        const totalAssets = this.calculateTotalAssets(player);
        
        if (totalAssets >= debtAmount) {
            return { valid: false, message: 'Player can afford to pay the debt' };
        }
        
        return { valid: true, message: 'Player is eligible for bankruptcy' };
    }
    
    // State methods
    getState() {
        return {
            bankruptPlayers: this.gameState.players.filter(p => p.bankrupt).map(p => p.id),
            totalBankruptcies: this.bankruptcyHistory.length,
            playersAtRisk: this.getPlayersAtRisk().map(p => ({
                playerId: p.player.id,
                playerName: p.player.name,
                riskLevel: p.severity
            }))
        };
    }
}

module.exports = BankruptcyManager;