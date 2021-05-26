import { useEffect, useState } from "react";
import { ChessGameState } from "../store";
import { useSelector } from "react-redux";

/**
 * useEntryAnimate - Nice little hook for animating things when a game begins. Different things need
 * to appear at different times, so this handles that.
 *
 */
const useEntryAnimate = (delay: number) => {
  const [showThing, setShowThing] = useState<boolean>(false);
  const gameStatus = useSelector(
    (state: ChessGameState) => state.currentGameState.status
  );

  const isGameActive = [
    "IN PROGRESS",
    "INITIALIZING",
    "READY",
    "GAME OVER",
  ].includes(gameStatus);

  useEffect(() => {
    const timeout = isGameActive ? delay : 0;
    setTimeout(() => setShowThing(isGameActive), timeout);
  }, [isGameActive]);

  return showThing;
};

export default useEntryAnimate;
