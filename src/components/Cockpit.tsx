import * as React from "react";
import { useSelector } from "react-redux";
import Timer from "./Timer";
import MoveHistory from "./MoveHistory";
import { _getOpponent } from "../store/utils";
import { ChessGameState } from "../store";

const Cockpit = () => {
  const {
    player,
    status: gameStatus,
    maxTime: maxTimeInMinutes,
    increment: incrementInSeconds,
  } = useSelector((state: ChessGameState) => state.currentGameState);

  const isGameActive = ["INITIALIZING", "IN PROGRESS", "READY"].includes(
    gameStatus
  );

  const noTimeLimit = maxTimeInMinutes === "unlimited";

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
              fontSize: "4rem",
              color: "white",
              textAlign: "center",
              width: "100%",
              padding: 20,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            {noTimeLimit ? (
              "∞"
            ) : (
              <Timer
                maxTimeInSeconds={maxTimeInMinutes * 60}
                incrementInSeconds={incrementInSeconds}
                player={_getOpponent(player)}
              />
            )}
          </div>
          <MoveHistory />
          <div
            css={{
              fontSize: "4rem",
              color: "white",
              textAlign: "center",
              width: "100%",
              padding: 20,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            {noTimeLimit ? (
              "∞"
            ) : (
              <Timer
                maxTimeInSeconds={maxTimeInMinutes * 60}
                incrementInSeconds={incrementInSeconds}
                player={player}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cockpit;
