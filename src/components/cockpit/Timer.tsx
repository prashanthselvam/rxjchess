import * as React from "react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "src/store";
import { interval, BehaviorSubject, of } from "rxjs";
import { mapTo, scan, switchMap, takeWhile, tap } from "rxjs/operators";
import { _getOpponent } from "../../store/utils";

interface TimerProps {
  maxTimeInSeconds: number;
  incrementInSeconds?: number;
  player: Player;
}

const Timer = ({
  maxTimeInSeconds,
  incrementInSeconds = 3,
  player,
}: TimerProps) => {
  const { status, currentTurn } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );

  const [timeRemaining, setTimeRemaining] = React.useState(
    maxTimeInSeconds * 1000
  );

  const interval$ = interval(1000).pipe(mapTo(-1000));
  const pause$ = React.useMemo(() => new BehaviorSubject(true), []);

  React.useEffect(() => {
    pause$.next(currentTurn !== player || status !== "IN PROGRESS");
  }, [player, currentTurn, status]);

  React.useEffect(() => {
    if (status !== "IN PROGRESS") {
      return;
    }

    pause$
      .pipe(
        switchMap((pause: boolean) =>
          pause ? of(incrementInSeconds * 1000) : interval$
        ),
        scan((acc, curr) => (curr ? curr + acc : acc), maxTimeInSeconds * 1000),
        tap((val) => setTimeRemaining(val)),
        takeWhile((val) => val > 0)
      )
      .subscribe(
        (val) => null,
        (err) => console.log(err),
        () =>
          store.dispatch(
            actions.endGame({
              winner: _getOpponent(player),
              winMode: "TIMEOUT",
            })
          )
      );
  }, [status]);

  const displayTime = Math.ceil(timeRemaining / 1000);
  const displayMin = Math.floor(displayTime / 60);
  const displaySec = Math.floor(displayTime % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });

  const warningTime = maxTimeInSeconds > 60 ? 60 : 30;
  const isMyTurn = currentTurn === player;

  return (
    <div
      css={{
        width: "100%",
        padding: 20,
        color: isMyTurn && displayTime <= warningTime ? "white" : "inherit",
        backgroundColor:
          isMyTurn && displayTime <= warningTime ? "rgb(169,0,0)" : "inherit",
      }}
    >
      {`${displayMin}:${displaySec}`}
    </div>
  );
};

const WrappedTimer = ({ player }) => {
  const {
    maxTime: maxTimeInMinutes,
    increment: incrementInSeconds,
    currentTurn,
  } = useSelector((state: ChessGameState) => state.currentGameState);

  const noTimeLimit = maxTimeInMinutes === "unlimited";
  const isMyTurn = player === currentTurn;

  return (
    <div
      css={{
        fontSize: "4rem",
        color: isMyTurn ? "rgb(34,119,26)" : "rgb(53,53,53)",
        textAlign: "center",
        width: "100%",
        backgroundColor: isMyTurn ? "rgb(241,241,241)" : "rgb(103,103,103)",
        padding: noTimeLimit ? 20 : "",
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
  );
};

export default WrappedTimer;
