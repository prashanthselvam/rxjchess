import { store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal } from "./Modal";
import Cockpit from "./Cockpit";
import Chessboard from "./chessboard";
import { useSelector } from "react-redux";

const Game = () => {
  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameActive = ["IN PROGRESS", "READY"].includes(gameStatus);

  return (
    <>
      <div
        css={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}
      >
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
