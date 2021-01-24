import * as React from "react";

import { SearchFieldsData } from "./SearchFieldsTypes";
import { initialFieldsData } from "./SearchFieldsData";
import {
  getSearchExpression,
  getSearchFieldsData
} from "./SearchFieldsLogic";
import { getSearchTree } from "../../hhstliste/hhstListeLogic/searchParser";

type SearchFieldsContainerProps = {
  setSearchExpression: (searchexpression: string) => void;
  searchExpression: string;
  searchExpressionSetBySearchFields: boolean;
};

export function SearchFieldsContainer({
  setSearchExpression,
  searchExpression,
  searchExpressionSetBySearchFields
}: //eslint-disable-next-line no-undef
SearchFieldsContainerProps): JSX.Element {
  let [
    searchFieldsData,
    setSearchFieldsData
  ] = React.useState<SearchFieldsData>(initialFieldsData);

  const fieldKeys: (keyof SearchFieldsData["positive"])[] = [
    "epl",
    "kap",
    "fulltext"
  ];

  if (!searchExpressionSetBySearchFields) {
    try {
      searchFieldsData = getSearchFieldsData(
        getSearchTree(searchExpression)
      );
    } catch (e) {
      console.log(
        `Unversalausdruck "${searchExpression}" kann nicht ausgewertet werden.${e.message}`
      );
    }
  }
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
                      const newFieldsData: SearchFieldsData = {
                        ...searchFieldsData,
                        positive: {
                          ...searchFieldsData.positive,
                          fulltext: {
                            ...searchFieldsData.positive
                              .fulltext,
                            value: ev.target.value
                          }
                        }
                      };
                      setSearchFieldsData(newFieldsData);
                      setSearchExpression(
                        getSearchExpression(newFieldsData)
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
                    onChange={(ev) => {
                      const newFieldsData: SearchFieldsData = {
                        ...searchFieldsData,
                        positive: {
                          ...searchFieldsData.positive,
                          [key]: {
                            ...searchFieldsData.positive[
                              key
                            ],
                            valueFrom: ev.target.value
                          }
                        }
                      };
                      setSearchFieldsData(newFieldsData);
                      setSearchExpression(
                        getSearchExpression(newFieldsData)
                      );
                    }}
                  />
                  <div>bis</div>
                  <input
                    className="input"
                    type="number"
                    placeholder="02"
                    onChange={(ev) => {
                      const newFieldsData: SearchFieldsData = {
                        ...searchFieldsData,
                        positive: {
                          ...searchFieldsData.positive,
                          [key]: {
                            ...searchFieldsData.positive[
                              key
                            ],
                            valueTo: ev.target.value
                          }
                        }
                      };
                      setSearchFieldsData(newFieldsData);
                      setSearchExpression(
                        getSearchExpression(newFieldsData)
                      );
                    }}
                  />
                </div>
              </div>
            );
        } else return <></>;
      })}
    </div>
  );
}
