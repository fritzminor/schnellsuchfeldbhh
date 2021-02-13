import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { HHSt } from "./HHStType";

export type AppState = {
  searchexpression:string;
  currentUser: UserName;


  derived: {
    searchTree: SearchNode | null;
    searchParseErrMessage?: string;

    /** contains all HHSt of the given user (not restricted to searchexpression / searchTree) */
    hhstArray: HHSt[];
    
    /** contains the HHSts filtered by searchTree */
    filteredHhstArray: HHSt[];

    /** the first budget year = SollJahr1 */
    firstYear: number;
  }
}