import { Workbook } from "exceljs";
import { UserName } from "../navigation/UsersTypes";
import { TgMap } from "../store/AppState";
import { HHSt } from "../store/HHStType";

export function importHOLXSLX(file: File, workbook: Workbook,
  setCurrentUser: (newCurrentUser: UserName) => void,
  setLocalData: (hhsts: HHSt[], tgMap: TgMap, firstYear: number) => void): void {
  console.log("Loaded", workbook);
  const worksheet = workbook.worksheets[0];
  if (worksheet) {
    const hhsts: HHSt[] = [];


    let status = 0; // 0 started



    // 1 looking for column headers 
    // 2 numbered column headers
    // 3 actual HHSt rows
    let firstYear = -1;
    worksheet.eachRow((row) => {
      switch (status) {
        case 0:
          if (!row.getCell(1).text.startsWith("Übersicht"))
            throw new Error("Datei nicht erkannt, fängt nicht mit Übersicht an.");
          status = 1;
          break;
        case 1:
          if (row.getCell(1).text === "Haushaltsstelle") {
            if (!(row.getCell(2).text === "FKZ" && row.getCell(4).text === "Zweckbestimmung" && row.getCell(5).text.startsWith("Soll "))) {
              console.log("Spaltenfehler", row);
              throw new Error("Spalten nicht erkannt.");
            }
            firstYear = parseFloat(row.getCell(5).text.substr("Soll ".length));
            status = 2;
          }
          break;
        case 2:
          if (!(row.getCell(1).text === "1")) {
            throw new Error("Spaltennummerierung fehlt.");
          }
          status = 3;
          break;
        case 3:
          {
            const haushaltsstelle = row.getCell(1).text;
            const sollJahr1CellValue = row.getCell(5).value;
            const sollJahr1 = sollJahr1CellValue ? sollJahr1CellValue.valueOf() : 0;

            const haushaltsstelleArray = /^(\d\d) (\d\d)\/(\d\d\d) (\d\d)( apl\.( AR)?)?$/.exec(haushaltsstelle);
            if (!haushaltsstelleArray)
              throw new Error(`Fehler in Zeile ${row.number}: Haushaltsstelle "${haushaltsstelle}" nicht erkannt.`);
            if (!haushaltsstelleArray[5]) { // ignore "apl" or "apl AR"
              const hhst: HHSt = {
                type: "hhst",
                epl: haushaltsstelleArray[1],
                kap: haushaltsstelleArray[2],
                gruppe: haushaltsstelleArray[3],
                suffix: haushaltsstelleArray[4],
                fkz: row.getCell(2).text,
                zweck: row.getCell(4).text,
                expense: haushaltsstelleArray[3].charAt(0) >= "4",
                sollJahr1: typeof sollJahr1 === "number" ? sollJahr1 : 0,
              };
              hhsts.push(hhst);
            }
          }
      }
    });
    setLocalData(hhsts, {}, firstYear);
    setCurrentUser("LokaleDaten");
  }
  else
    throw new Error(`Konnte erstes Arbeitblatt in ${file.name} nicht finden.`);
}
