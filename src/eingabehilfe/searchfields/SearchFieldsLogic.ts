import {
  fieldsPseudoNumeric,
  initialFieldsData
} from "./SearchFieldsData";
import { SearchFieldsData } from "./SearchFieldsTypes";
import { SearchNode } from "../../hhstliste/hhstListeLogic/searchTreeTypes";

export function getSearchExpression(
  searchFieldsData: SearchFieldsData
): string {
  const items: string[] = [];
  fieldsPseudoNumeric.forEach((key) => {
    const fieldData = searchFieldsData.positive[key];
    if (fieldData.type === "pseudonumeric") {
      const valueFrom = fieldData.valueFrom;
      const valueTo = fieldData.valueTo;
      if (valueFrom && !valueTo)
        // only one value => equal operator
        items.push(
          `${fieldData.keyword}:${valueFrom.padStart(
            fieldData.minDigits,
            "0"
          )}`
        );
      // range or smaller
      else if (valueFrom || valueTo)
        items.push(
          `${fieldData.keyword}:${valueFrom.padStart(
            fieldData.minDigits,
            "0"
          )}-${valueTo.padStart(fieldData.minDigits, "0")}`
        );
    }
  });
  if (searchFieldsData.positive.fulltext.value) {
    const fieldText = searchFieldsData.positive.fulltext.value.trim();
    const snippets = fieldText.split(" ");
    snippets.forEach((snippet) =>
      items.push("Volltext:" + snippet)
    );
  }

  return items.join(" ");
}

export function getSearchFieldsData(
  searchTree: SearchNode | null
): SearchFieldsData {
  const searchFieldsData = initialFieldsData;
  try {
    if (searchTree)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      fillSearchFieldData(searchTree, searchFieldsData);
    return searchFieldsData;
  } catch (e) {
    console.log(
      `Universalsuchfeldausdruck kann nicht in Suchfeldern dargestellt werden. ${e.message}`
    );
    console.log(searchTree);
    return initialFieldsData;
  }
}

function fillSearchFieldData(
  searchTree: SearchNode,
  searchFieldsData: SearchFieldsData
) {
  switch (searchTree.type) {
    default:
      throw new Error(
        `Der Prototyp kann diesen Typ ${searchTree.type} nicht verarbeiten.`
      );
  }
}
