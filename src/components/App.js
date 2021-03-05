import { store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import Chessboard from "./chessboard";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal, useModal } from "./Modal";

const App = () => {
  return (
    <Provider store={store}>
      <div css={{ display: "flex", justifyContent: "center" }}>
        <Chessboard />
      </div>
      <Modal />
      {/*<div>*/}
      {/*  <input*/}
      {/*    value={length}*/}
      {/*    onChange={(e) => setLength(parseInt(e.target.value))}*/}
      {/*  />*/}
      {/*  <button onClick={changeLength}>HIT ME</button>*/}
      {/*</div>*/}
      <GameOptions />
    </Provider>
  );
};

export default App;
