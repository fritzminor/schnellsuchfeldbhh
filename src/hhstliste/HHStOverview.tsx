import { formatBetrag, HHStRow } from "./HHStRow";
import { humanReadableSearchTerm } from "./hhstListeLogic/humanReadableSearchTerm";
import { AppState } from "../store/AppState";
import { NextOutline32, PreviousOutline32, Query32 } from "@carbon/icons-react";
import { PropsWithChildren } from "react";

function SingleItem({ icon, title, value, children }: PropsWithChildren<{ icon: JSX.Element, title: string, value: string; }>): JSX.Element {
  return (
    <div className="level-item has-text-centered is-flex is-flex-direction-column">
      <p className="heading">{title}</p>
      <p className="title">
        {icon}{value}
      </p>
      {children}
    </div>
  );

}

export function HHStOverview(
  { appState }: { appState: AppState; }
): JSX.Element {
  const filteredHhstArray = appState.derived.filteredHhstArray;

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
    <div className="container">
      <nav className="level">
        <SingleItem icon={<Query32 />} title="Suche nach"
          value={appState.derived.searchTree
            ? humanReadableSearchTerm(appState.derived.searchTree)
            : "nichts"}
        >{appState.derived.searchParseErrMessage
          ? <p>{appState.derived.searchParseErrMessage}</p> 
          : <></>
        }
        </SingleItem>
        <SingleItem icon={<NextOutline32 />} title="Einnahmen (T€)"
          value={formatBetrag(sums.revenues)} />
        <SingleItem icon={<PreviousOutline32 />} title="Ausgaben (T€)"
          value={formatBetrag(sums.expenses)} />
      </nav >
    </div >

  );
}