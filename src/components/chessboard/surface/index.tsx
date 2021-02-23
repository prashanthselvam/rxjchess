import { BLACK_BOARD, WHITE_BOARD } from "src/types/constants";
import Tile from "./Tile";
import Board from "./Board";
import { useSelector } from "react-redux";
import React from "react";

const Surface = () => {
  const pov = useSelector((state) => state.pov);

  const drawRow = (yPos) => {
    return (
      <div
        key={yPos}
        style={{
          display: "flex",
          width: "100%",
          height: "12.5%",
        }}
      >
        {[...Array(8).keys()].map((xPos) => {
          const key =
            pov === "W" ? WHITE_BOARD[yPos][xPos] : BLACK_BOARD[yPos][xPos];
          return <Tile key={key} id={key} xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  return (
    <Board>
      <div
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "95%",
          height: "95%",
          border: "0.2px solid #777",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
          {[...Array(8).keys()]
            .sort((a, b) => b - a)
            .map((yPos) => drawRow(yPos))}
        </div>
      </div>
    </Board>
  );
};

export default Surface;
