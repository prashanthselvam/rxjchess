import * as React from "react";
import Tile from "src/components/Tile";
import { incremented, store } from "src/store";

const Chessboard = () => {
  const drawRow = (yPos) => {
    return (
      <div style={{ display: "flex" }}>
        {[...Array(8).keys()].map((xPos) => {
          return <Tile xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  const onClick = () => store.dispatch(incremented());

  return (
    <div style={{ border: "1px solid grey", width: 560, height: 560 }}>
      {[...Array(8).keys()].sort((a, b) => b - a).map((yPos) => drawRow(yPos))}
      <button onClick={onClick}>Click me</button>
    </div>
  );
};

export default Chessboard;
