import {
  CardType,
  CardEffectKind,
  type GameState,
  type Card,
  type CardEffect,
} from '../types';
import { moveBy, moveTo } from './movement';

/**
 * Draw the next card from the requested deck, advancing the pointer (with wrap).
 */
export function drawCard(state: GameState, deckType: CardType): Card {
  const deck = deckType === CardType.Chance ? state.decks.chance : state.decks.community;
  const idx = deck.drawIndex % deck.cards.length;
  const card = deck.cards[idx];
  deck.drawIndex = (idx + 1) % deck.cards.length;
  state.turn.ui = { prompt: 'DRAW_CARD', context: { deck: deckType, cardId: card.id } };
  return card;
}

/**
 * Apply a card effect to the specified player. Some effects may move players or change cash.
 * Returns nothing; mutates state.
 */
export function applyCardEffect(
  state: GameState,
  playerId: string,
  effect: CardEffect
): void {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('applyCardEffect: player not found');

  switch (effect.kind) {
    case CardEffectKind.MoveTo: {
      moveTo(state, playerId, effect.tileIndex, effect.grantGoIfPass ?? true);
      break;
    }
    case CardEffectKind.MoveBy: {
      moveBy(state, playerId, effect.steps);
      break;
    }
    case CardEffectKind.Pay: {
      player.cash -= effect.amount;
      if (player.cash < 0) {
        player.pendingDebt = Math.abs(player.cash);
        player.cash = 0;
      }
      break;
    }
    case CardEffectKind.Collect: {
      player.cash += effect.amount;
      break;
    }
    case CardEffectKind.PayEach: {
      const others = state.players.filter(p => p.id !== playerId && !p.bankrupt);
      const total = effect.amount * others.length;
      player.cash -= total;
      if (player.cash < 0) {
        player.pendingDebt = Math.abs(player.cash);
        player.cash = 0;
      }
      for (const o of others) {
        o.cash += effect.amount;
      }
      break;
    }
    case CardEffectKind.CollectEach: {
      const others = state.players.filter(p => p.id !== playerId && !p.bankrupt);
      for (const o of others) {
        if (o.cash >= effect.amount) {
          o.cash -= effect.amount;
          player.cash += effect.amount;
        } else {
          // Simplified: if insufficient, convert to debt on payer (no bankruptcy yet)
          const owed = effect.amount - o.cash;
          player.cash += o.cash;
          o.cash = 0;
          o.pendingDebt += owed;
        }
      }
      break;
    }
    case CardEffectKind.Repairs: {
      let houses = 0;
      let hotels = 0;
      for (const own of Object.values(state.ownership)) {
        const ownState = own!;
        if (!ownState || ownState.ownerId !== playerId) continue;
        if (ownState.houses >= 5) {
          hotels += 1;
        } else if (ownState.houses > 0) {
          houses += ownState.houses;
        }
      }
      const due = houses * effect.perHouse + hotels * effect.perHotel;
      player.cash -= due;
      if (player.cash < 0) {
        player.pendingDebt = Math.abs(player.cash);
        player.cash = 0;
      }
      break;
    }
    case CardEffectKind.GoToJail: {
      // Simple send to jail helper inline: position = 10, flag inJail
      const jailIndex = state.tiles.findIndex(t => t.type === 'JAIL');
      player.position = jailIndex >= 0 ? jailIndex : 10;
      player.inJail = true;
      player.jailTurns = 0;
      player.consecutiveDoubles = 0;
      break;
    }
    case CardEffectKind.GetOutOfJailFree: {
      player.getOutOfJailFree += 1;
      break;
    }
  }
}