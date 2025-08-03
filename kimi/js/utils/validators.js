/**
 * Validation utilities
 */

export const validators = {
    isValidPlayerName: (name) => {
        return name && name.length >= 1 && name.length <= 20;
    },

    isValidMoneyAmount: (amount) => {
        return Number.isInteger(amount) && amount >= 0;
    },

    isValidPosition: (position) => {
        return Number.isInteger(position) && position >= 0 && position < 40;
    },

    isValidPropertyId: (id) => {
        return id && typeof id === 'string' && id.startsWith('property_');
    },

    isValidPlayerId: (id) => {
        return id && typeof id === 'string' && id.startsWith('player_');
    }
};