import { graphql } from "gatsby";
import { BLACK_BOARD, WHITE_BOARD } from "src/types/constants";
import Tile from "../Tile";
import BackgroundImage from "gatsby-background-image";
import { useSelector } from "react-redux";
import React from "react";
import Img from "gatsby-image";
import { useStaticQuery } from "gatsby";

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

const PlayingSurface = () => {
  const pov = useSelector((state) => state.pov);

  const drawRow = (yPos) => {
    return (
      <div
        key={yPos}
        style={{
          display: "flex",
          width: "100%",
          height: "12.5%",
        }}
      >
        {[...Array(8).keys()].map((xPos) => {
          const key =
            pov === "W" ? WHITE_BOARD[yPos][xPos] : BLACK_BOARD[yPos][xPos];
          return <Tile key={key} id={key} xPos={xPos} yPos={yPos} />;
        })}
      </div>
    );
  };

  return (
    <Board>
      <div
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "95%",
          height: "95%",
          border: "0.2px solid #777",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
          {[...Array(8).keys()]
            .sort((a, b) => b - a)
            .map((yPos) => drawRow(yPos))}
        </div>
      </div>
    </Board>
  );
};

export default PlayingSurface;
