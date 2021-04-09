import { Workbook } from "exceljs";
import {
  AppState,
  getFilteredHhstArray
} from "../store/AppState";

export type SingleAnalyze = {
  worksheetId: number;
  /** e.g. "A1" for the upper left cell */
  cellPos: string;

  /** e.g. "A=Epl:02 Kap:04"  for the expenses in Kap 02 04 */
  analyzeExpression: string;

  /** The expenses */
  analyzeResult: number | string;
};

export type AnalyzeResults = {
  type: "AnalyzeResults";
  file: File;
  analysis: SingleAnalyze[];
  xlsxDownloadBuffer: ArrayBuffer;
};

export async function importAnalyzeSheet(
  file: File,
  workbook: Workbook,
  appState: AppState
): Promise<AnalyzeResults> {
  const baseData=appState.derived.baseData;
  let foundExpression = false;
  const analysis: SingleAnalyze[] = [];
  const analyzeRegEx = /^([aAbBeElLzZ])=(.*)$/;

  workbook.eachSheet((worksheet, worksheetId) => {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const analyzeExpression = cell.result || cell.value;
        if (typeof analyzeExpression === "string") {
          const regExArr = analyzeRegEx.exec(
            analyzeExpression
          );
          if (regExArr) {
            const pushResult = (
              analyzeResult: string | number
            ) => {
              cell.value = analyzeResult;
              const cellAnalysis: SingleAnalyze = {
                worksheetId,
                cellPos: cell.address,
                analyzeExpression,
                analyzeResult
              };
              analysis.push(cellAnalysis);
              foundExpression = true;
            };
            const upperCharacter = regExArr[1].toUpperCase();
            switch (upperCharacter) {
              case "B":
                pushResult(regExArr[2]);
                break;
              case "E": // Einnahmen => revenues
              case "A": // Ausgaben => expenses
                {
                  try {
                    const { totals } = getFilteredHhstArray(
                      baseData,
                      regExArr[2]
                    );
                    if (upperCharacter == "A")
                      pushResult(totals.expenses);
                    else pushResult(totals.revenues);
                  } catch (err) {
                    console.log(err);
                    pushResult(err.message);
                  }
                }
                break;
              default:
                console.log(
                  "No analyze term:" + analyzeExpression
                );
            }
          }
        }
      });
    });
  });
  if (foundExpression) {
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const xlsxDownloadBuffer = await workbook.xlsx.writeBuffer();
    return {
      type: "AnalyzeResults",
      file,
      analysis,
      xlsxDownloadBuffer
    };
  } else
    throw new Error(
      `Kein Auswertungsausdruck in ${file.name}.`
    );
}
