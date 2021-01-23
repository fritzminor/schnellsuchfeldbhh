import * as React from "react";

import { SearchFieldsData } from "./SearchFieldsTypes";

type SearchFieldsContainerProps = {
  setSearchExpression: (searchexpression: string) => void;
  searchFieldsData: SearchFieldsData;
};

export function SearchFieldsContainer({
  setSearchExpression,
  searchFieldsData
}: //eslint-disable-next-line no-undef
SearchFieldsContainerProps): JSX.Element {
  const fieldKeys: (keyof SearchFieldsData["positive"])[] = [
    "epl",
    "fulltext"
  ];
  return (
    <div className="container searchfields">
      {fieldKeys.map((key) => {
        const fieldData = searchFieldsData.positive[key];
        if (fieldData) {
          if (fieldData.type === "single")
            return (
              <div className="field" key={key}>
                <label className="label">
                  {fieldData.label}
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="search"
                    placeholder="Suchwort"
                    onChange={(ev) => {
                      setSearchExpression(
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        fulltextExpression(ev.target.value)
                      );
                    }}
                  />
                </div>
              </div>
            );
          else
            return (
              <div key={key} className="field">
                <label className="label">
                  {fieldData.label}
                </label>
                <div className="control">
                  <div className="fieldprefix">von</div>
                  <input
                    className="input"
                    type="number"
                    placeholder="01"
                  />
                  <div>bis</div>
                  <input
                    className="input"
                    type="number"
                    placeholder="01"
                  />
                </div>
              </div>
            );
        } else return <></>;
      })}
    </div>
  );
}

/** returns the expression for the universal search field, e.g.
 *  given "hello world" returns "volltext:hello volltext:world"
 */
function fulltextExpression(fieldText: string): string {
  if (fieldText) {
    const snippets = fieldText.split(" ");
    return snippets
      .map((snippet) => "Volltext:" + snippet)
      .join(" ");
  } else return "";
}
