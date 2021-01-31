import Image from "./image";
import * as React from "react";
import { PieceID } from "src/data/constants";
import { useSelector } from "react-redux";

interface PieceProps {
  pieceId: PieceID;
  flipped?: boolean;
}

const Piece = ({ pieceId }: PieceProps) => {
  const pov = useSelector((state) => state.pov);

  const piecePlayer = pieceId.slice(0, 1);
  const filename = `${pieceId.slice(0, 2)}.png`;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        margin: "-31.5px 0 0 -31.5px",
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
