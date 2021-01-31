import * as React from "react";
import Marker from "src/components/TileMarker";
import Piece from "./Piece";
import { TileID } from "src/data/constants";
import { useSelector } from "react-redux";
import { store, actions } from "src/store";

interface TileProps {
  id: TileID;
  xPos: XPos;
  yPos: YPos;
}

const Tile = ({ id, xPos, yPos }: TileProps) => {
  const { pieceId, highlight } = useSelector((state) => state.tileMap[id]);

  const onClick = () =>
    pieceId &&
    store.dispatch(actions.selectTile({ tileId: id, xPos: xPos, yPos: yPos }));

  return (
    <div
      css={{
        position: "relative",
        height: 70,
        width: 70,
        backgroundColor: highlight
          ? "red"
          : (xPos + yPos) % 2 === 0
          ? "#AE8867"
          : "#ECD9B9",
      }}
      onClick={onClick}
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
      {pieceId && <Piece pieceId={pieceId} />}
    </div>
  );
};

export default Tile;
