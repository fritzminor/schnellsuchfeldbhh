import { humanReadableSearchTerm } from "./hhstListeLogic/humanReadableSearchTerm";
import { AppState, formatBetrag } from "../store/AppState";
import {
  NextOutline32,
  PreviousOutline32,
  Query32
} from "@carbon/icons-react";
import { PropsWithChildren } from "react";

function SecondaryValue({
  value,
  icon
}: {
  value?: number;
  icon?: JSX.Element;
}): JSX.Element {
  if (value)
    return (
      <p className={"has-text-grey-light"+(icon?" title":"")}>
        {icon}
        {formatBetrag(value,!icon)}
      </p>
    );
  else return <></>;
}
function SingleItem({
  icon,
  title,
  value,
  value2,
  value3,
  children
}: PropsWithChildren<{
  icon: JSX.Element;
  title: string;
  value: string;
  value2?: number;
  value3?: number;
}>): JSX.Element {
  return (
    <div className="has-text-centered is-flex is-flex-direction-column">
      <p className="heading">{title}</p>
      <p className="title">
        {icon}
        {value}
      </p>
      <SecondaryValue value={value2}  />
      <SecondaryValue value={value3} icon={icon} />
      {children}
    </div>
  );
}

export function HHStOverview({
  appState
}: {
  appState: AppState;
}): JSX.Element {
  const sums = appState.derived.totals;

  return (
    <div className="container">
      <div className="is-flex is-justify-content-space-between is-flex-wrap-wrap">
        <SingleItem
          icon={<Query32 />}
          title="Suche nach"
          value={
            appState.derived.searchTree
              ? humanReadableSearchTerm(
                  appState.derived.searchTree
                )
              : "nichts"
          }
        >
          {appState.derived.searchParseErrMessage ? (
            <p>{appState.derived.searchParseErrMessage}</p>
          ) : (
            <></>
          )}
        </SingleItem>
        <SingleItem
          icon={<NextOutline32 />}
          title="Einnahmen (T€)"
          value={formatBetrag(sums.revenues)}
          value2={
            appState.derived.changedFromTotals?.revenues !== undefined
              ? sums.revenues -
                appState.derived.changedFromTotals.revenues
              : undefined
          }
          value3={
            appState.derived.changedFromTotals?.revenues
          }
        />
        <SingleItem
          icon={<PreviousOutline32 />}
          title="Ausgaben (T€)"
          value={formatBetrag(sums.expenses)}
          value2={
            appState.derived.changedFromTotals?.expenses !==undefined
              ? sums.expenses -
                appState.derived.changedFromTotals.expenses
              : undefined
          }
          value3={
            appState.derived.changedFromTotals?.expenses
          }
        />
      </div>
    </div>
  );
}
