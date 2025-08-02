import { reactive, computed } from 'vue'
import { BOARD_SPACES, PROPERTIES, RAILROADS, UTILITIES, COLOR_GROUPS } from '../data/boardData.js'
import { CardDeckManager } from './CardDeck.js'
import { createCardEffects } from './CardEffects.js'

// Initialize game state with reactive data
export const gameState = reactive({
  // Game control
  gameId: null,
  gamePhase: 'setup', // 'setup', 'playing', 'paused', 'ended'
  turnPhase: 'rolling', // 'rolling', 'moving', 'action', 'trading', 'developing'
  
  // Player management
  players: [],
  currentPlayerIndex: 0,
  playerCount: 0,
  activePlayers: 0,
  
  // Turn tracking
  turnNumber: 0,
  currentPlayerTurn: 0,
  
  // Dice state
  dice: {
    die1: 1,
    die2: 1,
    total: 2,
    isDoubles: false,
    doublesCount: 0,
    lastRoll: null
  },
  
  // Board state - initialize with default values
  board: BOARD_SPACES.map(space => ({
    ...space,
    playersOnSpace: []
  })),
  
  // Property ownership and development
  properties: Object.fromEntries(
    Object.entries(PROPERTIES).map(([id, property]) => [
      id,
      {
        ...property,
        ownerId: null,
        isMortgaged: false,
        houses: 0,
        hasHotel: false,
        currentRent: property.rent[0],
        isPartOfMonopoly: false,
        canDevelop: false
      }
    ])
  ),
  
  // Railroad ownership
  railroads: Object.fromEntries(
    Object.entries(RAILROADS).map(([id, railroad]) => [
      id,
      {
        ...railroad,
        ownerId: null,
        isMortgaged: false,
        currentRent: railroad.rentSchedule[0]
      }
    ])
  ),
  
  // Utility ownership
  utilities: Object.fromEntries(
    Object.entries(UTILITIES).map(([id, utility]) => [
      id,
      {
        ...utility,
        ownerId: null,
        isMortgaged: false,
        rentMultiplier: utility.rentMultipliers[0]
      }
    ])
  ),
  
  // Card system
  cardDeckManager: null,
  cardEffects: null,
  cardHistory: [],
  activeCardDraw: null,
  
  // Game economy
  bank: {
    money: 20580, // Standard bank starting money
    houses: 32,   // Limited supply
    hotels: 12    // Limited supply
  },
  
  // UI state
  selectedProperty: null,
  activeModal: null,
  pendingActions: [],
  
  // Animation state
  animations: {
    playerMoving: false,
    diceRolling: false,
    cardRevealing: false,
    propertyHighlight: null,
    movementInProgress: false,
    currentMovingPlayer: null,
    movementStartSpace: null,
    movementEndSpace: null,
    movementSpaces: 0,
    showTrail: true,
    animationSpeed: 1
  },
  
  // Game history
  history: [],
  winner: null,
  endTime: null,
  
  // Game settings
  settings: {
    housesAvailable: true,
    auctionUnboughtProperties: false,
    freeParking: 'nothing',
    salariesOnGo: 200,
    bankruptcyToBank: true
  }
})

// Game actions and utilities
export const gameActions = {
  // Initialize a new game with enhanced player configuration
  initializeGame(playerConfigs = null) {
    // Default to simple player names if no configs provided
    if (!playerConfigs) {
      playerConfigs = [
        { name: 'Player 1', piece: 'car', color: getPlayerColor(0) },
        { name: 'Player 2', piece: 'dog', color: getPlayerColor(1) }
      ]
    }

    gameState.gameId = 'game_' + Date.now()
    gameState.gamePhase = 'setup'
    gameState.turnPhase = 'rolling'
    gameState.playerCount = playerConfigs.length
    gameState.activePlayers = playerConfigs.length
    gameState.currentPlayerIndex = 0
    gameState.turnNumber = 1
    
    // Initialize players with enhanced configuration
    gameState.players = playerConfigs.map((config, index) => ({
      id: `player_${index}`,
      name: config.name,
      piece: config.piece || 'car',
      color: config.color || getPlayerColor(index),
      money: config.startingMoney || 1500, // Starting money
      position: 0, // Start at GO
      
      // Game status
      isActive: true,
      isBankrupt: false,
      isInJail: false,
      jailTurns: 0,
      salaryCollectedThisTurn: false, // Track salary collection per turn
      
      // Special cards
      getOutOfJailCards: 0,
      
      // Properties owned
      properties: [],
      railroads: [],
      utilities: [],
      
      // Development tracking
      houses: 0,
      hotels: 0,
      
      // Statistics
      stats: {
        turnsPlayed: 0,
        propertiesBought: 0,
        rentCollected: 0,
        rentPaid: 0,
        timesInJail: 0
      }
    }))
    
    // Place all players on GO
    gameState.board[0].playersOnSpace = gameState.players.map(p => p.id)
    
    // Reset all properties to unowned
    Object.values(gameState.properties).forEach(property => {
      property.ownerId = null
      property.isMortgaged = false
      property.houses = 0
      property.hasHotel = false
      property.currentRent = property.rent[0]
      property.isPartOfMonopoly = false
      property.canDevelop = false
    })
    
    // Reset railroads and utilities
    Object.values(gameState.railroads).forEach(railroad => {
      railroad.ownerId = null
      railroad.isMortgaged = false
      railroad.currentRent = railroad.rentSchedule[0]
    })
    
    Object.values(gameState.utilities).forEach(utility => {
      utility.ownerId = null
      utility.isMortgaged = false
      utility.rentMultiplier = utility.rentMultipliers[0]
    })
    
    // Initialize card system
    gameState.cardDeckManager = new CardDeckManager()
    gameState.cardEffects = createCardEffects(gameState, gameActions)
    gameState.cardHistory = []
    gameState.activeCardDraw = null
    
    gameState.gamePhase = 'playing'
  },

  // Setup game with enhanced configuration
  setupGame(gameConfig) {
    const { players, options } = gameConfig
    
    // Apply game options
    if (options) {
      gameState.settings.auctionUnboughtProperties = options.auctionUnbought || false
      gameState.settings.housesAvailable = options.limitedHouses !== false
      gameState.settings.freeParking = options.freeParking || 'nothing'
      gameState.settings.salariesOnGo = options.startingMoney || 200
    }

    // Initialize with player configurations
    this.initializeGame(players.map(p => ({
      name: p.name,
      piece: p.piece,
      color: p.color,
      startingMoney: options?.startingMoney || 1500
    })))
  },

  // Enhanced player action handling
  handlePlayerAction(action) {
    switch (action.type) {
      case 'purchase-property':
        return this.purchaseProperty(action.playerId, action.propertyId)
      
      case 'pay-rent':
        return this.payRent(action.payerId, action.receiverId, action.amount)
      
      case 'pay-tax':
        return this.payTax(action.playerId, action.amount)
      
      case 'draw-card':
        return this.drawCard(action.playerId, action.cardType || action.deckType)
      
      case 'execute-card':
        return this.executeCardEffect(action.card, action.playerId)
      
      case 'keep-jail-card':
        return this.giveJailCardToPlayer(action.playerId, action.card)
      
      case 'use-jail-card':
        return this.useGetOutOfJailCard(action.playerId)
      
      case 'trade-jail-card':
        return this.tradeJailCard(action.fromPlayerId, action.toPlayerId, action.price)
      
      case 'special-action':
        return this.executeSpecialAction(action.playerId, action.specialType)
      
      case 'land-on-space':
        return this.processLanding(action.playerId, action.position)
      
      case 'end-turn':
        return this.endTurn()
      
      default:
        console.warn('Unknown action type:', action.type)
        return false
    }
  },

  // Pay rent between players
  payRent(payerId, receiverId, amount) {
    const payer = gameState.players.find(p => p.id === payerId)
    const receiver = gameState.players.find(p => p.id === receiverId)
    
    if (!payer || !receiver || payer.money < amount) {
      return false
    }
    
    payer.money -= amount
    receiver.money += amount
    
    // Update statistics
    payer.stats.rentPaid += amount
    receiver.stats.rentCollected += amount
    
    return true
  },

  // Pay tax to bank
  payTax(playerId, amount) {
    const player = gameState.players.find(p => p.id === playerId)
    
    if (!player || player.money < amount) {
      return false
    }
    
    player.money -= amount
    gameState.bank.money += amount
    
    return true
  },

  // Draw and execute a card
  async drawCard(playerId, deckType) {
    if (!gameState.cardDeckManager) {
      console.error('Card deck manager not initialized')
      return { success: false, error: 'Card system not initialized' }
    }

    const player = gameState.players.find(p => p.id === playerId)
    if (!player) {
      return { success: false, error: 'Player not found' }
    }

    try {
      // Draw card from specified deck
      const card = gameState.cardDeckManager.drawCard(deckType)
      if (!card) {
        return { success: false, error: 'No cards available in deck' }
      }

      // Add to history
      const historyEntry = {
        card: { ...card },
        playerId,
        deckType,
        timestamp: new Date()
      }
      gameState.cardHistory.push(historyEntry)

      // Set active card draw for UI
      gameState.activeCardDraw = {
        card,
        playerId,
        deckType,
        timestamp: new Date()
      }

      return { success: true, card, deckType }
    } catch (error) {
      console.error('Error drawing card:', error)
      return { success: false, error: error.message }
    }
  },

  // Execute card effect
  async executeCardEffect(card, playerId) {
    if (!gameState.cardEffects) {
      return { success: false, error: 'Card effects system not initialized' }
    }

    try {
      const result = await gameState.cardEffects.executeCardEffect(card, playerId)
      
      // Update history entry with result
      const historyEntry = gameState.cardHistory.find(entry =>
        entry.card.id === card.id && entry.playerId === playerId
      )
      if (historyEntry) {
        historyEntry.result = result
      }

      // Discard card unless it's a jail card
      if (!card.isGetOutOfJail) {
        const deckType = card.id.startsWith('chance_') ? 'chance' : 'communityChest'
        gameState.cardDeckManager.discardCard(card, deckType)
      }

      // Clear active card draw
      gameState.activeCardDraw = null

      return result
    } catch (error) {
      console.error('Error executing card effect:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle "Get Out of Jail Free" card
  giveJailCardToPlayer(playerId, card) {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return false

    player.getOutOfJailCards++
    
    // Clear active card draw
    gameState.activeCardDraw = null
    
    this.addMessage(`${player.name} receives a "Get Out of Jail Free" card`)
    return true
  },

  // Use jail card
  useGetOutOfJailCard(playerId) {
    const player = gameState.players.find(p => p.id === playerId)
    
    if (!player || !player.isInJail || player.getOutOfJailCards <= 0) {
      return { success: false, reason: 'Cannot use jail card' }
    }
    
    player.isInJail = false
    player.jailTurns = 0
    player.getOutOfJailCards--
    
    // Return card to a random deck
    if (gameState.cardDeckManager) {
      const jailCard = {
        id: 'jail_card_return',
        type: 'special',
        action: 'getOutOfJailFree',
        isGetOutOfJail: true
      }
      gameState.cardDeckManager.returnJailCard(jailCard)
    }
    
    this.addMessage(`${player.name} uses "Get Out of Jail Free" card`)
    return { success: true }
  },

  // Trade jail card between players
  tradeJailCard(fromPlayerId, toPlayerId, price = 0) {
    const fromPlayer = gameState.players.find(p => p.id === fromPlayerId)
    const toPlayer = gameState.players.find(p => p.id === toPlayerId)
    
    if (!fromPlayer || !toPlayer || fromPlayer.getOutOfJailCards <= 0) {
      return { success: false, reason: 'Cannot trade jail card' }
    }
    
    if (price > 0 && toPlayer.money < price) {
      return { success: false, reason: 'Insufficient funds for trade' }
    }
    
    // Execute trade
    fromPlayer.getOutOfJailCards--
    toPlayer.getOutOfJailCards++
    
    if (price > 0) {
      fromPlayer.money += price
      toPlayer.money -= price
    }
    
    this.addMessage(`${toPlayer.name} acquired jail card from ${fromPlayer.name}${price > 0 ? ` for $${price}` : ''}`)
    return { success: true }
  },

  // Handle insufficient funds
  handleInsufficientFunds(playerId, amount) {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return false

    this.addMessage(`${player.name} has insufficient funds to pay $${amount}`)
    
    // Set game phase to handle bankruptcy/asset liquidation
    gameState.turnPhase = 'liquidation'
    gameState.pendingActions.push({
      type: 'insufficient_funds',
      playerId,
      amount,
      timestamp: new Date()
    })
    
    return true
  },

  // Add message to game history
  addMessage(message) {
    gameState.history.push({
      message,
      timestamp: new Date(),
      type: 'game_event'
    })
    console.log(`Game Event: ${message}`)
  },

  // Transfer money between entities (players, bank)
  transferMoney(fromEntity, toEntity, amount) {
    if (amount <= 0) return false

    let fromPlayer = null
    let toPlayer = null

    // Get from entity
    if (fromEntity === 'bank') {
      if (gameState.bank.money < amount) return false
    } else {
      fromPlayer = gameState.players.find(p => p.id === fromEntity)
      if (!fromPlayer || fromPlayer.money < amount) return false
    }

    // Get to entity
    if (toEntity !== 'bank') {
      toPlayer = gameState.players.find(p => p.id === toEntity)
      if (!toPlayer) return false
    }

    // Execute transfer
    if (fromEntity === 'bank') {
      gameState.bank.money -= amount
    } else {
      fromPlayer.money -= amount
    }

    if (toEntity === 'bank') {
      gameState.bank.money += amount
    } else {
      toPlayer.money += amount
    }

    return true
  },

  // Process landing on a space (used by card effects)
  processLanding(playerId, position) {
    const space = gameState.board[position]
    if (!space) return

    const spaceAction = this.getSpaceAction(space)
    if (spaceAction) {
      // Handle the space action
      switch (spaceAction.action) {
        case 'landOnProperty':
          this.handlePropertyLanding(playerId, space)
          break
        case 'landOnRailroad':
          this.handleRailroadLanding(playerId, space)
          break
        case 'landOnUtility':
          this.handleUtilityLanding(playerId, space)
          break
        case 'payTax':
          this.payTax(playerId, space.taxAmount)
          break
        case 'drawCard':
          this.drawCard(playerId, space.cardType)
          break
      }
    }
  },

  // Handle landing on property
  handlePropertyLanding(playerId, space) {
    const property = gameState.properties[space.id]
    if (!property) return

    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return

    if (!property.ownerId) {
      // Property is unowned - offer to buy
      this.addMessage(`${player.name} can purchase ${property.name} for $${property.price}`)
    } else if (property.ownerId !== playerId && !property.isMortgaged) {
      // Pay rent
      const rent = property.currentRent
      const owner = gameState.players.find(p => p.id === property.ownerId)
      
      if (owner && rent > 0) {
        if (this.transferMoney(playerId, property.ownerId, rent)) {
          player.stats.rentPaid += rent
          owner.stats.rentCollected += rent
          this.addMessage(`${player.name} pays $${rent} rent to ${owner.name}`)
        } else {
          this.handleInsufficientFunds(playerId, rent)
        }
      }
    }
  },

  // Handle landing on railroad
  handleRailroadLanding(playerId, space) {
    const railroad = gameState.railroads[space.id]
    if (!railroad) return

    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return

    if (!railroad.ownerId) {
      this.addMessage(`${player.name} can purchase ${railroad.name} for $${railroad.price}`)
    } else if (railroad.ownerId !== playerId && !railroad.isMortgaged) {
      const rent = railroad.currentRent
      const owner = gameState.players.find(p => p.id === railroad.ownerId)
      
      if (owner && rent > 0) {
        if (this.transferMoney(playerId, railroad.ownerId, rent)) {
          player.stats.rentPaid += rent
          owner.stats.rentCollected += rent
          this.addMessage(`${player.name} pays $${rent} rent to ${owner.name}`)
        } else {
          this.handleInsufficientFunds(playerId, rent)
        }
      }
    }
  },

  // Handle landing on utility
  handleUtilityLanding(playerId, space) {
    const utility = gameState.utilities[space.id]
    if (!utility) return

    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return

    if (!utility.ownerId) {
      this.addMessage(`${player.name} can purchase ${utility.name} for $${utility.price}`)
    } else if (utility.ownerId !== playerId && !utility.isMortgaged) {
      const diceTotal = gameState.dice.total
      const rent = diceTotal * utility.rentMultiplier
      const owner = gameState.players.find(p => p.id === utility.ownerId)
      
      if (owner && rent > 0) {
        if (this.transferMoney(playerId, utility.ownerId, rent)) {
          player.stats.rentPaid += rent
          owner.stats.rentCollected += rent
          this.addMessage(`${player.name} pays $${rent} rent to ${owner.name} (${utility.rentMultiplier}× dice roll)`)
        } else {
          this.handleInsufficientFunds(playerId, rent)
        }
      }
    }
  },

  // Execute special space actions
  executeSpecialAction(playerId, specialType) {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return false

    switch (specialType) {
      case 'go':
        // GO space action - only manual salary collection, not automatic
        console.log('[GameState] GO space landed on, no automatic action')
        return true
      
      case 'goToJail':
        this.sendToJail(playerId)
        return true
      
      case 'jail':
        // Just visiting, no action needed
        return true
      
      default:
        return false
    }
  },

  // Pay jail fine
  payJailFine(playerId) {
    const player = gameState.players.find(p => p.id === playerId)
    
    if (!player || !player.isInJail || player.money < 50) {
      return false
    }
    
    player.money -= 50
    player.isInJail = false
    player.jailTurns = 0
    gameState.bank.money += 50
    
    return true
  },

  // Use get out of jail card
  useJailCard(playerId) {
    const player = gameState.players.find(p => p.id === playerId)
    
    if (!player || !player.isInJail || player.getOutOfJailCards <= 0) {
      return false
    }
    
    player.isInJail = false
    player.jailTurns = 0
    player.getOutOfJailCards--
    
    return true
  },

  // Set turn phase
  setTurnPhase(phase) {
    gameState.turnPhase = phase
  },

  // Enhanced turn validation
  canPlayerRollDice(playerId = null) {
    const player = playerId ?
      gameState.players.find(p => p.id === playerId) :
      gameState.players[gameState.currentPlayerIndex]
    
    return gameState.gamePhase === 'playing' &&
           gameState.turnPhase === 'rolling' &&
           player && player.isActive && !player.isBankrupt &&
           !gameState.animations.diceRolling
  },

  canPlayerEndTurn(playerId = null) {
    const player = playerId ?
      gameState.players.find(p => p.id === playerId) :
      gameState.players[gameState.currentPlayerIndex]
    
    return gameState.gamePhase === 'playing' &&
           gameState.turnPhase === 'action' &&
           player && player.isActive && !player.isBankrupt &&
           !gameState.dice.isDoubles
  },
  
  // Enhanced roll dice with animation support
  async rollDice() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer) return false

    // Set animation state
    gameState.animations.diceRolling = true
    
    // Generate dice values
    gameState.dice.die1 = Math.floor(Math.random() * 6) + 1
    gameState.dice.die2 = Math.floor(Math.random() * 6) + 1
    gameState.dice.total = gameState.dice.die1 + gameState.dice.die2
    gameState.dice.isDoubles = gameState.dice.die1 === gameState.dice.die2
    gameState.dice.lastRoll = new Date()
    
    // Handle doubles counting
    if (gameState.dice.isDoubles) {
      gameState.dice.doublesCount++
    } else {
      gameState.dice.doublesCount = 0
    }
    
    // Check for three doubles (go to jail)
    if (gameState.dice.doublesCount >= 3) {
      setTimeout(() => {
        this.sendToJailWithAnimation(currentPlayer.id, 'threeDoubles')
        gameState.dice.doublesCount = 0
        gameState.animations.diceRolling = false
        gameState.turnPhase = 'action'
      }, 1000) // Wait for dice animation
      return { movePlayer: false, specialAction: 'threeDoubles' }
    }
    
    // For jail handling
    if (currentPlayer.isInJail) {
      if (gameState.dice.isDoubles) {
        // Doubles gets you out of jail
        currentPlayer.isInJail = false
        currentPlayer.jailTurns = 0
        gameState.turnPhase = 'moving'
        return { movePlayer: true, specialAction: 'freedFromJail' }
      } else {
        // Reduce jail turns, don't move
        currentPlayer.jailTurns--
        if (currentPlayer.jailTurns <= 0) {
          currentPlayer.isInJail = false
        }
        gameState.turnPhase = 'action'
        return { movePlayer: false, specialAction: 'stayInJail' }
      }
    }
    
    gameState.turnPhase = 'moving'
    return { movePlayer: true, specialAction: null }
  },
  
  // Enhanced move player with animation support
  async movePlayerWithAnimation(playerId, spaces) {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return { success: false, reason: 'Player not found' }

    console.log('[GameState] movePlayerWithAnimation called:', { playerId, spaces, currentPosition: player.position })

    // Validate movement
    if (gameState.animations.movementInProgress) {
      return { success: false, reason: 'Movement already in progress' }
    }

    if (spaces <= 0 || spaces > 40) {
      return { success: false, reason: 'Invalid number of spaces' }
    }

    // Set animation state
    gameState.animations.movementInProgress = true
    gameState.animations.currentMovingPlayer = playerId
    gameState.animations.movementStartSpace = player.position
    gameState.animations.movementSpaces = spaces
    
    const startPosition = player.position
    const newPosition = (player.position + spaces) % 40
    gameState.animations.movementEndSpace = newPosition
    
    console.log('[GameState] Calculated positions:', { startPosition, newPosition, spaces })
    
    // Check if player will pass GO (but not land exactly on GO from start)
    const passedGO = (startPosition + spaces) > 39 && newPosition !== 0
    
    // Remove player from current space
    const currentSpace = gameState.board[player.position]
    if (currentSpace) {
      currentSpace.playersOnSpace = currentSpace.playersOnSpace.filter(id => id !== playerId)
    }
    
    // Handle passing GO (not landing on GO)
    if (passedGO) {
      console.log('[GameState] Player passed GO, collecting salary')
      this.collectSalary(playerId)
    }
    
    // Update player position IMMEDIATELY
    player.position = newPosition
    console.log('[GameState] Updated player position to:', newPosition)
    
    // Add player to new space
    const newSpace = gameState.board[newPosition]
    if (newSpace) {
      newSpace.playersOnSpace.push(playerId)
    }
    
    console.log('[GameState] Player landed on space:', { spaceId: newPosition, spaceName: newSpace?.name, spaceType: newSpace?.type })
    
    // Return movement result for animation system
    return {
      success: true,
      playerId,
      startPosition,
      endPosition: newPosition,
      spacesMoving: spaces,
      passedGO,
      landedSpace: newSpace
    }
  },

  // Get action for a specific space
  getSpaceAction(space) {
    switch (space.type) {
      case 'special':
        return {
          type: 'special',
          action: space.specialType,
          data: space
        }
      case 'property':
        return {
          type: 'property',
          action: 'landOnProperty',
          data: space
        }
      case 'railroad':
        return {
          type: 'railroad',
          action: 'landOnRailroad',
          data: space
        }
      case 'utility':
        return {
          type: 'utility',
          action: 'landOnUtility',
          data: space
        }
      case 'tax':
        return {
          type: 'tax',
          action: 'payTax',
          data: space
        }
      case 'card':
        return {
          type: 'card',
          action: 'drawCard',
          data: space
        }
      default:
        return null
    }
  },

  // Execute space actions after landing
  async executeSpaceActions(playerId, position, spaceActions) {
    const player = gameState.players.find(p => p.id === playerId)
    const space = gameState.board[position]
    
    if (!player || !space) return

    // Process each space action
    for (const spaceAction of spaceActions) {
      switch (spaceAction.action) {
        case 'landOnProperty':
          this.handlePropertyLanding(playerId, space)
          break
          
        case 'landOnRailroad':
          this.handleRailroadLanding(playerId, space)
          break
          
        case 'landOnUtility':
          this.handleUtilityLanding(playerId, space)
          break
          
        case 'payTax':
          const taxAmount = space.taxAmount || space.amount || 0
          if (taxAmount > 0) {
            if (this.transferMoney(playerId, 'bank', taxAmount)) {
              this.addMessage(`${player.name} pays $${taxAmount} in taxes`)
            } else {
              this.handleInsufficientFunds(playerId, taxAmount)
            }
          }
          break
          
        case 'drawCard':
          // Automatically draw card when landing on card spaces
          const deckType = space.cardType || (space.name?.toLowerCase().includes('chance') ? 'chance' : 'communityChest')
          this.addMessage(`${player.name} draws a ${deckType === 'chance' ? 'Chance' : 'Community Chest'} card`)
          
          // Draw the card
          const drawResult = await this.drawCard(playerId, deckType)
          if (drawResult.success) {
            // Auto-execute the card effect after a brief delay for UI
            setTimeout(async () => {
              if (gameState.activeCardDraw) {
                await this.executeCardEffect(gameState.activeCardDraw.card, playerId)
              }
            }, 2000) // 2 second delay to show the card
          }
          break
          
        default:
          // Handle special actions
          if (spaceAction.type === 'special') {
            this.executeSpecialAction(playerId, spaceAction.action)
          }
          break
      }
    }
  },

  // Complete movement animation
  completeMovementAnimation(playerId) {
    gameState.animations.movementInProgress = false
    gameState.animations.currentMovingPlayer = null
    gameState.animations.movementStartSpace = null
    gameState.animations.movementEndSpace = null
    gameState.animations.movementSpaces = 0
    gameState.turnPhase = 'action'
  },
  
  // Collect salary when passing GO
  collectSalary(playerId) {
    const player = gameState.players.find(p => p.id === playerId)
    if (player) {
      // Check if player has already collected salary this turn
      if (player.salaryCollectedThisTurn) {
        console.log('[GameState] Salary already collected this turn')
        return false
      }
      
      const salary = 200 // Fixed salary amount
      player.money += salary
      player.salaryCollectedThisTurn = true
      console.log('[GameState] Collected salary:', { playerId, amount: salary, newBalance: player.money })
      return true
    }
    return false
  },
  
  // Send player to jail with animation
  async sendToJailWithAnimation(playerId, reason = 'general') {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return

    // Set animation state for special movement
    gameState.animations.movementInProgress = true
    gameState.animations.currentMovingPlayer = playerId
    gameState.animations.movementStartSpace = player.position
    gameState.animations.movementEndSpace = 10 // Jail position
    
    // Remove from current space
    const currentSpace = gameState.board[player.position]
    currentSpace.playersOnSpace = currentSpace.playersOnSpace.filter(id => id !== playerId)
    
    // Move to jail
    player.position = 10
    player.isInJail = true
    player.jailTurns = 3
    player.stats.timesInJail++
    
    // Add to jail space
    gameState.board[10].playersOnSpace.push(playerId)
    
    // Add jail entry to history with reason
    const reasons = {
      'threeDoubles': 'three consecutive doubles',
      'goToJailSpace': 'landing on Go to Jail space',
      'card': 'drawing a Go to Jail card',
      'general': 'going to jail'
    }
    
    this.addMessage(`${player.name} goes to jail (${reasons[reason]})`)
    
    return {
      success: true,
      playerId,
      actionType: 'goToJail',
      reason,
      startPosition: gameState.animations.movementStartSpace,
      endPosition: 10
    }
  },

  // Send player to jail (immediate, no animation)
  sendToJail(playerId, reason = 'general') {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return
    
    // Remove from current space
    const currentSpace = gameState.board[player.position]
    currentSpace.playersOnSpace = currentSpace.playersOnSpace.filter(id => id !== playerId)
    
    // Move to jail
    player.position = 10
    player.isInJail = true
    player.jailTurns = 3
    player.stats.timesInJail++
    
    // Add to jail space
    gameState.board[10].playersOnSpace.push(playerId)
    
    // Add jail entry to history with reason
    const reasons = {
      'threeDoubles': 'three consecutive doubles',
      'goToJailSpace': 'landing on Go to Jail space',
      'card': 'drawing a Go to Jail card',
      'general': 'going to jail'
    }
    
    this.addMessage(`${player.name} goes to jail (${reasons[reason]})`)
  },
  
  // Purchase property
  purchaseProperty(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId] || 
                    gameState.railroads[propertyId] || 
                    gameState.utilities[propertyId]
    
    if (!player || !property || property.ownerId || player.money < property.price) {
      return false
    }
    
    // Transfer ownership
    player.money -= property.price
    property.ownerId = playerId
    
    // Add to player's portfolio
    if (gameState.properties[propertyId]) {
      player.properties.push(propertyId)
      this.updateMonopolyStatus()
    } else if (gameState.railroads[propertyId]) {
      player.railroads.push(propertyId)
      this.updateRailroadRents(playerId)
    } else if (gameState.utilities[propertyId]) {
      player.utilities.push(propertyId)
      this.updateUtilityRents(playerId)
    }
    
    player.stats.propertiesBought++
    return true
  },
  
  // Update monopoly status for all color groups
  updateMonopolyStatus() {
    Object.entries(COLOR_GROUPS).forEach(([colorGroup, groupData]) => {
      const properties = groupData.properties.map(id => gameState.properties[id])
      const owners = [...new Set(properties.map(p => p.ownerId).filter(id => id))]
      
      if (owners.length === 1) {
        // One player owns all properties in this group
        const ownerId = owners[0]
        properties.forEach(property => {
          property.isPartOfMonopoly = true
          property.canDevelop = true
          // Double rent for undeveloped monopoly properties
          if (property.houses === 0 && !property.hasHotel) {
            property.currentRent = property.rent[0] * 2
          }
        })
      } else {
        // No monopoly
        properties.forEach(property => {
          property.isPartOfMonopoly = false
          property.canDevelop = false
          if (property.houses === 0 && !property.hasHotel) {
            property.currentRent = property.rent[0]
          }
        })
      }
    })
  },
  
  // Update railroad rents based on ownership
  updateRailroadRents(ownerId) {
    const ownedRailroads = Object.values(gameState.railroads).filter(r => r.ownerId === ownerId)
    const count = ownedRailroads.length
    
    ownedRailroads.forEach(railroad => {
      railroad.currentRent = railroad.rentSchedule[count - 1]
    })
  },
  
  // Update utility rents based on ownership
  updateUtilityRents(ownerId) {
    const ownedUtilities = Object.values(gameState.utilities).filter(u => u.ownerId === ownerId)
    const count = ownedUtilities.length
    
    ownedUtilities.forEach(utility => {
      utility.rentMultiplier = utility.rentMultipliers[count - 1]
    })
  },
  
  // Enhanced turn management
  startPlayerTurn() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    
    // Handle jail status
    if (currentPlayer.isInJail) {
      currentPlayer.jailTurns--
      if (currentPlayer.jailTurns <= 0) {
        currentPlayer.isInJail = false
        currentPlayer.jailTurns = 0
      }
    }
    
    gameState.turnPhase = 'rolling'
  },

  // End current player's turn with enhanced logic
  endTurn() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer) {
      currentPlayer.stats.turnsPlayed++
      // Reset salary collection flag for this player
      currentPlayer.salaryCollectedThisTurn = false
    }
    
    // Check if player gets another turn (doubles)
    if (gameState.dice.isDoubles && !currentPlayer.isInJail && gameState.dice.doublesCount < 3) {
      // Player gets another turn
      gameState.turnPhase = 'rolling'
      console.log('[GameState] Player gets another turn due to doubles')
      return
    }
    
    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.playerCount
    gameState.dice.doublesCount = 0
    gameState.dice.isDoubles = false
    
    // Skip bankrupt players
    let attempts = 0
    while (gameState.players[gameState.currentPlayerIndex].isBankrupt && attempts < gameState.playerCount) {
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.playerCount
      attempts++
    }
    
    // Reset dice animation and movement states
    gameState.animations.diceRolling = false
    gameState.animations.movementInProgress = false
    gameState.animations.currentMovingPlayer = null
    
    gameState.turnPhase = 'rolling'
    gameState.turnNumber++
    
    console.log('[GameState] Turn ended, next player:', gameState.players[gameState.currentPlayerIndex]?.name)
    
    // Check for game end condition
    this.checkGameEnd()
  },

  // Phase transition management
  advanceToNextPhase() {
    switch (gameState.turnPhase) {
      case 'rolling':
        gameState.turnPhase = 'moving'
        break
      case 'moving':
        gameState.turnPhase = 'action'
        break
      case 'action':
        // Can transition to trading or developing, or end turn
        break
      case 'trading':
        gameState.turnPhase = 'action'
        break
      case 'developing':
        gameState.turnPhase = 'action'
        break
    }
  },

  // Validate phase transitions
  canTransitionToPhase(targetPhase) {
    const currentPhase = gameState.turnPhase
    const validTransitions = {
      'rolling': ['moving'],
      'moving': ['action'],
      'action': ['trading', 'developing', 'rolling'], // rolling = end turn
      'trading': ['action'],
      'developing': ['action']
    }
    
    return validTransitions[currentPhase]?.includes(targetPhase) || false
  },

  // Check game end conditions
  checkGameEnd() {
    const activePlayers = gameState.players.filter(p => p.isActive && !p.isBankrupt)
    
    if (activePlayers.length <= 1) {
      gameState.gamePhase = 'ended'
      gameState.winner = activePlayers[0]?.id || null
      gameState.endTime = new Date()
    }
  },

  // Enhanced validation methods
  validatePlayerAction(playerId, actionType) {
    const player = gameState.players.find(p => p.id === playerId)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    
    // Basic validation
    if (!player || player.isBankrupt || !player.isActive) {
      return { valid: false, reason: 'Player is not active or bankrupt' }
    }
    
    // Check if it's the player's turn for turn-based actions
    const turnBasedActions = ['roll-dice', 'end-turn', 'purchase-property', 'pay-rent', 'pay-tax']
    if (turnBasedActions.includes(actionType) && player.id !== currentPlayer.id) {
      return { valid: false, reason: 'Not player\'s turn' }
    }
    
    // Phase-specific validation
    switch (actionType) {
      case 'roll-dice':
        if (gameState.turnPhase !== 'rolling') {
          return { valid: false, reason: 'Not in rolling phase' }
        }
        if (gameState.animations.diceRolling) {
          return { valid: false, reason: 'Dice already rolling' }
        }
        break
        
      case 'end-turn':
        if (gameState.turnPhase !== 'action') {
          return { valid: false, reason: 'Cannot end turn in current phase' }
        }
        break
        
      case 'purchase-property':
        if (gameState.turnPhase !== 'action') {
          return { valid: false, reason: 'Can only purchase properties during action phase' }
        }
        break
    }
    
    return { valid: true }
  },

  // Enhanced property purchase with validation
  purchasePropertyEnhanced(playerId, propertyId) {
    const validation = this.validatePlayerAction(playerId, 'purchase-property')
    if (!validation.valid) {
      console.warn('Purchase validation failed:', validation.reason)
      return false
    }
    
    return this.purchaseProperty(playerId, propertyId)
  },

  // === ENHANCED PROPERTY TRANSACTION SYSTEM ===
  
  // Enhanced property validation
  validatePropertyPurchase(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId] ||
                    gameState.railroads[propertyId] ||
                    gameState.utilities[propertyId]
    
    if (!player) return { valid: false, reason: 'Player not found' }
    if (!property) return { valid: false, reason: 'Property not found' }
    if (property.ownerId) return { valid: false, reason: 'Property already owned' }
    if (player.money < property.price) return { valid: false, reason: 'Insufficient funds' }
    if (player.isBankrupt || !player.isActive) return { valid: false, reason: 'Player not active' }
    
    return { valid: true }
  },

  // Sell property back to bank (50% value)
  sellPropertyToBank(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId] ||
                    gameState.railroads[propertyId] ||
                    gameState.utilities[propertyId]
    
    if (!player || !property || property.ownerId !== playerId) {
      return { success: false, reason: 'Invalid sale request' }
    }
    
    // Can't sell developed properties
    if (property.houses > 0 || property.hasHotel) {
      return { success: false, reason: 'Must sell houses/hotels first' }
    }
    
    const salePrice = Math.floor(property.price / 2)
    
    // Remove from player's portfolio
    if (gameState.properties[propertyId]) {
      player.properties = player.properties.filter(id => id !== propertyId)
    } else if (gameState.railroads[propertyId]) {
      player.railroads = player.railroads.filter(id => id !== propertyId)
    } else if (gameState.utilities[propertyId]) {
      player.utilities = player.utilities.filter(id => id !== propertyId)
    }
    
    // Transfer money and ownership
    player.money += salePrice
    property.ownerId = null
    property.isMortgaged = false
    
    // Update monopoly status and rents
    this.updateMonopolyStatus()
    this.updateRailroadRents(playerId)
    this.updateUtilityRents(playerId)
    
    return { success: true, salePrice }
  },

  // Mortgage property
  mortgageProperty(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId] ||
                    gameState.railroads[propertyId] ||
                    gameState.utilities[propertyId]
    
    if (!player || !property || property.ownerId !== playerId || property.isMortgaged) {
      return { success: false, reason: 'Cannot mortgage this property' }
    }
    
    // Can't mortgage developed properties
    if (property.houses > 0 || property.hasHotel) {
      return { success: false, reason: 'Must sell houses/hotels first' }
    }
    
    const mortgageValue = property.mortgageValue || Math.floor(property.price / 2)
    
    property.isMortgaged = true
    player.money += mortgageValue
    
    return { success: true, amount: mortgageValue }
  },

  // Unmortgage property
  unmortgageProperty(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId] ||
                    gameState.railroads[propertyId] ||
                    gameState.utilities[propertyId]
    
    if (!player || !property || property.ownerId !== playerId || !property.isMortgaged) {
      return { success: false, reason: 'Cannot unmortgage this property' }
    }
    
    const mortgageValue = property.mortgageValue || Math.floor(property.price / 2)
    const unmortgageCost = Math.floor(mortgageValue * 1.1) // 10% interest
    
    if (player.money < unmortgageCost) {
      return { success: false, reason: 'Insufficient funds' }
    }
    
    property.isMortgaged = false
    player.money -= unmortgageCost
    
    return { success: true, cost: unmortgageCost }
  },

  // Build houses on property
  buildHouses(playerId, propertyId, houseCount) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId]
    
    if (!player || !property || property.ownerId !== playerId || !property.canDevelop) {
      return { success: false, reason: 'Cannot develop this property' }
    }
    
    if (property.isMortgaged) {
      return { success: false, reason: 'Cannot develop mortgaged property' }
    }
    
    if (property.hasHotel) {
      return { success: false, reason: 'Property already has hotel' }
    }
    
    const maxHouses = 4 - property.houses
    const buildCount = Math.min(houseCount, maxHouses, gameState.bank.houses)
    
    if (buildCount <= 0) {
      return { success: false, reason: 'No houses available to build' }
    }
    
    const totalCost = buildCount * property.houseCost
    
    if (player.money < totalCost) {
      return { success: false, reason: 'Insufficient funds' }
    }
    
    // Build houses
    property.houses += buildCount
    player.money -= totalCost
    player.houses += buildCount
    gameState.bank.houses -= buildCount
    
    // Update rent
    property.currentRent = property.rent[property.houses]
    
    return { success: true, housesBuilt: buildCount, cost: totalCost }
  },

  // Build hotel on property
  buildHotel(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId]
    
    if (!player || !property || property.ownerId !== playerId || !property.canDevelop) {
      return { success: false, reason: 'Cannot develop this property' }
    }
    
    if (property.isMortgaged || property.hasHotel || property.houses !== 4) {
      return { success: false, reason: 'Cannot build hotel on this property' }
    }
    
    if (gameState.bank.hotels <= 0) {
      return { success: false, reason: 'No hotels available' }
    }
    
    const hotelCost = property.houseCost // Same cost as house
    
    if (player.money < hotelCost) {
      return { success: false, reason: 'Insufficient funds' }
    }
    
    // Build hotel (return houses to bank)
    property.hasHotel = true
    property.houses = 0
    player.money -= hotelCost
    player.hotels += 1
    player.houses -= 4 // Remove 4 houses
    gameState.bank.hotels -= 1
    gameState.bank.houses += 4 // Return houses to bank
    
    // Update rent
    property.currentRent = property.rent[5] // Hotel rent
    
    return { success: true, cost: hotelCost }
  },

  // Sell houses from property
  sellHouses(playerId, propertyId, houseCount) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId]
    
    if (!player || !property || property.ownerId !== playerId) {
      return { success: false, reason: 'Cannot sell houses from this property' }
    }
    
    const sellCount = Math.min(houseCount, property.houses)
    
    if (sellCount <= 0) {
      return { success: false, reason: 'No houses to sell' }
    }
    
    const sellPrice = Math.floor(property.houseCost / 2) * sellCount
    
    property.houses -= sellCount
    player.money += sellPrice
    player.houses -= sellCount
    gameState.bank.houses += sellCount
    
    // Update rent
    property.currentRent = property.houses > 0 ? property.rent[property.houses] :
                          property.isPartOfMonopoly ? property.rent[0] * 2 : property.rent[0]
    
    return { success: true, housesSold: sellCount, amount: sellPrice }
  },

  // Sell hotel from property
  sellHotel(playerId, propertyId) {
    const player = gameState.players.find(p => p.id === playerId)
    const property = gameState.properties[propertyId]
    
    if (!player || !property || property.ownerId !== playerId || !property.hasHotel) {
      return { success: false, reason: 'Cannot sell hotel from this property' }
    }
    
    // Check if we can return houses (need 4 houses available)
    if (gameState.bank.houses < 4) {
      return { success: false, reason: 'Not enough houses in bank to replace hotel' }
    }
    
    const sellPrice = Math.floor(property.houseCost / 2)
    
    property.hasHotel = false
    property.houses = 4 // Replace with 4 houses
    player.money += sellPrice
    player.hotels -= 1
    player.houses += 4
    gameState.bank.hotels += 1
    gameState.bank.houses -= 4
    
    // Update rent
    property.currentRent = property.rent[4]
    
    return { success: true, amount: sellPrice }
  },

  // Property trading between players
  proposePropertyTrade(fromPlayerId, toPlayerId, offer) {
    const fromPlayer = gameState.players.find(p => p.id === fromPlayerId)
    const toPlayer = gameState.players.find(p => p.id === toPlayerId)
    
    if (!fromPlayer || !toPlayer || fromPlayer.id === toPlayer.id) {
      return { success: false, reason: 'Invalid players' }
    }
    
    // Validate offer structure: { properties: [], railroads: [], utilities: [], money: 0 }
    if (!offer || typeof offer !== 'object') {
      return { success: false, reason: 'Invalid offer structure' }
    }
    
    // Validate offered properties belong to player
    const offeredProperties = offer.properties || []
    const offeredRailroads = offer.railroads || []
    const offeredUtilities = offer.utilities || []
    const offeredMoney = offer.money || 0
    
    for (const propId of offeredProperties) {
      if (!fromPlayer.properties.includes(propId)) {
        return { success: false, reason: 'Player does not own offered property' }
      }
    }
    
    for (const railId of offeredRailroads) {
      if (!fromPlayer.railroads.includes(railId)) {
        return { success: false, reason: 'Player does not own offered railroad' }
      }
    }
    
    for (const utilId of offeredUtilities) {
      if (!fromPlayer.utilities.includes(utilId)) {
        return { success: false, reason: 'Player does not own offered utility' }
      }
    }
    
    if (offeredMoney > 0 && fromPlayer.money < offeredMoney) {
      return { success: false, reason: 'Insufficient funds for trade' }
    }
    
    // Create trade proposal
    const tradeId = 'trade_' + Date.now()
    const trade = {
      id: tradeId,
      fromPlayer: fromPlayerId,
      toPlayer: toPlayerId,
      offer,
      status: 'pending',
      timestamp: new Date()
    }
    
    gameState.pendingActions.push(trade)
    
    return { success: true, tradeId }
  },

  // Accept or reject trade
  respondToTrade(tradeId, accept, counterOffer = null) {
    const tradeIndex = gameState.pendingActions.findIndex(t => t.id === tradeId)
    
    if (tradeIndex === -1) {
      return { success: false, reason: 'Trade not found' }
    }
    
    const trade = gameState.pendingActions[tradeIndex]
    
    if (accept) {
      // Execute the trade
      const result = this.executeTrade(trade)
      if (result.success) {
        gameState.pendingActions.splice(tradeIndex, 1)
      }
      return result
    } else {
      if (counterOffer) {
        // Create counter offer
        trade.counterOffer = counterOffer
        trade.status = 'counter'
        return { success: true, message: 'Counter offer made' }
      } else {
        // Reject trade
        gameState.pendingActions.splice(tradeIndex, 1)
        return { success: true, message: 'Trade rejected' }
      }
    }
  },

  // Execute completed trade
  executeTrade(trade) {
    const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayer)
    const toPlayer = gameState.players.find(p => p.id === trade.toPlayer)
    
    if (!fromPlayer || !toPlayer) {
      return { success: false, reason: 'Players not found' }
    }
    
    const offer = trade.offer
    
    // Transfer properties
    for (const propId of offer.properties || []) {
      const property = gameState.properties[propId]
      if (property && property.ownerId === fromPlayer.id) {
        property.ownerId = toPlayer.id
        fromPlayer.properties = fromPlayer.properties.filter(id => id !== propId)
        toPlayer.properties.push(propId)
      }
    }
    
    // Transfer railroads
    for (const railId of offer.railroads || []) {
      const railroad = gameState.railroads[railId]
      if (railroad && railroad.ownerId === fromPlayer.id) {
        railroad.ownerId = toPlayer.id
        fromPlayer.railroads = fromPlayer.railroads.filter(id => id !== railId)
        toPlayer.railroads.push(railId)
      }
    }
    
    // Transfer utilities
    for (const utilId of offer.utilities || []) {
      const utility = gameState.utilities[utilId]
      if (utility && utility.ownerId === fromPlayer.id) {
        utility.ownerId = toPlayer.id
        fromPlayer.utilities = fromPlayer.utilities.filter(id => id !== utilId)
        toPlayer.utilities.push(utilId)
      }
    }
    
    // Transfer money
    if (offer.money > 0) {
      fromPlayer.money -= offer.money
      toPlayer.money += offer.money
    }
    
    // Update monopoly status and rents
    this.updateMonopolyStatus()
    this.updateRailroadRents(fromPlayer.id)
    this.updateRailroadRents(toPlayer.id)
    this.updateUtilityRents(fromPlayer.id)
    this.updateUtilityRents(toPlayer.id)
    
    return { success: true }
  },

  // Start property auction
  startPropertyAuction(propertyId, startingBid = 10) {
    const property = gameState.properties[propertyId] ||
                    gameState.railroads[propertyId] ||
                    gameState.utilities[propertyId]
    
    if (!property || property.ownerId) {
      return { success: false, reason: 'Property not available for auction' }
    }
    
    const auctionId = 'auction_' + Date.now()
    const auction = {
      id: auctionId,
      propertyId,
      currentBid: startingBid,
      currentBidder: null,
      participants: gameState.players.filter(p => p.isActive && !p.isBankrupt).map(p => p.id),
      status: 'active',
      timestamp: new Date()
    }
    
    gameState.pendingActions.push(auction)
    
    return { success: true, auctionId }
  },

  // Place bid in auction
  placeBid(auctionId, playerId, bidAmount) {
    const auctionIndex = gameState.pendingActions.findIndex(a => a.id === auctionId)
    
    if (auctionIndex === -1) {
      return { success: false, reason: 'Auction not found' }
    }
    
    const auction = gameState.pendingActions[auctionIndex]
    const player = gameState.players.find(p => p.id === playerId)
    
    if (!player || !auction.participants.includes(playerId)) {
      return { success: false, reason: 'Player not in auction' }
    }
    
    if (bidAmount <= auction.currentBid) {
      return { success: false, reason: 'Bid must be higher than current bid' }
    }
    
    if (player.money < bidAmount) {
      return { success: false, reason: 'Insufficient funds' }
    }
    
    auction.currentBid = bidAmount
    auction.currentBidder = playerId
    
    return { success: true }
  },

  // Complete auction
  completeAuction(auctionId) {
    const auctionIndex = gameState.pendingActions.findIndex(a => a.id === auctionId)
    
    if (auctionIndex === -1) {
      return { success: false, reason: 'Auction not found' }
    }
    
    const auction = gameState.pendingActions[auctionIndex]
    
    if (auction.currentBidder) {
      // Someone won the auction
      const result = this.purchaseProperty(auction.currentBidder, auction.propertyId)
      if (result) {
        // Override the price with the bid amount
        const player = gameState.players.find(p => p.id === auction.currentBidder)
        const property = gameState.properties[auction.propertyId] ||
                        gameState.railroads[auction.propertyId] ||
                        gameState.utilities[auction.propertyId]
        
        const priceDifference = auction.currentBid - property.price
        player.money -= priceDifference // Adjust for bid vs original price
      }
    }
    
    gameState.pendingActions.splice(auctionIndex, 1)
    
    return { success: true }
  }
}

// Computed properties for game state
export const gameComputed = {
  // Current player
  currentPlayer: computed(() => {
    if (gameState.players.length === 0) return null
    return gameState.players[gameState.currentPlayerIndex] || null
  }),

  // Game status description
  gameStatus: computed(() => {
    if (gameState.gamePhase === 'setup') return 'Setting up game...'
    if (gameState.gamePhase === 'ended') return 'Game ended'
    
    const phase = gameState.turnPhase
    const phaseNames = {
      'rolling': 'Roll dice to move',
      'moving': 'Player moving...',
      'action': 'Take action or end turn',
      'trading': 'Trading properties',
      'developing': 'Managing properties'
    }
    
    return phaseNames[phase] || 'Playing...'
  }),

  // Total money in the game
  totalMoneyInGame: computed(() => {
    const playerMoney = gameState.players.reduce((total, player) => total + player.money, 0)
    return playerMoney + gameState.bank.money
  }),

  // Properties owned by all players
  propertiesOwnedCount: computed(() => {
    return gameState.players.reduce((total, player) => {
      return total + (player.properties?.length || 0) +
             (player.railroads?.length || 0) +
             (player.utilities?.length || 0)
    }, 0)
  })
}

// Helper function for player colors
function getPlayerColor(index) {
  const colors = [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // teal
    '#e67e22', // dark orange
    '#34495e'  // dark blue
  ]
  return colors[index % colors.length]
}

// Export the reactive game state and utilities
export default gameState