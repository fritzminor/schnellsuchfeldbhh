import { HHSt } from "./HHStType";
import {
  SearchNode,
  SearchNodeLogicalAnd,
  SearchNodeLogicalOr,
  SearchNodeText,
  SearchParserException,
  Token,
  Tokens
} from "./searchTreeTypes";

export function tokenizer(query: string): Tokens {
  const regExResult = query.match(
    /([^,\s():-]+|[\s]+|:|\(|\)|-|,)/g
  );
  const result: Tokens = {
    singleTokens: [],
    origQuery: query
  };

  if (regExResult) {
    let pos = 0;
    for (let i = 0; i < regExResult.length; i++) {
      const content = regExResult[i];
      result.singleTokens.push({
        content: startsWithWhitespace(content) // eslint-disable-line
          ? " "
          : content,
        pos
      });
      pos += content.length;
    }
  }
  return result;
}

/** returns true, if the token is a whitespace placeholder, '(',')',',', null or undefined.
 *  i.e. it returns false e.g. for a '-'
 *
 */
function _isBoundary(token: Token): boolean {
  if (token) {
    switch (token.content) {
      case " ":
      case "(":
      case ")":
      case ",":
        return true;
      case "-":
      default:
        return false;
    }
  }
  return true;
}

export function parser(tokens: Tokens): SearchNode {
  let parsedTree: SearchNode | null = null;
  let nToken = 0;
  do {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const { searchNode, nextToken } = _parseLeftFirst(
      parsedTree,
      tokens,
      nToken,
      0
    );
    parsedTree = searchNode;
    nToken = nextToken;
  } while (tokens.singleTokens.length > nToken);
  return parsedTree;
}

function _parserLoop(
  tokens: Tokens,
  currentToken: number,
  currentDepth: number
): { searchNode: SearchNode; nextToken: number } {
  let parsedTree: SearchNode | null = null;
  let nToken = currentToken;
  let closingBracket = false;
  do {
    const { searchNode, nextToken } = _parseLeftFirst(
      // eslint-disable-line @typescript-eslint/no-use-before-define
      parsedTree,
      tokens,
      nToken,
      currentDepth
    );
    parsedTree = searchNode;
    nToken = nextToken;
    closingBracket =
      tokens.singleTokens[nToken]?.content === ")";
  } while (
    tokens.singleTokens.length > nToken &&
    !closingBracket
  );

  if (!closingBracket && currentDepth > 0)
    throw new SearchParserException(
      "Fehlende schließende Klammer",
      tokens.singleTokens[nToken - 1]?.pos || 0,
      tokens
    );
  return {
    searchNode: parsedTree,
    nextToken: closingBracket ? nToken + 1 : nToken
  };
}

/** returns true if first word is a blank. */
function startsWithWhitespace(value: string) {
  return value && value.charAt(0) === " ";
}

/** internal function: is called by #parser().
 * It parses only a single expression and returns early.
 * creates a tree, in which left operands are in deeper position. i.e. left operands
 * will be evaluated first.
 * It will return an SearchNodeLogicalAnd (or if currentToken is a commma, a SearchNodeLogicalOr)
 * with the given leftNode and the parsed right node.
 *
 */
function _parseLeftFirst(
  leftNode: SearchNode | null,
  tokens: Tokens,
  currentToken: number,
  currentDepth: number
): { searchNode: SearchNode; nextToken: number } {
  const skipWhiteSpace = () => {
    if (token0?.content === " ") {
      // eslint-disable-line @typescript-eslint/no-use-before-define
      currentToken++;
      token0 = tokens.singleTokens[currentToken]; // eslint-disable-line @typescript-eslint/no-use-before-define
    }
  };

  function _parseNonKeyWord(token: Token): SearchNode {
    let content = token.content;

    // take following text into account, if not a boundary (e.g. whitespace)
    while (
      !_isBoundary(tokens.singleTokens[currentToken + 1])
    ) {
      currentToken++;
      content += tokens.singleTokens[currentToken].content;
    }

    const hgrRegEx = /^\d$/;
    if (hgrRegEx.test(content)) {
      const searchNode: SearchNode = {
        type: "pseudonumeric",
        subtype: "equal",
        columnName: "gruppe",
        keyword: "Grp",
        value: content
      };
      return searchNode;
    }

    const eplRegEx = /^\d\d$/;
    if (eplRegEx.test(content)) {
      const searchNode: SearchNode = {
        type: "pseudonumeric",
        subtype: "equal",
        columnName: "epl",
        keyword: "Epl",
        value: content
      };
      return searchNode;
    }

    const gruppeRegEx = /^\d\d\d$/;
    if (gruppeRegEx.test(content)) {
      const searchNode: SearchNode = {
        type: "pseudonumeric",
        subtype: "equal",
        columnName: "gruppe",
        keyword: "Grp",
        value: content
      };
      return searchNode;
    }

    const eplKapRegEx = /^(\d\d)(\d\d)\/?$/;
    const eplKapMatch = eplKapRegEx.exec(content);
    if (eplKapMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: {
          type: "pseudonumeric",
          subtype: "equal",
          columnName: "epl",
          keyword: "Epl",
          value: eplKapMatch[1]
        },
        node2: {
          type: "pseudonumeric",
          subtype: "equal",
          columnName: "kap",
          keyword: "Kap",
          value: eplKapMatch[2]
        }
      };
      return searchNode;
    }

    const eplKapGrpRegEx = /^(\d\d)(\d\d)\/?(\d{1,3})$/;
    const eplKapGrpMatch = eplKapGrpRegEx.exec(content);
    if (eplKapGrpMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: {
          type: "pseudonumeric",
          subtype: "equal",
          columnName: "epl",
          keyword: "Epl",
          value: eplKapGrpMatch[1]
        },
        node2: {
          type: "logical",
          subtype: "and",
          node2: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "gruppe",
            keyword: "Grp",
            value: eplKapGrpMatch[3]
          },
          node1: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "kap",
            keyword: "Kap",
            value: eplKapGrpMatch[2]
          }
        }
      };
      return searchNode;
    }

    const titelRegEx = /^(\d\d)(\d\d)\/?(\d{1,3})(\d{1,2})$/;
    const titelMatch = titelRegEx.exec(content);
    if (titelMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: {
          type: "logical",
          subtype: "and",
          node1: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "epl",
            keyword: "Epl",
            value: titelMatch[1]
          },
          node2: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "kap",
            keyword: "Kap",
            value: titelMatch[2]
          }
        },
        node2: {
          type: "logical",
          subtype: "and",
          node1: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "gruppe",
            keyword: "Grp",
            value: titelMatch[3]
          },
          node2: {
            type: "pseudonumeric",
            subtype: "equal",
            columnName: "suffix",
            keyword: "TG",
            value: titelMatch[4]
          }
        }
      };
      return searchNode;
    }

    // else: fulltext
    const searchNode: SearchNode = {
      type: "text",
      subtype: "fulltext",
      value: content.toLowerCase()
    };
    return searchNode;
  }

  function parseTextValue(
    keyword: string,
    columnName: keyof HHSt | "Volltext"
  ): SearchNodeText {
    currentToken += 2;
    const colonToken =
      tokens.singleTokens[currentToken - 1];
    if (!colonToken || colonToken.content !== ":")
      throw new SearchParserException(
        `Doppelpunkt hinter ${token0.content} fehlt.`, // eslint-disable-line @typescript-eslint/no-use-before-define
        token0.pos + token0.content.length,
        tokens
      );
    const token2 = tokens.singleTokens[currentToken];
    if (columnName === "Volltext")
      return {
        type: "text",
        subtype: "fulltext",
        value: token2.content
      };
    else
      return {
        type: "text",
        subtype: "single",
        columnName,
        keyword,
        value: token2.content
      };
  }

  function parseNumericValue(
    keyword: string,
    columnName: keyof HHSt,
    minDigits: number | "",
    maxDigits: number | "",
    pseudonumeric: boolean
  ): SearchNode {
    const nodeType = pseudonumeric
      ? "pseudonumeric"
      : "numeric";
    const valueRegex = new RegExp(
      `^\\d{${minDigits},${maxDigits}}$`
    );
    
    currentToken += 2;
    const colonToken =
      tokens.singleTokens[currentToken - 1];
    if (!colonToken || colonToken.content !== ":")
      throw new SearchParserException(
        `Doppelpunkt hinter ${token0.content} fehlt.`,
        token0.pos + token0.content.length,
        tokens
      );
    const token2 = tokens.singleTokens[currentToken];
    const smaller = token2?.content === "-";
    if (smaller) currentToken++;
    //console.log("currentToken: ", currentToken);
    const numberToken = smaller
      ? tokens.singleTokens[currentToken]
      : token2;
    //console.log("numberToken: ", numberToken);
    const number = numberToken
      ? valueRegex.exec(numberToken.content)
      : null;
    if (!number)
      throw new SearchParserException(
        `${minDigits || 0}-${
          maxDigits || "10"
        } Ziffern hinter ${token0.content}:${
          smaller ? "-" : ""
        } erwartet`,
        tokens.singleTokens[currentToken - 1].pos + 1,
        tokens
      );
    const greater =
      !smaller &&
      tokens.singleTokens[currentToken + 1]?.content ===
        "-";

    if (greater) {
      currentToken++;

      const number2 = tokens.singleTokens[currentToken + 1]
        ? valueRegex.exec(
            tokens.singleTokens[currentToken + 1].content
          )
        : null;

      if (number2) {
        // value range
        currentToken++;
        const parsedNode: SearchNode = {
          type: nodeType,
          subtype: "range",
          value1: number[0],
          value2: number2[0],
          columnName,
          keyword
        };
        return parsedNode;
      } else {
        // logical greater SearchNode
        const parsedNode: SearchNode = {
          type: nodeType,
          subtype: "greater",
          value: number[0],
          columnName,
          keyword
        };
        return parsedNode;
      }
    } else {
      const parsedNode: SearchNode = {
        type: nodeType,
        subtype: smaller ? "smaller" : "equal",
        value: number[0],
        columnName,
        keyword
      };
      return parsedNode;
    }
  }

  let token0 = tokens.singleTokens[currentToken];

  skipWhiteSpace();
  const logicalOr = token0?.content === ",";

  if (logicalOr) {
    currentToken++;
    token0 = tokens.singleTokens[currentToken];
    skipWhiteSpace();
  }

  if (!token0) {
    // nothing or only whitespace
    return {
      // returning leftNode or true
      searchNode: leftNode || {
        type: "logical",
        subtype: "true"
      },
      nextToken: currentToken + 1
    };
  }

  let parsedNode: SearchNode;
  switch (token0.content.toUpperCase()) {
    case "EPL": // TODO: Epl:1 als Epl:01
      parsedNode = parseNumericValue(
        "Epl",
        "epl",
        2,
        2,
        true
      );
      break;
    case "KAP": // TODO: Kap:0102 als EPl:01 Kap:02
      // TODO: Kap:2 als Kap:02
      parsedNode = parseNumericValue(
        "Kap",
        "kap",
        2,
        2,
        true
      );
      break;
    case "GRUPPE":
    case "GRP":
      parsedNode = parseNumericValue(
        "Grp",
        "gruppe",
        1,
        3,
        true
      );
      break;

    case "SUFFIX":
    case "TG":
      parsedNode = parseNumericValue(
        "TG",
        "suffix",
        1,
        2,
        true
      );
      break;

    case "FKZ":
      parsedNode = parseNumericValue(
        "FKZ",
        "fkz",
        1,
        3,
        true
      );
      break;

    case "SOLL_ERSTJAHR":
    case "SOLL1":
    case "S1":
      parsedNode = parseNumericValue(
        "Soll1",
        "sollJahr1",
        1,
        "",
        false
      );
      break;

    case "TITELNR":
    case "KZN":
      throw new Error(`TODO: ${token0.content} kann der 
      Prototyp noch nicht.`);

    case "ZWECK":
      parsedNode = parseTextValue("Zweck", "zweck");
      break;

    case "VOLLTEXT":
      parsedNode = parseTextValue("Volltext", "Volltext");
      break;

    //TODO: check other keywords
    case "-":
      currentToken++;
      const negatedResult = _parseLeftFirst( // eslint-disable-line no-case-declarations
        null,
        tokens,
        currentToken,
        currentDepth
      );

      parsedNode = {
        type: "logical",
        subtype: "not",
        node: negatedResult.searchNode
      };
      currentToken = negatedResult.nextToken-1;
      break;
    case "(":
      currentToken++;
      const parsedBrackets = _parserLoop( // eslint-disable-line no-case-declarations
        tokens,
        currentToken,
        currentDepth + 1
      );
      parsedNode = parsedBrackets.searchNode;
      currentToken = parsedBrackets.nextToken-1;
      break;
    case ")":
      if (currentDepth > 0) {
        if (leftNode)
          return {
            searchNode: leftNode,
            nextToken: currentToken + 1
          };
        else
          throw new SearchParserException(
            "Leere Klammern.",
            token0.pos,
            tokens
          );
      }
      throw new SearchParserException(
        "Fehlende öffnende Klammer",
        token0.pos,
        tokens
      );
    default:
      parsedNode = _parseNonKeyWord(token0);
  }

  currentToken++;
  const subtype = logicalOr ? "or" : "and";
  if (leftNode) {
    const searchNodeLogical: (
      | SearchNodeLogicalAnd
      | SearchNodeLogicalOr
    ) &
      SearchNode = {
      type: "logical",
      subtype,
      node1: leftNode,
      node2: parsedNode
    };
    return {
      searchNode: searchNodeLogical,
      nextToken: currentToken
    };
  } else
    return {
      searchNode: parsedNode,
      nextToken: currentToken
    };
}
