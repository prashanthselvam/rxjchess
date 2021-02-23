import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import React from "react";

const Board = (props) => {
  const data = useStaticQuery(
    graphql`
      query {
        file(base: { eq: "wood.jpg" }) {
          childImageSharp {
            fluid(quality: 100, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    `
  );

  const imageData = data.file.childImageSharp.fluid;

  return (
    <BackgroundImage
      Tag="div"
      fluid={imageData}
      style={{
        boxShadow: "0.2px .1rem 0 0.2px rgba(1,1,1,0.2)",
        width: "100%",
        paddingTop: "100%",
        position: "relative",
        textAlign: "center",
        zIndex: 1,
      }}
    >
      <div
        css={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          backgroundColor: "rgba(245,223,70,0.2)",
          boxShadow: "0 1rem 1rem rgba(0,0,0,.2)",
        }}
      >
        {props.children}
      </div>
    </BackgroundImage>
  );
};

export default Board;
