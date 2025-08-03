/**
 * Formatting utilities
 */

export const formatters = {
    formatMoney: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatPosition: (position) => {
        const positions = [
            'GO', 'Mediterranean Ave', 'Community Chest', 'Baltic Ave', 'Income Tax',
            'Reading Railroad', 'Oriental Ave', 'Chance', 'Vermont Ave', 'Connecticut Ave',
            'Jail', 'St. Charles Place', 'Electric Company', 'States Ave', 'Virginia Ave',
            'Pennsylvania Railroad', 'St. James Place', 'Community Chest', 'Tennessee Ave', 'New York Ave',
            'Free Parking', 'Kentucky Ave', 'Chance', 'Indiana Ave', 'Illinois Ave',
            'B. & O. Railroad', 'Atlantic Ave', 'Ventnor Ave', 'Water Works', 'Marvin Gardens',
            'Go to Jail', 'Pacific Ave', 'North Carolina Ave', 'Community Chest', 'Pennsylvania Ave',
            'Short Line', 'Chance', 'Park Place', 'Luxury Tax', 'Boardwalk'
        ];
        return positions[position] || `Position ${position}`;
    },

    formatTime: (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
};