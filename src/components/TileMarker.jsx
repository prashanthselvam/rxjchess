import * as React from "react";
import styled from "@emotion/styled";

const markerVariants = {
  horizontal: {
    bottom: 1,
    left: 2,
  },
  vertical: {
    top: 1,
    right: 2,
  },
};

const Marker = styled.span(
  {
    position: "absolute",
    fontFamily: "Roboto, sans-serif",
    fontWeight: 700,
    fontSize: 10,
  },
  ({ xPos, yPos }) => {
    return { color: (xPos + yPos) % 2 !== 0 ? "#AE8867" : "#ECD9B9" };
  },
  ({ variant }) => markerVariants[variant]
);

export const HorizontalMarker = ({ xPos, yPos }) => {
  const alphabet = "abcdefgh";

  return (
    <Marker xPos={xPos} yPos={yPos} variant="horizontal">
      {alphabet[xPos]}
    </Marker>
  );
};

export const VerticalMarker = ({ xPos, yPos }) => {
  return (
    <Marker xPos={xPos} yPos={yPos} variant="vertical">
      {yPos + 1}
    </Marker>
  );
};
