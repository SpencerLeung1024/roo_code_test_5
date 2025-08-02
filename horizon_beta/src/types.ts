/**
 * Core domain types for the Monopoly-like engine.
 * These types are intentionally stable to support persistence and UI consumption.
 */

/** Money is represented as a simple number (no currency/bills). */
export type Money = number;

/** Wraps serialized data with a version tag for future migrations. */
export interface Versioned<T> {
  version: number;
  data: T;
}

/** Kinds of tiles available on the board. */
export const TileType = {
  Go: 'GO',
  Property: 'PROPERTY',
  Railroad: 'RAILROAD',
  Utility: 'UTILITY',
  Tax: 'TAX',
  Chance: 'CHANCE',
  CommunityChest: 'COMMUNITY_CHEST',
  Jail: 'JAIL', // also used for "Just Visiting"
  FreeParking: 'FREE_PARKING',
  GoToJail: 'GO_TO_JAIL',
} as const;
export type TileType = typeof TileType[keyof typeof TileType];

/** Types of decks. */
export const CardType = {
  Chance: 'CHANCE',
  CommunityChest: 'COMMUNITY_CHEST',
} as const;
export type CardType = typeof CardType[keyof typeof CardType];

/** Types of card effects supported by the engine. */
export const CardEffectKind = {
  MoveTo: 'MOVE_TO',
  MoveBy: 'MOVE_BY',
  Pay: 'PAY', // pay bank
  Collect: 'COLLECT', // collect from bank
  PayEach: 'PAY_EACH', // pay each other player
  CollectEach: 'COLLECT_EACH', // collect from each other player
  Repairs: 'REPAIRS', // pay per house/hotel
  GoToJail: 'GO_TO_JAIL',
  GetOutOfJailFree: 'GET_OUT_OF_JAIL_FREE',
} as const;
export type CardEffectKind = typeof CardEffectKind[keyof typeof CardEffectKind];

/** Turn phases for the simple state machine. */
export const TurnPhase = {
  Idle: 'IDLE',
  PreRoll: 'PRE_ROLL',
  Rolled: 'ROLLED',
  ResolveTile: 'RESOLVE_TILE',
  ActionChoices: 'ACTION_CHOICES',
  InJail: 'IN_JAIL',
  EndTurn: 'END_TURN',
} as const;
export type TurnPhase = typeof TurnPhase[keyof typeof TurnPhase];

/** Dice result for 2d6. */
export interface DiceResult {
  d1: number;
  d2: number;
  total: number;
  isDouble: boolean;
}

/** Board tile definition. */
export interface TileBase {
  id: number; // 0..boardSize-1 index
  name: string;
  type: TileType;
}

/** Ownable tile extra fields. */
export interface OwnableInfo {
  price: Money;
  baseRent?: number[]; // for properties [no house, 1h, 2h, 3h, 4h, hotel]
  groupKey?: string; // color or set key
  railroad?: boolean;
  utility?: boolean;
}

/** Tax tile info. */
export interface TaxInfo {
  amount: Money;
}

/** Tile union. */
export type Tile =
  | (TileBase & { type: typeof TileType.Go })
  | (TileBase & { type: typeof TileType.FreeParking })
  | (TileBase & { type: typeof TileType.Jail })
  | (TileBase & { type: typeof TileType.GoToJail })
  | (TileBase & { type: typeof TileType.Chance })
  | (TileBase & { type: typeof TileType.CommunityChest })
  | (TileBase & { type: typeof TileType.Tax } & TaxInfo)
  | (TileBase & { type: typeof TileType.Railroad } & OwnableInfo)
  | (TileBase & { type: typeof TileType.Utility } & OwnableInfo)
  | (TileBase & { type: typeof TileType.Property } & OwnableInfo);

/** Ownership / building state for ownable tiles. */
export interface OwnableState {
  ownerId: string | null;
  mortgaged: boolean;
  houses: number; // 0..4, 5 means hotel
}

/** Card effect payloads. */
export type CardEffect =
  | { kind: typeof CardEffectKind.MoveTo; tileIndex: number; grantGoIfPass?: boolean }
  | { kind: typeof CardEffectKind.MoveBy; steps: number }
  | { kind: typeof CardEffectKind.Pay; amount: Money }
  | { kind: typeof CardEffectKind.Collect; amount: Money }
  | { kind: typeof CardEffectKind.PayEach; amount: Money }
  | { kind: typeof CardEffectKind.CollectEach; amount: Money }
  | { kind: typeof CardEffectKind.Repairs; perHouse: Money; perHotel: Money }
  | { kind: typeof CardEffectKind.GoToJail }
  | { kind: typeof CardEffectKind.GetOutOfJailFree };

/** Card definition. */
export interface Card {
  id: string;
  type: CardType;
  text: string;
  effect: CardEffect;
}

/** A deck is an ordered list with a draw pointer. */
export interface Deck {
  type: CardType;
  cards: Card[];
  drawIndex: number; // next index to draw (wraps)
}

/** Player data. */
export interface Player {
  id: string;
  name: string;
  position: number; // 0..boardSize-1
  cash: Money;
  inJail: boolean;
  jailTurns: number; // how many turns spent in jail
  getOutOfJailFree: number; // number of cards held
  consecutiveDoubles: number;
  pendingDebt: Money; // if > 0 indicates unresolved payment
  bankrupt: boolean;
}

/** Ownership lookup by tileId. */
export type OwnershipMap = Record<number, OwnableState | undefined>;

/** Per-turn state and prompts. */
export interface TurnState {
  phase: TurnPhase;
  currentPlayerId: string | null;
  dice: DiceResult | null;
  // Simple UI channel to request minimal prompts for the vertical slice
  ui: {
    prompt: null | 'BUY_PROPERTY' | 'PAY_RENT' | 'DRAW_CARD';
    context?: Record<string, unknown>;
  };
}

/** Engine config values. */
export interface GameConfig {
  startingCash: Money;
  passGoAmount: Money;
  maxJailTurns: number;
  jailFine: Money;
  boardSize: number;
}

/** Log entry for basic debugging/tracking. */
export interface GameLogEntry {
  id: string;
  text: string;
  ts: number;
}

/** The full game state. */
export interface GameState {
  version: number;
  config: GameConfig;
  tiles: Tile[];
  players: Player[];
  turn: TurnState;
  ownership: OwnershipMap;
  decks: {
    chance: Deck;
    community: Deck;
  };
  currentPlayerIndex: number;
  rngSeed: number;
  log: GameLogEntry[];
}