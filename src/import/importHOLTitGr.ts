import { AppState, SectionMap } from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { Store } from "../store/Store";
import { VersionDescriptor } from "../store/versions/VersionsTypes";
import {
  analyzePDF,
  openFile,
  TabularContent
} from "./analyzePDF";
import { compareHHSt } from "../store/compareHHSt";

/** This method expects a HOL-PDF of the Titelgruppen in DIN A4 landscape.
 * Before calling this method, the base-hhsts has to be loaded from a
 * HOL-XLSX. So, for the user it is a two steps process:
 * Firstly, import HOL-XLSX via importHOLXLSX
 * Secondy, import HOL-TG-PDF via importHOLTitGr
 */
export async function importHOLTitGr_PDF(
  file: File,
  {setCurrentUser,addImportData,setModalInfo}:Store, 
  appState: AppState
): Promise<void> {
  try {
    const oldHhsts: HHSt[] =
      appState.derived.currentBaseData.hhsts;

    // TODO: possibly move to a position, where file format has already been checked
    if (appState.currentUser !== "LokaleDaten")
      throw new Error(
        "Bitte vorm Importieren der Titelgruppen die Haushaltsstellen importieren."
      );

    const tabularContent = await openFile(
      file,
      analyzePDF,
      setModalInfo
    );

    const { tgMap, subTgKeys2TgKeys } = analyzeTabContent(
      tabularContent,
      file.name,
      console.warn
    );

    const hhsts: HHSt[] = oldHhsts.map((hhst) => ({
      ...hhst,
      tgKey:
        subTgKeys2TgKeys[
          `${hhst.epl}${hhst.kap}TG${hhst.suffix}${
            hhst.expense ? "A" : "E"
          }`
        ]
    }));

    console.log("tgMap", tgMap);

    hhsts.sort(compareHHSt);

    const oldBaseData=appState.derived.currentBaseData;

    const versionDesc: VersionDescriptor = {
      orgBudgetName: "Staatshaushalt",
      budgetName: `HH ${oldBaseData.firstYear}`,
      lineName: `Arbeitsstand`,
      modStateName: `geändert am ${new Date(
        file.lastModified
      ).toLocaleString()}`,
      timestamp: file.lastModified
    };

    addImportData({
      ...oldBaseData,
      versionDesc,
      tgMap,
      hhsts
    });
    setCurrentUser("LokaleDaten");
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

/** analyzes PDF content in table form
 * 
 * @param tabularContent 
 * @param fileName 
 * @param importWarning - is called with a warning (not an error) when importing
 * @returns tgMap and map of subTgKeys to tgKeys
 */
export function analyzeTabContent(
  tabularContent: TabularContent,
  fileName: string, importWarning: (msg:string) => void
): {
  tgMap: SectionMap;
  subTgKeys2TgKeys: {
    [subTgKey: string]: string;
  };
} {
  const tgMap: SectionMap = {};

  const subTgKeys2TgKeys: {
    [subTgKey: string]: string;
  } = {};
  // console.log("tabularContent", tabularContent);
  let lastTg: SectionMap["any"] | null = null;
  tabularContent.pages.forEach((page) => {
    let status = 1; // 0 started is not relevant

    // 1 looking for column headers
    // 2 numbered column headers - not relevant
    // 3 actual TG rows
    // 4 skip the rest

    let textColNo = 0;
    let tgColNo = 0;

    //console.log("page begin ",lastTg);
    page.rows.forEach((row) => {
      switch (status) {
        case 1:
          // console.log(
          //   "status 1 p",
          //   page.pagenr,
          //   "no ",
          //   textColNo,
          //   row
          // );
          if (
            !(
              (
                row.cells[1].text === "Kapitel" &&
                row.cells[3].text === "TglNr" &&
                row.cells[5].text === "E/A" &&
                row.cells[7].text === "Titelgruppe"
              ) /*||
                (row.cells[4].text === "TglNr" &&
                  row.cells[6].text === "E/A" &&
                  row.cells[8].text === "Titelgruppe")*/
            )
          ) {
            console.log(
              `Spaltenfehler auf Seite ${page.pagenr}`,
              row
            );
            throw new Error("Spalten nicht erkannt.");
          }
          if (
            row.cells[8]?.text &&
            row.cells[8].text === "Text"
          ){
            // probably this page does not have any tgNr
            tgColNo=7; 
            textColNo = 8;
          }
          if (
            row.cells[9]?.text &&
            row.cells[9].text === "Text"
          )
          {
            tgColNo = 8;
            textColNo = 9;
          }
          //console.log("cells[10] missing", row, page);
          // console.log("check", row);
          if (textColNo) status = 3;
          else status = 4; // skip the rest
          break;

        case 3: {
          const kapitel = row.cells[2].text?.padStart(
            4,
            "0"
          );
          /**
           *  Die Untertitelnummer, bei der Titelgruppe 65-67 kann die
           *  Untertitelnummer 65, 66 oder 67 sein; die Titelgruppennummer
           *  ist immer 65.
           *
           *  Im PDF erscheint immer eine Untertitelnummer. Die zugehörige
           *  Titelnummer erscheint dagegen nur, wenn es zu einer
           *  Titelgruppe mehrere Untertitelnummern gibt.
           */
          const subTgNr = row.cells[4].text;
          const expenseChr = row.cells[6].text; // E for revenue or A for expense
          const tgNr = row.cells[tgColNo].text;
          const tgText = row.cells[textColNo].text;

          if (subTgNr) {
            const subTgKey = `${kapitel}TG${subTgNr}${expenseChr}`;

            /** tgKey, z.B. 1303TG71A. Sie wird aus der tgNr, hilfsweise der
             *  subTgNr erstellt.
             */
            const tgKey = `${kapitel}TG${
              tgNr ? tgNr : subTgNr
            }${expenseChr}`;

            const matchingTgKey =
              subTgKeys2TgKeys[subTgKey];
            if (matchingTgKey) {
              if (tgKey !== matchingTgKey) {
                throw new Error(`Fehler in ${fileName} Seite ${page.pagenr}: 
                Unterschiedliche Titelgruppe für ${subTgKey}: ${matchingTgKey} statt ${tgKey}.`);
              }
            } else if (
              expenseChr !== "A" &&
              expenseChr !== "E"
            )
              throw new Error(`Fehler in ${fileName} Seite ${page.pagenr}: 
              Keine Ausgaben/Einnahmen-Kennzeichnung für ${tgKey}.`);
            else subTgKeys2TgKeys[subTgKey] = tgKey;

            if (tgText) {
              if (tgMap[tgKey]) {
                // check that different subTgNumbers of one tgNumber have the same tgText
                //    (if any, usually there is only one tgText for multiple subTgNumbers)
                if (tgMap[tgKey].name !== tgText) {
                  importWarning(`Warnung für ${fileName} Seite ${page.pagenr}: 
                  Text für Titelgruppe ${tgKey} (${subTgKey}) unterschiedlich: ${tgText} anstatt ${tgMap[tgKey].name}.`);
                }
              } else {
                // subTgNr and tgText available, first occurence of tgKey
                if (lastTg && !lastTg.name) {
                  // is lastTG incomplete?
                  console.error("tgKey", tgKey);
                  console.error("lastTG", lastTg);
                  console.error("Row: ", row);
                  throw new Error(`Fehler in ${fileName} Seite ${page.pagenr} bei TG ${lastTg.short}: 
                     Kein Titelgruppentext.`);
                } else {
                  lastTg = {
                    short: tgNr || subTgNr,
                    name: tgText
                  };

                  tgMap[tgKey] = lastTg;
                  /*  else
                  throw new Error(`Fehler in ${fileName} Arbeitsblatt ${page.pagenr} bei tgKey ${tgKey}: 
                     Keine Titelgruppennummer.`);*/
                }
              }
            } else {
              // no text, but tgNr or subTgNr
              if (!tgMap[tgKey]) {
                // first occurence of tgKey

                if (lastTg && !lastTg.name)
                  throw new Error(`Fehler in ${fileName} Seite ${page.pagenr} bei TG ${lastTg.short}: 
                     Keine Titelgruppennummer.`);
                else {
                  lastTg = {
                    short: tgNr || subTgNr,
                    name: ""
                  };
                  tgMap[tgKey] = lastTg;
                }
              }
              /*throw new Error(`Fehler in ${fileName} Arbeitsblatt ${page.pagenr}: 
                Kein Text für Titelgruppe für ${tgKey}.`); */
            }
          }
          // empty line or only page count
          else if (
            lastTg &&
            !kapitel &&
            !expenseChr &&
            !tgNr &&
            tgText
          ) {
            // lastTg available and
            // empty line, but text
            //
            // The text description of the TG has a second line.
            lastTg.name += (lastTg.name?" ":"")+tgText;
          } else status = 4; // skip remaining rows

        } // case status===3
      } // switch status
    }); // rows.forEach
  });
  return {
    tgMap,
    subTgKeys2TgKeys
  };
}


