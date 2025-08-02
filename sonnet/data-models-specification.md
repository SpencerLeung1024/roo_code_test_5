# Data Models Specification

## Core Data Models

### Player Data Model

```javascript
const Player = {
  id: String,              // Unique player identifier
  name: String,            // Display name
  color: String,           // Player piece color (#hex)
  money: Number,           // Current cash balance
  position: Number,        // Current board position (0-39)
  
  // Game status
  isActive: Boolean,       // Still in game (not bankrupt)
  isBankrupt: Boolean,     // Eliminated from game
  isInJail: Boolean,       // Currently in jail
  jailTurns: Number,       // Turns remaining in jail (0-3)
  
  // Special cards
  getOutOfJailCards: Number, // Number of "Get out of jail free" cards
  
  // Properties owned
  properties: Array,       // Array of property IDs
  railroads: Array,        // Array of railroad IDs
  utilities: Array,        // Array of utility IDs
  
  // Development tracking
  houses: Number,          // Total houses owned
  hotels: Number,          // Total hotels owned
  
  // Financial history
  netWorth: Number,        // Computed: money + property values
  totalAssetsValue: Number, // Computed: all assets at current value
  
  // Statistics
  stats: {
    turnsPlayed: Number,
    propertiesBought: Number,
    rentCollected: Number,
    rentPaid: Number,
    timesInJail: Number
  }
}
```

### Board Space Data Model

```javascript
const BoardSpace = {
  id: Number,              // Position on board (0-39)
  name: String,            // Display name
  type: String,            // 'property', 'railroad', 'utility', 'special', 'card', 'tax'
  
  // Visual display
  color: String,           // Background color for space
  textColor: String,       // Text color for contrast
  
  // Position on board
  side: String,            // 'bottom', 'left', 'top', 'right'
  sidePosition: Number,    // Position within side (0-9)
  
  // Action when landed on
  action: String,          // 'buy', 'rent', 'tax', 'card', 'special'
  
  // Special space data
  specialType: String,     // 'go', 'jail', 'freeParking', 'goToJail'
  taxAmount: Number,       // Fixed tax amount (if tax space)
  
  // Card space data
  cardType: String,        // 'chance', 'communityChest'
}
```

### Property Data Model

```javascript
const Property = {
  id: Number,              // Board position
  name: String,            // Property name
  colorGroup: String,      // Property color group
  
  // Financial data
  price: Number,           // Purchase price
  rent: Array,             // [base, 1house, 2house, 3house, 4house, hotel]
  houseCost: Number,       // Cost to build house/hotel
  mortgageValue: Number,   // Mortgage value (typically price/2)
  
  // Ownership data
  ownerId: String,         // Player ID of owner (null if unowned)
  isMortgaged: Boolean,    // Mortgage status
  
  // Development data
  houses: Number,          // Number of houses (0-4)
  hasHotel: Boolean,       // Has hotel (replaces 4 houses)
  
  // Computed properties
  currentRent: Number,     // Current rent based on development
  isPartOfMonopoly: Boolean, // Owner has all properties in color group
  canDevelop: Boolean,     // Can build houses/hotels
  
  // Color group information
  groupProperties: Array,  // All property IDs in same color group
  groupSize: Number        // Total properties in color group
}
```

### Railroad Data Model

```javascript
const Railroad = {
  id: Number,              // Board position
  name: String,            // Railroad name
  price: 200,              // Standard railroad price
  mortgageValue: 100,      // Half of price
  
  // Ownership
  ownerId: String,         // Player ID of owner
  isMortgaged: Boolean,    // Mortgage status
  
  // Rent calculation (based on number owned by same player)
  rentSchedule: [25, 50, 100, 200], // 1, 2, 3, 4 railroads owned
  currentRent: Number      // Current rent based on ownership count
}
```

### Utility Data Model

```javascript
const Utility = {
  id: Number,              // Board position
  name: String,            // Utility name ('Electric Company', 'Water Works')
  price: 150,              // Standard utility price
  mortgageValue: 75,       // Half of price
  
  // Ownership
  ownerId: String,         // Player ID of owner
  isMortgaged: Boolean,    // Mortgage status
  
  // Rent calculation (multiplier × dice roll)
  rentMultiplier: Number,  // 4× if one utility, 10× if both utilities
  requiresDiceRoll: Boolean // Rent depends on current dice roll
}
```

### Card Data Models

```javascript
const ChanceCard = {
  id: Number,              // Card identifier
  title: String,           // Card title/description
  type: String,            // 'move', 'money', 'property', 'special'
  
  // Action data
  action: String,          // Specific action type
  value: Number,           // Monetary value or position
  targetPosition: Number,  // Target board position (for move cards)
  
  // Special flags
  collectGoBonus: Boolean, // Collect $200 if passing Go
  isGetOutOfJail: Boolean, // "Get out of jail free" card
  
  // Property-related actions
  perHouseAmount: Number,  // Amount per house/hotel owned
  perPropertyAmount: Number // Amount per property type owned
}

const CommunityChestCard = {
  // Same structure as ChanceCard
  // Different thematic content but identical data structure
}
```

## Game State Data Model

```javascript
const GameState = {
  // Game control
  gameId: String,          // Unique game session ID
  gamePhase: String,       // 'setup', 'playing', 'paused', 'ended'
  turnPhase: String,       // 'rolling', 'moving', 'action', 'trading', 'developing'
  
  // Player management
  players: Array,          // Array of Player objects
  currentPlayerIndex: Number, // Index of current player
  playerCount: Number,     // Total number of players
  activePlayers: Number,   // Non-bankrupt players remaining
  
  // Turn tracking
  turnNumber: Number,      // Total turns played
  currentPlayerTurn: Number, // Current player's turn count
  
  // Dice state
  dice: {
    die1: Number,          // First die value (1-6)
    die2: Number,          // Second die value (1-6)
    total: Number,         // Sum of both dice
    isDoubles: Boolean,    // Whether dice show same value
    doublesCount: Number,  // Consecutive doubles this turn (max 3)
    lastRoll: Date         // Timestamp of last roll
  },
  
  // Board state
  board: Array,           // Array of all board spaces
  properties: Object,     // Map of propertyId -> Property object
  railroads: Object,      // Map of railroadId -> Railroad object
  utilities: Object,      // Map of utilityId -> Utility object
  
  // Card decks
  chanceCards: Array,     // Shuffled chance deck
  communityChestCards: Array, // Shuffled community chest deck
  chanceDiscard: Array,   // Used chance cards
  communityDiscard: Array, // Used community chest cards
  
  // Game economy
  bank: {
    money: Number,        // Bank's money supply
    houses: Number,       // Available houses (32 total)
    hotels: Number        // Available hotels (12 total)
  },
  
  // UI state
  selectedProperty: Number, // Currently selected property ID
  activeModal: String,    // Current modal type
  pendingActions: Array,  // Queued actions to process
  
  // Animation state
  animations: {
    playerMoving: Boolean,
    diceRolling: Boolean,
    cardRevealing: Boolean,
    propertyHighlight: Number
  },
  
  // Game history
  history: Array,         // Game action history for undo/replay
  winner: String,         // Player ID of winner (when game ends)
  endTime: Date,          // Game end timestamp
  
  // Settings
  settings: {
    housesAvailable: Boolean, // Limited houses rule
    auctionUnboughtProperties: Boolean,
    freeParking: String,   // 'nothing', 'taxes', 'fines'
    salariesOnGo: Number,  // Money collected on Go
    bankruptcyToBank: Boolean // Assets go to bank vs. creditor
  }
}
```

## Computed Properties and Derived State

### Player Computed Properties
```javascript
const playerComputedProperties = {
  // Financial calculations
  netWorth: () => money + totalPropertyValue + totalDevelopmentValue,
  totalPropertyValue: () => properties.reduce((sum, prop) => sum + prop.value, 0),
  liquidAssets: () => money + mortgageableValue,
  
  // Property analysis
  monopolies: () => colorGroups.filter(group => ownsAllInGroup(group)),
  developableProperties: () => properties.filter(prop => canBuildOn(prop)),
  rentIncome: () => properties.reduce((sum, prop) => sum + prop.currentRent, 0),
  
  // Game status
  canAfford: (amount) => money >= amount || liquidAssets >= amount,
  isWinner: () => activePlayers === 1 && isActive,
  canEndTurn: () => !hasRequiredActions()
}
```

### Board Computed Properties
```javascript
const boardComputedProperties = {
  // Property groups
  colorGroupOwnership: () => colorGroups.map(group => ({
    color: group.color,
    totalProperties: group.properties.length,
    ownedBy: getGroupOwnership(group),
    isMonopoly: hasMonopoly(group)
  })),
  
  // Available development
  availableHouses: () => bank.houses - totalHousesOnBoard,
  availableHotels: () => bank.hotels - totalHotelsOnBoard,
  
  // Economic analysis
  totalMoneyInGame: () => players.reduce((sum, p) => sum + p.money, 0),
  averageNetWorth: () => totalNetWorth / activePlayers,
  propertyDistribution: () => players.map(p => ({
    playerId: p.id,
    propertyCount: p.properties.length,
    monopolyCount: p.monopolies.length
  }))
}
```

## Data Validation Schema

### Required Field Validation
```javascript
const validation = {
  Player: {
    required: ['id', 'name', 'money', 'position'],
    constraints: {
      money: { min: 0 },
      position: { min: 0, max: 39 },
      jailTurns: { min: 0, max: 3 }
    }
  },
  
  Property: {
    required: ['id', 'name', 'price', 'rent'],
    constraints: {
      houses: { min: 0, max: 4 },
      rent: { arrayLength: 6 },
      price: { min: 0 }
    }
  },
  
  GameState: {
    required: ['gamePhase', 'players', 'currentPlayerIndex'],
    constraints: {
      currentPlayerIndex: { min: 0, max: 'playerCount-1' },
      playerCount: { min: 2, max: 8 }
    }
  }
}
```

This comprehensive data model specification provides the foundation for implementing all game mechanics while maintaining data integrity and supporting complex game interactions.