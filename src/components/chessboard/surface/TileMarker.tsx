import * as React from "react";
import styled from "@emotion/styled";

type MarkerVariants = "horizontal" | "vertical";

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

interface MarkerProps {
  xPos: XPos;
  yPos: YPos;
  variant: MarkerVariants;
}

const Marker = styled.span<MarkerProps>(
  {
    position: "absolute",
    fontFamily: "Roboto, sans-serif",
    fontWeight: 700,
    fontSize: 10,
  },
  (props) => ({
    color: (props.xPos + props.yPos) % 2 !== 0 ? "#AE8867" : "#ECD9B9",
    ...markerVariants[props.variant],
  })
);

export default Marker;
