# Monopoly Game Architecture

## Project Overview
A single-player web-based Monopoly game implementation using vanilla JavaScript, HTML, and CSS. The game runs entirely in the browser without external dependencies.

## Architecture Philosophy
- **Modular Design**: Clear separation of concerns with ES6 modules
- **Event-Driven**: Game state changes trigger UI updates
- **Data-First**: Game state is the single source of truth
- **Scalable**: Easy to extend with new features

## Folder Structure

```
kimi/
├── index.html                 # Main entry point
├── css/
│   ├── main.css              # Global styles
│   ├── board.css             # Board-specific styling
│   ├── components/           # Reusable UI components
│   │   ├── player.css
│   │   ├── property.css
│   │   ├── card.css
│   │   └── modal.css
│   └── themes/               # Color schemes
│       └── default.css
├── js/
│   ├── main.js               # Application entry point
│   ├── models/               # Data structures
│   │   ├── Game.js
│   │   ├── Player.js
│   │   ├── Property.js
│   │   ├── Board.js
│   │   ├── Card.js
│   │   └── Dice.js
│   ├── engine/               # Game logic
│   │   ├── GameEngine.js
│   │   ├── TurnManager.js
│   │   ├── RuleEngine.js
│   │   └── StateManager.js
│   ├── ui/                   # UI components
│   │   ├── BoardRenderer.js
│   │   ├── PlayerRenderer.js
│   │   ├── PropertyRenderer.js
│   │   ├── ModalManager.js
│   │   └── EventHandlers.js
│   ├── services/             # Business logic
│   │   ├── TradeService.js
│   │   ├── AuctionService.js
│   │   ├── MortgageService.js
│   │   └── RentService.js
│   ├── utils/                # Helper functions
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── storage.js
│   └── config/               # Game configuration
│       ├── properties.js
│       ├── cards.js
│       └── rules.js
├── assets/
│   └── sounds/               # Optional sound effects
└── docs/
    └── api.md                # API documentation
```

## Core Data Models

### Game State
```javascript
Game {
  id: string,
  players: Player[],
  currentPlayerIndex: number,
  board: Board,
  bank: Bank,
  chanceCards: Card[],
  communityChestCards: Card[],
  status: 'setup' | 'playing' | 'paused' | 'finished',
  round: number,
  settings: GameSettings
}
```

### Player
```javascript
Player {
  id: string,
  name: string,
  token: string,
  money: number,
  properties: Property[],
  position: number,
  inJail: boolean,
  jailTurns: number,
  getOutOfJailFreeCards: number,
  isBankrupt: boolean
}
```

### Property
```javascript
Property {
  id: string,
  name: string,
  type: 'street' | 'railroad' | 'utility',
  price: number,
  rent: number[],
  houseCost: number,
  hotelCost: number,
  mortgageValue: number,
  owner: Player | null,
  houses: number,
  hasHotel: boolean,
  colorGroup: string,
  isMortgaged: boolean
}
```

### Board
```javascript
Board {
  squares: Square[],
  size: number
}

Square {
  id: string,
  type: 'property' | 'chance' | 'community_chest' | 'tax' | 'railroad' | 'utility' | 'corner' | 'jail',
  position: number,
  data: Property | Card | null
}
```

## Game Engine Components

### GameEngine
- Initializes game state
- Manages game lifecycle
- Handles win/lose conditions
- Coordinates between components

### TurnManager
- Manages player turns
- Handles turn phases (roll, move, action, trade)
- Manages special states (jail, bankruptcy)

### RuleEngine
- Validates moves and actions
- Calculates rents and payments
- Enforces game rules
- Handles edge cases

### StateManager
- Manages game state persistence
- Handles save/load functionality
- Provides state history for undo/redo

## UI Components

### BoardRenderer
- Renders the game board
- Handles square positioning
- Manages property colors and houses
- Shows player positions

### PlayerRenderer
- Displays player information
- Shows money, properties, and status
- Handles player interactions

### PropertyRenderer
- Shows property details
- Handles property management (buy, sell, mortgage)
- Displays rent information

### ModalManager
- Manages all modal dialogs
- Handles property purchase, auction, trade
- Shows card draws and notifications

## Game Flow

1. **Setup Phase**
   - Initialize players
   - Set starting money
   - Shuffle cards
   - Place players on GO

2. **Game Loop**
   - Player rolls dice
   - Move player token
   - Handle landing square
   - Allow player actions
   - Check win conditions
   - Next player turn

3. **Turn Phases**
   - Pre-roll (jail check, doubles)
   - Roll and move
   - Landing action
   - Post-move actions (buy, build, trade)
   - End turn

## Key Features

### Property Management
- Buying unowned properties
- Paying rent
- Building houses/hotels
- Mortgaging properties
- Trading properties

### Special Squares
- Chance and Community Chest cards
- Income Tax and Luxury Tax
- Jail and Just Visiting
- Free Parking
- GO and GO TO JAIL

### Advanced Features
- Auction system for unowned properties
- Trading between players
- Bankruptcy handling
- House rules support
- Game save/load

## Event System

### Custom Events
- `game:start` - Game initialization
- `turn:start` - New turn begins
- `dice:rolled` - Dice rolled
- `player:move` - Player moves
- `property:landed` - Player lands on property
- `card:drawn` - Card drawn
- `trade:proposed` - Trade initiated
- `game:end` - Game finished

### Event Flow
```javascript
// Example event handling
document.addEventListener('dice:rolled', (e) => {
  const { player, dice1, dice2, total } = e.detail;
  // Update UI, check for doubles, etc.
});
```

## Storage Strategy

### Local Storage
- Save game state
- Store player preferences
- Cache game assets

### Session Storage
- Temporary game state
- Undo/redo history

## Performance Considerations

- Efficient DOM updates using document fragments
- Debounced event handlers
- Lazy loading of components
- Minimal re-renders
- Optimized CSS animations

## Security Considerations

- Input validation for all user actions
- State integrity checks
- Prevent cheating through console
- Secure random number generation

## Testing Strategy

- Unit tests for game logic
- Integration tests for game flow
- UI tests for user interactions
- Performance tests for large games

## Future Enhancements

- Multiplayer support
- AI opponents
- Sound effects and music
- Animations and transitions
- Mobile responsive design
- Theme support
- Statistics tracking