import { actions, ChessGameState, store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import { Modal } from "./Modal";
import Cockpit from "./cockpit";
import Chessboard from "./chessboard";
import AiPlayer from "./AiPlayer";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import useOnlineMultiplayer from "../hooks/useOnlineMultiplayer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { mq } from "src/styles/constants";
import useMobileView from "src/hooks/useMobileView";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

const Game = ({ urlGameId }) => {
  const [showGame, setShowGame] = useState<boolean>(!urlGameId);
  const { multiplayerGameStatus } = useOnlineMultiplayer(urlGameId);
  const { playMode } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const mobileView = useMobileView();

  useEffect(() => {
    if (!!urlGameId) {
      if (multiplayerGameStatus === "SUCCESS") {
        setShowGame(true);
      }

      if (multiplayerGameStatus !== "VALIDATING") {
        store.dispatch(
          actions.setModalState({
            modalState: {
              type: "MULTIPLAYER_STATUS",
              modalProps: { multiplayerGameStatus },
            },
          })
        );
      }
    }
  }, [multiplayerGameStatus, urlGameId]);

  return (
    <>
      <div
        css={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1.5rem",
          [mq[1]]: {
            marginTop: 0,
          },
        }}
      >
        {playMode === "PLAY COMPUTER" && <AiPlayer />}
        {showGame && <Chessboard />}
        {showGame && !mobileView && <Cockpit />}
      </div>
      <Modal />
    </>
  );
};

const App = ({ urlGameId }) => {
  const pubnub = new PubNub({
    publishKey: process.env.GATSBY_PUBLISH_KEY,
    subscribeKey: process.env.GATSBY_SUBSCRIBE_KEY,
    uuid: urlGameId ? "GAME_HOST_1" : "GAME_GUEST",
  });

  return (
    <Provider store={store}>
      <PubNubProvider client={pubnub}>
        <DndProvider backend={HTML5Backend}>
          <Game urlGameId={urlGameId} />
        </DndProvider>
      </PubNubProvider>
    </Provider>
  );
};

export default App;
