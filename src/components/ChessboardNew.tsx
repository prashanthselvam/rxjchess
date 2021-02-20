/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/react";
import Chessboard from "./Chessboard";

const PlayingSurface = () => {
  return (
    <div
      css={{
        width: 700,
        height: 700,
        backgroundColor: "rgba(0, 0, 0, 1)",
        position: "relative",
        textAlign: "center",
      }}
    >
      <div
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "95%",
          height: "95%",
          border: "1px solid black",
          backgroundColor: "rgb(1,19,81)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Chessboard />
      </div>
    </div>
  );
};

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

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  const styles = css`
    width: 700px;
    height: 300px;
    background-color: rgba(215, 23, 23, 0.2);
    position: relative;
    text-align: center;
    transition: all 0.5s;
    transform: ${isOpen ? `none` : `translateY(-300px)`};
    // z-index: -1;
  `;

  return (
    <div css={styles}>
      <span
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "inline-block",
        }}
      >
        DRAWER
      </span>
      <DrawerHandle
        onClick={handleOnClick}
        handleText={isOpen ? "CANCEL" : "NEW GAME"}
      />
    </div>
  );
};

const ChessboardNew = () => {
  return (
    <div>
      <PlayingSurface />
      <Drawer />
    </div>
  );
};

export default ChessboardNew;
