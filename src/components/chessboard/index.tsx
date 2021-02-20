import PlayingSurface from "./PlayingSurface";
import Drawer from "./Drawer";
import React from "react";

const Chessboard = () => {
  const length = 700;

  return (
    <div>
      <PlayingSurface length={length} />
      <Drawer length={length} />
    </div>
  );
};

export default Chessboard;
