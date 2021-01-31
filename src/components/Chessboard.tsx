import * as React from "react";
import Tile from "src/components/Tile";
import { WHITE_MAP, BLACK_MAP } from "src/data/main";
import { newGame, store } from "src/store";

const Chessboard = () => {
  const [pov, setPov] = React.useState("white");

  const togglePov = () => {
    if (pov === "white") {
      setPov("black");
    } else {
      setPov("white");
    }
  };

  const startNewGame = () => store.dispatch(newGame({ gameType: "REGULAR" }));

  const drawRow = (yPos) => {
    return (
      <div key={yPos} style={{ display: "flex" }}>
        {[...Array(8).keys()].map((xPos) => {
          const key =
            pov === "white" ? WHITE_MAP[yPos][xPos] : BLACK_MAP[yPos][xPos];
          return <Tile key={key} id={key} xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  // const onClick = () => store.dispatch(incremented());

  return (
    <div style={{ border: "1px solid grey", width: 560, height: 560 }}>
      {[...Array(8).keys()].sort((a, b) => b - a).map((yPos) => drawRow(yPos))}
      <button onClick={togglePov}>Toggle POV</button>
      <button onClick={startNewGame}>New Game</button>
    </div>
  );
};

export default Chessboard;
