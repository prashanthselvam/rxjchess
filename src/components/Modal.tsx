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

const PawnPromoteModal = ({ targetTileId }: ModalProps) => {
  const currentTurn = useSelector((state: ChessGameState) => state.currentTurn);
  const pieceTypes = ["Q", "B", "N", "R"];

  const onClick = (type) => {
    store.dispatch(
      actions.moveToTile({
        targetTileId: targetTileId!,
        promotePieceType: type,
      })
    );
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
          textAlign: "center",
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
  const { type, modalProps } = useSelector((state) => state.modalState);
  const showModal = !!type;

  const close = () =>
    store.dispatch(actions.setModalState({ modalState: { type: undefined } }));

  return (
    <DialogOverlay
      css={{ zIndex: 2 }}
      isOpen={showModal}
      onDismiss={() => null}
    >
      <DialogContent
        style={{
          boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)",
          backgroundColor: "rgb(9,40,117)",
        }}
        aria-label={type ? type : "MINIMIZED MODAL"}
      >
        {type === "PAWN_PROMOTE" && <PawnPromoteModal {...modalProps} />}
      </DialogContent>
    </DialogOverlay>
  );
};
