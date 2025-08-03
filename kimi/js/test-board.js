/**
 * Board System Test
 * Tests the complete Monopoly board implementation
 */

import { Board } from './models/Board.js';
import { BoardRenderer } from './ui/BoardRenderer.js';

/**
 * Test the board system
 */
async function testBoardSystem() {
    console.log('🧪 Testing Monopoly Board System...');
    
    try {
        // Test 1: Create Board
        console.log('📋 Test 1: Creating Board...');
        const board = new Board();
        const squares = board.getSquares();
        
        if (squares.length !== 40) {
            throw new Error(`Expected 40 squares, got ${squares.length}`);
        }
        console.log('✅ Board created with 40 squares');
        
        // Test 2: Verify square types
        console.log('📋 Test 2: Verifying square types...');
        const expectedTypes = {
            property: 22,
            railroad: 4,
            utility: 2,
            chance: 3,
            'community-chest': 3,
            tax: 2,
            go: 1,
            jail: 1,
            'free-parking': 1,
            'go-to-jail': 1
        };
        
        const actualTypes = {};
        squares.forEach(square => {
            actualTypes[square.type] = (actualTypes[square.type] || 0) + 1;
        });
        
        for (const [type, expectedCount] of Object.entries(expectedTypes)) {
            const actualCount = actualTypes[type] || 0;
            if (actualCount !== expectedCount) {
                throw new Error(`Expected ${expectedCount} ${type} squares, got ${actualCount}`);
            }
        }
        console.log('✅ All square types verified');
        
        // Test 3: Test property data
        console.log('📋 Test 3: Testing property data...');
        const mediterranean = board.getSquare(1);
        if (mediterranean.type !== 'property' || mediterranean.name !== 'Mediterranean Avenue') {
            throw new Error('Mediterranean Avenue not found at position 1');
        }
        if (mediterranean.data.price !== 60) {
            throw new Error(`Mediterranean Avenue price should be $60, got $${mediterranean.data.price}`);
        }
        console.log('✅ Property data verified');
        
        // Test 4: Test board navigation
        console.log('📋 Test 4: Testing board navigation...');
        const nextPos = board.getNextPosition(39, 1);
        if (nextPos !== 0) {
            throw new Error(`Expected position 0 after 39+1, got ${nextPos}`);
        }
        
        const passedGo = board.passedGo(35, 5);
        if (!passedGo) {
            throw new Error('Should detect passing GO');
        }
        console.log('✅ Board navigation verified');
        
        // Test 5: Test BoardRenderer
        console.log('📋 Test 5: Testing BoardRenderer...');
        const renderer = new BoardRenderer();
        
        // Create a mock board element
        const boardElement = document.createElement('div');
        boardElement.id = 'board-grid';
        boardElement.className = 'board-grid';
        document.body.appendChild(boardElement);
        
        await renderer.init();
        renderer.renderBoard(board);
        
        const renderedSquares = boardElement.querySelectorAll('.square');
        if (renderedSquares.length !== 40) {
            throw new Error(`Expected 40 rendered squares, got ${renderedSquares.length}`);
        }
        console.log('✅ BoardRenderer verified');
        
        // Test 6: Test property groups
        console.log('📋 Test 6: Testing property groups...');
        const brownProperties = board.getPropertiesByColorGroup('brown');
        if (brownProperties.length !== 2) {
            throw new Error(`Expected 2 brown properties, got ${brownProperties.length}`);
        }
        
        const railroads = board.getRailroads();
        if (railroads.length !== 4) {
            throw new Error(`Expected 4 railroads, got ${railroads.length}`);
        }
        
        const utilities = board.getUtilities();
        if (utilities.length !== 2) {
            throw new Error(`Expected 2 utilities, got ${utilities.length}`);
        }
        console.log('✅ Property groups verified');
        
        console.log('🎉 All board system tests passed!');
        
        // Display summary
        console.log('\n📊 Board Summary:');
        console.log(`- Total squares: ${squares.length}`);
        console.log(`- Properties: ${actualTypes.property || 0}`);
        console.log(`- Railroads: ${actualTypes.railroad || 0}`);
        console.log(`- Utilities: ${actualTypes.utility || 0}`);
        console.log(`- Chance cards: ${actualTypes.chance || 0}`);
        console.log(`- Community Chest: ${actualTypes['community-chest'] || 0}`);
        console.log(`- Special squares: ${squares.length - (actualTypes.property || 0) - (actualTypes.railroad || 0) - (actualTypes.utility || 0)}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Board system test failed:', error);
        return false;
    }
}

/**
 * Run the test
 */
if (typeof window !== 'undefined') {
    // Browser environment
    window.testBoardSystem = testBoardSystem;
} else {
    // Node.js environment
    testBoardSystem();
}

export { testBoardSystem };