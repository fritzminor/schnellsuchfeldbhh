import { existsSync, createReadStream } from "fs";
import { result } from "lodash";
import Papa from "papaparse";
import { importBHH_CSV } from "./importBHH";

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

  importBHH_CSV(
    readableStream,
    (usr) => {
      
      expect(usr).toEqual("LokaleDaten");
      readableStream.close();
      done();
    },
    (importedData) => {
      expect(importedData.hhsts.length).toEqual(232);
      expect(
        importedData.hhsts.filter(
          (hhst) =>
            hhst.gruppe === "119" && hhst.suffix === "57"
        ).length
      ).toEqual(2);
    },
    (modalInfo) => {
      console.log("setMdl");
      expect(modalInfo).toEqual(false); // should not occur
    }
  );

  expect(true).toBeTruthy();
});
