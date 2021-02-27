import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import { HHSt } from "./HHStType";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { isSearched } from "../hhstliste/hhstListeLogic/evalSearch4HHSt";

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

    /** the first budget year = SollJahr1 */
    firstYear: number;
  };
};

/** helper method to get filteredHhstList from given searchexpression */
export function getFilteredHhstArray(hhstArray: HHSt[], searchexpression: string): {
  searchTree: SearchNode | null,
  filteredHhstArray: HHSt[];
} {
  const searchTree = getSearchTree(searchexpression);
  const filteredHhstArray = searchexpression.trim() ?
    hhstArray.filter((hhst) =>
      isSearched(hhst, searchTree)) :
    hhstArray;

  return { searchTree, filteredHhstArray };
}

/** helper method to get sums from given hhstArray */
export function getSums(hhstArray: HHSt[]) {

  const sums = hhstArray.reduce(
    (previousSums, hhst) => {
      if (hhst.expense)
        return {
          expenses:
            previousSums.expenses + hhst.sollJahr1,
          revenues: previousSums.revenues
        };
      else
        return {
          expenses: previousSums.expenses,
          revenues: previousSums.revenues + hhst.sollJahr1
        };
    },
    { expenses: 0, revenues: 0 }
  );
  return sums;
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