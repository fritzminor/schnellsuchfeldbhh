import * as React from "react";

import { HHStRow } from "./HHStRow";
import { HHSt } from "../store/HHStType";
import { AppState } from "../store/AppState";
import { MoreLessButton } from "../othercomponents/MoreLessButton";



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
    const [limited, setLimited] = React.useState<boolean>(true);
    const hhstLimit = 500;
    rowHeadings.sollJahr1 = appState.derived.firstYear;
    const hhsts = limited
      ? appState.derived.filteredHhstArray.slice(0, hhstLimit)
      : appState.derived.filteredHhstArray;

    return (
      <>
        <div className="container box hhstListContainer">
          <HHStRow
            heading
            hhst={rowHeadings}
            key="heading"
          />
          {hhsts.map((hhst) => (
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
          {hhstLimit < appState.derived.filteredHhstArray.length
            ? <MoreLessButton limited={limited} setLimited={setLimited} />
            : <></>}

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