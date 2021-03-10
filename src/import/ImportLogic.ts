import { Workbook } from "exceljs";
import { UserName } from "../navigation/UsersTypes";
import { AppState } from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { AnalyzeResults, importAnalyzeSheet } from "./importAnalyseSheet";
import { importHOLXSLX } from "./importHOLXSLX";
import { importSN_XSLX } from "./importSN_XLSX";



export const loadFile = (evt: React.ChangeEvent<HTMLInputElement>,
  appState: AppState,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (hhsts: HHSt[], firstYear: number) => void,
  setModalInfo: (modalInfo: string | AnalyzeResults | null) => void,
  showError: (msg: string, error: string) => void
):void => {
  const files = evt.target.files;
  if (files) {
    const file = files[0];
    console.log("filesSelected", files[0]);
    const r = new FileReader();
    r.onload = (evt) => {
      const wb = new Workbook();
      if (evt.target && evt.target.result && evt.target.result instanceof ArrayBuffer) {
        console.log("in medias res");
        wb.xlsx.load(evt.target.result)
          .then(async (workbook) => {
            try {
              importHOLXSLX(file, workbook, setCurrentUser, setLocalData);
            } catch (reasonHOLXLSX) {
              console.log("Kein Format für importHOLXSLX.", reasonHOLXLSX, file);
              try {
                importSN_XSLX(file, workbook, setCurrentUser, setLocalData);
              } catch (reasonSN_XLSX) {
                console.log("Kein Format für importSN_XSLX.", reasonSN_XLSX, file);
                try {

                  const analyzeResults = await importAnalyzeSheet(file, workbook, appState);
                  setModalInfo(analyzeResults);
                } catch (reasonAnalyzeSheet) {
                  console.log("Kein Auswerte-Tabellenblatt", reasonAnalyzeSheet, file);
                  throw reasonSN_XLSX; // throw former Error
                }
              }
            }
          })
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