import { store, actions } from "src/store";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import "@reach/dialog/styles.css";
import * as React from "react";
import { useSelector } from "react-redux";

export const Modal = () => {
  const modalState = useSelector((state) => state.modalState);
  const showModal = !!modalState;

  const close = () => store.dispatch(actions.showModal({ type: undefined }));

  return (
    <DialogOverlay
      style={{ zIndex: 2 }}
      isOpen={showModal}
      onDismiss={() => null}
    >
      <DialogContent
        style={{ boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)" }}
      >
        <button className="close-button" onClick={close}>
          <span aria-hidden>×</span>
        </button>
        <p>Hello there. I am a dialog</p>
      </DialogContent>
    </DialogOverlay>
  );
};
