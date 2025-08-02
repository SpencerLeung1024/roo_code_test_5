import { TileKind, TurnPhase } from "../../data/constants";
import type { GameState } from "../types";
import { chanceDeck, communityDeck } from "../../data/cards";
// inline minimal rent to avoid module missing during incremental step
const computeBaseRentInline = (tile: any, _ownerProps: readonly number[]) => {
  switch (tile?.kind) {
    case TileKind.Property: {
      const base = Array.isArray(tile.rentTable) && tile.rentTable.length > 0 ? tile.rentTable[0] : 10;
      return typeof base === 'number' ? base : 10;
    }
    case TileKind.Railroad:
      return 25;
    case TileKind.Utility:
      return 10;
    default:
      return 0;
  }
};

/**
 * Safely draw a card index from the specified deck name, recycling discard if needed.
 */
function drawFromDeck(state: GameState, deckName: 'chance' | 'community'): { next: GameState; cardIndex: number | null } {
  const isChance = deckName === 'chance';
  const draw = isChance ? state.decks.chance : state.decks.community;
  const discard = isChance ? state.decks.chanceDiscard : state.decks.communityDiscard;

  let newDraw = draw.slice();
  let newDiscard = discard.slice();
  let log = state.log;

  if (newDraw.length === 0 && newDiscard.length > 0) {
    // recycle
    newDraw = newDiscard.slice();
    newDiscard = [];
    log = [`Recycled ${deckName} discard pile into deck`, ...log];
  }

  if (newDraw.length === 0) {
    // nothing to draw
    return { next: { ...state, log }, cardIndex: null };
  }

  const cardIndex = newDraw[0]!;
  newDraw = newDraw.slice(1);

  const next = {
    ...state,
    decks: isChance
      ? { ...state.decks, chance: newDraw, chanceDiscard: newDiscard }
      : { ...state.decks, community: newDraw, communityDiscard: newDiscard },
    log
  };

  return { next, cardIndex };
}

/**
 * Apply the minimal card effects. Returns next state and whether the card should be discarded.
 * Avoid infinite recursion by using a one-level follow-up flag.
 */
function applyCard(state: GameState, deckName: 'chance' | 'community', cardIndex: number, allowFollowUp: boolean): { next: GameState; discard: boolean } {
  const isChance = deckName === 'chance';
  const card = isChance ? chanceDeck[cardIndex] : communityDeck[cardIndex];
  let next = state;
  const player = state.players[state.currentPlayerIndex];
  if (!card || !player) return { next: state, discard: true };

  const push = (line: string) => {
    next = { ...next, log: [line, ...next.log] };
  };

  switch (card.payload.t) {
    case 'Collect': {
      const amount = Math.max(0, card.payload.amount | 0);
      const players = next.players.map((p, i) => (i === next.currentPlayerIndex ? { ...p, cash: p.cash + amount } : p));
      next = { ...next, players };
      push(`Card effect: Collect $${amount}`);
      break;
    }
    case 'Pay': {
      const amount = Math.max(0, card.payload.amount | 0);
      const players = next.players.map((p, i) => (i === next.currentPlayerIndex ? { ...p, cash: p.cash - amount } : p));
      next = { ...next, players };
      push(`Card effect: Pay $${amount}`);
      break;
    }
    case 'GetOutOfJail': {
      const players = next.players.map((p, i) => (i === next.currentPlayerIndex ? { ...p, getOutOfJailCards: p.getOutOfJailCards + 1 } : p));
      next = { ...next, players };
      push(`Card effect: Received Get Out of Jail Free`);
      // Do not discard; player holds it
      return { next, discard: false };
    }
    case 'GoToJail': {
      const jailIndex = next.tiles.findIndex(t => t.kind === TileKind.Jail);
      if (jailIndex >= 0) {
        const players = next.players.map((p, i) => (i === next.currentPlayerIndex ? { ...p, position: jailIndex } : p));
        next = { ...next, players, turn: { ...next.turn, phase: TurnPhase.End } };
      }
      push(`Card effect: Go to Jail`);
      break;
    }
    case 'MoveTo': {
      const dest = card.payload.index | 0;
      // compute pass GO bonus if requested
      const cur = next.players[next.currentPlayerIndex];
      const boardLen = next.tiles.length;
      const passedGo = card.payload.passGo && ((cur.position % boardLen) > (dest % boardLen));
      const bonus = passedGo ? 200 : 0;

      const players = next.players.map((p, i) =>
        i === next.currentPlayerIndex ? { ...p, position: dest, cash: p.cash + bonus } : p
      );
      next = { ...next, players };
      if (bonus > 0) {
        next = { ...next, log: [`Passed GO via card: +200`, ...next.log] };
      }
      next = { ...next, log: [`Card effect: Move to ${(next.tiles[dest] as any)?.name ?? `#${dest}`}`, ...next.log] };

      // One-level follow-up resolution identical to landing move
      if (allowFollowUp) {
        next = resolveTileFollowUp(next);
      }
      break;
    }
    case 'Noop': {
      push(`Card effect: No effect`);
      break;
    }
    default: {
      push(`Card effect: Unrecognized (ignored)`);
      break;
    }
  }

  return { next, discard: true };
}

/**
 * Follow-up resolve identical to landing move but prevents re-drawing a second card in the same chain.
 */
function resolveTileFollowUp(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return state;
  const tile = state.tiles[player.position] as any;

  // Reuse a trimmed version of resolve logic without card draws recursion
  let s = state;

  switch (tile?.kind) {
    case TileKind.Property:
    case TileKind.Railroad:
    case TileKind.Utility: {
      const ownerId: number | undefined = tile.ownerId;
      const price: number | undefined = tile.price;
      if (ownerId == null) {
        const canAfford = typeof price === "number" && (state.players[state.currentPlayerIndex]?.cash ?? 0) >= price;
        if (canAfford) {
          s = {
            ...s,
            log: [`May purchase ${tile.name} for $${price}`, ...s.log],
            ui: { purchasePromptTileId: player.position },
            turn: { ...s.turn, phase: TurnPhase.Resolve }
          };
          return s;
        }
        s = { ...s, log: [`Cannot afford ${tile.name}${typeof price === "number" ? ` ($${price})` : ""}`, ...s.log] };
      } else if (ownerId !== player.id) {
        const owner = s.players.find(p => p.id === ownerId);
        const rent = computeBaseRentInline(tile, owner?.ownedTileIds ?? []);
        const paid = Math.max(0, rent | 0);
        const players = s.players.map(p => {
          if (p.id === player.id) return { ...p, cash: p.cash - paid };
          if (p.id === ownerId) return { ...p, cash: p.cash + paid };
          return p;
        });
        s = { ...s, players, log: [`${player.name} paid $${paid} rent to ${owner?.name ?? `Player ${ownerId + 1}`} for ${tile.name}`, ...s.log] };
      } else {
        s = { ...s, log: [`Landed on own property ${tile.name}`, ...s.log] };
      }
      break;
    }
    case TileKind.Tax: {
      const amount = (tile as any).amount ?? 100;
      const players = s.players.map((p, i) => (i === s.currentPlayerIndex ? { ...p, cash: p.cash - amount } : p));
      s = { ...s, players, log: [`Paid tax: -${amount}`, ...s.log] };
      break;
    }
    case TileKind.Go: {
      const payout = (tile as any).payout ?? 200;
      if (payout) {
        const players = s.players.map((p, i) => (i === s.currentPlayerIndex ? { ...p, cash: p.cash + payout } : p));
        s = { ...s, players, log: [`Landed on GO: +${payout}`, ...s.log] };
      } else {
        s = { ...s, log: [`Landed on GO`, ...s.log] };
      }
      break;
    }
    case TileKind.FreeParking: {
      s = { ...s, log: [`Free Parking (no effect)`, ...s.log] };
      break;
    }
    case TileKind.Jail: {
      s = { ...s, log: [`Just visiting`, ...s.log] };
      break;
    }
    case TileKind.Chance:
    case TileKind.CommunityChest: {
      // Prevent nested draw within follow-up
      s = { ...s, log: [`Card effect landing: draw skipped to avoid recursion`, ...s.log] };
      break;
    }
    default: {
      s = { ...s, log: [`Landed on a tile`, ...s.log] };
      break;
    }
  }

  // If no purchase prompt was created, end phase
  if (s.ui.purchasePromptTileId == null) {
    s = { ...s, turn: { ...s.turn, phase: TurnPhase.End } };
  }
  return s;
}

/**
 * Minimal tile resolution for this subtask including Chance/Community draw/apply.
 * Pure function: returns a new GameState with appended log entries and updated cash/position if applicable.
 */
export function resolveTile(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return { ...state, turn: { ...state.turn, phase: TurnPhase.End } };

  const tile = state.tiles[player.position] as any;
  let log = state.log;
  let players = state.players;

  const push = (line: string) => {
    log = [line, ...log];
  };

  if (!tile) {
    push("Landed on an unknown space");
    return {
      ...state,
      log,
      turn: { ...state.turn, phase: TurnPhase.End }
    };
  }

  const isOwnable = (k: TileKind) =>
    k === TileKind.Property || k === TileKind.Railroad || k === TileKind.Utility;

  switch (tile.kind) {
    case TileKind.Go: {
      const payout = (tile as any).payout ?? 200;
      if (payout) {
        const updated = players.map((p, i) =>
          i === state.currentPlayerIndex ? { ...p, cash: p.cash + payout } : p
        );
        players = updated;
        push(`Landed on GO: +${payout}`);
      } else {
        push("Landed on GO");
      }
      break;
    }
    case TileKind.Tax: {
      const amount = (tile as any).amount ?? 100;
      const updated = players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, cash: p.cash - amount } : p
      );
      players = updated;
      push(`Paid tax: -${amount}`);
      break;
    }
    case TileKind.Chance:
    case TileKind.CommunityChest: {
      const deckName = tile.kind === TileKind.Chance ? 'chance' as const : 'community' as const;
      // draw
      const drawRes = drawFromDeck({ ...state, players, log }, deckName);
      let s = drawRes.next;
      if (drawRes.cardIndex == null) {
        // nothing to draw; end turn
        s = { ...s, turn: { ...s.turn, phase: TurnPhase.End } };
        return s;
      }
      const cardIndex = drawRes.cardIndex;
      const card = deckName === 'chance' ? chanceDeck[cardIndex] : communityDeck[cardIndex];
      s = { ...s, log: [`Drew ${deckName === 'chance' ? 'Chance' : 'Community Chest'}: ${card?.text ?? 'a card'}`, ...s.log] };

      // apply
      const applied = applyCard(s, deckName, cardIndex, true);
      s = applied.next;

      // discard unless GetOutOfJail
      if (applied.discard) {
        if (deckName === 'chance') {
          s = { ...s, decks: { ...s.decks, chanceDiscard: [...s.decks.chanceDiscard, cardIndex] } };
        } else {
          s = { ...s, decks: { ...s.decks, communityDiscard: [...s.decks.communityDiscard, cardIndex] } };
        }
      }

      // If no purchase prompt is pending, end; otherwise stay Resolve for purchase flow
      if (s.ui.purchasePromptTileId == null) {
        s = { ...s, turn: { ...s.turn, phase: TurnPhase.End } };
      }
      return s;
    }
    case TileKind.Jail: {
      push("Just visiting");
      break;
    }
    case TileKind.FreeParking: {
      push("Free Parking (no effect)");
      break;
    }
    case TileKind.Property:
    case TileKind.Railroad:
    case TileKind.Utility: {
      const ownerId: number | undefined = (tile as any).ownerId;
      const price: number | undefined = (tile as any).price;

      if (ownerId == null) {
        const canAfford = typeof price === "number" && (state.players[state.currentPlayerIndex]?.cash ?? 0) >= price;
        if (canAfford) {
          push(`May purchase ${tile.name} for $${price}`);
          return {
            ...state,
            log,
            ui: { purchasePromptTileId: state.players[state.currentPlayerIndex].position },
            turn: { ...state.turn, phase: TurnPhase.Resolve }
          };
        }
        push(`Cannot afford ${tile.name}${typeof price === "number" ? ` ($${price})` : ""}`);
      } else {
        if (ownerId !== state.players[state.currentPlayerIndex].id) {
          const owner = state.players.find(p => p.id === ownerId);
          const ownerProps = owner ? owner.ownedTileIds : [];
          const rent = computeBaseRentInline(tile, ownerProps);
          const paid = Math.max(0, rent | 0);
          const newPlayers = state.players.map(p => {
            if (p.id === state.players[state.currentPlayerIndex].id) return { ...p, cash: p.cash - paid };
            if (p.id === ownerId) return { ...p, cash: p.cash + paid };
            return p;
          });
          players = newPlayers;
          push(`${state.players[state.currentPlayerIndex].name} paid $${paid} rent to ${owner?.name ?? `Player ${ownerId + 1}`} for ${tile.name}`);
        } else {
          push(`Landed on own property ${tile.name}`);
        }
      }
      break;
    }
    case TileKind.GoToJail: {
      // Enter jail flow: position to Jail and enter InJailStart phase
      const jailIndex = state.tiles.findIndex((t) => t.kind === TileKind.Jail);
      const movedPlayers = jailIndex >= 0
        ? state.players.map((p, i) => (i === state.currentPlayerIndex ? { ...p, position: jailIndex } : p))
        : state.players;
      push("Sent to jail");
      return {
        ...state,
        players: movedPlayers,
        log,
        turn: { ...state.turn, phase: TurnPhase.InJailStart }
      };
    }
    default: {
      push("Landed on a tile");
      break;
    }
  }

  return {
    ...state,
    players,
    log,
    turn: { ...state.turn, phase: TurnPhase.End }
  };
}