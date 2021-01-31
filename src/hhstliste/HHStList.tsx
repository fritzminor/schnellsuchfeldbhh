import * as React from "react";

import { formatBetrag, HHStRow } from "./HHStRow";
import { HHSt } from "../store/HHStType";
import { isSearched } from "./hhstListeLogic/evalSearch4HHSt";
import { humanReadableSearchTerm } from "./hhstListeLogic/humanReadableSearchTerm";
import { AppState } from "../store/AppState";


const rowHeadings: HHSt = {
  epl: "Kapitel",
  kap: "",
  gruppe: "Titel",
  suffix: "",
  fkz: "FKZ",
  zweck: "Zweckbestimmung",
  sollJahr1: 2021
};



export function HHStList({
  children,
  appState
}: React.PropsWithChildren<{
  appState: AppState
}>): JSX.Element {
  try {
    const filteredHhstArray = appState.derived.hhstArray.filter((hhst) =>
      isSearched(hhst, appState.derived.searchTree)
    );

    const sums = filteredHhstArray.reduce(
      (previousSums, hhst) => {
        if (hhst.expense)
          return {
            expenses:
              previousSums.expenses + hhst.sollJahr1,
            revenues: previousSums.revenues
          };
        else
          return {
            expenses: previousSums.expenses,
            revenues: previousSums.revenues + hhst.sollJahr1
          };
      },
      { expenses: 0, revenues: 0 }
    );
    return (
      <>
        <div className="container hhstListContainer">
          <HHStRow
            heading
            hhst={rowHeadings}
            key="heading"
          />
          {filteredHhstArray.map((hhst) => (
            <HHStRow
              hhst={hhst}
              key={
                hhst.epl +
                hhst.kap +
                hhst.gruppe +
                hhst.suffix
              }
            />
          ))}

          <div className="container sums  ">
            <div className="is-flex is-justify-content-space-between">
              <span className="label">Einnahmen:</span>
              <span className="value">
                {formatBetrag(sums.revenues)}
              </span>
            </div>
            <div className="is-flex is-justify-content-space-between">
              <span className="label">Ausgaben:</span>
              <span>{formatBetrag(sums.expenses)}</span>
            </div>
            <div className="searchtree  is-flex is-justify-content-space-between">
              <span>Suche nach:</span>
              <span>
                {appState.derived.searchTree
                  ? humanReadableSearchTerm(appState.derived.searchTree)
                  : "nichts"}
              </span>
            </div>
          </div>
          {
            children // for hhstOverlay
          }
        </div>
      </>
    );
  } catch (excptn) {
    console.log(excptn);
    return (
      <div className="error">
        <div className="subtitle">
          Diesen Suchausdruck kann der Prototyp noch nicht.
        </div>
        <div>{excptn.message}</div>
        <pre> {excptn.stack}</pre>
      </div>
    );
  }
}