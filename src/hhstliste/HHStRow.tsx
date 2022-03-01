import * as React from "react";
import { formatBetrag } from "../store/AppState";
import { PartialHHStOrBlock } from "../store/HHStType";
import { isNewHhst } from "../store/versions/DiffTypes";
import { getHhstKey } from "./HHStList";

type HHStRowProps = {
  hhst: PartialHHStOrBlock;
  heading?: boolean;
};

export function HHStRow({
  hhst,
  heading
}: HHStRowProps): JSX.Element {
  let className = "container hhstRow";
  if (heading || hhst.type == "block") {
    className += " is-size-6";
    if (heading || !hhst.epl)
      className += " has-background-info has-text-light";
    else {
      if (hhst.kap)
        if (hhst.gruppe) className += " blockTG";
        else className += " blockKap";
      else className += " blockEpl";
    }
    if (hhst.type === "block") {
      if (hhst.blockstart) className += " blockStart";
      else if (hhst.lastline) className += " blockEnd";
    }
  } else
    className +=
      " is-size-7" +
      (hhst.tgKey ? " blockTG" : "") +
      (hhst.deleted ? " hhstDeleted" : "") +
      (isNewHhst(hhst) ? " is-underlined" : "");

  return (
    <div className="container">
      <div className={className}>
        <div className="hhstNr">
          <span>{hhst.epl}</span>
          <span> {hhst.kap}</span>
          <span>
            {hhst.gruppe
              ? hhst.type === "block"
                ? " " + hhst.gruppe
                : ` / ${hhst.gruppe}`
              : ""}
          </span>
          <span> {hhst.suffix} </span>
          <span className="fkz">{hhst.fkz}</span>
        </div>
        <div className="zweck">{hhst.zweck}</div>
        <div className="soll1">
          {heading
            ? hhst.sollJahr1
            : hhst.type === "block" && hhst.blockstart
            ? ""
            : formatBetrag(hhst.sollJahr1)}
        </div>
      </div>
      <div className="has-text-grey-light">
        {hhst.type === "hhst" ? (
          hhst.changedFrom === null ? (
            "neu"
          ) : hhst.changedFrom ? (
            <div className="hhstDeleted">
              <HHStRow
                hhst={hhst.changedFrom}
                key={getHhstKey(hhst.changedFrom)}
              />
            </div>
          ) : (
            // hhst unchanged
            ""
          )
        ) : (
          // block
          ""
        )}
      </div>
    </div>
  );
}
