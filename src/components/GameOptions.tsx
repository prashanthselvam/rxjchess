import * as React from "react";
import Tile from "src/components/Tile";
import { WHITE_BOARD, BLACK_BOARD } from "src/types/constants";
import { store, actions } from "src/store";
import { useSelector } from "react-redux";

const GameOptions = () => {
  const whiteAttackedTiles = useSelector(
    (state) => state.boardState.whiteAttackedTiles
  );
  const blackAttackedTiles = useSelector(
    (state) => state.boardState.blackAttackedTiles
  );

  const togglePovClick = () => store.dispatch(actions.togglePov());
  const startNewGame = () =>
    store.dispatch(actions.newGame({ gameType: "REGULAR" }));

  const showAttackedTiles = (player: Player) => {
    if (player === "W") {
      store.dispatch(actions.highlightTiles({ tiles: whiteAttackedTiles }));
    } else {
      store.dispatch(actions.highlightTiles({ tiles: blackAttackedTiles }));
    }
  };

  return (
    <div>
      {/*<button onClick={togglePovClick}>Toggle POV</button>*/}
      {/*<button onClick={startNewGame}>New Game</button>*/}
      {/*<button onClick={() => showAttackedTiles("W")}>White Attacked</button>*/}
      {/*<button onClick={() => showAttackedTiles("B")}>Black Attacked</button>*/}
    </div>
  );
};

export default GameOptions;
