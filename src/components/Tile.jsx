import * as React from "react";
import { VerticalMarker, HorizontalMarker } from "src/components/TileMarker";

const Tile = ({ xPos, yPos }) => {
  return (
    <div
      css={{
        position: "relative",
        height: 70,
        width: 70,
        backgroundColor: (xPos + yPos) % 2 === 0 ? "#AE8867" : "#ECD9B9",
      }}
    >
      {yPos === 0 && <HorizontalMarker xPos={xPos} yPos={yPos} />}
      {xPos === 7 && <VerticalMarker xPos={xPos} yPos={yPos} />}
    </div>
  );
};

export default Tile;
