import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../users/UsersTypes";
import { HHSt } from "./HHStType";

export type AppState = {
  searchexpression:string;
  currentUser: UserName;
  derived: {
    searchTree: SearchNode | null;
    searchParseErrMessage?: string;

    /** contains all HHSt of the given user (not restricted to searchexpression / searchTree) */
    hhstArray: HHSt[];
  }
}