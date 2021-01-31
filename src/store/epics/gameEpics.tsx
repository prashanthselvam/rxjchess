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
import { PieceID, TileID } from "../../data/constants";
import { BLACK_MAP, WHITE_MAP } from "../../data/main";
import { of } from "rxjs";
import * as stream from "stream";

const consoleLog = (x) => console.log(x);

/**
 * getRelativePos - util function to get the x & y coordinates of a piece relative
 * to that piece's player's POV. This saves us from having to calculate possible moves
 * differently for white & black.
 *
 * @param player
 * @param tileId
 */
const getRelativePos = (player: Player, tileId: TileID) => {
  const map = player === "W" ? WHITE_MAP : BLACK_MAP;

  return map
    .map((row, yPos) => {
      if (row.includes(tileId)) {
        return [row.indexOf(tileId), yPos];
      }
    })
    .find((x) => Array.isArray(x));
};

/**
 *
 */
const pawnMoves = (player: Player, tileId: TileID) => {
  const map = player === "W" ? WHITE_MAP : BLACK_MAP;

  const isFirstMove =
    (player === "W" && parseInt(tileId[1]) === 2) ||
    (player === "B" && parseInt(tileId[1]) === 7);

  // @ts-ignore
  const lala = getRelativePos(player, tileId);

  console.log({ lala });

  // @ts-ignore
  const [relativeX, relativeY] = lala;
  // const [relativeX, relativeY] = getRelativePos(player, tileId);

  const moves = [map[relativeY + 1][relativeX]];

  console.log({ tileId, relativeX, relativeY, map });

  return isFirstMove ? [...moves, map[relativeY + 2][relativeX]] : moves;
};

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
  pieceId: PieceID,
  tileId: TileID,
  whiteOccupiedTiles: TileID[],
  blackOccupiedTiles: TileID[],
  peggedTiles: TileID[]
) => {
  const pieceToMoveMap = {
    P: pawnMoves,
  };

  // Determine what type of piece this is
  const pieceType = pieceId[1];
  const movesFunc = pieceToMoveMap?.[pieceType];

  // Get the moves
  return movesFunc ? movesFunc(player, tileId) : [];

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
      } = state$.value;

      const possibleMoves = determinePossibleMoves(
        currentTurn,
        tileMap[tileId].pieceId,
        tileId,
        whiteOccupiedTiles,
        blackOccupiedTiles,
        peggedTiles
      );

      return of(actions.highlightPossibleMoves({ possibleMoves }));
    })
  );

const postMoveCleanupEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.moveToTile.match),
    mergeMap(() => of(actions.deselect()))
  );

const gameEpics = [selectTileEpic, postMoveCleanupEpic];

export default gameEpics;
