// Game constants for Monopoly

export const BOARD_SIZE = 40;

export const BOARD = [
  { position: 0, type: 'go', name: 'GO' },
  { position: 1, type: 'property', name: 'Mediterranean Avenue', group: 'brown' },
  { position: 2, type: 'community_chest', name: 'Community Chest' },
  { position: 3, type: 'property', name: 'Baltic Avenue', group: 'brown' },
  { position: 4, type: 'tax', name: 'Income Tax', amount: 200 },
  { position: 5, type: 'railroad', name: 'Reading Railroad' },
  { position: 6, type: 'property', name: 'Oriental Avenue', group: 'lightblue' },
  { position: 7, type: 'chance', name: 'Chance' },
  { position: 8, type: 'property', name: 'Vermont Avenue', group: 'lightblue' },
  { position: 9, type: 'property', name: 'Connecticut Avenue', group: 'lightblue' },
  { position: 10, type: 'jail', name: 'Jail/Just Visiting' },
  { position: 11, type: 'property', name: 'St. Charles Place', group: 'pink' },
  { position: 12, type: 'utility', name: 'Electric Company' },
  { position: 13, type: 'property', name: 'States Avenue', group: 'pink' },
  { position: 14, type: 'property', name: 'Virginia Avenue', group: 'pink' },
  { position: 15, type: 'railroad', name: 'Pennsylvania Railroad' },
  { position: 16, type: 'property', name: 'St. James Place', group: 'orange' },
  { position: 17, type: 'community_chest', name: 'Community Chest' },
  { position: 18, type: 'property', name: 'Tennessee Avenue', group: 'orange' },
  { position: 19, type: 'property', name: 'New York Avenue', group: 'orange' },
  { position: 20, type: 'free_parking', name: 'Free Parking' },
  { position: 21, type: 'property', name: 'Kentucky Avenue', group: 'red' },
  { position: 22, type: 'chance', name: 'Chance' },
  { position: 23, type: 'property', name: 'Indiana Avenue', group: 'red' },
  { position: 24, type: 'property', name: 'Illinois Avenue', group: 'red' },
  { position: 25, type: 'railroad', name: 'B. & O. Railroad' },
  { position: 26, type: 'property', name: 'Atlantic Avenue', group: 'yellow' },
  { position: 27, type: 'property', name: 'Ventnor Avenue', group: 'yellow' },
  { position: 28, type: 'utility', name: 'Water Works' },
  { position: 29, type: 'property', name: 'Marvin Gardens', group: 'yellow' },
  { position: 30, type: 'go_to_jail', name: 'Go To Jail' },
  { position: 31, type: 'property', name: 'Pacific Avenue', group: 'green' },
  { position: 32, type: 'property', name: 'North Carolina Avenue', group: 'green' },
  { position: 33, type: 'community_chest', name: 'Community Chest' },
  { position: 34, type: 'property', name: 'Pennsylvania Avenue', group: 'green' },
  { position: 35, type: 'railroad', name: 'Short Line' },
  { position: 36, type: 'chance', name: 'Chance' },
  { position: 37, type: 'property', name: 'Park Place', group: 'darkblue' },
  { position: 38, type: 'tax', name: 'Luxury Tax', amount: 100 },
  { position: 39, type: 'property', name: 'Boardwalk', group: 'darkblue' },
];

export const PROPERTY_DETAILS = {
  'Mediterranean Avenue': { price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, color: 'brown' },
  'Baltic Avenue': { price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, color: 'brown' },
  'Oriental Avenue': { price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: 'lightblue' },
  'Vermont Avenue': { price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, color: 'lightblue' },
  'Connecticut Avenue': { price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, color: 'lightblue' },
  'St. Charles Place': { price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: 'pink' },
  'States Avenue': { price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, color: 'pink' },
  'Virginia Avenue': { price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, color: 'pink' },
  'St. James Place': { price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: 'orange' },
  'Tennessee Avenue': { price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, color: 'orange' },
  'New York Avenue': { price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, color: 'orange' },
  'Kentucky Avenue': { price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: 'red' },
  'Indiana Avenue': { price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, color: 'red' },
  'Illinois Avenue': { price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, color: 'red' },
  'Atlantic Avenue': { price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: 'yellow' },
  'Ventnor Avenue': { price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, color: 'yellow' },
  'Marvin Gardens': { price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, color: 'yellow' },
  'Pacific Avenue': { price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: 'green' },
  'North Carolina Avenue': { price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, color: 'green' },
  'Pennsylvania Avenue': { price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, color: 'green' },
  'Park Place': { price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, color: 'darkblue' },
  'Boardwalk': { price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, color: 'darkblue' },
  // Railroads and utilities have special rent rules, handled in logic
  'Reading Railroad': { price: 200, type: 'railroad' },
  'Pennsylvania Railroad': { price: 200, type: 'railroad' },
  'B. & O. Railroad': { price: 200, type: 'railroad' },
  'Short Line': { price: 200, type: 'railroad' },
  'Electric Company': { price: 150, type: 'utility' },
  'Water Works': { price: 150, type: 'utility' },
};

export const CHANCE_CARDS = [
  { description: 'Advance to GO', action: (player) => { player.position = 0; player.money += 200; } },
  { description: 'Bank error in your favor. Collect $200', action: (player) => { player.money += 200; } },
  // Add more...
  { description: 'Go to Jail', action: (player) => { player.position = 10; player.inJail = true; } },
];

export const COMMUNITY_CHEST_CARDS = [
  { description: 'Collect $50 from every player', action: (player, players) => { players.forEach(p => { if (p !== player) { p.money -= 50; player.money += 50; } }); } },
  { description: 'Pay school fees of $50', action: (player) => { player.money -= 50; } },
  // Add more...
];

export const STARTING_MONEY = 1500;
export const GO_MONEY = 200;
export const JAIL_POSITION = 10;