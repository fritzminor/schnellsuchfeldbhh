import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import {
  HHSt,
  HHStBlockLimiter,
  HHStOrBlock
} from "./HHStType";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { isSearched } from "../hhstliste/hhstListeLogic/evalSearch4HHSt";

export type Totals = {
  revenues: number;
  expenses: number;
};

export type AppState = {
  searchexpression: string;
  currentUser: UserName;

  modalInfo: string | AnalyzeResults | null;

  derived: {
    searchTree: SearchNode | null;
    searchParseErrMessage?: string;

    /** contains all HHSt of the given user (not restricted to searchexpression / searchTree) */
    hhstArray: HHSt[];

    /** contains the HHSts filtered by searchTree plus block elements for (sub-)totals. */
    filteredHhstArray: HHStOrBlock[];

    totals: Totals;

    /** the first budget year = SollJahr1 */
    firstYear: number;
  };
};

/** helper method to get filteredHhstList from given searchexpression */
export function getFilteredHhstArray(
  hhstArray: HHSt[],
  searchexpression: string,
  withBlocks = false
): {
  searchTree: SearchNode | null;
  filteredHhstArray: HHStOrBlock[];
  totals: Totals;
} {
  const totals: Totals = {
    revenues: 0,
    expenses: 0
  };
  const searchTree = getSearchTree(searchexpression);
  const filteredHhstArray: HHStOrBlock[] = [];


  hhstArray.forEach((hhst) => {
    if (isSearched(hhst, searchTree)) {
      filteredHhstArray.push(hhst);
      if (hhst.expense) {
        totals.expenses += hhst.sollJahr1;
      } else {
        totals.revenues += hhst.sollJahr1;
      }
    }
  });

  if (withBlocks) {
    const totalRevenues: HHStBlockLimiter = {
      type: "block",
      blockstart: false,
      epl: "",
      kap: "",
      gruppe: "",
      suffix: "",
      fkz: "",
      zweck: "Gesamteinnahmen",
      sollJahr1: totals.revenues
    };
    filteredHhstArray.push(totalRevenues);
    const totalExpenses: HHStBlockLimiter = {
      ...totalRevenues,
      zweck: "Gesamtausgaben",
      expense:true,
      sollJahr1: totals.expenses
    };
    filteredHhstArray.push(totalExpenses);
  }
  return { searchTree, filteredHhstArray, totals };
}

/** helper method.
 * returns a number formatted with . as 000 separator and a comma 0
 */
export function formatBetrag(betrag: number): string {
  return betrag === 0
    ? "-"
    : betrag.toLocaleString("de-DE", {
        minimumFractionDigits: 1
      });
}
