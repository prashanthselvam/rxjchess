import { ChessGameState } from "./index";
import { TileId } from "../data/constants";
import { BLACK_MAP, WHITE_MAP } from "../data/main";

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
