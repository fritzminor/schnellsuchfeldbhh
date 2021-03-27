import * as React from "react";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import {
  AppState,
  getFilteredHhstArray,
  SectionMap,
  Totals
} from "./AppState";
import { HHSt, HHStOrBlock } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_bpbt.json";
import { AnalyzeResults } from "../import/importAnalyseSheet";
//import hhstData from "./material/bhh_short.json";

export type BaseData = {
  firstYear: number;
  hhsts: HHSt[];
  eplMap: SectionMap;
  kapMap: SectionMap;
  tgMap: SectionMap;
};

export const emptyBaseData: BaseData = {
  firstYear: 0,
  hhsts: [],
  eplMap: {},
  kapMap: {},
  tgMap: {}
};

function transformExampleData(
  exampleData: {
    expense: boolean;
    epl: string;
    kap: string;
    gruppe: string;
    suffix: string;
    fkz: string;
    zweck: string;
    sollJahr1: number;
    kennzeichen: string[];
  }[], firstYear=2021
): BaseData {
  return {
    ...emptyBaseData,
    firstYear,
    hhsts: exampleData.map((exampleRow) => {
      const hhst: HHSt = { type: "hhst", ...exampleRow };
      return hhst;
    })
  };
}

const baseDataArrays: { [index in UserName]: BaseData } = {
  BearbeiterGesamtBHH: transformExampleData(
    hhstDataBHH.hhsts
  ),
  BearbeiterEpl01und02: transformExampleData(
    hhstData01_02.hhsts
  ),
  LokaleDaten: {...emptyBaseData}
};

/*
const hhFirstYears: { [index in UserName]: number } = {
  BearbeiterGesamtBHH: 2021,
  BearbeiterEpl01und02: 2021,
  LokaleDaten: 0
};

const hhTgMaps: { [index in UserName]: SectionMap } = {
  BearbeiterGesamtBHH: {},
  BearbeiterEpl01und02: {},
  LokaleDaten: {}
};
*/

export function createStore( // eslint-disable-line  @typescript-eslint/explicit-module-boundary-types
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  const history = {
    push: ({ search }: { search: string }) => {
      const location = window.location;
      const url = new URL(location.toString());
      url.search = search;
      console.log("url", url, url.toString());
      window.history.pushState(null, "", url.toString());
    }
  };
  const setModalInfo = (
    modalInfo: string | AnalyzeResults | null
  ): void => {
    setState((prevState: AppState) => ({
      ...prevState,
      modalInfo
    }));
  };

  const hideUserMessage = () => {
    setModalInfo(null);
  };

  return {
    setSearchExpression(
      searchexpression: string,
      noUpdate?: boolean
    ) {
      if (!noUpdate)
        history.push({
          search: searchexpression
            ? "?q=" + encodeURIComponent(searchexpression)
            : ""
        });

      setState((prevState: AppState) => ({
        ...prevState,
        searchexpression,
        derived: getDerivedFrom(
          searchexpression,
          prevState.currentUser
        )
      }));
    },

    setCurrentUser(newCurrentUser: UserName) {
      setState((prevState) => ({
        ...prevState,
        currentUser: newCurrentUser,
        derived: getDerivedFrom(
          prevState.searchexpression,
          newCurrentUser
        )
      }));
    },

    setLocalData(localData:BaseData
    ) {
      baseDataArrays.LokaleDaten = localData;
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
      setTimeout(() => {
        hideUserMessage();
      }, timeout);
    }
  };
}

export type Store = ReturnType<typeof createStore>;

function getDerivedFrom(
  searchexpression: string,
  currentUser: UserName
): AppState["derived"] {
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;
  const baseData=baseDataArrays[currentUser];
  const hhstArray = baseData.hhsts;
  const tgMap = baseData.tgMap;
  let filteredHhstArray: HHStOrBlock[];
  let totals: Totals;

  try {
    const {
      searchTree: _searchTree,
      filteredHhstArray: _filteredHhstArray,
      totals: _totals
    } = getFilteredHhstArray(
      hhstArray,
      tgMap,
      searchexpression,
      true
    );
    searchTree = _searchTree;
    filteredHhstArray = _filteredHhstArray;
    totals = _totals;
  } catch (err) {
    console.log(err);
    searchTree = null;
    searchParseErrMessage = err.message;
    filteredHhstArray = [];
    totals = { revenues: 0, expenses: 0 };
  }
  return {
    searchParseErrMessage,
    searchTree,
    hhstArray,
    tgMap,
    filteredHhstArray,
    firstYear: baseData.firstYear,
    totals
  };
}

/** can be used to initialize appState */
export function getStateFrom(
  searchexpression: string,
  currentUser: UserName
): AppState {
  return {
    searchexpression,
    currentUser,
    modalInfo: null,
    derived: getDerivedFrom(searchexpression, currentUser)
  };
}
