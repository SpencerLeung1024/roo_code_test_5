import type { GameState } from '../types';

/**
 * Transfer money from one player to another or to bank (toId === null).
 * Returns true if fully paid, false if payer had insufficient funds.
 * On insufficient funds, we deduct available cash and set pendingDebt for the remainder.
 */
export function transferMoney(state: GameState, fromId: string, toId: string | null, amount: number): boolean {
  const payer = state.players.find(p => p.id === fromId);
  if (!payer) throw new Error('transferMoney: payer not found');
  if (amount <= 0) return true;

  let remaining = amount;

  if (payer.cash >= remaining) {
    payer.cash -= remaining;
    if (toId) {
      const payee = state.players.find(p => p.id === toId);
      if (payee) payee.cash += remaining;
    }
    return true;
  } else {
    // Pay what we can
    const paid = payer.cash;
    remaining -= paid;
    payer.cash = 0;
    payer.pendingDebt += remaining;
    if (toId) {
      const payee = state.players.find(p => p.id === toId);
      if (payee) payee.cash += paid;
    }
    return false;
  }
}