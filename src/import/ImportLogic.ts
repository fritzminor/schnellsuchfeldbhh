import { Workbook } from "exceljs";
import { UserName } from "../navigation/UsersTypes";
import { AppState } from "../store/AppState";
import { BaseData } from "../store/AppState";
import { AnalyzeResults } from "./importAnalyseSheet";
import { importBHH_CSV } from "./importBHH";
import { importHOLTitGr } from "./importHOLTitGr";
import { importHOLXSLX } from "./importHOLXSLX";
import { importSN_XSLX } from "./importSN_XLSX";

export const loadFile = (
  evt: React.ChangeEvent<HTMLInputElement>,
  appState: AppState,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (localData: BaseData) => void,
  setModalInfo: (
    modalInfo: string | AnalyzeResults | null
  ) => void,
  showError: (msg: string, error: string) => void,
  /** this callback is called at the end of 
   * the loading process, even if an error occurred.
   */
  loadingFinished?:()=>void
): void => {
  const files = evt.target.files;
  if (files) {
    const file = files[0];

    // this is necessary, because Chrome/Chromium/Edge does not fire
    // onchange, if the same file is selected again.
    evt.target.value = "";

    console.log("filesSelected", files[0]);
    const r = new FileReader();
    r.onload = async (evt) => {
      const wb = new Workbook();
      if (
        evt.target &&
        evt.target.result &&
        evt.target.result instanceof ArrayBuffer
      ) {
        try {
          try {
            console.log("Trying to read XLSX...");
            const workbook = await wb.xlsx.load(
              evt.target.result
            );
            try {
              try {
                importHOLXSLX(
                  file,
                  workbook,
                  setCurrentUser,
                  setLocalData
                );
              } catch (reasonHOLXLSX) {
                console.log(
                  "Kein Format für importHOLXSLX.",
                  reasonHOLXLSX,
                  file
                );
                importSN_XSLX(
                  file,
                  workbook,
                  setCurrentUser,
                  setLocalData
                );
              }
            } catch (reasonSN_XLSX) {
              console.log(
                "Kein Format für importSN_XLSX.",
                reasonSN_XLSX,
                file
              );
              importHOLTitGr(
                file,
                workbook,
                setCurrentUser,
                setLocalData,
                appState
              );
            
            }
          } catch (xlsxReason) {
            console.log("Trying to read CSV ...");

            importBHH_CSV(
              file,
              setCurrentUser,
              setLocalData,
              setModalInfo
            );
          }
        } catch (reason) {
          showError(
            "Fehler beim Laden der Datei: " + reason,
            file.name
          );
        }
        if(loadingFinished)
           loadingFinished();
      }
    };
    r.readAsArrayBuffer(file);
    console.log("Reading started ...");
  }
};
