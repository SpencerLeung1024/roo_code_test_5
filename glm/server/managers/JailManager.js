class JailManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.jailHistory = [];
        this.maxHistoryLength = 50;
        this.jailPosition = 10; // Standard Monopoly jail position
    }
    
    // Send player to jail
    sendToJail(player, reason = 'unknown') {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        const oldPosition = player.position;
        
        // Send player to jail
        player.sendToJail();
        
        // Record jail entry
        const jailRecord = {
            playerId: player.id,
            playerName: player.name,
            fromPosition: oldPosition,
            reason: reason,
            timestamp: new Date(),
            type: 'enter'
        };
        
        this.addToHistory(jailRecord);
        
        // Emit jail event
        this.eventHandler.emit('player:jailed', {
            playerId: player.id,
            reason: reason,
            fromPosition: oldPosition
        });
        
        console.log(`${player.name} sent to jail from position ${oldPosition} (${reason})`);
        
        return true;
    }
    
    // Release player from jail
    releaseFromJail(player, method = 'unknown', cost = 0) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        if (!player.inJail) {
            throw new Error('Player is not in jail');
        }
        
        // Record jail exit
        const jailRecord = {
            playerId: player.id,
            playerName: player.name,
            method: method,
            cost: cost,
            jailTurns: player.jailTurns,
            timestamp: new Date(),
            type: 'exit'
        };
        
        this.addToHistory(jailRecord);
        
        // Release player
        player.releaseFromJail();
        
        // Emit release event
        this.eventHandler.emit('player:released', {
            playerId: player.id,
            method: method,
            cost: cost,
            jailTurns: jailRecord.jailTurns
        });
        
        console.log(`${player.name} released from jail (${method}) after ${jailRecord.jailTurns} turns`);
        
        return true;
    }
    
    // Player attempts to roll doubles to get out of jail
    attemptRollForDoubles(player, diceRoll) {
        if (!player || !diceRoll) {
            throw new Error('Invalid player or dice roll');
        }
        
        if (!player.inJail) {
            throw new Error('Player is not in jail');
        }
        
        const isDoubles = diceRoll[0] === diceRoll[1];
        
        // Record attempt
        const attemptRecord = {
            playerId: player.id,
            playerName: player.name,
            dice: diceRoll,
            isDoubles: isDoubles,
            jailTurns: player.jailTurns,
            timestamp: new Date()
        };
        
        if (isDoubles) {
            // Player rolled doubles - release from jail
            this.releaseFromJail(player, 'doubles');
            
            // Player gets to move after rolling doubles
            this.eventHandler.emit('player:rolled_doubles_in_jail', {
                playerId: player.id,
                dice: diceRoll
            });
            
            console.log(`${player.name} rolled doubles (${diceRoll[0]}, ${diceRoll[1]}) and released from jail`);
            
            return {
                success: true,
                released: true,
                moveSpaces: diceRoll[0] + diceRoll[1]
            };
        } else {
            // Player failed to roll doubles
            player.incrementJailTurns();
            
            this.eventHandler.emit('player:failed_jail_roll', {
                playerId: player.id,
                dice: diceRoll,
                jailTurns: player.jailTurns
            });
            
            console.log(`${player.name} failed to roll doubles (${diceRoll[0]}, ${diceRoll[1]}) in jail`);
            
            // Check if player has reached maximum jail turns
            if (player.jailTurns >= 3) {
                return this.handleMaxJailTurns(player);
            }
            
            return {
                success: true,
                released: false,
                message: 'Failed to roll doubles. Try again next turn.'
            };
        }
    }
    
    // Player pays fine to get out of jail
    payJailFine(player) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        if (!player.inJail) {
            throw new Error('Player is not in jail');
        }
        
        const fineAmount = this.gameState.settings.jailFine;
        
        if (!player.canAfford(fineAmount)) {
            throw new Error('Player cannot afford jail fine');
        }
        
        // Pay the fine
        player.pay(fineAmount);
        
        // Release from jail
        this.releaseFromJail(player, 'fine', fineAmount);
        
        console.log(`${player.name} paid $${fineAmount} fine and released from jail`);
        
        return {
            success: true,
            released: true,
            cost: fineAmount
        };
    }
    
    // Player uses Get Out of Jail Free card
    useGetOutOfJailCard(player) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        if (!player.inJail) {
            throw new Error('Player is not in jail');
        }
        
        if (player.getOutOfJailCards <= 0) {
            throw new Error('Player does not have any Get Out of Jail Free cards');
        }
        
        // Use the card
        player.useGetOutOfJailCard();
        
        // Release from jail
        this.releaseFromJail(player, 'card');
        
        console.log(`${player.name} used Get Out of Jail Free card and released from jail`);
        
        return {
            success: true,
            released: true,
            cardsRemaining: player.getOutOfJailCards
        };
    }
    
    // Handle player who has reached maximum jail turns
    handleMaxJailTurns(player) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        // Player must pay fine or use card
        if (player.getOutOfJailCards > 0) {
            // Use card automatically
            return this.useGetOutOfJailCard(player);
        } else if (player.canAfford(this.gameState.settings.jailFine)) {
            // Pay fine automatically
            return this.payJailFine(player);
        } else {
            // Player cannot pay - handle bankruptcy
            this.eventHandler.emit('player:cannot_pay_jail_fine', {
                playerId: player.id,
                fineAmount: this.gameState.settings.jailFine
            });
            
            console.log(`${player.name} cannot pay jail fine after 3 turns`);
            
            return {
                success: false,
                released: false,
                message: 'Player cannot pay jail fine after 3 turns'
            };
        }
    }
    
    // Give player a Get Out of Jail Free card
    giveGetOutOfJailCard(player, cardType = 'communityChest') {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        player.getOutOfJailCards++;
        
        this.eventHandler.emit('player:received_jail_card', {
            playerId: player.id,
            cardType: cardType,
            totalCards: player.getOutOfJailCards
        });
        
        console.log(`${player.name} received a Get Out of Jail Free card (${cardType})`);
        
        return true;
    }
    
    // Check if player is in jail
    isInJail(player) {
        if (!player) {
            return false;
        }
        return player.inJail;
    }
    
    // Get player's jail status
    getJailStatus(player) {
        if (!player) {
            return null;
        }
        
        return {
            inJail: player.inJail,
            jailTurns: player.jailTurns,
            getOutOfJailCards: player.getOutOfJailCards,
            canRoll: player.inJail && player.jailTurns < 3,
            mustPay: player.inJail && player.jailTurns >= 3,
            fineAmount: this.gameState.settings.jailFine
        };
    }
    
    // Get all players currently in jail
    getPlayersInJail() {
        return this.gameState.players.filter(player => player.inJail);
    }
    
    // Get jail statistics
    getJailStatistics() {
        const playersInJail = this.getPlayersInJail();
        const totalJailEntries = this.jailHistory.filter(record => record.type === 'enter').length;
        const totalJailExits = this.jailHistory.filter(record => record.type === 'exit').length;
        
        // Calculate release methods
        const releaseMethods = {
            doubles: 0,
            fine: 0,
            card: 0,
            other: 0
        };
        
        this.jailHistory.filter(record => record.type === 'exit').forEach(record => {
            if (releaseMethods.hasOwnProperty(record.method)) {
                releaseMethods[record.method]++;
            } else {
                releaseMethods.other++;
            }
        });
        
        // Calculate average jail time
        const jailTimes = this.jailHistory
            .filter(record => record.type === 'exit' && record.jailTurns)
            .map(record => record.jailTurns);
        
        const averageJailTime = jailTimes.length > 0 ? 
            jailTimes.reduce((sum, time) => sum + time, 0) / jailTimes.length : 0;
        
        return {
            playersCurrentlyInJail: playersInJail.length,
            playerNames: playersInJail.map(p => p.name),
            totalJailEntries,
            totalJailExits,
            releaseMethods,
            averageJailTime: Math.round(averageJailTime * 100) / 100
        };
    }
    
    // History management
    addToHistory(record) {
        this.jailHistory.push(record);
        
        // Keep history at maximum length
        if (this.jailHistory.length > this.maxHistoryLength) {
            this.jailHistory = this.jailHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getJailHistory(playerId = null, count = 10) {
        let history = this.jailHistory;
        
        if (playerId) {
            history = history.filter(record => record.playerId === playerId);
        }
        
        return history.slice(-count);
    }
    
    getFullHistory() {
        return [...this.jailHistory];
    }
    
    clearHistory() {
        this.jailHistory = [];
        console.log('Jail history cleared');
    }
    
    // Process jail turn for a player
    processJailTurn(player) {
        if (!player || !player.inJail) {
            return { processed: false, message: 'Player is not in jail' };
        }
        
        // Increment jail turns
        player.incrementJailTurns();
        
        this.eventHandler.emit('player:jail_turn_incremented', {
            playerId: player.id,
            jailTurns: player.jailTurns
        });
        
        console.log(`${player.name} has been in jail for ${player.jailTurns} turns`);
        
        // Check if player must pay fine
        if (player.jailTurns >= 3) {
            return this.handleMaxJailTurns(player);
        }
        
        return {
            processed: true,
            message: `Player has been in jail for ${player.jailTurns} turns`
        };
    }
    
    // Validate jail action
    validateJailAction(player, action) {
        if (!player || !action) {
            return { valid: false, message: 'Invalid player or action' };
        }
        
        if (!player.inJail) {
            return { valid: false, message: 'Player is not in jail' };
        }
        
        switch (action) {
            case 'roll':
                if (player.jailTurns >= 3) {
                    return { valid: false, message: 'Player must pay fine or use card after 3 turns' };
                }
                return { valid: true, message: 'Player can attempt to roll doubles' };
                
            case 'pay':
                if (!player.canAfford(this.gameState.settings.jailFine)) {
                    return { valid: false, message: 'Player cannot afford jail fine' };
                }
                return { valid: true, message: 'Player can pay jail fine' };
                
            case 'card':
                if (player.getOutOfJailCards <= 0) {
                    return { valid: false, message: 'Player does not have any Get Out of Jail Free cards' };
                }
                return { valid: true, message: 'Player can use Get Out of Jail Free card' };
                
            default:
                return { valid: false, message: 'Invalid jail action' };
        }
    }
    
    // State methods
    getState() {
        return {
            jailPosition: this.jailPosition,
            playersInJail: this.getPlayersInJail().map(p => ({
                id: p.id,
                name: p.name,
                jailTurns: p.jailTurns,
                getOutOfJailCards: p.getOutOfJailCards
            })),
            jailFine: this.gameState.settings.jailFine,
            totalJailEntries: this.jailHistory.filter(record => record.type === 'enter').length
        };
    }
}

module.exports = JailManager;