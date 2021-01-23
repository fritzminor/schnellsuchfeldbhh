import * as React from "react";

import { SearchFieldsData } from "./SearchFieldsTypes";

type SearchFieldsContainerProps = {
  setSearchExpression: (searchexpression: string) => void;
  searchFieldsData: SearchFieldsData;
};

export function SearchFieldsContainer({
  setSearchExpression,
  searchFieldsData
}: SearchFieldsContainerProps): JSX.Element {
  //eslint-disable-line no-undef
  const fieldKeys = searchFieldsData.positive;
  return (
    <div className="container searchfields">
      <pre>
        {JSON.stringify(fieldKeys, undefined, "  ")}
      </pre>
      <div className="field">
        <label className="label">Volltextsuche</label>
        <div className="control">
          <input
            className="input"
            type="search"
            placeholder="Suchwort"
            onChange={(ev) => {
              setSearchExpression(
                fulltextExpression(ev.target.value)
              );
            }}
          />
        </div>
      </div>
      <div className="field">
        <label className="label">Epl</label>
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
