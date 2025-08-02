/**
 * Seed decks for Chance and Community Chest with minimal actionable payloads.
 */
import { CardKind } from './constants';
import type { Card } from '../state/types';

// GO is index 0 on our board data
const GO_INDEX = 0;

// Provide 5-6 varied cards each, matching required payload shapes/text
export const chanceDeck: readonly Card[] = [
  { id: 'ch_go_start', kind: CardKind.Chance, text: 'Advance to GO. Collect $200.', payload: { t: 'MoveTo', index: GO_INDEX, passGo: true } },
  { id: 'ch_dividend', kind: CardKind.Chance, text: 'Bank pays you dividend of $50. Collect $50.', payload: { t: 'Collect', amount: 50 } },
  { id: 'ch_fee', kind: CardKind.Chance, text: 'Speeding fine. Pay $15.', payload: { t: 'Pay', amount: 15 } },
  { id: 'ch_get_out', kind: CardKind.Chance, text: 'Get Out of Jail Free. This card may be kept until needed.', payload: { t: 'GetOutOfJail' } },
  { id: 'ch_go_to_jail', kind: CardKind.Chance, text: 'Go directly to Jail. Do not pass GO.', payload: { t: 'GoToJail' } },
  { id: 'ch_noop', kind: CardKind.Chance, text: 'No effect.', payload: { t: 'Noop' } }
];

export const communityDeck: readonly Card[] = [
  { id: 'cc_bank_error', kind: CardKind.CommunityChest, text: 'Bank error in your favor. Collect $200.', payload: { t: 'Collect', amount: 200 } },
  { id: 'cc_doctor_fee', kind: CardKind.CommunityChest, text: 'Doctor’s fees. Pay $50.', payload: { t: 'Pay', amount: 50 } },
  { id: 'cc_get_out', kind: CardKind.CommunityChest, text: 'Get Out of Jail Free. This card may be kept until needed.', payload: { t: 'GetOutOfJail' } },
  { id: 'cc_move_to_go', kind: CardKind.CommunityChest, text: 'Advance to GO. Collect $200.', payload: { t: 'MoveTo', index: GO_INDEX, passGo: true } },
  { id: 'cc_noop', kind: CardKind.CommunityChest, text: 'Community Chest: No effect.', payload: { t: 'Noop' } }
];