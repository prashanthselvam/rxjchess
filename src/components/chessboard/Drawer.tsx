import React from "react";
import { css } from "@emotion/react";
import { actions, store } from "src/store";
import { useSelector } from "react-redux";
import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import styled from "@emotion/styled";

const DrawerHandle = ({ onClick, handleText }) => {
  return (
    <div
      onClick={onClick}
      css={{
        width: "40%",
        height: "30px",
        position: "absolute",
        bottom: "0%",
        left: "50%",
        transform: "translate(-50%, 100%)",
        backgroundColor: "green",
      }}
    >
      {handleText}
    </div>
  );
};

const DrawerOption = ({ text }) => {
  const startNewGame = () =>
    store.dispatch(actions.newGame({ gameType: "REGULAR" }));

  return (
    <div
      onClick={startNewGame}
      css={{
        backgroundColor: "rgb(255,255,255, 0.4)",
        padding: "15px",
        height: "80%",
        border: "1px solid black",
      }}
    >
      {text}
    </div>
  );
};

const DrawerBase = ({ isOpen, ...props }) => {
  const data = useStaticQuery(
    graphql`
      query {
        felt: file(base: { eq: "green_felt.jpg" }) {
          childImageSharp {
            fluid(quality: 80, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        wood: file(base: { eq: "wood_5.jpg" }) {
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

  // const SidePiece = styled.div({
  //   position: "absolute",
  //   height: "100%",
  //   width: "2%",
  //   background: `url(${woodImagePath})`,
  // });

  const LeftSidePiece = () => {
    return (
      <BackgroundImage
        Tag="div"
        fluid={woodImage}
        style={{
          position: "absolute",
          height: "100%",
          width: "2%",
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
          width: "2%",
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
          height: "10%",
          width: "96%",
          bottom: 0,
          left: "2%",
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
      }}
    >
      <LeftSidePiece />
      <BottomSidePiece />
      <RightSidePiece />
      {props.children}
    </BackgroundImage>
  );
};

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const gameStatus = useSelector((state) => state.gameStatus);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    if (gameStatus === "IN PROGRESS") {
      setIsOpen(false);
    }
  }, [gameStatus]);

  const containerStyles = css`
    width: "100%";
    height: 300px;
    position: relative;
    text-align: center;
    transition: all 0.5s;
    transform: ${isOpen ? `none` : `translateY(-300px)`};
  `;

  return (
    <div css={containerStyles}>
      <DrawerBase isOpen={isOpen}>
        <div
          css={{
            position: "absolute",
            top: 15,
            display: "flex",
            width: "100%",
            paddingLeft: 60,
            paddingRight: 60,
            justifyContent: "space-between",
          }}
        >
          <DrawerOption text="NEW GAME" />
          <DrawerOption text="NEW GAME" />
          <DrawerOption text="NEW GAME" />
        </div>
      </DrawerBase>
      <DrawerHandle
        onClick={handleOnClick}
        handleText={isOpen ? "CANCEL" : "NEW GAME"}
      />
    </div>
  );
};

export default Drawer;
