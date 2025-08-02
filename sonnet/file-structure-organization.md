# File Structure and Code Organization

## Project Root Structure

```
sonnet/
├── package.json                 # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── vite.config.js              # Vite build configuration
├── index.html                  # Entry HTML file
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules
├── src/                        # Source code directory
│   ├── main.js                 # Application entry point
│   ├── App.vue                 # Root Vue component
│   ├── components/             # Vue components
│   ├── game/                   # Game logic modules
│   ├── data/                   # Static game data
│   ├── utils/                  # Utility functions
│   ├── styles/                 # CSS stylesheets
│   └── assets/                 # Static assets
├── public/                     # Public static files
│   └── favicon.ico             # Site favicon
└── dist/                       # Build output (generated)
```

## Detailed Source Structure

### `/src` Directory Organization

```
src/
├── main.js                     # Vue app initialization
├── App.vue                     # Root component
├── components/                 # Vue components by category
│   ├── board/                  # Board-related components
│   │   ├── GameBoard.vue
│   │   ├── BoardSpace.vue
│   │   ├── PropertySpace.vue
│   │   ├── SpecialSpace.vue
│   │   ├── CardSpace.vue
│   │   ├── TaxSpace.vue
│   │   └── PlayerPieces.vue
│   ├── players/                # Player-related components
│   │   ├── PlayerPanels.vue
│   │   ├── PlayerPanel.vue
│   │   ├── PlayerInfo.vue
│   │   ├── PropertyList.vue
│   │   └── PlayerStats.vue
│   ├── controls/               # Game control components
│   │   ├── GameControls.vue
│   │   ├── DiceRoller.vue
│   │   ├── ActionButtons.vue
│   │   ├── TurnControls.vue
│   │   └── GameStatus.vue
│   ├── cards/                  # Card system components
│   │   ├── CardDisplay.vue
│   │   ├── ChanceCard.vue
│   │   ├── CommunityChestCard.vue
│   │   └── CardDeck.vue
│   ├── modals/                 # Modal dialog components
│   │   ├── GameModals.vue
│   │   ├── PropertyPurchaseModal.vue
│   │   ├── TradeModal.vue
│   │   ├── DevelopmentModal.vue
│   │   ├── MortgageModal.vue
│   │   ├── BankruptcyModal.vue
│   │   └── GameOverModal.vue
│   ├── shared/                 # Reusable components
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   ├── MoneyDisplay.vue
│   │   ├── PropertyCard.vue
│   │   └── LoadingSpinner.vue
│   └── layout/                 # Layout components
│       ├── GameHeader.vue
│       ├── GameFooter.vue
│       └── ResponsiveContainer.vue
├── game/                       # Game logic modules
│   ├── state/                  # State management
│   │   ├── gameState.js        # Main reactive game state
│   │   ├── playerState.js      # Player-specific state
│   │   ├── boardState.js       # Board and property state
│   │   └── uiState.js          # UI-specific state
│   ├── logic/                  # Core game logic
│   │   ├── gameEngine.js       # Main game engine
│   │   ├── turnManager.js      # Turn flow management
│   │   ├── moveProcessor.js    # Player movement logic
│   │   ├── actionProcessor.js  # Action processing
│   │   └── winConditions.js    # Game end conditions
│   ├── systems/                # Game subsystems
│   │   ├── propertySystem.js   # Property management
│   │   ├── economicSystem.js   # Money and transactions
│   │   ├── cardSystem.js       # Card deck management
│   │   ├── developmentSystem.js # Building houses/hotels
│   │   ├── tradeSystem.js      # Player trading
│   │   ├── bankruptcySystem.js # Bankruptcy handling
│   │   └── auctionSystem.js    # Property auctions
│   ├── rules/                  # Game rule implementations
│   │   ├── movementRules.js    # Movement mechanics
│   │   ├── rentRules.js        # Rent calculation
│   │   ├── developmentRules.js # Building rules
│   │   ├── tradeRules.js       # Trading rules
│   │   └── specialRules.js     # Special space rules
│   └── events/                 # Event system
│       ├── gameEvents.js       # Event definitions
│       ├── eventEmitter.js     # Event emission
│       └── eventHandlers.js    # Event processing
├── data/                       # Static game data
│   ├── boardConfig.js          # Board layout configuration
│   ├── propertyData.js         # Property definitions
│   ├── cardData.js            # Card deck data
│   │   ├── chanceCards.js      # Chance card definitions
│   │   └── communityChestCards.js # Community Chest cards
│   ├── gameSettings.js         # Default game settings
│   └── constants.js            # Game constants
├── utils/                      # Utility functions
│   ├── validation.js           # Input validation
│   ├── formatting.js           # Display formatting
│   ├── calculations.js         # Mathematical calculations
│   ├── animations.js           # Animation helpers
│   ├── storage.js              # Local storage utilities
│   └── helpers.js              # General helper functions
├── styles/                     # CSS stylesheets
│   ├── main.css               # Global styles
│   ├── variables.css          # CSS custom properties
│   ├── layout.css             # Layout styles
│   ├── components/            # Component-specific styles
│   │   ├── board.css          # Board styling
│   │   ├── players.css        # Player panel styling
│   │   ├── controls.css       # Control styling
│   │   ├── cards.css          # Card styling
│   │   ├── modals.css         # Modal styling
│   │   └── animations.css     # Animation definitions
│   ├── themes/                # Theme variations
│   │   ├── default.css        # Default theme
│   │   └── high-contrast.css  # Accessibility theme
│   └── responsive/            # Responsive design
│       ├── mobile.css         # Mobile styles
│       ├── tablet.css         # Tablet styles
│       └── desktop.css        # Desktop styles
└── assets/                    # Static assets
    └── icons/                 # Icon files (if any)
        └── player-pieces/     # Player piece icons
```

## Key File Implementations

### 1. Project Configuration Files

#### `package.json`
```json
{
  "name": "monopoly-game",
  "version": "1.0.0",
  "description": "Complete Monopoly board game implementation",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.vue",
    "format": "prettier --write src/**/*.{js,vue,css}"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

#### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@game': resolve(__dirname, 'src/game'),
      '@data': resolve(__dirname, 'src/data'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  }
})
```

### 2. Entry Point Files

#### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monopoly Game</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

#### `src/main.js`
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/main.css'

// Initialize Vue application
const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
}

// Mount application
app.mount('#app')
```

### 3. Core Module Organization

#### `src/game/state/gameState.js`
```javascript
import { reactive, computed } from 'vue'
import { createInitialPlayers } from './playerState.js'
import { createBoardState } from './boardState.js'
import { createUIState } from './uiState.js'

export const gameState = reactive({
  // Game control
  gameId: null,
  gamePhase: 'setup',
  turnPhase: 'rolling',
  
  // Players and turns
  players: [],
  currentPlayerIndex: 0,
  playerCount: 0,
  activePlayers: 0,
  turnNumber: 0,
  
  // Game components
  board: [],
  properties: {},
  railroads: {},
  utilities: {},
  
  // Dice state
  dice: {
    die1: 1,
    die2: 1,
    total: 2,
    isDoubles: false,
    doublesCount: 0
  },
  
  // Card decks
  chanceCards: [],
  communityChestCards: [],
  
  // UI state
  ...createUIState(),
  
  // Game settings
  settings: {}
})

// Computed properties
export const currentPlayer = computed(() => 
  gameState.players[gameState.currentPlayerIndex]
)

export const gameInProgress = computed(() => 
  gameState.gamePhase === 'playing'
)

export const canRollDice = computed(() => 
  gameState.turnPhase === 'rolling' && gameInProgress.value
)
```

#### `src/game/logic/gameEngine.js`
```javascript
import { gameState, currentPlayer } from '@/game/state/gameState.js'
import { turnManager } from './turnManager.js'
import { moveProcessor } from './moveProcessor.js'
import { actionProcessor } from './actionProcessor.js'
import { winConditions } from './winConditions.js'

export const gameEngine = {
  // Game initialization
  startGame(playerConfig) {
    console.log('Starting new Monopoly game')
    // Initialize game state with players
    // Set up board and properties
    // Shuffle card decks
    // Begin first turn
  },
  
  // Turn management
  rollDice() {
    if (!gameState.canRollDice) return false
    
    const die1 = Math.floor(Math.random() * 6) + 1
    const die2 = Math.floor(Math.random() * 6) + 1
    
    gameState.dice = {
      die1,
      die2,
      total: die1 + die2,
      isDoubles: die1 === die2,
      doublesCount: die1 === die2 ? gameState.dice.doublesCount + 1 : 0
    }
    
    return moveProcessor.processPlayerMove(currentPlayer.value, gameState.dice)
  },
  
  // Action processing
  buyProperty(propertyId) {
    return actionProcessor.handlePropertyPurchase(currentPlayer.value.id, propertyId)
  },
  
  endTurn() {
    return turnManager.endCurrentTurn()
  },
  
  // Game state queries
  isGameOver() {
    return winConditions.checkGameEnd()
  },
  
  getWinner() {
    return winConditions.getWinner()
  }
}
```

### 4. Component Organization Pattern

#### Component Naming Convention
- **PascalCase**: All component files (e.g., `GameBoard.vue`)
- **Descriptive Names**: Clear purpose indication
- **Hierarchical Grouping**: Related components in same directory
- **Base Components**: Prefixed with `Base` for reusable components

#### Component Structure Template
```vue
<template>
  <!-- Component template -->
</template>

<script>
import { computed, ref } from 'vue'
import { gameState } from '@/game/state/gameState.js'

export default {
  name: 'ComponentName',
  
  props: {
    // Component props with validation
  },
  
  emits: [
    // Declared event emissions
  ],
  
  setup(props, { emit }) {
    // Composition API logic
    
    return {
      // Exposed properties and methods
    }
  }
}
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### 5. Import Path Organization

#### Absolute Import Aliases
```javascript
// Use aliases for clean imports
import { gameState } from '@/game/state/gameState.js'
import GameBoard from '@components/board/GameBoard.vue'
import { propertyData } from '@data/propertyData.js'
import { formatMoney } from '@utils/formatting.js'
```

#### Import Order Convention
```javascript
// 1. Vue imports
import { ref, computed, onMounted } from 'vue'

// 2. External library imports
// (none in this project)

// 3. Internal module imports
import { gameEngine } from '@/game/logic/gameEngine.js'
import { gameState } from '@/game/state/gameState.js'

// 4. Component imports
import PlayerPanel from '@components/players/PlayerPanel.vue'

// 5. Utility imports
import { formatMoney } from '@utils/formatting.js'

// 6. Data imports
import { propertyData } from '@data/propertyData.js'
```

### 6. Code Organization Principles

#### Module Separation
- **State**: Pure reactive state objects
- **Logic**: Business logic functions
- **Components**: UI rendering and interaction
- **Data**: Static configuration and constants
- **Utils**: Pure utility functions

#### Dependency Direction
```
Components → Game Logic → Game State
     ↓           ↓           ↓
   Utils    →   Data    →  Constants
```

#### File Size Guidelines
- **Components**: < 200 lines (split if larger)
- **Logic Modules**: < 300 lines
- **Data Files**: < 500 lines
- **State Files**: < 100 lines (focused scope)

This file structure provides a scalable, maintainable foundation that clearly separates concerns while maintaining efficient development workflow and build optimization.