import React from "react";
import { actions, store } from "src/store";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import DrawerMain from "./DrawerMain";
import DrawerHandle from "./DrawerHandle";

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameActive = ["IN PROGRESS", "INITIALIZING", "READY"].includes(
    gameStatus
  );

  const handleOnClick = () => {
    if (isGameActive) {
      store.dispatch(actions.reset());
    } else {
      setIsOpen(!isOpen);
    }
  };

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
        handleText={isGameActive ? "QUIT GAME" : isOpen ? "CANCEL" : "NEW GAME"}
        hideKnob={isGameActive}
      />
    </div>
  );
};

export default Drawer;
