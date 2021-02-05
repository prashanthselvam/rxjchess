import * as React from "react";
import Marker from "src/components/TileMarker";
import Piece from "./Piece";
import { TileId } from "src/types/constants";
import { useSelector } from "react-redux";
import { store, actions } from "src/store";

interface TileProps {
  id: TileId;
  xPos: XPos;
  yPos: YPos;
}

const Highlight = () => (
  <div
    css={{
      position: "absolute",
      height: 14,
      width: 14,
      borderRadius: 25,
      top: "50%",
      left: "50%",
      margin: "-7px 0 0 -7px",
      backgroundColor: "rgba(78, 45, 174, 0.60)",
    }}
  />
);

const Tile = ({ id, xPos, yPos }: TileProps) => {
  const currentTurn = useSelector((state) => state.currentTurn);
  const selectedTile = useSelector((state) => state.selectedTile);
  const { pieceId, highlight } = useSelector((state) => state.tileMap[id]);

  const isSelected = selectedTile === id;
  const isSelectable = pieceId && pieceId[0] === currentTurn;

  const onClick = () => {
    if (isSelectable && !isSelected) {
      store.dispatch(actions.selectTile({ tileId: id }));
    } else if (highlight) {
      store.dispatch(actions.moveToTile({ targetTileId: id }));
    } else {
      store.dispatch(actions.deselect());
    }
  };

  return (
    <div
      css={{
        position: "relative",
        height: 70,
        width: 70,
        backgroundColor: isSelected
          ? "#6787AE"
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
      {highlight && <Highlight />}
      {pieceId && <Piece pieceId={pieceId} />}
    </div>
  );
};

export default Tile;
