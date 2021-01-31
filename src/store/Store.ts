import { History } from "history";
import * as React from "react";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../users/UsersTypes";
import { AppState } from "./AppState";
import { HHSt } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_bpbt.json";
//import hhstData from "./material/bhh_short.json";

const hhstDataArrays: { [index in UserName]: HHSt[] } = {
  "BearbeiterGesamtBHH": hhstDataBHH.hhsts,
  "BearbeiterEpl01und02": hhstData01_02.hhsts
};


export function createStore( // eslint-disable-line  @typescript-eslint/explicit-module-boundary-types
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  history: History
) {
  return {
    setSearchExpression(searchexpression: string) {
      history.push({
        search: searchexpression
          ? "?q=" + encodeURIComponent(searchexpression)
          : undefined
      });

 

      setState((prevState: AppState) => ({
        ...prevState,
        searchexpression,
        derived: getDerivedFrom(searchexpression,prevState.currentUser)
      }));
    },
    setCurrentUser(newCurrentUser: UserName) {
      setState((prevState) => ({

        ...prevState,
        currentUser: newCurrentUser
      }))
    }
  };
}

function getDerivedFrom(searchexpression: string, currentUser: UserName): AppState["derived"] {
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;

  try {
    searchTree = getSearchTree(searchexpression);
  } catch (err) {
    console.log(err);
    searchTree = null;
    searchParseErrMessage = err.message;
  }
  return {
    searchParseErrMessage,
    searchTree,
    hhstArray: hhstDataArrays[currentUser]
  
  }
}


export function getStateFrom(searchexpression: string, currentUser: UserName): AppState {
  return {

    searchexpression,
    currentUser,
    derived: getDerivedFrom(searchexpression, currentUser)

  }
}