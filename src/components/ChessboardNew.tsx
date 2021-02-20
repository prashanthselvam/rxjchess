/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/react";

const PlayingSurface = () => {
  return (
    <div
      css={{
        width: 580,
        height: 580,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
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
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          css={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "inline-block",
          }}
        >
          PLAYING SURFACE
        </span>
      </div>
    </div>
  );
};

const MenuDrawer = ({ isOpen }) => {
  const styles = css`
    width: 580px;
    height: 290px;
    background-color: rgba(215, 23, 23, 0.2);
    position: relative;
    text-align: center;
    transition: all 0.5s;
    transform: ${isOpen ? `none` : `translateY(-290px)`};
  `;

  return <div css={styles}>DRAWER</div>;
};

const ChessboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const handleOnClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div>
      <PlayingSurface />
      <MenuDrawer isOpen={isDrawerOpen} />
      <button onClick={handleOnClick}>NEW GAME</button>
    </div>
  );
};

export default ChessboardNew;
