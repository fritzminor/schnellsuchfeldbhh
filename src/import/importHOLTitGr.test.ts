import { analyzePDF } from "./analyzePDF";
import {
  readFileSync,
  access,
  constants,
  realpathSync
} from "fs";
import { reject } from "lodash";
import { analyzeTabContent } from "./importHOLTitGr";

function existsPromise(filename: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    access(filename, constants.R_OK, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
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
    const pdfFileName =
      "public/testmaterial/titGrTest.link.pdf";
    try {
      await existsPromise(pdfFileName);

      expect.assertions(2);
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

      const firstRow = tabContent.pages[0].rows[0];
      console.log(firstRow);
      const secondRow = tabContent.pages[0].rows[1];
      console.log(secondRow);
      const thirdRow = tabContent.pages[0].rows[2];
      console.log(thirdRow);
      const fourthRow = tabContent.pages[0].rows[3];
      console.log(fourthRow);
      expect(firstRow.cells[1].text).toEqual("Kapitel");
      expect(secondRow.cells[2].text).toEqual("0101");

      const tgInfo=analyzeTabContent(tabContent,pdfFileName);
      expect(tgInfo).toEqual("viele Tgs");
    } catch (e) {
      if (e.errno && e.path) {
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
