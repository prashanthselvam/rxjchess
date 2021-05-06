import { actions, ChessGameState, Move, store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal } from "./Modal";
import Cockpit from "./Cockpit";
import Chessboard from "./chessboard";
import AiPlayer from "./AiPlayer";

const Game = () => {
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

const App = () => {
  return (
    <Provider store={store}>
      <Game />
    </Provider>
  );
};

export default App;
