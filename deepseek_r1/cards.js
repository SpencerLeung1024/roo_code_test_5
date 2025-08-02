// Card definitions
const CHANCE_CARDS = [
    {
        id: 1,
        description: "Advance to Go. Collect $200.",
        action: (player) => {
            player.position = 0;
            player.receive(200);
        }
    },
    {
        id: 2,
        description: "Bank pays you dividend of $50.",
        action: (player) => {
            player.receive(50);
        }
    },
    {
        id: 3,
        description: "Go to Jail. Go directly to jail. Do not pass Go, do not collect $200.",
        action: (player) => {
            player.position = 10;
            player.inJail = true;
        }
    },
    {
        id: 4,
        description: "Make general repairs on all your property. Pay $25 per house.",
        action: (player, gameState) => {
            let totalCost = 0;
            player.properties.forEach(propertyId => {
                const ownership = gameState.properties[propertyId];
                if (ownership) {
                    totalCost += ownership.houses * 25;
                }
            });
            player.pay(totalCost);
            return `Paid $${totalCost} for property repairs`;
        }
    }
    // Add more cards as needed
];

const COMMUNITY_CHEST_CARDS = [
    {
        id: 1,
        description: "Bank error in your favor. Collect $200.",
        action: (player) => {
            player.receive(200);
        }
    },
    {
        id: 2,
        description: "Doctor's fee. Pay $50.",
        action: (player) => {
            player.pay(50);
        }
    },
    {
        id: 3,
        description: "Get Out of Jail Free. This card may be kept until needed.",
        action: (player) => {
            player.getOutOfJailCards += 1;
        }
    },
    {
        id: 4,
        description: "Grand Opera Night. Collect $50 from every player.",
        action: (player, gameState) => {
            gameState.players.forEach(otherPlayer => {
                if (otherPlayer.id !== player.id) {
                    const amount = Math.min(50, otherPlayer.money);
                    otherPlayer.pay(amount);
                    player.receive(amount);
                }
            });
            return `Collected $50 from each player`;
        }
    }
    // Add more cards as needed
];

// Card deck management
let chanceDeck = [...CHANCE_CARDS];
let communityChestDeck = [...COMMUNITY_CHEST_CARDS];

// Shuffle deck
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Draw a card from deck
function drawCard(deck) {
    if (deck.length === 0) {
        // Re-shuffle discard pile if needed
        deck = [...(deck === chanceDeck ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS)];
        shuffle(deck);
    }
    return deck.pop();
}

// Initialize decks
document.addEventListener('DOMContentLoaded', () => {
    shuffle(chanceDeck);
    shuffle(communityChestDeck);
});