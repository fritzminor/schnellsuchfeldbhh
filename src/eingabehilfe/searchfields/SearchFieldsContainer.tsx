import * as React from "react";

import { SearchFieldsData } from "./SearchFieldsTypes";
import { initialFieldsData } from "./SearchFieldsData";
import {
  getSearchExpression,
  getSearchFieldsData
} from "./SearchFieldsLogic";
import { AppState } from "../../store/AppState";
import { DocReferrer } from "../../othercomponents/DocReferrer";

type SearchFieldsContainerProps = {
  setSearchExpression: (searchexpression: string) => void;
  appState: AppState;
  searchExpressionSetBySearchFields: boolean;
};

export function SearchFieldsContainer({
  setSearchExpression,
  appState,
  searchExpressionSetBySearchFields
}: //eslint-disable-next-line no-undef
  SearchFieldsContainerProps): JSX.Element {
  const fieldsDataArray = React.useState<SearchFieldsData>(initialFieldsData());
  let searchFieldsData = fieldsDataArray[0];
  const setSearchFieldsData = fieldsDataArray[1];

  const [limited, setLimited] = React.useState(true);

  const fieldKeys: (keyof SearchFieldsData["positive"])[] = limited
    ? ["epl", "kap", "fulltext"]
    : ["epl", "kap", "gruppe", "fulltext"];

  if (!searchExpressionSetBySearchFields) {
    try {
      searchFieldsData = getSearchFieldsData(
        appState.derived.searchTree
      );

      //console.log("new SearchFieldsData", searchFieldsData);
    } catch (e) {
      searchFieldsData = initialFieldsData();
      console.log(
        `Unversalausdruck "${appState.searchexpression}" kann nicht ausgewertet werden.${e.message}`
      );
    }
  }
  return (
    <div className="container searchfields">
      {
        /* ------ positive block --------*/
        fieldKeys.map((key) => {
          const fieldData = searchFieldsData.positive[key];
          if (fieldData) {
            if (fieldData.type === "single")
              return (
                <div className="field" key={key}>
                  <label className="label">
                    {fieldData.label}
                    {key === "fulltext" ?
                      <DocReferrer topic="Suchfeld Volltextsuche" />
                      : <></>
                    }
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      type="search"
                      placeholder="Suchwort"
                      value={fieldData.value}
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
                      min="0"
                      step="1"
                      placeholder="01"
                      value={fieldData.valueFrom}
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
                      min={
                        fieldData.valueFrom
                          ? Math.max(
                            0,
                            parseInt(
                              fieldData.valueFrom,
                              10
                            )
                          )
                          : 0
                      }
                      step="1"
                      placeholder="02"
                      value={fieldData.valueTo}
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
        })
      }
      {limited ? (
        <></>
      ) : (
          /* -- negative block (Ohne) --------------- */
          <div className="panel">
            <div className="panel-heading">Ohne:
              <DocReferrer topic="Ohne-Suchfelder" />
            </div>
            {fieldKeys.map((key) => {
              const fieldData =
                searchFieldsData.negative[key];
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
                          value={fieldData.value}
                          onChange={(ev) => {
                            const newFieldsData: SearchFieldsData = {
                              ...searchFieldsData,
                              negative: {
                                ...searchFieldsData.negative,
                                fulltext: {
                                  ...searchFieldsData.negative
                                    .fulltext,
                                  value: ev.target.value
                                }
                              }
                            };
                            setSearchFieldsData(
                              newFieldsData
                            );
                            setSearchExpression(
                              getSearchExpression(
                                newFieldsData
                              )
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
                          min="0"
                          step="1"
                          placeholder="01"
                          value={fieldData.valueFrom}
                          onChange={(ev) => {
                            const newFieldsData: SearchFieldsData = {
                              ...searchFieldsData,
                              negative: {
                                ...searchFieldsData.negative,
                                [key]: {
                                  ...searchFieldsData
                                    .negative[key],
                                  valueFrom: ev.target.value
                                }
                              }
                            };
                            setSearchFieldsData(
                              newFieldsData
                            );
                            setSearchExpression(
                              getSearchExpression(
                                newFieldsData
                              )
                            );
                          }}
                        />
                        <div>bis</div>
                        <input
                          className="input"
                          type="number"
                          min={
                            fieldData.valueFrom
                              ? Math.max(
                                0,
                                parseInt(
                                  fieldData.valueFrom,
                                  10
                                )
                              )
                              : 0
                          }
                          step="1"
                          placeholder="02"
                          value={fieldData.valueTo}
                          onChange={(ev) => {
                            const newFieldsData: SearchFieldsData = {
                              ...searchFieldsData,
                              negative: {
                                ...searchFieldsData.negative,
                                [key]: {
                                  ...searchFieldsData
                                    .negative[key],
                                  valueTo: ev.target.value
                                }
                              }
                            };
                            setSearchFieldsData(
                              newFieldsData
                            );
                            setSearchExpression(
                              getSearchExpression(
                                newFieldsData
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  );
              } else return <></>;
            })}
          </div>
        )}
      {limited ? (
        <button
          onClick={() => {
            setLimited(false);
          }}
        >
          mehr...
        </button>
      ) : (
          <button
            onClick={() => {
              setLimited(true);
            }}
          >
            weniger...
          </button>
        )}
    </div>
  );
}
