import React from "react";
import { css } from "@emotion/react";
import { actions, store } from "src/store";
import { useSelector } from "react-redux";
import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import Image from "../image";

const DrawerHandle = ({ onClick, handleText, hideKnob }) => {
  const style = css`
    display: inline-block;
    transition: all 0.2s;
    position: relative;
    font-size: 5rem;
    margin-top: ${hideKnob ? "4rem" : "9rem"};
    color: white;
    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
  `;

  return (
    <div>
      <span onClick={onClick} className={"btn"} css={style}>
        {handleText}
      </span>
      {!hideKnob && (
        <Image
          alt={`Drawer Knob`}
          filename={"knob_1.png"}
          style={{
            width: "20%",
            position: "absolute",
            bottom: "0%",
            left: "50%",
            transform: "translate(-50%, 42%) scale(0.5) rotate(180deg)",
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
};

const DrawerOption = ({ text }) => {
  const startNewGame = () => {
    store.dispatch(actions.initializeGame());
    setTimeout(
      () => store.dispatch(actions.newGame({ gameType: "REGULAR" })),
      700
    );
  };

  return (
    <button
      onClick={startNewGame}
      css={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 15,
        padding: "15px",
        height: "80%",
        width: "25%",
        border: "none",
        textDecoration: "none",
        "&:hover": {
          transform: "translateY(-.3rem)",
          boxShadow: "0 1rem 2rem rgba(0,0,0,.2)",
          cursor: "pointer",
        },
      }}
    >
      {text}
    </button>
  );
};

const DrawerBase = ({ isOpen, ...props }) => {
  const data = useStaticQuery(
    graphql`
      query {
        felt: file(base: { eq: "cloth_1.jpeg" }) {
          childImageSharp {
            fluid(quality: 80, maxWidth: 50) {
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
        {props.children}
      </div>
    </BackgroundImage>
  );
};

const Drawer = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const gameStatus = useSelector((state) => state.gameStatus);
  const isGameInitializingOrInProgress = [
    "IN PROGRESS",
    "INITIALIZING",
  ].includes(gameStatus);

  const handleOnClick = () => {
    if (isGameInitializingOrInProgress) {
      store.dispatch(actions.reset());
    } else {
      setIsOpen(!isOpen);
    }
  };

  React.useEffect(() => {
    if (isGameInitializingOrInProgress) {
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
            boxShadow: "inset 1px 10px 15px 0px #000000",
            position: "absolute",
            display: "flex",
            left: "2.5%",
            width: "95%",
            height: "88%",
            paddingTop: 30,
            paddingLeft: 60,
            paddingRight: 60,
            justifyContent: "space-between",
          }}
        >
          <DrawerOption text="PLAY A FRIEND" />
          <DrawerOption text="PLAY THE COMPUTER" />
          <DrawerOption text="PLAY YOURSELF" />
        </div>
      </DrawerBase>
      <DrawerHandle
        onClick={handleOnClick}
        handleText={
          isGameInitializingOrInProgress
            ? "QUIT GAME"
            : isOpen
            ? "CANCEL"
            : "NEW GAME"
        }
        hideKnob={isGameInitializingOrInProgress}
      />
    </div>
  );
};

export default Drawer;
