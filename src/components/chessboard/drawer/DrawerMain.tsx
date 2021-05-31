import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import React from "react";
import DrawerMenu from "./DrawerMenu";

const DrawerMain = ({ isOpen, closeDrawer, ...props }) => {
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
        className={"sidepiece"}
        style={{
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
        className={"sidepiece"}
        style={{
          right: 0,
        }}
      />
    );
  };

  const BottomSidePiece = () => {
    return (
      <BackgroundImage Tag="div" fluid={woodImage} className={"bottompiece"} />
    );
  };

  return (
    <BackgroundImage
      Tag="div"
      fluid={feltImage}
      style={{
        height: "100%",
        position: "relative",
        backgroundSize: "5%",
        backgroundRepeat: "repeat",
        boxShadow: ".1rem 1rem 1rem rgba(0,0,0,.2)",
      }}
    >
      <LeftSidePiece />
      <BottomSidePiece />
      <RightSidePiece />
      <DrawerMenu closeDrawer={closeDrawer} isOpen={isOpen} />
    </BackgroundImage>
  );
};

export default DrawerMain;
