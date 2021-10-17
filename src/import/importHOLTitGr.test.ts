import { analyzePDF, TabularContent } from "./analyzePDF";
import {
  readFileSync,
  access,
  constants,
  realpathSync
} from "fs";
import { reject } from "lodash";
import { analyzeTabContent } from "./importHOLTitGr";
import { Workbook } from "exceljs";

function existsPromise(filename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    access(filename, constants.R_OK, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function createExcel(data: TabularContent) {
  const workbook = new Workbook();
  // Force workbook calculation on load
  workbook.calcProperties.fullCalcOnLoad = true;
  const sheet = workbook.addWorksheet("TabularContent");
  sheet.addRow(["p#", "Seite", "Row#", "y", "Cell#"]);
  data.pages.forEach((page, index) => {
    sheet.addRow([index, page.pagenr]);
    page.rows.forEach((row, rowNo) => {
      const rowArr: (string | number)[] = [
        index,
        page.pagenr,
        rowNo,
        row.y
      ];
      row.cells.forEach((cell, cellNo) => {
        rowArr.push(cellNo, cell.x, cell.text || "null");
      });
      sheet.addRow(rowArr);
    });
  });
  return workbook;
}

describe("importHOLTitGr", () => {
  test("analyzePDF - simple testPDF", async () => {
    expect.assertions(1);
    const pdfFileName = "public/testmaterial/TestPDF.pdf";
    const pdfData = readFileSync(pdfFileName);
    const pdfWorkerFileName = realpathSync(
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.js"
    );
    access(pdfWorkerFileName, constants.R_OK, (err) => {
      if (err) {
        console.error(
          `PDFWorker ${pdfWorkerFileName} is not readable`
        );
        throw err;
      }
    });
    try {
      const tabContent = await analyzePDF(
        pdfData.buffer,
        pdfFileName,
        console.error,
        pdfWorkerFileName
      );
      expect(
        tabContent.pages[0].rows[0].cells[0].text
      ).toEqual("SchnellsuchfeldBHH");
    } catch (e) {
      console.error(e);
      throw e;
    }
  });


  // This test is skipped, if titGrTest.link.pdf is missing
  test("analyzePDF plus analyzeTabContent - titGrPDF", async () => {
    const pdfFileName = //"/tmp/p27-28.pdf";
          "public/testmaterial/titGrTest.link.pdf";
    try {
      await existsPromise(pdfFileName);

      expect.assertions(8);
      const pdfData = readFileSync(pdfFileName);
      const pdfWorkerFileName = realpathSync(
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.js"
      );
      const tabContent = await analyzePDF(
        pdfData.buffer,
        pdfFileName,
        console.error,
        pdfWorkerFileName
      );

      /* For debugging purposes:
      const tabContentFile = "/tmp/tabContent.xlsx";
      const workbook = createExcel(tabContent);
      await workbook.xlsx.writeFile(tabContentFile);
      */

      const firstRow = tabContent.pages[0].rows[0];
      const secondRow = tabContent.pages[0].rows[1];

      //console.log("second row: ", secondRow);

      expect(firstRow.cells[1].text).toEqual("Kapitel");

      const warnings: String[]=[]
      const tgInfo = analyzeTabContent(
        tabContent,
        pdfFileName,
        (msg)=>{warnings.push(msg)}
      );
      if(warnings.length)
        console.warn(`Warnings while importing ${pdfFileName}:`,warnings);
        
      expect(tgInfo.subTgKeys2TgKeys["1503TG81A"]).toEqual(
        "1503TG80A"
      );
      expect(tgInfo.tgMap["1277TG98A"].name.substr(0,2)).toEqual ("98"
      );

      expect(tgInfo.subTgKeys2TgKeys["1506TG79A"]).toEqual(
        "1506TG79A"
      );
      expect(tgInfo.tgMap["1505TG94A"].short).toEqual("94");
      expect(tgInfo.tgMap["1506TG78A"].short).toEqual("78");
      expect(tgInfo.tgMap["1506TG80A"].name.length).toBeGreaterThan(30);
      expect(tgInfo.tgMap["1506TG79A"].name.length).toBeGreaterThan(100);
    } catch (e) {
      if (e && (e as any).errno && (e as any).path) {
        console.log(
          `Could not find file ${pdfFileName}. Skipping test.`
        );
      } else {
        console.error(e);
        throw e;
      }
    }
  });
});
