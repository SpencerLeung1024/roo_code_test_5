import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { BOARD } from '../data/board';
import { chanceDeck, communityDeck } from '../data/cards';
import { TurnPhase, JailStatus, TileKind } from '../data/constants';
import { appVersion } from '../data/version';
import type { Action, GameState, Player } from './types';
import { rng as globalRng } from '../utils/rng';
import { resolveTile } from './rules/resolve';

const JAIL_FINE = 50;

// Basic typed context/store wiring with reducer implementing core turn flow skeleton.

function createInitialState(): GameState {
  // Ensure all ownable tiles start unowned
  const tiles = BOARD.map(t => {
    if (t.kind === TileKind.Property || t.kind === TileKind.Railroad || t.kind === TileKind.Utility) {
      return { ...t, ownerId: undefined } as any;
    }
    return t;
  });

  const chanceIdx = chanceDeck.map((_, i) => i);
  const communityIdx = communityDeck.map((_, i) => i);

  return {
    players: [],
    currentPlayerIndex: 0,
    tiles,
    decks: {
      chance: chanceIdx,
      chanceDiscard: [],
      community: communityIdx,
      communityDiscard: []
    },
    bank: { houses: 32, hotels: 12 },
    turn: { dice: null, doublesCount: 0, phase: TurnPhase.Idle },
    rngSeed: 'uninitialized',
    log: ['Scaffold OK'],
    config: {},
    ui: { purchasePromptTileId: null },
    version: appVersion
  };
}

function createPlayers(n: number): readonly Player[] {
  const players: Player[] = [];
  for (let i = 0; i < n; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      cash: 1500,
      position: 0,
      jailStatus: JailStatus.None,
      jailTurns: 0,
      getOutOfJailCards: 0,
      ownedTileIds: [],
      bankrupt: false
    });
  }
  return players;
}

// minimal helper for safe log append (latest first)
function pushLog(prev: readonly string[], line: string): readonly string[] {
  return [line, ...prev];
}

// helpers
const isOwnable = (kind: TileKind) =>
  kind === TileKind.Property || kind === TileKind.Railroad || kind === TileKind.Utility;

function nextNonBankruptIndex(players: readonly Player[], fromIdx: number): number {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIdx + step) % n;
    if (!players[idx]?.bankrupt) return idx;
  }
  return fromIdx; // fallback if all bankrupt
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_NEW_GAME': {
      const players = createPlayers(action.numberOfPlayers);
      // seed RNG module-level instance
      globalRng.seed(action.seed);
      const chanceIdx = chanceDeck.map((_, i) => i);
      const communityIdx = communityDeck.map((_, i) => i);
      return {
        ...state,
        players,
        currentPlayerIndex: 0,
        decks: {
          chance: chanceIdx,
          chanceDiscard: [],
          community: communityIdx,
          communityDiscard: []
        },
        bank: { houses: 32, hotels: 12 },
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.Idle },
        rngSeed: action.seed,
        log: pushLog(state.log, 'New game initialized'),
        ui: { purchasePromptTileId: null }
      };
    }

    // Jail: send to jail
    case 'GO_TO_JAIL': {
      const player = state.players[state.currentPlayerIndex];
      if (!player) return state;
      const jailIndex = state.tiles.findIndex(t => t.kind === TileKind.Jail);
      if (jailIndex < 0) return state;

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, jailStatus: JailStatus.InJail, jailTurns: 0, position: jailIndex }
          : p
      );

      return {
        ...state,
        players,
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.InJailStart },
        log: pushLog(state.log, 'Sent to jail')
      };
    }

    // Jail: pay fine to leave; allow normal roll this turn (phase Idle)
    case 'JAIL_PAY_FINE': {
      if (state.turn.phase !== TurnPhase.InJailStart) return state;
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, cash: p.cash - JAIL_FINE, jailStatus: JailStatus.None, jailTurns: 0 }
          : p
      );
      return {
        ...state,
        players,
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.Idle },
        log: pushLog(state.log, 'Paid $50 to leave jail')
      };
    }

    // Jail: use card to leave; phase Idle
    case 'JAIL_USE_CARD': {
      if (state.turn.phase !== TurnPhase.InJailStart) return state;
      const player = state.players[state.currentPlayerIndex];
      if (!player || player.getOutOfJailCards <= 0) return state;

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? {
              ...p,
              getOutOfJailCards: Math.max(0, p.getOutOfJailCards - 1),
              jailStatus: JailStatus.None,
              jailTurns: 0
            }
          : p
      );
      return {
        ...state,
        players,
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.Idle },
        log: pushLog(state.log, 'Used Get Out of Jail Free')
      };
    }

    // Jail: roll attempt for doubles
    case 'JAIL_ROLL': {
      if (state.turn.phase !== TurnPhase.InJailStart) return state;
      const d1 = globalRng.nextDie();
      const d2 = globalRng.nextDie();
      const isDouble = d1 === d2;

      if (isDouble) {
        const players = state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, jailStatus: JailStatus.None, jailTurns: 0 }
            : p
        );
        const log = pushLog(state.log, `Rolled doubles to leave jail: ${d1}+${d2}`);
        return {
          ...state,
          players,
          turn: { dice: [d1, d2], doublesCount: 1, phase: TurnPhase.Rolled },
          log
        };
      } else {
        const log = pushLog(state.log, `No doubles; remain in jail (${d1}+${d2})`);
        return {
          ...state,
          turn: { dice: [d1, d2], doublesCount: 0, phase: TurnPhase.InJailRolled },
          log
        };
      }
    }

    // Jail: end non-double attempt; increment counter and possibly pay fine and move
    case 'JAIL_END_ATTEMPT': {
      if (state.turn.phase !== TurnPhase.InJailRolled) return state;
      const player = state.players[state.currentPlayerIndex];
      if (!player) return state;

      const newTurns = player.jailTurns + 1;

      // If third attempt reached: auto pay fine and move with last dice
      if (newTurns >= 3) {
        const d = state.turn.dice ?? [0, 0];
        const players = state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, cash: p.cash - JAIL_FINE, jailStatus: JailStatus.None, jailTurns: 0 }
            : p
        );
        const log = pushLog(
          state.log,
          `3rd attempt: paid $50 and leave jail; move ${d[0]}+${d[1]}`
        );
        return {
          ...state,
          players,
          turn: { dice: state.turn.dice, doublesCount: 0, phase: TurnPhase.Rolled },
          log
        };
      }

      // Otherwise stay jailed; end turn
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, jailTurns: newTurns } : p
      );
      const log = pushLog(state.log, `Stayed in jail (attempt ${newTurns}/3)`);
      return {
        ...state,
        players,
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.End },
        log
      };
    }

    case 'ROLL_DICE': {
      if (state.turn.phase !== TurnPhase.Idle) return state;
      const d1 = globalRng.nextDie();
      const d2 = globalRng.nextDie();
      const isDouble = d1 === d2;
      const doublesCount = isDouble ? state.turn.doublesCount + 1 : state.turn.doublesCount;
      const log = pushLog(state.log, `Rolled dice: ${d1} + ${d2}${isDouble ? ' (double)' : ''}`);
      return {
        ...state,
        turn: { dice: [d1, d2], doublesCount, phase: TurnPhase.Rolled },
        log
      };
    }

    case 'MOVE_CURRENT_PLAYER': {
      if (state.turn.phase !== TurnPhase.Rolled || !state.turn.dice) return state;
      const [d1, d2] = state.turn.dice;
      const steps = d1 + d2;
      const player = state.players[state.currentPlayerIndex];
      if (!player) return state;
      const boardLen = state.tiles.length;

      const prevIndex = player.position;
      const rawNext = prevIndex + steps;
      const wrapped = rawNext % boardLen;
      const passedGo = rawNext >= boardLen;

      let newCash = player.cash + (passedGo ? 200 : 0);
      let newPos = wrapped;

      // If GoToJail, send to jail index
      const destTile = state.tiles[newPos];
      if (destTile?.kind === TileKind.GoToJail) {
        const jailIndex = state.tiles.findIndex(t => t.kind === TileKind.Jail);
        if (jailIndex >= 0) {
          newPos = jailIndex;
        }
      }

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, position: newPos, cash: newCash }
          : p
      );

      let log = state.log;
      if (passedGo) {
        log = pushLog(log, 'Passed GO: +200');
      }
      log = pushLog(log, `Moved ${steps} steps to ${state.tiles[newPos]?.name ?? `#${newPos}`}`);

      // Move to Resolve then apply minimal tile resolution
      const movedState: GameState = {
        ...state,
        players: updatedPlayers,
        turn: { ...state.turn, phase: TurnPhase.Resolve },
        log
      };

      const resolved = resolveTile(movedState);
      return resolved;
    }

    case 'OPEN_PURCHASE_PROMPT': {
      // allow explicit opening only while resolving
      if (state.turn.phase !== TurnPhase.Resolve) return state;
      const tile = state.tiles[action.tileId] as any;
      if (!tile) return state;
      if (!(tile.kind === TileKind.Property || tile.kind === TileKind.Railroad || tile.kind === TileKind.Utility)) {
        return state;
      }
      return {
        ...state,
        ui: { purchasePromptTileId: action.tileId }
      };
    }

    case 'CONFIRM_PURCHASE': {
      if (state.turn.phase !== TurnPhase.Resolve) return state;
      const player = state.players[state.currentPlayerIndex];
      const tile = state.tiles[action.tileId] as any;
      if (!player || !tile) return state;
      if (!(tile.kind === TileKind.Property || tile.kind === TileKind.Railroad || tile.kind === TileKind.Utility)) {
        return state;
      }
      const price: number | undefined = tile.price;
      const ownerId: number | undefined = tile.ownerId;
      if (ownerId != null) return state; // already owned
      if (typeof price !== 'number') return state;
      if (player.cash < price) return state;

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, cash: p.cash - price, ownedTileIds: [...p.ownedTileIds, action.tileId] }
          : p
      );
      const tiles = state.tiles.map((t, idx) =>
        idx === action.tileId ? ({ ...t, ownerId: player.id } as any) : t
      );
      const log = pushLog(state.log, `${player.name} bought ${tile.name} for $${price}`);
      return {
        ...state,
        players,
        tiles,
        log,
        ui: { purchasePromptTileId: null },
        turn: { ...state.turn, phase: TurnPhase.End }
      };
    }

    case 'DECLINE_PURCHASE': {
      if (state.turn.phase !== TurnPhase.Resolve) return state;
      const player = state.players[state.currentPlayerIndex];
      const tile = state.tiles[action.tileId] as any;
      if (!player || !tile) return state;
      if (!(tile.kind === TileKind.Property || tile.kind === TileKind.Railroad || tile.kind === TileKind.Utility)) {
        return state;
      }
      const log = pushLog(state.log, `${player.name} declined to buy ${tile.name}`);
      return {
        ...state,
        log,
        ui: { purchasePromptTileId: null },
        turn: { ...state.turn, phase: TurnPhase.End }
      };
    }

    case 'PAY_RENT': {
      // For safety, allow while Resolve only
      if (state.turn.phase !== TurnPhase.Resolve) return state;
      const current = state.players[state.currentPlayerIndex];
      const owner = state.players.find(p => p.id === action.ownerId);
      if (!current || !owner) return state;
      const amount = Math.max(0, action.amount | 0);

      const players = state.players.map(p => {
        if (p.id === current.id) return { ...p, cash: p.cash - amount };
        if (p.id === owner.id) return { ...p, cash: p.cash + amount };
        return p;
      });

      const tile = state.tiles[action.tileId] as any;
      const log = pushLog(
        state.log,
        `${current.name} paid $${amount} rent to ${owner.name} for ${tile?.name ?? 'a property'}`
      );
      return {
        ...state,
        players,
        log,
        turn: { ...state.turn, phase: TurnPhase.End }
      };
    }

    // Duplicate cases removed: consolidated earlier definitions are sufficient

    case 'END_TURN': {
      // move to next non-bankrupt player and reset turn
      const nextIdx = nextNonBankruptIndex(state.players, state.currentPlayerIndex);
      return {
        ...state,
        currentPlayerIndex: nextIdx,
        turn: { dice: null, doublesCount: 0, phase: TurnPhase.Idle }
      };
    }

    case 'NOOP':
    default:
      return state;
  }
}

export type StoreShape = { state: GameState; dispatch: React.Dispatch<Action> };

export const GameContext = createContext<StoreShape | null>(null);

export const StoreProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => createInitialState(), []);
  const [state, dispatch] = useReducer(reducer, initial);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

export function useGameStore(): StoreShape {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameStore must be used within StoreProvider');
  return ctx;
}