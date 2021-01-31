import * as React from "react";
import Tile from "src/components/Tile";
import { WHITE_MAP, BLACK_MAP } from "src/data/main";
import { store, newGame, togglePov } from "src/store";
import { useSelector } from "react-redux";

const Chessboard = () => {
  const pov = useSelector((state) => state.pov);

  const togglePovClick = () => store.dispatch(togglePov());
  const startNewGame = () => store.dispatch(newGame({ gameType: "REGULAR" }));

  const drawRow = (yPos) => {
    return (
      <div key={yPos} style={{ display: "flex" }}>
        {[...Array(8).keys()].map((xPos) => {
          const key =
            pov === "W" ? WHITE_MAP[yPos][xPos] : BLACK_MAP[yPos][xPos];
          return <Tile key={key} id={key} xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  return (
    <div style={{ border: "1px solid grey", width: 560, height: 560 }}>
      {[...Array(8).keys()].sort((a, b) => b - a).map((yPos) => drawRow(yPos))}
      <button onClick={togglePovClick}>Toggle POV</button>
      <button onClick={startNewGame}>New Game</button>
    </div>
  );
};

export default Chessboard;
