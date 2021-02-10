import {
  concatMap,
  filter,
  ignoreElements,
  map,
  mergeMap,
  pairwise,
  pluck,
  tap,
} from "rxjs/operators";
import { actions, TileMap } from "../index";
import { PieceId, TileId } from "../../types/constants";
import { BLACK_BOARD, WHITE_BOARD } from "../../data/main";
import { from, of } from "rxjs";
import * as stream from "stream";
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from "src/store/moveFunctions";
import { _getPieceType } from "../utils";
import { AnyAction } from "@reduxjs/toolkit";

const consoleLog = (x) => console.log(x);

/**
 * determinePossibleMoves - Receives information about the piece that might move, where it is,
 * and which tiles on the board are occupied by which team. It then determines which tiles the
 * piece can move to.
 *
 * @param player
 * @param pieceId
 * @param tileId
 // * @param whiteOccupiedTiles
 // * @param blackOccupiedTiles
 // * @param peggedTiles
 */
const determinePossibleMoves = (
  player: Player,
  pieceId: PieceId,
  tileId: TileId,
  whiteOccupiedTiles: TileId[],
  blackOccupiedTiles: TileId[],
  peggedTiles: TileId[],
  tileMap: TileMap,
  canCastle,
  canBeEnpassant
) => {
  const pieceToMoveMap = {
    P: pawnMoves,
    R: rookMoves,
    N: knightMoves,
    B: bishopMoves,
    Q: queenMoves,
    K: kingMoves,
  };

  // Determine what type of piece this is
  const pieceType = pieceId[1];
  const movesFunc = pieceToMoveMap?.[pieceType];

  // Get the moves
  return movesFunc
    ? movesFunc(player, tileId, tileMap, { canCastle, canBeEnpassant })
    : [];

  // Get the rule set for this piece
  // Run the rule set against the board maps to determine where the piece can go
  // Run against occupied tiles info to determine where piece can actually go
  // Return tiles the piece can go to
};

const selectTileEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.selectTile.match),
    pluck("payload"),
    mergeMap(({ tileId }) => {
      const {
        currentTurn,
        tileMap,
        whiteOccupiedTiles,
        blackOccupiedTiles,
        peggedTiles,
        canCastle,
        canBeEnpassant,
      } = state$.value;

      const possibleMoves = determinePossibleMoves(
        currentTurn,
        tileMap[tileId].pieceId,
        tileId,
        whiteOccupiedTiles,
        blackOccupiedTiles,
        peggedTiles,
        tileMap,
        canCastle,
        canBeEnpassant
      );

      return of(actions.highlightPossibleMoves({ possibleMoves }));
    })
  );

const postMoveCleanupEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    pluck("payload"),
    mergeMap(({ targetTileId }) => {
      const { tileMap } = state$.value;
      const pieceId = tileMap[targetTileId].pieceId;

      return of(
        actions.deselect(),
        actions.switchTurns(),
        actions.runPostMoveCalcs({ pieceId, targetTileId })
      );
    })
  );

const postCleanupCalcsEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.runPostMoveCalcs.match),
    pluck("payload"),
    mergeMap(({ pieceId, targetTileId }) => {
      const calcActions: AnyAction[] = [
        actions.updateMovedPieces({ pieceId }),
        actions.determineCastleEligibility(),
      ];

      // This needs to be run before movedPieces is updated
      _getPieceType(pieceId) === "P" &&
        calcActions.unshift(
          actions.determineEnpassantEligibility({ pieceId, targetTileId })
        );

      return of(...calcActions);
    })
  );

const gameEpics = [selectTileEpic, postMoveCleanupEpic, postCleanupCalcsEpic];

export default gameEpics;
