import * as React from "react";

import { Upload24 } from "@carbon/icons-react";
import { loadFile } from "./ImportLogic";
import { Store } from "../store/Store";
import { AppState } from "../store/AppState";

export type ImportButtonProps = {
  store: Store;
  appState: AppState;
  /** will be called after loading finished,
   * even if an error occured.
   */
  loadFileFinished?: () => void;
};

export function ImportButton({
  store,
  loadFileFinished,
  appState
}: ImportButtonProps): JSX.Element {
  const { setModalInfo } = store;

  return (
    <div className="file is-info">
      <label className="file-label">
        <input
          className="file-input"
          type="file"
          name="resume"
          onChange={(evt) => {
            setModalInfo(
              `Lade ${
                evt.target.files
                  ? evt.target.files[0].name
                  : ""
              } in den Browser ...`
            );

            loadFile(
              evt,
              appState,
              store,
              loadFileFinished
            );
          }}
        />
        <span className="file-cta">
          <span className="file-icon">
            <Upload24 />
          </span>
          <span className="file-label">Daten-Import</span>
        </span>
      </label>
    </div>
  );
}
