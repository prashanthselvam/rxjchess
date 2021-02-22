import { actions, store } from "src/store";
import React from "react";

const DrawerMenuOption = ({ text }) => {
  const startNewGame = () => {
    store.dispatch(actions.initializeGame());
    setTimeout(
      () => store.dispatch(actions.newGame({ gameType: "REGULAR" })),
      700
    );
  };

  return (
    <button
      onClick={startNewGame}
      css={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 15,
        padding: "1.5rem",
        height: "80%",
        width: "25%",
        border: "none",
        textDecoration: "none",
        "&:hover": {
          transform: "translateY(-.3rem)",
          boxShadow: "0 1rem 2rem rgba(0,0,0,.2)",
          cursor: "pointer",
        },
      }}
    >
      {text}
    </button>
  );
};

export default DrawerMenuOption;
