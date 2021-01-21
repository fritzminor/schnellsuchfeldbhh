import {
  SearchNode,
  SearchNodeLogical
} from "./searchTreeTypes";
import { parser, tokenizer } from "./searchParserImpl";

export function getSearchTree(
  searchExpression: string
): SearchNode | null {
  if (searchExpression) {
    const tokens = tokenizer(searchExpression);
    const searchTree = parser(tokens);
    console.log("SearchTree",searchTree);
    return searchTree;
    // prototype cannot yet parse this expression
  } else {
    const result: SearchNodeLogical = {
      type: "logical",
      subtype: "true"
    };
    return result;
  }
}
