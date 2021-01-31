import { TILES, PIECES, TileID } from "src/data/constants";

export const WHITE_MAP: TileID[][] = [
  [
    TILES.A1,
    TILES.B1,
    TILES.C1,
    TILES.D1,
    TILES.E1,
    TILES.F1,
    TILES.G1,
    TILES.H1,
  ],
  [
    TILES.A2,
    TILES.B2,
    TILES.C2,
    TILES.D2,
    TILES.E2,
    TILES.F2,
    TILES.G2,
    TILES.H2,
  ],
  [
    TILES.A3,
    TILES.B3,
    TILES.C3,
    TILES.D3,
    TILES.E3,
    TILES.F3,
    TILES.G3,
    TILES.H3,
  ],
  [
    TILES.A4,
    TILES.B4,
    TILES.C4,
    TILES.D4,
    TILES.E4,
    TILES.F4,
    TILES.G4,
    TILES.H4,
  ],
  [
    TILES.A5,
    TILES.B5,
    TILES.C5,
    TILES.D5,
    TILES.E5,
    TILES.F5,
    TILES.G5,
    TILES.H5,
  ],
  [
    TILES.A6,
    TILES.B6,
    TILES.C6,
    TILES.D6,
    TILES.E6,
    TILES.F6,
    TILES.G6,
    TILES.H6,
  ],
  [
    TILES.A7,
    TILES.B7,
    TILES.C7,
    TILES.D7,
    TILES.E7,
    TILES.F7,
    TILES.G7,
    TILES.H7,
  ],
  [
    TILES.A8,
    TILES.B8,
    TILES.C8,
    TILES.D8,
    TILES.E8,
    TILES.F8,
    TILES.G8,
    TILES.H8,
  ],
];

export const BLACK_MAP = WHITE_MAP.map((row) => row.slice().reverse())
  .slice()
  .reverse();

// Game Type
export const GAME_TYPES = {
  REGULAR: {
    initialPositions: {
      [TILES.A1]: PIECES.WR1,
      [TILES.B1]: PIECES.WN1,
      [TILES.C1]: PIECES.WB1,
      [TILES.D1]: PIECES.WQ,
      [TILES.E1]: PIECES.WK,
      [TILES.F1]: PIECES.WB2,
      [TILES.G1]: PIECES.WN2,
      [TILES.H1]: PIECES.WR2,
      [TILES.A2]: PIECES.WP1,
      [TILES.B2]: PIECES.WP2,
      [TILES.C2]: PIECES.WP3,
      [TILES.D2]: PIECES.WP4,
      [TILES.E2]: PIECES.WP5,
      [TILES.F2]: PIECES.WP6,
      [TILES.G2]: PIECES.WP7,
      [TILES.H2]: PIECES.WP8,
    },
  },
};
