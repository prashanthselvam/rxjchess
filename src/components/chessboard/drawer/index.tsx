import React from "react";
import { actions, store } from "src/store";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import DrawerMain from "./DrawerMain";
import DrawerHandle from "./DrawerHandle";

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameInitializingOrInProgress = [
    "IN PROGRESS",
    "INITIALIZING",
  ].includes(gameStatus);

  const handleOnClick = () => {
    if (isGameInitializingOrInProgress) {
      store.dispatch(actions.reset());
    } else {
      setIsOpen(!isOpen);
    }
  };

  React.useEffect(() => {
    if (isGameInitializingOrInProgress) {
      setIsOpen(false);
    }
  }, [gameStatus]);

  const containerStyles = css`
    width: "100%";
    height: 300px;
    position: relative;
    text-align: center;
    transition: all 0.5s;
    transform: ${isOpen ? `none` : `translateY(-300px)`};
  `;

  return (
    <div css={containerStyles}>
      <DrawerMain isOpen={isOpen} />
      <DrawerHandle
        onClick={handleOnClick}
        handleText={
          isGameInitializingOrInProgress
            ? "QUIT GAME"
            : isOpen
            ? "CANCEL"
            : "NEW GAME"
        }
        hideKnob={isGameInitializingOrInProgress}
      />
    </div>
  );
};

export default Drawer;
