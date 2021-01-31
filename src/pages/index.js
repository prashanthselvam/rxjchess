import * as React from "react";
import Chessboard from "src/components/Chessboard";
import { Provider } from "react-redux";
import { store } from "src/store";

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
      <Provider store={store}>
        <Chessboard />
      </Provider>
    </main>
  );
};

export default IndexPage;
