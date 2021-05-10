import * as React from "react";
import App from "src/components/App";

const IndexPage = ({ location }) => {
  const urlGameId = location.search.slice(1);

  return (
    <main>
      <title>Crazy Chess!</title>
      <App urlGameId={urlGameId} />
    </main>
  );
};

export default IndexPage;
