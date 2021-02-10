import {
  createSlice,
  configureStore,
  PayloadAction,
  AnyAction,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import { PieceId, PIECES, TileId, TILES } from "src/types/constants";
import { GAME_TYPES } from "src/types/constants";
import { createEpicMiddleware } from "redux-observable";
import rootEpic from "./epics";
import {
  _clearHighlights,
  _getBoard,
  _getPieceType,
  _getPlayer,
  _getRelativePos,
  _getTile,
} from "./utils";

type TileMapData = {
  pieceId: PieceId | undefined;
  highlight: boolean;
};

export type TileMap = Record<TileId, TileMapData>;
export type CanCastle = Record<Player, TileId[]>;

export type ChessGameState = {
  status: GameStatus;
  currentTurn: Player; // black or white
  tileMap: TileMap; // mapping of each tile to the piece ID that's on it
  selectedTile: TileId | undefined;
  isActiveCheck: boolean;
  pov: Player;
  whiteAttackedTiles: TileId[] | undefined;
  blackAttackedTiles: TileId[] | undefined;
  peggedTiles: TileId[] | undefined;
  movedPieces: Record<PieceId, boolean>;
  canCastle: CanCastle;
  canBeEnpassant: TileId | undefined;
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
  whiteAttackedTiles: undefined,
  blackAttackedTiles: undefined,
  peggedTiles: undefined,
  movedPieces: {},
  canCastle: { W: [], B: [] },
  canBeEnpassant: undefined,
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
        state.tileMap[tileId] = { pieceId: pieceId, highlight: false };
      });

      state.currentTurn = "W";
      state.whiteAttackedTiles = whiteOccupiedTiles;
      state.blackAttackedTiles = blackOccupiedTiles;
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
      const {
        selectedTile,
        tileMap,
        movedPieces,
        currentTurn,
        canBeEnpassant,
      } = state;
      const { targetTileId } = action.payload;
      const pieceId = tileMap[selectedTile!].pieceId!;
      const board = _getBoard(currentTurn);

      // Update tile map based on where we're moving the piece
      state.tileMap = {
        ...tileMap,
        [selectedTile!]: { pieceId: undefined, highlight: false },
        [targetTileId]: {
          pieceId,
          highlight: false,
        },
      };

      // See if the move was actually a castle, in which case we need to update the appropriate rook as well
      if (_getPieceType(pieceId) === "K" && !movedPieces?.[pieceId]) {
        if (currentTurn === "W") {
          if (targetTileId === TILES.C1) {
            state.tileMap = {
              ...state.tileMap,
              [TILES.A1]: { pieceId: undefined, highlight: false },
              [TILES.D1]: { pieceId: PIECES.WR1, highlight: false },
            };
          } else if (targetTileId === TILES.G1) {
            state.tileMap = {
              ...state.tileMap,
              [TILES.H1]: { pieceId: undefined, highlight: false },
              [TILES.F1]: { pieceId: PIECES.WR2, highlight: false },
            };
          }
        } else if (currentTurn === "B") {
          if (targetTileId === TILES.C8) {
            state.tileMap = {
              ...state.tileMap,
              [TILES.A8]: { pieceId: undefined, highlight: false },
              [TILES.D8]: { pieceId: PIECES.BR1, highlight: false },
            };
          } else if (targetTileId === TILES.G8) {
            state.tileMap = {
              ...state.tileMap,
              [TILES.H8]: { pieceId: undefined, highlight: false },
              [TILES.F8]: { pieceId: PIECES.WR2, highlight: false },
            };
          }
        }
      }

      // If the move was an en-passant take by a pawn then remove the taken pawn from board
      if (_getPieceType(pieceId) === "P" && targetTileId === canBeEnpassant) {
        // @ts-ignore
        const [epX, epY] = _getRelativePos(currentTurn, targetTileId);
        const takeTileId = _getTile(board, epX, epY - 1);

        state.tileMap = {
          ...state.tileMap,
          [takeTileId]: { pieceId: undefined, highlight: false },
        };
      }
    },
    runPostMoveCalcs(
      state,
      action: PayloadAction<{ pieceId: PieceId; targetTileId: TileId }>
    ) {},
    updateMovedPieces(state, action: PayloadAction<{ pieceId: PieceId }>) {
      const { pieceId } = action.payload;
      state.movedPieces = {
        ...state.movedPieces,
        [pieceId]: true,
      };
    },
    updateAttackedTiles(
      state,
      action: PayloadAction<{ player: Player; attackedTiles: TileId[] }>
    ) {
      const { player, attackedTiles } = action.payload;
      if (player === "W") {
        state.whiteAttackedTiles = attackedTiles;
      } else {
        state.blackAttackedTiles = attackedTiles;
      }
    },
    switchTurns(state) {
      if (state.currentTurn === "W") {
        state.currentTurn = "B";
      } else {
        state.currentTurn = "W";
      }
    },
    determineEnpassantEligibility(
      state,
      action: PayloadAction<{ pieceId: PieceId; targetTileId: TileId }>
    ) {
      const { pieceId, targetTileId } = action.payload;
      const { movedPieces } = state;
      const player = _getPlayer(pieceId);
      const board = _getBoard(player);

      state.canBeEnpassant = undefined;
      if (!movedPieces?.[pieceId]) {
        // @ts-ignore
        const [targetX, targetY] = _getRelativePos(player, targetTileId);
        if (targetY === 3) {
          state.canBeEnpassant = _getTile(board, targetX, 2);
        }
      }
    },
    determineCastleEligibility(state) {
      const { movedPieces, tileMap } = state;
      const canCastle: Record<Player, TileId[]> = { W: [], B: [] };

      if (!movedPieces?.[PIECES.WK]) {
        if (
          !movedPieces?.[PIECES.WR1] &&
          !(tileMap.B1.pieceId || tileMap.C1.pieceId || tileMap.D1.pieceId)
        ) {
          canCastle.W.push(TILES.C1);
        }
        if (
          !movedPieces?.[PIECES.WR2] &&
          !(tileMap.F1.pieceId || tileMap.G1.pieceId)
        ) {
          canCastle.W.push(TILES.G1);
        }
      }

      if (movedPieces?.[PIECES.BK]) {
      } else {
        if (
          !movedPieces?.[PIECES.BR1] &&
          !(tileMap.B8.pieceId || tileMap.C8.pieceId || tileMap.D8.pieceId)
        ) {
          canCastle.B.push(TILES.C8);
        }
        if (
          !movedPieces?.[PIECES.BR2] &&
          !(tileMap.F8.pieceId || tileMap.G8.pieceId)
        ) {
          canCastle.B.push(TILES.G8);
        }
      }
      state.canCastle = canCastle;
    },
    highlightTiles(state, action: PayloadAction<{ tiles: TileId[] }>) {
      const { tiles } = action.payload;
      tiles.forEach((id) => {
        state.tileMap[id].highlight = true;
      });
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
