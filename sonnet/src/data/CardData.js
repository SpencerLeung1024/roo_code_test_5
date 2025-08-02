// Complete card definitions for Monopoly Chance and Community Chest cards
// Based on official Monopoly rules with all 32 cards (16 of each type)

export const CHANCE_CARDS = [
  {
    id: 'chance_01',
    title: 'Advance to GO',
    description: 'Advance to GO (Collect $200)',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 0,
    collectGoBonus: true,
    effectValue: 200
  },
  {
    id: 'chance_02',
    title: 'Advance to Illinois Ave',
    description: 'Advance to Illinois Ave. If you pass GO, collect $200',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 24, // Illinois Avenue
    collectGoBonus: true
  },
  {
    id: 'chance_03',
    title: 'Advance to St. Charles Place',
    description: 'Advance to St. Charles Place. If you pass GO, collect $200',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 11, // St. Charles Place
    collectGoBonus: true
  },
  {
    id: 'chance_04',
    title: 'Advance to Nearest Utility',
    description: 'Advance to nearest Utility. If unowned, you may buy it. If owned, pay owner 10× dice roll',
    type: 'move',
    action: 'moveToNearestUtility',
    rentMultiplier: 10
  },
  {
    id: 'chance_05',
    title: 'Advance to Nearest Railroad',
    description: 'Advance to nearest Railroad. If unowned, you may buy it. If owned, pay double rent',
    type: 'move',
    action: 'moveToNearestRailroad',
    rentMultiplier: 2
  },
  {
    id: 'chance_06',
    title: 'Advance to Nearest Railroad',
    description: 'Advance to nearest Railroad. If unowned, you may buy it. If owned, pay double rent',
    type: 'move',
    action: 'moveToNearestRailroad',
    rentMultiplier: 2
  },
  {
    id: 'chance_07',
    title: 'Bank Dividend',
    description: 'Bank pays you dividend of $50',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 50,
    fromBank: true
  },
  {
    id: 'chance_08',
    title: 'Get Out of Jail Free',
    description: 'Get Out of Jail Free. This card may be kept until needed or traded',
    type: 'special',
    action: 'getOutOfJailFree',
    isGetOutOfJail: true,
    tradeable: true
  },
  {
    id: 'chance_09',
    title: 'Go Back 3 Spaces',
    description: 'Go back 3 spaces',
    type: 'move',
    action: 'moveRelative',
    effectValue: -3
  },
  {
    id: 'chance_10',
    title: 'Go to Jail',
    description: 'Go directly to Jail. Do not pass GO, do not collect $200',
    type: 'special',
    action: 'goToJail'
  },
  {
    id: 'chance_11',
    title: 'Property Repairs',
    description: 'Make general repairs on all your property: For each house pay $25, for each hotel pay $100',
    type: 'property',
    action: 'payPerProperty',
    perHouseAmount: 25,
    perHotelAmount: 100
  },
  {
    id: 'chance_12',
    title: 'Speeding Fine',
    description: 'Speeding fine $15',
    type: 'money',
    action: 'payMoney',
    effectValue: 15,
    toBank: true
  },
  {
    id: 'chance_13',
    title: 'Trip to Reading Railroad',
    description: 'Take a trip to Reading Railroad. If you pass GO, collect $200',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 5, // Reading Railroad
    collectGoBonus: true
  },
  {
    id: 'chance_14',
    title: 'Trip to Boardwalk',
    description: 'Take a walk on the Boardwalk. Advance token to Boardwalk',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 39 // Boardwalk
  },
  {
    id: 'chance_15',
    title: 'Chairman Elected',
    description: 'You have been elected Chairman of the Board. Pay each player $50',
    type: 'money',
    action: 'payEachPlayer',
    effectValue: 50
  },
  {
    id: 'chance_16',
    title: 'Building Loan Matures',
    description: 'Your building loan matures. Collect $150',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 150,
    fromBank: true
  }
];

export const COMMUNITY_CHEST_CARDS = [
  {
    id: 'community_01',
    title: 'Advance to GO',
    description: 'Advance to GO (Collect $200)',
    type: 'move',
    action: 'moveToSpace',
    targetPosition: 0,
    collectGoBonus: true,
    effectValue: 200
  },
  {
    id: 'community_02',
    title: 'Bank Error',
    description: 'Bank error in your favor. Collect $200',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 200,
    fromBank: true
  },
  {
    id: 'community_03',
    title: 'Doctor\'s Fee',
    description: 'Doctor\'s fees. Pay $50',
    type: 'money',
    action: 'payMoney',
    effectValue: 50,
    toBank: true
  },
  {
    id: 'community_04',
    title: 'Stock Sale',
    description: 'From sale of stock you get $50',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 50,
    fromBank: true
  },
  {
    id: 'community_05',
    title: 'Get Out of Jail Free',
    description: 'Get Out of Jail Free. This card may be kept until needed or traded',
    type: 'special',
    action: 'getOutOfJailFree',
    isGetOutOfJail: true,
    tradeable: true
  },
  {
    id: 'community_06',
    title: 'Go to Jail',
    description: 'Go directly to Jail. Do not pass GO, do not collect $200',
    type: 'special',
    action: 'goToJail'
  },
  {
    id: 'community_07',
    title: 'Holiday Fund Matures',
    description: 'Holiday fund matures. Receive $100',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 100,
    fromBank: true
  },
  {
    id: 'community_08',
    title: 'Income Tax Refund',
    description: 'Income tax refund. Collect $20',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 20,
    fromBank: true
  },
  {
    id: 'community_09',
    title: 'Birthday Money',
    description: 'It is your birthday. Collect $10 from every player',
    type: 'money',
    action: 'receiveFromEachPlayer',
    effectValue: 10
  },
  {
    id: 'community_10',
    title: 'Life Insurance Matures',
    description: 'Life insurance matures. Collect $100',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 100,
    fromBank: true
  },
  {
    id: 'community_11',
    title: 'Hospital Fees',
    description: 'Pay hospital fees of $100',
    type: 'money',
    action: 'payMoney',
    effectValue: 100,
    toBank: true
  },
  {
    id: 'community_12',
    title: 'School Fees',
    description: 'Pay school fees of $50',
    type: 'money',
    action: 'payMoney',
    effectValue: 50,
    toBank: true
  },
  {
    id: 'community_13',
    title: 'Consultancy Fee',
    description: 'Receive $25 consultancy fee',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 25,
    fromBank: true
  },
  {
    id: 'community_14',
    title: 'Street Repairs',
    description: 'You are assessed for street repairs: $40 per house, $115 per hotel',
    type: 'property',
    action: 'payPerProperty',
    perHouseAmount: 40,
    perHotelAmount: 115
  },
  {
    id: 'community_15',
    title: 'Beauty Contest',
    description: 'You have won second prize in a beauty contest. Collect $10',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 10,
    fromBank: true
  },
  {
    id: 'community_16',
    title: 'Inheritance',
    description: 'You inherit $100',
    type: 'money',
    action: 'receiveMoney',
    effectValue: 100,
    fromBank: true
  }
];

// Combined export for easy access
export const ALL_CARDS = {
  chance: CHANCE_CARDS,
  communityChest: COMMUNITY_CHEST_CARDS
};

// Utility functions for card management
export const CardUtils = {
  // Get card by ID from either deck
  getCardById(cardId) {
    const allCards = [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS];
    return allCards.find(card => card.id === cardId);
  },

  // Get cards by type
  getCardsByType(type) {
    const allCards = [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS];
    return allCards.filter(card => card.type === type);
  },

  // Get cards by action
  getCardsByAction(action) {
    const allCards = [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS];
    return allCards.filter(card => card.action === action);
  },

  // Get "Get Out of Jail Free" cards
  getJailCards() {
    const allCards = [...CHANCE_CARDS, ...COMMUNITY_CHEST_CARDS];
    return allCards.filter(card => card.isGetOutOfJail);
  },

  // Validate card structure
  validateCard(card) {
    const requiredFields = ['id', 'title', 'description', 'type', 'action'];
    return requiredFields.every(field => card.hasOwnProperty(field));
  },

  // Get card deck type from card ID
  getCardDeckType(cardId) {
    if (cardId.startsWith('chance_')) return 'chance';
    if (cardId.startsWith('community_')) return 'communityChest';
    return null;
  }
};

export default ALL_CARDS;