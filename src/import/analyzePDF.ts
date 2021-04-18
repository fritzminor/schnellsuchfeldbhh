
import * as PDFJS from "pdfjs-dist";

/* You have to install pdfjs-dist:
     npm install --save pdfjs-dist
    and for create-react-apps you have to move 
    node_modules/pdfjs-dist/.../pdf.worker.js in 
    /public - folder.
   */

export type ShowError = (msg: string) => void;

/**
 * Opens a file and passes the content data to
 * the analyze callback.
 *
 */
export function openFile(
  file: File,
  analyze: (
    data: ArrayBuffer,
    fileName: string,
    setTabularContent: SetTabularContent,
    showError: ShowError
  ) => void,
  setTabularContent: SetTabularContent,
  showError: ShowError
) {
    const r = new FileReader();
    r.onload = async (evt) => {
      if (
        evt.target &&
        evt.target.result &&
        evt.target.result instanceof ArrayBuffer
      ) {
        analyze(
          evt.target.result,
          file.name,
          setTabularContent,
          showError
        );
      } else showError(`kein ArrayBuffer`);
    };
    r.readAsArrayBuffer(file);
}

// ------- Phase 1 - Struktur --------

type RowColDesc = {
  /** for rows: y, for col: x-coordinate */
  coord: number;
  key: string;
};

type IntermediateTable = {
  [rowKey: string]: {
    [colKey: string]: TabularCell;
  };
};

// -------------------Zielstruktur ----------/
type TabularCell = {
  x: number;
  y: number;
  text: string | null;
};
type TabularRow = {
  y: number;
  cells: TabularCell[];
};

type TabularPage = {
  pagenr: number;
  rows: TabularRow[];
};

export type TabularContent = {
  pages: TabularPage[];
};

export type SetTabularContent = (
  content: TabularContent
) => void;

function coord2key(coord: number): string {
  return `${coord}`.padStart(12, "0");
}

/**
 * analyzes a PDF document and calls setTabularContent with the result.
 * Requirements: 
 *   - package: pdfjs-dist
 *   - package: worker-loader
 *   - pdf.worker.min.js in /public/src
 * @param data 
 * @param fileName 
 * @param setTabularContent 
 * @param showError 
 */
export async function analyzePDF(
  data: ArrayBuffer,
  fileName: string,
  setTabularContent: SetTabularContent,
  showError: ShowError
) {
  const result: TabularContent = { pages: [] };

  try {
    PDFJS.GlobalWorkerOptions.workerSrc =
      "${process.env.PUBLIC_URL}/lib/pdf.worker.min.js";
    const loadingTask = PDFJS.getDocument(
      new Uint8Array(data)
    );
    const pdf = await loadingTask.promise;
    console.log(pdf);

    for (
      let pagenr = 1;
      pagenr <= pdf.numPages;
      pagenr++
    ) {
      const page = await pdf.getPage(pagenr);

      const textItems = await page.getTextContent();
      const intermediateTable: IntermediateTable = {};
      const rowDescs: {
        [key: string]: RowColDesc;
      } = {};
      const colDescs: {
        [key: string]: RowColDesc;
      } = {};

      textItems.items.forEach((textItem) => {

        const y = textItem.transform[5];
        const rowKey = coord2key(y);

        let row = intermediateTable[rowKey];
        if (!row) {
          row = {};
          intermediateTable[rowKey] = row;
          rowDescs[rowKey] = {
            coord: textItem.transform[5],
            key: rowKey
          };
        }

        const x = textItem.transform[4];
        const colKey = coord2key(x);

        let cell = row[colKey];
        if (!cell) {
          cell = {
            x,
            y,
            text: textItem.str
          };
          row[colKey] = cell;
          colDescs[colKey] = {
            coord: textItem.transform[4],
            key: colKey
          };
        }
      });

      const colDescsArray: RowColDesc[] = [];
      for (let colKey in colDescs)
        colDescsArray.push(colDescs[colKey]);
      colDescsArray.sort(
        (a, b) => a.coord - b.coord
      );

      const rows: TabularRow[] = [];
      for (let interRowKey in intermediateTable) {
        const interRow =
          intermediateTable[interRowKey];
        const cells: TabularCell[] = [];

        // iterate over all columns, not only those from current row
        colDescsArray.forEach((colDesc) => {
          const interCell = interRow[colDesc.key];
          cells.push(
            interCell || {
              x: colDesc.coord,
              y: rowDescs[interRowKey].coord,
              text: null
            }
          );
        });

        const row: TabularRow = {
          y: (cells[0] && cells[0].y) || -1,
          cells
        };

        rows.push(row);
      }

      result.pages.push({
        pagenr,
        rows
      });
    }

    setTabularContent(result);
  } catch (e) {
    showError("Loading failed: " + e);
    console.error(e);
  }
}
