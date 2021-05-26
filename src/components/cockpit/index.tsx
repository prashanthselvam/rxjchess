import * as React from "react";
import { useSelector } from "react-redux";
import WrappedTimer from "./Timer";
import MoveHistory from "./MoveHistory";
import { _getOpponent } from "src/store/utils";
import { ChessGameState } from "src/store";
import useEntryAnimate from "src/hooks/useEntryAnimate";

const Cockpit = () => {
  const showCockpit = useEntryAnimate(500);
  const player = useSelector(
    (state: ChessGameState) => state.currentGameState.player
  );

  return (
    <div
      css={{
        maxHeight: "80vh",
        position: "relative",
        width: showCockpit ? "300px" : "0px",
        opacity: showCockpit ? 1 : 0,
        backgroundColor: "grey",
        marginLeft: "1.5rem",
        transition: "all .4s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <WrappedTimer player={_getOpponent(player)} />
      <MoveHistory />
      <WrappedTimer player={player} />
    </div>
  );
};

export default Cockpit;
