// Main entry point for Monopoly Game

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize board manager
    const boardManager = new BoardManager();
    boardManager.init();
    
    // Create and initialize property manager
    const propertyManager = new PropertyManager();
    
    // Create and initialize player manager
    const playerManager = new PlayerManager();
    
    // Create and initialize card manager
    const cardManager = new CardManager();
    
    // Create and initialize game state manager
    const gameStateManager = new GameStateManager();
    
    // Check if there's a saved game
    let gameLoaded = false;
    if (gameStateManager.hasSavedGame()) {
        if (confirm("Would you like to continue your saved game?")) {
            if (gameStateManager.loadGameState()) {
                // Load game state into managers
                const gameState = gameStateManager.getGameState();
                
                // Initialize players from saved state
                playerManager.players = gameState.players.map(playerData => {
                    const player = new Player(playerData.id, playerData.name, playerData.balance);
                    player.position = playerData.position;
                    player.properties = [...playerData.properties];
                    player.inJail = playerData.inJail;
                    player.jailTurns = playerData.jailTurns;
                    player.getOutOfJailFreeCards = playerData.getOutOfJailFreeCards;
                    player.bankrupt = playerData.bankrupt;
                    return player;
                });
                playerManager.currentPlayerIndex = gameState.currentPlayerIndex;
                playerManager.gameState = gameState.gameState;
                
                // Initialize properties from saved state
                propertyManager.properties.clear();
                gameState.properties.forEach(propData => {
                    propertyManager.properties.set(propData.id, new Property(propData));
                });
                
                gameLoaded = true;
            }
        } else {
            gameStateManager.clearGameState();
        }
    }
    
    // If no saved game or user chose not to load, initialize new game
    if (!gameLoaded) {
        // Initialize players
        const playerData = [
            { name: "Player 1", startingBalance: 1500 },
            { name: "Player 2", startingBalance: 1500 }
        ];
        
        // Initialize game state manager
        gameStateManager.initializeGame(
            playerData,
            boardData,
            propertyData,
            chanceCards,
            communityChestCards
        );
        
        // Initialize player manager
        playerManager.initializePlayers(playerData);
    }
    
    // Update player panels with initial information
    updatePlayerPanels(playerManager);
    
    // Render initial player tokens and property ownership
    boardManager.updateAllPropertyOwnerships(propertyManager, playerManager);
    
    // Track if player has rolled this turn
    let hasRolled = false;
    
    // Add event listener for roll dice button
    const rollButton = document.getElementById('roll-dice');
    if (rollButton) {
        rollButton.addEventListener('click', () => {
            // Get current player
            const currentPlayer = playerManager.getCurrentPlayer();
            if (!currentPlayer || currentPlayer.bankrupt) {
                document.getElementById('game-message').textContent =
                    "No active player or player is bankrupt!";
                addToGameLog("No active player or player is bankrupt!");
                return;
            }
            
            // Check if player has already rolled this turn
            if (hasRolled) {
                document.getElementById('game-message').textContent =
                    "You have already rolled this turn!";
                addToGameLog("Player tried to roll again this turn");
                return;
            }
            
            // Add rolling animation to dice
            const dice1Element = document.getElementById('dice1');
            const dice2Element = document.getElementById('dice2');
            dice1Element.classList.add('rolling');
            dice2Element.classList.add('rolling');
            
            // Disable roll button during animation
            rollButton.disabled = true;
            
            // Simulate dice rolling animation
            let rolls = 0;
            const maxRolls = 10;
            const rollInterval = setInterval(() => {
                const tempDice1 = Math.floor(Math.random() * 6) + 1;
                const tempDice2 = Math.floor(Math.random() * 6) + 1;
                dice1Element.textContent = tempDice1;
                dice2Element.textContent = tempDice2;
                rolls++;
                
                if (rolls >= maxRolls) {
                    clearInterval(rollInterval);
                    dice1Element.classList.remove('rolling');
                    dice2Element.classList.remove('rolling');
                    
                    // Set hasRolled flag
                    hasRolled = true;
                    
                    // Check if player is in jail
                    if (currentPlayer.inJail) {
                        // Try to get out of jail
                        const dice1 = Math.floor(Math.random() * 6) + 1;
                        const dice2 = Math.floor(Math.random() * 6) + 1;
                        const isDoubles = dice1 === dice2;
                        
                        // Update dice display
                        dice1Element.textContent = dice1;
                        dice2Element.textContent = dice2;
                        
                        // Try to get out of jail by rolling doubles
                        if (isDoubles) {
                            currentPlayer.inJail = false;
                            currentPlayer.jailTurns = 0;
                            const message = `${currentPlayer.name} rolled doubles and got out of jail!`;
                            document.getElementById('game-message').textContent = message;
                            addToGameLog(message);
                            
                            // Update game state
                            gameStateManager.updatePlayer(currentPlayer.id, {
                                inJail: false,
                                jailTurns: 0
                            });
                        } else {
                            // Try to get out of jail by other means
                            if (currentPlayer.attemptToLeaveJail()) {
                                const message = `${currentPlayer.name} paid to get out of jail!`;
                                document.getElementById('game-message').textContent = message;
                                addToGameLog(message);
                                
                                // Update game state
                                gameStateManager.updatePlayer(currentPlayer.id, {
                                    inJail: false,
                                    jailTurns: 0,
                                    getOutOfJailFreeCards: currentPlayer.getOutOfJailFreeCards,
                                    balance: currentPlayer.balance
                                });
                            } else {
                                const message = `${currentPlayer.name} is still in jail.`;
                                document.getElementById('game-message').textContent = message;
                                addToGameLog(message);
                                // Update player panels to show jail status
                                updatePlayerPanels(playerManager);
                                rollButton.disabled = false;
                                return;
                            }
                        }
                        
                        // If player got out of jail, they can move normally
                        if (!currentPlayer.inJail) {
                            // Move player
                            const oldPosition = currentPlayer.position;
                            currentPlayer.move(dice1 + dice2);
                            const newPosition = currentPlayer.position;
                            
                            // Handle space interaction
                            handleSpaceInteraction(currentPlayer, newPosition, dice1 + dice2, propertyManager, playerManager, boardManager);
                            
                            // Update game message
                            const message = `${currentPlayer.name} rolled ${dice1} and ${dice2} and moved to ${newPosition}!`;
                            document.getElementById('game-message').textContent = message;
                            addToGameLog(message);
                            
                            // Update player token position
                            boardManager.movePlayerToken(oldPosition, newPosition, currentPlayer.id);
                            
                            // Update player panels
                            updatePlayerPanels(playerManager);
                            
                            // Update game state
                            gameStateManager.updatePlayer(currentPlayer.id, {
                                position: currentPlayer.position,
                                balance: currentPlayer.balance,
                                properties: [...currentPlayer.properties]
                            });
                        }
                    } else {
                        // Normal dice rolling for players not in jail
                        // Roll dice
                        const dice1 = Math.floor(Math.random() * 6) + 1;
                        const dice2 = Math.floor(Math.random() * 6) + 1;
                        const total = dice1 + dice2;
                        
                        // Update dice display
                        dice1Element.textContent = dice1;
                        dice2Element.textContent = dice2;
                        
                        // Move player
                        const oldPosition = currentPlayer.position;
                        currentPlayer.move(total);
                        const newPosition = currentPlayer.position;
                        
                        // Handle property interaction
                        handleSpaceInteraction(currentPlayer, newPosition, dice1 + dice2, propertyManager, playerManager, boardManager);
                        
                        // Update game message
                        const message = `${currentPlayer.name} rolled ${dice1} and ${dice2} and moved to ${newPosition}!`;
                        document.getElementById('game-message').textContent = message;
                        addToGameLog(message);
                        
                        // Update player token position
                        boardManager.movePlayerToken(oldPosition, newPosition, currentPlayer.id);
                        
                        // Update player panels
                        updatePlayerPanels(playerManager);
                        
                        // Update game state
                        gameStateManager.updatePlayer(currentPlayer.id, {
                            position: currentPlayer.position,
                            balance: currentPlayer.balance,
                            properties: [...currentPlayer.properties]
                        });
                    }
                    
                    // Check win condition
                    if (gameStateManager.checkWinCondition()) {
                        const winner = gameStateManager.getWinner();
                        if (winner) {
                            const message = `Game Over! ${winner.name} wins the game!`;
                            document.getElementById('game-message').textContent = message;
                            addToGameLog(message);
                            rollButton.disabled = true;
                            endTurnButton.disabled = true;
                            gameStateManager.endGame();
                        }
                        return;
                    }
                }
            }, 100);
        });
    }
    
    // Add event listener for end turn button
    const endTurnButton = document.getElementById('end-turn');
    if (endTurnButton) {
        endTurnButton.addEventListener('click', () => {
            // Move to next player's turn
            const previousPlayer = playerManager.getCurrentPlayer();
            const nextPlayer = playerManager.nextTurn();
            
            if (nextPlayer) {
                // Reset hasRolled flag for new player
                hasRolled = false;
                
                // Update game message
                const message = `It's now ${nextPlayer.name}'s turn!`;
                document.getElementById('game-message').textContent = message;
                addToGameLog(message);
                
                // Update player panels
                updatePlayerPanels(playerManager);
                
                // Re-render player tokens and property ownership
                boardManager.updateAllPropertyOwnerships(propertyManager, playerManager);
                
                // Update game state
                gameStateManager.updateGameState({
                    currentPlayerIndex: playerManager.currentPlayerIndex,
                    turnCount: gameStateManager.gameState.turnCount + 1
                });
                gameStateManager.incrementTurn();
                
                // Re-enable roll button for new player
                if (rollButton) {
                    rollButton.disabled = false;
                }
            } else {
                // Game over
                const message = "Game Over!";
                document.getElementById('game-message').textContent = message;
                addToGameLog(message);
                rollButton.disabled = true;
                endTurnButton.disabled = true;
                gameStateManager.endGame();
            }
        });
    }
    
    // Add event listener for pause button
    const pauseButton = document.getElementById('pause-game');
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (gameStateManager.pauseGame()) {
                pauseButton.textContent = 'Resume Game';
                rollButton.disabled = true;
                endTurnButton.disabled = true;
                document.getElementById('game-message').textContent = "Game paused";
                addToGameLog("Game paused");
            } else if (gameStateManager.resumeGame()) {
                pauseButton.textContent = 'Pause Game';
                rollButton.disabled = false;
                endTurnButton.disabled = false;
                document.getElementById('game-message').textContent = "Game resumed";
                addToGameLog("Game resumed");
            }
        });
    }
    
    // Add event listener for new game button
    const newGameButton = document.getElementById('new-game');
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to start a new game? This will erase the current game.")) {
                gameStateManager.clearGameState();
                hasRolled = false; // Reset hasRolled flag
                location.reload();
            }
        });
    }
    
    // Handle space interaction
        function handleSpaceInteraction(player, position, diceRoll, propertyManager, playerManager, boardManager) {
            // Get the space at this position
            const space = boardManager.getSpaceByPosition(position);
            if (!space) return;
            
            // Handle different space types
            switch (space.type) {
                case "property":
                case "railroad":
                case "utility":
                    handlePropertySpace(player, position, diceRoll, propertyManager, playerManager, boardManager, space);
                    break;
                    
                case "tax":
                    handleTaxSpace(player, space);
                    break;
                    
                case "corner":
                    handleCornerSpace(player, space, playerManager, boardManager);
                    break;
                    
                case "card":
                    handleCardSpace(player, space, diceRoll);
                    break;
                    
                default:
                    // Do nothing for other space types
                    break;
            }
            
            // Update player panels to reflect any balance changes
            updatePlayerPanels(playerManager);
        }
        
    // Handle property, railroad, and utility spaces
        function handlePropertySpace(player, position, diceRoll, propertyManager, playerManager, boardManager, space) {
            // Get the property at this position
            const property = propertyManager.getProperty(position);
            if (!property) return;
            
            // If property is owned by another player, calculate rent
            if (property.owner !== null && property.owner !== player.id) {
                const rent = propertyManager.calculateRent(position, player.id, diceRoll);
                const owner = playerManager.getPlayerById(property.owner);
                
                if (owner && player.deductMoney(rent)) {
                    owner.addMoney(rent);
                    const message = `Player ${player.name} paid $${rent} rent to ${owner.name}.`;
                    document.getElementById('game-message').textContent += ` ${message}`;
                    addToGameLog(message);
                    
                    // Update statistics
                    gameStateManager.updateStatistics({
                        rentPaid: gameStateManager.gameState.statistics.rentPaid + rent
                    });
                    
                    // Update game state
                    gameStateManager.updatePlayer(player.id, {
                        balance: player.balance
                    });
                    gameStateManager.updatePlayer(owner.id, {
                        balance: owner.balance
                    });
                } else {
                    // Player can't afford rent - may need to sell/mortgage properties or declare bankruptcy
                    const message = `Player ${player.name} can't afford rent!`;
                    document.getElementById('game-message').textContent += ` ${message}`;
                    addToGameLog(message);
                    
                    // Handle bankruptcy
                    gameStateManager.handleBankruptcy(player.id);
                    player.declareBankruptcy();
                    
                    // Update game state
                    gameStateManager.updatePlayer(player.id, {
                        bankrupt: true,
                        properties: []
                    });
                    
                    // Return all properties to the bank
                    propertyManager.getAllProperties().forEach(prop => {
                        if (prop.owner === player.id) {
                            prop.owner = null;
                            prop.mortgaged = false;
                            if (prop.type === 'property') {
                                prop.houses = 0;
                                prop.hasHotel = false;
                            }
                            gameStateManager.updateProperty(prop.id, {
                                owner: null,
                                mortgaged: false,
                                houses: prop.type === 'property' ? 0 : undefined,
                                hasHotel: prop.type === 'property' ? false : undefined
                            });
                        }
                    });
                }
            }
            // If property is unowned and player can afford it, give option to buy
            else if (property.owner === null && player.balance >= property.price) {
                // Ask player if they want to buy the property
                const buyProperty = confirm(`${player.name}, do you want to buy ${property.name} for $${property.price}?`);
                
                if (buyProperty) {
                    if (propertyManager.buyProperty(position, player.id)) {
                        player.buyProperty(position, property.price);
                        boardManager.updatePropertyOwnership(position, player.id);
                        const message = `Player ${player.name} bought ${property.name} for $${property.price}.`;
                        document.getElementById('game-message').textContent += ` ${message}`;
                        addToGameLog(message);
                        
                        // Update statistics
                        gameStateManager.updateStatistics({
                            propertiesBought: gameStateManager.gameState.statistics.propertiesBought + 1
                        });
                        
                        // Update game state
                        gameStateManager.updatePlayer(player.id, {
                            balance: player.balance,
                            properties: [...player.properties]
                        });
                        gameStateManager.updateProperty(property.id, {
                            owner: player.id
                        });
                    }
                } else {
                    const message = `Player ${player.name} chose not to buy ${property.name}.`;
                    document.getElementById('game-message').textContent += ` ${message}`;
                    addToGameLog(message);
                }
            }
        }
        
    // Handle tax spaces
        function handleTaxSpace(player, space) {
            if (player.deductMoney(space.taxAmount)) {
                const message = `Player ${player.name} paid $${space.taxAmount} ${space.name}.`;
                document.getElementById('game-message').textContent += ` ${message}`;
                addToGameLog(message);
                
                // Update game state
                gameStateManager.updatePlayer(player.id, {
                    balance: player.balance
                });
            } else {
                // Player can't afford tax - may need to sell/mortgage properties or declare bankruptcy
                const message = `Player ${player.name} can't afford ${space.name}!`;
                document.getElementById('game-message').textContent += ` ${message}`;
                addToGameLog(message);
                
                // Handle bankruptcy
                gameStateManager.handleBankruptcy(player.id);
                player.declareBankruptcy();
                
                // Update game state
                gameStateManager.updatePlayer(player.id, {
                    bankrupt: true,
                    properties: []
                });
                
                // Return all properties to the bank
                propertyManager.getAllProperties().forEach(prop => {
                    if (prop.owner === player.id) {
                        prop.owner = null;
                        prop.mortgaged = false;
                        if (prop.type === 'property') {
                            prop.houses = 0;
                            prop.hasHotel = false;
                        }
                        gameStateManager.updateProperty(prop.id, {
                            owner: null,
                            mortgaged: false,
                            houses: prop.type === 'property' ? 0 : undefined,
                            hasHotel: prop.type === 'property' ? false : undefined
                        });
                    }
                });
            }
        }
        
    // Handle corner spaces
        function handleCornerSpace(player, space, playerManager, boardManager) {
            // Handle GO TO JAIL specifically
            if (space.position === 30) { // GO TO JAIL position
                player.goToJail();
                boardManager.movePlayerToken(player.position, 10, player.id); // Move token to JAIL
                const message = `Player ${player.name} was sent to JAIL!`;
                document.getElementById('game-message').textContent += ` ${message}`;
                addToGameLog(message);
                
                // Update game state
                gameStateManager.updatePlayer(player.id, {
                    inJail: true,
                    position: 10
                });
            }
            // For other corner spaces (GO, JAIL, FREE PARKING), no special action needed
        }
        
    // Handle card spaces (Chance and Community Chest)
        function handleCardSpace(player, space, diceRoll) {
            let card;
            let cardType;
            
            // Draw appropriate card based on space name
            if (space.name === "Chance") {
                card = cardManager.drawChanceCard();
                cardType = "Chance";
            } else if (space.name === "Community Chest") {
                card = cardManager.drawCommunityChestCard();
                cardType = "Community Chest";
            } else {
                const message = `Player ${player.name} landed on ${space.name}. Unknown card space.`;
                document.getElementById('game-message').textContent += ` ${message}`;
                addToGameLog(message);
                return;
            }
            
            // Display card text
            const cardMessage = `Player ${player.name} drew a ${cardType} card: ${card.text}`;
            document.getElementById('game-message').textContent += ` ${cardMessage}`;
            addToGameLog(cardMessage);
            
            // Execute card action with the dice roll value
            const result = cardManager.executeCard(card, player, playerManager, boardManager, diceRoll);
            document.getElementById('game-message').textContent += ` ${result}`;
            addToGameLog(result);
            
            // If player was moved, update their token position
            // This is a simplified check - in a full implementation, we'd track position changes
            // For now, we'll just update the token position to the player's current position
            boardManager.movePlayerToken(player.position, player.position, player.id);
            
            // Update game state
            gameStateManager.updatePlayer(player.id, {
                position: player.position,
                balance: player.balance,
                getOutOfJailFreeCards: player.getOutOfJailFreeCards,
                inJail: player.inJail
            });
        }
    
    // Function to update player panels
    function updatePlayerPanels(playerManager) {
        const players = playerManager.getAllPlayers();
        const currentPlayer = playerManager.getCurrentPlayer();
        
        // Update each player panel
        for (let i = 0; i < players.length && i < 2; i++) {
            const player = players[i];
            const panel = document.querySelectorAll('.player-panel')[i];
            
            if (panel) {
                // Update player name
                const nameElement = panel.querySelector('h2');
                if (nameElement) {
                    nameElement.textContent = player.name;
                }
                
                // Update player info and styling
                playerManager.updatePlayerPanel(player, panel);
                
                // Add/remove current player class
                if (player === currentPlayer) {
                    panel.classList.add('current-player');
                } else {
                    panel.classList.remove('current-player');
                }
                
                // Update additional player info
                const jailStatusElement = panel.querySelector('.jail-status');
                const getOutCardsElement = panel.querySelector('.get-out-cards');
                
                if (jailStatusElement) {
                    jailStatusElement.textContent = player.inJail ?
                        `Jail: In jail (${3 - player.jailTurns} turns)` :
                        "Jail: Not in jail";
                }
                
                if (getOutCardsElement) {
                    getOutCardsElement.textContent = `Get Out of Jail Cards: ${player.getOutOfJailFreeCards}`;
                }
            }
        }
        
        // Update current player display
        const currentPlayerElement = document.getElementById('current-player');
        if (currentPlayerElement && currentPlayer) {
            currentPlayerElement.textContent = `${currentPlayer.name}'s Turn`;
        }
        
        // Update statistics display
        const statsElement = document.getElementById('game-stats');
        if (statsElement) {
            const stats = gameStateManager.gameState.statistics;
            statsElement.innerHTML = `
                <div>Turns: ${stats.totalTurns}</div>
                <div>Properties Bought: ${stats.propertiesBought}</div>
                <div>Rent Paid: $${stats.rentPaid}</div>
                <div>Bankruptcies: ${stats.bankruptcies}</div>
            `;
        }
    }
    
    // Function to add entries to the game log
    function addToGameLog(message) {
        const gameLog = document.getElementById('game-log');
        if (gameLog) {
            const logEntry = document.createElement('div');
            logEntry.className = 'game-log-entry';
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            gameLog.appendChild(logEntry);
            
            // Scroll to bottom of log
            gameLog.scrollTop = gameLog.scrollHeight;
        }
    }
});