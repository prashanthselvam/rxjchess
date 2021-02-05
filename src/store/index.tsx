import {
  createSlice,
  configureStore,
  PayloadAction,
  AnyAction,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { PieceId, TileId, TILES } from "src/types/constants";
import { GAME_TYPES } from "src/types/constants";
import { createEpicMiddleware } from "redux-observable";
import rootEpic from "./epics";
import { _clearHighlights, _getPlayer } from "./utils";

type TileMapData = {
  pieceId: PieceId | undefined;
  highlight: boolean;
};

export type TileMap = Record<TileId, TileMapData>;

export type ChessGameState = {
  status: GameStatus;
  currentTurn: Player; // black or white
  tileMap: TileMap; // mapping of each tile to the piece ID that's on it
  selectedTile: TileId | undefined;
  isActiveCheck: boolean;
  pov: Player;
  whiteOccupiedTiles: TileId[] | undefined;
  blackOccupiedTiles: TileId[] | undefined;
  peggedTiles: TileId[] | undefined;
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
      const whiteOccupiedTiles: TileId[] = [];
      const blackOccupiedTiles: TileId[] = [];
      const initialPositions = GAME_TYPES[gameType].initialPositions;

      // Clear the board
      state.tileMap = tileMapInitialState;

      Object.entries(initialPositions).forEach(([tileId, pieceId]) => {
        const player = _getPlayer(pieceId);
        if (player === "W") {
          whiteOccupiedTiles.push(tileId);
        } else {
          blackOccupiedTiles.push(tileId);
        }
        state.tileMap[tileId] = { pieceId: pieceId, highlight: false };
      });

      state.currentTurn = "W";
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
    selectTile(state, action: PayloadAction<{ tileId: TileId }>) {
      _clearHighlights(state);
      state.selectedTile = action.payload.tileId;
    },
    deselect(state) {
      _clearHighlights(state);
      state.selectedTile = undefined;
    },
    highlightPossibleMoves(
      state,
      action: PayloadAction<{ possibleMoves: TileId[] }>
    ) {
      action.payload.possibleMoves.forEach(
        (id) => (state.tileMap[id].highlight = true)
      );
    },
    moveToTile(state, action: PayloadAction<{ targetTileId: TileId }>) {
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
    populateOccupiedTiles(state) {
      const whiteOccupiedTiles: TileId[] = [];
      const blackOccupiedTiles: TileId[] = [];

      Object.entries(state.tileMap)
        .filter(([_, { pieceId }]) => !!pieceId)
        .forEach(([tileId, { pieceId }]) => {
          const player = _getPlayer(pieceId!);
          if (player === "W") {
            whiteOccupiedTiles.push(tileId);
          } else {
            blackOccupiedTiles.push(tileId);
          }
        });

      state.whiteOccupiedTiles = whiteOccupiedTiles;
      state.blackOccupiedTiles = blackOccupiedTiles;
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
