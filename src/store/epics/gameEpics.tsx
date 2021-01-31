import {
  filter,
  ignoreElements,
  map,
  mergeMap,
  pluck,
  tap,
} from "rxjs/operators";
import { actions, TileMap } from "../index";
import { PieceID, TileID } from "../../data/constants";
import { BLACK_MAP, WHITE_MAP } from "../../data/main";
import { of } from "rxjs";

const consoleLog = (x) => console.log(x);

/**
 *
 */
const pawnMoves = (player: Player, tileId: TileID, xPos: XPos, yPos: YPos) => {
  const map = player === "W" ? WHITE_MAP : BLACK_MAP;
  const isFirstMove =
    (player === "W" && parseInt(tileId[1]) === 2) ||
    (player === "B" && parseInt(tileId[1]) === 7);

  const moves = [map[yPos + 1][xPos]];

  return isFirstMove ? [...moves, map[yPos + 2][xPos]] : moves;
};

/**
 * determinePossibleMoves - Receives information about the piece that might move, where it is,
 * and which tiles on the board are occupied by which team. It then determines which tiles the
 * piece can move to.
 *
 * @param player
 * @param pieceId
 * @param xPos
 * @param yPos
 * @param tileId
 // * @param whiteOccupiedTiles
 // * @param blackOccupiedTiles
 // * @param peggedTiles
 */
const determinePossibleMoves = (
  player: Player,
  pieceId: PieceID,
  tileId: TileID,
  xPos: XPos,
  yPos: YPos,
  whiteOccupiedTiles: TileID[],
  blackOccupiedTiles: TileID[],
  peggedTiles: TileID[]
) => {
  // Determine what type of piece this is
  const moves = pawnMoves(player, tileId, xPos, yPos);
  console.log(moves);

  return moves;
  // Get the rule set for this piece
  // Run the rule set against the board maps to determine where the piece can go
  // Run against occupied tiles info to determine where piece can actually go
  // Return tiles the piece can go to
};

const testEpic = (action$, state$) =>
  action$.pipe(
    filter(actions.selectTile.match),
    pluck("payload"),
    mergeMap(({ tileId, xPos, yPos }) => {
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
        xPos,
        yPos,
        whiteOccupiedTiles,
        blackOccupiedTiles,
        peggedTiles
      );

      return of(actions.highlightPossibleMoves({ possibleMoves }));
    })
  );

const gameEpics = [testEpic];

export default gameEpics;
