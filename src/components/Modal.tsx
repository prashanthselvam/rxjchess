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

const StyledButton = styled("button")`
  font-size: 1.7rem;
  margin-top: 12px;
  padding: 8px 24px;
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
    <div css={{ color: "white" }}>
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
    <div css={{ color: "white", width: 400 }}>
      <h1>Well Played!</h1>
      <Image
        alt="winner"
        filename={`${winner}Q.png`}
        style={{ width: "33%", margin: "2rem 0 1rem 33%" }}
      />
      <p css={{ fontSize: "2rem", marginBottom: "2rem" }}>{winnerText()}</p>
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
    makeMove({
      targetTileId: targetTileId!,
      promotePieceType: type,
    });
    store.dispatch(actions.setModalState({ modalState: { type: undefined } }));
  };

  return (
    <div
      css={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <h2
        css={{
          width: "100%",
          color: "white",
        }}
      >
        PAWN PROMOTE
      </h2>
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

  return (
    <DialogOverlay css={{ zIndex: 2 }} isOpen={showModal} onDismiss={onDismiss}>
      <DialogContent
        style={{
          boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)",
          backgroundColor: "rgb(9,40,117)",
          textAlign: "center",
          width: modalWidth,
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
