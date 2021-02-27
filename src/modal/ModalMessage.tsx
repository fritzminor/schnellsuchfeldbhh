import { FC } from "react";

export type ModalMessageProps = {
  /** If true, modal dialog is shown */
  active: boolean;
  /** should reset active to false, thus hiding the modal dialog */
  hideModal: () => void;
};

export const ModalMessage: FC<ModalMessageProps> = ({ children, active, hideModal }) => {
  return <div className={`modal${active ? " is-active" : ""}`}>
    <div className="modal-background"
      onClick={() => { hideModal(); }}></div>
    <div className="modal-content">
      {children}
    </div>
    <button className="modal-close is-large" aria-label="close"
      onClick={() => { hideModal(); }}></button>
  </div>;
};