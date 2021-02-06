import {
  fieldsPseudoNumeric,
  initialFieldsData,
  parserKeywords2FieldKeys
} from "./SearchFieldsData";
import { SearchFieldDataPseudoNumeric, SearchFieldsData } from "./SearchFieldsTypes";
import { SearchNode } from "../../hhstliste/hhstListeLogic/searchTreeTypes";

export function getSearchExpression(
  searchFieldsData: SearchFieldsData
): string {
  const items: string[] = [];
  /* --- positive items --- */
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  addItems(searchFieldsData, true, items);

  /* --- negative items --- */
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  addItems(searchFieldsData, false, items);

  /* put everything together */
  return items.join(" ");
}

function addItems(
  searchFieldsData: SearchFieldsData,
  positive: boolean,
  items: string[]
): void {
  const posNegKey = positive ? "positive" : "negative";
  const minusSign = positive ? "" : "-";

  fieldsPseudoNumeric.forEach((key) => {
    const fieldData = searchFieldsData[posNegKey][key];

    if (fieldData.type === "pseudonumeric") {
      const valueFrom = fieldData.valueFrom;
      const valueTo = fieldData.valueTo;

      const addItemPseudoNumericEqual= () => {
        items.push(
          `${minusSign}${
            fieldData.keyword
          }:${valueFrom.padStart(fieldData.minDigits, "0")}`
        );
      }

      if (valueFrom && !valueTo) {
        // only one value => equal operator
        switch (key) {
          case "epl":
            items.push(
              `${minusSign}${valueFrom.padStart(2, "0")}`
            );
            break;
          case "kap":
            if (valueFrom.length === 4)
              items.push(`${minusSign}${valueFrom}`);
            else addItemPseudoNumericEqual();
            break;

          default:
            addItemPseudoNumericEqual();
        }
      }
      // range or smaller
      else if (valueFrom || valueTo) {
        const addItemPseudoNumericRangeOrSmaller=() => {
          items.push(
            `${minusSign}${fieldData.keyword}:${
              valueFrom
                ? valueFrom.padStart(
                  (fieldData as SearchFieldDataPseudoNumeric).minDigits,
                    "0"
                  )
                : ""
            }-${valueTo.padStart(fieldData.minDigits, "0")}`
          );
        }
        switch (key) {
          case "kap":
            if (
              (!valueFrom || valueFrom.length === 4) &&
              (!valueTo || valueTo.length === 4) &&
              valueFrom &&
              valueFrom.substr(0, 2) ===
                valueTo.substr(0, 2)
            ) {
              items.push(
                `${minusSign}(Epl:${valueFrom.substr(
                  0,
                  2
                )} Kap:${valueFrom.substr(
                  2,
                  2
                )}-${valueTo.substr(2, 2)})`
              );
              break;
            } else addItemPseudoNumericRangeOrSmaller();
            break;
          default:
            addItemPseudoNumericRangeOrSmaller();
        }
      }
    }
  });
  if (searchFieldsData[posNegKey].fulltext.value) {
    const fieldText = searchFieldsData[
      posNegKey
    ].fulltext.value.trim();
    const snippets = fieldText.split(" ");
    snippets.forEach((snippet) =>
      items.push(`${minusSign}Volltext:${snippet}`)
    );
  }
}

export function getSearchFieldsData(
  searchTree: SearchNode | null
): SearchFieldsData {
  const searchFieldsData: SearchFieldsData = initialFieldsData();
  //console.log("empty fields data", searchFieldsData.positive.epl.valueFrom);
  //console.log("clone fields data", initialFieldsData().positive.epl.valueFrom);
  try {
    if (searchTree)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      fillSearchFieldsData(
        searchTree,
        searchFieldsData,
        false
      );
    return searchFieldsData;
  } catch (e) {
    console.log(
      `Universalsuchfeldausdruck kann nicht in Suchfeldern dargestellt werden. ${e.message}`
    );
    console.log(searchTree);
    return initialFieldsData();
  }
}

function fillSearchFieldsData(
  searchTree: SearchNode,
  searchFieldsData: SearchFieldsData,
  negated: boolean
) {
  const posNegKey = negated ? "negative" : "positive";

  switch (searchTree.type) {
    case "logical":
      switch (searchTree.subtype) {
        case "and":
          if (negated)
            throw new Error(
              "Suchfelder können bei Ohne keine Schnittmenge abbilden."
            );
          fillSearchFieldsData(
            searchTree.node1,
            searchFieldsData,
            negated
          );
          fillSearchFieldsData(
            searchTree.node2,
            searchFieldsData,
            negated
          );
          break;
        case "not":
          fillSearchFieldsData(
            searchTree.node,
            searchFieldsData,
            true
          );
          break;
        default:
          throw new Error(
            `Logical subtype "${searchTree.subtype}" unknown to searchfields prototype.`
          );
      }
      break;
    case "pseudonumeric":
      switch (searchTree.keyword) {
        case "Epl":
        case "Kap":
        case "Grp":
          //eslint-disable-next-line no-case-declarations
          const key =
            parserKeywords2FieldKeys[searchTree.keyword];
          if (
            searchFieldsData[posNegKey][key].valueFrom ||
            searchFieldsData[posNegKey][key].valueTo
          )
            throw new Error(
              `Angabe von ${searchTree.keyword} kann 
                nur einmal in Suchfeldern dargestellt werden.`
            );

          switch (searchTree.subtype) {
            case "equal":
              searchFieldsData[posNegKey][key].valueFrom =
                searchTree.value;
              break;
            case "smaller":
              searchFieldsData[posNegKey][key].valueTo =
                searchTree.value;
              break;
            case "range":
              searchFieldsData[posNegKey][key].valueFrom =
                searchTree.value1;
              searchFieldsData[posNegKey][key].valueTo =
                searchTree.value2;
              break;
            case "greater":
              throw new Error(
                "In Suchfeldern kann 'mindestens' nicht dargestellt werden."
              );
          }
          break;
        default:
          throw new Error(
            `Pseudonumeric keyword "${searchTree.keyword}" unknown to prototype.`
          );
      }
      break;
    case "text":
      switch (searchTree.subtype) {
        case "fulltext":
          searchFieldsData[
            posNegKey
          ].fulltext.value = searchFieldsData[posNegKey]
            .fulltext.value
            ? `${searchFieldsData[posNegKey].fulltext.value} ${searchTree.value}`
            : searchTree.value;
          break;
        default:
          throw new Error(
            `Text subtype "${searchTree.subtype}" unknown to prototype.`
          );
      }
      break;

    default:
      throw new Error(
        `Der Prototyp kann diesen Typ ${searchTree.type} nicht verarbeiten.`
      );
  }
}
