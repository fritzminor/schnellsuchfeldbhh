import { UserName } from "../navigation/UsersTypes";
import { HHSt } from "../store/HHStType";
import Papa from "papaparse";

type CsvRow = {
  einzelplan: string;
  kapitel: string;
  titel: string;
  funktion: string;
  soll: string;
  "titel-text": string;
};

/** imports data from files following the format of
 * the "UTF8-CSV"-files at
 * https://www.bundeshaushalt.de/download
 */
export function importBHH_CSV(
  file: File,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (hhsts: HHSt[], firstYear: number) => void,
  setModalInfo: (modalInfo: string) => void
): void {
  const hhsts: HHSt[] = [];

  const regExFileName = /hh_(\d{4})_.*csv$/.exec(file.name);
  if (!regExFileName)
    throw new Error(
      `Dateinamen ${file.name} nicht erkannt`
    );
  const firstYear = parseInt(regExFileName[1], 10);

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
      const kapitel = data.kapitel.padStart(4, "0");
      if (kapitel.substr(0, 2) !== epl)
        throw new Error(
          `Fehler beim Lesen von ${file.name}: Kapitelnummer ${kapitel} passt nicht zu Einzelplan ${epl}. `
        );
      const kap = kapitel.substr(2);

      const titel = data.titel.padStart(5, "0");
      const gruppe = titel.substr(0, 3);
      const suffix = titel.substr(3);
      const fkz = data.funktion.padStart(3, "0");
      const sollJahr1 = parseInt(data.soll, 10);
      const zweck = data["titel-text"];

      const hhst: HHSt = {
        epl,
        kap,
        gruppe,
        suffix,
        fkz,
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
        setLocalData(hhsts, firstYear);
        setCurrentUser("LokaleDaten");
      }
    }
  });
}
