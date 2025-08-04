// Unus Venditor - Card Decks and Logic

// Using a seeded random number generator for predictability if needed later.
// For now, Math.random() is fine.
const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

// =========================================================================================
// C H A N C E   C A R D S
// =========================================================================================
let chanceCards = [
    {
        text: "Advance to Go (Collect $200)",
        action: { type: 'move_to', position: 0, collectGo: true }
    },
    {
        text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200.",
        action: { type: 'go_to_jail' }
    },
    {
        text: "Bank pays you dividend of $50.",
        action: { type: 'money', amount: 50 }
    },
    {
        text: "Get Out of Jail Free. This card may be kept until needed or sold.",
        action: { type: 'get_out_of_jail_free' }
    },
    {
        text: "You have been elected Chairman of the Board. Pay each player $50.",
        action: { type: 'pay_players', amount: 50 }
    },
    {
        text: "Your building loan matures. Collect $150.",
        action: { type: 'money', amount: 150 }
    },
];

// =========================================================================================
// C O M M U N I T Y   C H E S T   C A R D S
// =========================================================================================
let communityChestCards = [
    {
        text: "Advance to Go (Collect $200)",
        action: { type: 'move_to', position: 0, collectGo: true }
    },
    {
        text: "Bank error in your favor. Collect $200.",
        action: { type: 'money', amount: 200 }
    },
    {
        text: "Doctor’s fee. Pay $50.",
        action: { type: 'money', amount: -50 }
    },
    {
        text: "From sale of stock you get $50.",
        action: { type: 'money', amount: 50 }
    },
    {
        text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200.",
        action: { type: 'go_to_jail' }
    },
    {
        text: "Get Out of Jail Free. This card may be kept until needed or sold.",
        action: { type: 'get_out_of_jail_free' }
    },
    {
        text: "Holiday fund matures. Receive $100.",
        action: { type: 'money', amount: 100 }
    },
    {
        text: "It is your birthday. Collect $10 from every player.",
        action: { type: 'collect_from_players', amount: 10 }
    }
];

// Shuffle the decks initially
shuffle(chanceCards);
shuffle(communityChestCards);

let chanceCardIndex = 0;
let communityChestCardIndex = 0;

/**
 * Draws the next card from the Chance deck.
 * @returns {object} The card that was drawn.
 */
export function drawChanceCard() {
    const card = chanceCards[chanceCardIndex];
    chanceCardIndex = (chanceCardIndex + 1) % chanceCards.length;
    // Reshuffle if we've gone through the whole deck
    if (chanceCardIndex === 0) {
        shuffle(chanceCards);
    }
    return card;
}

/**
 * Draws the next card from the Community Chest deck.
 * @returns {object} The card that was drawn.
 */
export function drawCommunityChestCard() {
    const card = communityChestCards[communityChestCardIndex];
    communityChestCardIndex = (communityChestCardIndex + 1) % communityChestCards.length;
    // Reshuffle if we've gone through the whole deck
    if (communityChestCardIndex === 0) {
        shuffle(communityChestCards);
    }
    return card;
}