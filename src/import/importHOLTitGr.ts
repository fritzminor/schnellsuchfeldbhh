import { UserName } from "../navigation/UsersTypes";
import { AppState, SectionMap } from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { SetModalInfo, Store } from "../store/Store";
import {
  analyzePDF,
  openFile,
  TabularContent
} from "./analyzePDF";

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
      file.name
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

export function analyzeTabContent(
  tabularContent: TabularContent,
  fileName: string
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
  console.log("tabularContent", tabularContent);
  let lastTg: SectionMap["any"] | null = null;
  tabularContent.pages.forEach((page) => {
    let status = 1; // 0 started is not relevant

    // 1 looking for column headers
    // 2 numbered column headers - not relevant
    // 3 actual TG rows
    // 4 skip the rest

    let textColNo = 0;

    page.rows.forEach((row) => {
      switch (status) {
        case 1:
          console.log(
            "status 1 p",
            page.pagenr,
            "no ",
            textColNo,
            row
          );
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
          )
            textColNo = 8;
          if (
            row.cells[9]?.text &&
            row.cells[9].text === "Text"
          )
            textColNo = 9;
          //console.log("cells[10] missing", row, page);
          console.log("check", row);
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
           */
          const subTgNr = row.cells[4].text;
          const expenseChr = row.cells[6].text; // E for revenue or A for expense
          const tgNr = row.cells[8].text;
          const tgText = row.cells[textColNo].text;

          if (subTgNr) {
            //

            const subTgKey = `${kapitel}TG${subTgNr}${expenseChr}`;
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
            } else subTgKeys2TgKeys[subTgKey] = tgKey;
            if (tgText) {
              if (tgMap[tgKey]) {
                if (tgMap[tgKey].name !== tgText) {
                  console.log(`Warnung für ${fileName} Seite ${page.pagenr}: 
                  Text für Titelgruppe ${tgKey} (${subTgKey}) unterschiedlich: ${tgText} anstatt ${tgMap[tgKey].name}.`);
                }
              } else {
                // if (tgNr)
                if (lastTg && !lastTg.name)
                {
                  //console.log("tgMap", tgMap);
                  console.log("tgKey",tgKey);
                  console.log("lastTG",lastTg)
                  console.error("Row: ",row)
                  throw new Error(`Fehler in ${fileName} Arbeitsblatt ${page.pagenr} bei TG ${lastTg.short}: 
                     Keine Titelgruppennummer.`);
                }
                else {
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
                if (lastTg && !lastTg.name)
                  throw new Error(`Fehler in ${fileName} Arbeitsblatt ${page.pagenr} bei TG ${lastTg.short}: 
                     Keine Titelgruppennummer.`);
                else {
                  lastTg = {
                    short: tgNr || subTgNr,
                    name: ""
                  };
                  console.log("Setting lastTG with empty name ", row);

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
            lastTg.name += tgText;
          } else status = 4; // skip remaining rows
        }
      }
    }); // rows.forEach
  });
  return {
    tgMap,
    subTgKeys2TgKeys
  };
}

function compareHHSt(a: HHSt, b: HHSt): number {
  const cmpEplKap = (a.epl + a.kap).localeCompare(
    b.epl + b.kap
  );
  if (cmpEplKap) return cmpEplKap;

  if (a.expense) {
    if (!b.expense) return 1; // a comes after b
  } else {
    // a is revenue
    if (b.expense) return -1; // a comes before b
  }

  if (a.tgKey) {
    if (b.tgKey) {
      const cmpTgKey = a.tgKey.localeCompare(b.tgKey);
      if (cmpTgKey) return cmpTgKey;
    } else {
      // a has tgKey, b has not.
      return 1; // a comes after b
    }
  } else {
    // a.tgKey is undefined
    if (b.tgKey) {
      // a has got no tgKey, b has got one.
      return -1; // b comes after a
    }
  }

  const cmpTitelNr = (a.gruppe + a.suffix).localeCompare(
    b.gruppe + b.suffix
  );
  if (cmpTitelNr === 0) {
    console.log("Equal:", a, b);
  }
  return cmpTitelNr;
}
