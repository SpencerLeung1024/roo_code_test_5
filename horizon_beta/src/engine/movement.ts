import { TurnPhase, type GameState } from '../types';

/**
 * Move a player forward/backward by steps, handling wrap-around and GO credit.
 * Returns the new absolute position.
 */
export function moveBy(state: GameState, playerId: string, steps: number): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('moveBy: player not found');

  const size = state.config.boardSize;
  const prev = player.position;
  let next = (prev + steps) % size;
  if (next < 0) next += size;

  // If moving forward passes GO (prev > next when steps >= 0) grant pass GO money
  if (steps > 0) {
    const passedGo = (prev + steps) >= size || next < prev;
    if (passedGo) {
      player.cash += state.config.passGoAmount;
      state.log.push({ id: `${Date.now()}-go`, text: `${player.name} passed GO and collected $${state.config.passGoAmount}`, ts: Date.now() });
    }
  }

  player.position = next;
  state.turn.phase = TurnPhase.ResolveTile;
  return next;
}

/**
 * Move a player to an absolute tile index. If grantGoIfPass is true and we pass GO, pay.
 */
export function moveTo(state: GameState, playerId: string, target: number, grantGoIfPass = true): number {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('moveTo: player not found');

  const size = state.config.boardSize;
  const prev = player.position;
  const next = ((target % size) + size) % size;

  if (grantGoIfPass) {
    const passedGo = next < prev; // wrapping forward
    if (passedGo) {
      player.cash += state.config.passGoAmount;
      state.log.push({ id: `${Date.now()}-go`, text: `${player.name} passed GO and collected $${state.config.passGoAmount}`, ts: Date.now() });
    }
  }

  player.position = next;
  state.turn.phase = TurnPhase.ResolveTile;
  return next;
}