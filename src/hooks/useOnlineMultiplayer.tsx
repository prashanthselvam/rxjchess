import { usePubNub } from "pubnub-react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "../store";
import { useEffect, useRef, useState } from "react";
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

const useOnlineMultiplayer = (urlGameId: string) => {
  const pubNub = usePubNub();
  const { gameId, playMode, player, status } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const opponent = _getOpponent(player);
  const responseReceivedRef = useRef<boolean>(false);
  const [
    multiplayerGameStatus,
    setMultiplayerGameStatus,
  ] = useState<MultiplayerGameStatus>("VALIDATING");

  const moveListener = ({ message, channel }) => {
    if (
      channel === gameId &&
      message.type === "MOVE" &&
      message.player === opponent
    ) {
      store.dispatch(actions.moveToTile(message.moveParams));
    }
  };

  const gameOptionsListener = ({ message }) => {
    if (message.type === "GAME_OPTIONS" && urlGameId) {
      const options = message.gameOptions;
      responseReceivedRef.current = true;
      store.dispatch(
        actions.newGame({
          ...options,
          player: _getOpponent(options.player),
        })
      );
    }
  };

  const resignOrLeftListener = ({ message, channel }) => {
    const { type, player: leavingPlayer } = message;
    if (
      channel === gameId &&
      ["RESIGN", "LEFT_GAME"].includes(type) &&
      player !== leavingPlayer
    ) {
      store.dispatch(
        actions.endGame({
          winner: player,
          winMode: type === "RESIGN" ? "RESIGNATION" : "PLAYER LEFT",
        })
      );
    }
  };

  const validateGameId = async (gameId) => {
    // check that total occupants == 1
    // check that there's only one message in history and its ready

    const { totalOccupancy } = await pubNub.hereNow({ channels: [gameId] });
    const { messages } = await pubNub.history({
      channel: urlGameId,
      count: 10,
    });

    return (
      totalOccupancy === 1 &&
      messages.length === 1 &&
      messages[0].entry.type === "CHANNEL_READY"
    );
  };

  useEffect(() => {
    if (urlGameId) {
      validateGameId(urlGameId).then((isValid) => {
        if (isValid) {
          pubNub.addListener({ message: gameOptionsListener });
          pubNub.subscribe({ channels: [urlGameId] });
          pubNub.publish({
            channel: urlGameId,
            message: { type: "PLAYER_ARRIVED" },
          });
          setTimeout(() => {
            setMultiplayerGameStatus(
              responseReceivedRef.current ? "SUCCESS" : "HOST_LEFT"
            );
          }, 500);
        } else {
          setMultiplayerGameStatus("INVALID_URL");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (gameId && playMode === "PLAY FRIEND") {
      pubNub.addListener({ message: moveListener });
      pubNub.addListener({ message: resignOrLeftListener });
      pubNub.subscribe({ channels: [gameId] });
    }
  }, [gameId, playMode]);

  useEffect(() => {
    if (status === "GAME OVER") {
      pubNub.unsubscribeAll();
    }
  }, [status]);

  if (typeof window !== `undefined`) {
    window.onbeforeunload = (e) => {
      if (gameId && playMode === "PLAY FRIEND") {
        pubNub.publish({
          channel: gameId,
          message: {
            type: "LEFT_GAME",
            player: player,
          },
        });
      }
    };
  }

  return { multiplayerGameStatus };
};

export default useOnlineMultiplayer;
