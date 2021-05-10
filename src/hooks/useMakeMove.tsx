import { actions, ChessGameState, store } from "src/store";
import { TileId } from "src/types/constants";
import { usePubNub } from "pubnub-react";
import { useSelector } from "react-redux";

interface MoveParams {
  targetTileId: TileId;
  sourceTileId?: TileId;
  promotePieceType?: "Q" | "B" | "R" | "N";
}

/**
 * useMakeMove - Provides a function to make moves. This handles the logic of talking to
 * PubNub if we need to (i.e. if an online game with a friend is ongoing).
 *
 */
const useMakeMove = () => {
  const pubNub = usePubNub();
  const { playMode, gameId, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const selectedTile = useSelector(
    (state: ChessGameState) => state.boardState.selectedTile
  );

  const isPlayingOnline = gameId && playMode === "PLAY FRIEND";

  const makeMove = (moveParams: MoveParams) => {
    store.dispatch(actions.moveToTile(moveParams));
    if (isPlayingOnline) {
      pubNub.publish({
        channel: gameId,
        message: {
          type: "MOVE",
          player: player,
          moveParams: { ...moveParams, sourceTileId: selectedTile },
        },
      });
    }
  };

  return makeMove;
};

export default useMakeMove;
