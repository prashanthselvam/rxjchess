import Image from "./image";
import * as React from "react";
import { PieceId } from "src/types/constants";
import { _getPieceType, _getPlayer } from "../store/utils";
import useEntryAnimate from "../hooks/useEntryAnimate";
import { ChessGameState } from "../store";
import { useSelector } from "react-redux";
import { useDrag } from "react-dnd";

interface PieceProps {
  pieceId: PieceId;
  flipped?: boolean;
  isDragging?: boolean;
}

const Piece = React.forwardRef(({ pieceId, isDragging }: PieceProps, ref) => {
  const showPiece = useEntryAnimate(0);
  const player = _getPlayer(pieceId);
  const pieceType = _getPieceType(pieceId);
  const filename = `${player}${pieceType}.png`;

  const gameStatus = useSelector(
    (state: ChessGameState) => state.currentGameState.status
  );

  const doAnimate = gameStatus === "READY";

  return (
    <div
      css={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        opacity: isDragging ? 0.1 : 1,
        // transition: doAnimate && !isDragging ? "all 0.4s" : "",
      }}
      ref={ref}
    >
      <Image
        alt={`Chess Piece ${pieceId}`}
        filename={filename}
        draggable={false}
        // style={pov !== piecePlayer ? { transform: "rotate(180deg)" } : {}}
      />
    </div>
  );
});

export default Piece;
