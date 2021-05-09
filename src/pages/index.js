import * as React from "react";
import App from "src/components/App";

const IndexPage = ({ location }) => {
  const gameParam = location.search.slice(1);

  return (
    <main>
      <title>Crazy Chess!</title>
      <App gameParam={gameParam} />
    </main>
  );
};

export default IndexPage;
