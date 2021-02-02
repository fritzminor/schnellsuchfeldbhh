import * as React from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { AppState } from "../../store/AppState";
import color from "color";

type ClickSelectContainerProps = {
  appState: AppState;
  setSearchExpression: (searchexpression:string) => void;
};

type EplMeta = {
  count: number;
  expAmount: number;
  revAmount: number;
};

export function ClickSelectContainer({
  appState, setSearchExpression
}: ClickSelectContainerProps): JSX.Element {
  const epls = new Map<string, EplMeta>();
  appState.derived.filteredHhstArray.forEach((hhst) => {
    const prev: EplMeta = epls.get(hhst.epl) || {
      count: 0,
      expAmount: 0,
      revAmount: 0
    };
    const newMeta: EplMeta = {
      count: prev.count + 1,
      expAmount:
        prev.expAmount +
        (hhst.expense ? hhst.sollJahr1 : 0),
      revAmount:
        prev.revAmount +
        (!hhst.expense ? hhst.sollJahr1 : 0)
    };
    epls.set(hhst.epl, newMeta);
  });
  const eplViews: JSX.Element[] = [];
  const eplPieData: Data = [];

  let eplColor = color("#896745");

  for (const [epl, meta] of epls) {
    eplViews.push(
      <div key={epl} className="block">
        <span>
          Epl {epl} hat {meta.count} Titel mit{" "}
          {meta.revAmount} Einnahmen und {meta.expAmount}{" "}
          Ausgaben
        </span>
      </div>
    );
    eplPieData.push({
      title: epl,
      value: meta.expAmount,
      color: eplColor.hex() //"#"+ (eplPieData.length * 10680).toString()
    });
    eplColor = eplColor.rotate(81);
  }

  console.log(eplPieData);
  const lineWidth=35;
  return (
    <div>
      <div>
        Graphische Auswahl - noch nicht im Prototyp
        umgesetzt
      </div>
      <div className="columns is-8">
        <div className="column"></div>
        <div className="column">
          <div className="box">
            <PieChart
              data={eplPieData}
              lineWidth={lineWidth}
              label={(entry) => (entry.dataEntry.title||"")}
              labelStyle={{
                fill: "#fff",
                opacity: 0.75,
                fontSize:"0.15em"
              }}
              labelPosition={100-lineWidth/2}
              onClick={(_ev, index)=> setSearchExpression(`${eplPieData[index].title || ""} ${appState.searchexpression}`)}
            />
          </div>
        </div>
      </div>
      <div className="box">{eplViews}</div>
    </div>
  );
}
