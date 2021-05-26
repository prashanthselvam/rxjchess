import {
  store,
  actions,
  ChessGameState,
  ModalState,
  ModalProps,
} from "src/store";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import "@reach/dialog/styles.css";
import * as React from "react";
import { useSelector } from "react-redux";
import Image from "./image";
import useMakeMove from "../hooks/useMakeMove";
import styled from "@emotion/styled";
import { _getOpponent } from "../store/utils";
import { keyframes } from "@emotion/react";

const StyledButton = styled("button")`
  font-size: 1.7rem;
  margin-top: 12px;
  padding: 8px 24px;
  width: 150px;
`;

const QuitGameModal = ({ quitter }: ModalProps) => {
  const { playMode } = useSelector(
    (state: ChessGameState) => state.currentGameState
  );

  const modalText =
    playMode === "PLAY FRIEND"
      ? "Are you sure you would like to resign?"
      : "Are you sure you would like to quit the game?";

  const handleOnClick = () => {
    if (playMode === "PLAY FRIEND") {
      store.dispatch(
        actions.endGame({
          winner: _getOpponent(quitter!),
          winMode: "RESIGNATION",
        })
      );
    } else {
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

const GameOverModal = ({ winner, winMode }: ModalProps) => {
  // store.dispatch(actions.setModalState({ modalState: { type: undefined } }));
  const winnerText = () => {
    if (!!winner) {
      const player = winner === "W" ? "White" : "Black";
      return `${player} wins by ${winMode?.toLowerCase()}`;
    }

    return "Match tied";
  };

  return (
    <div>
      <h1>Well Played!</h1>
      <Image
        alt="winner"
        filename={`${winner}Q.png`}
        style={{ width: "33%", margin: "2rem 0 1rem 33%" }}
      />
      <p css={{ fontSize: "2rem", marginBottom: "2rem" }}>{winnerText()}</p>
      <div
        css={{ display: "flex", justifyContent: "space-evenly", width: 350 }}
      >
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
    if (type === "PAWN_PROMOTE") {
      return null;
    }
    store.dispatch(actions.setModalState({ modalState: { type: undefined } }));
  };

  const modalWidth = type !== "PAWN_PROMOTE" ? "fit-content" : "";

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
      css={{ zIndex: 2, animation: `${appear} 0.2s ease` }}
      isOpen={showModal}
      onDismiss={onDismiss}
    >
      <DialogContent
        style={{
          color: "rgb(4, 26, 61)",
          boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)",
          backgroundColor: "rgb(251,253,253)",
          textAlign: "center",
          width: modalWidth,
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: 40,
          borderRadius: 12,
        }}
        aria-label={type ? type : "MINIMIZED MODAL"}
      >
        {type === "PAWN_PROMOTE" && <PawnPromoteModal {...modalProps} />}
        {type === "GAME_OVER" && <GameOverModal {...modalProps} />}
        {type === "QUIT_GAME" && <QuitGameModal />}
      </DialogContent>
    </DialogOverlay>
  );
};
