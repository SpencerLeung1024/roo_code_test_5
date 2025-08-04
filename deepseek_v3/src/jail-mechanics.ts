import { GameState, Player, JailAction } from './types';

export class JailMechanics {
  static handleJailAction(state: GameState, playerId: string, action: 'pay_bail' | 'use_card' | 'roll_doubles'): boolean {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.inJail) return false;

    switch (action) {
      case 'pay_bail':
        if (player.balance >= 50) {
          player.balance -= 50;
          player.inJail = false;
          player.jailTurns = 0;
          return true;
        }
        return false;

      case 'use_card':
        if (player.hasGetOutOfJailFree) {
          player.hasGetOutOfJailFree = false;
          player.inJail = false;
          player.jailTurns = 0;
          return true;
        }
        return false;

      case 'roll_doubles':
        if (player.jailTurns < 3) {
          const [d1, d2] = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
          ];
          if (d1 === d2) {
            player.inJail = false;
            player.jailTurns = 0;
            return true;
          }
          player.jailTurns++;
        } else {
          // After 3 failed attempts, must pay bail
          player.inJail = false;
          player.jailTurns = 0;
          player.balance -= 50;
          return true;
        }
        return false;
    }
  }

  static canMove(player: Player): boolean {
    return !player.inJail;
  }
}