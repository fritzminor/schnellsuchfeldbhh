import { HHSt } from "../../store/HHStType";
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
  searchNode: SearchNodeText
): boolean {
  switch (searchNode.subtype) {
    case "fulltext":
      return includesIgnoreCase(
        hhst.zweck + hhst.sollJahr1,
        searchNode.value
      );
    case "single":
      if (searchNode.colType !== "field")
      //TODO
      throw new Error(
        "Im Prototyp noch nicht implementiert: Suche nach Titelgruppenbezeichnungen, -nummern etc"
      );
  
      return includesIgnoreCase(
        hhst[searchNode.columnName] as string,
        searchNode.value
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
  searchNode: SearchNodePseudoNumeric
): boolean {
  if (searchNode.colType !== "field")
    //TODO
    throw new Error(
      "Im Prototyp noch nicht implementiert: Suche nach Titelgruppenbezeichnungen, -nummern etc"
    );

  const colValue = hhst[searchNode.columnName];
  if (!colValue) return false;

  const columnValue: string = colValue as string;

  switch (searchNode.subtype) {
    case "equal":
      return (
        searchNode.value ===
        columnValue.substr(0, searchNode.value.length)
      );
    case "greater":
      return (
        columnValue >=
        searchNode.value.substr(0, columnValue.length)
      );
    case "smaller":
      return (
        columnValue.substr(0, searchNode.value.length) <=
        searchNode.value
      );
    case "range":
      return (
        columnValue.substr(0, searchNode.value1.length) >=
          searchNode.value1 &&
        columnValue.substr(0, searchNode.value2.length) <=
          searchNode.value2
      );
  }
}

function isSearchedNumeric(
  hhst: HHSt,
  searchNode: SearchNodeNumeric
): boolean {
  if (searchNode.colType !== "field")
  //TODO
  throw new Error(
    "Im Prototyp noch nicht implementiert: Suche nach Titelgruppenbezeichnungen, -nummern etc"
  );

  const columnVal = hhst[searchNode.columnName] as string;
  const columnValue = parseInt(columnVal, 10);
  switch (searchNode.subtype) {
    case "equal":
      return parseInt(searchNode.value, 10) === columnValue;
    case "greater":
      return columnValue >= parseInt(searchNode.value, 10);
    case "smaller":
      return columnValue <= parseInt(searchNode.value, 10);
    case "range":
      return (
        columnValue >= parseInt(searchNode.value1, 10) &&
        columnValue <= parseInt(searchNode.value2, 10)
      );
  }
}
