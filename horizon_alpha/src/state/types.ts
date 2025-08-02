import { TileKind, CardKind, JailStatus, TurnPhase } from '../data/constants';
import type { BoardTile } from '../data/board';

// --- Player model ---
export interface Player {
  readonly id: number;
  readonly name: string;
  readonly cash: number;
  readonly position: number; // tile index
  readonly jailStatus: JailStatus;
  readonly jailTurns: number;
  readonly getOutOfJailCards: number;
  readonly ownedTileIds: readonly number[];
  readonly bankrupt: boolean;
}

// --- Card model ---
export type CardPayload =
  | { readonly t: 'Collect'; readonly amount: number }
  | { readonly t: 'Pay'; readonly amount: number }
  | { readonly t: 'GetOutOfJail' }
  | { readonly t: 'GoToJail' }
  | { readonly t: 'MoveTo'; readonly index: number; readonly passGo: boolean }
  | { readonly t: 'Noop' };

export interface Card {
  readonly id: string;
  readonly kind: CardKind;
  readonly text: string;
  readonly payload: CardPayload;
}

// --- Decks / Bank / Turn info ---
export interface BankState {
  readonly houses: number; // starts at 32
  readonly hotels: number; // starts at 12
}

export interface TurnInfo {
  readonly dice: readonly [number, number] | null;
  readonly doublesCount: number;
  readonly phase: TurnPhase;
}

// --- UI state ---
export interface UIState {
  readonly purchasePromptTileId: number | null;
}

// Deck indices for draw/discard piles
export interface DeckIndexes {
  readonly chance: readonly number[];
  readonly chanceDiscard: readonly number[];
  readonly community: readonly number[];
  readonly communityDiscard: readonly number[];
}

// --- Game State ---
export interface GameState {
  readonly players: readonly Player[];
  readonly currentPlayerIndex: number;
  readonly tiles: readonly BoardTile[];
  readonly decks: DeckIndexes;
  readonly bank: BankState;
  readonly turn: TurnInfo;
  readonly rngSeed: string;
  readonly log: readonly string[];
  readonly config: {
    readonly freeParkingCash?: boolean;
  };
  readonly ui: UIState;
  readonly version: string;
}

// --- Actions ---
export type InitNewGameAction = {
  type: 'INIT_NEW_GAME';
  numberOfPlayers: number;
  seed: string;
};

export type RollDiceAction = { type: 'ROLL_DICE' };
export type MoveCurrentPlayerAction = { type: 'MOVE_CURRENT_PLAYER' };
export type EndTurnAction = { type: 'END_TURN' };

// Property flow actions
export type OpenPurchasePromptAction = {
  type: 'OPEN_PURCHASE_PROMPT';
  tileId: number;
};
export type ConfirmPurchaseAction = {
  type: 'CONFIRM_PURCHASE';
  tileId: number;
};
export type DeclinePurchaseAction = {
  type: 'DECLINE_PURCHASE';
  tileId: number;
};
export type PayRentAction = {
  type: 'PAY_RENT';
  tileId: number;
  ownerId: number;
  amount: number;
};

// Jail flow actions
export type GoToJailAction = { type: 'GO_TO_JAIL' };
export type JailPayFineAction = { type: 'JAIL_PAY_FINE' };
export type JailUseCardAction = { type: 'JAIL_USE_CARD' };
export type JailRollAction = { type: 'JAIL_ROLL' };
export type JailEndAttemptAction = { type: 'JAIL_END_ATTEMPT' };

// Card / deck actions (for future external dispatch; resolver mutates state directly this subtask)
export type DrawCardAction = { type: 'DRAW_CARD'; deck: 'chance' | 'community' };
export type ApplyCardAction = { type: 'APPLY_CARD'; deck: 'chance' | 'community'; cardIndex: number };

export type NoopAction = { type: 'NOOP' };

export type Action =
  | InitNewGameAction
  | RollDiceAction
  | MoveCurrentPlayerAction
  | EndTurnAction
  | OpenPurchasePromptAction
  | ConfirmPurchaseAction
  | DeclinePurchaseAction
  | PayRentAction
  | GoToJailAction
  | JailPayFineAction
  | JailUseCardAction
  | JailRollAction
  | JailEndAttemptAction
  | DrawCardAction
  | ApplyCardAction
  | NoopAction;

// Convenience jail selector type
export type CurrentPlayerJailInfo = { status: JailStatus; turns: number; cards: number };

export const isInitNewGame = (a: Action): a is InitNewGameAction => a.type === 'INIT_NEW_GAME';