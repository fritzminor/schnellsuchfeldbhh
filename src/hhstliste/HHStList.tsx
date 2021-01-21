import * as React from "react";

//import hhstDataRows from "./material/bhh_short.json";
import hhstDataRows from "./material/bhh_bpbt.json";
import { formatBetrag, HHStRow } from "./HHStRow";
import { HHSt } from "./hhstListeLogic/HHStType";
import { SearchNode } from "./hhstListeLogic/searchTreeTypes";
import { isSearched } from "./hhstListeLogic/evalSearch4HHSt";
import { humanReadableSearchTerm } from "./hhstListeLogic/humanReadableSearchTerm";

const hhstArray: HHSt[] = hhstDataRows.map(data2hhst); // eslint-disable-line no-use-before-define

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
  searchTree
}: React.PropsWithChildren<{
  searchTree: SearchNode | null;
}>):JSX.Element {
  try {
    const filteredHhstArray = hhstArray.filter((hhst) =>
      isSearched(hhst, searchTree)
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
                {searchTree
                  ? humanReadableSearchTerm(searchTree)
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

function data2hhst(data: any): HHSt {  // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    epl: data.einzelplan,
    kap: (data.kapitel as string).substr(2),
    gruppe: data.titel.substr(0, 3),
    suffix: data.titel.substr(3),
    expense: data["einnahmen-ausgaben"] === "A",
    zweck: data["titel-text"],
    fkz: data.funktion,
    sollJahr1: parseInt(data.soll, 10)
  };
}
