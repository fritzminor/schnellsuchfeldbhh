import { HHSt } from "../store/HHStType";
import Papa from "papaparse";
import { emptyBaseData } from "../store/AppState";
import { Store } from "../store/Store";
import { errorMessage } from "../utils/errorMessage";
import { VersionDescriptor } from "../store/versions/VersionsTypes";
import { cloneDeep } from "lodash";

type CsvRow = {
  einzelplan: string;
  "einzelplan-text": string;
  kapitel: string;
  "kapitel-text": string;
  titel: string;
  funktion: string;
  soll: string;
  "titel-text": string;
  titelgruppe: string;
  "tgr-text": string;
};

export type ImportBHH_CSV_StorePart = Pick<
  Store,
  "setCurrentUser" | "addImportData" | "setModalInfo"
>;

/** imports data from files following the format of
 * the "UTF8-CSV"-files at
 * https://www.bundeshaushalt.de/download
 *
 * @param file
 * @param store - subset of {@link Store }
 */
export function importBHH_CSV(
  file: File | NodeJS.ReadableStream,
  { addImportData, setModalInfo }: ImportBHH_CSV_StorePart
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const importedData = cloneDeep(emptyBaseData);
    const { eplMap, kapMap, tgMap, hhsts } = importedData;
    const fileName =
      file instanceof File
        ? file.name
        : (file as unknown as { path: string }).path;
    const regExFileName =
      /(hh|haushalt)_(\d{4})_?.*csv$/.exec(fileName);
    if (!regExFileName)
      reject(
        new Error(`Dateinamen ${fileName} nicht erkannt`)
      );
    else {
      importedData.firstYear = parseInt(
        regExFileName[2],
        10
      );

      // let rowNr = 0;
      let errMessage: string | null = null;

      const parseRow = (
        row: Papa.ParseResult<CsvRow>,
        parser: Papa.Parser
      ): void => {
        try {
          if (row.errors.length > 0) {
            throw new Error(
              `Fehler beim Lesen von ${fileName}. ${JSON.stringify(
                row.errors
              )}`
            );
          }

          //      if (rowNr < 3) console.log(row);

          const data = row.data as unknown as CsvRow;
          if (!data) {
            throw new Error(
              `Fehler beim Lesen von ${fileName}: ${JSON.stringify(
                row
              )}`
            );
          }
          const epl = data.einzelplan.padStart(2, "0");
          eplMap[epl] = {
            short: epl,
            name: data["einzelplan-text"]
          };

          const kapitel = data.kapitel.padStart(4, "0");
          if (kapitel.substr(0, 2) !== epl)
            throw new Error(
              `Fehler beim Lesen von ${fileName}: Kapitelnummer ${kapitel} passt nicht zu Einzelplan ${epl}. `
            );
          const kap = kapitel.substr(2);
          kapMap[kapitel] = {
            short: kap,
            name: data["kapitel-text"]
          };

          const titel = data.titel.padStart(5, "0");
          const gruppe = titel.substr(0, 3);
          const suffix = titel.substr(3);
          const fkz = data.funktion.padStart(3, "0");
          const sollJahr1 = parseInt(data.soll, 10);
          const zweck = data["titel-text"];

          const expense = gruppe.charAt(0) >= "4";
          const tgNr = data["titelgruppe"]
            ? data["titelgruppe"].padStart(2, "0")
            : "";
          const tgKey = tgNr
            ? `${epl}${kap}TG${tgNr}${expense ? "A" : "E"}`
            : undefined;
          if (tgKey) {
            if (!tgMap[tgKey]) {
              const tgName = data["tgr-text"];
              tgMap[tgKey] = {
                short: tgNr,
                name: tgName
              };
            }
          }

          const hhst: HHSt = {
            type: "hhst",
            epl,
            kap,
            gruppe,
            suffix,
            fkz,
            tgKey,
            zweck,
            expense,
            sollJahr1
          };
          hhsts.push(hhst);
          // rowNr++;
        } catch (reason) {
          errMessage = errorMessage(reason);
          parser.abort();
        }
      };

      Papa.parse(file, {
        step: parseRow,
        header: true,
        skipEmptyLines: "greedy",
        error: (error) => {
          setModalInfo(
            `importBHH: Fehler beim Parsen der Datei ${
              fileName || "(?)"
            }: ${JSON.stringify(error, undefined, "  ")}`
          );
          reject(error);
        },
        complete: (results) => {
          if (results.meta.aborted) {
            const msg =
              errMessage || "FEHLER: Ursache unbekannt.";
            setModalInfo(msg);
            reject(new Error(msg));
          } else {
            const lastModified =
              "lastModified" in file
                ? (file as File).lastModified
                : new Date().getTime();
            const versionDesc: VersionDescriptor = {
              orgBudgetName: "Bundeshaushalt",
              budgetName: `HH ${importedData.firstYear}`,
              lineName: `Arbeitsstand`,
              modStateName: `geändert am ${new Date(
                lastModified
              ).toLocaleString()}`,
              timestamp: lastModified
            };
            importedData.versionDesc = versionDesc;
            addImportData(importedData);
            resolve();
          }
        }
      });
    }
  });
}
