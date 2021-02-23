import { filter, mergeMap, pluck } from "rxjs/operators";
import { actions, ChessGameState } from "../index";
import { TileId } from "src/types/constants";
import { iif, of } from "rxjs";
import {
  _getPieceType,
  _getPlayer,
  _getAttackedTilesMap,
  _getCheckMoveTiles,
  getPeggedTileMap,
  determinePossibleMoves,
  _getOpponent,
} from "../utils";
import { AnyAction } from "@reduxjs/toolkit";
import { Epic } from "redux-observable";

const consoleLog = (x) => console.log(x);

export type GameEpic = Epic<AnyAction, AnyAction, ChessGameState>;

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
      } else if (isPegged) {
        const peggedPath = peggedTileMap[tileId];
        possibleMoves.push(
          ...allPossibleMoves.filter((id) => peggedPath.includes(id))
        );
      } else if (isActiveCheck) {
        const numCheckingPieces = checkOriginTiles.length;
        if (numCheckingPieces === 1) {
          possibleMoves.push(
            ...allPossibleMoves.filter((id) => checkBlockTiles.includes(id))
          );
        }
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

      const isActiveCheck = !!checkOriginTiles.length;

      const calcActions: AnyAction[] = [
        actions.determineEnpassantEligibility({ pieceId, targetTileId }),
        actions.updateMovedPieces({ pieceId }),
        actions.determineCastleEligibility(),
        actions.updateAttackedTiles({
          player,
          attackedTiles: allAttackedTiles,
        }),
        actions.updatePeggedTileMap({ peggedTileMap }),
        actions.updateCheckDetails({
          isActiveCheck,
          checkOriginTiles,
          checkBlockTiles,
        }),
      ];

      isActiveCheck && calcActions.push(actions.determineCheckmate({ player }));

      return of(...calcActions);
    })
  );

const determineCheckmateEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.determineCheckmate.match),
    pluck("payload"),
    mergeMap(({ player }) => {
      const {
        boardState: {
          tileMap,
          blackAttackedTiles,
          whiteAttackedTiles,
          peggedTileMap,
          canBeEnpassant,
          canCastle,
        },
        checkState: { checkBlockTiles, checkOriginTiles },
      } = state$.value;

      const checkedPlayer = player === "W" ? "B" : "W";

      const checkmate = Object.entries(tileMap)
        .filter(
          ([, { pieceId }]) => pieceId && _getPlayer(pieceId) === checkedPlayer
        )
        .every(([tileId, { pieceId }]) => {
          const isPegged = Object.keys(peggedTileMap).includes(tileId);
          const allPossibleMoves = determinePossibleMoves(
            checkedPlayer,
            pieceId!,
            tileId,
            whiteAttackedTiles,
            blackAttackedTiles,
            tileMap,
            canCastle,
            canBeEnpassant
          );

          let numPossibleMoves = 0;

          if (_getPieceType(pieceId!) === "K") {
            const filterTiles =
              checkedPlayer === "W" ? blackAttackedTiles : whiteAttackedTiles;

            numPossibleMoves += allPossibleMoves.filter(
              (id) => !filterTiles.includes(id)
            ).length;
          } else if (isPegged) {
            const peggedPath = peggedTileMap[tileId];
            numPossibleMoves += allPossibleMoves.filter((id) =>
              peggedPath.includes(id)
            ).length;
          } else {
            const numCheckingPieces = checkOriginTiles.length;
            if (numCheckingPieces === 1) {
              numPossibleMoves += allPossibleMoves.filter((id) =>
                checkBlockTiles.includes(id)
              ).length;
            }
          }
          return numPossibleMoves === 0;
        });

      return iif(() => checkmate, of(actions.endGame({ winner: player })));
    })
  );

const gameEpics = [
  selectTileEpic,
  postMoveCleanupEpic,
  postCleanupCalcsEpic,
  determineCheckmateEpic,
];

export default gameEpics;
