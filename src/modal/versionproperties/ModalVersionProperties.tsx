import { FC } from "react";
import { VersionProperties } from "./VersionProperties";

export type ModalVersionPropertiesProps = {
  versionProps: VersionProperties;

  /** should  hide the modal dialog */
  hideModal: () => void;
};

export const ModalVersionProperties: FC<ModalVersionPropertiesProps> =
  ({ hideModal, versionProps }) => {
    return (
      <div className="modal is-active">
        <div
          className="modal-background"
          onClick={hideModal}
        ></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              {versionProps.fileName || "Import "}
              {` (${versionProps.basedata.hhsts.length})`}{" "}
            </p>
            <button
              className="delete"
              aria-label="close"
              onClick={hideModal}
            ></button>
          </header>
          <section className="modal-card-body"></section>
          <footer className="modal-card-foot">
            <button
              className="button is-success"
              onClick={() => {
                versionProps.addImportData(versionProps.basedata, false);
              }}
            >
              Import
            </button>
            <button className="button" onClick={hideModal}>
              Abbrechen
            </button>
          </footer>
        </div>
      </div>
    );
  };
