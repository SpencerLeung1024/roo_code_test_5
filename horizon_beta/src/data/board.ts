import { TileType, type Tile } from '../types';
import { BASE_CONFIG } from '../constants';

/**
 * Minimal approximate board data with 40 tiles.
 * Prices/rents are simplified for the vertical slice.
 */

const P = (id: number, name: string, price: number, baseRent: number[], groupKey: string): Tile => ({
  id,
  name,
  type: TileType.Property,
  price,
  baseRent,
  groupKey,
});

const RR = (id: number, name: string, price: number): Tile => ({
  id,
  name,
  type: TileType.Railroad,
  price,
  railroad: true,
});

const U = (id: number, name: string, price: number): Tile => ({
  id,
  name,
  type: TileType.Utility,
  price,
  utility: true,
});

const T = (id: number, name: string, amount: number): Tile => ({
  id,
  name,
  type: TileType.Tax,
  amount,
});

// Strongly-typed simple maker for non-ownable specials using literal types
const S = <T extends
  | typeof TileType.Go
  | typeof TileType.FreeParking
  | typeof TileType.Jail
  | typeof TileType.GoToJail
  | typeof TileType.Chance
  | typeof TileType.CommunityChest
>(id: number, type: T, name?: string) => ({
  id,
  name: name ?? type,
  type,
}) as Tile;

export const BOARD: Tile[] = [
  S(0, TileType.Go, 'GO'),
  P(1, 'Mediterranean Ave', 60, [2, 10, 30, 90, 160, 250], 'BROWN'),
  S(2, TileType.CommunityChest, 'Community Chest'),
  P(3, 'Baltic Ave', 60, [4, 20, 60, 180, 320, 450], 'BROWN'),
  T(4, 'Income Tax', 200),
  RR(5, 'Reading Railroad', 200),
  P(6, 'Oriental Ave', 100, [6, 30, 90, 270, 400, 550], 'LIGHT_BLUE'),
  S(7, TileType.Chance, 'Chance'),
  P(8, 'Vermont Ave', 100, [6, 30, 90, 270, 400, 550], 'LIGHT_BLUE'),
  P(9, 'Connecticut Ave', 120, [8, 40, 100, 300, 450, 600], 'LIGHT_BLUE'),

  S(10, TileType.Jail, 'Jail / Just Visiting'),
  P(11, 'St. Charles Place', 140, [10, 50, 150, 450, 625, 750], 'PINK'),
  U(12, 'Electric Company', 150),
  P(13, 'States Ave', 140, [10, 50, 150, 450, 625, 750], 'PINK'),
  P(14, 'Virginia Ave', 160, [12, 60, 180, 500, 700, 900], 'PINK'),
  RR(15, 'Pennsylvania Railroad', 200),
  P(16, 'St. James Place', 180, [14, 70, 200, 550, 750, 950], 'ORANGE'),
  S(17, TileType.CommunityChest, 'Community Chest'),
  P(18, 'Tennessee Ave', 180, [14, 70, 200, 550, 750, 950], 'ORANGE'),
  P(19, 'New York Ave', 200, [16, 80, 220, 600, 800, 1000], 'ORANGE'),

  S(20, TileType.FreeParking, 'Free Parking'),
  P(21, 'Kentucky Ave', 220, [18, 90, 250, 700, 875, 1050], 'RED'),
  S(22, TileType.Chance, 'Chance'),
  P(23, 'Indiana Ave', 220, [18, 90, 250, 700, 875, 1050], 'RED'),
  P(24, 'Illinois Ave', 240, [20, 100, 300, 750, 925, 1100], 'RED'),
  RR(25, 'B. & O. Railroad', 200),
  P(26, 'Atlantic Ave', 260, [22, 110, 330, 800, 975, 1150], 'YELLOW'),
  P(27, 'Ventnor Ave', 260, [22, 110, 330, 800, 975, 1150], 'YELLOW'),
  U(28, 'Water Works', 150),
  P(29, 'Marvin Gardens', 280, [24, 120, 360, 850, 1025, 1200], 'YELLOW'),

  S(30, TileType.GoToJail, 'Go To Jail'),
  P(31, 'Pacific Ave', 300, [26, 130, 390, 900, 1100, 1275], 'GREEN'),
  P(32, 'North Carolina Ave', 300, [26, 130, 390, 900, 1100, 1275], 'GREEN'),
  S(33, TileType.CommunityChest, 'Community Chest'),
  P(34, 'Pennsylvania Ave', 320, [28, 150, 450, 1000, 1200, 1400], 'GREEN'),
  RR(35, 'Short Line', 200),
  S(36, TileType.Chance, 'Chance'),
  P(37, 'Park Place', 350, [35, 175, 500, 1100, 1300, 1500], 'DARK_BLUE'),
  T(38, 'Luxury Tax', 100),
  P(39, 'Boardwalk', 400, [50, 200, 600, 1400, 1700, 2000], 'DARK_BLUE'),
];

if (BOARD.length !== BASE_CONFIG.boardSize) {
  // Ensure the board size matches expectations
  throw new Error(`Board must have ${BASE_CONFIG.boardSize} tiles, got ${BOARD.length}`);
}