# Monopoly Dice System Documentation

## Overview
The dice system provides complete Monopoly dice rolling mechanics including standard 2-dice rolling, doubles detection, 3-doubles jail rule, visual animations, and integration with player movement.

## Components

### 1. Dice Model (`js/models/Dice.js`)
The core dice logic with the following features:
- Standard 2-dice rolling (1-6)
- Doubles detection and tracking
- 3-doubles jail rule implementation
- Roll history and statistics
- Roll validation and anti-cheat measures

**Usage:**
```javascript
import { dice } from './js/models/Dice.js';

// Roll dice
const result = dice.roll();
console.log(`Rolled ${result.dice1} + ${result.dice2} = ${result.total}`);

// Check if doubles
if (result.isDoubles) {
    console.log('Doubles rolled!');
}

// Check if should go to jail (3 doubles)
if (result.shouldGoToJail) {
    console.log('Going to jail!');
}

// Get statistics
const stats = dice.getStatistics();
console.log(`Total rolls: ${stats.totalRolls}`);
```

### 2. Dice UI (`js/ui/DiceUI.js`)
Visual dice display with animations:
- 3D-like dice appearance with dots
- Rolling animations
- Real-time result display
- Roll history panel
- Interactive controls

**Usage:**
```javascript
import { diceUI } from './js/ui/DiceUI.js';

// Initialize (automatically called when imported)
// diceUI.init();

// Enable/disable rolling
diceUI.setRollingEnabled(true);

// Toggle history display
diceUI.toggleHistory(true);
```

### 3. Dice Manager (`js/services/DiceManager.js`)
Integrates dice rolling with game logic:
- Player movement based on dice total
- Board wrapping (passing GO)
- Jail rule enforcement
- Turn-based rolling restrictions
- Event dispatching

**Usage:**
```javascript
import { initDiceManager } from './js/services/DiceManager.js';

// Initialize with game manager
const diceManager = initDiceManager(gameManager);

// Check if can roll
if (diceManager.canRollDice()) {
    // Dice rolling is allowed
}
```

## Features

### Dice Rolling
- **Standard 2-dice system**: Rolls two six-sided dice
- **Random generation**: Cryptographically secure random values
- **Validation**: Ensures dice values are between 1-6

### Doubles Detection
- **Automatic detection**: Identifies when both dice show the same value
- **Consecutive tracking**: Counts doubles in a row
- **Visual indicators**: Special styling for doubles rolls

### 3-Doubles Jail Rule
- **Automatic enforcement**: Sends player to jail after 3 consecutive doubles
- **Reset mechanism**: Resets doubles count when non-doubles is rolled
- **Notification system**: Alerts players when rule is triggered

### Player Movement
- **Position calculation**: Moves player based on dice total
- **Board wrapping**: Handles passing GO and collecting salary
- **Square landing**: Triggers appropriate events for landed squares

### Visual Features
- **3D dice appearance**: Realistic dice with dots
- **Rolling animation**: Smooth dice rolling effect
- **Result display**: Shows dice values and total
- **History panel**: Displays recent rolls
- **Responsive design**: Works on all screen sizes

### Statistics
- **Roll tracking**: Counts total rolls
- **Doubles percentage**: Calculates frequency of doubles
- **Average calculation**: Shows average roll value
- **Most common roll**: Identifies frequently rolled totals

## Integration Guide

### 1. Basic Setup
```html
<!-- Include CSS -->
<link rel="stylesheet" href="css/components/dice.css">

<!-- Include JavaScript -->
<script type="module">
    import { dice } from './js/models/Dice.js';
    import { diceUI } from './js/ui/DiceUI.js';
    import { initDiceManager } from './js/services/DiceManager.js';
</script>
```

### 2. HTML Structure
```html
<!-- Dice container (automatically populated) -->
<div id="dice-container"></div>
```

### 3. Game Integration
```javascript
class GameManager {
    constructor() {
        this.diceManager = initDiceManager(this);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for dice rolls
        document.addEventListener('dice:rolled', (e) => {
            this.handleDiceRoll(e.detail);
        });

        // Listen for player moves
        document.addEventListener('player:move', (e) => {
            this.handlePlayerMove(e.detail);
        });
    }

    handleDiceRoll(rollResult) {
        if (rollResult.shouldGoToJail) {
            this.currentPlayer.goToJail();
        } else {
            this.movePlayer(rollResult.total);
        }
    }
}
```

## Testing

### Manual Testing
1. Open `demo-dice.html` in your browser
2. Click "Roll Dice" to test basic functionality
3. Use "Force Double" to test doubles detection
4. Use "Force Snake Eyes" to test specific rolls
5. Check statistics and game log

### Automated Testing
1. Open `test-dice.html` in your browser
2. Click "Run All Tests" to execute the test suite
3. Review test results and any failures

### Test Files
- `demo-dice.html`: Interactive demo with full game simulation
- `test-dice.html`: Automated test suite
- `js/tests/dice-test.js`: Test implementation

## API Reference

### Dice Model Methods
- `roll()`: Roll the dice and return result
- `simulateRoll(d1, d2)`: Force specific dice values
- `reset()`: Reset dice state
- `getStatistics()`: Get roll statistics
- `getRollHistory(limit)`: Get recent rolls
- `canRollAgain()`: Check if player can roll again (doubles)

### Dice UI Methods
- `setRollingEnabled(enabled)`: Enable/disable rolling
- `toggleHistory(show)`: Show/hide roll history
- `reset()`: Reset display state

### Dice Manager Methods
- `canRollDice()`: Check if rolling is allowed
- `forceRoll(d1, d2)`: Force a specific roll
- `getState()`: Get current state
- `reset()`: Reset manager state

## Events
The system dispatches the following custom events:
- `dice:rolled`: When dice are rolled
- `player:move`: When player moves
- `jail:entered`: When player goes to jail
- `turn:start`: When a turn starts
- `turn:end`: When a turn ends

## Configuration
Dice behavior can be configured in `js/config/constants.js`:
```javascript
DICE: {
    MIN_VALUE: 1,
    MAX_VALUE: 6,
    DOUBLES_ROLL_AGAIN: true,
    MAX_DOUBLE_ROLLS: 3  // Number of doubles before jail
}
```

## Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues
1. **Dice not displaying**: Check CSS file inclusion
2. **Rolls not working**: Ensure dice.setCanRoll(true) is called
3. **No movement**: Verify DiceManager is initialized with game manager
4. **Statistics not updating**: Check if events are being dispatched

### Debug Mode
Enable debug logging by adding `?debug=true` to URL or setting:
```javascript
constants.DEBUG.ENABLED = true;