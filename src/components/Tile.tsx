import * as React from "react";
import Marker from "src/components/TileMarker";
import Piece from "./Piece";
import { TileId } from "src/types/constants";
import { useSelector } from "react-redux";
import { store, actions } from "src/store";
import { _getPieceType, _getPlayer } from "../store/utils";
// import { usePubNub } from "pubnub-react";
import { useEffect, useState } from "react";

interface TileProps {
  id: TileId;
  xPos: XPos;
  yPos: YPos;
}

const Highlight = ({ canTake }) => {
  if (canTake) {
    return (
      <div
        css={{
          position: "absolute",
          width: 66,
          height: 66,
          border: "2px #9e0016 solid",
          top: "50%",
          left: "50%",
          margin: "-35px 0 0 -35px",
        }}
      />
    );
  } else {
    return (
      <div
        css={{
          position: "absolute",
          height: 14,
          width: 14,
          borderRadius: 25,
          top: "50%",
          left: "50%",
          margin: "-7px 0 0 -7px",
          backgroundColor: "rgb(131,138,25,0.3)",
        }}
      />
    );
  }
};

// const usePubnubProcess = () => {
//   const pubnub = usePubNub();
//   const [channels] = useState(["awesome-channel"]);
//   const [messageToSend, setMessageToSend] = useState<undefined | string>(
//     undefined
//   );
//
//   const handleReceivedMessage = (event) => {
//     console.log(event);
//   };
//
//   useEffect(() => {
//     if (messageToSend) {
//       pubnub.publish({ channel: channels[0], message: messageToSend });
//     }
//   }, [messageToSend]);
//
//   useEffect(() => {
//     pubnub.addListener({ message: handleReceivedMessage });
//     pubnub.subscribe({ channels });
//   }, [pubnub, channels]);
//
//   return { setMessageToSend };
// };

const Tile = ({ id, xPos, yPos }: TileProps) => {
  const gameStatus = useSelector((state) => state.gameStatus);
  const currentTurn = useSelector((state) => state.currentTurn);
  const selectedTile = useSelector((state) => state.boardState.selectedTile);
  const { pieceId, highlight } = useSelector(
    (state) => state.boardState.tileMap[id]
  );
  // const { setMessageToSend } = usePubnubProcess();

  const isActiveCheck = useSelector((state) => state.checkState.isActiveCheck);

  const isGameInProgress = gameStatus === "IN PROGRESS";
  const isSelected = selectedTile === id;
  const isSelectable =
    isGameInProgress && pieceId && _getPlayer(pieceId) === currentTurn;
  const isKingTile = pieceId && _getPieceType(pieceId) === "K";

  const checkHighlight = isActiveCheck && isSelectable && isKingTile;

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
        height: "100%",
        width: "12.5%",
        backgroundColor: isSelected
          ? "rgba(103,174,104,0.8)"
          : (xPos + yPos) % 2 === 0
          ? "rgba(50,32,15,0.55)"
          : "rgba(255,255,255,0.55)",
      }}
      onClick={onClick}
    >
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
      {checkHighlight && <div>CHECK!</div>}
      {highlight && <Highlight canTake={!!pieceId} />}
    </div>
  );
};

export default Tile;
