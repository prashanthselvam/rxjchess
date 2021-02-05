import { ChessGameState, TileMap } from "./index";
import { PieceId, TileId, BLACK_BOARD, WHITE_BOARD } from "src/types/constants";

/**
 * _clearHighlights - Clears highlights from all the tiles in tileMap in state. Only can be used within our epics
 *
 * @param state
 */
export const _clearHighlights = (state: ChessGameState) => {
  Object.entries(state.tileMap).forEach(([tileId, { highlight }]) => {
    if (highlight) {
      state.tileMap[tileId].highlight = false;
    }
  });
};

/**
 * _getPlayer - Given a pieceId, returns the player ("W" or "B")
 *
 * @param pieceId
 */
export const _getPlayer = (pieceId: PieceId) => {
  if (pieceId.slice(0, 1) === "W") {
    return "W";
  } else {
    return "B";
  }
};

/**
 * _getBoard - Get the board layout depending on player perspective
 *
 * @param player
 */
export const _getBoard = (player: Player) =>
  player === "W" ? WHITE_BOARD : BLACK_BOARD;

/**
 * _getTile - Given a board map and a x & y position, returns the tileId at that position
 *
 * @param board
 * @param x
 * @param y
 */
export const _getTile = (board: TileId[][], x: XPos, y: YPos) => board[y][x];

/**
 * _getTileOccupant - Given a tileMap and a tileId, returns the pieceId stationed at that tile
 *
 * @param tileMap
 * @param tileId
 */
export const _getTileOccupant = (tileMap: TileMap, tileId: TileId) =>
  tileMap[tileId]?.pieceId;

/**
 * _getRelativePos - util function to get the x & y coordinates of a piece relative
 * to that piece's player's POV. This saves us from having to calculate possible moves
 * differently for white & black.
 *
 * @param player
 * @param tileId
 */
export const _getRelativePos = (player: Player, tileId: TileId) => {
  const board = player === "W" ? WHITE_BOARD : BLACK_BOARD;

  return board
    .map((row, yPos) => {
      if (row.includes(tileId)) {
        return [row.indexOf(tileId), yPos];
      }
    })
    .find((x) => Array.isArray(x));
};

/**
 * _getPossibleMoves - Utility function for all pieces except knights. Takes in an array of tileIds, the tileMap,
 * and the player we are determining moves for and comes back with which tiles can actually be moved to.
 *
 * !!NOTE: The array of possible tiles is meant to be uni-directional and emanating from the position of the piece
 * we're determining moves for.
 *
 * @param allMoves
 * @param tileMap
 * @param player
 * @param canTakeAtDestination
 */
export const _getPossibleMoves = (
  allMoves: TileId[],
  tileMap: TileMap,
  player: Player,
  canTakeAtDestination: boolean = true
) => {
  const nearestOccupiedIndex = allMoves.findIndex(
    (tileId) => !!tileMap?.[tileId]?.pieceId
  );

  const canTakeAtIndex =
    nearestOccupiedIndex > -1 &&
    canTakeAtDestination &&
    _getPlayer(_getTileOccupant(tileMap, allMoves[nearestOccupiedIndex])!) !==
      player;

  if (nearestOccupiedIndex > -1) {
    if (canTakeAtIndex) {
      return allMoves.slice(0, nearestOccupiedIndex + 1);
    } else {
      return allMoves.slice(0, nearestOccupiedIndex);
    }
  } else {
    return allMoves;
  }
};
