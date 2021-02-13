import { ChessGameState, TileMap } from "./index";
import { PieceId, TileId, BLACK_BOARD, WHITE_BOARD } from "src/types/constants";
import range from "lodash/range";
import { pieceToMoveMap } from "./moveFunctions";

/**
 * _clearHighlights - Clears highlights from all the tiles in tileMap in state. Only can be used within our epics
 *
 * @param state
 */
export const _clearHighlights = (state: ChessGameState) => {
  Object.entries(state.boardState.tileMap).forEach(
    ([tileId, { highlight }]) => {
      if (highlight) {
        state.boardState.tileMap[tileId].highlight = false;
      }
    }
  );
};

/**
 * _getPlayer - Given a pieceId, returns the player ("W" or "B")
 *
 * @param pieceId
 */
export const _getPlayer = (pieceId: PieceId) =>
  pieceId.slice(0, 1) === "W" ? "W" : "B";

/**
 * _getOpponent - Given a pieceId, returns the opponent player ("W" or "B")
 *
 * @param pieceId
 */
export const _getOpponent = (pieceId: PieceId) =>
  pieceId.slice(0, 1) === "W" ? "B" : "W";

/**
 * _getPieceType - Get the type of piece a pieceId represents (P, K, B, R, etc.)
 *
 * @param pieceId
 */
export const _getPieceType = (pieceId: PieceId) => pieceId[1];

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
export const _getTile = (board: TileId[][], x: XPos, y: YPos) =>
  board?.[y]?.[x];

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
 * @param forAttackCalc
 */
export const _getPossibleMoves = (
  allMoves: TileId[],
  tileMap: TileMap,
  player: Player,
  forAttackCalc: boolean,
  canTakeAtDestination: boolean = true
) => {
  const nearestOccupiedIndex = allMoves.findIndex(
    (tileId) => !!tileMap[tileId].pieceId
  );

  if (nearestOccupiedIndex > -1) {
    const pieceAtIndex = _getTileOccupant(
      tileMap,
      allMoves[nearestOccupiedIndex]
    )!;

    const playerAtIndex = _getPlayer(pieceAtIndex);
    const pieceAtIndexIsOpponentKing =
      _getPieceType(pieceAtIndex) === "K" && playerAtIndex !== player;

    // If a B, R, or Q is checking the king, the king cannot move to the next tile in that piece's path
    if (pieceAtIndexIsOpponentKing && forAttackCalc) {
      return allMoves.slice(0, nearestOccupiedIndex + 2);
    }

    const canTakeAtIndex =
      nearestOccupiedIndex > -1 &&
      canTakeAtDestination &&
      playerAtIndex !== player;

    if (canTakeAtIndex || forAttackCalc) {
      return allMoves.slice(0, nearestOccupiedIndex + 1);
    } else {
      return allMoves.slice(0, nearestOccupiedIndex);
    }
  }

  return allMoves;
};

interface AttackedTileObject {
  pieceId: PieceId;
  attackedTiles: TileId[];
}

type GetAttackedTilesMap = (
  player: Player,
  tileMap: TileMap
) => Record<TileId, AttackedTileObject>;

/**
 * getAttackedTilesMap - For a given player (B or W), returns an object where keys are the tileIDs where that
 * player has pieces and the values are an array of tileIDs those pieces are attacking (have access to). This
 * helps us determine where the opposite team's king can move.
 *
 * @param player
 * @param tileMap
 */
export const _getAttackedTilesMap: GetAttackedTilesMap = (player, tileMap) =>
  Object.entries(tileMap)
    .filter(([, { pieceId }]) => pieceId && _getPlayer(pieceId) === player)
    .reduce((acc, [tileId, { pieceId }]) => {
      const pieceType = _getPieceType(pieceId!);
      const moveFunc = pieceToMoveMap[pieceType];
      const attackedTiles = moveFunc(player, tileId, tileMap, true);
      acc[tileId] = { pieceId, attackedTiles };
      return acc;
    }, {});

/**
 * getCheckMoveTiles - If there is an active check, we need to know the tiles that the defending
 * player can move to to deflect the check. This function gives us those tiles.
 *
 * @param player
 * @param pieceId
 * @param origin
 * @param destination
 */
export const _getCheckMoveTiles = (
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

    if (yOffset === 0) {
      // horizontal case (rook or queen)
      return range(originX, destX).map((n) => _getTile(board, n, originY));
    } else if (xOffset === 0) {
      // vertical case (rook or queen)
      return range(originY, destY).map((n) => _getTile(board, originX, n));
    } else {
      // diagonal case (bishop or queen)
      const xOffsets = range(0, xOffset);
      const yOffsets = range(0, yOffset);

      return xOffsets.map((n, i) =>
        _getTile(board, originX + n, originY + yOffsets[i])
      );
    }
  }
};

/**
 * _getPeggedTile - Takes in tileMap and an array of tileIds, where path[0] is where the B, Q, or R is situated
 * and path[-1] is right before the opposite team's king's tile. Also takes in the king's player. It then
 * checks if there is a pegged piece on the path.
 *
 * !!NOTE: The array of tileIds is meant to be uni-directional and emanating from the position of the "pegger" piece.
 * Only meant to be used by getPeggedTiles function below.
 *
 * @param path
 * @param tileMap
 * @param kingPlayer
 */
export const _getPeggedTile = (
  path: TileId[],
  tileMap: TileMap,
  kingPlayer: Player
) => {
  const nearestOpponentIndex = path.findIndex((tileId) => {
    const pieceId = tileMap[tileId].pieceId;
    return pieceId && _getPlayer(pieceId) === kingPlayer;
  });

  if (nearestOpponentIndex > -1) {
    const isPegged = path
      .slice(nearestOpponentIndex + 1)
      .every((tileId) => tileMap[tileId].pieceId === undefined);

    if (isPegged) {
      return path[nearestOpponentIndex];
    }
  }
  return undefined;
};

/**
 * getPeggedTiles - Takes in the tileMap and returns a mapping of pegged tileIDs to the peg path (i.e. the list
 * of tileIDs leading from the piece attacking the pegged tile to the pegged tile).
 *
 * @param tileMap
 */
export const getPeggedTileMap = (tileMap: TileMap) => {
  const kingTiles = Object.entries(tileMap).reduce(
    (acc, [tileId, { pieceId }]) => {
      if (pieceId && _getPieceType(pieceId) === "K") {
        const player = _getPlayer(pieceId);
        acc[player] = _getRelativePos(player, tileId);
      }
      return acc;
    },
    {}
  );

  return Object.entries(tileMap).reduce((acc, [tileId, { pieceId }]) => {
    if (pieceId) {
      const pieceType = _getPieceType(pieceId);
      if (["B", "R", "Q"].includes(pieceType)) {
        const kingPlayer = _getOpponent(pieceId);

        const [peggerX, peggerY] = _getRelativePos(kingPlayer, tileId);
        const [kingX, kingY] = kingTiles[kingPlayer];

        const xOffset = kingX - peggerX;
        const yOffset = kingY - peggerY;

        const isStraightPath = yOffset === 0 || xOffset === 0;
        const isDiagonalPath = Math.abs(xOffset) === Math.abs(yOffset);
        const canPeg =
          (pieceType === "B" && isDiagonalPath) ||
          (pieceType === "R" && isStraightPath) ||
          (pieceType === "Q" && (isDiagonalPath || isStraightPath));

        if (!canPeg) {
          return acc;
        }

        const board = _getBoard(kingPlayer);
        const path: TileId[] = [];

        if (yOffset === 0) {
          path.push(
            ...range(peggerX, kingX)
              .map((n) => _getTile(board, n, peggerY))
              .slice(1)
          );
        } else if (xOffset === 0) {
          path.push(
            ...range(peggerX, kingY)
              .map((n) => _getTile(board, peggerX, n))
              .slice(1)
          );
        } else {
          const xOffsets = range(0, xOffset);
          const yOffsets = range(0, yOffset);
          path.push(
            ...xOffsets
              .map((n, i) =>
                _getTile(board, peggerX + n, peggerY + yOffsets[i])
              )
              .slice(1)
          );
        }

        const peggedTile = _getPeggedTile(path, tileMap, kingPlayer);
        if (peggedTile) {
          acc[peggedTile] = [tileId, ...path];
        }
      }
    }
    return acc;
  }, {});
};
