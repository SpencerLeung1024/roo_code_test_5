/**
 * Test file for the complete card system
 */
import { CardManager } from './services/CardManager.js';
import { CardDeck } from './models/CardDeck.js';
import { Card } from './models/Card.js';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from './config/cards.js';
import { CardUI } from './ui/CardUI.js';
import { CardEffectService } from './services/CardEffectService.js';

/**
 * Mock Game Engine for testing
 */
class MockGameEngine {
    constructor() {
        this.board = {
            getSquare: (position) => {
                const squares = [
                    { name: 'GO', type: 'go' },
                    { name: 'Mediterranean Avenue', type: 'property' },
                    { name: 'Community Chest', type: 'community-chest' },
                    { name: 'Baltic Avenue', type: 'property' },
                    { name: 'Income Tax', type: 'tax', amount: 200 },
                    { name: 'Reading Railroad', type: 'railroad' },
                    { name: 'Oriental Avenue', type: 'property' },
                    { name: 'Chance', type: 'chance' },
                    { name: 'Vermont Avenue', type: 'property' },
                    { name: 'Connecticut Avenue', type: 'property' },
                    { name: 'Jail', type: 'jail' },
                    { name: 'St. Charles Place', type: 'property' },
                    { name: 'Electric Company', type: 'utility' },
                    { name: 'States Avenue', type: 'property' },
                    { name: 'Virginia Avenue', type: 'property' },
                    { name: 'Pennsylvania Railroad', type: 'railroad' },
                    { name: 'St. James Place', type: 'property' },
                    { name: 'Community Chest', type: 'community-chest' },
                    { name: 'Tennessee Avenue', type: 'property' },
                    { name: 'New York Avenue', type: 'property' },
                    { name: 'Free Parking', type: 'free-parking' },
                    { name: 'Kentucky Avenue', type: 'property' },
                    { name: 'Chance', type: 'chance' },
                    { name: 'Indiana Avenue', type: 'property' },
                    { name: 'Illinois Avenue', type: 'property' },
                    { name: 'B&O Railroad', type: 'railroad' },
                    { name: 'Atlantic Avenue', type: 'property' },
                    { name: 'Ventnor Avenue', type: 'property' },
                    { name: 'Water Works', type: 'utility' },
                    { name: 'Marvin Gardens', type: 'property' },
                    { name: 'Go to Jail', type: 'go-to-jail' },
                    { name: 'Pacific Avenue', type: 'property' },
                    { name: 'North Carolina Avenue', type: 'property' },
                    { name: 'Community Chest', type: 'community-chest' },
                    { name: 'Pennsylvania Avenue', type: 'property' },
                    { name: 'Short Line Railroad', type: 'railroad' },
                    { name: 'Chance', type: 'chance' },
                    { name: 'Park Place', type: 'property' },
                    { name: 'Luxury Tax', type: 'tax', amount: 100 },
                    { name: 'Boardwalk', type: 'property' }
                ];
                return squares[position] || { name: 'Unknown', type: 'unknown' };
            }
        };
        
        this.players = [
            { 
                id: 1, 
                name: 'Player 1', 
                position: 0, 
                money: 1500, 
                inJail: false, 
                jailTurns: 0,
                getOutOfJailFreeCards: 0,
                properties: []
            }
        ];
        
        this.propertyService = {
            getProperty: (name) => ({ name, owner: null }),
            getPlayerRailroads: (playerId) => [],
            getPlayerUtilities: (playerId) => []
        };
        
        this.rentService = {
            calculateRent: (property, player) => 50
        };
    }
}

/**
 * Test the complete card system
 */
class CardSystemTester {
    constructor() {
        this.gameEngine = new MockGameEngine();
        this.cardManager = new CardManager(this.gameEngine);
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🎴 Starting Card System Tests...\n');
        
        await this.testCardCreation();
        await this.testCardDeck();
        await this.testCardUI();
        await this.testCardEffects();
        await this.testIntegration();
        
        this.printResults();
    }

    async testCardCreation() {
        console.log('📋 Testing Card Creation...');
        
        try {
            // Test Chance cards
            const chanceCard = CHANCE_CARDS[0];
            this.assert(chanceCard.type === 'chance', 'Chance card type');
            this.assert(chanceCard.title === 'Advance to GO', 'Chance card title');
            this.assert(chanceCard.effect === 'move-to', 'Chance card effect');
            
            // Test Community Chest cards
            const chestCard = COMMUNITY_CHEST_CARDS[0];
            this.assert(chestCard.type === 'community-chest', 'Community Chest card type');
            this.assert(chestCard.title === 'Advance to GO', 'Community Chest card title');
            
            console.log('✅ Card Creation Tests Passed\n');
        } catch (error) {
            console.error('❌ Card Creation Tests Failed:', error);
            this.testResults.push({ test: 'Card Creation', passed: false, error: error.message });
        }
    }

    async testCardDeck() {
        console.log('🃏 Testing Card Deck...');
        
        try {
            // Test Chance deck
            const chanceDeck = new CardDeck('chance');
            this.assert(chanceDeck.getRemainingCount() === 16, 'Chance deck has 16 cards');
            this.assert(chanceDeck.getDiscardedCount() === 0, 'Chance deck starts with 0 discarded');
            
            // Test Community Chest deck
            const chestDeck = new CardDeck('community-chest');
            this.assert(chestDeck.getRemainingCount() === 16, 'Community Chest deck has 16 cards');
            
            // Test drawing cards
            const card1 = chanceDeck.drawCard();
            this.assert(card1 !== null, 'Can draw card from Chance deck');
            this.assert(chanceDeck.getRemainingCount() === 15, 'Deck count decreases after draw');
            this.assert(chanceDeck.getDiscardedCount() === 1, 'Discarded count increases after draw');
            
            // Test shuffling
            chanceDeck.shuffle();
            this.assert(chanceDeck.getRemainingCount() === 15, 'Deck count after shuffle');
            
            // Test reset
            chanceDeck.resetDeck();
            this.assert(chanceDeck.getRemainingCount() === 16, 'Deck resets to 16 cards');
            
            console.log('✅ Card Deck Tests Passed\n');
        } catch (error) {
            console.error('❌ Card Deck Tests Failed:', error);
            this.testResults.push({ test: 'Card Deck', passed: false, error: error.message });
        }
    }

    async testCardUI() {
        console.log('🎨 Testing Card UI...');
        
        try {
            const cardUI = new CardUI();
            cardUI.init();
            
            // Test card display
            const testCard = CHANCE_CARDS[0];
            const displayData = testCard.getDisplayData();
            
            this.assert(displayData.type === 'chance', 'Card display type');
            this.assert(displayData.title === 'CHANCE', 'Card display title');
            this.assert(displayData.color === '#FF8C00', 'Card display color');
            
            console.log('✅ Card UI Tests Passed\n');
        } catch (error) {
            console.error('❌ Card UI Tests Failed:', error);
            this.testResults.push({ test: 'Card UI', passed: false, error: error.message });
        }
    }

    async testCardEffects() {
        console.log('⚡ Testing Card Effects...');
        
        try {
            const player = this.gameEngine.players[0];
            const effectService = new CardEffectService(this.gameEngine);
            
            // Test money effect
            const moneyCard = new Card('chance', 'test', 'Test', 'Test money', 'money-from-bank', 100);
            const moneyResult = moneyCard.execute(player, this.gameEngine);
            this.assert(moneyResult.success, 'Money effect executes');
            this.assert(player.money === 1600, 'Player money increases by 100');
            
            // Test move effect
            const moveCard = new Card('chance', 'test2', 'Test', 'Test move', 'move-to', 0, 5);
            const moveResult = moveCard.execute(player, this.gameEngine);
            this.assert(moveResult.success, 'Move effect executes');
            this.assert(player.position === 5, 'Player moves to position 5');
            
            // Test jail effect
            const jailCard = new Card('chance', 'test3', 'Test', 'Test jail', 'go-to-jail');
            const jailResult = jailCard.execute(player, this.gameEngine);
            this.assert(jailResult.success, 'Jail effect executes');
            this.assert(player.position === 10, 'Player goes to jail');
            this.assert(player.inJail === true, 'Player is in jail');
            
            console.log('✅ Card Effects Tests Passed\n');
        } catch (error) {
            console.error('❌ Card Effects Tests Failed:', error);
            this.testResults.push({ test: 'Card Effects', passed: false, error: error.message });
        }
    }

    async testIntegration() {
        console.log('🔗 Testing Integration...');
        
        try {
            this.cardManager.init();
            
            // Test deck initialization
            const stats = this.cardManager.getDeckStats();
            this.assert(stats.chance.remaining === 16, 'Chance deck initialized');
            this.assert(stats.communityChest.remaining === 16, 'Community Chest deck initialized');
            
            // Test card drawing
            const player = this.gameEngine.players[0];
            const chanceCard = this.cardManager.getDeck('chance').drawCard();
            this.assert(chanceCard !== null, 'Can draw card through manager');
            
            console.log('✅ Integration Tests Passed\n');
        } catch (error) {
            console.error('❌ Integration Tests Failed:', error);
            this.testResults.push({ test: 'Integration', passed: false, error: error.message });
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
        this.testResults.push({ test: message, passed: true });
    }

    printResults() {
        console.log('📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`✅ Passed: ${passed}/${total}`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Card system is ready.');
        } else {
            const failed = this.testResults.filter(r => !r.passed);
            failed.forEach(test => {
                console.log(`❌ ${test.test}: ${test.error}`);
            });
        }
    }
}

// Demo HTML for testing
const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card System Demo</title>
    <link rel="stylesheet" href="../css/components/card.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            padding: 20px;
        }
        .demo-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
        }
        .btn:hover {
            background: #0056b3;
        }
        .card-preview {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <h1>🎴 Monopoly Card System Demo</h1>
        
        <div class="test-section">
            <h2>Run Tests</h2>
            <button class="btn" onclick="runTests()">Run All Tests</button>
            <div id="test-results"></div>
        </div>
        
        <div class="test-section">
            <h2>Card Preview</h2>
            <div class="card-preview">
                <div class="chance-card">
                    <div class="card-type">CHANCE</div>
                    <div class="card-content">
                        <div class="card-text">Advance to GO and collect $200</div>
                        <div class="card-amount">+$200</div>
                    </div>
                </div>
                
                <div class="community-chest-card">
                    <div class="card-type">COMMUNITY CHEST</div>
                    <div class="card-content">
                        <div class="card-text">Bank error in your favor. Collect $200</div>
                        <div class="card-amount">+$200</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="test-section">
            <h2>Interactive Demo</h2>
            <button class="btn" onclick="drawChanceCard()">Draw Chance Card</button>
            <button class="btn" onclick="drawCommunityChestCard()">Draw Community Chest Card</button>
            <button class="btn" onclick="resetDecks()">Reset Decks</button>
            <div id="demo-info"></div>
        </div>
    </div>

    <script type="module">
        import { CardSystemTester } from './test-cards.js';
        
        let tester;
        let cardManager;
        
        async function runTests() {
            tester = new CardSystemTester();
            await tester.runAllTests();
        }
        
        async function initDemo() {
            const { CardManager } = await import('./services/CardManager.js');
            const { MockGameEngine } = await import('./test-cards.js');
            
            const gameEngine = new MockGameEngine();
            cardManager = new CardManager(gameEngine);
            cardManager.init();
            
            updateDemoInfo();
        }
        
        function drawChanceCard() {
            if (cardManager) {
                const player = { id: 1, name: 'Demo Player', position: 7 };
                cardManager.drawCard('chance', player);
            }
        }
        
        function drawCommunityChestCard() {
            if (cardManager) {
                const player = { id: 1, name: 'Demo Player', position: 2 };
                cardManager.drawCard('community-chest', player);
            }
        }
        
        function resetDecks() {
            if (cardManager) {
                cardManager.resetDecks();
                updateDemoInfo();
            }
        }
        
        function updateDemoInfo() {
            const info = document.getElementById('demo-info');
            if (cardManager) {
                const stats = cardManager.getDeckStats();
                info.innerHTML = \`
                    <p>Chance: \${stats.chance.remaining} remaining, \${stats.chance.discarded} discarded</p>
                    <p>Community Chest: \${stats.communityChest.remaining} remaining, \${stats.communityChest.discarded} discarded</p>
                \`;
            }
        }
        
        // Initialize demo
        initDemo();
        
        // Make functions global
        window.runTests = runTests;
        window.drawChanceCard = drawChanceCard;
        window.drawCommunityChestCard = drawCommunityChestCard;
        window.resetDecks = resetDecks;
    </script>
</body>
</html>
`;

// Export for use
export { CardSystemTester, MockGameEngine, demoHTML };

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test-cards.js')) {
    const tester = new CardSystemTester();
    tester.runAllTests();
}