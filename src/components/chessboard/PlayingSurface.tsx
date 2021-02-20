import { BLACK_BOARD, WHITE_BOARD } from "src/types/constants";
import Tile from "../Tile";
import { useSelector } from "react-redux";
import React from "react";

const PlayingSurface = ({ length }) => {
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
    <div
      css={{
        width: length,
        height: length,
        backgroundColor: "rgba(0, 0, 0, 1)",
        position: "relative",
        textAlign: "center",
        zIndex: 1,
      }}
    >
      <div
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "95%",
          height: "95%",
          border: "1px solid black",
          backgroundColor: "rgb(1,19,81)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "red",
          }}
        >
          {[...Array(8).keys()]
            .sort((a, b) => b - a)
            .map((yPos) => drawRow(yPos))}
        </div>
      </div>
    </div>
  );
};

export default PlayingSurface;
