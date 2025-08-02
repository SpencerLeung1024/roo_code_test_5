import { describe, it, expect } from 'vitest';
import { createQuickStart } from '../data/init';
import '../tests/setup';

describe('createQuickStart', () => {
  it('returns a 2-player deterministic game with non-empty decks', () => {
    const state = createQuickStart();
    expect(state.players.length).toBe(2);
    expect(state.players[0].name).toBe('Player 1');
    expect(state.players[1].name).toBe('Player 2');

    // Decks should exist and have cards
    expect(state.decks.chance.cards.length).toBeGreaterThan(0);
    expect(state.decks.community.cards.length).toBeGreaterThan(0);

    // Both drawIndex start at 0
    expect(state.decks.chance.drawIndex).toBe(0);
    expect(state.decks.community.drawIndex).toBe(0);
  });
});