import { css } from "@emotion/react";
import Image from "src/components/image";
import React from "react";

const DrawerHandle = ({ onClick, handleText, hideKnob }) => {
  const style = css`
    display: inline-block;
    transition: all 0.2s;
    position: relative;
    font-size: 5rem;
    margin-top: ${hideKnob ? "4rem" : "9rem"};
    color: white;
    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
  `;

  return (
    <div>
      <span onClick={onClick} className={"btn"} css={style}>
        {handleText}
      </span>
      {!hideKnob && (
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
      )}
    </div>
  );
};

export default DrawerHandle;
