import * as React from "react";
import Marker from "src/components/chessboard/tile/TileMarker";
import Piece from "src/components/Piece";
import { TileId } from "src/types/constants";
import { useSelector } from "react-redux";
import { store, actions, ChessGameState } from "src/store";
import { _getPieceType, _getPlayer } from "src/store/utils";
import TileHighlight from "./TileHighlight";
import useMakeMove from "src/hooks/useMakeMove";
import { useDrag, useDrop } from "react-dnd";
import { useEffect } from "react";

interface TileProps {
  id: TileId;
  xPos: XPos;
  yPos: YPos;
}

const Tile = ({ id, xPos, yPos }: TileProps) => {
  const { status, currentTurn, playMode, player } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const selectedTile = useSelector(
    (state: ChessGameState) => state.boardState.selectedTile
  );
  const selectedPiece = useSelector(
    (state: ChessGameState) => state.boardState.selectedPiece
  );
  const { pieceId, highlight } = useSelector(
    (state: ChessGameState) => state.boardState.tileMap[id]
  );
  const { pieceId: historyPieceId, highlight: historyHighlight } = useSelector(
    (state: ChessGameState) => state.movesState.historyTileMap[id]
  );
  const isShowingHistory = useSelector(
    (state: ChessGameState) => state.movesState.isShowingHistory
  );
  const isActiveCheck = useSelector(
    (state: ChessGameState) => state.checkState.isActiveCheck
  );
  const makeMove = useMakeMove();

  const isGameInProgress = ["IN PROGRESS", "READY"].includes(status);
  const isSelected = selectedTile === id;

  const canSelectBothSides = playMode === "PLAY OVER THE BOARD";
  const isPlayersTurn = currentTurn === player;
  const isCurrentTurnPieceOnTile =
    pieceId && _getPlayer(pieceId) === currentTurn;

  const isSelectable =
    isGameInProgress &&
    !isShowingHistory &&
    isCurrentTurnPieceOnTile &&
    (canSelectBothSides || isPlayersTurn);
  const isCurrentTurnKingTile =
    pieceId &&
    _getPieceType(pieceId) === "K" &&
    _getPlayer(pieceId) === currentTurn;

  const checkHighlight = isActiveCheck && isCurrentTurnKingTile;

  const onClick = () => {
    if (isShowingHistory) {
      return;
    }

    if (isSelectable && !isSelected) {
      store.dispatch(actions.selectTile({ tileId: id }));
    } else if (highlight) {
      if ((yPos === 0 || yPos === 7) && _getPieceType(selectedPiece!) === "P") {
        store.dispatch(
          actions.setModalState({
            modalState: {
              type: "PAWN_PROMOTE",
              modalProps: { targetTileId: id },
            },
          })
        );
      } else {
        makeMove({ targetTileId: id });
      }
    } else {
      store.dispatch(actions.deselect());
    }
  };

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "PIECE",
      item: { pieceId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "PIECE",
      drop: () => makeMove({ targetTileId: id }),
      canDrop: () => !isShowingHistory && highlight,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [highlight, id, isShowingHistory]
  );

  useEffect(() => {
    if (isSelectable && isDragging) {
      store.dispatch(actions.selectTile({ tileId: id }));
    } else {
      store.dispatch(actions.deselect());
    }
  }, [isDragging]);

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
      ref={dropRef}
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
      {!isShowingHistory && checkHighlight && (
        <TileHighlight variant={"CHECK"} />
      )}
      {!isShowingHistory && highlight && !isOver && (
        <TileHighlight variant={!!pieceId ? "CAN_TAKE" : "CAN_MOVE"} />
      )}
      {!isShowingHistory && isSelected && !isDragging && (
        <TileHighlight variant={"SELECTED"} />
      )}
      {canDrop && isOver && <TileHighlight variant={"HOVER"} />}
      {((!isShowingHistory && pieceId) ||
        (isShowingHistory && historyPieceId)) && (
        <Piece
          ref={dragRef}
          pieceId={isShowingHistory ? historyPieceId : pieceId}
          isDragging={isDragging}
        />
      )}
    </div>
  );
};

export default Tile;
