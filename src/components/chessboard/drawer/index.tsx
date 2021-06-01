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
  const closeDrawer = () => setIsOpen(false);

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
    transition: all 0.4s;
    transform: ${isOpen ? `none` : `translateY(-40rem)`};
  `;

  const aboutStyles = css`
    letter-spacing: 0.2rem;
    transition: all 0.2s;
    position: fixed;
    font-size: 2rem;
    color: white;
    text-shadow: 0.2rem 0.2rem 1rem rgba(0, 0, 0, 0.4);
    bottom: 10px;
    left: 0;
    width: 100%;
    text-align: center;
    transform: ${isOpen ? "scale(0.001)" : "none"};
  `;

  return (
    <>
      <div css={containerStyles}>
        <DrawerMain isOpen={isOpen} closeDrawer={closeDrawer} />
        <DrawerHandle
          onClick={handleOnClick}
          handleText={isOpen ? "CANCEL" : "NEW GAME"}
        />
      </div>
      <p
        css={aboutStyles}
        className={"btn"}
        onClick={() =>
          store.dispatch(
            actions.setModalState({ modalState: { type: "ABOUT" } })
          )
        }
      >
        ABOUT
      </p>
    </>
  );
};

export default Drawer;
