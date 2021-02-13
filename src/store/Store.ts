import { History } from "history";
import * as React from "react";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AppState } from "./AppState";
import { HHSt } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_bpbt.json";
import { isSearched } from "../hhstliste/hhstListeLogic/evalSearch4HHSt";
//import hhstData from "./material/bhh_short.json";

const hhstDataArrays: { [index in UserName]: HHSt[] } = {
  "BearbeiterGesamtBHH": hhstDataBHH.hhsts,
  "BearbeiterEpl01und02": hhstData01_02.hhsts,
  "LokaleDaten": []
};


const hhstFirstYears: { [index in UserName]: number } = {
  "BearbeiterGesamtBHH": 2021,
  "BearbeiterEpl01und02": 2021,
  "LokaleDaten": 0
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
        derived: getDerivedFrom(searchexpression, prevState.currentUser)
      }));
    },

    setCurrentUser(newCurrentUser: UserName) {
      setState((prevState) => ({

        ...prevState,
        currentUser: newCurrentUser,
        derived: getDerivedFrom(prevState.searchexpression, newCurrentUser)
      }))
    },

    setLocalData(hhsts: HHSt[], firstYear:number) {
      hhstDataArrays.LokaleDaten = hhsts;
      hhstFirstYears.LokaleDaten = firstYear;
    }
  };
}

function getDerivedFrom(searchexpression: string, currentUser: UserName): AppState["derived"] {
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;
  const hhstArray = hhstDataArrays[currentUser];
  let filteredHhstArray: HHSt[];

  try {
    searchTree = getSearchTree(searchexpression);
    filteredHhstArray = searchexpression.trim() ?
      hhstArray.filter((hhst) =>
        isSearched(hhst, searchTree)) :
      hhstArray;

  } catch (err) {
    console.log(err);
    searchTree = null;
    searchParseErrMessage = err.message;
    filteredHhstArray = [];
  }
  return {
    searchParseErrMessage,
    searchTree,
    hhstArray,
    filteredHhstArray,
    firstYear: hhstFirstYears[currentUser]

  }
}


/** can be used to initialize appState */
export function getStateFrom(searchexpression: string, currentUser: UserName): AppState {
  return {

    searchexpression,
    currentUser,
    derived: getDerivedFrom(searchexpression, currentUser)

  }
}