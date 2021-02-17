import * as React from "react";

import { HHStRow } from "./HHStRow";
import { HHSt } from "../store/HHStType";
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
  appState: AppState;
}>): JSX.Element {
  try {
    rowHeadings.sollJahr1 = appState.derived.firstYear;
    const filteredHhstArray = appState.derived.filteredHhstArray;

    return (
      <>
        <div className="container box hhstListContainer">
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