const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Import all required modules
const SocketManager = require('./server/managers/SocketManager');
const GameStateManager = require('./server/managers/GameStateManager');
const EventHandler = require('./server/managers/EventHandler');
const TurnManager = require('./server/managers/TurnManager');
const DiceManager = require('./server/managers/DiceManager');
const MovementManager = require('./server/managers/MovementManager');
const PropertyManager = require('./server/managers/PropertyManager');
const BuildingManager = require('./server/managers/BuildingManager');
const AuctionManager = require('./server/managers/AuctionManager');
const RentCalculator = require('./server/managers/RentCalculator');
const JailManager = require('./server/managers/JailManager');
const BankruptcyManager = require('./server/managers/BankruptcyManager');
const StateSynchronizer = require('./server/managers/StateSynchronizer');
const CardManager = require('./server/managers/CardManager');
const BoardConfig = require('./server/config/boardConfig');

// Initialize all managers
const socketManager = new SocketManager(server);
const eventHandler = new EventHandler();
const gameStateManager = new GameStateManager();
const turnManager = new TurnManager(gameStateManager.gameState);
const diceManager = new DiceManager();
const movementManager = new MovementManager(gameStateManager.gameState);
const propertyManager = new PropertyManager(gameStateManager.gameState, eventHandler);
const buildingManager = new BuildingManager(gameStateManager.gameState, eventHandler);
const auctionManager = new AuctionManager(gameStateManager.gameState, eventHandler);
const rentCalculator = new RentCalculator();
const jailManager = new JailManager(gameStateManager.gameState, eventHandler);
const bankruptcyManager = new BankruptcyManager(gameStateManager.gameState, eventHandler, propertyManager);
const stateSynchronizer = new StateSynchronizer(socketManager, gameStateManager.gameState);
const cardManager = new CardManager(gameStateManager.gameState, eventHandler);

// Initialize the game board
gameStateManager.gameState.board = BoardConfig.getBoardSpaces();

// Set up cross-references between managers
gameStateManager.setManagers({
    turnManager,
    diceManager,
    movementManager,
    propertyManager,
    buildingManager,
    auctionManager,
    rentCalculator,
    jailManager,
    bankruptcyManager,
    cardManager,
    stateSynchronizer
});

turnManager.setManagers({
    diceManager,
    movementManager,
    jailManager,
    eventHandler
});

movementManager.setManagers({
    gameStateManager,
    jailManager,
    eventHandler
});

propertyManager.setManagers({
    rentCalculator,
    eventHandler,
    buildingManager,
    auctionManager
});

buildingManager.setManagers({
    gameStateManager,
    eventHandler
});

auctionManager.setManagers({
    gameStateManager,
    eventHandler
});

// Set up socket manager with game state manager
socketManager.setGameStateManager(gameStateManager);
socketManager.setStateSynchronizer(stateSynchronizer);

// Initialize state synchronizer
stateSynchronizer.initialize();

// Set up event handler for game state updates
eventHandler.on('game_state_changed', (data) => {
    stateSynchronizer.broadcastDeltaUpdates(data.updates);
});

// Set up event handler for game events
eventHandler.on('game_event', (data) => {
    socketManager.emitGameEvent(data.gameId, data.eventType, data.eventData);
});

// Set up periodic cleanup
setInterval(() => {
    stateSynchronizer.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

// Start the server
server.listen(port, () => {
    console.log(`Monopoly game server running at http://localhost:${port}`);
    console.log('Game components initialized:');
    console.log('- Socket Manager: ✓');
    console.log('- Game State Manager: ✓');
    console.log('- Event Handler: ✓');
    console.log('- Turn Manager: ✓');
    console.log('- Dice Manager: ✓');
    console.log('- Movement Manager: ✓');
    console.log('- Property Manager: ✓');
    console.log('- Building Manager: ✓');
    console.log('- Auction Manager: ✓');
    console.log('- Rent Calculator: ✓');
    console.log('- Jail Manager: ✓');
    console.log('- Bankruptcy Manager: ✓');
    console.log('- State Synchronizer: ✓');
    console.log('- Card Manager: ✓');
    console.log('- Board Configuration: ✓');
    console.log('');
    console.log('Game is ready for players!');
});