import * as React from "react";
import App from "src/components/App";

// styles
const pageStyles = {
  color: "#232129",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Crazy Chess!</title>
      <App />
    </main>
  );
};

export default IndexPage;
