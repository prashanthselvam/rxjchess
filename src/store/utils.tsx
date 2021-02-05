import { ChessGameState } from "./index";
import { PieceId, TileId } from "../data/constants";
import { BLACK_BOARD, WHITE_BOARD } from "../data/main";

/**
 * Clears highlights from all the tiles in tileMap in state
 *
 * @param state
 */
export const clearHighlights = (state: ChessGameState) => {
  Object.entries(state.tileMap).forEach(([tileId, { highlight }]) => {
    if (highlight) {
      state.tileMap[tileId].highlight = false;
    }
  });
};

export const getPlayer = (pieceId: PieceId) => {
  if (pieceId.slice(0, 1) === "W") {
    return "W";
  } else {
    return "B";
  }
};
