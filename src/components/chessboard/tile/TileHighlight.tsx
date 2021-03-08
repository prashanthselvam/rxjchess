import * as React from "react";
import { css } from "@emotion/react";

interface TileHighlightProps {
  variant: "SELECTED" | "MOVE_HISTORY" | "CAN_TAKE" | "CAN_MOVE" | "CHECK";
}

const TileHighlight = ({ variant }: TileHighlightProps) => {
  const defaultStyles = css`
    position: absolute;
    width: 100%;
    height: 100%;
  `;

  switch (variant) {
    case "SELECTED":
      return (
        <div
          css={css`
            ${defaultStyles};
            background-color: rgba(103, 174, 104, 0.8);
          `}
        />
      );
    case "CAN_TAKE":
      return (
        <div
          css={css`
            ${defaultStyles};
            border: 2px #9e0016 solid;
          `}
        />
      );
    case "CAN_MOVE":
      return (
        <div
          css={{
            position: "absolute",
            height: "15%",
            width: "15%",
            borderRadius: 25,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(103,174,104,0.4)",
          }}
        />
      );
    case "CHECK":
      return (
        <div
          css={css`
            ${defaultStyles};
            border-radius: 50px;
            background: radial-gradient(
              circle,
              rgba(255, 15, 0, 1) 0%,
              rgba(255, 255, 255, 0) 70%
            );
          `}
        />
      );
    case "MOVE_HISTORY":
      return (
        <div
          css={css`
            ${defaultStyles};
            background-color: rgb(255, 211, 0, 0.4);
          `}
        />
      );
  }
};

export default TileHighlight;
