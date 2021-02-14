import * as React from "react";
import Tile from "src/components/Tile";
import { WHITE_BOARD, BLACK_BOARD } from "src/types/constants";
import { store, actions } from "src/store";
import { useSelector } from "react-redux";

const Chessboard = () => {
  const pov = useSelector((state) => state.pov);
  const winner = useSelector((state) => state.winner);
  const gameStatus = useSelector((state) => state.gameStatus);

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

  const drawRow = (yPos) => {
    return (
      <div key={yPos} style={{ display: "flex" }}>
        {[...Array(8).keys()].map((xPos) => {
          const key =
            pov === "W" ? WHITE_BOARD[yPos][xPos] : BLACK_BOARD[yPos][xPos];
          return <Tile key={key} id={key} xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  return (
    <>
      {winner && <p>{winner === "W" ? "WHITE" : "BLACK"} WINS!!!!</p>}
      <div style={{ border: "1px solid grey", width: 560, height: 560 }}>
        {[...Array(8).keys()]
          .sort((a, b) => b - a)
          .map((yPos) => drawRow(yPos))}
        <button onClick={togglePovClick}>Toggle POV</button>
        <button onClick={startNewGame}>New Game</button>
        <button onClick={() => showAttackedTiles("W")}>White Attacked</button>
        <button onClick={() => showAttackedTiles("B")}>Black Attacked</button>
      </div>
    </>
  );
};

export default Chessboard;
