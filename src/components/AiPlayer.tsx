import { actions, ChessGameState, Move, store } from "../store";
import { useEffect, useRef, useState } from "react";
import AiGame from "../webWorker/aiGame.worker";
import { useSelector } from "react-redux";
import * as React from "react";

const useAi = () => {
  const { status, playMode, currentTurn, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const moveHistory = useSelector(
    (state: ChessGameState) => state.movesState.moveHistory
  );
  const isGameActive = ["IN PROGRESS", "READY"].includes(status);
  const isAiPlaying = playMode === "PLAY COMPUTER";
  const isPlayersTurn = player === currentTurn;

  const [nextAiMove, setNextAiMove] = useState<any>(undefined);
  const aiGameRef = useRef(null);

  const getAiGame = () => {
    if (!aiGameRef.current && typeof window === "object") {
      aiGameRef.current = new AiGame();
    }
    return aiGameRef.current;
  };

  const aiGame = getAiGame();

  React.useEffect(() => {
    if (!isGameActive || !isAiPlaying || isPlayersTurn) {
      return;
    }

    const lastMove: Move = moveHistory.slice(-1)[0];

    if (
      (!lastMove && player === "W") ||
      (lastMove && lastMove.player !== player)
    ) {
      return;
    }

    // @ts-ignore
    aiGame
      .makeAiMove(lastMove)
      .then(({ from, to }) => {
        const delay = !!lastMove ? 0 : 1000;
        setTimeout(
          () => setNextAiMove({ sourceTileId: from, targetTileId: to }),
          delay
        );
      })
      .catch((error) => console.log(error));
  }, [moveHistory, status, isPlayersTurn]);

  return nextAiMove;
};

const AiPlayer = () => {
  const nextAiMove = useAi();

  useEffect(() => {
    if (nextAiMove) {
      store.dispatch(actions.moveToTile(nextAiMove));
    }
  }, [nextAiMove]);

  return null;
};

export default AiPlayer;
