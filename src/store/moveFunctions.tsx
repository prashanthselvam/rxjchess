import { TileId } from "src/types/constants";
import range from "lodash/range";
import { TileMap } from "./index";
import {
  _getPlayer,
  _getBoard,
  _getRelativePos,
  _getTileOccupant,
  _getTile,
  _getPossibleMoves,
} from "./utils";

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

  const possibleForwardMoves = _getPossibleMoves(
    allForwardMoves,
    tileMap,
    player,
    false
  );

  // Determine the tiles where pawn can take (i.e. diagonal and one step away)
  const allTakeMoves = [
    _getTile(board, x - 1, y + 1),
    _getTile(board, x + 1, y + 1),
  ];

  const possibleTakeMoves = allTakeMoves.filter((tileId) => {
    const occupant = _getTileOccupant(tileMap, tileId);
    return occupant && _getPlayer(occupant) !== player;
  });

  return [...possibleForwardMoves, ...possibleTakeMoves];
};

export const rookMoves = (player: Player, tileId: TileId, tileMap: TileMap) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  const allLeftMoves = range(x - 1, -1, -1).map((n) => _getTile(board, n, y));
  const allRightMoves = range(x + 1, 8).map((n) => _getTile(board, n, y));
  const allUpMoves = range(y + 1, 8).map((n) => _getTile(board, x, n));
  const allDownMoves = range(y - 1, -1, -1).map((n) => _getTile(board, x, n));

  return [
    ..._getPossibleMoves(allLeftMoves, tileMap, player),
    ..._getPossibleMoves(allRightMoves, tileMap, player),
    ..._getPossibleMoves(allUpMoves, tileMap, player),
    ..._getPossibleMoves(allDownMoves, tileMap, player),
  ];
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
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  // I suspect there's a better way to do this but gonna leave as is for now cause it works
  const maxUp = 7 - y;
  const maxDown = y;
  const maxRight = 7 - x;
  const maxLeft = x;

  const allUpRightMoves =
    !!maxUp && !!maxRight
      ? range(0, Math.min(maxUp, maxRight) + 1).map((n) =>
          _getTile(board, x + n, y + n)
        )
      : [];
  const allDownRightMoves =
    !!maxDown && !!maxRight
      ? range(0, Math.min(maxDown, maxRight) + 1).map((n) =>
          _getTile(board, x + n, y - n)
        )
      : [];
  const allDownLeftMoves =
    !!maxDown && !!maxLeft
      ? range(0, Math.min(maxDown, maxLeft) + 1).map((n) =>
          _getTile(board, x - n, y - n)
        )
      : [];
  const allUpLeftMoves =
    !!maxUp && !!maxLeft
      ? range(0, Math.min(maxUp, maxLeft) + 1).map((n) =>
          _getTile(board, x - n, y + n)
        )
      : [];

  return [allUpRightMoves, allDownRightMoves, allDownLeftMoves, allUpLeftMoves]
    .map((moves) => moves.filter((id) => id !== tileId))
    .flatMap((moves) => _getPossibleMoves(moves, tileMap, player));
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
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);
  const indexInRange = (n) => n >= 0 && n <= 7;

  return [-1, 0, 1]
    .filter((n) => indexInRange(y + n))
    .flatMap((yOffset) => {
      return [-1, 0, 1]
        .filter((n) => indexInRange(x + n))
        .map((xOffset) => _getTile(board, x + xOffset, y + yOffset));
    })
    .filter((id) => id != tileId)
    .filter((tileId) => {
      const occupant = _getTileOccupant(tileMap, tileId);
      return !occupant || _getPlayer(occupant) !== player;
    });
};
