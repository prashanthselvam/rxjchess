import { store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import { Modal } from "./Modal";
import Cockpit from "./cockpit";
import Chessboard from "./chessboard";
import AiPlayer from "./AiPlayer";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import useOnlineMultiplayer from "../hooks/useOnlineMultiplayer";

const Game = ({ urlGameId }) => {
  const _ = useOnlineMultiplayer(urlGameId);

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

const App = ({ urlGameId }) => {
  const pubnub = new PubNub({
    publishKey: "pub-c-d4a424e5-efde-498e-af55-ead4fe257bed",
    subscribeKey: "sub-c-9437e116-6e8b-11eb-889a-ee4206f2a398",
    uuid: "myUniqueUUID",
  });

  return (
    <Provider store={store}>
      <PubNubProvider client={pubnub}>
        <Game urlGameId={urlGameId} />
      </PubNubProvider>
    </Provider>
  );
};

export default App;
