import * as React from "react";
import Marker from "src/components/TileMarker";
import Piece from "./Piece";
import { TileIDs } from "src/data/constants";

interface TileProps {
  id: TileIDs;
  xPos: XPos;
  yPos: YPos;
}

const Tile = ({ id, xPos, yPos }: TileProps) => {
  return (
    <div
      css={{
        position: "relative",
        height: 70,
        width: 70,
        backgroundColor: (xPos + yPos) % 2 === 0 ? "#AE8867" : "#ECD9B9",
      }}
    >
      {/*<span style={{ fontSize: 10 }}>{`yPos: ${yPos}`}</span>*/}
      {/*<br />*/}
      {/*<span style={{ fontSize: 10 }}>{`xPos: ${xPos}`}</span>*/}
      {/*<br />*/}
      {/*<span style={{ fontSize: 10 }}>{id}</span>*/}
      {yPos === 0 && (
        <Marker xPos={xPos} yPos={yPos} variant="horizontal">
          {id[0].toLowerCase()}
        </Marker>
      )}
      {xPos === 7 && (
        <Marker xPos={xPos} yPos={yPos} variant="vertical">
          {id[1]}
        </Marker>
      )}
      {id === "A1" && <Piece pieceId="WR1" />}
      {id === "B1" && <Piece pieceId="WN1" />}
      {id === "C1" && <Piece pieceId="WB1" />}
      {id === "D1" && <Piece pieceId="WQ" />}
      {id === "E1" && <Piece pieceId="WK" />}
      {id === "F1" && <Piece pieceId="WB2" />}
      {id === "G1" && <Piece pieceId="WN2" />}
      {id === "H1" && <Piece pieceId="WR2" />}
      {yPos === 1 && <Piece pieceId="WP1" />}
    </div>
  );
};

export default Tile;
