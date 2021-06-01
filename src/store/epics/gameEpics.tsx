import { filter, mergeMap, pluck } from "rxjs/operators";
import { actions, ChessGameState } from "../index";
import { TileId } from "src/types/constants";
import { EMPTY, iif, of } from "rxjs";
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

export type GameEpic = Epic<AnyAction, AnyAction, ChessGameState>;

/**
 * selectTileEpic: Listens for the `selectTile` action which is fired when a player selects an occupied tile with the
 * intention of maybe moving the piece on that tile. The epic calculates the possible moves that can be made by the
 * occupying piece and fires a `highlightPossibleMoves` action to highlight those tiles.
 *
 */
const selectTileEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.selectTile.match),
    pluck("payload"),
    mergeMap(({ tileId }) => {
      const {
        currentGameState: { currentTurn },
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
        currentTurn!,
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

/**
 * postMoveCleanupEpic: The `moveToTile` action is dispatched when a player wants to move a piece from a sourceTile to a
 * targetTile. The action handles all the state updates to reflect that move. This Epic then covers a few key follow up
 * tasks by firing the following actions:
 *  1. `deselect`: Removes any highlights from possibleMoveTiles and from the moved tile/piece
 *  2. `switchTurns`: As the name implies, updates state.currentGameState.currentTurn
 *  3. `runPostMoveCalcs`: An action that's listened to by the postMoveCalcsEpic
 */
const postMoveCleanupEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    pluck("payload"),
    mergeMap(({ targetTileId }) => {
      const {
        boardState: { tileMap },
        movesState: { isShowingHistory },
        currentGameState: { status },
      } = state$.value;
      const pieceId = tileMap[targetTileId].pieceId!;

      const maybeRestoreToLatest: AnyAction[] = isShowingHistory
        ? [actions.restoreBoardAtMove({ latest: true })]
        : [];

      return ["READY", "IN PROGRESS"].includes(status)
        ? of(
            ...maybeRestoreToLatest,
            actions.deselect(),
            actions.switchTurns(),
            actions.runPostMoveCalcs({ pieceId, targetTileId })
          )
        : EMPTY;
    })
  );

/**
 * postMoveCalcsEpic: This epic listens to the `runPostMoveCalcs` action and its role is to calculate all the stuff
 * that could have changed game state after the last move OR stuff that might affect the scope of possible moves for
 * the next player. It also triggers all the state updates that aren't immediately needed after a turn is made (like
 * updating move history). The full list of its responsibilities includes:
 *  1. Figure out check details, including whether to check for checkMate or not
 *  2. Determine enPassant and castle eligibility
 *  3. Update move history and attacked tiles
 *  4. Update pegged tiles
 */
const postMoveCalcsEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.runPostMoveCalcs.match),
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
        actions.updateAttackedTiles({
          player,
          attackedTiles: allAttackedTiles,
        }),
        actions.updateCheckDetails({
          isActiveCheck,
          checkOriginTiles,
          checkBlockTiles,
        }),
        actions.determineStalemate({ player }),
        actions.determineCastleEligibility(),
        actions.updatePeggedTileMap({ peggedTileMap }),
      ];

      isActiveCheck && calcActions.push(actions.determineCheckmate({ player }));

      return of(...calcActions);
    })
  );

/**
 * determineCheckmateEpic: As the name suggests, this determines if we have a checkmate and if yes, it triggers the
 * `endGame` action with the appropriate payload.
 */
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

      const checkedPlayer = _getOpponent(player);

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

      return iif(
        () => checkmate,
        of(actions.endGame({ winner: player, winMode: "CHECKMATE" }))
      );
    })
  );

/**
 * determineCheckmateEpic: As the name suggests, this determines if we have a checkmate and if yes, it triggers the
 * `endGame` action with the appropriate payload.
 */
const determineStaleMateEpic: GameEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.determineStalemate.match),
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
        checkState: { isActiveCheck },
      } = state$.value;

      if (isActiveCheck) {
        return EMPTY;
      }

      const opponent = _getOpponent(player);

      const stalemate = Object.entries(tileMap)
        .filter(
          ([, { pieceId }]) => pieceId && _getPlayer(pieceId) === opponent
        )
        .every(([tileId, { pieceId }]) => {
          const isPegged = Object.keys(peggedTileMap).includes(tileId);
          const allPossibleMoves = determinePossibleMoves(
            opponent,
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
              opponent === "W" ? blackAttackedTiles : whiteAttackedTiles;

            numPossibleMoves += allPossibleMoves.filter(
              (id) => !filterTiles.includes(id)
            ).length;
          } else if (isPegged) {
            const peggedPath = peggedTileMap[tileId];
            numPossibleMoves += allPossibleMoves.filter((id) =>
              peggedPath.includes(id)
            ).length;
          } else {
            numPossibleMoves += allPossibleMoves.length;
          }

          return numPossibleMoves === 0;
        });

      return iif(() => stalemate, of(actions.endGame({ winner: undefined })));
    })
  );

const gameEpics = [
  selectTileEpic,
  postMoveCleanupEpic,
  postMoveCalcsEpic,
  determineCheckmateEpic,
  determineStaleMateEpic,
];

export default gameEpics;
