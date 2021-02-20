import React from "react";
import { css } from "@emotion/react";

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

const Drawer = ({ length }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  const containerStyles = css`
    width: ${length}px;
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
          backgroundColor: "rgba(215, 23, 23, 1)",
          zIndex: -1,
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
          DRAWER
        </span>
      </div>
      <DrawerHandle
        onClick={handleOnClick}
        handleText={isOpen ? "CANCEL" : "NEW GAME"}
      />
    </div>
  );
};

export default Drawer;
