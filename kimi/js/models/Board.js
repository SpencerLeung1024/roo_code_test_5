/**
 * Board Model
 * Represents the Monopoly game board with all 40 squares
 */

import { constants } from '../config/constants.js';
import { Property } from './Property.js';

/**
 * Represents a single square on the Monopoly board
 */
export class Square {
    constructor(type, name, position, data = {}) {
        this.type = type; // 'property', 'railroad', 'utility', 'chance', 'community-chest', 'tax', 'go', 'jail', 'free-parking', 'go-to-jail'
        this.name = name;
        this.position = position;
        this.data = data; // Additional data specific to the square type
    }

    getInfo() {
        return {
            type: this.type,
            name: this.name,
            position: this.position,
            ...this.data
        };
    }
}

/**
 * Main Board class representing the entire Monopoly board
 */
export class Board {
    constructor() {
        this.squares = [];
        this.initializeBoard();
    }

    /**
     * Initialize the board with all 40 Monopoly squares
     */
    initializeBoard() {
        this.squares = [
            // Bottom row (positions 0-10)
            new Square('go', 'GO', 0, { salary: constants.GAME.SALARY }),
            new Square('property', 'Mediterranean Avenue', 1, new Property('Mediterranean Avenue', 60, 'brown', [2, 10, 30, 90, 160, 250], 50)),
            new Square('community-chest', 'Community Chest', 2),
            new Square('property', 'Baltic Avenue', 3, new Property('Baltic Avenue', 60, 'brown', [4, 20, 60, 180, 320, 450], 50)),
            new Square('tax', 'Income Tax', 4, { amount: constants.TAX.INCOME_TAX }),
            new Square('railroad', 'Reading Railroad', 5, new Property('Reading Railroad', 200, 'railroad', [25, 50, 100, 200])),
            new Square('property', 'Oriental Avenue', 6, new Property('Oriental Avenue', 100, 'light-blue', [6, 30, 90, 270, 400, 550], 50)),
            new Square('chance', 'Chance', 7),
            new Square('property', 'Vermont Avenue', 8, new Property('Vermont Avenue', 100, 'light-blue', [6, 30, 90, 270, 400, 550], 50)),
            new Square('property', 'Connecticut Avenue', 9, new Property('Connecticut Avenue', 120, 'light-blue', [8, 40, 100, 300, 450, 600], 50)),
            
            // Right side (positions 10-20)
            new Square('jail', 'Jail', 10, { justVisiting: true }),
            new Square('property', 'St. Charles Place', 11, new Property('St. Charles Place', 140, 'pink', [10, 50, 150, 450, 625, 750], 100)),
            new Square('utility', 'Electric Company', 12, new Property('Electric Company', 150, 'utility', [4, 10])),
            new Square('property', 'States Avenue', 13, new Property('States Avenue', 140, 'pink', [10, 50, 150, 450, 625, 750], 100)),
            new Square('property', 'Virginia Avenue', 14, new Property('Virginia Avenue', 160, 'pink', [12, 60, 180, 500, 700, 900], 100)),
            new Square('railroad', 'Pennsylvania Railroad', 15, new Property('Pennsylvania Railroad', 200, 'railroad', [25, 50, 100, 200])),
            new Square('property', 'St. James Place', 16, new Property('St. James Place', 180, 'orange', [14, 70, 200, 550, 750, 950], 100)),
            new Square('community-chest', 'Community Chest', 17),
            new Square('property', 'Tennessee Avenue', 18, new Property('Tennessee Avenue', 180, 'orange', [14, 70, 200, 550, 750, 950], 100)),
            new Square('property', 'New York Avenue', 19, new Property('New York Avenue', 200, 'orange', [16, 80, 220, 600, 800, 1000], 100)),
            new Square('free-parking', 'Free Parking', 20),
            
            // Top row (positions 21-31, right to left)
            new Square('property', 'Kentucky Avenue', 21, new Property('Kentucky Avenue', 220, 'red', [18, 90, 250, 700, 875, 1050], 150)),
            new Square('chance', 'Chance', 22),
            new Square('property', 'Indiana Avenue', 23, new Property('Indiana Avenue', 220, 'red', [18, 90, 250, 700, 875, 1050], 150)),
            new Square('property', 'Illinois Avenue', 24, new Property('Illinois Avenue', 240, 'red', [20, 100, 300, 750, 925, 1100], 150)),
            new Square('railroad', 'B&O Railroad', 25, new Property('B&O Railroad', 200, 'railroad', [25, 50, 100, 200])),
            new Square('property', 'Atlantic Avenue', 26, new Property('Atlantic Avenue', 260, 'yellow', [22, 110, 330, 800, 975, 1150], 150)),
            new Square('property', 'Ventnor Avenue', 27, new Property('Ventnor Avenue', 260, 'yellow', [22, 110, 330, 800, 975, 1150], 150)),
            new Square('utility', 'Water Works', 28, new Property('Water Works', 150, 'utility', [4, 10])),
            new Square('property', 'Marvin Gardens', 29, new Property('Marvin Gardens', 280, 'yellow', [24, 120, 360, 850, 1025, 1200], 150)),
            new Square('go-to-jail', 'Go to Jail', 30),
            
            // Left side (positions 31-39, top to bottom)
            new Square('property', 'Pacific Avenue', 31, new Property('Pacific Avenue', 300, 'green', [26, 130, 390, 900, 1100, 1275], 200)),
            new Square('property', 'North Carolina Avenue', 32, new Property('North Carolina Avenue', 300, 'green', [26, 130, 390, 900, 1100, 1275], 200)),
            new Square('community-chest', 'Community Chest', 33),
            new Square('property', 'Pennsylvania Avenue', 34, new Property('Pennsylvania Avenue', 320, 'green', [28, 150, 450, 1000, 1200, 1400], 200)),
            new Square('railroad', 'Short Line Railroad', 35, new Property('Short Line Railroad', 200, 'railroad', [25, 50, 100, 200])),
            new Square('chance', 'Chance', 36),
            new Square('property', 'Park Place', 37, new Property('Park Place', 350, 'dark-blue', [35, 175, 500, 1100, 1300, 1500], 200)),
            new Square('tax', 'Luxury Tax', 38, { amount: constants.TAX.LUXURY_TAX }),
            new Square('property', 'Boardwalk', 39, new Property('Boardwalk', 400, 'dark-blue', [50, 200, 600, 1400, 1700, 2000], 200))
        ];
    }

    /**
     * Get all squares on the board
     * @returns {Square[]} Array of all squares
     */
    getSquares() {
        return this.squares;
    }

    /**
     * Get a specific square by position
     * @param {number} position - Position on the board (0-39)
     * @returns {Square|null} The square at the given position
     */
    getSquare(position) {
        if (position < 0 || position >= this.squares.length) {
            return null;
        }
        return this.squares[position];
    }

    /**
     * Get squares of a specific type
     * @param {string} type - Type of square to find
     * @returns {Square[]} Array of squares matching the type
     */
    getSquaresByType(type) {
        return this.squares.filter(square => square.type === type);
    }

    /**
     * Get all properties of a specific color group
     * @param {string} colorGroup - Color group name
     * @returns {Square[]} Array of properties in the color group
     */
    getPropertiesByColorGroup(colorGroup) {
        return this.squares.filter(square => 
            square.type === 'property' && 
            square.data?.colorGroup === colorGroup
        );
    }

    /**
     * Get all railroads
     * @returns {Square[]} Array of railroad squares
     */
    getRailroads() {
        return this.getSquaresByType('railroad');
    }

    /**
     * Get all utilities
     * @returns {Square[]} Array of utility squares
     */
    getUtilities() {
        return this.getSquaresByType('utility');
    }

    /**
     * Get the next position after moving a certain number of steps
     * @param {number} currentPosition - Current position on the board
     * @param {number} steps - Number of steps to move
     * @returns {number} New position after moving
     */
    getNextPosition(currentPosition, steps) {
        return (currentPosition + steps) % this.squares.length;
    }

    /**
     * Check if passing GO gives salary
     * @param {number} oldPosition - Previous position
     * @param {number} newPosition - New position
     * @returns {boolean} True if passed GO
     */
    passedGo(oldPosition, newPosition) {
        return newPosition < oldPosition && oldPosition !== 0;
    }

    /**
     * Get the distance between two positions
     * @param {number} from - Starting position
     * @param {number} to - Ending position
     * @returns {number} Number of steps to move from 'from' to 'to'
     */
    getDistance(from, to) {
        if (to >= from) {
            return to - from;
        } else {
            return (this.squares.length - from) + to;
        }
    }
}