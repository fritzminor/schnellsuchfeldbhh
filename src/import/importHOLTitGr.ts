import { Workbook } from "exceljs";
import { UserName } from "../navigation/UsersTypes";
import {
  AppState,
  SectionMap
} from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { Store } from "../store/Store";

/** This method expects a XLSX created from a HOL-PDF of the Titelgruppen.
 * Before calling this method, the base-hhsts has to be loaded from a
 * HOL-XLSX. So, for the user it is a two steps process:
 * Firstly, import HOL-XLSX via importHOLXLSX
 * Secondy, import HOL-TG-PDF2XLSX via importHOLTitGr
 */
export function importHOLTitGr(
  file: File,
  workbook: Workbook,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: Store["setLocalData"],
  appState: AppState
): void {
  // TODO: possibly move to a position, where file format has already been checked
  if (appState.currentUser !== "LokaleDaten")
    throw new Error(
      "Bitte vorm Importieren der Titelgruppen die Haushaltsstellen importieren."
    );

  const oldHhsts: HHSt[] = appState.derived.baseData.hhsts;
  const tgMap: SectionMap = {};
  const subTgKeys2TgKeys: {
    [subTgKey: string]: string;
  } = {};

  workbook.eachSheet((worksheet) => {
    let status = 1; // 0 started is not relevant

    // 1 looking for column headers
    // 2 numbered column headers - not relevant
    // 3 actual TG rows
    // 4 skip the rest

    worksheet.eachRow((row) => {
      switch (status) {
        case 1:
          if (
            !(
              row.getCell(1).text === "Kapitel" &&
              row.getCell(2).text === "TglNr" &&
              row.getCell(3).text === "E/A" &&
              row.getCell(4).text === "Titelgruppe"
            )
          ) {
            console.log("Spaltenfehler", row);
            throw new Error("Spalten nicht erkannt.");
          }
          if (row.getCell(5).text === "Text") status = 3;
          else status = 4; // skip the rest
          break;

        case 3: {
          const kapitel = row.getCell(1).text.padStart(4,"0");
          const subTgNr = row.getCell(2).text;
          if (subTgNr) {
            //
            const expenseChr = row.getCell(3).text; // E for revenue or A for expense
            const tgNr = row.getCell(4).text;
            const tgText = row.getCell(5).text;

            const subTgKey = `${kapitel}TG${subTgNr}${expenseChr}`;
            const tgKey = `${kapitel}TG${tgNr?tgNr:subTgNr}${expenseChr}`;

            const matchingTgKey =
              subTgKeys2TgKeys[subTgKey];
            if (matchingTgKey) {
              if (tgKey !== matchingTgKey) {
                throw new Error(`Fehler in ${file.name} Arbeitsblatt ${worksheet.name} Zeile ${row.number}: 
                  Unterschiedliche Titelgruppe für ${subTgKey}: ${matchingTgKey} statt ${tgKey}.`);
              }
            } else subTgKeys2TgKeys[subTgKey] = tgKey;
            if (tgText) {
              if (tgMap[tgKey]) {
                if (tgMap[tgKey].name !== tgText) {
                  console.log(`Warnung für ${file.name} Arbeitsblatt ${worksheet.name} Zeile ${row.number}: 
                    Text für Titelgruppe ${tgKey} (${subTgKey}) unterschiedlich: ${tgText} anstatt ${tgMap[tgKey].name}.`);
                }
              } else
                tgMap[tgKey] = {
                  short: tgNr,
                  name: tgText
                };
            } else if (!tgMap[tgKey])
              throw new Error(`Fehler in ${file.name} Arbeitsblatt ${worksheet.name} Zeile ${row.number}: 
              Kein Text für Titelgruppe für ${tgKey}.`);
          }
          // empty line or only page count
          else status = 4; // skip remaining rows
        }
      }
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

    setLocalData({
      ...appState.derived.baseData,
      tgMap,
      hhsts
    });
    setCurrentUser("LokaleDaten");
  });
}
