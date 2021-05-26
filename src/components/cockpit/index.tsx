import * as React from "react";
import { useSelector } from "react-redux";
import WrappedTimer from "./Timer";
import MoveHistory from "./MoveHistory";
import { _getOpponent } from "src/store/utils";
import { ChessGameState } from "src/store";

const Cockpit = () => {
  const { player, status: gameStatus } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );

  const isGameActive = [
    "INITIALIZING",
    "IN PROGRESS",
    "READY",
    "GAME OVER",
  ].includes(gameStatus);

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
          <WrappedTimer player={_getOpponent(player)} />
          <MoveHistory />
          <WrappedTimer player={player} />
        </>
      )}
    </div>
  );
};

export default Cockpit;
