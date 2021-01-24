import * as React from "react";
import Chessboard from "src/components/Chessboard";

// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Crazy Chess!</title>
      <Chessboard />
    </main>
  );
};

export default IndexPage;
