import * as React from "react";
import { HHSt } from "./hhstListeLogic/HHStType";

type HHStRowProps = {
  hhst: HHSt;
  heading?: boolean;
};

export function HHStRow({ hhst, heading }: HHStRowProps): JSX.Element {
  const className = heading
    ? "container hhstRow is-size-6 has-background-primary"
    : "container hhstRow is-size-7";
  return (
    <div className={className}>
      <div className="hhstNr">
        <span>{hhst.epl}</span>
        <span> {hhst.kap}</span>
        <span> / {hhst.gruppe}</span>
        <span> {hhst.suffix} </span>
        <span className="fkz">{hhst.fkz}</span>
      </div>
      <div className="zweck">{hhst.zweck}</div>
      <div className="soll1">
        {heading ? hhst.sollJahr1 : formatBetrag(hhst.sollJahr1)}
      </div>
    </div>
  );
}

/** returns a number formatted with . as 000 separator and a comma 0 */
export function formatBetrag(betrag: number): string {
  return betrag === 0
    ? "-"
    : betrag.toLocaleString("de-DE", {
      minimumFractionDigits: 1
    });
}