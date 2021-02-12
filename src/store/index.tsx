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
  movedPieces: Record<PieceId, boolean>;
  selectedTile: TileId | undefined; // the tile selected by the user. Can only ever be their own piece occupied tile
  isActiveCheck: boolean; // is currentTurn player in check
  checkOriginTiles: TileId[]; // if in check, tile(s) from where the check originates
  checkBlockTiles: TileId[]; // if in check, tile(s) which can be moved to to block the check
  pov: Player;
  whiteAttackedTiles: TileId[]; // tiles that white is attacking
  blackAttackedTiles: TileId[]; // tiles that black is attacking
  peggedTiles: TileId[]; // tiles that are pegged
  canCastle: CanCastle; // mapping of which pieces can castle for each side
  canBeEnpassant: TileId | undefined; // the tile that can be taken via enpassant (if any)
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
  checkOriginTiles: [],
  checkBlockTiles: [],
  pov: "W",
  whiteAttackedTiles: [],
  blackAttackedTiles: [],
  peggedTiles: [],
  movedPieces: {},
  canCastle: { W: [], B: [] },
  canBeEnpassant: undefined,
};

const gameSlice = createSlice({
  name: "gameSlice",
  initialState: initialState,
  reducers: {
    newGame(
      state: ChessGameState,
      action: PayloadAction<{ gameType: GameTypes }>
    ) {
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
    togglePov(state: ChessGameState) {
      if (state.pov === "W") {
        state.pov = "B";
        state.currentTurn = "B";
      } else {
        state.pov = "W";
        state.currentTurn = "W";
      }
    },
    selectTile(
      state: ChessGameState,
      action: PayloadAction<{ tileId: TileId }>
    ) {
      _clearHighlights(state);
      state.selectedTile = action.payload.tileId;
    },
    deselect(state: ChessGameState) {
      _clearHighlights(state);
      state.selectedTile = undefined;
    },
    highlightPossibleMoves(
      state: ChessGameState,
      action: PayloadAction<{ pieceId: PieceId; possibleMoves: TileId[] }>
    ) {
      const { pieceId, possibleMoves } = action.payload;
      const {
        currentTurn,
        whiteAttackedTiles,
        blackAttackedTiles,
        isActiveCheck,
        checkOriginTiles,
        checkBlockTiles,
      } = state;

      // Kings have their own rules
      if (_getPieceType(pieceId) === "K") {
        const filterTiles =
          currentTurn === "W" ? blackAttackedTiles : whiteAttackedTiles;
        possibleMoves.forEach((id) => {
          if (!filterTiles.includes(id)) {
            state.tileMap[id].highlight = true;
          }
        });
        return;
      }

      // If we're in check, the tiles which can be moved to is limited
      if (isActiveCheck) {
        const numCheckingPieces = checkOriginTiles.length;
        if (numCheckingPieces > 1) {
          return;
        } else {
          possibleMoves.forEach((id) => {
            if (checkBlockTiles.includes(id)) {
              state.tileMap[id].highlight = true;
            }
          });
        }
      } else {
        possibleMoves.forEach((id) => {
          state.tileMap[id].highlight = true;
        });
      }
    },
    moveToTile(
      state: ChessGameState,
      action: PayloadAction<{ targetTileId: TileId }>
    ) {
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
    updateCheckDetails(
      state,
      action: PayloadAction<{
        isActiveCheck: boolean;
        checkOriginTiles: TileId[];
        checkBlockTiles: TileId[];
      }>
    ) {
      const {
        isActiveCheck,
        checkOriginTiles = [],
        checkBlockTiles = [],
      } = action.payload;
      state.isActiveCheck = isActiveCheck;
      state.checkOriginTiles = checkOriginTiles;
      state.checkBlockTiles = checkBlockTiles;
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
  extraReducers: {},
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
