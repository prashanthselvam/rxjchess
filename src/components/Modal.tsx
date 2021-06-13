import { store, actions, ChessGameState, ModalProps } from "src/store";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import "@reach/dialog/styles.css";
import * as React from "react";
import { useSelector } from "react-redux";
import Image from "./image";
import useMakeMove from "src/hooks/useMakeMove";
import { _getOpponent } from "src/store/utils";
import { css, keyframes } from "@emotion/react";
import { useEffect } from "react";
import { usePubNub } from "pubnub-react";
import { StyledButton } from "./StyledButton";
import { SocialIcon } from "react-social-icons";

const QuitGameModal = ({ quitter }: ModalProps) => {
  const { playMode, gameId, status } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );
  const pubNub = usePubNub();
  const isResigning =
    playMode !== "PLAY OVER THE BOARD" && status === "IN PROGRESS";
  const playerLeaving = playMode === "PLAY FRIEND" && status === "READY";

  const modalText = isResigning
    ? "Are you sure you would like to resign?"
    : "Are you sure you would like to quit the game?";

  const handleOnClick = () => {
    if (isResigning) {
      playMode === "PLAY FRIEND" &&
        pubNub.publish({
          channel: gameId,
          message: {
            type: "RESIGN",
            player: quitter,
          },
        });
      store.dispatch(
        actions.endGame({
          winner: _getOpponent(quitter!),
          winMode: "RESIGNATION",
        })
      );
    } else {
      if (playerLeaving) {
        pubNub.publish({
          channel: gameId,
          message: {
            type: "LEFT_GAME",
            player: quitter,
          },
        });
      }
      store.dispatch(actions.reset());
    }
  };

  return (
    <div>
      <p css={{ fontSize: "2rem", marginBottom: "2rem" }}>{modalText}</p>
      <div css={{ display: "flex", justifyContent: "space-evenly" }}>
        <StyledButton onClick={handleOnClick}>YES</StyledButton>
        <StyledButton
          onClick={() =>
            store.dispatch(
              actions.setModalState({ modalState: { type: undefined } })
            )
          }
        >
          NO
        </StyledButton>
      </div>
    </div>
  );
};

const AboutModal = () => {
  const textStyles = css`
    font-size: 2rem;
    font-family: "Times New Roman";
    p {
      margin-bottom: 24px;
    }
  `;

  const iconStyles = css`
    transform: scale(0.7);
  `;

  return (
    <div css={textStyles}>
      <p>{`I built this site using React, Redux, RxJs (hence the name!) and a handful of other frontend technologies. I always enjoyed 
    playing chess and over the years racked up a lot of hours on apps like chess.com and lichess. At some point 
    during the pandemic, I decided it would be fun to build my own app with a little more visual flair than what 
    these popular apps generally offer, and so this site was born.`}</p>
      <p>{`I hope you enjoy RxJChess as much as I enjoyed building it. Please feel free to reach out with any questions, 
    comments, or feedback. I'd especially love to discuss alternate approaches to building a chess engine.`}</p>
      <p css={{ margin: "42px 0 0 0" }}>{`- Prashanth Selvam`}</p>
      <div css={{ display: "flex", justifyContent: "center" }}>
        <SocialIcon
          css={iconStyles}
          url="https://github.com/prashanthselvam"
          target="_blank"
          rel="noopener noreferrer"
        />
        <SocialIcon
          css={iconStyles}
          url="https://www.linkedin.com/in/prashanthselvam/"
          target="_blank"
          rel="noopener noreferrer"
        />
        <SocialIcon
          css={iconStyles}
          url="https://twitter.com/preshdamesh/"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </div>
  );
};

const MultiplayerStatusModal = ({ multiplayerGameStatus }: ModalProps) => {
  let modalText = "";

  switch (multiplayerGameStatus) {
    case "INVALID_URL":
      modalText =
        "Game URL is no longer valid.\nRedirecting to the main site in just a second where you can start a new game.";
      break;
    case "HOST_LEFT":
      modalText =
        "Unable to establish connection, likely due to host leaving.\nRedirecting to the main site in just a second where you can start a new game.";
      break;
    case "SUCCESS":
      modalText = "Connection successful! Your game will begin shortly.";
      break;
    case "CONNECTING":
      modalText = "Please wait. Establishing connection with the game host...";
  }

  useEffect(() => {
    if (multiplayerGameStatus === "SUCCESS") {
      setTimeout(
        () =>
          store.dispatch(
            actions.setModalState({ modalState: { type: undefined } })
          ),
        2000
      );
    } else if (
      multiplayerGameStatus === "INVALID_URL" ||
      multiplayerGameStatus === "HOST_LEFT"
    ) {
      setTimeout(() => (window.location.href = window.location.origin), 3000);
    }
  }, [multiplayerGameStatus]);

  return (
    <div css={{ width: "fit-content" }}>
      <p css={{ fontSize: "2rem", marginBottom: "2rem" }}>{modalText}</p>
    </div>
  );
};

const GameOverModal = ({ winner, winMode }: ModalProps) => {
  const player = useSelector(
    (state: ChessGameState) => state.currentGameState.player
  );

  let wp, lp, winnerText, loserText;

  if (winner === "W") {
    wp = "White";
    lp = "Black";
  } else {
    wp = "Black";
    lp = "White";
  }

  switch (winMode) {
    case "CHECKMATE":
      winnerText = "Congrats! You won by checkmate.";
      loserText = `${wp} wins by checkmate. Better luck next time!`;
      break;
    case "RESIGNATION":
      winnerText = `${lp} resigned. You win!`;
      loserText = `Well played! ${wp} wins.`;
      break;
    case "TIMEOUT":
      winnerText = `${lp} ran out of time. You win!`;
      loserText = `You ran out of time. ${wp} wins.`;
      break;
    case "PLAYER LEFT":
      winnerText = `${lp} left the game. You win!`;
      loserText = "";
      break;
    default:
      winnerText = loserText = "It's a stalemate! Nobody wins.";
  }

  return (
    <div>
      <h1>GAME OVER</h1>
      <Image
        alt="winner"
        fileName={winner ? `${winner}Q.png` : "stalemate.jpeg"}
        style={{ width: "33%", margin: "2rem 0 1rem 33%" }}
      />
      <p css={{ fontSize: "2rem", marginBottom: "2rem" }}>
        {player === winner ? winnerText : loserText}
      </p>
      <div css={{ display: "flex", justifyContent: "space-evenly" }}>
        <StyledButton onClick={() => store.dispatch(actions.reset())}>
          MAIN MENU
        </StyledButton>
        <StyledButton
          onClick={() =>
            store.dispatch(
              actions.setModalState({ modalState: { type: undefined } })
            )
          }
        >
          CLOSE
        </StyledButton>
      </div>
    </div>
  );
};

const PawnPromoteModal = ({ targetTileId }: ModalProps) => {
  const currentTurn = useSelector(
    (state: ChessGameState) => state.currentGameState.currentTurn
  );
  const makeMove = useMakeMove();
  const pieceTypes = ["Q", "B", "N", "R"];

  const onClick = (type) => {
    store.dispatch(actions.setModalState({ modalState: { type: undefined } }));
    makeMove({
      targetTileId: targetTileId!,
      promotePieceType: type,
    });
  };

  return (
    <div
      css={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <h1
        css={{
          width: "100%",
          marginBottom: 24,
        }}
      >
        PAWN PROMOTE
      </h1>
      {pieceTypes.map((type) => {
        return (
          <div
            onClick={() => onClick(type)}
            css={{ width: "20%", height: "20%", cursor: "pointer" }}
            key={type}
          >
            <Image alt={type} filename={`${currentTurn}${type}.png`} />
          </div>
        );
      })}
    </div>
  );
};

export const Modal = () => {
  const { type, modalProps } = useSelector(
    (state: ChessGameState) => state.modalState
  );
  const showModal = !!type;

  const onDismiss = () => {
    if (type === "PAWN_PROMOTE" || type === "MULTIPLAYER_STATUS") {
      return null;
    }
    store.dispatch(actions.setModalState({ modalState: { type: undefined } }));
  };

  const wideModal = type === "ABOUT";

  const appear = keyframes`
      0% {
        opacity: 0;
        transform: scale(1.2)
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    `;

  return (
    <DialogOverlay
      css={{
        zIndex: 2,
        animation: `${appear} 0.2s ease`,
      }}
      isOpen={showModal}
      onDismiss={onDismiss}
    >
      <DialogContent
        className={"modal"}
        aria-label={type ? type : "MINIMIZED MODAL"}
        css={{ width: wideModal ? "80vw !important" : "inherit" }}
      >
        {type === "PAWN_PROMOTE" && <PawnPromoteModal {...modalProps} />}
        {type === "GAME_OVER" && <GameOverModal {...modalProps} />}
        {type === "QUIT_GAME" && <QuitGameModal {...modalProps} />}
        {type === "MULTIPLAYER_STATUS" && (
          <MultiplayerStatusModal {...modalProps} />
        )}
        {type === "ABOUT" && <AboutModal />}
      </DialogContent>
    </DialogOverlay>
  );
};
