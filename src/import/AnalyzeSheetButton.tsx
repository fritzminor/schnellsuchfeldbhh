import * as React from "react";

import { ExamMode24 } from "@carbon/icons-react";
import { Store } from "../store/Store";
import { AppState } from "../store/AppState";
import { Workbook } from "exceljs";
import { AnalyzeResults, importAnalyzeSheet } from "./importAnalyseSheet";
import { after } from "lodash";


const loadAnalyzeSheet = (evt: React.ChangeEvent<HTMLInputElement>,
  appState: AppState,
  setModalInfo: (modalInfo: string | AnalyzeResults | null) => void,
  showError: (msg: string, error: any) => void
) => {
  const files = evt.target.files;
  if (files) {
    const file = files[0];
    console.log("filesSelected", files[0]);

    // this is necessary, because Chrome/Chromium/Edge does not fire 
    // onchange, if the same file is selected again.
    evt.target.value="";
    
    const r = new FileReader();
    r.onload = (evt) => {
      const wb = new Workbook();
      if (evt.target && evt.target.result && evt.target.result instanceof ArrayBuffer) {
        console.log("in medias res");
        wb.xlsx.load(evt.target.result)
          .then(async (workbook) => {
            try {
              const analyzeResults = await importAnalyzeSheet(file, workbook, appState);
              setModalInfo(analyzeResults);
            } catch (reasonAnalyzeSheet) {
              console.log("Kein Auswerte-Tabellenblatt", reasonAnalyzeSheet, file);
              throw reasonAnalyzeSheet; // throw former Error
            }
          }
          )
          .catch((reason) => {
            showError("Fehler beim Laden der Excel-Datei: " + reason, file.name);
          }
          );
      }
    };
    r.readAsArrayBuffer(file);
    console.log("Reading started ...");
  }
};


export type AnalyzeSheetButtonProps = {
  appState: AppState;
  setModalInfo: (modalInfo: string | AnalyzeResults | null) => void,

  /** callback will be called
   * after the analysis.
   */
  afterAnalysis?: () => void;
};




export function AnalyzeSheetButton({
  appState, setModalInfo,
  afterAnalysis
}: AnalyzeSheetButtonProps): JSX.Element {
  function showError(msg: string, error: any) {
    console.log("Showing error ", msg, error);
    setModalInfo(msg);
  }

  return <div className="file is-info">
    <label className="file-label">
      <input className="file-input" type="file" name="resume" onChange={
        (evt) => {
          loadAnalyzeSheet(evt, appState, setModalInfo, showError);
          if (afterAnalysis)
            afterAnalysis();
        }
      } />
      <span className="file-cta">
        <span className="file-icon">
          <ExamMode24 />
        </span>
        <span className="file-label">
          Excel-Analyse
        </span>
      </span>
    </label>
  </div>;

}



