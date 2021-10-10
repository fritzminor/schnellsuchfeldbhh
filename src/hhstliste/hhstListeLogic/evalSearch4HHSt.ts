import { BaseData } from "../../store/AppState";
import {
  HHSt,
  HHStSectionKeyField
} from "../../store/HHStType";
import {
  SearchNode,
  SearchNodeLogical,
  SearchNodeNumeric,
  SearchNodePseudoNumeric,
  SearchNodeText,
  SearchNodeTextSingleColumn
} from "./searchTreeTypes";

/** checks whether hhst is matched by searchTree
 *
 */
export function isSearched(
  hhst: HHSt,
  searchTree: SearchNode | null,
  baseData: BaseData
): boolean {
  /* This method is a wrapper for the following methods.
     Its purpose is to provide baseData to these functions.
     */
  function _isSearched(
    hhst: HHSt,
    searchTree: SearchNode | null
  ): boolean {
    if (!searchTree) return false;
    switch (searchTree.type) {
      case "logical":
        return _isSearchedLogical(hhst, searchTree);
      case "pseudonumeric":
        return _isSearchedPseudonumeric(hhst, searchTree);
      case "text":
        return _isSearchedText(hhst, searchTree);

      default:
        return _isSearchedNumeric(hhst, searchTree);
    }
  }

  function _isSearchedLogical(
    hhst: HHSt,
    searchTree: SearchNodeLogical
  ): boolean {
    switch (searchTree.subtype) {
      case "true":
        return true;
      case "and":
        return (
          _isSearched(hhst, searchTree.node1) && // eslint-disable-line no-use-before-define
          _isSearched(hhst, searchTree.node2) // eslint-disable-line no-use-before-define
        );
      case "or":
        return (
          _isSearched(hhst, searchTree.node1) || // eslint-disable-line no-use-before-define
          _isSearched(hhst, searchTree.node2) // eslint-disable-line no-use-before-define
        );
      case "not":
        return !_isSearched(hhst, searchTree.node); // eslint-disable-line no-use-before-define
    }
  }

  function _isSearchedText(
    hhst: HHSt,
    searchNode: SearchNodeText
  ): boolean {
    switch (searchNode.subtype) {
      case "fulltext": {
        let hhstFulltext = hhst.zweck + hhst.sollJahr1;
        if (hhst.tgKey)
          hhstFulltext += baseData.tgMap[hhst.tgKey].name;
        return includesIgnoreCase(
          hhstFulltext,
          searchNode.value
        );
      }
      case "single": {
        const columnValue: string | false = _getColValue(
          searchNode,"name"
        );
        if (!columnValue) return false;

        return includesIgnoreCase(
          columnValue,
          searchNode.value
        );
      }
    }
  }

  function _isSearchedPseudonumeric(
    hhst: HHSt,
    searchNode: SearchNodePseudoNumeric
  ): boolean {
    const columnValue: string | false = _getColValue(
      searchNode
    );
    if (!columnValue) return false;

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

  function _isSearchedNumeric(
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
        return (
          parseInt(searchNode.value, 10) === columnValue
        );
      case "greater":
        return (
          columnValue >= parseInt(searchNode.value, 10)
        );
      case "smaller":
        return (
          columnValue <= parseInt(searchNode.value, 10)
        );
      case "range":
        return (
          columnValue >= parseInt(searchNode.value1, 10) &&
          columnValue <= parseInt(searchNode.value2, 10)
        );
    }
  }

  /** returns value from field in hhst or from SectionMap, e.g. for
   * tgMap for numbers or names from Titelgruppen
   * 
   * @param searchNode 
   * @param shortOrName if section field: "name" for description, 
   *   "short" for TG number (default)
   */
  function _getColValue(
    searchNode:
      | SearchNodeNumeric
      | SearchNodePseudoNumeric
      | SearchNodeTextSingleColumn,
      shortOrName:"name"|"short"="short"
  ): false | string {
    let colValue;
    if (searchNode.colType === "field") {
      colValue = hhst[searchNode.columnName];
    } else {
      const sectionKeyField: HHStSectionKeyField =
        searchNode.sectionKeyField;
      const sectionKey = hhst[sectionKeyField];
      if (!sectionKey)
        // no TG for this HHSt?
        return false;
      else
      { 
        const sectMap=baseData[searchNode.sectionMap];
        colValue =
          sectMap[sectionKey][shortOrName];
      }
    }
    if (colValue) return colValue as string;
    else return false;
  }

  // That's the only statement in isSearched().
  return _isSearched(hhst, searchTree);
}

function includesIgnoreCase(text: string, snippet: string) {
  return text.toUpperCase().includes(snippet.toUpperCase());
}
