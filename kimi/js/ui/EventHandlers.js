/**
 * Enhanced Event Handlers
 * Centralized event handling for all game interactions
 */

export class EventHandlers {
    constructor(components) {
        this.gameEngine = components.gameEngine;
        this.boardRenderer = components.boardRenderer;
        this.playerRenderer = components.playerRenderer;
        this.modalManager = components.modalManager;
        this.stateManager = components.stateManager;
        this.jailUI = components.jailUI;
        
        this.isInitialized = false;
        this.eventListeners = new Map();
    }

    async init() {
        this.setupGlobalEventListeners();
        this.setupBoardEventListeners();
        this.setupPlayerEventListeners();
        this.setupDiceEventListeners();
        this.setupGameActionListeners();
        this.setupContextMenuListeners();
        this.setupKeyboardShortcuts();
        
        this.isInitialized = true;
        console.log('✅ Enhanced Event Handlers initialized');
    }

    setupGlobalEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Document events
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        
        // Custom game events
        document.addEventListener('game:start', this.handleGameStart.bind(this));
        document.addEventListener('game:end', this.handleGameEnd.bind(this));
        document.addEventListener('game:save', this.handleGameSave.bind(this));
        document.addEventListener('game:load', this.handleGameLoad.bind(this));
    }

    setupBoardEventListeners() {
        // Square interactions
        document.addEventListener('square:click', this.handleSquareClick.bind(this));
        document.addEventListener('square:hover', this.handleSquareHover.bind(this));
        document.addEventListener('square:leave', this.handleSquareLeave.bind(this));
        
        // Property interactions
        document.addEventListener('property:buy', this.handlePropertyBuy.bind(this));
        document.addEventListener('property:auction', this.handlePropertyAuction.bind(this));
        document.addEventListener('property:mortgage', this.handlePropertyMortgage.bind(this));
        document.addEventListener('property:unmortgage', this.handlePropertyUnmortgage.bind(this));
        
        // Building interactions
        document.addEventListener('building:buy', this.handleBuildingBuy.bind(this));
        document.addEventListener('building:sell', this.handleBuildingSell.bind(this));
    }

    setupPlayerEventListeners() {
        // Player interactions
        document.addEventListener('player:turn', this.handlePlayerTurn.bind(this));
        document.addEventListener('player:move', this.handlePlayerMove.bind(this));
        document.addEventListener('player:bankrupt', this.handlePlayerBankrupt.bind(this));
        document.addEventListener('player:jail', this.handlePlayerJail.bind(this));
        document.addEventListener('player:free', this.handlePlayerFree.bind(this));
        
        // Money transactions
        document.addEventListener('money:receive', this.handleMoneyReceive.bind(this));
        document.addEventListener('money:pay', this.handleMoneyPay.bind(this));
    }

    setupDiceEventListeners() {
        // Dice interactions
        document.getElementById('roll-dice-btn')?.addEventListener('click', this.handleRollDice.bind(this));
        document.getElementById('roll-dice-btn-main')?.addEventListener('click', this.handleRollDice.bind(this));
        
        // Dice events
        document.addEventListener('dice:roll', this.handleDiceRoll.bind(this));
        document.addEventListener('dice:doubles', this.handleDiceDoubles.bind(this));
    }

    setupGameActionListeners() {
        // Game control buttons
        document.getElementById('new-game-btn')?.addEventListener('click', this.handleNewGame.bind(this));
        document.getElementById('save-game-btn')?.addEventListener('click', this.handleSaveGame.bind(this));
        document.getElementById('load-game-btn')?.addEventListener('click', this.handleLoadGame.bind(this));
        document.getElementById('settings-btn')?.addEventListener('click', this.handleSettings.bind(this));
        document.getElementById('rules-btn')?.addEventListener('click', this.handleRules.bind(this));
        
        // Turn actions
        document.getElementById('end-turn-btn')?.addEventListener('click', this.handleEndTurn.bind(this));
        document.getElementById('buy-property-btn')?.addEventListener('click', this.handleBuyProperty.bind(this));
        document.getElementById('auction-property-btn')?.addEventListener('click', this.handleAuctionProperty.bind(this));
        document.getElementById('pay-rent-btn')?.addEventListener('click', this.handlePayRent.bind(this));
        document.getElementById('get-out-of-jail-btn')?.addEventListener('click', this.handleGetOutOfJail.bind(this));
        
        // Quick actions
        document.getElementById('mortgage-btn')?.addEventListener('click', this.handleMortgage.bind(this));
        document.getElementById('build-btn')?.addEventListener('click', this.handleBuild.bind(this));
        document.getElementById('trade-btn')?.addEventListener('click', this.handleTrade.bind(this));
        document.getElementById('bankrupt-btn')?.addEventListener('click', this.handleBankrupt.bind(this));
        
        // Log controls
        document.getElementById('clear-log-btn')?.addEventListener('click', this.handleClearLog.bind(this));
        document.getElementById('export-log-btn')?.addEventListener('click', this.handleExportLog.bind(this));
    }

    setupContextMenuListeners() {
        // Context menu events
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('click', this.handleContextMenuClose.bind(this));
        
        // Property context menu
        document.addEventListener('property:context', this.handlePropertyContext.bind(this));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.handleSaveGame();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.handleLoadGame();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.handleNewGame();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.handleRollDice();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.handleEndTurn();
                        break;
                }
            }
            
            // Single key shortcuts
            switch (e.key) {
                case 'Escape':
                    this.handleEscape();
                    break;
                case ' ':
                    e.preventDefault();
                    this.handleSpace();
                    break;
                case '?':
                    this.handleHelp();
                    break;
            }
        });
    }

    // Event Handlers
    async handleSquareClick(event) {
        const { square, position } = event.detail;
        
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            if (!currentPlayer) return;
            
            // Show property details if it's a property
            if (square.type === 'property') {
                await this.modalManager.showPropertyDetails(square, position, currentPlayer);
            } else if (square.type === 'chance' || square.type === 'community-chest') {
                await this.modalManager.showCardDetails(square);
            } else if (square.type === 'railroad' || square.type === 'utility') {
                await this.modalManager.showSpecialPropertyDetails(square, position);
            }
            
            this.logAction(`${currentPlayer.name} viewed ${square.name}`);
        } catch (error) {
            console.error('Error handling square click:', error);
            this.showError('Failed to show property details');
        }
    }

    async handleSquareHover(event) {
        const { square, position } = event.detail;
        
        // Add hover effect
        const squareElement = document.querySelector(`[data-position="${position}"]`);
        if (squareElement) {
            squareElement.classList.add('hover');
        }
        
        // Show tooltip
        this.showTooltip(square, position);
    }

    handleSquareLeave(event) {
        const { position } = event.detail;
        
        // Remove hover effect
        const squareElement = document.querySelector(`[data-position="${position}"]`);
        if (squareElement) {
            squareElement.classList.remove('hover');
        }
        
        // Hide tooltip
        this.hideTooltip();
    }

    async handleRollDice() {
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            if (!currentPlayer || currentPlayer.isBankrupt) {
                return;
            }
            
            // Disable roll button
            this.setButtonEnabled('roll-dice-btn', false);
            this.setButtonEnabled('roll-dice-btn-main', false);
            
            // Roll dice
            const result = await this.gameEngine.rollDice();
            
            // Update UI
            this.updateDiceDisplay(result.values, result.isDouble);
            
            // Move player
            await this.gameEngine.movePlayer(currentPlayer, result.total);
            
            // Handle landing
            await this.handleLanding(currentPlayer);
            
            // Check for doubles
            if (result.isDouble && !currentPlayer.inJail) {
                this.handleDoubles(currentPlayer);
            } else {
                this.setButtonEnabled('end-turn-btn', true);
            }
            
            this.logAction(`${currentPlayer.name} rolled ${result.values[0]} + ${result.values[1]} = ${result.total}${result.isDouble ? ' (DOUBLES!)' : ''}`);
            
        } catch (error) {
            console.error('Error rolling dice:', error);
            this.showError('Failed to roll dice');
            
            // Re-enable buttons
            this.setButtonEnabled('roll-dice-btn', true);
            this.setButtonEnabled('roll-dice-btn-main', true);
        }
    }

    async handleLanding(player) {
        try {
            const square = this.gameEngine.getSquare(player.position);
            const result = await this.gameEngine.handleLanding(player, square);
            
            if (result.requiresAction) {
                this.showActionButtons(result.actions);
            }
            
            this.updateUI();
            
        } catch (error) {
            console.error('Error handling landing:', error);
            this.showError('Failed to handle landing');
        }
    }

    async handleEndTurn() {
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            if (!currentPlayer) return;
            
            // Hide action buttons
            this.hideActionButtons();
            
            // End turn
            await this.gameEngine.endTurn();
            
            // Update UI
            this.updateUI();
            
            // Enable roll button for next player
            this.setButtonEnabled('roll-dice-btn', true);
            this.setButtonEnabled('roll-dice-btn-main', true);
            this.setButtonEnabled('end-turn-btn', false);
            
            this.logAction(`${currentPlayer.name} ended their turn`);
            
        } catch (error) {
            console.error('Error ending turn:', error);
            this.showError('Failed to end turn');
        }
    }

    async handleBuyProperty() {
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            const square = this.gameEngine.getSquare(currentPlayer.position);
            
            if (square.type === 'property' || square.type === 'railroad' || square.type === 'utility') {
                const success = await this.gameEngine.buyProperty(currentPlayer, square);
                
                if (success) {
                    this.showSuccess(`Successfully bought ${square.name} for $${square.data.price}`);
                    this.hideActionButtons();
                    this.updateUI();
                } else {
                    this.showError('Failed to buy property');
                }
            }
        } catch (error) {
            console.error('Error buying property:', error);
            this.showError('Failed to buy property');
        }
    }

    async handlePayRent() {
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            const result = await this.gameEngine.payRent(currentPlayer);
            
            if (result.success) {
                this.showSuccess(`Paid $${result.amount} rent to ${result.owner}`);
                this.hideActionButtons();
                this.updateUI();
            } else {
                this.showError('Failed to pay rent');
            }
        } catch (error) {
            console.error('Error paying rent:', error);
            this.showError('Failed to pay rent');
        }
    }

    async handleGetOutOfJail() {
        try {
            const currentPlayer = this.gameEngine.getCurrentPlayer();
            const result = await this.gameEngine.getOutOfJail(currentPlayer);
            
            if (result.success) {
                this.showSuccess('Got out of jail!');
                this.hideActionButtons();
                this.updateUI();
            } else {
                this.showError('Failed to get out of jail');
            }
        } catch (error) {
            console.error('Error getting out of jail:', error);
            this.showError('Failed to get out of jail');
        }
    }

    async handleNewGame() {
        try {
            const confirmed = await this.modalManager.showConfirm({
                title: 'New Game',
                message: 'Are you sure you want to start a new game? Current progress will be lost.',
                confirmText: 'Start New Game',
                cancelText: 'Cancel'
            });
            
            if (confirmed) {
                const config = await this.modalManager.showGameSetup();
                if (config) {
                    await this.gameEngine.startNewGame(config);
                    this.resetUI();
                    this.showSuccess('New game started!');
                }
            }
        } catch (error) {
            console.error('Error starting new game:', error);
            this.showError('Failed to start new game');
        }
    }

    async handleSaveGame() {
        try {
            await this.stateManager.saveGame();
            this.showSuccess('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            this.showError('Failed to save game');
        }
    }

    async handleLoadGame() {
        try {
            const hasSavedGame = await this.stateManager.hasSavedGame();
            if (!hasSavedGame) {
                this.showError('No saved game found');
                return;
            }
            
            const confirmed = await this.modalManager.showConfirm({
                title: 'Load Game',
                message: 'Are you sure you want to load a saved game? Current progress will be lost.',
                confirmText: 'Load Game',
                cancelText: 'Cancel'
            });
            
            if (confirmed) {
                await this.stateManager.loadGame();
                this.updateUI();
                this.showSuccess('Game loaded successfully!');
            }
        } catch (error) {
            console.error('Error loading game:', error);
            this.showError('Failed to load game');
        }
    }

    // Utility Methods
    updateUI() {
        // Update all UI components
        const gameState = this.gameEngine.getGameState();
        if (!gameState) return;
        
        // Update board
        this.boardRenderer.renderBoard(gameState.board);
        this.boardRenderer.updatePlayerTokens(gameState.players);
        
        // Update players
        this.playerRenderer.renderPlayers(gameState.players, gameState.currentPlayerIndex);
        
        // Update game stats
        this.updateGameStats(gameState);
        
        // Update current player display
        this.updateCurrentPlayerDisplay(gameState);
    }

    updateGameStats(gameState) {
        const stats = {
            round: gameState.round,
            turn: gameState.turn,
            properties: this.getTotalProperties(gameState.players),
            doubles: gameState.doublesCount || 0,
            jail: gameState.jailVisits || 0
        };
        
        // Update stat displays
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(`stat-${key}`);
            if (element) element.textContent = value;
        });
    }

    updateCurrentPlayerDisplay(gameState) {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer) return;
        
        // Update round and turn
        const roundElement = document.getElementById('game-round');
        const turnElement = document.getElementById('game-turn');
        
        if (roundElement) roundElement.textContent = `Round ${gameState.round}`;
        if (turnElement) turnElement.textContent = `Turn ${gameState.turn}`;
    }

    showActionButtons(actions) {
        // Hide all action buttons first
        this.hideActionButtons();
        
        // Show relevant buttons
        actions.forEach(action => {
            const button = document.getElementById(`${action}-btn`);
            if (button) {
                button.style.display = 'block';
            }
        });
    }

    hideActionButtons() {
        const actionButtons = [
            'buy-property-btn',
            'auction-property-btn',
            'pay-rent-btn',
            'get-out-of-jail-btn'
        ];
        
        actionButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.style.display = 'none';
        });
    }

    setButtonEnabled(buttonId, enabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
        }
    }

    showTooltip(square, position) {
        // Implementation for showing tooltips
        const tooltip = document.createElement('div');
        tooltip.className = 'property-tooltip';
        tooltip.innerHTML = `
            <h4>${square.name}</h4>
            <p>Type: ${square.type}</p>
            ${square.data?.price ? `<p>Price: $${square.data.price}</p>` : ''}
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = document.querySelector(`[data-position="${position}"]`)?.getBoundingClientRect();
        if (rect) {
            tooltip.style.left = `${rect.right + 10}px`;
            tooltip.style.top = `${rect.top}px`;
        }
        
        setTimeout(() => tooltip.remove(), 3000);
    }

    hideTooltip() {
        const tooltips = document.querySelectorAll('.property-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    logAction(message) {
        const logEntries = document.getElementById('log-entries');
        if (!logEntries) return;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const time = new Date().toLocaleTimeString();
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;
        
        logEntries.appendChild(entry);
        logEntries.scrollTop = logEntries.scrollHeight;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            notificationArea.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Context Menu Handlers
    handleContextMenu(event) {
        event.preventDefault();
        
        // Create context menu
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu) return;
        
        // Position menu
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.display = 'block';
    }

    handleContextMenuClose() {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    // Keyboard Shortcuts
    handleEscape() {
        // Close any open modals
        this.modalManager.closeAll();
        
        // Close context menu
        this.handleContextMenuClose();
    }

    handleSpace() {
        // Roll dice or end turn based on game state
        const currentPlayer = this.gameEngine.getCurrentPlayer();
        if (currentPlayer && !currentPlayer.isBankrupt) {
            const rollBtn = document.getElementById('roll-dice-btn');
            const endBtn = document.getElementById('end-turn-btn');
            
            if (rollBtn && !rollBtn.disabled) {
                this.handleRollDice();
            } else if (endBtn && !endBtn.disabled) {
                this.handleEndTurn();
            }
        }
    }

    handleHelp() {
        this.modalManager.showHelp();
    }

    // Window and Document Events
    handleResize() {
        // Update responsive layouts
        this.updateResponsiveLayout();
    }

    handleBeforeUnload(event) {
        // Auto-save game
        this.stateManager.autoSave();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.stateManager.autoSave();
        }
    }

    handleDocumentClick(event) {
        // Close context menu on outside click
        if (!event.target.closest('.context-menu')) {
            this.handleContextMenuClose();
        }
    }

    // Game Events
    handleGameStart(event) {
        this.logAction('Game started');
        this.updateUI();
    }

    handleGameEnd(event) {
        const { winner } = event.detail;
        this.showGameOver(winner);
    }

    // Helper Methods
    getTotalProperties(players) {
        return players.reduce((sum, player) => sum + player.properties.length, 0);
    }

    resetUI() {
        // Reset all UI components
        this.hideActionButtons();
        this.updateUI();
        
        // Clear log
        const logEntries = document.getElementById('log-entries');
        if (logEntries) {
            logEntries.innerHTML = `
                <div class="log-entry welcome">
                    <span class="log-time">00:00</span>
                    <span class="log-message">🎮 New game started!</span>
                </div>
            `;
        }
    }

    updateResponsiveLayout() {
        // Handle responsive layout changes
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile layout adjustments
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }

    // Cleanup
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach((listener, key) => {
            const [element, event, handler] = key.split('|');
            if (element && event && handler) {
                document.removeEventListener(event, handler);
            }
        });
        
        this.eventListeners.clear();
    }
}