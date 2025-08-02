import { BASE_CONFIG } from '../constants';
import {
  type GameState,
  type Player,
  type OwnershipMap,
  type Deck,
  CardType,
  TurnPhase,
} from '../types';
import { BOARD } from './board';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from './cards';
import { createRNG } from '../utils/rng';
import { createIdGen } from '../utils/id';

/**
 * Shuffle an array in-place using provided RNG (Fisher-Yates).
 */
function shuffleInPlace<T>(arr: T[], seed: number): T[] {
  const rng = createRNG(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Helper to construct Player[] from names with default positions and cash from config.
 */
export function createPlayers(names: string[]): Player[] {
  const cfg = BASE_CONFIG;
  return names.map((name, idx) => ({
    id: String(idx + 1),
    name,
    position: 0,
    cash: cfg.startingCash,
    inJail: false,
    jailTurns: 0,
    getOutOfJailFree: 0,
    consecutiveDoubles: 0,
    pendingDebt: 0,
    bankrupt: false,
  }));
}

export function createNewGame(playerNames: string[], seed = Date.now()): GameState {
  const cfg = BASE_CONFIG;
  const idGen = createIdGen(0);

  const players: Player[] = createPlayers(playerNames);

  const ownership: OwnershipMap = {};

  // Prepare decks (shallow copies to avoid mutating constants)
  const chanceDeck: Deck = {
    type: CardType.Chance,
    cards: [...CHANCE_CARDS],
    drawIndex: 0,
  };
  const communityDeck: Deck = {
    type: CardType.CommunityChest,
    cards: [...COMMUNITY_CHEST_CARDS],
    drawIndex: 0,
  };

  // Shuffle using derived seeds for determinism
  shuffleInPlace(chanceDeck.cards, seed ^ 0xA5A5);
  shuffleInPlace(communityDeck.cards, seed ^ 0x5A5A);

  const state: GameState = {
    version: 1,
    config: cfg,
    tiles: BOARD,
    players,
    turn: {
      phase: TurnPhase.PreRoll,
      currentPlayerId: players.length > 0 ? players[0].id : null,
      dice: null,
      ui: { prompt: null },
    },
    ownership,
    decks: {
      chance: chanceDeck,
      community: communityDeck,
    },
    currentPlayerIndex: 0,
    rngSeed: seed,
    log: [
      { id: idGen.next(), text: `New game started with ${players.length} player(s).`, ts: Date.now() },
    ],
  };

  return state;
}

/**
 * Quick start: 2 players with fixed seed for deterministic demos/tests.
 */
export function createQuickStart(): GameState {
  const defaultNames = ['Player 1', 'Player 2'];
  const fixedSeed = 123456789; // stable demo seed
  return createNewGame(defaultNames, fixedSeed);
}