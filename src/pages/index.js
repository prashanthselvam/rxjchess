import * as React from "react";
import App from "src/components/App";
import Helmet from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";

const IndexPage = ({ location }) => {
  const urlGameId = location.search.slice(1);

  const icon = useStaticQuery(
    graphql`
      query {
        file(base: { eq: "logo.png" }) {
          publicURL
        }
      }
    `
  );

  return (
    <main>
      <Helmet>
        <link rel="icon" href={icon.file.publicURL} />
      </Helmet>
      <title>RxJChess</title>
      <App urlGameId={urlGameId} />
    </main>
  );
};

export default IndexPage;
