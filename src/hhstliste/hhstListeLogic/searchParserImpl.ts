import { HHStFieldName } from "../../store/HHStType";
import {
  SearchNode,
  SearchNodeLogicalAnd,
  SearchNodeLogicalOr,
  SearchNodeText,
  SearchParserException,
  Token,
  Tokens
} from "./searchTreeTypes";

/** This function cuts the searchexpression into parseable tokens.
 * @see parser()
 */
export function tokenizer(
  searchexpression: string
): Tokens {
  const regExResult = searchexpression.match(
    /([^,\s():-]+|[\s]+|:|\(|\)|-|,)/g
  );
  const result: Tokens = {
    singleTokens: [],
    origSearchExpression: searchexpression
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

/**
 * The main parser function.
 * 
 * The parser loop is somehow complicated because the search term is evaluated 
 * in order to prefer left terms before right terms.
 *  
 * @param tokens - returned by tokenizer()

 */
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

/** internal function: is called by #_parserLoop().
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

    const createPseudoNumericEqualsNode = (
      columnName: HHStFieldName,
      keyword: string,
      value = content
    ): SearchNode => ({
      type: "pseudonumeric",
      subtype: "equal",
      colType: "field",
      columnName,
      keyword,
      value
    });
    const hgrRegEx = /^\d$/;
    if (hgrRegEx.test(content))
      return createPseudoNumericEqualsNode("gruppe", "Grp");

    const eplRegEx = /^\d\d$/;
    if (eplRegEx.test(content))
      return createPseudoNumericEqualsNode("epl", "Epl");

    const gruppeRegEx = /^\d\d\d$/;
    if (gruppeRegEx.test(content))
      return createPseudoNumericEqualsNode("gruppe", "Grp");

    const eplKapRegEx = /^(\d\d)(\d\d)\/?$/;
    const eplKapMatch = eplKapRegEx.exec(content);
    if (eplKapMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: createPseudoNumericEqualsNode(
          "epl",
          "Epl",
          eplKapMatch[1]
        ),
        node2: createPseudoNumericEqualsNode(
          "kap",
          "Kap",
          eplKapMatch[2]
        )
      };
      return searchNode;
    }

    const eplKapGrpRegEx = /^(\d\d)(\d\d)\/?(\d{1,3})$/;
    const eplKapGrpMatch = eplKapGrpRegEx.exec(content);
    if (eplKapGrpMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: createPseudoNumericEqualsNode(
          "epl",
          "Epl",
          eplKapGrpMatch[1]
        ),
        node2: {
          type: "logical",
          subtype: "and",
          node2: createPseudoNumericEqualsNode(
            "gruppe",
            "Grp",
            eplKapGrpMatch[3]
          ),
          node1: createPseudoNumericEqualsNode(
            "kap",
            "Kap",
            eplKapGrpMatch[2]
          )
        }
      };
      return searchNode;
    }

    /* ---------- search for 0102/53201 ---------*/
    const titelRegEx = /^(\d\d)(\d\d)\/?(\d{1,3})(\d{1,2})$/;
    const titelMatch = titelRegEx.exec(content);
    if (titelMatch) {
      const searchNode: SearchNode = {
        type: "logical",
        subtype: "and",
        node1: {
          type: "logical",
          subtype: "and",
          node1: createPseudoNumericEqualsNode(
            "epl",
            "Epl",
            titelMatch[1]
          ),
          node2: createPseudoNumericEqualsNode(
            "kap",
            "Kap",
            titelMatch[2]
          )
        },
        node2: {
          type: "logical",
          subtype: "and",
          node1: createPseudoNumericEqualsNode(
            "gruppe",
            "Grp",
            titelMatch[3]
          ),
          node2: createPseudoNumericEqualsNode(
            "suffix",
            "EZ",
            titelMatch[4]
          )
        }
      };
      return searchNode;
    }

    /* --------- search for 1304TG51 -------*/
    const eplKapTGRegEx = /^(\d\d)(\d\d)TG(\d{1,2})$/i;
    const eplKapTGMatch = eplKapTGRegEx.exec(content);
    if (eplKapTGMatch) {
      const searchNode: SearchNode = createPseudoNumericEqualsNode(
        "tgKey",
        "TG", //TODO: implement /TG:\d{4}TG\d{1,2}/i
        `${eplKapTGMatch[1]}${
          eplKapTGMatch[2]
        }TG${eplKapTGMatch[3].padStart(2, "0")}`
      );
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
    columnName: HHStFieldName | "Volltext"
  ): SearchNodeText {
    currentToken += 2;
    const colonToken =
      tokens.singleTokens[currentToken - 1];
    if (!colonToken || colonToken.content !== ":")
      throw new SearchParserException(
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        `Doppelpunkt hinter "${token0.content}" fehlt.`,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        token0.pos + token0.content.length,
        tokens
      );
    const token2 = tokens.singleTokens[currentToken];

    if (!token2 || !token2.content)
      throw new SearchParserException(
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        `Angabe hinter "${token0.content}:" fehlt.`,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        token0.pos + token0.content.length,
        tokens
      );

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
        colType:"field",
        columnName,
        keyword,
        value: token2.content
      };
  }

  /** parses numeric and pseudonumeric terms
   * such as "Grp:532" or "Soll1:1000-"
   */
  function parseNumericValue(
    keyword: string,
    columnName: HHStFieldName,
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

    function numberedTokenContent(token: Token): string {
      return pseudonumeric &&
        minDigits &&
        token.content.length < minDigits
        ? token.content.padStart(minDigits, "0")
        : token.content;
    }

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

    // makes Epl:1 to Epl:01
    const numberTokenContent = numberedTokenContent(
      numberToken
    );

    const number = numberToken
      ? valueRegex.exec(numberTokenContent)
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
            numberedTokenContent(
              tokens.singleTokens[currentToken + 1]
            )
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
          colType: "field",
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
          colType: "field",
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
        colType:"field",
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
    case "TG": // TODO: make extra search criterion for Titelgruppe
    case "ENDZIFFER":
    case "EZ":
      parsedNode = parseNumericValue(
        "EZ",
        "suffix",
        2,
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
      {
        currentToken++;
        const negatedResult = _parseLeftFirst(
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
        currentToken = negatedResult.nextToken - 1;
      }
      break;
    case "(":
      {
        currentToken++;
        const parsedBrackets = _parserLoop(
          tokens,
          currentToken,
          currentDepth + 1
        );
        parsedNode = parsedBrackets.searchNode;
        currentToken = parsedBrackets.nextToken - 1;
      }
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
