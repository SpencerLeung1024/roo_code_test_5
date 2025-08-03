// Card data for Monopoly Game

// Chance cards
const chanceCards = [
    {
        id: 1,
        type: "chance",
        text: "Advance to GO (Collect $200)",
        action: (player, playerManager, boardManager) => {
            player.moveTo(0);
            player.addMoney(200);
            return "Advanced to GO and collected $200!";
        }
    },
    {
        id: 2,
        type: "chance",
        text: "Advance to Illinois Ave. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(24);
            if (oldPosition > 24) {
                player.addMoney(200);
                return "Advanced to Illinois Ave and collected $200 for passing GO!";
            }
            return "Advanced to Illinois Ave!";
        }
    },
    {
        id: 3,
        type: "chance",
        text: "Advance to St. Charles Place. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(11);
            if (oldPosition > 11 && oldPosition <= 30) {
                player.addMoney(200);
                return "Advanced to St. Charles Place and collected $200 for passing GO!";
            }
            return "Advanced to St. Charles Place!";
        }
    },
    {
        id: 4,
        type: "chance",
        text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.",
        action: (player, playerManager, boardManager, diceRoll) => {
            if (player.position < 12 || player.position > 28) {
                player.moveTo(12);
            } else {
                player.moveTo(28);
            }
            return "Advanced to nearest Utility!";
        }
    },
    {
        id: 5,
        type: "chance",
        text: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.",
        action: (player, playerManager, boardManager) => {
            if (player.position < 5) {
                player.moveTo(5);
            } else if (player.position < 15) {
                player.moveTo(15);
            } else if (player.position < 25) {
                player.moveTo(25);
            } else if (player.position < 35) {
                player.moveTo(35);
            } else {
                player.moveTo(5);
            }
            return "Advanced to nearest Railroad!";
        }
    },
    {
        id: 6,
        type: "chance",
        text: "Bank pays you dividend of $50",
        action: (player, playerManager, boardManager) => {
            player.addMoney(50);
            return "Received $50 dividend from the Bank!";
        }
    },
    {
        id: 7,
        type: "chance",
        text: "Get out of Jail Free. This card may be kept until needed, or traded/sold",
        action: (player, playerManager, boardManager) => {
            player.getOutOfJailFreeCards++;
            return "Received a Get Out of Jail Free card!";
        }
    },
    {
        id: 8,
        type: "chance",
        text: "Go Back 3 Spaces",
        action: (player, playerManager, boardManager) => {
            player.moveTo((player.position - 3 + 40) % 40);
            return "Went back 3 spaces!";
        }
    },
    {
        id: 9,
        type: "chance",
        text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200",
        action: (player, playerManager, boardManager) => {
            player.goToJail();
            return "Went to Jail!";
        }
    },
    {
        id: 10,
        type: "chance",
        text: "Make general repairs on all your property. For each house pay $25. For each hotel pay $100",
        action: (player, playerManager, boardManager) => {
            // Simplified implementation - just deduct a fixed amount
            player.deductMoney(50);
            return "Made general repairs and paid $50!";
        }
    },
    {
        id: 11,
        type: "chance",
        text: "Pay poor tax of $15",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(15);
            return "Paid poor tax of $15!";
        }
    },
    {
        id: 12,
        type: "chance",
        text: "Take a trip to Reading Railroad. If you pass GO, collect $200",
        action: (player, playerManager, boardManager) => {
            const oldPosition = player.position;
            player.moveTo(5);
            if (oldPosition > 5 && oldPosition <= 30) {
                player.addMoney(200);
                return "Took a trip to Reading Railroad and collected $200 for passing GO!";
            }
            return "Took a trip to Reading Railroad!";
        }
    },
    {
        id: 13,
        type: "chance",
        text: "Take a walk on the Boardwalk. Advance token to Boardwalk",
        action: (player, playerManager, boardManager) => {
            player.moveTo(39);
            return "Took a walk on the Boardwalk!";
        }
    },
    {
        id: 14,
        type: "chance",
        text: "You have been elected Chairman of the Board. Pay each player $50",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalPaid = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (player.deductMoney(50)) {
                        otherPlayer.addMoney(50);
                        totalPaid += 50;
                    }
                }
            }
            return `Elected Chairman of the Board and paid $${totalPaid} to other players!`;
        }
    },
    {
        id: 15,
        type: "chance",
        text: "Your building loan matures. Collect $150",
        action: (player, playerManager, boardManager) => {
            player.addMoney(150);
            return "Building loan matured and collected $150!";
        }
    },
    {
        id: 16,
        type: "chance",
        text: "You have won a crossword competition. Collect $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Won a crossword competition and collected $100!";
        }
    }
];

// Community Chest cards
const communityChestCards = [
    {
        id: 1,
        type: "community",
        text: "Advance to GO (Collect $200)",
        action: (player, playerManager, boardManager) => {
            player.moveTo(0);
            player.addMoney(200);
            return "Advanced to GO and collected $200!";
        }
    },
    {
        id: 2,
        type: "community",
        text: "Bank error in your favor. Collect $200",
        action: (player, playerManager, boardManager) => {
            player.addMoney(200);
            return "Bank error in your favor. Collected $200!";
        }
    },
    {
        id: 3,
        type: "community",
        text: "Doctor's fees. Pay $50",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(50);
            return "Paid Doctor's fees of $50!";
        }
    },
    {
        id: 4,
        type: "community",
        text: "Get out of Jail Free. This card may be kept until needed, or traded/sold",
        action: (player, playerManager, boardManager) => {
            player.getOutOfJailFreeCards++;
            return "Received a Get Out of Jail Free card!";
        }
    },
    {
        id: 5,
        type: "community",
        text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect $200",
        action: (player, playerManager, boardManager) => {
            player.goToJail();
            return "Went to Jail!";
        }
    },
    {
        id: 6,
        type: "community",
        text: "Grand Opera Night. Collect $50 from every player for opening night seats",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalCollected = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (otherPlayer.deductMoney(50)) {
                        player.addMoney(50);
                        totalCollected += 50;
                    }
                }
            }
            return `Grand Opera Night! Collected $${totalCollected} from other players!`;
        }
    },
    {
        id: 7,
        type: "community",
        text: "Holiday Fund matures. Receive $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Holiday Fund matured. Received $100!";
        }
    },
    {
        id: 8,
        type: "community",
        text: "Income tax refund. Collect $20",
        action: (player, playerManager, boardManager) => {
            player.addMoney(20);
            return "Income tax refund. Collected $20!";
        }
    },
    {
        id: 9,
        type: "community",
        text: "It is your birthday. Collect $10 from every player",
        action: (player, playerManager, boardManager) => {
            const players = playerManager.getAllPlayers();
            let totalCollected = 0;
            for (const otherPlayer of players) {
                if (otherPlayer.id !== player.id && !otherPlayer.bankrupt) {
                    if (otherPlayer.deductMoney(10)) {
                        player.addMoney(10);
                        totalCollected += 10;
                    }
                }
            }
            return `It is your birthday! Collected $${totalCollected} from other players!`;
        }
    },
    {
        id: 10,
        type: "community",
        text: "Life insurance matures. Collect $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Life insurance matured. Collected $100!";
        }
    },
    {
        id: 11,
        type: "community",
        text: "Pay hospital fees of $100",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(100);
            return "Paid hospital fees of $100!";
        }
    },
    {
        id: 12,
        type: "community",
        text: "Pay school fees of $150",
        action: (player, playerManager, boardManager) => {
            player.deductMoney(150);
            return "Paid school fees of $150!";
        }
    },
    {
        id: 13,
        type: "community",
        text: "Receive $25 consultancy fee",
        action: (player, playerManager, boardManager) => {
            player.addMoney(25);
            return "Received $25 consultancy fee!";
        }
    },
    {
        id: 14,
        type: "community",
        text: "You are assessed for street repairs. $40 per house. $115 per hotel",
        action: (player, playerManager, boardManager) => {
            // Simplified implementation - just deduct a fixed amount
            player.deductMoney(50);
            return "Assessed for street repairs and paid $50!";
        }
    },
    {
        id: 15,
        type: "community",
        text: "You have won second prize in a beauty contest. Collect $10",
        action: (player, playerManager, boardManager) => {
            player.addMoney(10);
            return "Won second prize in a beauty contest. Collected $10!";
        }
    },
    {
        id: 16,
        type: "community",
        text: "You inherit $100",
        action: (player, playerManager, boardManager) => {
            player.addMoney(100);
            return "Inherited $100!";
        }
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { chanceCards, communityChestCards };
}