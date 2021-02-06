import * as React from "react";
import { ClickSelectCategory } from "./ClickSelectCategory";
import { AppState } from "../../store/AppState";
import color from "color";
import { getClickSelectData } from "./ClickSelectLogic";

type ClickSelectContainerProps = {
  appState: AppState;
  setSearchExpression: (searchexpression: string) => void;
};

export function ClickSelectContainer({
  appState, setSearchExpression
}: ClickSelectContainerProps): JSX.Element {


  const clickSelectData = getClickSelectData(appState);
  console.log(clickSelectData);
  return (
    <div className="message is-info">
      <div className="message-header">
        <p>
        Kreisauswahl - durch Klicken auf Kuchenstücke Auswahl einschränken
        </p>
      </div>
      <div className="message-body">
        {
          clickSelectData.rootCategories.map(cat => {
            const catData = clickSelectData.data[cat];
            return (
              catData ? <ClickSelectCategory key={catData.description} setSearchExpression={setSearchExpression} searchExpression={appState.searchexpression}
                categoryData={catData} />
                : <div className="notification is-danger">Interner Fehler: no data for category {cat}</div>
            )
          })
        }
      </div>
    </div>
  );
}
