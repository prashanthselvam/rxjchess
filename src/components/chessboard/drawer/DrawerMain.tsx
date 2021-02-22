import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import DrawerMenu from "./DrawerMenu";

const DrawerMain = ({ isOpen, ...props }) => {
  const data = useStaticQuery(
    graphql`
      query {
        felt: file(base: { eq: "drawer_base.jpeg" }) {
          childImageSharp {
            fluid(quality: 80, maxWidth: 50) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        wood: file(base: { eq: "wood.jpg" }) {
          childImageSharp {
            fluid(quality: 80, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    `
  );

  const feltImage = data.felt.childImageSharp.fluid;
  const woodImage = data.wood.childImageSharp.fluid;

  const LeftSidePiece = () => {
    return (
      <BackgroundImage
        Tag="div"
        fluid={woodImage}
        style={{
          position: "absolute",
          height: "100%",
          width: "2.5%",
          top: 0,
          left: 0,
        }}
      />
    );
  };

  const RightSidePiece = () => {
    return (
      <BackgroundImage
        Tag="div"
        fluid={woodImage}
        style={{
          position: "absolute",
          height: "100%",
          width: "2.5%",
          top: 0,
          right: 0,
        }}
      />
    );
  };

  const BottomSidePiece = () => {
    return (
      <BackgroundImage
        Tag="div"
        fluid={woodImage}
        style={{
          position: "absolute",
          height: "12%",
          width: "95%",
          bottom: 0,
          left: "2.5%",
        }}
      />
    );
  };

  return (
    <BackgroundImage
      Tag="div"
      fluid={feltImage}
      style={{
        height: "100%",
        position: "relative",
        backgroundSize: "auto",
        backgroundRepeat: "repeat",
        boxShadow: "1px 10px 10px rgba(0,0,0,.2)",
      }}
    >
      <div
        css={{
          height: "100%",
          position: "relative",
        }}
      >
        <LeftSidePiece />
        <BottomSidePiece />
        <RightSidePiece />
        <DrawerMenu />
      </div>
    </BackgroundImage>
  );
};

export default DrawerMain;
