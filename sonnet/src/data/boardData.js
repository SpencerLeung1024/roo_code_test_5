// Board space definitions for Monopoly game
// Board positions 0-39, starting from GO and moving clockwise

export const BOARD_SPACES = [
  // Bottom row (0-10) - Right to left
  {
    id: 0,
    name: 'GO',
    type: 'special',
    specialType: 'go',
    side: 'bottom',
    sidePosition: 10,
    color: '#ff0000',
    textColor: '#ffffff',
    action: 'special'
  },
  {
    id: 1,
    name: 'Mediterranean Avenue',
    type: 'property',
    colorGroup: '#8B4513',
    side: 'bottom',
    sidePosition: 9,
    color: '#8B4513',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 2,
    name: 'Community Chest',
    type: 'card',
    cardType: 'communityChest',
    side: 'bottom',
    sidePosition: 8,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'card'
  },
  {
    id: 3,
    name: 'Baltic Avenue',
    type: 'property',
    colorGroup: '#8B4513',
    side: 'bottom',
    sidePosition: 7,
    color: '#8B4513',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 4,
    name: 'Income Tax',
    type: 'tax',
    taxAmount: 200,
    side: 'bottom',
    sidePosition: 6,
    color: '#D3D3D3',
    textColor: '#000000',
    action: 'tax'
  },
  {
    id: 5,
    name: 'Reading Railroad',
    type: 'railroad',
    side: 'bottom',
    sidePosition: 5,
    color: '#000000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 6,
    name: 'Oriental Avenue',
    type: 'property',
    colorGroup: '#87CEEB',
    side: 'bottom',
    sidePosition: 4,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 7,
    name: 'Chance',
    type: 'card',
    cardType: 'chance',
    side: 'bottom',
    sidePosition: 3,
    color: '#FF6347',
    textColor: '#ffffff',
    action: 'card'
  },
  {
    id: 8,
    name: 'Vermont Avenue',
    type: 'property',
    colorGroup: '#87CEEB',
    side: 'bottom',
    sidePosition: 2,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 9,
    name: 'Connecticut Avenue',
    type: 'property',
    colorGroup: '#87CEEB',
    side: 'bottom',
    sidePosition: 1,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'buy'
  },
  
  // Left side (10-20) - Bottom to top
  {
    id: 10,
    name: 'Jail / Just Visiting',
    type: 'special',
    specialType: 'jail',
    side: 'left',
    sidePosition: 0,
    color: '#FFA500',
    textColor: '#000000',
    action: 'special'
  },
  {
    id: 11,
    name: 'St. Charles Place',
    type: 'property',
    colorGroup: '#FF69B4',
    side: 'left',
    sidePosition: 1,
    color: '#FF69B4',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 12,
    name: 'Electric Company',
    type: 'utility',
    side: 'left',
    sidePosition: 2,
    color: '#FFFF00',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 13,
    name: 'States Avenue',
    type: 'property',
    colorGroup: '#FF69B4',
    side: 'left',
    sidePosition: 3,
    color: '#FF69B4',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 14,
    name: 'Virginia Avenue',
    type: 'property',
    colorGroup: '#FF69B4',
    side: 'left',
    sidePosition: 4,
    color: '#FF69B4',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 15,
    name: 'Pennsylvania Railroad',
    type: 'railroad',
    side: 'left',
    sidePosition: 5,
    color: '#000000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 16,
    name: 'St. James Place',
    type: 'property',
    colorGroup: '#FFA500',
    side: 'left',
    sidePosition: 6,
    color: '#FFA500',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 17,
    name: 'Community Chest',
    type: 'card',
    cardType: 'communityChest',
    side: 'left',
    sidePosition: 7,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'card'
  },
  {
    id: 18,
    name: 'Tennessee Avenue',
    type: 'property',
    colorGroup: '#FFA500',
    side: 'left',
    sidePosition: 8,
    color: '#FFA500',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 19,
    name: 'New York Avenue',
    type: 'property',
    colorGroup: '#FFA500',
    side: 'left',
    sidePosition: 9,
    color: '#FFA500',
    textColor: '#000000',
    action: 'buy'
  },
  
  // Top side (20-30) - Left to right
  {
    id: 20,
    name: 'Free Parking',
    type: 'special',
    specialType: 'freeParking',
    side: 'top',
    sidePosition: 0,
    color: '#32CD32',
    textColor: '#000000',
    action: 'special'
  },
  {
    id: 21,
    name: 'Kentucky Avenue',
    type: 'property',
    colorGroup: '#FF0000',
    side: 'top',
    sidePosition: 1,
    color: '#FF0000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 22,
    name: 'Chance',
    type: 'card',
    cardType: 'chance',
    side: 'top',
    sidePosition: 2,
    color: '#FF6347',
    textColor: '#ffffff',
    action: 'card'
  },
  {
    id: 23,
    name: 'Indiana Avenue',
    type: 'property',
    colorGroup: '#FF0000',
    side: 'top',
    sidePosition: 3,
    color: '#FF0000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 24,
    name: 'Illinois Avenue',
    type: 'property',
    colorGroup: '#FF0000',
    side: 'top',
    sidePosition: 4,
    color: '#FF0000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 25,
    name: 'B&O Railroad',
    type: 'railroad',
    side: 'top',
    sidePosition: 5,
    color: '#000000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 26,
    name: 'Atlantic Avenue',
    type: 'property',
    colorGroup: '#FFFF00',
    side: 'top',
    sidePosition: 6,
    color: '#FFFF00',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 27,
    name: 'Ventnor Avenue',
    type: 'property',
    colorGroup: '#FFFF00',
    side: 'top',
    sidePosition: 7,
    color: '#FFFF00',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 28,
    name: 'Water Works',
    type: 'utility',
    side: 'top',
    sidePosition: 8,
    color: '#FFFF00',
    textColor: '#000000',
    action: 'buy'
  },
  {
    id: 29,
    name: 'Marvin Gardens',
    type: 'property',
    colorGroup: '#FFFF00',
    side: 'top',
    sidePosition: 9,
    color: '#FFFF00',
    textColor: '#000000',
    action: 'buy'
  },
  
  // Right side (30-39) - Top to bottom
  {
    id: 30,
    name: 'Go to Jail',
    type: 'special',
    specialType: 'goToJail',
    side: 'right',
    sidePosition: 0,
    color: '#DC143C',
    textColor: '#ffffff',
    action: 'special'
  },
  {
    id: 31,
    name: 'Pacific Avenue',
    type: 'property',
    colorGroup: '#008000',
    side: 'right',
    sidePosition: 1,
    color: '#008000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 32,
    name: 'North Carolina Avenue',
    type: 'property',
    colorGroup: '#008000',
    side: 'right',
    sidePosition: 2,
    color: '#008000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 33,
    name: 'Community Chest',
    type: 'card',
    cardType: 'communityChest',
    side: 'right',
    sidePosition: 3,
    color: '#87CEEB',
    textColor: '#000000',
    action: 'card'
  },
  {
    id: 34,
    name: 'Pennsylvania Avenue',
    type: 'property',
    colorGroup: '#008000',
    side: 'right',
    sidePosition: 4,
    color: '#008000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 35,
    name: 'Short Line Railroad',
    type: 'railroad',
    side: 'right',
    sidePosition: 5,
    color: '#000000',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 36,
    name: 'Chance',
    type: 'card',
    cardType: 'chance',
    side: 'right',
    sidePosition: 6,
    color: '#FF6347',
    textColor: '#ffffff',
    action: 'card'
  },
  {
    id: 37,
    name: 'Park Place',
    type: 'property',
    colorGroup: '#000080',
    side: 'right',
    sidePosition: 7,
    color: '#000080',
    textColor: '#ffffff',
    action: 'buy'
  },
  {
    id: 38,
    name: 'Luxury Tax',
    type: 'tax',
    taxAmount: 75,
    side: 'right',
    sidePosition: 8,
    color: '#D3D3D3',
    textColor: '#000000',
    action: 'tax'
  },
  {
    id: 39,
    name: 'Boardwalk',
    type: 'property',
    colorGroup: '#000080',
    side: 'right',
    sidePosition: 9,
    color: '#000080',
    textColor: '#ffffff',
    action: 'buy'
  }
]

// Property definitions with pricing and rent structures
export const PROPERTIES = {
  1: { // Mediterranean Avenue
    id: 1,
    name: 'Mediterranean Avenue',
    colorGroup: '#8B4513',
    colorGroupName: 'Brown',
    price: 60,
    rent: [2, 10, 30, 90, 160, 250], // [base, 1house, 2house, 3house, 4house, hotel]
    houseCost: 50,
    mortgageValue: 30,
    groupProperties: [1, 3],
    groupSize: 2
  },
  3: { // Baltic Avenue
    id: 3,
    name: 'Baltic Avenue',
    colorGroup: '#8B4513',
    colorGroupName: 'Brown',
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    mortgageValue: 30,
    groupProperties: [1, 3],
    groupSize: 2
  },
  6: { // Oriental Avenue
    id: 6,
    name: 'Oriental Avenue',
    colorGroup: '#87CEEB',
    colorGroupName: 'Light Blue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgageValue: 50,
    groupProperties: [6, 8, 9],
    groupSize: 3
  },
  8: { // Vermont Avenue
    id: 8,
    name: 'Vermont Avenue',
    colorGroup: '#87CEEB',
    colorGroupName: 'Light Blue',
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgageValue: 50,
    groupProperties: [6, 8, 9],
    groupSize: 3
  },
  9: { // Connecticut Avenue
    id: 9,
    name: 'Connecticut Avenue',
    colorGroup: '#87CEEB',
    colorGroupName: 'Light Blue',
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    mortgageValue: 60,
    groupProperties: [6, 8, 9],
    groupSize: 3
  },
  11: { // St. Charles Place
    id: 11,
    name: 'St. Charles Place',
    colorGroup: '#FF69B4',
    colorGroupName: 'Pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgageValue: 70,
    groupProperties: [11, 13, 14],
    groupSize: 3
  },
  13: { // States Avenue
    id: 13,
    name: 'States Avenue',
    colorGroup: '#FF69B4',
    colorGroupName: 'Pink',
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgageValue: 70,
    groupProperties: [11, 13, 14],
    groupSize: 3
  },
  14: { // Virginia Avenue
    id: 14,
    name: 'Virginia Avenue',
    colorGroup: '#FF69B4',
    colorGroupName: 'Pink',
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    mortgageValue: 80,
    groupProperties: [11, 13, 14],
    groupSize: 3
  },
  16: { // St. James Place
    id: 16,
    name: 'St. James Place',
    colorGroup: '#FFA500',
    colorGroupName: 'Orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgageValue: 90,
    groupProperties: [16, 18, 19],
    groupSize: 3
  },
  18: { // Tennessee Avenue
    id: 18,
    name: 'Tennessee Avenue',
    colorGroup: '#FFA500',
    colorGroupName: 'Orange',
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgageValue: 90,
    groupProperties: [16, 18, 19],
    groupSize: 3
  },
  19: { // New York Avenue
    id: 19,
    name: 'New York Avenue',
    colorGroup: '#FFA500',
    colorGroupName: 'Orange',
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    mortgageValue: 100,
    groupProperties: [16, 18, 19],
    groupSize: 3
  },
  21: { // Kentucky Avenue
    id: 21,
    name: 'Kentucky Avenue',
    colorGroup: '#FF0000',
    colorGroupName: 'Red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgageValue: 110,
    groupProperties: [21, 23, 24],
    groupSize: 3
  },
  23: { // Indiana Avenue
    id: 23,
    name: 'Indiana Avenue',
    colorGroup: '#FF0000',
    colorGroupName: 'Red',
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgageValue: 110,
    groupProperties: [21, 23, 24],
    groupSize: 3
  },
  24: { // Illinois Avenue
    id: 24,
    name: 'Illinois Avenue',
    colorGroup: '#FF0000',
    colorGroupName: 'Red',
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    mortgageValue: 120,
    groupProperties: [21, 23, 24],
    groupSize: 3
  },
  26: { // Atlantic Avenue
    id: 26,
    name: 'Atlantic Avenue',
    colorGroup: '#FFFF00',
    colorGroupName: 'Yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgageValue: 130,
    groupProperties: [26, 27, 29],
    groupSize: 3
  },
  27: { // Ventnor Avenue
    id: 27,
    name: 'Ventnor Avenue',
    colorGroup: '#FFFF00',
    colorGroupName: 'Yellow',
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgageValue: 130,
    groupProperties: [26, 27, 29],
    groupSize: 3
  },
  29: { // Marvin Gardens
    id: 29,
    name: 'Marvin Gardens',
    colorGroup: '#FFFF00',
    colorGroupName: 'Yellow',
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    mortgageValue: 140,
    groupProperties: [26, 27, 29],
    groupSize: 3
  },
  31: { // Pacific Avenue
    id: 31,
    name: 'Pacific Avenue',
    colorGroup: '#008000',
    colorGroupName: 'Green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgageValue: 150,
    groupProperties: [31, 32, 34],
    groupSize: 3
  },
  32: { // North Carolina Avenue
    id: 32,
    name: 'North Carolina Avenue',
    colorGroup: '#008000',
    colorGroupName: 'Green',
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgageValue: 150,
    groupProperties: [31, 32, 34],
    groupSize: 3
  },
  34: { // Pennsylvania Avenue
    id: 34,
    name: 'Pennsylvania Avenue',
    colorGroup: '#008000',
    colorGroupName: 'Green',
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    mortgageValue: 160,
    groupProperties: [31, 32, 34],
    groupSize: 3
  },
  37: { // Park Place
    id: 37,
    name: 'Park Place',
    colorGroup: '#000080',
    colorGroupName: 'Dark Blue',
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    mortgageValue: 175,
    groupProperties: [37, 39],
    groupSize: 2
  },
  39: { // Boardwalk
    id: 39,
    name: 'Boardwalk',
    colorGroup: '#000080',
    colorGroupName: 'Dark Blue',
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    mortgageValue: 200,
    groupProperties: [37, 39],
    groupSize: 2
  }
}

// Railroad definitions
export const RAILROADS = {
  5: { // Reading Railroad
    id: 5,
    name: 'Reading Railroad',
    price: 200,
    mortgageValue: 100,
    rentSchedule: [25, 50, 100, 200] // 1, 2, 3, 4 railroads owned
  },
  15: { // Pennsylvania Railroad
    id: 15,
    name: 'Pennsylvania Railroad',
    price: 200,
    mortgageValue: 100,
    rentSchedule: [25, 50, 100, 200]
  },
  25: { // B&O Railroad
    id: 25,
    name: 'B&O Railroad',
    price: 200,
    mortgageValue: 100,
    rentSchedule: [25, 50, 100, 200]
  },
  35: { // Short Line Railroad
    id: 35,
    name: 'Short Line Railroad',
    price: 200,
    mortgageValue: 100,
    rentSchedule: [25, 50, 100, 200]
  }
}

// Utility definitions
export const UTILITIES = {
  12: { // Electric Company
    id: 12,
    name: 'Electric Company',
    price: 150,
    mortgageValue: 75,
    rentMultipliers: [4, 10] // 1 utility owned, 2 utilities owned
  },
  28: { // Water Works
    id: 28,
    name: 'Water Works',
    price: 150,
    mortgageValue: 75,
    rentMultipliers: [4, 10]
  }
}

// Color group definitions
export const COLOR_GROUPS = {
  '#8B4513': {
    name: 'Brown',
    color: '#8B4513',
    properties: [1, 3],
    houseCost: 50
  },
  '#87CEEB': {
    name: 'Light Blue',
    color: '#87CEEB',
    properties: [6, 8, 9],
    houseCost: 50
  },
  '#FF69B4': {
    name: 'Pink',
    color: '#FF69B4',
    properties: [11, 13, 14],
    houseCost: 100
  },
  '#FFA500': {
    name: 'Orange',
    color: '#FFA500',
    properties: [16, 18, 19],
    houseCost: 100
  },
  '#FF0000': {
    name: 'Red',
    color: '#FF0000',
    properties: [21, 23, 24],
    houseCost: 150
  },
  '#FFFF00': {
    name: 'Yellow',
    color: '#FFFF00',
    properties: [26, 27, 29],
    houseCost: 150
  },
  '#008000': {
    name: 'Green',
    color: '#008000',
    properties: [31, 32, 34],
    houseCost: 200
  },
  '#000080': {
    name: 'Dark Blue',
    color: '#000080',
    properties: [37, 39],
    houseCost: 200
  }
}