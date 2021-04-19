import {
  keywords,
  otherProposals,
  proposalsForEmptyField,
  regExMatchers,
  tags
} from "./EingabeHilfeData";
import {
  Keyword,
  EingabeHilfeItem
} from "./EingabeHilfeTypes";
export type FreifeldSucheState = {
  searchexpression: string;
  cursorPos: number;
};

export function getCurrentTokenAtPos(
  searchexpression: string,
  cursorPos: number
): {
  curToken: string;
  curTokenStart: number;
  curTokenLen: number;
} {
  let tokenEndFromPos = searchexpression
    .substr(cursorPos)
    .search(/[\s,()]/);
  if (tokenEndFromPos === -1)
    // not found?
    tokenEndFromPos =  searchexpression.length-cursorPos; // then: set to rest of expression

  const res = /([^ ,()-]+-?[^ ,()-]*)$/.exec(
    searchexpression.substr(0, cursorPos + tokenEndFromPos)
  );
  if (res === null)
    return {
      curToken: "",
      curTokenLen: 0,
      curTokenStart: cursorPos
    };
  else {
    const curTokenLen = res[1].length;
    return {
      curToken: res[1],
      curTokenStart:
        cursorPos + tokenEndFromPos - curTokenLen,
      curTokenLen
    };
  }
}

/** string.startsWith case-insensitive */
function startsWithIgnoreCase(
  exp: string,
  pattern: string
) {
  return exp
    .toUpperCase()
    .startsWith(pattern.toUpperCase());
}
/** string.includes case-insensitive */
function includesIgnoreCase(exp: string, pattern: string) {
  return exp.toUpperCase().includes(pattern.toUpperCase());
}

/** provides a fullMatchDescription. It is required that
 * curToken is a full match of the given keyword. Please
 * check before calling this function.
 * @param fullMatcher - for keywords with minDigits set:
 *   The first group of the regex provides
 *   the digits before the minus sign (if any),
 *   the second one the minus sign (if any) and
 *   the third group the digits behind the minus sign (if any)
 */
function fullMatchDescription(
  fullMatcher: RegExp,
  keyword: Keyword,
  curToken: string
): string {
  let fullMatchDescription = keyword.fullMatchDescriptor
    ? keyword.fullMatchDescriptor(curToken)
    : null;

  const regExRes = fullMatcher.exec(curToken);
  if (!regExRes)
    throw new Error(
      `FATAL: ${curToken} does not match ${fullMatcher}!!!`
    );
  if (!keyword.minDigits)
    fullMatchDescription = curToken.replace(
      fullMatcher,
      `Suche nach  ${keyword.name} mit $1 
   (${keyword.description}).`
    );

  if (!fullMatchDescription) {
    console.log("fullMatchRes", regExRes);
    if (regExRes[2]) {
      // Minus sign?
      if (regExRes[1]) {
        // before minus?
        if (regExRes[3]) {
          // before and after minus

          fullMatchDescription = curToken.replace(
            fullMatcher,
            `Suche nach allen Haushaltsstellen, bei denen ${keyword.name}
             zwischen $1 und  $3 liegt (${keyword.description}).`
          );
        } else {
          /* only before minus */

          fullMatchDescription = curToken.replace(
            fullMatcher,
            `Suche nach allen Haushaltsstellen, bei denen ${keyword.name} einen Wert 
            von gleich oder über $1 hat
            (${keyword.description}).`
          );
        }
      } else {
        if (regExRes[3]) {
          /* only after minus */

          fullMatchDescription = curToken.replace(
            fullMatcher,
            `Suche nach alles bis zu ${keyword.name} $3 
             (${keyword.description}).`
          );
        } else
          throw new Error(
            `FATAL: ${curToken} misses number!!!`
          );
      }
    } else {
      /* no minus sign. */
      if (regExRes[3])
        throw new Error(
          `FATAL: ${curToken} has two numbers, but no minus sign!!!`
        );

      fullMatchDescription = curToken.replace(
        fullMatcher,
        keyword.maxDigits /* pseudo number? */
          ? keyword.maxDigits === regExRes[1].length
            ? `Suche nach Haushaltsstellen, bei denen ${keyword.name} $1 ist 
               (${keyword.description}).`
            : `Suche nach Haushaltsstellen, bei denen ${keyword.name} mit $1 
               anfängt (${keyword.description}).`
          : `Suche nach Haushaltsstellen, bei denen der Betrag von ${keyword.name} $1 
             entspricht (${keyword.description}).`
      );
    }
  }
  console.log(fullMatchDescription);
  return fullMatchDescription;
}

function mapKeyword2EingabeHilfeItem(
  keyword: Keyword
): EingabeHilfeItem {
  return {
    proposal: keyword.name + ":",
    description: keyword.description
  };
}

/** Main logic of the eingabhilfen proposals. */
export function eingabehilfen({
  searchexpression,
  cursorPos
}: FreifeldSucheState): {
  items: EingabeHilfeItem[];
  fullMatch: string | null;
  helpText: string | null;
  curToken: string;
} {
  /* --------- leerer Token ---------- */
  const { curToken } = getCurrentTokenAtPos(
    searchexpression,
    cursorPos
  );
  if (curToken.length === 0) {
    const items: EingabeHilfeItem[] = [
      ...proposalsForEmptyField
    ];
    items.push(
      ...keywords.map(mapKeyword2EingabeHilfeItem)
    );
    const exampleProposal =
      proposalsForEmptyField[
        Math.floor(
          Math.random() * proposalsForEmptyField.length
        )
      ];
    return {
      items,
      fullMatch: null,
      curToken: "",
      helpText: `Bitte einen Suchausdruck eingeben, z.B. ${exampleProposal.proposal}
          für ${exampleProposal.description}.`
    };
  }

  /* --------- Schlüsselwörter allgemein ----------- */
  let fullMatch: string | null = null;
  let helpText: string | null = null;

  /*           Beginnt Token mit Schlüsselwort-Name? */
  /*     oder                                           */
  /*           Ist Token in Schlüsselwort-Beschreibung (erst ab zwei Zeichen)? */
  const items: EingabeHilfeItem[] = keywords
    .filter(
      (keyword) =>
        startsWithIgnoreCase(
          keyword.name + ":",
          curToken
        ) ||
        (curToken.length >= 2 &&
          includesIgnoreCase(keyword.description, curToken))
    )
    .map(mapKeyword2EingabeHilfeItem);

  /* Gibt es einen keyword - fullMatch? */
  for (let i = 0; i < keywords.length && !fullMatch; i++) {
    const keyword = keywords[i];
    const digits = `\\d{${keyword.minDigits},${
      keyword.maxDigits || ""
    }}`;
    const fullMatcher = keyword.minDigits
      ? new RegExp(
          `${keyword.name}:(${digits})?(-(${digits})?)?$`,
          "i"
        )
      : new RegExp(`${keyword.name}:(.+)$`, "i");

    //   console.log(curToken, "regex" + fullMatcher);
    if (
      curToken.length > `${keyword.name}:`.length &&
      fullMatcher.exec(curToken) &&
      (!keyword.minDigits ||
        !new RegExp(`^${keyword.name}:-$`, "i").exec(
          curToken
        ))
    ) {
      fullMatch = fullMatchDescription(
        fullMatcher,
        keyword,
        curToken
      );
    }

    if (
      !fullMatch &&
      keyword.minDigits &&
      keyword.minDigits >= 1
    ) {
      const partMatcher = new RegExp(
        `${keyword.name}:(\\d{0,})`,
        "i"
      );
      const partMatcherResult = partMatcher.exec(curToken);
      if (partMatcherResult) {
        helpText = `${keyword.name}: benötigt mindestens ${
          keyword.minDigits +
          (keyword.maxDigits
            ? ` und maximal ${keyword.maxDigits}.  `
            : " ")
        } 
          Ziffern. Bereiche sind möglich, z.B. ${
            keyword.name
          }:10-12 für 
          alles von ${keyword.name} 10 bis ${
          keyword.name
        } 12.`;
        const curValue = partMatcherResult[1];
        const newValue =
          curValue +
          "1111111".substr(
            0,
            keyword.minDigits
              ? keyword.minDigits - curValue.length
              : 0
          );
        items.push({
          proposal: `${keyword.name}:${newValue}`,
          description: `${keyword.description} - hier nach ${keyword.name} ${newValue}`
        });
      }
    }
  }

  /* ----------- Kennzeichen (Kzn:) --------- */
  items.push(
    ...tags
      .filter(
        (tag) =>
          startsWithIgnoreCase(
            "Kzn:" + tag.name,
            curToken
          ) ||
          startsWithIgnoreCase(tag.name, curToken) ||
          (curToken.length >= 2 &&
            (includesIgnoreCase(tag.name, curToken) ||
              includesIgnoreCase(
                tag.description,
                curToken
              )))
      )
      .map((tag) => {
        //console.log(tag.name, curToken, `Kzn:${tag.name}`.toUpperCase()===curToken.toUpperCase());
        if (
          `Kzn:${tag.name}`.toUpperCase() ===
          curToken.toUpperCase()
        )
          fullMatch = `Suche nach Kennzeichen ${tag.name} (${tag.description}).`;
        return {
          proposal: "Kzn:" + tag.name,
          description: tag.description
        };
      })
  );

  /* ---------- other proposals -----------*/

  if (curToken.length > 1)
    otherProposals
      .filter((proposal) =>
        includesIgnoreCase(proposal.description, curToken)
      )
      .forEach((proposal) => {
        items.push(proposal);
      });

  /* --------- proposals from keywords for (pseudo)number and text search  */

  keywords.forEach((keyword) => {
    function addItem(keyword: Keyword): void {
      items.push({
        proposal: keyword.name + ":" + curToken,
        description: keyword.description
      });
    }
    if (keyword.minDigits) {
      // (pseudo)number keyword?
      if (
        /^\d+/.exec(
          curToken
        ) /* token only consists of digits? */ &&
        curToken.length >= keyword.minDigits &&
        (!keyword.maxDigits ||
          curToken.length <= keyword.maxDigits)
      ) {
        addItem(keyword);
      }
    } else {
      // text keyword
      if (!curToken.includes(":")) addItem(keyword);
    }
  });

  /* ---------- RegExMatchers ----------- */
  regExMatchers.forEach((matcher) => {
    if (matcher.regEx.exec(curToken)) {
      const proposal1: EingabeHilfeItem = {
        proposal: curToken.replace(
          matcher.regEx,
          matcher.convertStr
        ),
        description: curToken.replace(
          matcher.regEx,
          matcher.descriptionStr
        )
      };
      fullMatch = proposal1.description;
      items.unshift(proposal1);
    }
  });
  if (!fullMatch && curToken.length > 0) {
    fullMatch = `Volltextsuche nach "${curToken}" in Zweckbestimmungen, Erläuterungen etc.`;
  }

  /* ------- Logische Verbindungen wie AND, OR oder NOT ------ */

  if (
    searchexpression.length === cursorPos &&
    curToken.length > 1
  ) {
    // cursor at end of line?
    items.push(
      {
        proposal: " ",
        additional: true,
        description:
          "Suche mit weiterem Suchausdruck eingrenzen"
      },
      {
        proposal: ", ",
        additional: true,
        description:
          "Suche mit Komma erweitern - es werden alle Haushaltsstellen angezeigt, die entweder den einen oder den anderen Suchausdruck erfüllen."
      },
      {
        proposal: " -",
        additional: true,
        description: `ohne folgenden Suchausdruck - Minuszeichen vor 
        Suchausdruck blendet alle Haushaltsstellen aus, die den Suchausdruck 
        erfüllen.`
      }
    );
  }

  return {
    items: removeDuplicateHelperItem(items), // eslint-disable-line @typescript-eslint/no-use-before-define
    fullMatch,
    curToken,
    helpText
  };
}

/* ------------- Helper methods ------------------ */

/** replaces current token at curPos in the searchexpression.
 * @see #getCurrentTokenAtPos()
 */
export function replaceToken(
  searchexpression: string,
  cursorPos: number,
  newToken: string,
  additional?: boolean
): string {
  const {  curTokenStart, curTokenLen } = getCurrentTokenAtPos(
    searchexpression,
    cursorPos
  );
  const startPos=additional?cursorPos:curTokenStart;
  const replaceLen=additional?0:curTokenLen
  const beforeToken = searchexpression.substr(
    0,
    startPos
  );
  const afterToken = searchexpression.substr(
    startPos+replaceLen,
    searchexpression.length-startPos-replaceLen
  );
  return beforeToken + newToken + afterToken;
}

export function removeDuplicateHelperItem(
  arrWithDups: EingabeHilfeItem[]
): EingabeHilfeItem[] {
  const items: EingabeHilfeItem[] = [];
  type ProposalType = EingabeHilfeItem["proposal"];
  const itemProposals: Set<ProposalType> = new Set();

  arrWithDups.forEach((item) => {
    if (!itemProposals.has(item.proposal)) {
      itemProposals.add(item.proposal);
      items.push(item);
    }
  });
  return items;
}
