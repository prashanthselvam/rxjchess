import * as React from "react";
import { useSelector } from "react-redux";
import Timer from "./Timer";
import { ChessGameState } from "../store";

const MoveHistory = () => {
  const moves = useSelector(
    (state: ChessGameState) => state.movesState.moveHistory
  );

  return (
    <div
      css={{
        display: "grid",
        overflow: "scroll",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: 40,
        flexGrow: 3,
      }}
    >
      {moves.map(({ pieceId }) => (
        <div css={{ textAlign: "center", width: "100%", padding: 5 }}>
          {pieceId}
        </div>
      ))}
    </div>
  );
};

const Cockpit = () => {
  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameActive = ["INITIALIZING", "IN PROGRESS", "READY"].includes(
    gameStatus
  );

  return (
    <div
      css={{
        maxHeight: "80vh",
        position: "relative",
        width: isGameActive ? "300px" : "0px",
        opacity: isGameActive ? 1 : 0,
        backgroundColor: "grey",
        marginLeft: "1.5rem",
        transition: "all .4s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {isGameActive && (
        <>
          <div
            css={{
              width: "100%",
              textAlign: "center",
              padding: 20,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <Timer maxTimeInSeconds={300} player={"B"} />
          </div>
          <MoveHistory />
          <div
            css={{
              width: "100%",
              textAlign: "center",
              padding: 20,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <Timer maxTimeInSeconds={300} player={"W"} />
          </div>
        </>
      )}
    </div>
  );
};

export default Cockpit;
