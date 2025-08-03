class GameStateValidator {
    constructor() {
        this.validationRules = new Map();
        this.setupValidationRules();
    }
    
    setupValidationRules() {
        // Roll dice validation
        this.validationRules.set('roll_dice', {
            currentPlayerOnly: true,
            phase: 'waiting',
            maxRolls: 3,
            conditions: ['notInJail', 'gameActive']
        });
        
        // End turn validation
        this.validationRules.set('end_turn', {
            currentPlayerOnly: true,
            phase: ['acting', 'waiting'],
            conditions: ['gameActive']
        });
        
        // Property purchase validation
        this.validationRules.set('purchase_property', {
            currentPlayerOnly: true,
            phase: 'acting',
            conditions: ['propertyUnowned', 'sufficientFunds', 'gameActive']
        });
        
        // Build house validation
        this.validationRules.set('build_house', {
            currentPlayerOnly: true,
            phase: 'acting',
            conditions: ['ownsProperty', 'hasMonopoly', 'sufficientFunds', 'buildingLimits', 'gameActive']
        });
        
        // Mortgage property validation
        this.validationRules.set('mortgage_property', {
            currentPlayerOnly: true,
            phase: 'acting',
            conditions: ['ownsProperty', 'notMortgaged', 'noBuildings', 'gameActive']
        });
    }
    
    // Main validation methods
    validateAction(action, gameState) {
        switch (action.type) {
            case 'roll_dice':
                return this.validateRollDice(action.playerId, gameState);
            case 'end_turn':
                return this.validateEndTurn(action.playerId, gameState);
            case 'purchase_property':
                return this.validatePurchaseProperty(action.playerId, action.propertyId, gameState);
            case 'build_house':
                return this.validateBuildHouse(action.playerId, action.propertyId, gameState);
            case 'mortgage_property':
                return this.validateMortgageProperty(action.playerId, action.propertyId, gameState);
            default:
                return { valid: false, message: 'Unknown action type' };
        }
    }
    
    validateGameState(gameState) {
        const errors = [];
        
        // Check if game state has required fields
        if (!gameState.id) {
            errors.push('Game state missing ID');
        }
        
        if (!gameState.status) {
            errors.push('Game state missing status');
        }
        
        if (!Array.isArray(gameState.players)) {
            errors.push('Game state players must be an array');
        }
        
        if (!Array.isArray(gameState.board)) {
            errors.push('Game state board must be an array');
        }
        
        // Validate players
        gameState.players.forEach((player, index) => {
            const playerErrors = this.validatePlayer(player);
            playerErrors.forEach(error => {
                errors.push(`Player ${index}: ${error}`);
            });
        });
        
        // Validate board
        gameState.board.forEach((space, index) => {
            const spaceErrors = this.validateSpace(space);
            spaceErrors.forEach(error => {
                errors.push(`Space ${index}: ${error}`);
            });
        });
        
        // Validate current player index
        if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
            errors.push('Invalid current player index');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid game state'
        };
    }
    
    validatePlayer(player) {
        const errors = [];
        
        if (!player.id) {
            errors.push('Player missing ID');
        }
        
        if (!player.name) {
            errors.push('Player missing name');
        }
        
        if (typeof player.money !== 'number' || player.money < 0) {
            errors.push('Player money must be a non-negative number');
        }
        
        if (typeof player.position !== 'number' || player.position < 0) {
            errors.push('Player position must be a non-negative number');
        }
        
        if (!Array.isArray(player.properties)) {
            errors.push('Player properties must be an array');
        }
        
        return errors;
    }
    
    validateSpace(space) {
        const errors = [];
        
        if (!space.id) {
            errors.push('Space missing ID');
        }
        
        if (!space.name) {
            errors.push('Space missing name');
        }
        
        if (!space.type) {
            errors.push('Space missing type');
        }
        
        if (typeof space.position !== 'number' || space.position < 0) {
            errors.push('Space position must be a non-negative number');
        }
        
        return errors;
    }
    
    // Specific action validation methods
    validateRollDice(playerId, gameState) {
        const errors = [];
        
        // Check if it's the player's turn
        const currentPlayer = gameState.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) {
            errors.push('Not your turn');
        }
        
        // Check game phase
        if (gameState.turnPhase !== 'waiting') {
            errors.push('Cannot roll dice in current phase');
        }
        
        // Check if game is active
        if (!gameState.isGameActive()) {
            errors.push('Game is not active');
        }
        
        // Check if player is in jail
        if (currentPlayer && currentPlayer.inJail) {
            errors.push('Cannot roll dice while in jail');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid roll dice action'
        };
    }
    
    validateEndTurn(playerId, gameState) {
        const errors = [];
        
        // Check if it's the player's turn
        const currentPlayer = gameState.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) {
            errors.push('Not your turn');
        }
        
        // Check game phase
        if (gameState.turnPhase !== 'acting' && gameState.turnPhase !== 'waiting') {
            errors.push('Cannot end turn in current phase');
        }
        
        // Check if game is active
        if (!gameState.isGameActive()) {
            errors.push('Game is not active');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid end turn action'
        };
    }
    
    validatePurchaseProperty(playerId, propertyId, gameState) {
        const errors = [];
        
        // Check if it's the player's turn
        const currentPlayer = gameState.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) {
            errors.push('Not your turn');
        }
        
        // Check game phase
        if (gameState.turnPhase !== 'acting') {
            errors.push('Cannot purchase property in current phase');
        }
        
        // Check if game is active
        if (!gameState.isGameActive()) {
            errors.push('Game is not active');
        }
        
        // Check if property exists
        const property = gameState.getPropertyById(propertyId);
        if (!property) {
            errors.push('Property not found');
        }
        
        // Check if property is unowned
        if (property && property.ownerId !== null) {
            errors.push('Property is already owned');
        }
        
        // Check if player has sufficient funds
        if (currentPlayer && property && !currentPlayer.canAfford(property.price)) {
            errors.push('Insufficient funds');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid purchase property action'
        };
    }
    
    validateBuildHouse(playerId, propertyId, gameState) {
        const errors = [];
        
        // Check if it's the player's turn
        const currentPlayer = gameState.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) {
            errors.push('Not your turn');
        }
        
        // Check game phase
        if (gameState.turnPhase !== 'acting') {
            errors.push('Cannot build house in current phase');
        }
        
        // Check if game is active
        if (!gameState.isGameActive()) {
            errors.push('Game is not active');
        }
        
        // Check if property exists
        const property = gameState.getPropertyById(propertyId);
        if (!property) {
            errors.push('Property not found');
        }
        
        // Check if player owns property
        if (property && property.ownerId !== playerId) {
            errors.push('You do not own this property');
        }
        
        // Check if property can have houses
        if (property && property.type !== 'street') {
            errors.push('Cannot build houses on this property type');
        }
        
        // Check if player has monopoly
        if (currentPlayer && property && !property.hasMonopoly(currentPlayer)) {
            errors.push('You must own all properties in this color group');
        }
        
        // Check building limits
        if (property && property.buildings >= 5) {
            errors.push('Cannot build more than 4 houses or 1 hotel');
        }
        
        // Check if player has sufficient funds
        if (currentPlayer && property && property.buildings < 4 && !currentPlayer.canAfford(property.houseCost)) {
            errors.push('Insufficient funds to build house');
        }
        
        // Check if player has sufficient funds for hotel
        if (currentPlayer && property && property.buildings === 4 && !currentPlayer.canAfford(property.hotelCost)) {
            errors.push('Insufficient funds to build hotel');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid build house action'
        };
    }
    
    validateMortgageProperty(playerId, propertyId, gameState) {
        const errors = [];
        
        // Check if it's the player's turn
        const currentPlayer = gameState.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== playerId) {
            errors.push('Not your turn');
        }
        
        // Check game phase
        if (gameState.turnPhase !== 'acting') {
            errors.push('Cannot mortgage property in current phase');
        }
        
        // Check if game is active
        if (!gameState.isGameActive()) {
            errors.push('Game is not active');
        }
        
        // Check if property exists
        const property = gameState.getPropertyById(propertyId);
        if (!property) {
            errors.push('Property not found');
        }
        
        // Check if player owns property
        if (property && property.ownerId !== playerId) {
            errors.push('You do not own this property');
        }
        
        // Check if property is already mortgaged
        if (property && property.isMortgaged) {
            errors.push('Property is already mortgaged');
        }
        
        // Check if property has buildings
        if (property && property.buildings > 0) {
            errors.push('Cannot mortgage property with buildings');
        }
        
        return {
            valid: errors.length === 0,
            message: errors.length > 0 ? errors.join(', ') : 'Valid mortgage property action'
        };
    }
    
    getValidationErrors() {
        return this.errors || [];
    }
}

module.exports = GameStateValidator;