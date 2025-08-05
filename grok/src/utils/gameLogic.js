// Core game logic for Monopoly
import { BOARD, PROPERTY_DETAILS, CHANCE_CARDS, COMMUNITY_CHEST_CARDS, BOARD_SIZE, STARTING_MONEY, GO_MONEY, JAIL_POSITION } from './constants';

export function initializeGame(numPlayers) {
  const players = Array.from({ length: numPlayers }, (_, index) => ({
    id: index,
    name: `Player ${index + 1}`,
    position: 0,
    money: STARTING_MONEY,
    properties: [],
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: 0,
    doublesCount: 0,
    bankrupt: false,
  }));

  const ownership = new Array(BOARD_SIZE).fill(null); // null means unowned
  const houses = new Array(BOARD_SIZE).fill(0); // Number of houses/hotels
  const mortgaged = new Array(BOARD_SIZE).fill(false);
  const freeParkingPot = 0;
  
  return {
    players,
    currentTurn: 0,
    ownership,
    houses,
    mortgaged,
    freeParkingPot,
    chanceDeck: [...CHANCE_CARDS],
    communityDeck: [...COMMUNITY_CHEST_CARDS],
  };
}
export function isMonopoly(gameState, ownerId, group) {
  const groupProperties = BOARD.filter(s => s.type === 'property' && s.group === group).map(s => s.position);
  return groupProperties.every(pos => gameState.ownership[pos] === ownerId);
}


export function rollDice() {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, total: die1 + die2 };
}

export function movePlayer(player, roll, gameState) {
  const oldPosition = player.position;
  player.position = (oldPosition + roll.total) % BOARD_SIZE;
  if (oldPosition + roll.total >= BOARD_SIZE) {
    player.money += GO_MONEY;
  }
  const result = resolveLanding(gameState, player, roll);
  return result;
}

export function resolveLanding(gameState, player, roll) {
  const square = BOARD[player.position];
  let result = null;
  switch (square.type) {
    case 'property':
    case 'railroad':
    case 'utility':
      result = handlePropertyLanding(gameState, player, square, roll);
      break;
    case 'chance':
      const chanceCard = drawCard(gameState.chanceDeck, player, gameState.players);
      result = { type: 'drew_card', card: chanceCard, deck: 'chance' };
      break;
    case 'community_chest':
      const communityCard = drawCard(gameState.communityDeck, player, gameState.players);
      result = { type: 'drew_card', card: communityCard, deck: 'community_chest' };
      break;
    case 'tax':
      player.money -= square.amount;
      gameState.freeParkingPot += square.amount;
      result = { type: 'paid_tax', amount: square.amount };
      handleBankruptcy(player, gameState);
      break;
    case 'go_to_jail':
      player.position = JAIL_POSITION;
      player.inJail = true;
      player.jailTurns = 0;
      result = { type: 'went_to_jail' };
      break;
    case 'jail':
    case 'go':
      result = { type: 'no_action' };
      break;
    case 'free_parking':
      const amount = gameState.freeParkingPot;
      player.money += amount;
      gameState.freeParkingPot = 0;
      result = { type: 'collected_pot', amount };
      break;
    default:
      console.log('Unknown square type');
      result = { type: 'unknown' };
  }
  handleBankruptcy(player, gameState);
  return result;
}

export function handlePropertyLanding(gameState, player, square, roll) {
  const pos = player.position;
  const ownerId = gameState.ownership[pos];
  if (ownerId === null) {
    return { type: 'can_buy', position: pos };
  } else if (ownerId !== player.id) {
    const owner = gameState.players.find(p => p.id === ownerId);
    const rent = calculateRent(square, gameState, owner, roll ? roll.total : 0);
    player.money -= rent;
    owner.money += rent;
    handleBankruptcy(player, gameState, ownerId);
    return { type: 'paid_rent', amount: rent, to: ownerId };
  }
  return { type: 'own_property' };
}

export function buyProperty(gameState, player, position) {
  const square = BOARD[position];
  const details = PROPERTY_DETAILS[square.name];
  if (gameState.ownership[position] === null && player.money >= details.price) {
    player.money -= details.price;
    player.properties.push(position);
    gameState.ownership[position] = player.id;
  }
}

export function declineBuy(gameState, position) {
  runAuction(gameState, position);
}

function calculateRent(square, gameState, owner, rollTotal = 0) {
  if (gameState.mortgaged[square.position]) return 0;
  const details = PROPERTY_DETAILS[square.name];
  if (square.type === 'property') {
    const level = gameState.houses[square.position];
    let rent = details.rent[level];
    if (level === 0 && isMonopoly(gameState, owner.id, square.group)) {
      rent *= 2;
    }
    return rent;
  } else if (square.type === 'railroad') {
    const numOwned = owner.properties.filter(p => BOARD[p].type === 'railroad').length;
    return 25 * Math.pow(2, numOwned - 1);
  } else if (square.type === 'utility') {
    const numOwned = owner.properties.filter(p => BOARD[p].type === 'utility').length;
    const multiplier = numOwned === 1 ? 4 : 10;
    return multiplier * rollTotal;
  }
  return 0;
}

export function drawCard(deck, player, players) {
  if (deck.length === 0) return null;
  const card = deck.shift();
  card.action(player, players);
  deck.push(card); // Recycle
  return card;
}

export function handleBankruptcy(player, gameState, creditorId = null) {
  if (player.money >= 0) return;
  player.money = 0;
  player.bankrupt = true;
  if (creditorId !== null) {
    const creditor = gameState.players.find(p => p.id === creditorId);
    if (creditor) {
      player.properties.forEach(pos => {
        gameState.ownership[pos] = creditorId;
        creditor.properties.push(pos);
        gameState.houses[pos] = 0;
        gameState.mortgaged[pos] = false;
      });
    }
  } else {
    player.properties.forEach(pos => {
      gameState.ownership[pos] = null;
      gameState.houses[pos] = 0;
      gameState.mortgaged[pos] = false;
    });
  }
  player.properties = [];
}

export function nextTurn(gameState) {
  gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
  while (gameState.players[gameState.currentTurn].bankrupt) {
    gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
  }
}

// Jail handling
export function attemptJailEscape(player, roll) {
  if (player.inJail) {
    player.jailTurns++;
    const isDoubles = roll.die1 === roll.die2;
    if (isDoubles || player.jailTurns >= 3) {
      if (player.jailTurns >= 3 && !isDoubles) player.money -= 50;
      player.inJail = false;
      player.jailTurns = 0;
    }
  }
}

// New functions for additional mechanics

export function buildHouse(gameState, player, position, count = 1) {
  const square = BOARD[position];
  if (square.type !== 'property' || gameState.ownership[position] !== player.id) return;
  if (!isMonopoly(gameState, player.id, square.group)) return;
  if (gameState.mortgaged[position]) return;
  const details = PROPERTY_DETAILS[square.name];
  const cost = details.houseCost * count;
  if (player.money < cost || gameState.houses[position] + count > 5) return;
  player.money -= cost;
  gameState.houses[position] += count;
}

export function sellHouse(gameState, player, position, count = 1) {
  const square = BOARD[position];
  if (square.type !== 'property' || gameState.ownership[position] !== player.id) return;
  const details = PROPERTY_DETAILS[square.name];
  const refund = (details.houseCost / 2) * count;
  if (gameState.houses[position] < count) return;
  player.money += refund;
  gameState.houses[position] -= count;
}

export function mortgageProperty(gameState, player, position) {
  if (gameState.ownership[position] !== player.id || gameState.houses[position] > 0) return;
  const details = PROPERTY_DETAILS[BOARD[position].name];
  player.money += details.mortgageValue;
  gameState.mortgaged[position] = true;
}

export function unmortgageProperty(gameState, player, position) {
  if (gameState.ownership[position] !== player.id || !gameState.mortgaged[position]) return;
  const details = PROPERTY_DETAILS[BOARD[position].name];
  const cost = Math.floor(details.mortgageValue * 1.1);
  if (player.money < cost) return;
  player.money -= cost;
  gameState.mortgaged[position] = false;
}

export function performTrade(gameState, player1Id, player2Id, p1Gives, p2Gives, p1Money = 0, p2Money = 0) {
  const player1 = gameState.players.find(p => p.id === player1Id);
  const player2 = gameState.players.find(p => p.id === player2Id);
  if (!player1 || !player2) return;

  // Transfer properties from player1 to player2
  p1Gives.forEach(pos => {
    if (gameState.ownership[pos] === player1Id && gameState.houses[pos] === 0 && !gameState.mortgaged[pos]) {
      gameState.ownership[pos] = player2Id;
      player1.properties = player1.properties.filter(p => p !== pos);
      player2.properties.push(pos);
    }
  });

  // Transfer properties from player2 to player1
  p2Gives.forEach(pos => {
    if (gameState.ownership[pos] === player2Id && gameState.houses[pos] === 0 && !gameState.mortgaged[pos]) {
      gameState.ownership[pos] = player1Id;
      player2.properties = player2.properties.filter(p => p !== pos);
      player1.properties.push(pos);
    }
  });

  // Transfer money
  if (player1.money >= p1Money && player2.money >= p2Money) {
    player1.money -= p1Money;
    player2.money += p1Money;
    player1.money += p2Money;
    player2.money -= p2Money;
  }
}

export function runAuction(gameState, position) {
  const details = PROPERTY_DETAILS[BOARD[position].name];
  let highestBid = 1;
  let winnerId = null;

  // Simple round-robin bidding simulation among non-bankrupt players
  gameState.players.forEach(p => {
    if (!p.bankrupt && p.money > highestBid) {
      const bid = Math.min(p.money, highestBid + Math.floor(Math.random() * 50) + 10);
      if (bid > highestBid) {
        highestBid = bid;
        winnerId = p.id;
      }
    }
  });

  if (winnerId !== null) {
    const winner = gameState.players.find(p => p.id === winnerId);
    winner.money -= highestBid;
    winner.properties.push(position);
    gameState.ownership[position] = winnerId;
    return { winner: winnerId, bid: highestBid };
  }
  return null;
}

export function useGetOutOfJailCard(player) {
  if (player.inJail && player.getOutOfJailCards > 0) {
    player.getOutOfJailCards--;
    player.inJail = false;
    player.jailTurns = 0;
  }
}

export function addToFreeParking(gameState, amount) {
  gameState.freeParkingPot += amount;
}