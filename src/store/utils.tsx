import { ChessGameState } from "./index";

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
