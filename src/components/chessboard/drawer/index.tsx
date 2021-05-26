import React from "react";
import { actions, ChessGameState, store } from "src/store";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import DrawerMain from "./DrawerMain";
import DrawerHandle from "./DrawerHandle";

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const gameStatus = useSelector(
    (state: ChessGameState) => state.currentGameState.status
  );

  const isGameActive = [
    "IN PROGRESS",
    "INITIALIZING",
    "READY",
    "GAME OVER",
  ].includes(gameStatus);

  const handleOnClick = () => setIsOpen(!isOpen);

  React.useEffect(() => {
    if (isGameActive) {
      setIsOpen(false);
    }
  }, [gameStatus]);

  const containerStyles = css`
    width: 100%;
    height: 40rem;
    position: relative;
    text-align: center;
    transition: all 0.5s;
    transform: ${isOpen ? `none` : `translateY(-40rem)`};
  `;

  return (
    <div css={containerStyles}>
      <DrawerMain isOpen={isOpen} />
      <DrawerHandle
        onClick={handleOnClick}
        handleText={isOpen ? "CANCEL" : "NEW GAME"}
        hideKnob={false}
      />
    </div>
  );
};

export default Drawer;
