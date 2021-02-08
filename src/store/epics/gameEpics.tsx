import {
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
import { of } from "rxjs";
import * as stream from "stream";
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from "src/store/moveFunctions";

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
  canCastle
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
  return movesFunc ? movesFunc(player, tileId, tileMap, { canCastle }) : [];

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
      } = state$.value;

      const possibleMoves = determinePossibleMoves(
        currentTurn,
        tileMap[tileId].pieceId,
        tileId,
        whiteOccupiedTiles,
        blackOccupiedTiles,
        peggedTiles,
        tileMap,
        canCastle
      );

      return of(actions.highlightPossibleMoves({ possibleMoves }));
    })
  );

const postMoveCleanupEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    mergeMap(() => {
      return of(actions.deselect(), actions.determineCastleEligibility());
    })
  );

const gameEpics = [selectTileEpic, postMoveCleanupEpic];

export default gameEpics;
