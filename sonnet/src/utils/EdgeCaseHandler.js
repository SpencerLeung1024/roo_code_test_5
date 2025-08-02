/**
 * Edge Case Handler for Monopoly Game
 * Manages complex scenarios during bankruptcy, property transfers, and game end conditions
 */

export class EdgeCaseHandler {
  constructor(gameState, players, properties) {
    this.gameState = gameState
    this.players = players
    this.properties = properties
    this.eventQueue = []
    this.processingQueue = false
  }

  /**
   * Handle simultaneous bankruptcy scenarios
   */
  async handleSimultaneousBankruptcy(bankruptPlayers, triggeringEvent) {
    console.log('Handling simultaneous bankruptcy', { bankruptPlayers, triggeringEvent })
    
    try {
      // Sort bankruptcies by severity (lowest net worth first)
      const sortedBankruptcies = bankruptPlayers
        .map(player => ({
          player,
          netWorth: this.calculateNetWorth(player),
          liquidAssets: this.calculateLiquidAssets(player)
        }))
        .sort((a, b) => a.netWorth - b.netWorth)

      const results = []

      // Process bankruptcies in order
      for (const bankruptcy of sortedBankruptcies) {
        const result = await this.processSingleBankruptcy(
          bankruptcy.player,
          triggeringEvent,
          {
            isSimultaneous: true,
            remainingBankruptcies: sortedBankruptcies.filter(b => b !== bankruptcy)
          }
        )
        results.push(result)

        // Update game state after each bankruptcy
        this.updateGameStateAfterBankruptcy(result)
      }

      // Check if game should end after simultaneous bankruptcies
      const activePlayers = this.getActivePlayers()
      if (activePlayers.length <= 1) {
        await this.handleGameEndCondition({
          type: 'last-player-standing',
          cause: 'simultaneous-bankruptcy',
          survivors: activePlayers
        })
      }

      return {
        type: 'simultaneous-bankruptcy',
        results,
        gameEnded: activePlayers.length <= 1,
        activePlayers: activePlayers.length
      }

    } catch (error) {
      console.error('Error handling simultaneous bankruptcy:', error)
      return this.handleFallbackScenario('simultaneous-bankruptcy', error)
    }
  }

  /**
   * Handle bankruptcy during game end processing
   */
  async handleBankruptcyDuringGameEnd(player, gameEndContext) {
    console.log('Handling bankruptcy during game end', { player: player.id, gameEndContext })

    try {
      // If game is ending by turn limit or other condition, 
      // don't process full bankruptcy - just mark player as eliminated
      if (gameEndContext.type === 'turn-limit' || gameEndContext.type === 'time-limit') {
        return this.quickEliminatePlayer(player, 'game-end-bankruptcy')
      }

      // If game ending by last player standing, process bankruptcy normally
      // but prevent further game end checks
      const result = await this.processSingleBankruptcy(player, gameEndContext, {
        preventGameEndCheck: true
      })

      return {
        type: 'bankruptcy-during-game-end',
        bankruptcyResult: result,
        gameEndContext
      }

    } catch (error) {
      console.error('Error handling bankruptcy during game end:', error)
      return this.handleFallbackScenario('bankruptcy-during-game-end', error)
    }
  }

  /**
   * Handle circular debt scenarios
   */
  async handleCircularDebt(debtChain) {
    console.log('Handling circular debt scenario', { debtChain })

    try {
      // Calculate total debt in the chain
      const totalDebt = debtChain.reduce((sum, debt) => sum + debt.amount, 0)
      
      // Calculate total available assets from all players in chain
      const playersInChain = [...new Set(debtChain.flatMap(d => [d.debtor, d.creditor]))]
      const totalAssets = playersInChain.reduce((sum, playerId) => {
        const player = this.getPlayerById(playerId)
        return sum + this.calculateLiquidAssets(player)
      }, 0)

      if (totalAssets >= totalDebt) {
        // Assets sufficient - liquidate proportionally
        return await this.resolveCircularDebtWithLiquidation(debtChain, playersInChain)
      } else {
        // Insufficient assets - bankruptcy cascade
        return await this.handleBankruptcyCascade(debtChain, playersInChain)
      }

    } catch (error) {
      console.error('Error handling circular debt:', error)
      return this.handleFallbackScenario('circular-debt', error)
    }
  }

  /**
   * Handle property auction conflicts
   */
  async handlePropertyAuctionConflict(property, conflictingBids) {
    console.log('Handling property auction conflict', { property: property.id, conflictingBids })

    try {
      // Sort bids by amount (highest first)
      const sortedBids = conflictingBids.sort((a, b) => b.amount - a.amount)
      
      // Check if highest bidder can actually pay
      const highestBid = sortedBids[0]
      const bidder = this.getPlayerById(highestBid.playerId)
      
      if (bidder.money >= highestBid.amount) {
        // Award to highest bidder
        return this.awardPropertyToBidder(property, highestBid)
      }

      // Highest bidder cannot pay - move to next bidder
      for (const bid of sortedBids.slice(1)) {
        const bidder = this.getPlayerById(bid.playerId)
        if (bidder.money >= bid.amount) {
          return this.awardPropertyToBidder(property, bid)
        }
      }

      // No bidder can pay - return to bank
      return this.returnPropertyToBank(property, 'no-valid-bidders')

    } catch (error) {
      console.error('Error handling property auction conflict:', error)
      return this.handleFallbackScenario('property-auction-conflict', error)
    }
  }

  /**
   * Handle monopoly breakup edge cases
   */
  async handleMonopolyBreakup(monopolyGroup, transferDetails) {
    console.log('Handling monopoly breakup', { monopolyGroup, transferDetails })

    try {
      const groupProperties = this.properties.filter(p => p.colorGroup === monopolyGroup)
      const affectedPlayers = [...new Set(groupProperties.map(p => p.owner))]

      // Track monopoly status before transfer
      const monopolyStatusBefore = this.checkMonopolyStatus(monopolyGroup)
      
      // Process property transfers
      await this.processPropertyTransfers(transferDetails)

      // Check monopoly status after transfer
      const monopolyStatusAfter = this.checkMonopolyStatus(monopolyGroup)

      // Handle house/hotel distribution if monopoly was broken
      if (monopolyStatusBefore.hasMonopoly && !monopolyStatusAfter.hasMonopoly) {
        await this.handleBrokenMonopolyBuildings(groupProperties)
      }

      // Handle new monopoly formation
      if (!monopolyStatusBefore.hasMonopoly && monopolyStatusAfter.hasMonopoly) {
        await this.handleNewMonopolyFormation(monopolyGroup, monopolyStatusAfter.owner)
      }

      return {
        type: 'monopoly-breakup',
        monopolyGroup,
        statusBefore: monopolyStatusBefore,
        statusAfter: monopolyStatusAfter,
        affectedPlayers
      }

    } catch (error) {
      console.error('Error handling monopoly breakup:', error)
      return this.handleFallbackScenario('monopoly-breakup', error)
    }
  }

  /**
   * Handle rent payment cascade failures
   */
  async handleRentPaymentCascade(initialRentEvent, cascadeChain) {
    console.log('Handling rent payment cascade', { initialRentEvent, cascadeChain })

    try {
      const results = []
      let currentEvent = initialRentEvent

      for (const link of cascadeChain) {
        const player = this.getPlayerById(link.playerId)
        const requiredAmount = link.amount

        if (player.money >= requiredAmount) {
          // Player can pay - break the cascade
          const paymentResult = await this.processPayment(player, link.creditor, requiredAmount)
          results.push({
            playerId: player.id,
            action: 'payment',
            amount: requiredAmount,
            success: true,
            result: paymentResult
          })
          break
        } else {
          // Player cannot pay - continue cascade
          const liquidationResult = await this.attemptAssetLiquidation(player, requiredAmount)
          results.push({
            playerId: player.id,
            action: 'liquidation',
            amount: requiredAmount,
            success: liquidationResult.success,
            result: liquidationResult
          })

          if (!liquidationResult.success) {
            // Liquidation failed - bankruptcy
            const bankruptcyResult = await this.processSingleBankruptcy(player, currentEvent)
            results.push({
              playerId: player.id,
              action: 'bankruptcy',
              result: bankruptcyResult
            })
          }
        }
      }

      return {
        type: 'rent-payment-cascade',
        initialEvent: initialRentEvent,
        results,
        cascadeBroken: results.some(r => r.action === 'payment' && r.success)
      }

    } catch (error) {
      console.error('Error handling rent payment cascade:', error)
      return this.handleFallbackScenario('rent-payment-cascade', error)
    }
  }

  /**
   * Handle invalid game state recovery
   */
  async handleInvalidGameState(invalidState, lastValidState) {
    console.log('Handling invalid game state', { invalidState, lastValidState })

    try {
      // Attempt to validate and repair current state
      const repairAttempt = await this.attemptStateRepair(invalidState)
      
      if (repairAttempt.success) {
        return {
          type: 'state-repair',
          method: 'repair',
          repairedState: repairAttempt.state,
          changes: repairAttempt.changes
        }
      }

      // Repair failed - rollback to last valid state
      if (lastValidState) {
        await this.rollbackToState(lastValidState)
        return {
          type: 'state-rollback',
          method: 'rollback',
          rolledBackTo: lastValidState.timestamp,
          lostActions: this.calculateLostActions(lastValidState, invalidState)
        }
      }

      // No valid state to rollback to - emergency reset
      return await this.emergencyGameReset()

    } catch (error) {
      console.error('Error handling invalid game state:', error)
      return this.handleFallbackScenario('invalid-game-state', error)
    }
  }

  /**
   * Handle timeout scenarios
   */
  async handleTimeoutScenario(operation, timeoutContext) {
    console.log('Handling timeout scenario', { operation, timeoutContext })

    try {
      switch (operation.type) {
        case 'bankruptcy-processing':
          return await this.handleBankruptcyTimeout(operation, timeoutContext)
        
        case 'property-auction':
          return await this.handleAuctionTimeout(operation, timeoutContext)
        
        case 'asset-liquidation':
          return await this.handleLiquidationTimeout(operation, timeoutContext)
        
        default:
          return await this.handleGenericTimeout(operation, timeoutContext)
      }

    } catch (error) {
      console.error('Error handling timeout scenario:', error)
      return this.handleFallbackScenario('timeout', error)
    }
  }

  // Helper methods for complex scenarios
  async processSingleBankruptcy(player, triggeringEvent, options = {}) {
    // Simulate bankruptcy processing
    const assets = this.calculateLiquidAssets(player)
    const netWorth = this.calculateNetWorth(player)
    
    return {
      playerId: player.id,
      assets,
      netWorth,
      triggeringEvent,
      options,
      processed: true
    }
  }

  calculateNetWorth(player) {
    let netWorth = player.money || 0
    const playerProperties = this.properties.filter(p => p.owner === player.id)
    
    playerProperties.forEach(property => {
      netWorth += property.price || 0
      netWorth += (property.houses || 0) * (property.housePrice || 0)
      netWorth += (property.hotels || 0) * (property.hotelPrice || 0)
    })
    
    return netWorth
  }

  calculateLiquidAssets(player) {
    let liquid = player.money || 0
    const playerProperties = this.properties.filter(p => 
      p.owner === player.id && !p.mortgaged
    )
    
    playerProperties.forEach(property => {
      liquid += Math.floor((property.price || 0) * 0.5)
    })
    
    return liquid
  }

  getActivePlayers() {
    return this.players.filter(p => p.active && !p.bankrupt)
  }

  getPlayerById(playerId) {
    return this.players.find(p => p.id === playerId)
  }

  updateGameStateAfterBankruptcy(bankruptcyResult) {
    const player = this.getPlayerById(bankruptcyResult.playerId)
    if (player) {
      player.active = false
      player.bankrupt = true
    }
  }

  async handleGameEndCondition(condition) {
    console.log('Game end condition triggered:', condition)
    // Trigger game end processing
    return { gameEnded: true, condition }
  }

  quickEliminatePlayer(player, reason) {
    player.active = false
    player.bankrupt = true
    return {
      type: 'quick-elimination',
      playerId: player.id,
      reason
    }
  }

  async resolveCircularDebtWithLiquidation(debtChain, playersInChain) {
    // Simulate proportional liquidation
    return {
      type: 'circular-debt-resolution',
      method: 'liquidation',
      debtChain,
      playersInChain,
      resolved: true
    }
  }

  async handleBankruptcyCascade(debtChain, playersInChain) {
    // Simulate bankruptcy cascade
    return {
      type: 'bankruptcy-cascade',
      debtChain,
      playersInChain,
      cascadeComplete: true
    }
  }

  awardPropertyToBidder(property, bid) {
    property.owner = bid.playerId
    const bidder = this.getPlayerById(bid.playerId)
    bidder.money -= bid.amount
    
    return {
      type: 'property-awarded',
      property: property.id,
      winner: bid.playerId,
      amount: bid.amount
    }
  }

  returnPropertyToBank(property, reason) {
    property.owner = null
    return {
      type: 'property-returned-to-bank',
      property: property.id,
      reason
    }
  }

  checkMonopolyStatus(colorGroup) {
    const groupProperties = this.properties.filter(p => p.colorGroup === colorGroup)
    const owners = [...new Set(groupProperties.map(p => p.owner))]
    
    if (owners.length === 1 && owners[0] !== null) {
      return {
        hasMonopoly: true,
        owner: owners[0],
        properties: groupProperties.length
      }
    }
    
    return {
      hasMonopoly: false,
      owner: null,
      properties: groupProperties.length
    }
  }

  async processPropertyTransfers(transferDetails) {
    // Simulate property transfers
    for (const transfer of transferDetails) {
      const property = this.properties.find(p => p.id === transfer.propertyId)
      if (property) {
        property.owner = transfer.newOwner
      }
    }
  }

  async handleBrokenMonopolyBuildings(groupProperties) {
    // Remove buildings when monopoly is broken
    groupProperties.forEach(property => {
      property.houses = 0
      property.hotels = 0
    })
  }

  async handleNewMonopolyFormation(monopolyGroup, owner) {
    console.log(`New monopoly formed: ${monopolyGroup} by player ${owner}`)
  }

  async processPayment(payer, payee, amount) {
    payer.money -= amount
    if (payee && typeof payee === 'object' && payee.id) {
      payee.money += amount
    }
    return { success: true, amount }
  }

  async attemptAssetLiquidation(player, targetAmount) {
    const liquidAssets = this.calculateLiquidAssets(player)
    return {
      success: liquidAssets >= targetAmount,
      amountRaised: Math.min(liquidAssets, targetAmount),
      targetAmount
    }
  }

  calculateLostActions(lastValidState, invalidState) {
    // Calculate what actions were lost during rollback
    return []
  }

  async attemptStateRepair(invalidState) {
    // Attempt to repair invalid state
    return {
      success: false,
      state: null,
      changes: []
    }
  }

  async rollbackToState(lastValidState) {
    // Rollback to previous valid state
    Object.assign(this.gameState, lastValidState.gameState)
    Object.assign(this.players, lastValidState.players)
    Object.assign(this.properties, lastValidState.properties)
  }

  async emergencyGameReset() {
    console.log('Emergency game reset triggered')
    return {
      type: 'emergency-reset',
      reason: 'unrecoverable-state'
    }
  }

  async handleBankruptcyTimeout(operation, timeoutContext) {
    // Force complete bankruptcy with current state
    return {
      type: 'forced-bankruptcy-completion',
      operation,
      timeoutContext
    }
  }

  async handleAuctionTimeout(operation, timeoutContext) {
    // Return property to bank if auction times out
    return {
      type: 'auction-timeout',
      action: 'return-to-bank',
      operation
    }
  }

  async handleLiquidationTimeout(operation, timeoutContext) {
    // Force liquidation with current available assets
    return {
      type: 'forced-liquidation',
      operation,
      timeoutContext
    }
  }

  async handleGenericTimeout(operation, timeoutContext) {
    // Generic timeout handling
    return {
      type: 'generic-timeout',
      action: 'skip-operation',
      operation
    }
  }

  handleFallbackScenario(scenarioType, error) {
    console.error(`Fallback scenario triggered for ${scenarioType}:`, error)
    return {
      type: 'fallback-scenario',
      scenarioType,
      error: error.message,
      timestamp: Date.now()
    }
  }

  // Event queue management
  queueEvent(event) {
    this.eventQueue.push({
      ...event,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    })
  }

  async processEventQueue() {
    if (this.processingQueue) return
    
    this.processingQueue = true
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()
        await this.processQueuedEvent(event)
      }
    } finally {
      this.processingQueue = false
    }
  }

  async processQueuedEvent(event) {
    console.log('Processing queued event:', event)
    // Process the event based on its type
    // This would contain the actual event processing logic
  }

  // Validation methods
  validateGameState() {
    const errors = []
    
    // Check player consistency
    this.players.forEach(player => {
      if (player.money < 0) {
        errors.push(`Player ${player.id} has negative money: ${player.money}`)
      }
    })
    
    // Check property ownership consistency
    this.properties.forEach(property => {
      if (property.owner && !this.getPlayerById(property.owner)) {
        errors.push(`Property ${property.id} owned by non-existent player: ${property.owner}`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  createStateSnapshot() {
    return {
      timestamp: Date.now(),
      gameState: JSON.parse(JSON.stringify(this.gameState)),
      players: JSON.parse(JSON.stringify(this.players)),
      properties: JSON.parse(JSON.stringify(this.properties))
    }
  }
}

export default EdgeCaseHandler