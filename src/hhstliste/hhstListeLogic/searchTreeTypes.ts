import { SectionMapName } from "../../store/AppState";
import { HHStFieldName, HHStSectionKeyField } from "../../store/HHStType";

export type Token = {
  pos: number;
  content: string;
};
export type Tokens = {
  singleTokens: Token[];
  origSearchExpression: string;
};

export class SearchParserException extends Error {
  constructor(public cause: string, public pos: number, public tokens: Tokens) {
    super(`${cause}\nFehler an Position ${pos} in '${tokens.origSearchExpression}'.`);
  }
}

/** The "base class" for the search tree
 * 
 */
export type SearchNode =
  | SearchNodeLogical
  | SearchNodeNumeric
  | SearchNodePseudoNumeric
  | SearchNodeText;

export type SearchNodeLogical = { type: "logical" } & (
  | SearchNodeLogicalAnd
  | SearchNodeLogicalOr
  | SearchNodeLogicalNot
  | SearchLogicalTrue
);

export type SearchNodeLogicalAnd = {
  subtype: "and";
  node1: SearchNode;
  node2: SearchNode;
};

export type SearchNodeLogicalOr = {
  subtype: "or";
  node1: SearchNode;
  node2: SearchNode;
};

export type SearchNodeLogicalNot = {
  subtype: "not";
  node: SearchNode;
};

export type SearchLogicalTrue = { subtype: "true" };

/**
 * PseudoNumeric ist z.B. GRP: oder EPL: es ist wird mit Zahlen gebildet,
 * ist aber eine Aneinanderreihung von Zeichen. Im Gegensatz zu Zahlen (numeric) werden
 * bei PseudoNumeric nur die Anzahl Zeichen verglichen, die auch im Suchausdruck enthalten sind.
 * Z.B. ergibt ein GRP:0 auch eine Haushaltsstelle mit Gruppe 011 (nur das erste Zeichen wird verglichen).
 */
export type SearchNodePseudoNumeric = { type: "pseudonumeric" } & (
  | SearchNodeNumericEqual
  | SearchNodeNumericGreater
  | SearchNodeNumericSmaller
  | SearchNodeNumericRange
) &
  SearchNodePropertyColumn;

export type SearchNodeNumeric = { type: "numeric" } & (
  | SearchNodeNumericEqual
  | SearchNodeNumericGreater
  | SearchNodeNumericSmaller
  | SearchNodeNumericRange
) &
  SearchNodePropertyColumn;

export type SearchNodeNumericEqual = {
  subtype: "equal";
} & SearchNodePropertyValue;

export type SearchNodeNumericGreater = {
  subtype: "greater";
} & SearchNodePropertyValue;
export type SearchNodeNumericSmaller = {
  subtype: "smaller";
} & SearchNodePropertyValue;
export type SearchNodeNumericRange = {
  subtype: "range";
  value1: string;
  value2: string;
};

export type SearchNodeText = {
  type: "text";
  value: string;
} & (SearchNodeTextSingleColumn | SearchNodeTextFullText);

export type SearchNodeTextSingleColumn = {
  subtype: "single";
} & SearchNodePropertyColumn;

export type SearchNodeTextFullText = {
  subtype: "fulltext";
};

export type SearchNodePropertyColumnSectionMap = 
{  colType: "sectionMap";
  sectionMap: SectionMapName;
  sectionKeyField: HHStSectionKeyField;
  
};

export type SearchNodePropertyColumn = {keyword: string;} & ({
  colType: "field";
  columnName: HHStFieldName;
  
} | SearchNodePropertyColumnSectionMap);

export type SearchNodePropertyValue = { value: string };
