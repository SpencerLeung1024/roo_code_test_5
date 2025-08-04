/**
 * Chance and Community Chest card definitions
 */
import { Card } from '../models/Card.js';

/**
 * Complete set of 16 Chance cards with Monopoly rules
 */
export const CHANCE_CARDS = [
    new Card('chance', 'C01', 'Advance to GO', 'Advance to GO and collect $200', 'move-to', 0, 0),
    new Card('chance', 'C02', 'Advance to Illinois Avenue', 'Advance to Illinois Avenue. If you pass GO, collect $200', 'move-to', 0, 24),
    new Card('chance', 'C03', 'Advance to St. Charles Place', 'Advance to St. Charles Place. If you pass GO, collect $200', 'move-to', 0, 11),
    new Card('chance', 'C04', 'Advance to nearest Railroad', 'Advance to the nearest Railroad and pay owner twice the rental', 'move-near', 0, 'railroad'),
    new Card('chance', 'C05', 'Advance to nearest Railroad', 'Advance to the nearest Railroad and pay owner twice the rental', 'move-near', 0, 'railroad'),
    new Card('chance', 'C06', 'Advance to nearest Utility', 'Advance to the nearest Utility. If unowned, you may buy it. If owned, throw dice and pay owner 10 times the amount thrown', 'move-near', 0, 'utility'),
    new Card('chance', 'C07', 'Bank pays you dividend', 'Bank pays you dividend of $50', 'money-from-bank', 50),
    new Card('chance', 'C08', 'Get out of Jail Free', 'Get out of Jail Free. This card may be kept until needed or sold', 'get-out-of-jail'),
    new Card('chance', 'C09', 'Go back 3 spaces', 'Go back 3 spaces', 'move-back', 0, 3),
    new Card('chance', 'C10', 'Go to Jail', 'Go directly to Jail. Do not pass GO, do not collect $200', 'go-to-jail'),
    new Card('chance', 'C11', 'General repairs', 'Make general repairs on all your property. For each house pay $25, for each hotel pay $100', 'repairs', 0, { house: 25, hotel: 100 }),
    new Card('chance', 'C12', 'Speeding fine', 'Speeding fine $15', 'money-to-bank', 15),
    new Card('chance', 'C13', 'Take a trip to Reading Railroad', 'Take a trip to Reading Railroad. If you pass GO, collect $200', 'move-to', 0, 5),
    new Card('chance', 'C14', 'Take a walk on the Boardwalk', 'Take a walk on the Boardwalk. Advance token to Boardwalk', 'move-to', 0, 39),
    new Card('chance', 'C15', 'Elected Chairman', 'You have been elected Chairman of the Board. Pay each player $50', 'money-to-players', 50),
    new Card('chance', 'C16', 'Building loan matures', 'Your building loan matures. Collect $150', 'money-from-bank', 150)
];

/**
 * Complete set of 16 Community Chest cards with Monopoly rules
 */
export const COMMUNITY_CHEST_CARDS = [
    new Card('community-chest', 'CC01', 'Advance to GO', 'Advance to GO and collect $200', 'move-to', 0, 0),
    new Card('community-chest', 'CC02', 'Bank error in your favor', 'Bank error in your favor. Collect $200', 'money-from-bank', 200),
    new Card('community-chest', 'CC03', 'Doctor\'s fees', 'Doctor\'s fees. Pay $50', 'money-to-bank', 50),
    new Card('community-chest', 'CC04', 'From sale of stock', 'From sale of stock you get $50', 'money-from-bank', 50),
    new Card('community-chest', 'CC05', 'Get out of Jail Free', 'Get out of Jail Free. This card may be kept until needed or sold', 'get-out-of-jail'),
    new Card('community-chest', 'CC06', 'Go to Jail', 'Go directly to Jail. Do not pass GO, do not collect $200', 'go-to-jail'),
    new Card('community-chest', 'CC07', 'Grand Opera Night', 'Grand Opera Night. Collect $50 from every player for opening night seats', 'money-from-players', 50),
    new Card('community-chest', 'CC08', 'Holiday fund matures', 'Holiday fund matures. Receive $100', 'money-from-bank', 100),
    new Card('community-chest', 'CC09', 'Income tax refund', 'Income tax refund. Collect $20', 'money-from-bank', 20),
    new Card('community-chest', 'CC10', 'It is your birthday', 'It is your birthday. Collect $10 from every player', 'money-from-players', 10),
    new Card('community-chest', 'CC11', 'Life insurance matures', 'Life insurance matures. Collect $100', 'money-from-bank', 100),
    new Card('community-chest', 'CC12', 'Hospital fees', 'Pay hospital fees of $100', 'money-to-bank', 100),
    new Card('community-chest', 'CC13', 'School fees', 'Pay school fees of $150', 'money-to-bank', 150),
    new Card('community-chest', 'CC14', 'Receive consultancy fee', 'Receive $25 consultancy fee', 'money-from-bank', 25),
    new Card('community-chest', 'CC15', 'Street repairs', 'You are assessed for street repairs. $40 per house, $115 per hotel', 'repairs', 0, { house: 40, hotel: 115 }),
    new Card('community-chest', 'CC16', 'You have won a crossword competition', 'You have won a crossword competition. Collect $100', 'money-from-bank', 100)
];

/**
 * Get all cards of a specific type
 * @param {string} type - 'chance' or 'community-chest'
 * @returns {Array<Card>} Array of cards
 */
export function getCardsByType(type) {
    return type === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
}

/**
 * Get card by ID
 * @param {string} cardId - The card ID
 * @returns {Card|null} The card or null if not found
 */
export function getCardById(cardId) {
    const allCards = [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS];
    return allCards.find(card => card.id === cardId) || null;
}