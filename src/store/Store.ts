import * as React from "react";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AppState, getFilteredHhstArray } from "./AppState";
import { HHSt } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_bpbt.json";
import { isSearched } from "../hhstliste/hhstListeLogic/evalSearch4HHSt";
import { AnalyzeResults } from "../import/importAnalyseSheet";
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

) {
  const history = {
    push: ({ search }: { search: string; }) => {
      const location = window.location;
      const url = new URL(window.location.toString());
      url.search = search;
      console.log("url", url, url.toString());
      window.history.pushState(null, "", url.toString());
    }
  };
  const setModalInfo = (modalInfo: string | AnalyzeResults| null): void => {
    setState((prevState: AppState) => ({
      ...prevState,
      modalInfo
    }));
  };

  const hideUserMessage = () => {
    setModalInfo(null);
  };

  return {
    setSearchExpression(searchexpression: string, noUpdate?: boolean) {
      if (!noUpdate)
        history.push({
          search: searchexpression
            ? "?q=" + encodeURIComponent(searchexpression)
            : ""
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
      }));
    },

    setLocalData(hhsts: HHSt[], firstYear: number) {
      hhstDataArrays.LokaleDaten = hhsts;
      hhstFirstYears.LokaleDaten = firstYear;
    },
    setModalInfo,
    /** hides user message */
    hideUserMessage,

    /** shows a user message for a given time.
     * @param userMessage - message to be shown in a modal dialog
     * @param timeout  - timeout in ms, default: 15000
     */
    showUserMessage(userMessage: string, timeout = 15000) {
      setModalInfo(userMessage);
      setTimeout(() => { hideUserMessage(); }, timeout);
    },

    
  };
}

export type Store = ReturnType<typeof createStore>;

function getDerivedFrom(searchexpression: string, currentUser: UserName): AppState["derived"] {
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;
  const hhstArray = hhstDataArrays[currentUser];
  let filteredHhstArray: HHSt[];

  try {
    const {searchTree:_searchTree, filteredHhstArray:_filteredHhstArray}= getFilteredHhstArray(hhstArray,searchexpression);
    searchTree = _searchTree;
    filteredHhstArray = _filteredHhstArray;

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

  };
}


/** can be used to initialize appState */
export function getStateFrom(searchexpression: string, currentUser: UserName): AppState {
  return {

    searchexpression,
    currentUser,
    modalInfo: null,
    derived: getDerivedFrom(searchexpression, currentUser)

  };
}