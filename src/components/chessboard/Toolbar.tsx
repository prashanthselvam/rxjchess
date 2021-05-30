import { actions, ChessGameState, store } from "src/store";
import { css } from "@emotion/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useEntryAnimate from "src/hooks/useEntryAnimate";
import { graphql, useStaticQuery } from "gatsby";
import useSound from "use-sound";

const Toolbar = () => {
  const moveSound = useStaticQuery(
    graphql`
      query {
        file(base: { eq: "move.mp3" }) {
          publicURL
        }
      }
    `
  );

  const moveSoundURL = moveSound.file.publicURL;

  const showToolbar = useEntryAnimate(500);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [play] = useSound(moveSoundURL, { volume: 0.2, soundEnabled });

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
    height: ${showToolbar ? "60px" : "0px"};
    opacity: ${showToolbar ? "1" : "0"};
  `;

  const buttonStyles = css`
    font-size: 1.4rem;
    padding: 6px 12px;
    margin: 0 4px;
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

  useEffect(() => {
    play();
  }, [currentTurn]);

  return (
    <div css={toolbarStyles}>
      <p>{`CURRENT TURN: ${currentTurnText}`}</p>
      <div css={{ display: "inline-block" }}>
        <button css={buttonStyles} onClick={onClick}>
          {btnText()}
        </button>
        <button
          css={buttonStyles}
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {"SOUND"}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
