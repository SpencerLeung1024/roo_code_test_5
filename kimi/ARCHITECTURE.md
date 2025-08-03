# Monopoly Game Architecture Design

## Project Overview
A single-player Monopoly game implementation for web browsers, running on localhost. Features text-based cards and pieces with comprehensive Monopoly mechanics.

## 1. Directory Structure

```
kimi/
├── src/
│   ├── components/          # React components
│   │   ├── board/
│   │   │   ├── Board.jsx
│   │   │   ├── Square.jsx
│   │   │   └── PlayerToken.jsx
│   │   ├── cards/
│   │   │   ├── ChanceCard.jsx
│   │   │   ├── CommunityChestCard.jsx
│   │   │   └── PropertyCard.jsx
│   │   ├── ui/
│   │   │   ├── Dice.jsx
│   │   │   ├── GameControls.jsx
│   │   │   └── PlayerInfo.jsx
│   │   └── modals/
│   │       ├── TradeModal.jsx
│   │       ├── BuyPropertyModal.jsx
│   │       └── AuctionModal.jsx
│   ├── models/             # Core game logic
│   │   ├── Game.js
│   │   ├── Player.js
│   │   ├── Property.js
│   │   ├── Board.js
│   │   ├── Card.js
│   │   └── Dice.js
│   ├── data/              # Game data
│   │   ├── properties.json
│   │   ├── chanceCards.json
│   │   ├── communityChest.json
│   │   └── boardLayout.json
│   ├── styles/            # CSS styles
│   │   ├── main.css
│   │   ├── board.css
│   │   ├── cards.css
│   │   └── components.css
│   ├── utils/             # Helper functions
│   │   ├── gameState.js
│   │   ├── validation.js
│   │   └── calculations.js
│   └── App.jsx            # Main React component
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
├── webpack.config.js
├── .gitignore
└── README.md
```

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with JSX
- **Build Tool:** Webpack 5 with Babel
- **Styling:** CSS3 with CSS Modules
- **State Management:** React Context API + useReducer
- **Development Server:** Webpack Dev Server
- **Package Manager:** npm

### Development Dependencies
- @babel/core
- @babel/preset-env
- @babel/preset-react
- webpack
- webpack-cli
- webpack-dev-server
- babel-loader
- css-loader
- style-loader
- html-webpack-plugin

## 3. Core Data Models

### Game State Structure
```javascript
// Main game state
{
  players: [Player],
  currentPlayerIndex: 0,
  board: Board,
  bank: Bank,
  gamePhase: 'ROLL_DICE' | 'MOVE_PLAYER' | 'LANDED_ON_SQUARE' | 'TRADE' | 'AUCTION',
  diceValues: [number, number],
  chanceCards: [Card],
  communityChestCards: [Card],
  houses: number,
  hotels: number,
  freeParkingAmount: number
}
```

### Player Model
```javascript
Player {
  id: string,
  name: string,
  position: number (0-39),
  money: number,
  properties: [Property],
  getOutOfJailFreeCards: number,
  inJail: boolean,
  jailTurns: number,
  isBankrupt: boolean,
  color: string
}
```

### Property Model
```javascript
Property {
  id: string,
  name: string,
  type: 'street' | 'railroad' | 'utility',
  price: number,
  rent: [number], // Array of rent values based on development
  houseCost: number,
  hotelCost: number,
  mortgageValue: number,
  isMortgaged: boolean,
  owner: Player | null,
  houses: number (0-4),
  hasHotel: boolean,
  colorGroup: string,
  position: number
}
```

### Board Model
```javascript
Board {
  squares: [Square],
  getSquare(position): Square,
  getPropertiesByColor(color): [Property]
}
```

### Card Models
```javascript
Card {
  id: string,
  type: 'chance' | 'community_chest',
  text: string,
  action: Function // Game state transformation
}
```

## 4. Game State Management

### State Management Pattern
- **Centralized State:** React Context API
- **State Updates:** Immutable updates using useReducer
- **Persistence:** LocalStorage for game save/resume

### State Management Flow
```
User Action → Action Creator → Reducer → State Update → UI Re-render
```

### Key Actions
- `ROLL_DICE`: Roll dice and move player
- `BUY_PROPERTY`: Purchase property
- `PAY_RENT`: Pay rent to property owner
- `BUILD_HOUSE`: Build house/hotel
- `MORTGAGE_PROPERTY`: Mortgage/unmortgage property
- `TRADE`: Trade properties/money between players
- `DRAW_CARD`: Draw chance/community chest card
- `GO_TO_JAIL`: Send player to jail
- `DECLARE_BANKRUPTCY`: Handle player bankruptcy

## 5. Game Mechanics Implementation

### Turn Flow
1. **Roll Phase**: Player rolls dice
2. **Move Phase**: Player moves based on dice
3. **Land Phase**: Handle square landing logic
4. **Action Phase**: Player can buy, build, trade, or mortgage
5. **End Turn**: Pass to next player

### Special Squares
- **GO**: Collect $200
- **Jail/Just Visiting**: Handle jail logic
- **Free Parking**: Collect accumulated money
- **Go to Jail**: Send player to jail
- **Chance/Community Chest**: Draw and execute card
- **Income Tax**: Pay 10% or $200
- **Luxury Tax**: Pay $75

## 6. Property Groups and Values

### Street Properties
- **Brown**: Mediterranean Ave ($60), Baltic Ave ($60)
- **Light Blue**: Oriental Ave ($100), Vermont Ave ($100), Connecticut Ave ($120)
- **Pink**: St. Charles Place ($140), States Ave ($140), Virginia Ave ($160)
- **Orange**: St. James Place ($180), Tennessee Ave ($180), New York Ave ($200)
- **Red**: Kentucky Ave ($220), Indiana Ave ($220), Illinois Ave ($240)
- **Yellow**: Atlantic Ave ($260), Ventnor Ave ($260), Marvin Gardens ($280)
- **Green**: Pacific Ave ($300), North Carolina Ave ($300), Pennsylvania Ave ($320)
- **Dark Blue**: Park Place ($350), Boardwalk ($400)

### Railroads
- Reading Railroad ($200)
- Pennsylvania Railroad ($200)
- B&O Railroad ($200)
- Short Line Railroad ($200)

### Utilities
- Electric Company ($150)
- Water Works ($150)

## 7. Development Phases

### Phase 1: Core Setup
- Initialize React project
- Set up Webpack configuration
- Create basic file structure
- Implement basic styling

### Phase 2: Game Board
- Create board layout
- Implement square components
- Add player tokens
- Style property squares

### Phase 3: Game Logic
- Implement Player model
- Implement Property model
- Create game state management
- Add dice rolling mechanics

### Phase 4: Property System
- Property purchase system
- Rent calculation
- House/hotel building
- Mortgage system

### Phase 5: Advanced Features
- Chance and Community Chest cards
- Trading system
- Auction system
- Jail mechanics

### Phase 6: Polish
- Game save/load
- Animations
- Responsive design
- Testing

## 8. Initial Setup Commands

```bash
# Initialize project
npm init -y

# Install dependencies
npm install react react-dom

# Install dev dependencies
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react webpack webpack-cli webpack-dev-server babel-loader css-loader style-loader html-webpack-plugin

# Create directory structure
mkdir -p src/components/board src/components/cards src/components/ui src/components/modals
mkdir -p src/models src/data src/styles src/utils
mkdir -p public
```

## 9. Key Design Decisions

### No Physical Money
- All transactions use numeric values
- Simplified money management
- No bill counting mechanics

### Single Browser Multiplayer
- All players take turns on same device
- No network requirements
- Simplified state management

### Text-Based Visuals
- Simple colored rectangles for pieces
- Text-based cards
- CSS-based board styling
- No image assets required

### Responsive Design
- Mobile-friendly layout
- Flexible board sizing
- Touch-friendly controls

## 10. Testing Strategy

### Unit Tests
- Game logic functions
- Property calculations
- State transitions

### Integration Tests
- Full game flow
- Player interactions
- Edge cases

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Game balance verification