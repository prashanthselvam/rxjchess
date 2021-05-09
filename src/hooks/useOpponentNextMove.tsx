import { usePubNub } from "pubnub-react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "../store";
import { useEffect, useState } from "react";
import { _getOpponent } from "../store/utils";

const useOpponentNextMove = () => {
  const pubNub = usePubNub();
  const { gameId, playMode, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const opponent = _getOpponent(player);

  const handleMessage = (event) => {
    const message = event.message;
    if (message.type === "MOVE" && message.player === opponent) {
      store.dispatch(actions.moveToTile(message.moveParams));
    }
  };

  useEffect(() => {
    if (gameId && playMode === "PLAY FRIEND") {
      console.log("this is called");
      pubNub.addListener({ message: handleMessage });
      pubNub.subscribe({ channels: [gameId] });
    }
  }, [gameId, playMode]);

  return null;
};

export default useOpponentNextMove;
