import PlayingSurface from "./PlayingSurface";
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
    width: ${isGameInitializingOrInProgress ? "38%" : "80%"};
    margin-top: ${isGameInitializingOrInProgress ? "1.5rem" : "-66%"};
  `;

  return (
    <div css={styles}>
      <PlayingSurface />
      <Drawer />
    </div>
  );
};

export default Chessboard;
