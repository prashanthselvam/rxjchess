import { actions, ChessGameState, Move, store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal } from "./Modal";
import Cockpit from "./Cockpit";
import Chessboard from "./chessboard";
import AiPlayer from "./AiPlayer";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";
import { useEffect } from "react";
import { _getOpponent } from "../store/utils";
import useOpponentNextMove from "../hooks/useOpponentNextMove";

const Game = ({ gameParam }) => {
  const pubNub = usePubNub();
  const _ = useOpponentNextMove();

  const handleMessage = (event) => {
    // If we receive gameOptions, then we create a new game with those options
    const message = event.message;
    // console.log("GAME COMPONENT", message);

    if (message.type === "SEND_GAME_OPTIONS") {
      const options = message.gameOptions;
      pubNub.publish({
        channel: gameParam,
        message: { type: "GAME_OPTIONS_RECEIVED" },
      });
      store.dispatch(
        actions.newGame({ ...options, player: _getOpponent(options.player) })
      );
    } else {
      console.log(`Did not recognize ${message.type} in app component`);
    }
  };

  useEffect(() => {
    if (gameParam) {
      // Subscribe to the game's channel
      // Let the channel know we've arrived and are ready to receive the gameOptions
      pubNub.addListener({ message: handleMessage });
      pubNub.subscribe({ channels: [gameParam] });

      pubNub.publish({
        channel: gameParam,
        message: { type: "PLAYER_ARRIVED" },
      });
    }
  }, []);

  return (
    <>
      <div
        css={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}
      >
        <AiPlayer />
        <Chessboard />
        <Cockpit />
      </div>
      <Modal />
    </>
  );
};

const App = ({ gameParam }) => {
  const pubnub = new PubNub({
    publishKey: "pub-c-d4a424e5-efde-498e-af55-ead4fe257bed",
    subscribeKey: "sub-c-9437e116-6e8b-11eb-889a-ee4206f2a398",
    uuid: "myUniqueUUID",
  });

  return (
    <Provider store={store}>
      <PubNubProvider client={pubnub}>
        <Game gameParam={gameParam} />
      </PubNubProvider>
    </Provider>
  );
};

export default App;
