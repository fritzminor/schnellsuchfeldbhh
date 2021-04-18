import { UserName } from "../navigation/UsersTypes";
import { AppState, SectionMap } from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { SetModalInfo, Store } from "../store/Store";
import { analyzePDF, openFile } from "./analyzePDF";

/** This method expects a HOL-PDF of the Titelgruppen in DIN A4 landscape.
 * Before calling this method, the base-hhsts has to be loaded from a
 * HOL-XLSX. So, for the user it is a two steps process:
 * Firstly, import HOL-XLSX via importHOLXLSX
 * Secondy, import HOL-TG-PDF via importHOLTitGr
 */
export async function importHOLTitGr_PDF(
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: Store["setLocalData"],
  setModalInfo: SetModalInfo,
  appState: AppState
): Promise<void> {
  try {
    const oldHhsts: HHSt[] =
      appState.derived.baseData.hhsts;
    const tgMap: SectionMap = {};
    const subTgKeys2TgKeys: {
      [subTgKey: string]: string;
    } = {};

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

    console.log("tabularContent",tabularContent);
    tabularContent.pages.forEach((page) => {
      let status = 1; // 0 started is not relevant

      // 1 looking for column headers
      // 2 numbered column headers - not relevant
      // 3 actual TG rows
      // 4 skip the rest

      page.rows.forEach((row) => {
        switch (status) {
          case 1:
            if (
              !(
                row.cells[1].text === "Kapitel" &&
                ((row.cells[3].text === "TglNr" &&
                  row.cells[5].text === "E/A" &&
                  row.cells[7].text === "Titelgruppe") /*||
                  (row.cells[4].text === "TglNr" &&
                    row.cells[6].text === "E/A" &&
                    row.cells[8].text === "Titelgruppe")*/)
              )
            ) {
              console.log(
                `Spaltenfehler auf Seite ${page.pagenr}`,
                row
              );
              throw new Error("Spalten nicht erkannt.");
            }
            if (row.cells[10].text === "Text") status = 3;
            else status = 4; // skip the rest
            break;

          case 3: {
            const kapitel = row.cells[2].text?.padStart(
              4,
              "0"
            );
            const subTgNr = row.cells[4].text;
            if (subTgNr) {
              //
              const expenseChr = row.cells[6].text; // E for revenue or A for expense
              const tgNr = row.cells[8].text;
              const tgText = row.cells[10].text;

              const subTgKey = `${kapitel}TG${subTgNr}${expenseChr}`;
              const tgKey = `${kapitel}TG${
                tgNr ? tgNr : subTgNr
              }${expenseChr}`;

              const matchingTgKey =
                subTgKeys2TgKeys[subTgKey];
              if (matchingTgKey) {
                if (tgKey !== matchingTgKey) {
                  throw new Error(`Fehler in ${file.name} Seite ${page.pagenr}: 
                  Unterschiedliche Titelgruppe für ${subTgKey}: ${matchingTgKey} statt ${tgKey}.`);
                }
              } else subTgKeys2TgKeys[subTgKey] = tgKey;
              if (tgText) {
                if (tgMap[tgKey]) {
                  if (tgMap[tgKey].name !== tgText) {
                    console.log(`Warnung für ${file.name} Seite ${page.pagenr}: 
                    Text für Titelgruppe ${tgKey} (${subTgKey}) unterschiedlich: ${tgText} anstatt ${tgMap[tgKey].name}.`);
                  }
                } else {
                 // if (tgNr)
                    tgMap[tgKey] = {
                      short: tgNr || subTgNr,
                      name: tgText
                    };
                /*  else
                    throw new Error(`Fehler in ${file.name} Arbeitsblatt ${page.pagenr} bei tgKey ${tgKey}: 
                       Keine Titelgruppennummer.`);*/
                }
              } else if (!tgMap[tgKey])
                throw new Error(`Fehler in ${file.name} Arbeitsblatt ${page.pagenr}: 
                  Kein Text für Titelgruppe für ${tgKey}.`);
            }
            // empty line or only page count
            else status = 4; // skip remaining rows
          }
        }
      }); // rows.forEach
    });

    const hhsts: HHSt[] = oldHhsts.map((hhst) => ({
      ...hhst,
      tgKey:
        subTgKeys2TgKeys[
          `${hhst.epl}${hhst.kap}TG${hhst.suffix}${
            hhst.expense ? "A" : "E"
          }`
        ]
    }));

    console.log("tgMap",tgMap)

    setLocalData({
      ...appState.derived.baseData,
      tgMap,
      hhsts
    });
    setCurrentUser("LokaleDaten");
    return Promise.resolve();

  } catch (e) {
    return Promise.reject(e);
  }
}
