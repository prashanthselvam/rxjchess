import * as React from "react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "src/store";
import { interval, BehaviorSubject, of } from "rxjs";
import { mapTo, scan, switchMap, takeWhile, tap } from "rxjs/operators";
import { _getOpponent } from "../store/utils";

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
  const gameStatus = useSelector((state: ChessGameState) => state.gameStatus);
  const currentTurn = useSelector((state: ChessGameState) => state.currentTurn);

  const [timeRemaining, setTimeRemaining] = React.useState(
    maxTimeInSeconds * 1000
  );

  const interval$ = interval(1000).pipe(mapTo(-1000));
  const pause$ = React.useMemo(() => new BehaviorSubject(true), []);

  React.useEffect(() => {
    pause$.next(currentTurn !== player);
  }, [player, currentTurn, gameStatus]);

  React.useEffect(() => {
    if (gameStatus !== "IN PROGRESS") {
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
        () => store.dispatch(actions.endGame({ winner: _getOpponent(player) }))
      );
  }, [gameStatus]);

  const displayTime = Math.ceil(timeRemaining / 1000);
  const displayMin = Math.floor(displayTime / 60);
  const displaySec = Math.floor(displayTime % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });

  return (
    <div
      css={{
        fontSize: "4rem",
        color: "white",
        width: "100%",
        textAlign: "center",
      }}
    >
      {`${displayMin}:${displaySec}`}
    </div>
  );
};

export default Timer;
