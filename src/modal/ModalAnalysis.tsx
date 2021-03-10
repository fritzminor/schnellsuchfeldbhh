import { FC } from "react";
import { formatBetrag } from "../store/AppState";
import { AnalyzeResults } from "../import/importAnalyseSheet";

export type ModalAnalysisProps = {

  /** should reset active to false, thus hiding the modal dialog */
  hideModal: () => void;

  modalInfo: AnalyzeResults;
};

export const ModalAnalysis: FC<ModalAnalysisProps> = ({ modalInfo, hideModal }) => {
  const content = modalInfo.xlsxDownloadBuffer;
  const contentBlob = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const downloadUrl = URL.createObjectURL(contentBlob);


  const arrowHideModal = () => {
    hideModal();
    setTimeout(() => {
      try {
        URL.revokeObjectURL(downloadUrl);
        console.log("Freed downloadURL");
      } catch (e) {
        console.log("Error in revoking downloadURL!" + e);
      }
    });
  };

  return (
    <div className="modal is-active" >
      <div className="modal-background"
        onClick={arrowHideModal}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{modalInfo.file.name} </p>
          <button className="delete" aria-label="close"
            onClick={arrowHideModal}></button>
        </header>
        <section className="modal-card-body">
          <table className="table">
            <thead>
              <tr>
                <th title="Excel Arbeitsblatt Nr.">
                  Bl.
              </th>
                <th>Zelle</th>
                <th>Aufgabe</th>
                <th>Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {modalInfo.analysis.map(
                (singleAnalysis) => {
                  const analyzeResult = singleAnalysis.analyzeResult;
                  const isNumber = typeof analyzeResult === "number";
                  return <tr>
                    <th>{singleAnalysis.worksheetId} </th>
                    <td>{singleAnalysis.cellPos}</td>
                    <td className="is-size-7">{singleAnalysis.analyzeExpression} </td>
                    <td className={isNumber
                      ? "has-text-right"
                      : "has-text-left"
                    }
                    >{isNumber ? formatBetrag(analyzeResult as number) : analyzeResult}</td>
                  </tr>;
                }
              )
              }
            </tbody>
          </table>
          {/*<pre>{JSON.stringify(modalInfo, undefined, "  ")}</pre>*/}
        </section>
        <footer className="modal-card-foot">
          <a className="button is-success"
            download={modalInfo.file.name}
            href={downloadUrl}>
            Download
          </a>
          <button className="button" onClick={arrowHideModal}>Abbrechen</button>
        </footer>
      </div>
    </div>


  );
};