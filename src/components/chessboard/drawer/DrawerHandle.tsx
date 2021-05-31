import { css } from "@emotion/react";
import Image from "src/components/image";
import React from "react";

const DrawerHandle = ({ onClick, handleText }) => {
  const style = css`
    display: inline-block;
    transition: all 0.2s;
    position: relative;
    font-size: 7rem;
    letter-spacing: 0.4rem;
    margin-top: 9rem;
    color: white;
    text-shadow: 0.2rem 0.2rem 1rem rgba(0, 0, 0, 0.4);
  `;

  return (
    <div>
      <span onClick={onClick} className={"btn"} css={style}>
        {handleText}
      </span>
      <Image
        alt={`Drawer Knob`}
        filename={"drawer_knob.png"}
        style={{
          width: "20%",
          position: "absolute",
          bottom: "0%",
          left: "50%",
          transform: "translate(-50%, 42%) scale(0.5) rotate(180deg)",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default DrawerHandle;
