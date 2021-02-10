import { filter, mergeMap, pluck } from "rxjs/operators";
import { actions, TileMap } from "../index";
import { PieceId, TileId } from "../../types/constants";
import { of } from "rxjs";
import { getAttackedTiles, pieceToMoveMap } from "src/store/moveFunctions";
import { _getPieceType, _getPlayer } from "../utils";
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
  peggedTiles: TileId[],
  whiteAttackedTiles: TileId[],
  blackAttackedTiles: TileId[],
  tileMap: TileMap,
  canCastle,
  canBeEnpassant
) => {
  const pieceType = _getPieceType(pieceId);
  const movesFunc = pieceToMoveMap?.[pieceType];
  const attackedTiles =
    player === "W" ? blackAttackedTiles : whiteAttackedTiles;

  return movesFunc(player, tileId, tileMap, false, {
    canCastle,
    canBeEnpassant,
    attackedTiles,
  });
};

const selectTileEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.selectTile.match),
    pluck("payload"),
    mergeMap(({ tileId }) => {
      const {
        currentTurn,
        tileMap,
        peggedTiles,
        whiteAttackedTiles,
        blackAttackedTiles,
        canCastle,
        canBeEnpassant,
      } = state$.value;

      const possibleMoves = determinePossibleMoves(
        currentTurn,
        tileMap[tileId].pieceId,
        tileId,
        peggedTiles,
        whiteAttackedTiles,
        blackAttackedTiles,
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
      const { tileMap } = state$.value;
      const player = _getPlayer(pieceId);

      const attackedTiles = getAttackedTiles(player, tileMap);

      const calcActions: AnyAction[] = [
        actions.updateMovedPieces({ pieceId }),
        actions.determineCastleEligibility(),
        actions.updateAttackedTiles({ player, attackedTiles }),
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
