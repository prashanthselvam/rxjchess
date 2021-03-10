import { actions, Move, store } from "src/store";
import { Provider } from "react-redux";
import * as React from "react";
import GameOptions from "./GameOptions";
import TestPubnub from "./TestPubnub";
import { Modal } from "./Modal";
import Cockpit from "./Cockpit";
import Chessboard from "./chessboard";
import { useSelector } from "react-redux";

const jsChess = require("js-chess-engine");

const Game = () => {
  const gameStatus = useSelector((state) => state.gameStatus);
  const moveHistory = useSelector((state) => state.movesState.moveHistory);
  const isGameActive = ["IN PROGRESS", "READY"].includes(gameStatus);
  const game = React.useMemo(() => new jsChess.Game(), []);

  React.useEffect(() => {
    if (gameStatus !== "IN PROGRESS") {
      return;
    }

    const lastMove: Move = moveHistory.slice(-1)[0];

    if (lastMove.player === "W") {
      setTimeout(() => {
        game.move(lastMove.sourceTileId, lastMove.targetTileId);
        game.aiMove(2);
        const aiMove = game.getHistory(true)[0];
        store.dispatch(actions.selectTile({ tileId: aiMove.from }));
        store.dispatch(
          actions.moveToTile({
            sourceTileId: aiMove.from,
            targetTileId: aiMove.to,
          })
        );
      }, 1000);
    }
  }, [moveHistory]);

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
