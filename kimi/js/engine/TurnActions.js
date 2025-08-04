/**
 * Turn Actions
 * Handles all turn-based actions like dice rolling, movement, and player decisions
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { debugLog } from '../config/constants.js';

/**
 * Manages turn-based actions and player decisions
 */
export class TurnActions extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.currentAction = null;
        this.actionQueue = [];
        this.isProcessing = false;
    }

    /**
     * Initialize the turn actions system
     */
    async init() {
        console.log('🎲 Initializing Turn Actions...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Turn Actions initialized');
    }

    /**
     * Setup event listeners for turn actions
     */
    setupEventListeners() {
        // Listen for turn start
        this.gameEngine.on('turn:start', (data) => {
            this.handleTurnStart(data);
        });

        // Listen for dice events
        document.addEventListener('dice:rolled', (event) => {
            this.handleDiceRolled(event.detail);
        });

        // Listen for movement events
        document.addEventListener('player:moved', (event) => {
            this.handlePlayerMoved(event.detail);
        });

        // Listen for property events
        document.addEventListener('property:landed', (event) => {
            this.handlePropertyLanded(event.detail);
        });

        // Listen for card events
        document.addEventListener('card:drawn', (event) => {
            this.handleCardDrawn(event.detail);
        });

        // Listen for jail events
        document.addEventListener('jail:turn', (event) => {
            this.handleJailTurn(event.detail);
        });
    }

    /**
     * Handle turn start
     * @param {Object} data - Turn start data
     */
    handleTurnStart(data) {
        const player = data.player;
        
        // Reset action state
        this.currentAction = null;
        this.actionQueue = [];
        this.isProcessing = false;

        // Determine available actions based on player state
        const availableActions = this.getAvailableActions(player);
        
        this.emit('actions:available', {
            player: player,
            actions: availableActions
        });

        debugLog('info', `Available actions for ${player.name}:`, availableActions);
    }

    /**
     * Get available actions for a player
     * @param {Player} player - The player
     * @returns {Array} Available actions
     */
    getAvailableActions(player) {
        const actions = [];

        // Always available actions
        actions.push('view_properties');
        actions.push('view_players');

        // Dice rolling
        if (!player.inJail) {
            actions.push('roll_dice');
        } else {
            actions.push('jail_decision');
        }

        // Trading (if other players exist)
        const otherPlayers = this.gameEngine.playerManager.getActivePlayers()
            .filter(p => p.id !== player.id);
        if (otherPlayers.length > 0) {
            actions.push('trade');
        }

        // Property management
        if (player.properties.length > 0) {
            actions.push('manage_properties');
            actions.push('build_houses');
        }

        // Mortgage actions
        const mortgagedProperties = player.properties.filter(p => p.isMortgaged);
        if (mortgagedProperties.length > 0) {
            actions.push('unmortgage_properties');
        }

        return actions;
    }

    /**
     * Handle dice rolled event
     * @param {Object} data - Dice roll data
     */
    async handleDiceRolled(data) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const player = this.gameEngine.getCurrentPlayer();
        
        try {
            // Add dice roll to turn actions
            this.addAction('dice_roll', {
                dice1: data.dice1,
                dice2: data.dice2,
                total: data.total,
                isDouble: data.isDouble
            });

            // Move player
            await this.movePlayer(player, data.total);

            // Handle doubles
            if (data.isDouble && !player.inJail) {
                this.handleDoubles(player, data);
            }

        } catch (error) {
            debugLog('error', 'Error handling dice roll:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Move player on the board
     * @param {Player} player - The player to move
     * @param {number} steps - Number of steps to move
     */
    async movePlayer(player, steps) {
        const oldPosition = player.position;
        const newPosition = (oldPosition + steps) % 40;
        
        // Handle passing GO
        if (newPosition < oldPosition && oldPosition + steps >= 40) {
            const goAmount = 200; // Standard GO amount
            player.money += goAmount;
            
            this.addAction('pass_go', {
                amount: goAmount,
                newBalance: player.money
            });
            
            this.emit('player:passed_go', {
                player: player,
                amount: goAmount
            });
        }

        // Update player position
        player.position = newPosition;
        
        this.addAction('move', {
            from: oldPosition,
            to: newPosition,
            steps: steps
        });

        // Emit movement event
        this.emit('player:moved', {
            player: player,
            from: oldPosition,
            to: newPosition,
            steps: steps
        });

        // Handle landing on square
        await this.handleLanding(player, newPosition);
    }

    /**
     * Handle player landing on a square
     * @param {Player} player - The player
     * @param {number} position - Board position
     */
    async handleLanding(player, position) {
        const square = this.gameEngine.board.getSquare(position);
        if (!square) return;

        this.addAction('land', {
            position: position,
            square: square.name,
            type: square.type
        });

        // Handle based on square type
        switch (square.type) {
            case 'property':
            case 'railroad':
            case 'utility':
                await this.handlePropertyLanding(player, square);
                break;
            case 'chance':
                await this.handleCardLanding(player, 'chance');
                break;
            case 'community-chest':
                await this.handleCardLanding(player, 'community-chest');
                break;
            case 'tax':
                await this.handleTaxLanding(player, square);
                break;
            case 'go-to-jail':
                await this.handleGoToJailLanding(player);
                break;
            case 'free-parking':
                await this.handleFreeParkingLanding(player);
                break;
            case 'jail':
                // Just visiting
                this.addAction('visit_jail', { just_visiting: true });
                break;
            default:
                // Handle other squares
                break;
        }

        // Check if turn should end
        this.checkTurnEnd(player);
    }

    /**
     * Handle property landing
     * @param {Player} player - The player
     * @param {Object} square - The property square
     */
    async handlePropertyLanding(player, square) {
        const property = square.data;
        
        if (!property.owner) {
            // Property is unowned - offer to buy
            this.emit('property:unowned', {
                player: player,
                property: property
            });
        } else if (property.owner.id !== player.id) {
            // Property is owned by another player - pay rent
            const rent = this.gameEngine.rentService.calculateRent(property, player);
            
            if (player.money >= rent) {
                player.transferMoney(property.owner, rent, `Rent for ${property.name}`);
                
                this.addAction('pay_rent', {
                    property: property.name,
                    amount: rent,
                    to: property.owner.name,
                    newBalance: player.money
                });
                
                this.emit('rent:paid', {
                    from: player,
                    to: property.owner,
                    amount: rent,
                    property: property
                });
            } else {
                // Handle bankruptcy
                this.handleBankruptcy(player, property.owner, rent);
            }
        }
    }

    /**
     * Handle card landing (Chance/Community Chest)
     * @param {Player} player - The player
     * @param {string} deckType - Type of card deck
     */
    async handleCardLanding(player, deckType) {
        const card = this.gameEngine.cardManager.drawCard(deckType);
        
        if (card) {
            this.addAction('draw_card', {
                deck: deckType,
                card: card.text
            });

            this.emit('card:drawn', {
                player: player,
                card: card,
                deck: deckType
            });

            // Apply card effect
            await this.gameEngine.cardEffectService.applyCardEffect(card, player);
        }
    }

    /**
     * Handle tax landing
     * @param {Player} player - The player
     * @param {Object} square - The tax square
     */
    async handleTaxLanding(player, square) {
        const taxAmount = square.data?.amount || 0;
        
        if (player.money >= taxAmount) {
            player.money -= taxAmount;
            
            this.addAction('pay_tax', {
                type: square.name,
                amount: taxAmount,
                newBalance: player.money
            });
            
            this.emit('tax:paid', {
                player: player,
                amount: taxAmount,
                type: square.name
            });
        } else {
            this.handleBankruptcy(player, null, taxAmount);
        }
    }

    /**
     * Handle Go to Jail landing
     * @param {Player} player - The player
     */
    async handleGoToJailLanding(player) {
        player.goToJail();
        
        this.addAction('go_to_jail', {
            reason: 'Landed on Go to Jail'
        });
        
        this.emit('jail:entered', {
            player: player,
            reason: 'Go to Jail square'
        });
    }

    /**
     * Handle Free Parking landing
     * @param {Player} player - The player
     */
    async handleFreeParkingLanding(player) {
        // Optional: Implement Free Parking jackpot
        this.addAction('free_parking', {
            player: player.name
        });
        
        this.emit('free_parking:landed', {
            player: player
        });
    }

    /**
     * Handle doubles rolled
     * @param {Player} player - The player
     * @param {Object} diceData - Dice roll data
     */
    handleDoubles(player, diceData) {
        player.consecutiveDoubles = (player.consecutiveDoubles || 0) + 1;
        
        this.addAction('doubles', {
            count: player.consecutiveDoubles,
            dice1: diceData.dice1,
            dice2: diceData.dice2
        });
        
        if (player.consecutiveDoubles >= 3) {
            // Go to jail for 3 doubles
            player.goToJail();
            player.consecutiveDoubles = 0;
            
            this.addAction('go_to_jail', {
                reason: 'Three doubles'
            });
            
            this.emit('jail:entered', {
                player: player,
                reason: 'Three consecutive doubles'
            });
        } else {
            // Allow another roll
            this.emit('doubles:rolled', {
                player: player,
                count: player.consecutiveDoubles
            });
        }
    }

    /**
     * Handle jail turn
     * @param {Object} data - Jail turn data
     */
    handleJailTurn(data) {
        const player = data.player;
        
        this.addAction('jail_turn', {
            turnsInJail: player.turnsInJail || 0,
            hasGetOutOfJailCard: player.hasGetOutOfJailCard()
        });
        
        this.emit('jail:turn_actions', {
            player: player,
            options: this.getJailOptions(player)
        });
    }

    /**
     * Get jail options for a player
     * @param {Player} player - The player in jail
     * @returns {Array} Available jail options
     */
    getJailOptions(player) {
        const options = [];
        
        if (player.hasGetOutOfJailCard()) {
            options.push('use_card');
        }
        
        if (player.money >= 50) {
            options.push('pay_bail');
        }
        
        options.push('roll_dice');
        
        return options;
    }

    /**
     * Handle bankruptcy
     * @param {Player} player - The bankrupt player
     * @param {Player|null} creditor - The creditor
     * @param {number} amount - Amount owed
     */
    handleBankruptcy(player, creditor, amount) {
        this.addAction('bankruptcy', {
            amount: amount,
            creditor: creditor?.name || 'Bank',
            assets: player.getNetWorth()
        });
        
        this.emit('player:bankrupt', {
            player: player,
            creditor: creditor,
            amount: amount
        });
        
        // Handle asset liquidation
        this.gameEngine.playerManager.eliminatePlayer(player.id, creditor);
    }

    /**
     * Check if turn should end
     * @param {Player} player - The current player
     */
    checkTurnEnd(player) {
        // Turn ends if:
        // 1. Player rolled doubles (but not 3rd double)
        // 2. Player is in jail
        // 3. All actions are complete
        
        const shouldEnd = player.inJail || 
                         (player.consecutiveDoubles || 0) === 0 ||
                         (player.consecutiveDoubles >= 3);

        if (shouldEnd) {
            this.emit('turn:ready_to_end', {
                player: player
            });
        }
    }

    /**
     * Add action to current turn
     * @param {string} type - Action type
     * @param {Object} details - Action details
     */
    addAction(type, details) {
        const action = {
            type,
            details,
            timestamp: Date.now(),
            player: this.gameEngine.getCurrentPlayer()?.id
        };

        this.emit('action:added', action);
    }

    /**
     * Get current action queue
     * @returns {Array} Action queue
     */
    getActionQueue() {
        return [...this.actionQueue];
    }

    /**
     * Clear action queue
     */
    clearActionQueue() {
        this.actionQueue = [];
    }

    /**
     * Reset turn actions
     */
    reset() {
        this.currentAction = null;
        this.actionQueue = [];
        this.isProcessing = false;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.removeAllListeners();
    }
}