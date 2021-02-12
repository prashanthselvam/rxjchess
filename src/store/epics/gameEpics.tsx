import { filter, mergeMap, pluck } from "rxjs/operators";
import { actions, ChessGameState, TileMap } from "../index";
import { PieceId, TileId, TILES } from "../../types/constants";
import { of } from "rxjs";
import {
  getAttackedTilesMap,
  getCheckMoveTiles,
  pieceToMoveMap,
} from "src/store/moveFunctions";
import {
  _getBoard,
  _getPieceType,
  _getPlayer,
  _getRelativePos,
} from "../utils";
import { AnyAction } from "@reduxjs/toolkit";
import { Epic } from "redux-observable";

const consoleLog = (x) => console.log(x);

export type GameEpic = Epic<AnyAction, AnyAction, ChessGameState>;

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

const selectTileEpic: GameEpic = (action$, state$) =>
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

      const pieceId = tileMap[tileId].pieceId!;

      const possibleMoves = determinePossibleMoves(
        currentTurn,
        pieceId,
        tileId,
        peggedTiles,
        whiteAttackedTiles,
        blackAttackedTiles,
        tileMap,
        canCastle,
        canBeEnpassant
      );

      return of(actions.highlightPossibleMoves({ pieceId, possibleMoves }));
    })
  );

const postMoveCleanupEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    pluck("payload"),
    mergeMap(({ targetTileId }) => {
      const { tileMap } = state$.value;
      const pieceId = tileMap[targetTileId].pieceId!;

      return of(
        actions.deselect(),
        actions.switchTurns(),
        actions.runPostMoveCalcs({ pieceId, targetTileId })
      );
    })
  );

const postCleanupCalcsEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.runPostMoveCalcs.match),
    pluck("payload"),
    mergeMap(({ pieceId, targetTileId }) => {
      const { tileMap } = state$.value;
      const player = _getPlayer(pieceId);

      const allAttackedTiles: TileId[] = [];
      const checkOriginTiles: TileId[] = [];
      const checkBlockTiles: TileId[] = [];

      const opponentKing = player === "W" ? "BK" : "WK";
      const opponentKingTile = Object.entries(tileMap).find(
        ([_, { pieceId }]) => pieceId === opponentKing
      )?.[0]!;

      const attackedTilesMap = getAttackedTilesMap(player, tileMap);

      Object.entries(attackedTilesMap).forEach(
        ([tileId, { pieceId, attackedTiles }]) => {
          if (attackedTiles.includes(opponentKingTile)) {
            checkOriginTiles.push(tileId);
            checkBlockTiles.push(
              ...getCheckMoveTiles(player, pieceId, tileId, opponentKingTile)
            );
          }
          allAttackedTiles.push(...attackedTiles);
        }
      );

      const calcActions: AnyAction[] = [
        actions.updateMovedPieces({ pieceId }),
        actions.determineCastleEligibility(),
        actions.updateAttackedTiles({
          player,
          attackedTiles: allAttackedTiles,
        }),
        actions.updateCheckDetails({
          isActiveCheck: !!checkOriginTiles.length,
          checkOriginTiles,
          checkBlockTiles,
        }),
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
