import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "redux-devtools-extension";
import { PieceID, TileID, TILES } from "src/data/constants";
import { GAME_TYPES } from "../data/main";

type TileMapData = {
  pieceId: PieceID | undefined;
  highlight: boolean;
};

type ChessGameState = {
  status: GameStatus;
  currentTurn: Players; // black or white
  tileMap: Record<TileID, TileMapData>; // mapping of each tile to the piece ID that's on it
  selectedTile: TileID | undefined;
  isActiveCheck: boolean;
};

const tileMapInitialState = Object.keys(TILES).reduce((acc, curr) => {
  return { ...acc, [curr]: { pieceId: undefined, highlight: false } };
}, {});

const initialState: ChessGameState = {
  status: "NOT STARTED",
  currentTurn: "W",
  tileMap: tileMapInitialState,
  selectedTile: undefined,
  isActiveCheck: false,
};

const gameSlice = createSlice({
  name: "gameSlice",
  initialState: initialState,
  reducers: {
    newGame(state, action: PayloadAction<{ gameType: GameTypes }>) {
      const { gameType } = action.payload;
      const initialPositions = GAME_TYPES[gameType].initialPositions;

      Object.entries(initialPositions).forEach(([tileId, pieceId]) => {
        state.tileMap[tileId] = { pieceId: pieceId, highlight: false };
      });
    },
  },
});

export const { newGame } = gameSlice.actions;

export const store = configureStore({
  reducer: gameSlice.reducer,
  devTools: {
    serialize: {
      options: {
        undefined: true,
      },
    },
  },
});
