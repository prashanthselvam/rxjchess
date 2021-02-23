import Surface from "./surface";
import React from "react";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import Drawer from "./drawer";

const Chessboard = () => {
  const [boardWidth, setBoardWidth] = React.useState("80%");

  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameInitializingOrInProgress = [
    "IN PROGRESS",
    "INITIALIZING",
  ].includes(gameStatus);

  const styles = css`
    transition: all 0.5s;
    width: 90%;
    margin-top: ${isGameInitializingOrInProgress ? "1.5rem" : "-76%"};
    @media (min-width: 768px) {
      width: ${isGameInitializingOrInProgress ? "60%" : "80%"};
      margin-top: ${isGameInitializingOrInProgress ? "1.5rem" : "-66%"};
    }
    @media (min-width: 1024px) {
      width: ${isGameInitializingOrInProgress ? "38%" : "80%"};
      margin-top: ${isGameInitializingOrInProgress ? "1.5rem" : "-66%"};
    }
  `;

  return (
    <div css={styles}>
      <Surface />
      <Drawer />
    </div>
  );
};

export default Chessboard;
