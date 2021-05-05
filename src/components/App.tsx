import { actions, ChessGameState, Move, store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal } from "./Modal";
import Cockpit from "./Cockpit";
import Chessboard from "./chessboard";
import { useSelector } from "react-redux";

import AiGame from "src/webWorker/aiGame.worker.js";
import { useRef } from "react";

const Game = () => {
  const { status, playMode, currentTurn, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const moveHistory = useSelector(
    (state: ChessGameState) => state.movesState.moveHistory
  );

  const isGameActive = ["IN PROGRESS", "READY"].includes(status);
  const isAiPlaying = playMode === "PLAY COMPUTER";
  const isPlayersTurn = player === currentTurn;

  const aiGameRef = useRef(null);

  const getAiGame = () => {
    if (!aiGameRef.current && typeof window === "object") {
      aiGameRef.current = new AiGame();
    }
    return aiGameRef.current;
  };

  const aiGame = getAiGame();

  React.useEffect(() => {
    if (!isGameActive || !isAiPlaying || isPlayersTurn) {
      return;
    }

    const lastMove: Move = moveHistory.slice(-1)[0];

    // @ts-ignore
    aiGame
      .makeAiMove(lastMove)
      .then(({ from, to }) => {
        store.dispatch(
          actions.moveToTile({
            sourceTileId: from,
            targetTileId: to,
          })
        );
      })
      .catch((error) => console.log(error));
  }, [moveHistory, status]);

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
