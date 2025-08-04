# Technical Specification: Web-Based Monopoly

This document outlines the technical design for a simplified, single-player, web-based Monopoly game. All files for this project will be located in the `gemini` directory.

## 1. Game State Management

The entire state of the game will be managed within a single JavaScript object. This object will be the single source of truth and will be updated as the game progresses.

```javascript
const gameState = {
  players: [
    {
      id: 1,
      name: "Player 1",
      token: "car",
      money: 1500,
      position: 0, // Index on the board array
      properties: [], // Array of property IDs
      inJail: false,
      getOutOfJailFreeCards: 0,
      rollsInJail: 0
    },
    // ... more players
  ],
  properties: [
    {
      id: "mediterranean-avenue",
      name: "Mediterranean Avenue",
      price: 60,
      rent: [2, 10, 30, 90, 160, 250],
      houseCost: 50,
      hotelCost: 50,
      owner: null, // Player ID
      houses: 0, // 0-4
      hotel: false,
      group: "brown"
    },
    // ... all other properties
  ],
  board: [
    { type: "go", name: "Go" },
    { type: "property", id: "mediterranean-avenue" },
    { type: "community-chest", name: "Community Chest" },
    // ... all 40 board spaces
  ],
  currentPlayerIndex: 0,
  dice: [0, 0],
  gameLog: [], // Log of game events
  chanceCards: [ /* ... card definitions ... */ ],
  communityChestCards: [ /* ... card definitions ... */ ],
};
```

-   **`players`**: An array of player objects, each containing their current status.
-   **`properties`**: An array of objects representing each ownable property on the board.
-   **`board`**: An array representing the 40 spaces on the Monopoly board. Each space object will define its type (`go`, `property`, `chance`, `jail`, etc.).
-   **`currentPlayerIndex`**: The index of the active player in the `players` array.
-   **`dice`**: An array with two numbers representing the last dice roll.
-   **`gameLog`**: An array of strings to log major game events.

## 2. Game Flow

The game will proceed in turns, managed by a central game loop function.

1.  **Turn Start**:
    *   Identify the current player using `currentPlayerIndex`.
    *   Enable the "Roll Dice" button for the current player.

2.  **Roll Dice**:
    *   Player clicks "Roll Dice".
    *   Generate two random numbers between 1 and 6.
    *   Update `gameState.dice`.
    *   Check for doubles. If it's the third double, send the player to jail.

3.  **Move Player**:
    *   Calculate the new position: `(current_position + dice_roll_total) % 40`.
    *   Update the player's `position` in the `gameState`.
    *   If the player passes "Go", add $200 to their money.

4.  **Land on Space**:
    *   A function `handleLanding(player, space)` will be called.
    *   A `switch` statement on `space.type` will determine the action:
        *   **`property`**:
            *   If unowned: a "Buy" button and "Auction" button appear.
            *   If owned by another player: automatically pay rent.
            *   If owned by the current player: no action.
            *   If mortgaged: no rent is paid.
        *   **`chance` / `community-chest`**: Draw a card and execute its instructions.
        *   **`income-tax` / `luxury-tax`**: Deduct money from the player.
        *   **`go-to-jail`**: Move the player to the "Jail" space and set `inJail` to `true`.
        *   **`free-parking` / `jail-visiting` / `go`**: No special action on landing.

5.  **Player Actions**:
    *   After the primary action from landing, the player can:
        *   Manage properties (buy/sell houses, mortgage).
        *   Trade with other players (a simplified implementation).
    *   These actions will be available through buttons in the UI.

6.  **End Turn**:
    *   Player clicks "End Turn".
    *   `currentPlayerIndex` is incremented (`(currentPlayerIndex + 1) % players.length`).
    *   The game loop restarts for the next player.

## 3. UI Components

The UI will be built with HTML and styled with CSS. JavaScript will be used to manipulate the DOM based on the `gameState`.

*   **`#game-board`**: A CSS Grid layout will be used to create the 40 spaces of the board. Player tokens will be `div` elements moved by updating their `grid-area` style.
*   **`#player-info`**: A panel displaying information for all players.
    *   Each player gets a card showing their name, money, and a list of properties owned.
    *   The current player's card will be highlighted.
*   **`#property-viewer`**: When a property space is clicked on the board, this component will display the full property card details (name, rent, house costs, etc.).
*   **`#action-panel`**:
    *   Contains the primary action buttons: "Roll Dice", "End Turn".
    *   Contextual buttons will appear here, such as "Buy Property", "Pay to get out of Jail", etc.
*   **`#game-log`**: A scrolling text area that displays messages from the `gameLog`.
*   **Modals**: Pop-up windows for Chance/Community Chest cards, trade offers, and auction sequences.

## 4. File Structure

All files will be located within the `gemini/` directory.

```
gemini/
├── index.html         # The main HTML file
├── css/
│   └── style.css      # All CSS styles
└── js/
    ├── main.js        # Main game logic, game loop
    ├── state.js       # Game state object definition
    └── ui.js          # Functions for updating the UI
```

*   **`index.html`**: The single page for the application. It will contain the basic HTML structure for all UI components.
*   **`css/style.css`**: Contains all styling for the board, panels, cards, and buttons.
*   **`js/state.js`**: Initializes and exports the `gameState` object. Will contain the raw data for properties, cards, etc.
*   **`js/main.js`**: Handles the core game flow, turn management, and user interactions. It will import `gameState` and functions from `ui.js`.
*   **`js/ui.js`**: Contains all functions that directly manipulate the DOM. For example, `renderBoard()`, `updatePlayerInfo()`, `showModal()`. This separates game logic from presentation.