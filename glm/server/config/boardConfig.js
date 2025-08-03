// Complete Monopoly board configuration
// Contains all 40 spaces with their properties and attributes

const Property = require('../models/Property');
const Space = require('../models/Space');

class BoardConfig {
    static getBoardSpaces() {
        return [
            // Position 0: Go
            new Space({
                id: 'space_0',
                name: 'Go',
                type: 'go',
                position: 0,
                action: 'collect_money',
                data: { amount: 200 }
            }),
            
            // Position 1: Mediterranean Avenue
            new Property({
                id: 'property_1',
                name: 'Mediterranean Avenue',
                type: 'street',
                position: 1,
                colorGroup: 'brown',
                price: 60,
                rentLevels: [2, 10, 30, 90, 160, 250],
                houseCost: 50,
                hotelCost: 50,
                monopolyGroup: ['property_1', 'property_3']
            }),
            
            // Position 2: Community Chest
            new Space({
                id: 'space_2',
                name: 'Community Chest',
                type: 'communityChest',
                position: 2,
                action: 'draw_card',
                data: { cardType: 'communityChest' }
            }),
            
            // Position 3: Baltic Avenue
            new Property({
                id: 'property_3',
                name: 'Baltic Avenue',
                type: 'street',
                position: 3,
                colorGroup: 'brown',
                price: 60,
                rentLevels: [4, 20, 60, 180, 320, 450],
                houseCost: 50,
                hotelCost: 50,
                monopolyGroup: ['property_1', 'property_3']
            }),
            
            // Position 4: Income Tax
            new Space({
                id: 'space_4',
                name: 'Income Tax',
                type: 'tax',
                position: 4,
                action: 'pay_tax',
                data: { amount: 200, taxType: 'income' }
            }),
            
            // Position 5: Reading Railroad
            new Property({
                id: 'property_5',
                name: 'Reading Railroad',
                type: 'railroad',
                position: 5,
                colorGroup: 'railroad',
                price: 200,
                rentLevels: [25, 50, 100, 200],
                monopolyGroup: ['property_5', 'property_15', 'property_25', 'property_35']
            }),
            
            // Position 6: Oriental Avenue
            new Property({
                id: 'property_6',
                name: 'Oriental Avenue',
                type: 'street',
                position: 6,
                colorGroup: 'lightBlue',
                price: 100,
                rentLevels: [6, 30, 90, 270, 400, 550],
                houseCost: 50,
                hotelCost: 50,
                monopolyGroup: ['property_6', 'property_8', 'property_9']
            }),
            
            // Position 7: Chance
            new Space({
                id: 'space_7',
                name: 'Chance',
                type: 'chance',
                position: 7,
                action: 'draw_card',
                data: { cardType: 'chance' }
            }),
            
            // Position 8: Vermont Avenue
            new Property({
                id: 'property_8',
                name: 'Vermont Avenue',
                type: 'street',
                position: 8,
                colorGroup: 'lightBlue',
                price: 100,
                rentLevels: [6, 30, 90, 270, 400, 550],
                houseCost: 50,
                hotelCost: 50,
                monopolyGroup: ['property_6', 'property_8', 'property_9']
            }),
            
            // Position 9: Connecticut Avenue
            new Property({
                id: 'property_9',
                name: 'Connecticut Avenue',
                type: 'street',
                position: 9,
                colorGroup: 'lightBlue',
                price: 120,
                rentLevels: [8, 40, 100, 300, 450, 600],
                houseCost: 50,
                hotelCost: 50,
                monopolyGroup: ['property_6', 'property_8', 'property_9']
            }),
            
            // Position 10: Jail / Just Visiting
            new Space({
                id: 'space_10',
                name: 'Jail',
                type: 'jail',
                position: 10,
                action: 'jail_visit',
                data: { jailPosition: 10 }
            }),
            
            // Position 11: St. Charles Place
            new Property({
                id: 'property_11',
                name: 'St. Charles Place',
                type: 'street',
                position: 11,
                colorGroup: 'pink',
                price: 140,
                rentLevels: [10, 50, 150, 450, 625, 750],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_11', 'property_13', 'property_14']
            }),
            
            // Position 12: Electric Company
            new Property({
                id: 'property_12',
                name: 'Electric Company',
                type: 'utility',
                position: 12,
                colorGroup: 'utility',
                price: 150,
                rentLevels: [0], // Utilities have special rent calculation
                monopolyGroup: ['property_12', 'property_28']
            }),
            
            // Position 13: States Avenue
            new Property({
                id: 'property_13',
                name: 'States Avenue',
                type: 'street',
                position: 13,
                colorGroup: 'pink',
                price: 140,
                rentLevels: [10, 50, 150, 450, 625, 750],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_11', 'property_13', 'property_14']
            }),
            
            // Position 14: Virginia Avenue
            new Property({
                id: 'property_14',
                name: 'Virginia Avenue',
                type: 'street',
                position: 14,
                colorGroup: 'pink',
                price: 160,
                rentLevels: [12, 60, 180, 500, 700, 900],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_11', 'property_13', 'property_14']
            }),
            
            // Position 15: Pennsylvania Railroad
            new Property({
                id: 'property_15',
                name: 'Pennsylvania Railroad',
                type: 'railroad',
                position: 15,
                colorGroup: 'railroad',
                price: 200,
                rentLevels: [25, 50, 100, 200],
                monopolyGroup: ['property_5', 'property_15', 'property_25', 'property_35']
            }),
            
            // Position 16: St. James Place
            new Property({
                id: 'property_16',
                name: 'St. James Place',
                type: 'street',
                position: 16,
                colorGroup: 'orange',
                price: 180,
                rentLevels: [14, 70, 200, 550, 750, 950],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_16', 'property_18', 'property_19']
            }),
            
            // Position 17: Community Chest
            new Space({
                id: 'space_17',
                name: 'Community Chest',
                type: 'communityChest',
                position: 17,
                action: 'draw_card',
                data: { cardType: 'communityChest' }
            }),
            
            // Position 18: Tennessee Avenue
            new Property({
                id: 'property_18',
                name: 'Tennessee Avenue',
                type: 'street',
                position: 18,
                colorGroup: 'orange',
                price: 180,
                rentLevels: [14, 70, 200, 550, 750, 950],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_16', 'property_18', 'property_19']
            }),
            
            // Position 19: New York Avenue
            new Property({
                id: 'property_19',
                name: 'New York Avenue',
                type: 'street',
                position: 19,
                colorGroup: 'orange',
                price: 200,
                rentLevels: [16, 80, 220, 600, 800, 1000],
                houseCost: 100,
                hotelCost: 100,
                monopolyGroup: ['property_16', 'property_18', 'property_19']
            }),
            
            // Position 20: Free Parking
            new Space({
                id: 'space_20',
                name: 'Free Parking',
                type: 'freeParking',
                position: 20,
                action: 'free_parking',
                data: {}
            }),
            
            // Position 21: Kentucky Avenue
            new Property({
                id: 'property_21',
                name: 'Kentucky Avenue',
                type: 'street',
                position: 21,
                colorGroup: 'red',
                price: 220,
                rentLevels: [18, 90, 250, 700, 875, 1050],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_21', 'property_23', 'property_24']
            }),
            
            // Position 22: Chance
            new Space({
                id: 'space_22',
                name: 'Chance',
                type: 'chance',
                position: 22,
                action: 'draw_card',
                data: { cardType: 'chance' }
            }),
            
            // Position 23: Indiana Avenue
            new Property({
                id: 'property_23',
                name: 'Indiana Avenue',
                type: 'street',
                position: 23,
                colorGroup: 'red',
                price: 220,
                rentLevels: [18, 90, 250, 700, 875, 1050],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_21', 'property_23', 'property_24']
            }),
            
            // Position 24: Illinois Avenue
            new Property({
                id: 'property_24',
                name: 'Illinois Avenue',
                type: 'street',
                position: 24,
                colorGroup: 'red',
                price: 240,
                rentLevels: [20, 100, 300, 750, 925, 1100],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_21', 'property_23', 'property_24']
            }),
            
            // Position 25: B. & O. Railroad
            new Property({
                id: 'property_25',
                name: 'B. & O. Railroad',
                type: 'railroad',
                position: 25,
                colorGroup: 'railroad',
                price: 200,
                rentLevels: [25, 50, 100, 200],
                monopolyGroup: ['property_5', 'property_15', 'property_25', 'property_35']
            }),
            
            // Position 26: Atlantic Avenue
            new Property({
                id: 'property_26',
                name: 'Atlantic Avenue',
                type: 'street',
                position: 26,
                colorGroup: 'yellow',
                price: 260,
                rentLevels: [22, 110, 330, 800, 975, 1150],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_26', 'property_27', 'property_29']
            }),
            
            // Position 27: Ventnor Avenue
            new Property({
                id: 'property_27',
                name: 'Ventnor Avenue',
                type: 'street',
                position: 27,
                colorGroup: 'yellow',
                price: 260,
                rentLevels: [22, 110, 330, 800, 975, 1150],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_26', 'property_27', 'property_29']
            }),
            
            // Position 28: Water Works
            new Property({
                id: 'property_28',
                name: 'Water Works',
                type: 'utility',
                position: 28,
                colorGroup: 'utility',
                price: 150,
                rentLevels: [0], // Utilities have special rent calculation
                monopolyGroup: ['property_12', 'property_28']
            }),
            
            // Position 29: Marvin Gardens
            new Property({
                id: 'property_29',
                name: 'Marvin Gardens',
                type: 'street',
                position: 29,
                colorGroup: 'yellow',
                price: 280,
                rentLevels: [24, 120, 360, 850, 1025, 1200],
                houseCost: 150,
                hotelCost: 150,
                monopolyGroup: ['property_26', 'property_27', 'property_29']
            }),
            
            // Position 30: Go To Jail
            new Space({
                id: 'space_30',
                name: 'Go To Jail',
                type: 'goToJail',
                position: 30,
                action: 'go_to_jail',
                data: { jailPosition: 10 }
            }),
            
            // Position 31: Pacific Avenue
            new Property({
                id: 'property_31',
                name: 'Pacific Avenue',
                type: 'street',
                position: 31,
                colorGroup: 'green',
                price: 300,
                rentLevels: [26, 130, 390, 900, 1100, 1275],
                houseCost: 200,
                hotelCost: 200,
                monopolyGroup: ['property_31', 'property_32', 'property_34']
            }),
            
            // Position 32: North Carolina Avenue
            new Property({
                id: 'property_32',
                name: 'North Carolina Avenue',
                type: 'street',
                position: 32,
                colorGroup: 'green',
                price: 300,
                rentLevels: [26, 130, 390, 900, 1100, 1275],
                houseCost: 200,
                hotelCost: 200,
                monopolyGroup: ['property_31', 'property_32', 'property_34']
            }),
            
            // Position 33: Community Chest
            new Space({
                id: 'space_33',
                name: 'Community Chest',
                type: 'communityChest',
                position: 33,
                action: 'draw_card',
                data: { cardType: 'communityChest' }
            }),
            
            // Position 34: Pennsylvania Avenue
            new Property({
                id: 'property_34',
                name: 'Pennsylvania Avenue',
                type: 'street',
                position: 34,
                colorGroup: 'green',
                price: 320,
                rentLevels: [28, 150, 450, 1000, 1200, 1400],
                houseCost: 200,
                hotelCost: 200,
                monopolyGroup: ['property_31', 'property_32', 'property_34']
            }),
            
            // Position 35: Short Line Railroad
            new Property({
                id: 'property_35',
                name: 'Short Line Railroad',
                type: 'railroad',
                position: 35,
                colorGroup: 'railroad',
                price: 200,
                rentLevels: [25, 50, 100, 200],
                monopolyGroup: ['property_5', 'property_15', 'property_25', 'property_35']
            }),
            
            // Position 36: Chance
            new Space({
                id: 'space_36',
                name: 'Chance',
                type: 'chance',
                position: 36,
                action: 'draw_card',
                data: { cardType: 'chance' }
            }),
            
            // Position 37: Park Place
            new Property({
                id: 'property_37',
                name: 'Park Place',
                type: 'street',
                position: 37,
                colorGroup: 'darkBlue',
                price: 350,
                rentLevels: [35, 175, 500, 1100, 1300, 1500],
                houseCost: 200,
                hotelCost: 200,
                monopolyGroup: ['property_37', 'property_39']
            }),
            
            // Position 38: Luxury Tax
            new Space({
                id: 'space_38',
                name: 'Luxury Tax',
                type: 'tax',
                position: 38,
                action: 'pay_tax',
                data: { amount: 100, taxType: 'luxury' }
            }),
            
            // Position 39: Boardwalk
            new Property({
                id: 'property_39',
                name: 'Boardwalk',
                type: 'street',
                position: 39,
                colorGroup: 'darkBlue',
                price: 400,
                rentLevels: [50, 200, 600, 1400, 1700, 2000],
                houseCost: 200,
                hotelCost: 200,
                monopolyGroup: ['property_37', 'property_39']
            })
        ];
    }
    
    static getColorGroups() {
        return {
            brown: {
                name: 'Brown',
                properties: ['property_1', 'property_3'],
                houseCost: 50,
                hotelCost: 50
            },
            lightBlue: {
                name: 'Light Blue',
                properties: ['property_6', 'property_8', 'property_9'],
                houseCost: 50,
                hotelCost: 50
            },
            pink: {
                name: 'Pink',
                properties: ['property_11', 'property_13', 'property_14'],
                houseCost: 100,
                hotelCost: 100
            },
            orange: {
                name: 'Orange',
                properties: ['property_16', 'property_18', 'property_19'],
                houseCost: 100,
                hotelCost: 100
            },
            red: {
                name: 'Red',
                properties: ['property_21', 'property_23', 'property_24'],
                houseCost: 150,
                hotelCost: 150
            },
            yellow: {
                name: 'Yellow',
                properties: ['property_26', 'property_27', 'property_29'],
                houseCost: 150,
                hotelCost: 150
            },
            green: {
                name: 'Green',
                properties: ['property_31', 'property_32', 'property_34'],
                houseCost: 200,
                hotelCost: 200
            },
            darkBlue: {
                name: 'Dark Blue',
                properties: ['property_37', 'property_39'],
                houseCost: 200,
                hotelCost: 200
            },
            railroad: {
                name: 'Railroad',
                properties: ['property_5', 'property_15', 'property_25', 'property_35'],
                houseCost: 0,
                hotelCost: 0
            },
            utility: {
                name: 'Utility',
                properties: ['property_12', 'property_28'],
                houseCost: 0,
                hotelCost: 0
            }
        };
    }
    
    static getSpacePositions() {
        return {
            go: 0,
            mediterranean: 1,
            communityChest1: 2,
            baltic: 3,
            incomeTax: 4,
            reading: 5,
            oriental: 6,
            chance1: 7,
            vermont: 8,
            connecticut: 9,
            jail: 10,
            stCharles: 11,
            electric: 12,
            states: 13,
            virginia: 14,
            pennsylvania: 15,
            stJames: 16,
            communityChest2: 17,
            tennessee: 18,
            newYork: 19,
            freeParking: 20,
            kentucky: 21,
            chance2: 22,
            indiana: 23,
            illinois: 24,
            bo: 25,
            atlantic: 26,
            ventnor: 27,
            waterWorks: 28,
            marvin: 29,
            goToJail: 30,
            pacific: 31,
            northCarolina: 32,
            communityChest3: 33,
            pennsylvaniaAve: 34,
            shortLine: 35,
            chance3: 36,
            parkPlace: 37,
            luxuryTax: 38,
            boardwalk: 39
        };
    }
    
    static getBoardLayout() {
        return {
            // Standard Monopoly board layout
            // Each side has 11 spaces (including corners)
            bottomSide: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            leftSide: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            topSide: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 20], // Note: 20 (Free Parking) is shared
            rightSide: [21, 22, 23, 24, 25, 26, 27, 28, 29, 20]
        };
    }
}

module.exports = BoardConfig;