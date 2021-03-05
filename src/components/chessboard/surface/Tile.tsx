import * as React from "react";
import Marker from "src/components/chessboard/surface/TileMarker";
import Piece from "src/components/Piece";
import { TileId } from "src/types/constants";
import { useSelector } from "react-redux";
import { store, actions, ChessGameState } from "src/store";
import { _getPieceType, _getPlayer } from "../../../store/utils";
import TileHighlight from "./TileHighlight";

interface TileProps {
  id: TileId;
  xPos: XPos;
  yPos: YPos;
}

const Tile = ({ id, xPos, yPos }: TileProps) => {
  const gameStatus = useSelector((state: ChessGameState) => state.gameStatus);
  const currentTurn = useSelector((state: ChessGameState) => state.currentTurn);
  const selectedTile = useSelector(
    (state: ChessGameState) => state.boardState.selectedTile
  );
  const selectedPiece = useSelector(
    (state: ChessGameState) => state.boardState.selectedPiece
  );
  const { pieceId, highlight } = useSelector(
    (state) => state.boardState.tileMap[id]
  );
  const { highlight: historyHighlight } = useSelector(
    (state) => state.movesState.historyTileMap[id]
  );
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
      if ((yPos === 0 || yPos === 7) && _getPieceType(selectedPiece!) === "P") {
        store.dispatch(actions.showModal({ type: "PAWN_PROMOTE" }));
      } else {
        store.dispatch(actions.moveToTile({ targetTileId: id }));
      }
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
