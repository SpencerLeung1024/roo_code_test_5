/**
 * Full 40-tile board in Latinized/joke names with placeholder values.
 * Order follows standard Monopoly indices 0..39.
 */
import { TileKind } from './constants';

export type BaseTile = {
  readonly id: number;
  readonly index: number;
  readonly kind: TileKind;
  readonly name: string;
};

export type OwnableBase = {
  readonly price: number;
  readonly mortgaged: boolean;
  readonly ownerId: number | null;
};

export type PropertyTile = BaseTile &
  OwnableBase & {
    readonly kind: TileKind.Property;
    readonly color: string; // color group css key
    readonly rentTable: readonly [number, number, number, number, number, number];
    readonly houseCount: 0 | 1 | 2 | 3 | 4;
    readonly hotel: boolean;
  };

export type RailroadTile = BaseTile &
  OwnableBase & {
    readonly kind: TileKind.Railroad;
    readonly rentBase: number;
  };

export type UtilityTile = BaseTile &
  OwnableBase & {
    readonly kind: TileKind.Utility;
    readonly rentBase: number;
  };

export type GoTile = BaseTile & { readonly kind: TileKind.Go; readonly payout: number };
export type ChanceTile = BaseTile & { readonly kind: TileKind.Chance };
export type CommunityChestTile = BaseTile & { readonly kind: TileKind.CommunityChest };
export type TaxTile = BaseTile & { readonly kind: TileKind.Tax; readonly amount: number };
export type JailTile = BaseTile & { readonly kind: TileKind.Jail; readonly visiting: true };
export type GoToJailTile = BaseTile & { readonly kind: TileKind.GoToJail };
export type FreeParkingTile = BaseTile & { readonly kind: TileKind.FreeParking };

export type BoardTile =
  | GoTile
  | PropertyTile
  | RailroadTile
  | UtilityTile
  | ChanceTile
  | CommunityChestTile
  | TaxTile
  | JailTile
  | GoToJailTile
  | FreeParkingTile;

// Helper to create property with defaults
const prop = (
  id: number,
  index: number,
  name: string,
  color: string,
  price: number,
  rent: [number, number, number, number, number, number]
): PropertyTile => ({
  id,
  index,
  kind: TileKind.Property,
  name,
  color,
  price,
  mortgaged: false,
  ownerId: null,
  rentTable: rent,
  houseCount: 0,
  hotel: false
});

// Rail helper
const rail = (id: number, index: number, name: string): RailroadTile => ({
  id,
  index,
  kind: TileKind.Railroad,
  name,
  price: 200,
  mortgaged: false,
  ownerId: null,
  rentBase: 25
});

// Util helper
const util = (id: number, index: number, name: string): UtilityTile => ({
  id,
  index,
  kind: TileKind.Utility,
  name,
  price: 150,
  mortgaged: false,
  ownerId: null,
  rentBase: 4 // base multiplier placeholder
});

export const BOARD: readonly BoardTile[] = [
  // 0 GO
  { id: 0, index: 0, kind: TileKind.Go, name: 'Initium', payout: 200 },

  // Brown set
  prop(1, 1, 'Via Fuscus I', 'brown', 60, [2, 10, 30, 90, 160, 250]),
  { id: 2, index: 2, kind: TileKind.CommunityChest, name: 'Arca Communis' },
  prop(3, 3, 'Via Fuscus II', 'brown', 60, [4, 20, 60, 180, 320, 450]),
  { id: 4, index: 4, kind: TileKind.Tax, name: 'Tributum Census', amount: 200 },
  rail(5, 5, 'Portus Borealis'),

  // Light Blue
  prop(6, 6, 'Campus Caeruleus I', 'lightblue', 100, [6, 30, 90, 270, 400, 550]),
  { id: 7, index: 7, kind: TileKind.Chance, name: 'Fortuna' },
  prop(8, 8, 'Campus Caeruleus II', 'lightblue', 100, [6, 30, 90, 270, 400, 550]),
  prop(9, 9, 'Campus Caeruleus III', 'lightblue', 120, [8, 40, 100, 300, 450, 600]),
  { id: 10, index: 10, kind: TileKind.Jail, name: 'Carcer', visiting: true },

  // Pink (Magenta)
  prop(11, 11, 'Vicus Roseus I', 'pink', 140, [10, 50, 150, 450, 625, 750]),
  util(12, 12, 'Electrum Officina'),
  prop(13, 13, 'Vicus Roseus II', 'pink', 140, [10, 50, 150, 450, 625, 750]),
  prop(14, 14, 'Vicus Roseus III', 'pink', 160, [12, 60, 180, 500, 700, 900]),
  rail(15, 15, 'Portus Orientalis'),

  // Orange
  prop(16, 16, 'Forum Aurantiacus I', 'orange', 180, [14, 70, 200, 550, 750, 950]),
  { id: 17, index: 17, kind: TileKind.CommunityChest, name: 'Arca Communis' },
  prop(18, 18, 'Forum Aurantiacus II', 'orange', 180, [14, 70, 200, 550, 750, 950]),
  prop(19, 19, 'Forum Aurantiacus III', 'orange', 200, [16, 80, 220, 600, 800, 1000]),
  { id: 20, index: 20, kind: TileKind.FreeParking, name: 'Statio Libera' },

  // Red
  prop(21, 21, 'Strata Rubra I', 'red', 220, [18, 90, 250, 700, 875, 1050]),
  { id: 22, index: 22, kind: TileKind.Chance, name: 'Fortuna' },
  prop(23, 23, 'Strata Rubra II', 'red', 220, [18, 90, 250, 700, 875, 1050]),
  prop(24, 24, 'Strata Rubra III', 'red', 240, [20, 100, 300, 750, 925, 1100]),
  rail(25, 25, 'Portus Meridianus'),

  // Yellow
  prop(26, 26, 'Ager Flavus I', 'yellow', 260, [22, 110, 330, 800, 975, 1150]),
  prop(27, 27, 'Ager Flavus II', 'yellow', 260, [22, 110, 330, 800, 975, 1150]),
  util(28, 28, 'Aqua Ductus'),
  prop(29, 29, 'Ager Flavus III', 'yellow', 280, [24, 120, 360, 850, 1025, 1200]),
  { id: 30, index: 30, kind: TileKind.GoToJail, name: 'Ire Ad Carcerem' },

  // Green
  prop(31, 31, 'Collis Viridis I', 'green', 300, [26, 130, 390, 900, 1100, 1275]),
  prop(32, 32, 'Collis Viridis II', 'green', 300, [26, 130, 390, 900, 1100, 1275]),
  { id: 33, index: 33, kind: TileKind.CommunityChest, name: 'Arca Communis' },
  prop(34, 34, 'Collis Viridis III', 'green', 320, [28, 150, 450, 1000, 1200, 1400]),
  rail(35, 35, 'Portus Occidentalis'),

  // Dark Blue
  { id: 36, index: 36, kind: TileKind.Chance, name: 'Fortuna' },
  prop(37, 37, 'Aedes Caeruleum I', 'darkblue', 350, [35, 175, 500, 1100, 1300, 1500]),
  { id: 38, index: 38, kind: TileKind.Tax, name: 'Tributum Luxuria', amount: 100 },
  prop(39, 39, 'Aedes Caeruleum II', 'darkblue', 400, [50, 200, 600, 1400, 1700, 2000])
];