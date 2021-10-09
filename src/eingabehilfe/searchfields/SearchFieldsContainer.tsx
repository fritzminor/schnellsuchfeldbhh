import * as React from "react";

import {
  SearchFieldDataPseudoNumeric,
  SearchFieldsData
} from "./SearchFieldsTypes";
import {
  fieldsExtended,
  fieldsLimited,
  initialFieldsData
} from "./SearchFieldsData";
import {
  getSearchExpression,
  getSearchFieldsData
} from "./SearchFieldsLogic";
import { AppState } from "../../store/AppState";
import { DocReferrer } from "../../othercomponents/DocReferrer";
import { RealInputField } from "../../othercomponents/RealInputField";
import { MoreLessButton } from "../../othercomponents/MoreLessButton";
import { errorMessage } from "../../utils/errorMessage";

type SearchFieldsContainerProps = {
  setSearchExpression: (searchexpression: string) => void;
  appState: AppState;
  searchExpressionSetBySearchFields: boolean;
};

// This method may not be made as an inner method of posNegBlock(), because React can't
// handle it; input would lose the focus after each key press.
function SingleInputField({
  from,
  posNeg,
  fieldKey,
  searchFieldsData,
  setSearchFieldsData,
  setSearchExpression,
  fieldData
}: {
  from: boolean;
  posNeg: "positive" | "negative";
  fieldKey: keyof SearchFieldsData["positive"];
  searchFieldsData: SearchFieldsData;
  setSearchFieldsData: React.Dispatch<
    React.SetStateAction<SearchFieldsData>
  >;
  setSearchExpression: (searchexpression: string) => void;
  fieldData: SearchFieldDataPseudoNumeric;
}) {
  const fromTo = from ? "valueFrom" : "valueTo";

  return (
    <>
      <div
        className="heading"
        key={"prefix" + posNeg + fieldKey + fromTo}
      >
        {from ? "von" : "bis"}
      </div>
      <RealInputField
        className="input fromTo"
        type="number"
        key={"input" + posNeg + fieldKey + fromTo}
        min={
          from
            ? "0"
            : fieldData.valueFrom
            ? Math.max(0, parseInt(fieldData.valueFrom, 10))
            : 0
        }
        step="1"
        placeholder={from ? "01" : "02"}
        value={fieldData[fromTo]}
        onChange={(ev) => {
          const newFieldsData: SearchFieldsData = {
            ...searchFieldsData,
            [posNeg]: {
              ...searchFieldsData[posNeg],
              [fieldKey]: {
                ...searchFieldsData[posNeg][fieldKey],
                [fromTo]: ev.target.value
              }
            }
          };

          setSearchFieldsData(() => newFieldsData);
          setSearchExpression(
            getSearchExpression(newFieldsData)
          );
        }}
      />
    </>
  );
} // end of function SingleInputField

type PosNegBlockProps = {
  posNeg: "positive" | "negative";
  searchFieldsData: SearchFieldsData;
  setSearchFieldsData: React.Dispatch<
    React.SetStateAction<SearchFieldsData>
  >;
  setSearchExpression: (searchexpression: string) => void;
  limited: boolean;
};

const PosNegBlock: React.FC<PosNegBlockProps> = ({
  posNeg,
  searchFieldsData,
  setSearchFieldsData,
  setSearchExpression,
  limited
}: PosNegBlockProps) => {
  const fieldClassName = "field box";

  const fieldKeys: (keyof SearchFieldsData["positive"])[] =
    limited ? fieldsLimited : fieldsExtended;

  return (
    <>
      <div className="tile is-ancestor">
        <div className="tile is-parent">
          {
            // pseudonumeric fields
            fieldKeys.map((key) => {
              const fieldData =
                searchFieldsData[posNeg][key];
              if (fieldData) {
                if (fieldData.type === "pseudonumeric") {
                  // pseudonumeric field

                  return (
                    <div
                      key={"childtile" + posNeg + key}
                      className="tile is-child"
                    >
                      <div
                        className={fieldClassName}
                        key={"fieldbox" + posNeg + key}
                      >
                        <label className="label">
                          {fieldData.label}
                        </label>
                        <div
                          className="control"
                          key={"control" + posNeg + key}
                        >
                          <SingleInputField
                            key={"from" + posNeg + key}
                            from
                            fieldData={fieldData}
                            setSearchExpression={
                              setSearchExpression
                            }
                            setSearchFieldsData={
                              setSearchFieldsData
                            }
                            fieldKey={key}
                            posNeg={posNeg}
                            searchFieldsData={
                              searchFieldsData
                            }
                          />
                          <SingleInputField
                            key={"to" + posNeg + key}
                            from={false}
                            fieldData={fieldData}
                            setSearchExpression={
                              setSearchExpression
                            }
                            setSearchFieldsData={
                              setSearchFieldsData
                            }
                            fieldKey={key}
                            posNeg={posNeg}
                            searchFieldsData={
                              searchFieldsData
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              } else return <></>;
            })
          }
        </div>
      </div>
      {fieldKeys.map((key) => {
        const fieldData = searchFieldsData[posNeg][key];
        if (fieldData) {
          if (fieldData.type === "single")
            return (
              <div className={fieldClassName} key={key}>
                <label className="label">
                  {fieldData.label}
                  {key === "fulltext" ? (
                    <DocReferrer topic="Suchfeld Volltextsuche" />
                  ) : (
                    <></>
                  )}
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="search"
                    placeholder="Suchwort"
                    value={fieldData.value}
                    onChange={(ev) => {
                      const newFieldsData: SearchFieldsData =
                        {
                          ...searchFieldsData,
                          [posNeg]: {
                            ...searchFieldsData[posNeg],
                            fulltext: {
                              ...searchFieldsData[posNeg]
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
        } else return <></>;
      })}
    </>
  );
}; // end of function posNegBlock

export function SearchFieldsContainer({
  setSearchExpression,
  appState,
  searchExpressionSetBySearchFields
}: //eslint-disable-next-line no-undef
SearchFieldsContainerProps): JSX.Element {
  const fieldsDataArray = React.useState<SearchFieldsData>(
    initialFieldsData()
  );
  let searchFieldsData = fieldsDataArray[0];
  const setSearchFieldsData = fieldsDataArray[1];

  const [limited, setLimited] = React.useState(true);

  if (!searchExpressionSetBySearchFields) {
    try {
      searchFieldsData = getSearchFieldsData(
        appState.derived.searchTree
      );

      //console.log("new SearchFieldsData", searchFieldsData);
    } catch (e) {
      searchFieldsData = initialFieldsData();
      console.log(
        `Unversalausdruck "${
          appState.searchexpression
        }" kann nicht ausgewertet werden.${errorMessage(e)}`
      );
    }
  }

  return (
    <div className="container searchfields">
      {/* ------ positive block --------*/}
      <PosNegBlock
        posNeg="positive"
        searchFieldsData={searchFieldsData}
        setSearchFieldsData={setSearchFieldsData}
        setSearchExpression={setSearchExpression}
        limited={limited}
      />

      {limited ? (
        <></>
      ) : (
        /* -- negative block (Ohne) --------------- */
        <div className="panel">
          <div className="panel-heading">
            Ohne:
            <DocReferrer topic="Ohne-Suchfelder" />
          </div>

          <PosNegBlock
            posNeg="negative"
            searchFieldsData={searchFieldsData}
            setSearchFieldsData={setSearchFieldsData}
            setSearchExpression={setSearchExpression}
            limited={limited}
          />
        </div>
      )}
      <MoreLessButton
        limited={limited}
        setLimited={setLimited}
      />
    </div>
  );
}
