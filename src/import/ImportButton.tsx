import * as React from "react";

import { Upload24 } from "@carbon/icons-react";
import { loadFile } from "./ImportLogic";
import { Store } from "../store/Store";
import { AppState } from "../store/AppState";


export type ImportButtonProps = {
  store: Store;
  appState: AppState;
};


export function ImportButton({ store, appState }: ImportButtonProps): JSX.Element {
  const {
    setCurrentUser, setLocalData, showUserMessage,
    setModalInfo
  } = store;
  function showError(msg: string, error: any) {
    console.log("Showing error ", msg, error);
    showUserMessage(msg);
  }

  return <div className="file">
    <label className="file-label">
      <input className="file-input" type="file" name="resume" onChange={
        (evt) => { loadFile(evt, appState, setCurrentUser, setLocalData, setModalInfo, showError); }
      } />
      <span className="file-cta">
        <span className="file-icon">
          <Upload24 />
        </span>
        <span className="file-label">
          Excel-Import
        </span>
      </span>
    </label>
  </div>;

}