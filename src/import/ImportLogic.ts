import { Workbook } from "exceljs";
import { UserName } from "../navigation/UsersTypes";
import { AppState } from "../store/AppState";
import { BaseData } from "../store/AppState";
import { SetModalInfo } from "../store/Store";
import { AnalyzeResults } from "./importAnalyseSheet";
import { importBHH_CSV } from "./importBHH";
import { importHOLTitGr_PDF } from "./importHOLTitGr";
import { importHOLXSLX } from "./importHOLXSLX";
import { importSN_XSLX } from "./importSN_XLSX";

type Importer = (
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (localData: BaseData) => void,
  setModalInfo: SetModalInfo,
  appState: AppState
) => Promise<void>;

type XlsxImporter = (
  file: File,
  workbook: Workbook,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (localData: BaseData) => void,
  appState: AppState
) => void;

const xlsxImporters: XlsxImporter[] = [
  importHOLXSLX,
  importSN_XSLX
];

/** Import methods */
const importers: Importer[] = [
  importXLSX,
  importBHH_CSV,
  importHOLTitGr_PDF
];

async function importFile(
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (localData: BaseData) => void,
  setModalInfo: SetModalInfo,
  appState: AppState
): Promise<void> {
  for (const importer of importers) {
    try {
      
      await importer(
        file,
        setCurrentUser,
        setLocalData,
        setModalInfo,
        appState
      );
      return Promise.resolve(); //success
    } catch (e) {
      console.log(e);
    }
  }
  return Promise.reject(
    Error(
      `Datei ${file.name} ist kein bekanntes Importformat.`
    )
  );
}

function importXLSX(
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (localData: BaseData) => void,
  setModalInfo: SetModalInfo,
  appState: AppState
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setModalInfo(`Lade ${file.name} in den Browser (importXLSX) ... `);
    
    const r = new FileReader();
    r.onload = async (evt) => {
      if (
        evt.target &&
        evt.target.result &&
        evt.target.result instanceof ArrayBuffer
      ) {
        try {
          const wb = new Workbook();
          const workbook = await wb.xlsx.load(
            evt.target.result
          );
          let finished = false;
          for (const importer of xlsxImporters) {
            if (!finished) {
              try {
                setModalInfo(`Lade ${file.name} in den Browser (${importer.name}) ... `);
    
                importer(
                  file,
                  workbook,
                  setCurrentUser,
                  setLocalData,
                  appState
                );
                finished = true;
                resolve(); //success
                return;
              } catch (e) {
                console.log(e);
              }
            }
          }
          reject(
            new Error(
              `Datei ${file.name} ist kein dem Prototyp bekanntes XLSX-Format`
            )
          );
        } catch (excelError) {
          // Fehler beim Laden des Workbooks
          reject(excelError);
        }
      } // if evt.target ...
      else
        reject(
          new Error(
            `Laden der Datei ${file.name} hat nicht funktioniert.`
          )
        );
    };
    r.readAsArrayBuffer(file);
  });
}

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
  loadingFinished?: () => void
): void => {
  const files = evt.target.files;
  if (files) {
    const file = files[0];

    // this is necessary, because Chrome/Chromium/Edge does not fire
    // onchange, if the same file is selected again.
    evt.target.value = "";

    setModalInfo(`Lade ${file.name} in den Browser ...`);
    console.log("file", file);

    importFile(
      file,
      setCurrentUser,
      setLocalData,
      setModalInfo,
      appState
    )
      .then(() => {
        setModalInfo(null);
        if (loadingFinished) loadingFinished();
      }) // clear ModalInfo, if no error occured.
      .catch((reason) => {
        showError(
          "Fehler beim Laden der Datei: " + reason,
          file.name
        );
        if (loadingFinished) loadingFinished();
      }); // catch reason
  }
};
