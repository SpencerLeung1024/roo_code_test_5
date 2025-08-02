import { CardType, CardEffectKind, type Card } from '../types';
import { createIdGen } from '../utils/id';

const idGen = createIdGen(1000);

// Minimal Chance cards (10–12)
export const CHANCE_CARDS: Card[] = [
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Advance to GO (Collect $200)',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 0, grantGoIfPass: true },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Go to Jail. Do not pass GO',
    effect: { kind: CardEffectKind.GoToJail },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Advance to Illinois Ave',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 24, grantGoIfPass: true },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Advance to St. Charles Place',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 11, grantGoIfPass: true },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Advance token to nearest Utility',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 12, grantGoIfPass: true }, // simplified to Electric Co.
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Bank pays you dividend of $50',
    effect: { kind: CardEffectKind.Collect, amount: 50 },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Pay poor tax of $15',
    effect: { kind: CardEffectKind.Pay, amount: 15 },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Advance token to nearest Railroad',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 5, grantGoIfPass: true }, // simplified to Reading RR
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Your building loan matures. Receive $150',
    effect: { kind: CardEffectKind.Collect, amount: 150 },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Get Out of Jail Free',
    effect: { kind: CardEffectKind.GetOutOfJailFree },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Go back 3 spaces',
    effect: { kind: CardEffectKind.MoveBy, steps: -3 },
  },
  {
    id: idGen.next(),
    type: CardType.Chance,
    text: 'Make general repairs: $25 per house, $100 per hotel',
    effect: { kind: CardEffectKind.Repairs, perHouse: 25, perHotel: 100 },
  },
];

// Minimal Community Chest cards (10–12)
export const COMMUNITY_CHEST_CARDS: Card[] = [
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Advance to GO (Collect $200)',
    effect: { kind: CardEffectKind.MoveTo, tileIndex: 0, grantGoIfPass: true },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Bank error in your favor. Collect $200',
    effect: { kind: CardEffectKind.Collect, amount: 200 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Doctor’s fees. Pay $50',
    effect: { kind: CardEffectKind.Pay, amount: 50 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'From sale of stock you get $50',
    effect: { kind: CardEffectKind.Collect, amount: 50 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Get Out of Jail Free',
    effect: { kind: CardEffectKind.GetOutOfJailFree },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Go to Jail. Do not pass GO',
    effect: { kind: CardEffectKind.GoToJail },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Grand Opera Opening. Collect $50 from every player',
    effect: { kind: CardEffectKind.CollectEach, amount: 50 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Holiday fund matures. Receive $100',
    effect: { kind: CardEffectKind.Collect, amount: 100 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Income tax refund. Collect $20',
    effect: { kind: CardEffectKind.Collect, amount: 20 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'It is your birthday. Collect $10 from every player',
    effect: { kind: CardEffectKind.CollectEach, amount: 10 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Life insurance matures – Collect $100',
    effect: { kind: CardEffectKind.Collect, amount: 100 },
  },
  {
    id: idGen.next(),
    type: CardType.CommunityChest,
    text: 'Pay hospital fees of $100',
    effect: { kind: CardEffectKind.Pay, amount: 100 },
  },
];