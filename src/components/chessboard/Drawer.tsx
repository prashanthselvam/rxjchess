import React from "react";
import { css } from "@emotion/react";
import { actions, store } from "src/store";
import { useSelector } from "react-redux";

const DrawerHandle = ({ onClick, handleText }) => {
  return (
    <div
      onClick={onClick}
      css={{
        width: "40%",
        height: "30px",
        position: "absolute",
        bottom: "0%",
        left: "50%",
        transform: "translate(-50%, 100%)",
        backgroundColor: "green",
      }}
    >
      {handleText}
    </div>
  );
};

const DrawerOption = ({ text }) => {
  const startNewGame = () =>
    store.dispatch(actions.newGame({ gameType: "REGULAR" }));

  return (
    <div
      onClick={startNewGame}
      css={{
        backgroundColor: "rgb(255,255,255, 0.4)",
        padding: "15px",
        height: "80%",
        border: "1px solid black",
      }}
    >
      {text}
    </div>
  );
};

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const gameStatus = useSelector((state) => state.gameStatus);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    if (gameStatus === "IN PROGRESS") {
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
      <div
        css={{
          height: "100%",
          backgroundColor: "rgb(27,84,1)",
          display: "flex",
          justifyContent: "center",
          zIndex: -1,
          // padding: 5,
        }}
      >
        <div
          css={{
            display: "flex",
            width: "90%",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <DrawerOption text="NEW GAME" />
          <DrawerOption text="NEW GAME" />
          <DrawerOption text="NEW GAME" />
        </div>
      </div>
      <DrawerHandle
        onClick={handleOnClick}
        handleText={isOpen ? "CANCEL" : "NEW GAME"}
      />
    </div>
  );
};

export default Drawer;
