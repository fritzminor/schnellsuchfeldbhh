import { existsSync, createReadStream } from "fs";
import Papa from "papaparse";
import { importBHH_CSV, ImportBHH_CSV_StorePart } from "./importBHH";

const bhh0102csv =
  "public/testmaterial/hh_2021_n2_utf8_bpbt.csv";

test("BHH Epl 01 und 02 testmaterial exists", () => {
  const file = bhh0102csv;
  const res = existsSync(file);
  expect(res).toBeTruthy();
});

test("parseing possible", (done) => {
  expect.assertions(3);
  const file = bhh0102csv;
  const readableStream = createReadStream(file);

  const result = Papa.parse(readableStream, {
    complete: (results) => {
      expect(results).toBeDefined();
      expect(results.data.length).toEqual(232);
      readableStream.close();
      done();
    },
    header: true
  });
  expect(true).toBeTruthy();
});

test("import BHH Epl 01 und 02 works without errors", (done) => {
  expect.assertions(4);
  const file = bhh0102csv;
  const readableStream = createReadStream(file);

  const store:ImportBHH_CSV_StorePart= {
    setCurrentUser: (usr) => {
      
      expect(usr).toEqual("LokaleDaten");
      readableStream.close();
      done();
    },
    addImportData: (importedData) => {
      expect(importedData.hhsts.length).toEqual(232);
      expect(
        importedData.hhsts.filter(
          (hhst) =>
            hhst.gruppe === "119" && hhst.suffix === "57"
        ).length
      ).toEqual(2);
    },
    setModalInfo: (modalInfo) => {
      console.log("setMdl");
      expect(modalInfo).toEqual(false); // should not occur
    }
  }
  importBHH_CSV(
    readableStream,
    store
  );

  expect(true).toBeTruthy();
});
