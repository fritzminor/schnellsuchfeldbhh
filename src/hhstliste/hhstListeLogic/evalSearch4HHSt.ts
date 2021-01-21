
import { HHSt } from "./HHStType";
import {
  SearchNode,
  SearchNodeLogical,
  SearchNodeNumeric,
  SearchNodePseudoNumeric,
  SearchNodeText
} from "./searchTreeTypes";

function isSearchedLogical(
  hhst: HHSt,
  searchTree: SearchNodeLogical
): boolean {
  switch (searchTree.subtype) {
    case "true":
      return true;
    case "and":
      return (
        isSearched(hhst, searchTree.node1) && // eslint-disable-line no-use-before-define
        isSearched(hhst, searchTree.node2) // eslint-disable-line no-use-before-define
      );
    case "or":
      return (
        isSearched(hhst, searchTree.node1) || // eslint-disable-line no-use-before-define
        isSearched(hhst, searchTree.node2) // eslint-disable-line no-use-before-define
      );
    case "not":
      return !isSearched(hhst, searchTree.node); // eslint-disable-line no-use-before-define
  }
}

function includesIgnoreCase(text: string, snippet: string) {
  return text.toUpperCase().includes(snippet.toUpperCase());
}

function isSearchedText(
  hhst: HHSt,
  searchTree: SearchNodeText
): boolean {
  switch (searchTree.subtype) {
    case "fulltext":
      return includesIgnoreCase(
        hhst.zweck + hhst.sollJahr1,
        searchTree.value
      );
    case "single":
      return includesIgnoreCase(
        hhst[searchTree.columnName] as string,
        searchTree.value
      );
  }
}

export function isSearched(
  hhst: HHSt,
  searchTree: SearchNode | null
): boolean {
  if (!searchTree) return false;
  switch (searchTree.type) {
    case "logical":
      return isSearchedLogical(hhst, searchTree);
    case "pseudonumeric":
      return isSearchedPseudonumeric(hhst, searchTree);
    case "text":
      return isSearchedText(hhst, searchTree);

    default:
      return isSearchedNumeric(hhst, searchTree);
  }
}

function isSearchedPseudonumeric(
  hhst: HHSt,
  searchTree: SearchNodePseudoNumeric
): boolean {
  const columnValue: string = hhst[
    searchTree.columnName
  ] as string;
  switch (searchTree.subtype) {
    case "equal":
      return (
        searchTree.value ===
        columnValue.substr(0, searchTree.value.length)
      );
    case "greater":
      return (
        columnValue >=
        searchTree.value.substr(0, columnValue.length)
      );
    case "smaller":
      return (
        columnValue.substr(0, searchTree.value.length) <=
        searchTree.value
      );
    case "range":
      return (
        columnValue.substr(0, searchTree.value1.length) >=
          searchTree.value1 &&
        columnValue.substr(0, searchTree.value2.length) <=
          searchTree.value2
      );
  }
}

function isSearchedNumeric(
  hhst: HHSt,
  searchTree: SearchNodeNumeric
): boolean {
  const columnVal = hhst[searchTree.columnName] as string;
  const columnValue = parseInt(columnVal, 10);
  switch (searchTree.subtype) {
    case "equal":
      return parseInt(searchTree.value,10) === columnValue;
    case "greater":
      return columnValue >= parseInt(searchTree.value, 10);
    case "smaller":
      return columnValue <= parseInt(searchTree.value,10 );
    case "range":
      return (
        columnValue >= parseInt(searchTree.value1, 10) &&
        columnValue <= parseInt(searchTree.value2, 10)
      );
  }
}
