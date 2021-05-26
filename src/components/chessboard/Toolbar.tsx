import { actions, ChessGameState, store } from "src/store";
import { css } from "@emotion/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useEntryAnimate from "src/hooks/useEntryAnimate";

const Toolbar = () => {
  const showToolbar = useEntryAnimate(500);
  const { currentTurn, status, playMode, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );

  const toolbarStyles = css`
    color: rgb(235, 235, 235);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    margin-top: 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    text-align: center;
    transition: all 0.5s;
    width: "80vh";
    height: ${showToolbar ? "60px" : "0px"};
    opacity: ${showToolbar ? "1" : "0"};
    @media (max-width: 1024px) {
      width: "70vw";
    }
    @media (max-width: 768px) {
      width: 95vw;
    }
  `;

  const buttonStyles = css`
    font-size: 1.4rem;
    padding: 6px 12px;
  `;

  const currentTurnText = currentTurn === "W" ? "WHITE" : "BLACK";

  const btnText = () => {
    if (status === "IN PROGRESS") {
      return playMode === "PLAY FRIEND" ? "RESIGN" : "QUIT GAME";
    } else if (status === "GAME OVER") {
      return "EXIT GAME";
    } else {
      return "QUIT GAME";
    }
  };

  const onClick = () => {
    if (status === "GAME OVER") {
      store.dispatch(actions.reset());
    } else {
      store.dispatch(
        actions.setModalState({
          modalState: {
            type: "QUIT_GAME",
            modalProps: {
              quitter: player,
            },
          },
        })
      );
    }
  };

  return (
    <div css={toolbarStyles}>
      <p>{`CURRENT TURN: ${currentTurnText}`}</p>
      <button css={buttonStyles} onClick={onClick}>
        {btnText()}
      </button>
    </div>
  );
};

export default Toolbar;
