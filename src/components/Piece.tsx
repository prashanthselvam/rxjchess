import Image from "./image";
import * as React from "react";
import { PieceId } from "src/types/constants";
import { useSelector } from "react-redux";
import { _getPieceType, _getPlayer } from "../store/utils";

interface PieceProps {
  pieceId: PieceId;
  flipped?: boolean;
}

const Piece = ({ pieceId }: PieceProps) => {
  const pov = useSelector((state) => state.pov);
  const piecePlayer = pieceId.slice(0, 1);

  const player = _getPlayer(pieceId);
  const pieceType = _getPieceType(pieceId);
  const filename = `${player}${pieceType}.png`;

  return (
    <div
      css={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
      }}
    >
      <Image
        alt={`Chess Piece ${pieceId}`}
        filename={filename}
        // style={pov !== piecePlayer ? { transform: "rotate(180deg)" } : {}}
      />
    </div>
  );
};

export default Piece;
