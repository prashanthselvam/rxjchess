import Image from "./image";
import * as React from "react";
import { PieceID } from "src/data/constants";

interface PieceProps {
  pieceId: PieceID;
  flipped?: boolean;
}

const Piece = ({ pieceId, flipped = false }: PieceProps) => {
  const filename = flipped
    ? `${pieceId.slice(0, 2)}_flipped.png`
    : `${pieceId.slice(0, 2)}.png`;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        margin: "-31.5px 0 0 -31.5px",
      }}
    >
      <Image alt={`Chess Piece ${pieceId}`} filename={filename} />
    </div>
  );
};

export default Piece;
