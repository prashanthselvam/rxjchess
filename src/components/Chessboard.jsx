import * as React from "react";
import Tile from "src/components/Tile";

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

  return (
    <div style={{ border: "1px solid black", width: 560, height: 560 }}>
      {[...Array(8).keys()].sort((a, b) => b - a).map((yPos) => drawRow(yPos))}
    </div>
  );
};

export default Chessboard;
