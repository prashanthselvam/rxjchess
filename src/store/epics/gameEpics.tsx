import { filter, mergeMap, pluck } from "rxjs/operators";
import { actions, ChessGameState, TileMap } from "../index";
import { PieceId, TileId, TILES } from "../../types/constants";
import { of } from "rxjs";
import { pieceToMoveMap } from "src/store/moveFunctions";
import {
  _getBoard,
  _getPieceType,
  _getPlayer,
  _getRelativePos,
  _getAttackedTilesMap,
  _getCheckMoveTiles,
  getPeggedTileMap,
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
 * @param whiteAttackedTiles
 * @param blackAttackedTiles
 * @param tileMap
 * @param canCastle
 * @param canBeEnpassant
 */
const determinePossibleMoves = (
  player: Player,
  pieceId: PieceId,
  tileId: TileId,
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
        boardState: {
          tileMap,
          peggedTileMap,
          whiteAttackedTiles,
          blackAttackedTiles,
          canCastle,
          canBeEnpassant,
        },
        checkState: { isActiveCheck, checkOriginTiles, checkBlockTiles },
      } = state$.value;

      const pieceId = tileMap[tileId].pieceId!;
      const isPegged = Object.keys(peggedTileMap).includes(tileId);
      const possibleMoves: TileId[] = [];

      const allPossibleMoves = determinePossibleMoves(
        currentTurn,
        pieceId,
        tileId,
        whiteAttackedTiles,
        blackAttackedTiles,
        tileMap,
        canCastle,
        canBeEnpassant
      );

      if (_getPieceType(pieceId) === "K") {
        const filterTiles =
          currentTurn === "W" ? blackAttackedTiles : whiteAttackedTiles;

        possibleMoves.push(
          ...allPossibleMoves.filter((id) => !filterTiles.includes(id))
        );
      } else if (isActiveCheck) {
        const numCheckingPieces = checkOriginTiles.length;
        if (numCheckingPieces === 1) {
          possibleMoves.push(
            ...allPossibleMoves.filter((id) => checkBlockTiles.includes(id))
          );
        }
      } else if (isPegged) {
        const peggedPath = peggedTileMap[tileId];
        possibleMoves.push(
          ...allPossibleMoves.filter((id) => peggedPath.includes(id))
        );
      } else {
        possibleMoves.push(...allPossibleMoves);
      }

      return of(actions.highlightPossibleMoves({ pieceId, possibleMoves }));
    })
  );

const postMoveCleanupEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    pluck("payload"),
    mergeMap(({ targetTileId }) => {
      const {
        boardState: { tileMap },
      } = state$.value;
      const pieceId = tileMap[targetTileId].pieceId!;

      return of(
        actions.deselect(),
        actions.switchTurns(),
        actions.runPostCleanupCalcs({ pieceId, targetTileId })
      );
    })
  );

const postCleanupCalcsEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.runPostCleanupCalcs.match),
    pluck("payload"),
    mergeMap(({ pieceId, targetTileId }) => {
      const {
        boardState: { tileMap },
      } = state$.value;
      const player = _getPlayer(pieceId);

      const allAttackedTiles: TileId[] = [];
      const checkOriginTiles: TileId[] = [];
      const checkBlockTiles: TileId[] = [];

      const opponentKing = player === "W" ? "BK" : "WK";
      const opponentKingTile = Object.entries(tileMap).find(
        ([_, { pieceId }]) => pieceId === opponentKing
      )?.[0]!;

      const attackedTilesMap = _getAttackedTilesMap(player, tileMap);
      const peggedTileMap = getPeggedTileMap(tileMap);

      Object.entries(attackedTilesMap).forEach(
        ([tileId, { pieceId, attackedTiles }]) => {
          if (attackedTiles.includes(opponentKingTile)) {
            checkOriginTiles.push(tileId);
            checkBlockTiles.push(
              ..._getCheckMoveTiles(player, pieceId, tileId, opponentKingTile)
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
        actions.updatePeggedTileMap({ peggedTileMap }),
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
