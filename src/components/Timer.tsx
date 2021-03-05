import * as React from "react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "../store";
import { _getOpponent } from "../store/utils";
import { interval } from "rxjs";

interface TimerProps {
  maxTimeInSeconds: number;
  incrementInSeconds?: number;
  player: Player;
}

const Timer = ({
  maxTimeInSeconds,
  incrementInSeconds = 0,
  player,
}: TimerProps) => {
  const [timeRemaining, setTimeRemaining] = React.useState(
    maxTimeInSeconds * 1000
  );
  const [shouldApplyIncrement, setShouldApplyIncrement] = React.useState(false);
  const gameStatus = useSelector((state: ChessGameState) => state.gameStatus);
  const currentTurn = useSelector((state: ChessGameState) => state.currentTurn);

  const calculateTimeRemaining = () => timeRemaining - 200;
  const applyIncrement = () => timeRemaining + incrementInSeconds * 1000;

  React.useEffect(() => {
    if (gameStatus !== "IN PROGRESS") {
      return;
    }

    const timer = setTimeout(() => {
      if (player === currentTurn) {
        setTimeRemaining(calculateTimeRemaining());
        setShouldApplyIncrement(true);
      } else {
        if (shouldApplyIncrement) {
          setShouldApplyIncrement(false);
          setTimeRemaining(applyIncrement());
        }
      }
    }, 200);
  }, [gameStatus, currentTurn, timeRemaining]);

  React.useEffect(() => {
    if (timeRemaining <= 0) {
      store.dispatch(actions.endGame({ winner: player === "W" ? "B" : "W" }));
    }
  }, [timeRemaining]);

  const displayTime = timeRemaining > 0 ? Math.ceil(timeRemaining / 1000) : 0;

  return <div css={{ fontSize: "3rem", color: "white" }}>{displayTime}</div>;
};

export default Timer;
