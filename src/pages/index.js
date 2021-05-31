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
            content: `RxJChess`,
          },
          {
            property: `og:type`,
            content: `website`,
          },
          {
            property: `og:url`,
            content: `https://rxjchess.com/`,
          },
          {
            property: `og:description`,
            content: `Chess application built using React, Redux, and RxJs`,
          },
          {
            property: `og:image`,
            content: `https://gblobscdn.gitbook.com/spaces%2F-LwY_OXUQHvmdEoy0xNa%2Favatar.png?alt=media`,
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
