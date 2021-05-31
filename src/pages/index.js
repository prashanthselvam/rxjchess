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
      <Helmet
        title="RxJChess"
        meta={[
          {
            property: `og:title`,
            content: "Chess application built using react, redux, and rxJs",
          },
          {
            property: `og:type`,
            content: `website`,
          },
          {
            property: `og:image`,
            content: `${icon.file.publicURL}`,
          },
        ]}
      >
        <link rel="icon" href={icon.file.publicURL} />
      </Helmet>
      <App urlGameId={urlGameId} />
    </main>
  );
};

export default IndexPage;
