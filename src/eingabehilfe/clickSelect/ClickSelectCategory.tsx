import * as React from "react";
import { PieChart } from "react-minimal-pie-chart";
import { DataEntry } from "react-minimal-pie-chart/types/commonTypes";
import color from "color";
import { ClickSelectCategoryData } from "./ClickSelectLogic";

type ClickSelectCategoryProps = {
  categoryData: ClickSelectCategoryData
  setSearchExpression: (searchexpression: string) => void;
  searchExpression: string;
};


export function ClickSelectCategory({
  categoryData, setSearchExpression, searchExpression
}: ClickSelectCategoryProps): JSX.Element {

  const getPieData = (expense: boolean) => {
    let eplColor = color("hsl(141, 53%, 53%)")
    return categoryData.itemsSorted.map((itemKey): DataEntry & { searchTerm: string } => {
      const itemData = categoryData.itemsMeta[itemKey];
      eplColor = eplColor.rotate(81);

      return ({
        title: itemData.name,
        value: expense ? itemData.expAmount : itemData.revAmount,
        color: eplColor.hex(),
        searchTerm: categoryData.searchPrefix + itemData.name
      });

    });
  };


  const expensePieData = getPieData(true);
  const revenuePieData = getPieData(false);

  const lineWidth = 45;
  return (
    <div>


      <div className="message is-success">
        <div className="message-header">
          <p>
            {categoryData.description}
          </p>
        </div>
        <div className="message-body">
          <div className="columns is-8">
            <div className="column">
              <div className="box">
                <PieChart
                  data={revenuePieData}
                  lineWidth={lineWidth}
                  label={(entry) => (entry.dataEntry.title || "")}
                  labelStyle={{
                    fill: "#fff",
                    opacity: 0.75,
                    fontSize: "0.18em"
                  }}
                  labelPosition={100 - lineWidth / 2}

                  onClick={(_ev, index) => setSearchExpression(`${expensePieData[index].searchTerm || ""} ${searchExpression}`)}
                />
                <div>nach Einnahmen</div>
              </div>
            </div>
            <div className="column">
              <div className="box">
                <PieChart
                  data={expensePieData}
                  lineWidth={lineWidth}
                  label={(entry) => (entry.dataEntry.title || "")}
                  labelStyle={{
                    fill: "#fff",
                    opacity: 0.75,
                    fontSize: "0.18em"
                  }}
                  labelPosition={100 - lineWidth / 2}

                  onClick={(_ev, index) => setSearchExpression(`${expensePieData[index].searchTerm || ""} ${searchExpression}`)}
                />
                <div>nach Ausgaben</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
