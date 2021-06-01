import {
  createSlice,
  configureStore,
  PayloadAction,
  AnyAction,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import {
  getInitialTileMap,
  PieceId,
  PIECES,
  TileId,
  TILES,
} from "src/types/constants";
import { createEpicMiddleware } from "redux-observable";
import rootEpic from "./epics";
import {
  _clearHighlights,
  _getBoard,
  _getOpponent,
  _getPieceType,
  _getPlayer,
  _getRelativePos,
  _getTile,
  _isPiecePromoted,
} from "./utils";

interface TileMapData {
  pieceId: PieceId | undefined;
  highlight: boolean;
}

export interface Move {
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

/**
 * STATE INTERFACES
 */

interface CurrentGameState {
  gameId: any;
  status: GameStatus;
  gameType: GameTypes | undefined;
  playMode: PlayModes | undefined;
  maxTime: number | "unlimited";
  increment: number;
  currentTurn: Player | undefined;
  winner: Player | undefined;
  player: Player | undefined;
}

interface MovesState {
  movedPieces: Record<PieceId, boolean>; // Easy reference to know which pieces have been moved
  moveHistory: Move[]; // Array of moves
  historyTileMap: TileMap; // identical to tileMap but used for rendering historic state (previous moves, last moved, etc.)
  isShowingHistory: boolean; // When we want to render historic moves, we switch this to true
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

export interface ModalProps {
  targetTileId?: TileId;
  winner?: Player | undefined;
  winMode?: WinModes | undefined;
  quitter?: Player;
  multiplayerGameStatus?: MultiplayerGameStatus;
}

export interface ModalState {
  type:
    | undefined
    | "PAWN_PROMOTE"
    | "GAME_OVER"
    | "QUIT_GAME"
    | "MULTIPLAYER_STATUS";
  modalProps?: ModalProps;
}

export interface ChessGameState {
  currentGameState: CurrentGameState;
  movesState: MovesState;
  boardState: BoardState;
  checkState: CheckState;
  modalState: ModalState;
}

export const tileMapInitialState = Object.keys(TILES).reduce((acc, curr) => {
  return { ...acc, [curr]: { pieceId: undefined, highlight: false } };
}, {});

const initialState: ChessGameState = {
  currentGameState: {
    gameId: undefined,
    status: "NOT STARTED",
    playMode: undefined,
    gameType: undefined,
    winner: undefined,
    currentTurn: "W",
    player: "W",
    maxTime: 5,
    increment: 0,
  },
  movesState: {
    movedPieces: {},
    moveHistory: [],
    historyTileMap: tileMapInitialState,
    isShowingHistory: false,
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
  modalState: {
    type: undefined,
  },
};

const gameSlice = createSlice({
  name: "gameSlice",
  initialState: initialState,
  reducers: {
    reset: (state: ChessGameState) => initialState,
    initializeGame(state: ChessGameState) {
      state.currentGameState.status = "INITIALIZING";
    },
    newGame(
      state: ChessGameState,
      action: PayloadAction<{
        playMode: PlayModes;
        gameType: "REGULAR";
        player: Player;
        maxTime: number | "unlimited";
        increment: number;
        gameId?: any;
      }>
    ) {
      const {
        playMode,
        gameType,
        player,
        maxTime,
        increment,
        gameId,
      } = action.payload;
      const whiteOccupiedTiles: TileId[] = [];
      const blackOccupiedTiles: TileId[] = [];

      // Set the game state
      state.currentGameState.playMode = playMode;
      state.currentGameState.gameType = gameType;
      state.currentGameState.player = player;
      state.currentGameState.maxTime = maxTime;
      state.currentGameState.increment = increment;

      // Set up the board
      state.boardState.tileMap = getInitialTileMap(gameType);

      state.boardState.whiteAttackedTiles = whiteOccupiedTiles;
      state.boardState.blackAttackedTiles = blackOccupiedTiles;
      state.currentGameState.status = "READY";
      state.currentGameState.currentTurn = "W";
      state.currentGameState.gameId = gameId;
    },
    endGame(
      state: ChessGameState,
      action: PayloadAction<{
        winner?: Player;
        winMode?: WinModes;
      }>
    ) {
      const { winner, winMode } = action.payload;
      state.currentGameState.status = "GAME OVER";
      state.currentGameState.winner = winner;
      state.modalState = { type: "GAME_OVER", modalProps: { winner, winMode } };
    },
    determineCheckmate(
      state: ChessGameState,
      action: PayloadAction<{ player: Player }>
    ) {},
    determineStalemate(
      state: ChessGameState,
      action: PayloadAction<{ player: Player }>
    ) {},
    togglePov(state: ChessGameState) {
      if (state.currentGameState.player) {
        state.currentGameState.player = _getOpponent(
          state.currentGameState.player
        );
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
      action: PayloadAction<{
        targetTileId: TileId;
        sourceTileId?: TileId;
        promotePieceType?: "Q" | "B" | "R" | "N";
      }>
    ) {
      const {
        currentGameState: { currentTurn, playMode, player, status },
        boardState: { selectedTile, selectedPiece, tileMap, canBeEnpassant },
        movesState: { movedPieces },
      } = state;

      if (status === "GAME OVER") {
        return;
      }

      const { targetTileId, sourceTileId } = action.payload;
      let { promotePieceType } = action.payload;
      let pieceId;

      if (sourceTileId && !selectedTile) {
        pieceId = tileMap[sourceTileId].pieceId;
      } else {
        pieceId = selectedPiece;
      }

      if (!pieceId) {
        throw Error;
      }

      // If the move was made by AI it's possible it's a pawn promotion
      if (
        playMode === "PLAY COMPUTER" &&
        _getPieceType(pieceId) === "P" &&
        currentTurn !== player
      ) {
        // @ts-ignore
        const [_, y] = _getRelativePos(currentTurn!, targetTileId);
        if (y === 7) {
          promotePieceType = "Q";
        }
      }

      const board = _getBoard(currentTurn!);
      const sourceId = sourceTileId || selectedTile;
      let takenPieceId = tileMap[targetTileId].pieceId;
      let castledRook: PieceId | undefined = undefined;
      let targetPieceId = pieceId;

      // If we're promoting a pawn, figure out new piece to add to board
      if (promotePieceType) {
        const newPieceCount = Object.values(tileMap).filter(
          ({ pieceId }) =>
            pieceId &&
            _isPiecePromoted(pieceId) &&
            _getPieceType(pieceId) === promotePieceType
        ).length;
        targetPieceId = `${currentTurn}${promotePieceType}_P_${newPieceCount}`;
      }

      // Update tile map based on where we're moving the piece
      state.boardState.tileMap = {
        ...tileMap,
        [sourceId!]: { pieceId: undefined, highlight: false },
        [targetTileId]: {
          pieceId: targetPieceId,
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
        player: currentTurn!,
        pieceId,
        sourceTileId: sourceId!,
        targetTileId,
        takenPieceId: takenPieceId,
        castledRook,
        promotedPiece: promotePieceType && targetPieceId,
      };

      // Finally update move history
      state.movesState.moveHistory.push(move);
      _clearHighlights(state, true);
      state.movesState.historyTileMap[sourceId!].highlight = true;
      state.movesState.historyTileMap[targetTileId!].highlight = true;
    },
    runPostMoveCalcs(
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
      if (state.currentGameState.status === "READY") {
        state.currentGameState.status = "IN PROGRESS";
      }

      if (state.currentGameState.currentTurn === "W") {
        state.currentGameState.currentTurn = "B";
      } else {
        state.currentGameState.currentTurn = "W";
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
        currentGameState: { currentTurn },
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
    restoreBoardAtMove(
      state,
      action: PayloadAction<{ index?: number; latest?: boolean }>
    ) {
      const { moveHistory } = state.movesState;
      const initialTileMapClone = Object.assign(
        {},
        getInitialTileMap(state.currentGameState.gameType)
      );
      const { index, latest } = action.payload;

      // Restore to latest move and highlight last move
      if (index === moveHistory.length - 1 || latest) {
        const { sourceTileId, targetTileId } = moveHistory.slice(-1)[0];
        initialTileMapClone[sourceTileId] = {
          pieceId: undefined,
          highlight: true,
        };
        initialTileMapClone[targetTileId] = {
          pieceId: undefined,
          highlight: true,
        };
        state.movesState.historyTileMap = initialTileMapClone;
        state.movesState.isShowingHistory = false;
        return;
      }

      moveHistory
        .slice(0, index!! + 1)
        .forEach(
          (
            { pieceId, sourceTileId, targetTileId, castledRook, promotedPiece },
            i
          ) => {
            initialTileMapClone[sourceTileId] = {
              pieceId: undefined,
              highlight: i === index,
            };
            initialTileMapClone[targetTileId] = {
              pieceId: promotedPiece ? promotedPiece : pieceId,
              highlight: i === index,
            };

            if (castledRook) {
              const rookPositions = {
                WR1: ["A1", "D1"],
                WR2: ["H1", "F1"],
                BR1: ["A8", "D8"],
                BR2: ["H8", "F8"],
              };

              initialTileMapClone[rookPositions[castledRook][0]] = {
                pieceId: undefined,
                highlight: false,
              };
              initialTileMapClone[rookPositions[castledRook][1]] = {
                pieceId: castledRook,
                highlight: false,
              };
            }
          }
        );

      state.movesState.historyTileMap = initialTileMapClone;
      state.movesState.isShowingHistory = true;
    },
    setModalState(
      state,
      action: PayloadAction<{ modalState: ChessGameState["modalState"] }>
    ) {
      state.modalState = action.payload.modalState;
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
