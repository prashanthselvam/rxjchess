import { PieceId, TileId } from "src/types/constants";
import range from "lodash/range";
import { CanCastle, TileMap } from "./index";
import {
  _getPlayer,
  _getBoard,
  _getRelativePos,
  _getTileOccupant,
  _getTile,
  _getPossibleMoves,
  _getPieceType,
} from "./utils";

interface OptionalParams {
  canBeEnpassant?: TileId;
  canCastle?: CanCastle;
}

type MoveFunction = (
  player: Player,
  tileId: TileId,
  tileMap: TileMap,
  forAttackCalc: boolean,
  optionalParams?: OptionalParams
) => TileId[];

export const pawnMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc = false,
  { canBeEnpassant = undefined } = {}
) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  const isFirstMove =
    (player === "W" && parseInt(tileId[1]) === 2) ||
    (player === "B" && parseInt(tileId[1]) === 7);

  const indexInRange = (n) => n >= 0 && n <= 7;

  // Determine the tiles where pawn can move forward
  const allForwardMoves = indexInRange(y + 1)
    ? [_getTile(board, x, y + 1)]
    : [];
  isFirstMove && allForwardMoves.push(_getTile(board, x, y + 2));

  const possibleForwardMoves = _getPossibleMoves(
    allForwardMoves,
    tileMap,
    player,
    forAttackCalc,
    false
  );

  // Determine the tiles where pawn can take (i.e. diagonal and one step away)
  const allTakeMoves = [
    _getTile(board, x - 1, y + 1),
    _getTile(board, x + 1, y + 1),
  ].filter((id) => id);

  const possibleTakeMoves = allTakeMoves.filter((tileId) => {
    const occupant = _getTileOccupant(tileMap, tileId);
    return occupant && _getPlayer(occupant) !== player;
  });

  // Check if there's a piece we can en-passant and if so, add the appropriate tile
  if (canBeEnpassant) {
    const [epX, epY] = _getRelativePos(player, canBeEnpassant);
    if (y + 1 === epY && Math.abs(x - epX) === 1) {
      possibleTakeMoves.push(canBeEnpassant);
    }
  }

  return forAttackCalc
    ? allTakeMoves
    : [...possibleForwardMoves, ...possibleTakeMoves];
};

export const rookMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc = false
) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);

  const allLeftMoves = range(x - 1, -1, -1).map((n) => _getTile(board, n, y));
  const allRightMoves = range(x + 1, 8).map((n) => _getTile(board, n, y));
  const allUpMoves = range(y + 1, 8).map((n) => _getTile(board, x, n));
  const allDownMoves = range(y - 1, -1, -1).map((n) => _getTile(board, x, n));

  return [
    ..._getPossibleMoves(allLeftMoves, tileMap, player, forAttackCalc),
    ..._getPossibleMoves(allRightMoves, tileMap, player, forAttackCalc),
    ..._getPossibleMoves(allUpMoves, tileMap, player, forAttackCalc),
    ..._getPossibleMoves(allDownMoves, tileMap, player, forAttackCalc),
  ];
};

export const knightMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc = false
) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);
  const indexInRange = (n) => n >= 0 && n <= 7;

  return [-2, -1, 1, 2]
    .filter((n) => indexInRange(y + n))
    .flatMap((yOffset) => {
      const xOffsets = Math.abs(yOffset) == 2 ? [-1, 1] : [-2, 2];
      return xOffsets
        .filter((n) => indexInRange(x + n))
        .map((xOffset) => _getTile(board, x + xOffset, y + yOffset));
    })
    .filter((tileId) => {
      if (forAttackCalc) {
        return tileId;
      }
      const occupant = _getTileOccupant(tileMap, tileId);
      return !occupant || _getPlayer(occupant) !== player;
    });
};

export const bishopMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc = false
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
    .flatMap((moves) =>
      _getPossibleMoves(moves, tileMap, player, forAttackCalc)
    );
};

export const queenMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc = false
) => {
  // The queen moves essentially like a bishop plus rook so let's just use those
  return [
    ...bishopMoves(player, tileId, tileMap, forAttackCalc),
    ...rookMoves(player, tileId, tileMap, forAttackCalc),
  ];
};

export const kingMoves: MoveFunction = (
  player,
  tileId,
  tileMap,
  forAttackCalc,
  { canCastle = { W: [], B: [] } } = {}
) => {
  const board = _getBoard(player);
  // @ts-ignore
  const [x, y] = _getRelativePos(player, tileId);
  const indexInRange = (n) => n >= 0 && n <= 7;

  const regularMoves = [-1, 0, 1]
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

  const castleMoves = canCastle[player];

  return [...regularMoves, ...castleMoves];
};

interface AttackedTileObject {
  pieceId: PieceId;
  attackedTiles: TileId[];
}

type GetAttackedTilesMap = (
  player: Player,
  tileMap: TileMap
) => Record<TileId, AttackedTileObject>;

export const getAttackedTilesMap: GetAttackedTilesMap = (player, tileMap) =>
  Object.entries(tileMap)
    .filter(([, { pieceId }]) => pieceId && _getPlayer(pieceId) === player)
    .reduce((acc, [tileId, { pieceId }]) => {
      const pieceType = _getPieceType(pieceId!);
      const moveFunc = pieceToMoveMap[pieceType];
      const attackedTiles = moveFunc(player, tileId, tileMap, true);
      acc[tileId] = { pieceId, attackedTiles };
      return acc;
    }, {});

export const getCheckMoveTiles = (
  player: Player,
  pieceId: PieceId,
  origin: TileId,
  destination: TileId
) => {
  const pieceType = _getPieceType(pieceId);
  const board = _getBoard(player);
  // @ts-ignore
  const [originX, originY] = _getRelativePos(player, origin);
  // @ts-ignore
  const [destX, destY] = _getRelativePos(player, destination);

  if (pieceType === "P" || pieceType === "N") {
    return [origin];
  } else {
    const yOffset = destY - originY;
    const xOffset = destX - originX;

    // horizontal case
    if (yOffset === 0) {
      return range(originX, destX).map((n) => _getTile(board, n, originY));
    } else if (xOffset === 0) {
      return range(originY, destY).map((n) => _getTile(board, originX, n));
    } else {
      const xOffsets = range(0, xOffset);
      const yOffsets = range(0, yOffset);

      return xOffsets.map((n, i) =>
        _getTile(board, originX + n, originY + yOffsets[i])
      );
    }
  }
};

export const pieceToMoveMap = {
  P: pawnMoves,
  R: rookMoves,
  N: knightMoves,
  B: bishopMoves,
  Q: queenMoves,
  K: kingMoves,
};
