# Monopoly Rent Calculation System - Integration Guide

## Overview
The complete rent calculation system has been implemented for the Monopoly game in the kimi folder. This system handles all Monopoly rent rules including property rent, railroad rent, utility rent, monopoly bonuses, and mortgage effects.

## System Components

### 1. Rent Calculation Service (`js/services/RentCalculationService.js`)
- **Purpose**: Centralized rent calculation engine
- **Features**:
  - Property rent calculations (base, houses, hotels)
  - Railroad rent scaling (1-4 railroads)
  - Utility rent with dice roll multipliers
  - Monopoly bonus detection
  - Mortgage status handling
  - Detailed rent breakdowns

### 2. Enhanced Property Modal (`js/ui/EnhancedPropertyModal.js`)
- **Purpose**: Advanced property information display
- **Features**:
  - Detailed rent tables
  - Color group information
  - Development status
  - Monopoly status
  - Interactive rent calculation

### 3. Rent Display CSS (`css/components/rent-display.css`)
- **Purpose**: Styling for rent information display
- **Features**:
  - Responsive rent tables
  - Color-coded property groups
  - Interactive elements
  - Mobile-friendly design

### 4. Test Suite (`js/tests/rent-calculation-test.js`)
- **Purpose**: Comprehensive testing of all rent scenarios
- **Features**:
  - Property rent tests
  - Railroad rent tests
  - Utility rent tests
  - Monopoly bonus tests
  - Mortgage effect tests
  - Edge case handling

### 5. Demo Page (`demo-rent-calculator.html`)
- **Purpose**: Interactive rent calculation demonstration
- **Features**:
  - Property selection
  - House/hotel configuration
  - Mortgage status toggle
  - Dice roll input for utilities
  - Real-time rent calculation

## Integration Steps

### 1. Update Game Engine
Add the rent service to your game engine:

```javascript
import { RentCalculationService } from './js/services/RentCalculationService.js';

class GameEngine {
    constructor() {
        // ... existing initialization ...
        this.rentService = new RentCalculationService(this);
    }
}
```

### 2. Update Landing Event Service
The LandingEventService has been updated to use the new rent calculation system. Ensure you're using the latest version.

### 3. Add CSS Styles
Include the rent display CSS in your main CSS file:

```html
<link rel="stylesheet" href="css/components/rent-display.css">
```

### 4. Initialize Enhanced Modal
Replace or enhance your existing property modal with the enhanced version:

```javascript
import { EnhancedPropertyModal } from './js/ui/EnhancedPropertyModal.js';

const enhancedModal = new EnhancedPropertyModal(gameEngine);
```

## Usage Examples

### Basic Rent Calculation
```javascript
const rent = rentService.calculateRent(property, landingPlayer, diceRoll);
console.log(`Rent: $${rent.amount}`);
```

### Detailed Rent Information
```javascript
const details = rentService.getRentDetails(property, landingPlayer, diceRoll);
console.log(details.displayText);
console.log(details.breakdown);
```

### Property Modal Display
```javascript
enhancedModal.showPropertyDetails(property, currentPlayer);
```

## Rent Calculation Rules

### Properties
- **Base Rent**: Standard rent for unimproved properties
- **Monopoly Bonus**: 2x base rent when owning all properties in color group
- **House Rent**: Progressive rent based on number of houses (1-4)
- **Hotel Rent**: Highest rent tier for properties with hotels
- **Mortgage Effect**: No rent collected from mortgaged properties

### Railroads
- **1 Railroad**: $25
- **2 Railroads**: $50
- **3 Railroads**: $100
- **4 Railroads**: $200

### Utilities
- **1 Utility**: 4 × dice roll
- **2 Utilities**: 10 × dice roll
- **Mortgage Effect**: No rent collected from mortgaged utilities

## Testing

### Run Automated Tests
```javascript
import { RentCalculationTest } from './js/tests/rent-calculation-test.js';

const testSuite = new RentCalculationTest();
await testSuite.runAllTests();
```

### Manual Testing
1. Open `demo-rent-calculator.html` in your browser
2. Select different properties
3. Adjust houses/hotels
4. Toggle mortgage status
5. Test utility calculations with different dice rolls

## File Structure
```
kimi/
├── js/
│   ├── services/
│   │   └── RentCalculationService.js
│   ├── ui/
│   │   └── EnhancedPropertyModal.js
│   ├── tests/
│   │   └── rent-calculation-test.js
│   └── models/
│       ├── Property.js (updated)
│       └── Board.js
├── css/
│   └── components/
│       └── rent-display.css
├── demo-rent-calculator.html
└── RENT_SYSTEM_INTEGRATION.md
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes
- Rent calculations are optimized for real-time use
- Property lookups use efficient data structures
- CSS is optimized for responsive design

## Future Enhancements
- Trade impact on rent calculations
- Auction integration
- Advanced statistics tracking
- Custom rent rules support

## Troubleshooting

### Common Issues
1. **Rent calculation returning 0**: Check if property is mortgaged
2. **Monopoly bonus not applied**: Verify all properties in group are owned
3. **Utility rent incorrect**: Ensure dice roll is provided

### Debug Mode
Enable debug logging by adding `?debug=true` to your URL to see detailed rent calculation logs.