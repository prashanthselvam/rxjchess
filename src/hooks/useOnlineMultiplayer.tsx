import { usePubNub } from "pubnub-react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "../store";
import { useEffect } from "react";
import { _getOpponent } from "src/store/utils";

/**
 * useOnlineMultiplayer - This hook handles much of the logic for communicating
 * game state between 2 online players. Really there's 2 workflows it handles:
 *
 * 1. If a player lands on the site via a valid invite URL, it lets the pubNub
 * channel tied to the URL know that the player has arrived, which then kicks
 * off sharing of game settings and initiating the game on both sides.
 * 2. Once the game has started, this hook also listens for the "MOVE" event
 * fired by the 2 players and makes the move
 *
 * @param urlGameId
 */

const useOnlineMultiplayer = (urlGameId) => {
  const pubNub = usePubNub();
  const { gameId, playMode, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const opponent = _getOpponent(player);

  const moveListener = ({ message }) => {
    if (message.type === "MOVE" && message.player === opponent) {
      store.dispatch(actions.moveToTile(message.moveParams));
      console.log("FIRED MOVE STUFF");
      // } else {
      //   console.log(`Did not recognize ${message.type} in app component`);
    }
  };

  const gameOptionsListener = ({ message }) => {
    if (message.type === "GAME_OPTIONS" && urlGameId) {
      const options = message.gameOptions;
      store.dispatch(
        actions.newGame({ ...options, player: _getOpponent(options.player) })
      );
      console.log("FIRED NEW GAME STUFF");
    }
  };

  useEffect(() => {
    if (urlGameId) {
      pubNub.addListener({ message: gameOptionsListener });
      pubNub.subscribe({ channels: [urlGameId] });
      pubNub.publish({
        channel: urlGameId,
        message: { type: "PLAYER_ARRIVED" },
      });
    }
  }, []);

  useEffect(() => {
    if (gameId && playMode === "PLAY FRIEND") {
      console.log({ gameId, playMode });
      pubNub.addListener({ message: moveListener });
      pubNub.subscribe({ channels: [gameId] });
    }
  }, [gameId, playMode]);

  return null;
};

export default useOnlineMultiplayer;
