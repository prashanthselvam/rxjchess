import { BLACK_BOARD, WHITE_BOARD } from "./main";
import { TileId } from "./constants";
import range from "lodash/range";
import { TileMap } from "../store";
import { getPlayer } from "../store/utils";

/**
 * _getBoard - Get the board layout depending on player perspective
 *
 * @param player
 */
const _getBoard = (player: Player) =>
  player === "W" ? WHITE_BOARD : BLACK_BOARD;

/**
 * _getTile - Given a board map and a x & y position, returns the tileId at that position
 *
 * @param board
 * @param x
 * @param y
 */
const _getTile = (board: TileId[][], x: XPos, y: YPos) => board[y][x];

/**
 * _getTileOccupant - Given a tileMap and a tileId, returns the pieceId stationed at that tile
 *
 * @param tileMap
 * @param tileId
 */
const _getTileOccupant = (tileMap: TileMap, tileId: TileId) =>
  tileMap[tileId]?.pieceId;

/**
 * _getRelativePos - util function to get the x & y coordinates of a piece relative
 * to that piece's player's POV. This saves us from having to calculate possible moves
 * differently for white & black.
 *
 * @param player
 * @param tileId
 */
const _getRelativePos = (player: Player, tileId: TileId) => {
  const board = player === "W" ? WHITE_BOARD : BLACK_BOARD;

  return board
    .map((row, yPos) => {
      if (row.includes(tileId)) {
        return [row.indexOf(tileId), yPos];
      }
    })
    .find((x) => Array.isArray(x));
};

export const pawnMoves = (player: Player, tileId: TileId, tileMap: TileMap) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  const isFirstMove =
    (player === "W" && parseInt(tileId[1]) === 2) ||
    (player === "B" && parseInt(tileId[1]) === 7);

  // Determine the tiles where pawn can move forward
  const allForwardMoves = [_getTile(board, x, y + 1)];
  isFirstMove && allForwardMoves.push(_getTile(board, x, y + 2));

  const nearestOccupiedIndex = allForwardMoves.findIndex(
    (tileId) => !!tileMap?.[tileId]?.pieceId
  );

  const possibleForwardMoves =
    nearestOccupiedIndex > -1
      ? allForwardMoves.slice(0, nearestOccupiedIndex)
      : allForwardMoves;

  // Determine the tiles where pawn can take (i.e. diagonal and one step away)
  const allTakeMoves = [
    _getTile(board, x - 1, y + 1),
    _getTile(board, x + 1, y + 1),
  ];

  const possibleTakeMoves = allTakeMoves.filter((tileId) => {
    const occupant = _getTileOccupant(tileMap, tileId);
    return occupant && getPlayer(occupant) !== player;
  });

  return possibleForwardMoves.concat(possibleTakeMoves);
};

export const rookMoves = (player: Player, tileId: TileId, tileMap: TileMap) => {
  const map = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  const horizontalMoves = range(8)
    .filter((n) => n != x)
    .map((n) => map[y][n]);
  const verticalMoves = range(8)
    .filter((n) => n != y)
    .map((n) => map[n][x]);

  return [...horizontalMoves, ...verticalMoves];
};

export const knightMoves = (
  player: Player,
  tileId: TileId,
  tileMap: TileMap
) => {
  const map = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  // Probably a cool loop for this but can figure out later
  const allOptions = [
    [x + 1, y + 2],
    [x + 1, y - 2],
    [x - 1, y + 2],
    [x - 1, y - 2],
    [x + 2, y + 1],
    [x + 2, y - 1],
    [x - 2, y + 1],
    [x - 2, y - 1],
  ];
  return allOptions
    .filter(([x, y]) => x >= 0 && x <= 7 && y >= 0 && y <= 7)
    .map(([x, y]) => map[y][x]);
};

export const bishopMoves = (
  player: Player,
  tileId: TileId,
  tileMap: TileMap
) => {
  const map = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  // I suspect there's a better way to do this but gonna leave as is for now. Breaking out into these vectors might
  // come in handy when we need to block the piece from going further in a particular direction if it's blocked
  const maxUp = 7 - y;
  const maxDown = y;
  const maxRight = 7 - x;
  const maxLeft = x;

  const upRight =
    !!maxUp && !!maxRight
      ? range(0, Math.min(maxUp, maxRight) + 1).map((n) => map[y + n][x + n])
      : [];
  const downRight =
    !!maxDown && !!maxRight
      ? range(0, Math.min(maxDown, maxRight) + 1).map((n) => map[y - n][x + n])
      : [];
  const downLeft =
    !!maxDown && !!maxLeft
      ? range(0, Math.min(maxDown, maxLeft) + 1).map((n) => map[y - n][x - n])
      : [];
  const upLeft =
    !!maxUp && !!maxLeft
      ? range(0, Math.min(maxUp, maxLeft) + 1).map((n) => map[y + n][x - n])
      : [];

  return [...upRight, ...downRight, ...downLeft, ...upLeft].filter(
    (id) => id != tileId
  );
};

export const queenMoves = (
  player: Player,
  tileId: TileId,
  tileMap: TileMap
) => {
  // The queen moves essentially like a bishop plus rook so let's just use those
  return [
    ...bishopMoves(player, tileId, tileMap),
    ...rookMoves(player, tileId, tileMap),
  ];
};

export const kingMoves = (player: Player, tileId: TileId, tileMap: TileMap) => {
  const map = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);
  const indexInRange = (n) => n >= 0 && n <= 7;

  return [-1, 0, 1]
    .filter((n) => indexInRange(y + n))
    .flatMap((yOffset) => {
      return [-1, 0, 1]
        .filter((n) => indexInRange(x + n))
        .map((xOffset) => map[y + yOffset][x + xOffset]);
    })
    .filter((id) => id != tileId);
};
