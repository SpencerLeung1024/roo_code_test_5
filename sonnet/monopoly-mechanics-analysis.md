# Monopoly Game Mechanics Analysis

## Core Game Components

### Board Layout (40 Spaces)
1. **Go** - Start space, collect $200 when passing
2. **Properties** (22 total):
   - Brown: Mediterranean Ave, Baltic Ave
   - Light Blue: Oriental Ave, Vermont Ave, Connecticut Ave
   - Pink: St. Charles Place, States Ave, Virginia Ave
   - Orange: St. James Place, Tennessee Ave, New York Ave
   - Red: Kentucky Ave, Indiana Ave, Illinois Ave
   - Yellow: Atlantic Ave, Ventnor Ave, Marvin Gardens
   - Green: Pacific Ave, North Carolina Ave, Pennsylvania Ave
   - Dark Blue: Park Place, Boardwalk
3. **Railroads** (4): Reading, Pennsylvania, B&O, Short Line
4. **Utilities** (2): Electric Company, Water Works
5. **Special Spaces**:
   - Jail/Just Visiting
   - Free Parking
   - Go to Jail
   - Income Tax ($200)
   - Luxury Tax ($75)
6. **Card Spaces**:
   - Chance (3 spaces)
   - Community Chest (3 spaces)

### Player Mechanics
- **Starting Money**: $1500 per player
- **Movement**: Roll 2 dice, move clockwise
- **Doubles**: Roll again (max 3 doubles = go to jail)
- **Turn Actions**: Buy property, pay rent, manage properties, trade

### Property System
- **Purchase**: Pay listed price when landing on unowned property
- **Rent**: Pay owner when landing on owned property
- **Monopoly**: Own all properties of same color group
- **Development**: Build houses (max 4) then hotels on monopolies
- **Mortgage**: Get half purchase price, pay 10% interest to unmortgage

### Economic Mechanics
- **Rent Calculation**:
  - Undeveloped: Base rent (2x if monopoly)
  - With houses: Exponentially increasing rent
  - With hotel: Highest rent tier
  - Railroads: $25, $50, $100, $200 (based on number owned)
  - Utilities: 4x or 10x dice roll (based on number owned)

### Card Systems
- **Chance Cards** (~16 cards):
  - Move to specific spaces
  - Collect/pay money
  - Get out of jail free
  - Pay per house/hotel
- **Community Chest Cards** (~16 cards):
  - Similar mechanics to Chance
  - More community-focused themes

### Win/Lose Conditions
- **Bankruptcy**: Cannot pay debts, eliminated from game
- **Victory**: Last player remaining with money/assets
- **Debt Resolution**: Sell houses/hotels, mortgage properties, trade assets

### Special Rules
- **Jail**: 
  - Pay $50 to get out
  - Roll doubles to get out
  - Use "Get out of jail free" card
  - Automatic release after 3 turns
- **Free Parking**: No special effect (house rule variations exist)
- **Auctions**: If player declines to buy property, auction to all players

## Simplified Requirements for Implementation

### Single Browser Multiplayer
- Turn-based gameplay in same browser window
- Clear indication of current player
- Player state persistence during session

### No Physical Money
- All transactions as numbers
- Digital balance tracking
- Automatic calculations

### Essential Features to Implement
1. Board visualization with all 40 spaces
2. Player pieces and movement
3. Property ownership tracking
4. Rent collection system
5. House/hotel development
6. Card deck systems
7. Money management
8. Trading interface
9. Bankruptcy handling
10. Win condition detection

### Optional/Advanced Features
- Property auctions
- Complex mortgage system
- Advanced trading negotiations
- Game statistics
- Save/load game state