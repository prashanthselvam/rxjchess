import * as React from "react";
import Marker from "src/components/TileMarker";
import Piece from "./Piece";
import { TileId } from "src/types/constants";
import { useSelector } from "react-redux";
import { store, actions, ChessGameState } from "src/store";
import { _getPieceType, _getPlayer } from "../store/utils";
// import { usePubNub } from "pubnub-react";
import { useEffect, useState } from "react";

interface TileProps {
  id: TileId;
  xPos: XPos;
  yPos: YPos;
}

interface TileHighlightProps {
  variant: "SELECTED" | "MOVE_HISTORY" | "CAN_TAKE" | "CAN_MOVE" | "CHECK";
}

const TileHighlight = ({ variant }: TileHighlightProps) => {
  switch (variant) {
    case "SELECTED":
      return (
        <div
          css={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(103,174,104,0.8)",
          }}
        />
      );
    case "CAN_TAKE":
      return (
        <div
          css={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "2px #9e0016 solid",
          }}
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
          css={{
            position: "absolute",
            height: "100%",
            width: "100%",
            borderRadius: 50,
            background:
              "radial-gradient(circle, rgba(255,15,0,1) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      );
    case "MOVE_HISTORY":
      return (
        <div
          css={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgb(255,211,0,0.4)",
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
  const gameStatus = useSelector((state: ChessGameState) => state.gameStatus);
  const currentTurn = useSelector((state: ChessGameState) => state.currentTurn);
  const selectedTile = useSelector(
    (state: ChessGameState) => state.boardState.selectedTile
  );
  const { pieceId, highlight } = useSelector(
    (state) => state.boardState.tileMap[id]
  );
  const { highlight: historyHighlight } = useSelector(
    (state) => state.movesState.historyTileMap[id]
  );
  const isActiveCheck = useSelector((state) => state.checkState.isActiveCheck);

  // const { setMessageToSend } = usePubnubProcess();

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
        backgroundColor:
          (xPos + yPos) % 2 === 0
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
      {historyHighlight && <TileHighlight variant={"MOVE_HISTORY"} />}
      {checkHighlight && <TileHighlight variant={"CHECK"} />}
      {highlight && !pieceId && <TileHighlight variant={"CAN_MOVE"} />}
      {highlight && !!pieceId && <TileHighlight variant={"CAN_TAKE"} />}
      {isSelected && <TileHighlight variant={"SELECTED"} />}
      {pieceId && <Piece pieceId={pieceId} />}
    </div>
  );
};

export default Tile;
