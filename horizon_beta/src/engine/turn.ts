import {
  TurnPhase,
  TileType,
  type GameState,
  type Player,
  type Tile,
} from '../types';
import { createRNG, type RNG } from '../utils/rng';
import { roll2d6 } from './dice';
import { moveBy } from './movement';
import { computeRent } from './rent';
import { assignOwnership, getOwnableState, isOwnable } from './ownership';
import { transferMoney } from './payments';
import { CardType } from '../types';
import { drawCard, applyCardEffect } from './cardsEngine';

function currentPlayer(state: GameState): Player {
  const p = state.players[state.currentPlayerIndex];
  if (!p) throw new Error('No current player');
  return p;
}

function log(state: GameState, text: string) {
  state.log.push({ id: String(Date.now() + Math.random()), text, ts: Date.now() });
}

export function startTurn(state: GameState) {
  const p = currentPlayer(state);
  state.turn = {
    phase: p.inJail ? TurnPhase.InJail : TurnPhase.PreRoll,
    currentPlayerId: p.id,
    dice: null,
    ui: { prompt: null },
  };
  if (state.turn.phase === TurnPhase.PreRoll) {
    p.consecutiveDoubles = 0; // reset at start when not in jail
  }
}

export function roll(state: GameState, rngIn?: RNG) {
  const p = currentPlayer(state);
  if (!(state.turn.phase === TurnPhase.PreRoll || state.turn.phase === TurnPhase.InJail)) return;

  const rng = rngIn ?? createRNG(state.rngSeed++);
  const dr = roll2d6(rng);
  state.turn.dice = dr;
  log(state, `${p.name} rolled ${dr.d1}+${dr.d2} = ${dr.total}${dr.isDouble ? ' (double)' : ''}`);

  if (state.turn.phase === TurnPhase.InJail) {
    if (dr.isDouble) {
      p.inJail = false;
      p.jailTurns = 0;
      log(state, `${p.name} rolled doubles and leaves jail`);
      moveBy(state, p.id, dr.total);
      state.turn.phase = TurnPhase.ResolveTile;
    } else {
      p.jailTurns += 1;
      if (p.jailTurns >= state.config.maxJailTurns) {
        // Must pay fine and move
        transferMoney(state, p.id, null, state.config.jailFine);
        p.inJail = false;
        p.jailTurns = 0;
        log(state, `${p.name} paid jail fine and leaves jail`);
        moveBy(state, p.id, dr.total);
        state.turn.phase = TurnPhase.ResolveTile;
      } else {
        state.turn.phase = TurnPhase.ActionChoices; // Can choose to pay or end turn (stay)
      }
    }
    return;
  }

  // Normal movement logic
  if (dr.isDouble) {
    p.consecutiveDoubles += 1;
  } else {
    p.consecutiveDoubles = 0;
  }

  if (p.consecutiveDoubles >= 3) {
    sendToJail(state, p.id);
    log(state, `${p.name} rolled three consecutive doubles and is sent to jail`);
    state.turn.phase = TurnPhase.EndTurn;
    return;
  }

  moveBy(state, p.id, dr.total);
  state.turn.phase = TurnPhase.ResolveTile;
}

export function resolveTile(state: GameState) {
  const p = currentPlayer(state);
  if (state.turn.phase !== TurnPhase.ResolveTile) return;

  const tile = state.tiles[p.position];
  switch (tile.type) {
    case TileType.Go:
    case TileType.FreeParking:
    case TileType.Jail: {
      state.turn.phase = TurnPhase.ActionChoices;
      return;
    }
    case TileType.GoToJail: {
      sendToJail(state, p.id);
      state.turn.phase = TurnPhase.EndTurn;
      return;
    }
    case TileType.Tax: {
      const amount = tile.amount;
      transferMoney(state, p.id, null, amount);
      log(state, `${p.name} pays tax $${amount}`);
      state.turn.phase = TurnPhase.ActionChoices;
      return;
    }
    case TileType.Chance: {
      const card = drawCard(state, CardType.Chance);
      log(state, `${p.name} draws Chance: ${card.text}`);
      applyCardEffect(state, p.id, card.effect);
      postCardResolution(state);
      return;
    }
    case TileType.CommunityChest: {
      const card = drawCard(state, CardType.CommunityChest);
      log(state, `${p.name} draws Community Chest: ${card.text}`);
      applyCardEffect(state, p.id, card.effect);
      postCardResolution(state);
      return;
    }
    case TileType.Property:
    case TileType.Railroad:
    case TileType.Utility: {
      const own = getOwnableState(state, tile.id);
      const ownerId = own?.ownerId ?? null;
      if (!ownerId) {
        state.turn.ui = { prompt: 'BUY_PROPERTY', context: { tileId: tile.id } };
        state.turn.phase = TurnPhase.ActionChoices;
        return;
      }
      if (ownerId === p.id) {
        state.turn.phase = TurnPhase.ActionChoices;
        return;
      }
      // Pay rent
      const rollTotal = state.turn.dice?.total;
      const rent = computeRent(tile as Tile, ownerId, rollTotal, state);
      state.turn.ui = { prompt: 'PAY_RENT', context: { tileId: tile.id, ownerId, amount: rent } };
      transferMoney(state, p.id, ownerId, rent);
      log(state, `${p.name} pays $${rent} in rent`);
      state.turn.phase = TurnPhase.ActionChoices;
      return;
    }
  }
}

function postCardResolution(state: GameState) {
  const p = currentPlayer(state);
  const tile = state.tiles[p.position];
  // If card moved us onto a resolvable tile, process basic outcomes again (no infinite loop)
  if (isOwnable(tile)) {
    resolveTile(state);
  } else if (tile.type === TileType.Tax) {
    resolveTile(state);
  } else if (tile.type === TileType.GoToJail) {
    resolveTile(state);
  } else {
    state.turn.phase = TurnPhase.ActionChoices;
  }
}

export function buyCurrentProperty(state: GameState): boolean {
  const p = currentPlayer(state);
  const ctx = state.turn.ui.context as { tileId?: number } | undefined;
  if (!ctx?.tileId) return false;
  const tile = state.tiles[ctx.tileId];
  if (!isOwnable(tile)) return false;
  const cost = (tile as any).price as number;
  if (p.cash < cost) return false;
  p.cash -= cost;
  assignOwnership(state, tile.id, p.id);
  log(state, `${p.name} bought ${tile.name} for $${cost}`);
  state.turn.ui = { prompt: null };
  return true;
}

export function attemptLeaveJail(state: GameState, method: 'pay' | 'card' | 'roll' = 'pay', rngIn?: RNG): boolean {
  const p = currentPlayer(state);
  if (!p.inJail) return true;

  if (method === 'card' && p.getOutOfJailFree > 0) {
    p.getOutOfJailFree -= 1;
    p.inJail = false;
    p.jailTurns = 0;
    log(state, `${p.name} used a Get Out of Jail Free card`);
    state.turn.phase = TurnPhase.PreRoll;
    return true;
  }

  if (method === 'pay') {
    const ok = transferMoney(state, p.id, null, state.config.jailFine);
    if (ok) {
      p.inJail = false;
      p.jailTurns = 0;
      log(state, `${p.name} paid jail fine and is free`);
      state.turn.phase = TurnPhase.PreRoll;
      return true;
    }
    // insufficient funds leaves them in jail with debt noted
    state.turn.phase = TurnPhase.ActionChoices;
    return false;
  }

  // method === 'roll'
  const rng = rngIn ?? createRNG(state.rngSeed++);
  const dr = roll2d6(rng);
  state.turn.dice = dr;
  if (dr.isDouble) {
    p.inJail = false;
    p.jailTurns = 0;
    log(state, `${p.name} rolled doubles and leaves jail`);
    moveBy(state, p.id, dr.total);
    state.turn.phase = TurnPhase.ResolveTile;
    return true;
  } else {
    p.jailTurns += 1;
    log(state, `${p.name} failed to roll doubles`);
    if (p.jailTurns >= state.config.maxJailTurns) {
      const ok = transferMoney(state, p.id, null, state.config.jailFine);
      p.inJail = false;
      p.jailTurns = 0;
      if (ok) log(state, `${p.name} paid jail fine after max turns`);
      moveBy(state, p.id, dr.total);
      state.turn.phase = TurnPhase.ResolveTile;
    } else {
      state.turn.phase = TurnPhase.ActionChoices;
    }
    return false;
  }
}

export function sendToJail(state: GameState, playerId?: string) {
  const p = playerId ? state.players.find(pp => pp.id === playerId)! : currentPlayer(state);
  const jailIndex = state.tiles.findIndex(t => t.type === TileType.Jail);
  p.position = jailIndex >= 0 ? jailIndex : 10;
  p.inJail = true;
  p.jailTurns = 0;
  p.consecutiveDoubles = 0;
  state.turn.phase = TurnPhase.EndTurn;
}

export function endTurn(state: GameState) {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const next = currentPlayer(state);
  state.turn = {
    phase: next.inJail ? TurnPhase.InJail : TurnPhase.PreRoll,
    currentPlayerId: next.id,
    dice: null,
    ui: { prompt: null },
  };
}