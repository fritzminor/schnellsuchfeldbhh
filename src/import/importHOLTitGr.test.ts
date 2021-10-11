import { analyzePDF } from "./analyzePDF";
import { readFileSync, access, constants, realpathSync } from "fs";

describe("importHOLTitGr", () => {
  test("analyzePDF - simple testPDF", async () => {
    expect.assertions(1);
    const pdfFileName = "public/testmaterial/TestPDF.pdf";
    const pdfData = readFileSync(pdfFileName);
    const pdfWorkerFileName = realpathSync( "node_modules/pdfjs-dist/legacy/build/pdf.worker.js");
    access(pdfWorkerFileName, constants.R_OK, (err) => {
      if (err) {
        console.error(`PDFWorker ${pdfWorkerFileName} is not readable`
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
      expect(tabContent.pages[0].rows[0].cells[0].text).toEqual("SchnellsuchfeldBHH");
      
    } catch (e) {
      console.error(e);
      throw e;
    }
  });
});
