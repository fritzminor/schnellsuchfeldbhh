import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import { HHSt } from "./HHStType";
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

    /** contains the HHSts filtered by searchTree */
    filteredHhstArray: HHSt[];

    totals: Totals;

    /** the first budget year = SollJahr1 */
    firstYear: number;
  };
};

/** helper method to get filteredHhstList from given searchexpression */
export function getFilteredHhstArray(
  hhstArray: HHSt[],
  searchexpression: string
): {
  searchTree: SearchNode | null;
  filteredHhstArray: HHSt[];
  totals: Totals;
} {
  const totals: Totals = {
    revenues: 0,
    expenses: 0
  };
  const searchTree = getSearchTree(searchexpression);
  const filteredHhstArray: HHSt[] = [];
 
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
  return { searchTree, filteredHhstArray,totals };
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
