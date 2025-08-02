import { describe, it, expect } from 'vitest';
import { createNewGame } from '../data/init';
import { moveBy, moveTo } from '../engine/movement';
import { BASE_CONFIG } from '../constants';
import { startTurn } from '../engine/turn';

describe('movement', () => {
  it('moveBy wraps board and credits pass GO', () => {
    const state = createNewGame(['A', 'B'], 1);
    startTurn(state);
    const size = BASE_CONFIG.boardSize;

    // Put player near end of board
    state.players[0].position = size - 2;
    const cashBefore = state.players[0].cash;
    const newPos = moveBy(state, state.players[0].id, 4);
    expect(newPos).toBe((size - 2 + 4) % size);
    expect(state.players[0].cash).toBe(cashBefore + state.config.passGoAmount);
  });

  it('moveTo can grant GO on pass', () => {
    const state = createNewGame(['A'], 2);
    startTurn(state);
    state.players[0].position = 39; // last tile
    const before = state.players[0].cash;
    const pos = moveTo(state, state.players[0].id, 0, true);
    expect(pos).toBe(0);
    expect(state.players[0].cash).toBe(before + state.config.passGoAmount);
  });
});