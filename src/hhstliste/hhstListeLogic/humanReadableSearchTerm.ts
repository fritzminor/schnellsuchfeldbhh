import { SearchNode } from "./searchTreeTypes";

export function humanReadableSearchTerm(searchNode: SearchNode): string {
  const result = _humanReadableSearchTerm(searchNode);
  if (result.charAt(0) === "(" && result.charAt(result.length - 1) === ")")
    return result.substr(1, result.length - 2);
  else return result;
}

function _humanReadableSearchTerm(searchNode: SearchNode): string {
  if (searchNode) {
    switch (searchNode.type) {
      case "text":
        switch (searchNode.subtype) {
          case "single":
            return `${searchNode.keyword}:${searchNode.value}`;
          case "fulltext":
            return `VOLLTEXT:${searchNode.value}`;
        }
        // fall through
      case "logical":
        switch (searchNode.subtype) {
          case "and":
          case "or":
            const term1 = _humanReadableSearchTerm(searchNode.node1); // eslint-disable-line no-case-declarations
            const term2 = _humanReadableSearchTerm(searchNode.node2); // eslint-disable-line no-case-declarations
            return `(${term1}${
              searchNode.subtype === "and" ? " " : ", "
            }${term2})`;
          case "not":
            const subterm = _humanReadableSearchTerm(searchNode.node); // eslint-disable-line no-case-declarations
            return `-${subterm}`;
          case "true":
            return "alles";
        }
        // fall through
      case "pseudonumeric":
      case "numeric":
        switch (searchNode.subtype) {
          case "equal":
            return `${searchNode.keyword}:${searchNode.value}`;
          case "smaller":
            return `${searchNode.keyword}:-${searchNode.value}`;
          case "greater":
            return `${searchNode.keyword}:${searchNode.value}-`;
          case "range":
            return `${searchNode.keyword}:${searchNode.value1}-${searchNode.value2}`;
        

          default:
            throw new Error(
              "other subtypes not yet implemented:" +
                JSON.stringify(searchNode, undefined, "  ") +
                " TODO"
            );
        }
      default:
        throw new Error(
          "other stuff not yet implemented:" +
            JSON.stringify(searchNode, undefined, "  ") +
            " TODO"
        );
    }
  } else return "";
}
