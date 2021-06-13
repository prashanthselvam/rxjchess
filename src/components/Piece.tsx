import Image from "./image";
import * as React from "react";
import { PieceId } from "src/types/constants";
import { _getPieceType, _getPlayer } from "src/store/utils";
import { ChessGameState } from "src/store";
import { useSelector } from "react-redux";
import { ForwardedRef } from "react";

interface PieceProps {
  pieceId: PieceId;
  flipped?: boolean;
  isDragging: boolean;
}

const Piece = React.forwardRef(
  ({ pieceId, isDragging }: PieceProps, ref: ForwardedRef<HTMLDivElement>) => {
    const piecePlayer = _getPlayer(pieceId);
    const pieceType = _getPieceType(pieceId);
    const filename = `${piecePlayer}${pieceType}.png`;

    const { playMode, player } = useSelector(
      (state: ChessGameState) => state.currentGameState
    );
    const isPlayingOverBoard = playMode === "PLAY OVER THE BOARD";

    return (
      <div
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          opacity: isDragging ? 0.1 : 1,
        }}
        ref={ref}
      >
        <Image
          alt={`Chess Piece ${pieceId}`}
          fileName={filename}
          draggable={false}
          loading={"eager"}
          css={
            isPlayingOverBoard && player !== piecePlayer
              ? { transform: "rotate(180deg)" }
              : {}
          }
        />
      </div>
    );
  }
);

export default Piece;
