import * as React from "react";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import {
  AppState,
  getFilteredHhstArray,
  BaseData,
  Totals,
  emptyBaseData
} from "./AppState";
import { HHStOrBlock } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_epl01_02.json";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import { errorMessage } from "../utils/errorMessage";
import {
  addVersion,
  getBaseData,
  getVersionsSelectionFor,
  versionsStore
} from "./VersionsStore";
import { VersionDescriptor } from "./VersionsTypes";
import { jsoning } from "../utils/jsoning";

const baseDataArrays: { [index in UserName]: BaseData } = {
  BearbeiterGesamtBHH: hhstDataBHH as BaseData,
  BearbeiterEpl01und02: hhstData01_02 as BaseData,
  LokaleDaten: { ...emptyBaseData }
};

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

  /** shows a user message for a given time.
   * @param userMessage - message to be shown in a modal dialog
   * @param timeout  - timeout in ms, default: 15000
   */
  function showUserMessage(
    userMessage: string,
    timeout = 15000
  ) {
    setModalInfo(userMessage);
    setTimeout(() => {
      hideUserMessage();
    }, timeout);
  }

  function showError(msg: string, error: string) {
    console.log("Showing error ", msg, error);
    showUserMessage(msg);
  }

  /** The version should be made available via VersionsStore#addVersion before
   *  calling this method.
   */
  function setVersion(versionDesc:VersionDescriptor) {
    const baseData=getBaseData(versionDesc);
    if(baseData) {
      baseDataArrays.LokaleDaten=baseData;
      console.log("setVersion", baseData.versionDesc);
      setState((prevState) => ({
        ...prevState,
        currentUser: "LokaleDaten",
        derived: getDerivedFrom(
          prevState.searchexpression,
          "LokaleDaten"
        )
      }));
    } else
      showUserMessage(`Keine Daten für diese Version: ${jsoning(versionDesc)}`)
  }

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

    addImportData(localData: BaseData) {
      addVersion(localData);
      baseDataArrays.LokaleDaten = localData;
    },

    setVersion,

    setModalInfo,
    /** hides user message */
    hideUserMessage,
    showUserMessage,
    showError
  };
}

export type Store = ReturnType<typeof createStore>;
export type SetModalInfo = Store["setModalInfo"];
export type SetVersion = Store["setVersion"];

function getDerivedFrom(
  searchexpression: string,
  currentUser: UserName
): AppState["derived"] {
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;
  const baseData = baseDataArrays[currentUser];
  const versionsSelection = getVersionsSelectionFor(
    baseData.versionDesc
  );
  let filteredHhstArray: HHStOrBlock[];
  let totals: Totals;

  try {
    const {
      searchTree: _searchTree,
      filteredHhstArray: _filteredHhstArray,
      totals: _totals
    } = getFilteredHhstArray(
      baseData,
      searchexpression,
      true
    );
    searchTree = _searchTree;
    filteredHhstArray = _filteredHhstArray;
    totals = _totals;
  } catch (err) {
    console.log(err);
    searchTree = null;
    searchParseErrMessage = errorMessage(err);
    filteredHhstArray = [];
    totals = { revenues: 0, expenses: 0 };
  }

  return {
    searchParseErrMessage,
    searchTree,
    currentBaseData: baseData,
    filteredHhstArray,
    totals,
    versionsSelection
  };
}

/** can be used to initialize appState */
export function getStateFrom(
  searchexpression: string,
  currentUser: UserName
): AppState {
  const derived = getDerivedFrom(
    searchexpression,
    currentUser
  );

  return {
    versionsTree: versionsStore,
    searchexpression,
    currentUser,
    modalInfo: null,
    derived
  };
}
