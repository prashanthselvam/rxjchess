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

interface TileMapData {
  pieceId: PieceId | undefined;
  highlight: boolean;
}

interface Move {
  player: Player;
  pieceId: PieceId;
  sourceTileId: TileId;
  targetTileId: TileId;
  takenPieceId: PieceId | undefined;
  isMoveCheck?: boolean;
  castledRook: PieceId | undefined;
  promotedPiece?: PieceId;
}

export type TileMap = Record<TileId, TileMapData>;
export type CanCastle = Record<Player, TileId[]>;

interface MovesState {
  movedPieces: Record<PieceId, boolean>; // Easy reference to know which pieces have been moved
  moveHistory: Move[]; // Array of moves
  historyTileMap: TileMap; // identical to tileMap but used for rendering historic state (previous moves, last moved, etc.)
}

interface BoardState {
  tileMap: TileMap; // mapping of each tile to the piece ID that's on it
  selectedTile: TileId | undefined; // the tile selected by the user. Can only ever be their own piece occupied tile
  selectedPiece: PieceId | undefined; // the pieceID on the selected tile
  whiteAttackedTiles: TileId[]; // tiles that white is attacking
  blackAttackedTiles: TileId[]; // tiles that black is attacking
  peggedTileMap: Record<TileId, TileId[]>; // Mapping of tiles that are pegged to the peg path
  canCastle: CanCastle; // mapping of which pieces can castle for each side
  canBeEnpassant: TileId | undefined; // the tile that can be taken via enpassant (if any)
}

interface CheckState {
  isActiveCheck: boolean; // is currentTurn player in check
  checkOriginTiles: TileId[]; // if in check, tile(s) from where the check originates
  checkBlockTiles: TileId[]; // if in check, tile(s) which can be moved to to block the check
}

export interface ChessGameState {
  gameStatus: GameStatus;
  winner: Player | undefined;
  currentTurn: Player;
  pov: Player;
  movesState: MovesState;
  boardState: BoardState;
  checkState: CheckState;
  modalState: undefined | "PAWN_PROMOTE" | "GAME_OVER" | "SHARE_GAME_URL";
}

const tileMapInitialState = Object.keys(TILES).reduce((acc, curr) => {
  return { ...acc, [curr]: { pieceId: undefined, highlight: false } };
}, {});

const initialState: ChessGameState = {
  gameStatus: "NOT STARTED",
  winner: undefined,
  currentTurn: "W",
  pov: "W",
  movesState: {
    movedPieces: {},
    moveHistory: [],
    historyTileMap: tileMapInitialState,
  },
  boardState: {
    tileMap: tileMapInitialState,
    selectedTile: undefined,
    selectedPiece: undefined,
    whiteAttackedTiles: [],
    blackAttackedTiles: [],
    peggedTileMap: {},
    canCastle: { W: [], B: [] },
    canBeEnpassant: undefined,
  },
  checkState: {
    isActiveCheck: false,
    checkOriginTiles: [],
    checkBlockTiles: [],
  },
  modalState: undefined,
};

const gameSlice = createSlice({
  name: "gameSlice",
  initialState: initialState,
  reducers: {
    reset: (state: ChessGameState) => initialState,
    initializeGame(state: ChessGameState) {
      state.gameStatus = "INITIALIZING";
    },
    newGame(
      state: ChessGameState,
      action: PayloadAction<{ gameType: GameTypes }>
    ) {
      const { gameType } = action.payload;
      const whiteOccupiedTiles: TileId[] = [];
      const blackOccupiedTiles: TileId[] = [];
      const initialPositions = GAME_TYPES[gameType].initialPositions;

      // Clear the board
      state.boardState.tileMap = tileMapInitialState;

      Object.entries(initialPositions).forEach(([tileId, pieceId]) => {
        state.boardState.tileMap[tileId] = {
          pieceId: pieceId,
          highlight: false,
        };
      });

      state.currentTurn = "W";
      state.boardState.whiteAttackedTiles = whiteOccupiedTiles;
      state.boardState.blackAttackedTiles = blackOccupiedTiles;
      state.gameStatus = "IN PROGRESS";
    },
    endGame(state: ChessGameState, action: PayloadAction<{ winner?: Player }>) {
      state.gameStatus = "GAME OVER";
      state.winner = action.payload?.winner;
    },
    determineCheckmate(
      state: ChessGameState,
      action: PayloadAction<{ player: Player }>
    ) {},
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
      const { tileId } = action.payload;
      state.boardState.selectedTile = tileId;
      state.boardState.selectedPiece = state.boardState.tileMap[tileId].pieceId;
    },
    deselect(state: ChessGameState) {
      _clearHighlights(state);
      state.boardState.selectedTile = undefined;
      state.boardState.selectedPiece = undefined;
    },
    highlightPossibleMoves(
      state: ChessGameState,
      action: PayloadAction<{ pieceId: PieceId; possibleMoves: TileId[] }>
    ) {
      action.payload.possibleMoves.forEach((id) => {
        state.boardState.tileMap[id].highlight = true;
      });
    },
    moveToTile(
      state: ChessGameState,
      action: PayloadAction<{ targetTileId: TileId; sourceTileId?: TileId }>
    ) {
      const {
        currentTurn,
        boardState: {
          selectedTile,
          selectedPiece: pieceId,
          tileMap,
          canBeEnpassant,
        },
        movesState: { movedPieces },
      } = state;

      if (!pieceId) {
        throw Error;
      }

      const { targetTileId, sourceTileId } = action.payload;
      const board = _getBoard(currentTurn);
      const sourceId = sourceTileId || selectedTile;
      let takenPieceId = tileMap[targetTileId].pieceId;
      let castledRook: PieceId | undefined = undefined;

      // Update tile map based on where we're moving the piece
      state.boardState.tileMap = {
        ...tileMap,
        [sourceId!]: { pieceId: undefined, highlight: false },
        [targetTileId]: {
          pieceId,
          highlight: false,
        },
      };

      // See if the move was actually a castle, in which case we need to update the appropriate rook as well
      if (_getPieceType(pieceId) === "K" && !movedPieces?.[pieceId]) {
        if (currentTurn === "W") {
          if (targetTileId === TILES.C1) {
            state.boardState.tileMap = {
              ...state.boardState.tileMap,
              [TILES.A1]: { pieceId: undefined, highlight: false },
              [TILES.D1]: { pieceId: PIECES.WR1, highlight: false },
            };
            castledRook = PIECES.WR1;
          } else if (targetTileId === TILES.G1) {
            state.boardState.tileMap = {
              ...state.boardState.tileMap,
              [TILES.H1]: { pieceId: undefined, highlight: false },
              [TILES.F1]: { pieceId: PIECES.WR2, highlight: false },
            };
            castledRook = PIECES.WR2;
          }
        } else if (currentTurn === "B") {
          if (targetTileId === TILES.C8) {
            state.boardState.tileMap = {
              ...state.boardState.tileMap,
              [TILES.A8]: { pieceId: undefined, highlight: false },
              [TILES.D8]: { pieceId: PIECES.BR1, highlight: false },
            };
            castledRook = PIECES.BR1;
          } else if (targetTileId === TILES.G8) {
            state.boardState.tileMap = {
              ...state.boardState.tileMap,
              [TILES.H8]: { pieceId: undefined, highlight: false },
              [TILES.F8]: { pieceId: PIECES.BR2, highlight: false },
            };
            castledRook = PIECES.BR2;
          }
        }
      }

      // If the move was an en-passant take by a pawn then remove the taken pawn from board
      if (_getPieceType(pieceId) === "P" && targetTileId === canBeEnpassant) {
        // @ts-ignore
        const [epX, epY] = _getRelativePos(currentTurn, targetTileId);
        const takeTileId = _getTile(board, epX, epY - 1);
        takenPieceId = tileMap[takeTileId].pieceId;

        state.boardState.tileMap = {
          ...state.boardState.tileMap,
          [takeTileId]: { pieceId: undefined, highlight: false },
        };
      }

      const move: Move = {
        player: currentTurn,
        pieceId,
        sourceTileId: sourceId!,
        targetTileId,
        takenPieceId: takenPieceId,
        castledRook,
      };

      // Finally update move history
      state.movesState.moveHistory.push(move);
      _clearHighlights(state, true);
      state.movesState.historyTileMap[sourceId!].highlight = true;
      state.movesState.historyTileMap[targetTileId!].highlight = true;
    },
    runPostCleanupCalcs(
      state: ChessGameState,
      action: PayloadAction<{ pieceId: PieceId; targetTileId: TileId }>
    ) {},
    updateMovedPieces(
      state: ChessGameState,
      action: PayloadAction<{ pieceId: PieceId }>
    ) {
      const { pieceId } = action.payload;
      state.movesState.movedPieces = {
        ...state.movesState.movedPieces,
        [pieceId]: true,
      };
    },
    updateAttackedTiles(
      state: ChessGameState,
      action: PayloadAction<{ player: Player; attackedTiles: TileId[] }>
    ) {
      const { player, attackedTiles } = action.payload;
      if (player === "W") {
        state.boardState.whiteAttackedTiles = attackedTiles;
      } else {
        state.boardState.blackAttackedTiles = attackedTiles;
      }
    },
    updatePeggedTileMap(
      state: ChessGameState,
      action: PayloadAction<{ peggedTileMap: Record<TileId, TileId[]> }>
    ) {
      state.boardState.peggedTileMap = action.payload.peggedTileMap;
    },
    updateCheckDetails(
      state: ChessGameState,
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
      state.checkState.isActiveCheck = isActiveCheck;
      state.checkState.checkOriginTiles = checkOriginTiles;
      state.checkState.checkBlockTiles = checkBlockTiles;

      // @ts-ignore
      const lastMoveWithCheck: Move = {
        ...state.movesState.moveHistory.pop(),
        isMoveCheck: isActiveCheck,
      };
      state.movesState.moveHistory.push(lastMoveWithCheck);
    },
    switchTurns(state: ChessGameState) {
      if (state.currentTurn === "W") {
        state.currentTurn = "B";
      } else {
        state.currentTurn = "W";
      }
    },
    determineEnpassantEligibility(
      state: ChessGameState,
      action: PayloadAction<{ pieceId: PieceId; targetTileId: TileId }>
    ) {
      const { pieceId, targetTileId } = action.payload;
      const isPiecePawn = _getPieceType(pieceId) === "P";
      const {
        movesState: { movedPieces },
      } = state;
      const player = _getPlayer(pieceId);
      const board = _getBoard(player);

      state.boardState.canBeEnpassant = undefined;
      if (isPiecePawn && !movedPieces?.[pieceId]) {
        // @ts-ignore
        const [targetX, targetY] = _getRelativePos(player, targetTileId);
        if (targetY === 3) {
          state.boardState.canBeEnpassant = _getTile(board, targetX, 2);
        }
      }
    },
    determineCastleEligibility(state: ChessGameState) {
      const {
        currentTurn,
        movesState: { movedPieces },
        boardState: { tileMap, whiteAttackedTiles, blackAttackedTiles },
        checkState: { isActiveCheck },
      } = state;
      const canCastle: Record<Player, TileId[]> = { W: [], B: [] };
      const blackInCheck = isActiveCheck && currentTurn === "B";
      const whiteInCheck = isActiveCheck && currentTurn === "W";

      if (!movedPieces?.[PIECES.WK] && !whiteInCheck) {
        if (
          !movedPieces?.[PIECES.WR1] &&
          !(tileMap.B1.pieceId || tileMap.C1.pieceId || tileMap.D1.pieceId) &&
          !blackAttackedTiles.includes(TILES.B1) &&
          !blackAttackedTiles.includes(TILES.C1)
        ) {
          canCastle.W.push(TILES.C1);
        }
        if (
          !movedPieces?.[PIECES.WR2] &&
          !(tileMap.F1.pieceId || tileMap.G1.pieceId) &&
          !blackAttackedTiles.includes(TILES.F1) &&
          !blackAttackedTiles.includes(TILES.G1)
        ) {
          canCastle.W.push(TILES.G1);
        }
      }

      if (!movedPieces?.[PIECES.BK] && !blackInCheck) {
        if (
          !movedPieces?.[PIECES.BR1] &&
          !(tileMap.B8.pieceId || tileMap.C8.pieceId || tileMap.D8.pieceId) &&
          !whiteAttackedTiles.includes(TILES.B8) &&
          !whiteAttackedTiles.includes(TILES.C8)
        ) {
          canCastle.B.push(TILES.C8);
        }
        if (
          !movedPieces?.[PIECES.BR2] &&
          !(tileMap.F8.pieceId || tileMap.G8.pieceId) &&
          !whiteAttackedTiles.includes(TILES.F8) &&
          !whiteAttackedTiles.includes(TILES.G8)
        ) {
          canCastle.B.push(TILES.G8);
        }
      }
      state.boardState.canCastle = canCastle;
    },
    highlightTiles(state, action: PayloadAction<{ tiles: TileId[] }>) {
      const { tiles } = action.payload;
      tiles.forEach((id) => {
        state.boardState.tileMap[id].highlight = true;
      });
    },
    showModal(
      state,
      action: PayloadAction<{ type: ChessGameState["modalState"] }>
    ) {
      state.modalState = action.payload.type;
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
