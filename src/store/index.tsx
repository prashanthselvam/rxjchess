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
import { clearHighlights } from "./utils";

type TileMapData = {
  pieceId: PieceID | undefined;
  highlight: boolean;
};

export type TileMap = Record<TileID, TileMapData>;

export type ChessGameState = {
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
        state.currentTurn = "B";
      } else {
        state.pov = "W";
        state.currentTurn = "W";
      }
    },
    selectTile(state, action: PayloadAction<{ tileId: TileID }>) {
      clearHighlights(state);
      state.selectedTile = action.payload.tileId;
    },
    deselect(state) {
      clearHighlights(state);
      state.selectedTile = undefined;
    },
    highlightPossibleMoves(
      state,
      action: PayloadAction<{ possibleMoves: TileID[] }>
    ) {
      action.payload.possibleMoves.forEach(
        (id) => (state.tileMap[id].highlight = true)
      );
    },
    moveToTile(state, action: PayloadAction<{ targetTileId: TileID }>) {
      const { selectedTile, tileMap } = state;
      const { targetTileId } = action.payload;

      state.tileMap = {
        ...tileMap,
        [selectedTile!]: { pieceId: undefined, highlight: false },
        [targetTileId]: {
          pieceId: tileMap[selectedTile!].pieceId,
          highlight: false,
        },
      };

      if (state.currentTurn === "W") {
        state.currentTurn = "B";
      } else {
        state.currentTurn = "W";
      }
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
