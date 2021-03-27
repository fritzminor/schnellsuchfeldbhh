import { UserName } from "../navigation/UsersTypes";
import { HHSt } from "../store/HHStType";
import Papa from "papaparse";
import {
  emptyBaseData
} from "../store/AppState";
import { Store } from "../store/Store";

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

/** imports data from files following the format of
 * the "UTF8-CSV"-files at
 * https://www.bundeshaushalt.de/download
 */
export function importBHH_CSV(
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: Store["setLocalData"],
  setModalInfo: (modalInfo: string) => void
): void {
  const importedData = { ...emptyBaseData };
  const { eplMap, kapMap, tgMap, hhsts } = importedData;

  const regExFileName = /hh_(\d{4})_.*csv$/.exec(file.name);
  if (!regExFileName)
    throw new Error(
      `Dateinamen ${file.name} nicht erkannt`
    );
  importedData.firstYear = parseInt(regExFileName[1], 10);

  let rowNr = 0;
  let errMessage: string | null = null;

  const parseRow = (
    row: Papa.ParseResult<CsvRow>,
    parser: Papa.Parser
  ): void => {
    try {
      if (row.errors.length > 0) {
        throw new Error(
          `Fehler beim Lesen von ${
            file.name
          }. ${JSON.stringify(row.errors)}`
        );
      }
      if (rowNr < 3) console.log(row);
      const data = (row.data as unknown) as CsvRow;
      if (!data) {
        throw new Error(
          `Fehler beim Lesen von ${
            file.name
          }: ${JSON.stringify(row)}`
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
          `Fehler beim Lesen von ${file.name}: Kapitelnummer ${kapitel} passt nicht zu Einzelplan ${epl}. `
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

      const tgNr = data["titelgruppe"]?data["titelgruppe"].padStart(2, "0"):"";
      const tgKey = tgNr
        ? `${epl}${kap}TG${tgNr}`
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
        expense: gruppe.charAt(0) >= "4",
        sollJahr1
      };
      hhsts.push(hhst);
      rowNr++;
    } catch (reason) {
      errMessage = reason.message;
      parser.abort();
    }
  };

  Papa.parse(file, {
    step: parseRow,
    header: true,
    skipEmptyLines: "greedy",
    error: (error, file) => {
      setModalInfo(
        `Fehler beim Laden der Datei ${
          (file && file.name) || "(?)"
        }: ${JSON.stringify(error)}`
      );
    },
    complete: (results) => {
      if (results.meta.aborted)
        setModalInfo(
          errMessage || "FEHLER: Ursache unbekannt."
        );
      else {
        setLocalData(importedData);
        setCurrentUser("LokaleDaten");
      }
    }
  });
}
