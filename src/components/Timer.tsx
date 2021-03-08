import * as React from "react";
import { useSelector } from "react-redux";
import { actions, ChessGameState, store } from "../store";
import { _getOpponent } from "../store/utils";
import isEqual from "lodash/isEqual";
import {
  timer,
  interval,
  BehaviorSubject,
  Subject,
  iif,
  empty,
  of,
  NEVER,
} from "rxjs";
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  scan,
  skip,
  switchMap,
  switchMapTo,
  takeUntil,
  takeWhile,
  tap,
} from "rxjs/operators";

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
  }, [player, currentTurn]);

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
        () =>
          store.dispatch(
            actions.endGame({ winner: player === "W" ? "B" : "W" })
          )
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
        fontSize: "3rem",
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
