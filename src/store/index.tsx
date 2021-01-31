import {
  createSlice,
  configureStore,
  PayloadAction,
  AnyAction,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { PieceID, TileID, TILES } from "src/data/constants";
import { GAME_TYPES } from "src/data/main";
import { createEpicMiddleware } from "redux-observable";
import rootEpic from "./epics";

type TileMapData = {
  pieceId: PieceID | undefined;
  highlight: boolean;
};

export type TileMap = Record<TileID, TileMapData>;

type ChessGameState = {
  status: GameStatus;
  currentTurn: Player; // black or white
  tileMap: TileMap; // mapping of each tile to the piece ID that's on it
  selectedTile: TileID | undefined;
  isActiveCheck: boolean;
  pov: Player;
  whiteOccupiedTiles: TileID[] | undefined;
  blackOccupiedTiles: TileID[] | undefined;
  peggedTiles: TileID[] | undefined;
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
  pov: "W",
  whiteOccupiedTiles: undefined,
  blackOccupiedTiles: undefined,
  peggedTiles: undefined,
};

const gameSlice = createSlice({
  name: "gameSlice",
  initialState: initialState,
  reducers: {
    newGame(state, action: PayloadAction<{ gameType: GameTypes }>) {
      const { gameType } = action.payload;
      const whiteOccupiedTiles: TileID[] = [];
      const blackOccupiedTiles: TileID[] = [];
      const initialPositions = GAME_TYPES[gameType].initialPositions;

      Object.entries(initialPositions).forEach(([tileId, pieceId]) => {
        if (pieceId.slice(0, 1) === "W") {
          whiteOccupiedTiles.push(tileId);
        } else {
          blackOccupiedTiles.push(tileId);
        }
        state.tileMap[tileId] = { pieceId: pieceId, highlight: false };
      });

      state.whiteOccupiedTiles = whiteOccupiedTiles;
      state.blackOccupiedTiles = blackOccupiedTiles;
    },
    togglePov(state) {
      if (state.pov === "W") {
        state.pov = "B";
      } else {
        state.pov = "W";
      }
    },
    selectTile(
      state,
      action: PayloadAction<{ tileId: TileID; xPos: XPos; yPos: YPos }>
    ) {
      state.selectedTile = action.payload.tileId;
    },
    highlightPossibleMoves(
      state,
      action: PayloadAction<{ possibleMoves: TileID[] }>
    ) {
      action.payload.possibleMoves.forEach(
        (id) => (state.tileMap[id].highlight = true)
      );
    },
  },
});

type MyState = ReturnType<typeof gameSlice.reducer>;

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, MyState>();

export const actions = gameSlice.actions;

export const store = configureStore({
  reducer: gameSlice.reducer,
  middleware: [
    ...getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
    epicMiddleware,
  ],
  devTools: {
    serialize: {
      options: {
        undefined: true,
      },
    },
  },
});

epicMiddleware.run(rootEpic);
