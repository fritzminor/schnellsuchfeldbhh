import { Workbook } from "exceljs";
import { cloneDeep } from "lodash";
import {
  emptyBaseData,
  SectionMap
} from "../store/AppState";
import { HHSt } from "../store/HHStType";
import { Store } from "../store/Store";
import { VersionDescriptor } from "../store/versions/VersionsTypes";

/** imports data from files following the format of
 * the "Maschinenlesbare Daten"-XLSX-files at
 * https://www.finanzen.sachsen.de/entwurf-doppelhaushalt-2021-2022-6436.html
 */
export function importSN_XSLX(
  file: File,
  workbook: Workbook,
  { addImportData }: Store
): void {
  console.log("Loaded", workbook);
  const worksheet = workbook.worksheets[0];
  if (worksheet) {
    const hhsts: HHSt[] = [];
    const tgMap: SectionMap = {};

    let status = 1; // 0 started - irrelevant

    // 1 looking for column headers
    // 2 numbered column headers - irrelevant
    // 3 actual HHSt rows
    let firstYear = -1;
    worksheet.eachRow((row) => {
      switch (status) {
        case 1: // 1 - column headers
          if (
            !(
              row.getCell(1).text === "Einzelplan" &&
              row.getCell(2).text === "Bezeichnung" &&
              row.getCell(3).text === "Kapitel" &&
              row.getCell(4).text === "Bezeichnung" &&
              (row.getCell(6).text === "Titelgruppe" ||
                row.getCell(6).text === "TG") &&
              row.getCell(7).text === "Bezeichnung" &&
              row.getCell(8).text === "Titel" &&
              (row.getCell(9).text ===
                "Funktionenkennzahl" || row.getCell(9).text === "FKZ") &&
              (row.getCell(10).text ===
                "Bezeichnung Funktionenkennzahl" || row.getCell(10).text ===
                "Bezeichnung FKZ" ) &&
              row.getCell(11).text === "Zweckbestimmung" &&
              row.getCell(12).text.startsWith("Ansatz ")
            )
          ) {
            console.log("Spaltenfehler", row);
            throw new Error("Spalten nicht erkannt.");
          }
          firstYear = parseInt(
            row.getCell(12).text.substr("Ansatz ".length, 4)
          );
          status = 3;
          break;
        case 3: {
          // 3 - actual HHSt rows
          const epl = row.getCell(1).text;
          const kapitel = row.getCell(3).text;
          const kapArray = /^(\d\d)(\d\d)$/.exec(kapitel);
          if (!kapArray || kapArray[1] !== epl) {
            console.log("Kapitel nicht erkannt.", row);
            throw new Error(
              `Fehler in Zeile ${row.number}: Kapitel nicht erkannt.`
            );
          }
          const kap = kapArray[2];

          const titel = row.getCell(8).text;
          const titelArray = /^(\d\d\d)(\d\d)$/.exec(titel);
          if (!titelArray) {
            console.log("Titel nicht erkannt.", row);
            throw new Error(
              `Fehler in Zeile ${row.number}: Titel nicht erkannt.`
            );
          }

          const gruppe = titelArray[1];
          const fkz = row.getCell(9).text;
          if (!fkz.match(/^\d\d\d$/)) {
            console.log("FKZ nicht erkannt.", row);
            throw new Error(
              `Fehler in Zeile ${row.number}: Funktionenkennzahl nicht erkannt.`
            );
          }

          const expense = gruppe.charAt(0) >= "4";

          const tgNr = row.getCell(6).text;
          const tgKey = tgNr
            ? `${epl}${kap}TG${tgNr}${expense ? "A" : "E"}`
            : undefined;
          if (tgKey) {
            if (!tgMap[tgKey]) {
              const tgName = row.getCell(7).text;
              tgMap[tgKey] = {
                short: tgNr,
                name: tgName
              };
            }
          }

          const sollJahr1CellValue = row.getCell(12).value;
          const sollJahr1 = sollJahr1CellValue
            ? sollJahr1CellValue.valueOf()
            : 0;

          const hhst: HHSt = {
            type: "hhst",
            epl,
            kap,
            gruppe,
            tgKey,
            suffix: titelArray[2],
            fkz,
            zweck: row.getCell(11).text,
            expense,
            sollJahr1:
              typeof sollJahr1 === "number" ? sollJahr1 : 0
          };
          hhsts.push(hhst);
        }
      }
    });

    const versionDesc: VersionDescriptor = {
      orgBudgetName: "Staatshaushalt",
      budgetName: `DHH ${firstYear}/${firstYear + 1}`,
      lineName: `Stand`,
      modStateName: `geändert am ${new Date(
        file.lastModified
      ).toLocaleString()}`,
      timestamp: file.lastModified
    };

    addImportData({
      ...cloneDeep(emptyBaseData),
      versionDesc,
      hhsts,
      tgMap,
      firstYear
    });
  } else
    throw new Error(
      `Konnte erstes Arbeitblatt in ${file.name} nicht finden.`
    );
}
