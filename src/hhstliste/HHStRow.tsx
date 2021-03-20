import * as React from "react";
import { formatBetrag } from "../store/AppState";
import {  HHStOrBlock } from "../store/HHStType";

type HHStRowProps = {
  hhst: HHStOrBlock;
  heading?: boolean;
};

export function HHStRow({ hhst, heading }: HHStRowProps): JSX.Element {
  
  const className = heading || ( hhst.type=="block" &&  hhst.epl==="")
    ? "container hhstRow is-size-6 has-background-primary"
    : "container hhstRow is-size-7";
  return (
    <div className={className}>
      <div className="hhstNr">
        <span>{hhst.epl}</span>
        <span> {hhst.kap}</span>
        <span>{hhst.gruppe?` / ${hhst.gruppe}`:""}</span>
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
