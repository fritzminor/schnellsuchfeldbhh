import * as React from "react";
import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import {
  AppState,
  getFilteredHhstArray,
  BaseData,
  Totals,
  emptyBaseData,
  CoreAppState
} from "./AppState";
import { HHStOrBlock } from "./HHStType";

import hhstDataBHH from "./material/bhh_long.json";
import hhstData01_02 from "./material/bhh_epl01_02.json";
import { errorMessage } from "../utils/errorMessage";
import {
  addVersion,
  getBaseData,
  getBaseDataWithDiffs,
  getVersionsSelectionFor,
  versionsStore
} from "./versions/VersionsStore";
import { VersionDescriptor } from "./versions/VersionsTypes";
import { jsoning } from "../utils/jsoning";
import { cloneDeep } from "lodash";
import { VersionProperties } from "../modal/versionproperties/VersionProperties";
import { applyChanges } from "./versions/combineBaseData";

const baseDataArrays: { [index in UserName]: BaseData } = {
  BearbeiterGesamtBHH: hhstDataBHH as BaseData,
  BearbeiterEpl01und02: hhstData01_02 as BaseData,
  LokaleDaten: cloneDeep(emptyBaseData)
};

export function createStore( // eslint-disable-line  @typescript-eslint/explicit-module-boundary-types
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  const getUpdateState = (
    prevState: CoreAppState,
    stateUpdaters: Partial<CoreAppState>
  ): AppState => {
    const newCoreState: CoreAppState = {
      ...prevState,
      ...stateUpdaters
    };
    return {
      ...newCoreState,
      derived: getDerivedFrom(newCoreState)
    };
  };

  const updateState = (updater: Partial<CoreAppState>) => {
    setState((prevState) => {
      return getUpdateState(prevState, updater);
    });
  };

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
    modalInfo: AppState["modalInfo"]
  ): void => {
    updateState({
      modalInfo
    });
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
   *
   * @see addImportData
   * @see addVersion
   */
  function setVersion(
    versionDesc: Readonly<VersionDescriptor>
  ) {
    const baseData = getBaseData(versionDesc);
    if (baseData) {
      baseDataArrays.LokaleDaten = baseData;
      console.log("setVersion", baseData.versionDesc);
      updateState({
        currentUser: "LokaleDaten",
        versionDesc: versionDesc
      });
    } else
      showUserMessage(
        `Keine Daten für diese Version: ${jsoning(
          versionDesc
        )}`
      );
  }

  /** Sets the version that the current version should be compared with.
   *
   * The version should be made available via VersionsStore#addVersion before
   *  calling this method.
   *
   * @see setVersion
   */
  function setChangedFromVersion(
    changedFromVersionDesc: Readonly<VersionDescriptor> | null
  ) {
    updateState({
      changedFromVersion: changedFromVersionDesc
    });
  }

  function setCurrentUser(newCurrentUser: UserName) {
    updateState({
      currentUser: newCurrentUser,
      versionDesc:
        baseDataArrays[newCurrentUser].versionDesc
    });
  }

  /** TODO: should ask user, if
   * proposed version is correct.
   * @param askUser - usually a two-step-process:
   *   - the import/import*-functions call this function with true
   *   - the ModalVersionProperties dialog calls this function
   *     with false
   * @param importAsChanges - if only some changes are imported
   *    (e.g. Nachtragshaushalt), this parameter should be set
   *    to true. In this case the basedata of the currently
   *    used version is combined with the imported changes.
   */
  function addImportData(
    importData: BaseData,
    askUser = true,
    importAsChanges = false
  ) {
    if (askUser) {
      const versionProps: VersionProperties = {
        type: "VersionProperties",
        basedata: importData,
        fileName: "", //TODO
        addImportData
      };
      setModalInfo(versionProps);
    } else {
      setState((prevState) => {
        if (importAsChanges) {
          const origin = prevState.derived.currentBaseData;
          importData = applyChanges(origin, importData);
        }
        addVersion(importData); // add version to versionsStore

        baseDataArrays.LokaleDaten = importData;

        return getUpdateState(prevState, {
          modalInfo: null,
          currentUser: "LokaleDaten",
          versionDesc: importData.versionDesc
        });
      });
    }
  }

  return {
    setSearchExpression(
      searchexpression: string,
      noUpdate?: boolean
    ): void {
      if (!noUpdate)
        history.push({
          search: searchexpression
            ? "?q=" + encodeURIComponent(searchexpression)
            : ""
        });

      updateState({
        searchexpression
      });
    },

    setCurrentUser,
    addImportData,

    setVersion,
    setChangedFromVersion,
    setShowOnlyChanges(showOnlyChanges: boolean) {
      updateState({ showOnlyChanges });
    },

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
export type SetChangedFromVersion =
  Store["setChangedFromVersion"];
export type SetShowOnlyChanges =
  Store["setShowOnlyChanges"];
export type AddImportData = Store["addImportData"];

function getDerivedFrom(
  coreAppState: CoreAppState
): AppState["derived"] {
  const {
    searchexpression,
    currentUser,
    changedFromVersion,
    showOnlyChanges
  } = coreAppState;
  let searchTree: SearchNode | null;
  let searchParseErrMessage: string | undefined;
  let changedFromTotals: Totals | undefined;
  let baseData =
    currentUser === "LokaleDaten" &&
    coreAppState.changedFromVersion // TODO: check if this check is really necessary
      ? getBaseDataWithDiffs(
          coreAppState.versionDesc,
          coreAppState.changedFromVersion,
          showOnlyChanges
        )
      : baseDataArrays[currentUser];
  if (!baseData) baseData = baseDataArrays[currentUser];
  const versionsSelection = getVersionsSelectionFor(
    baseData.versionDesc
  );
  const changedFromVersionsSelection = changedFromVersion
    ? getVersionsSelectionFor(changedFromVersion)
    : versionsSelection;
  let filteredHhstArray: HHStOrBlock[];
  let totals: Totals;

  try {
    const {
      searchTree: _searchTree,
      filteredHhstArray: _filteredHhstArray,
      totals: _totals,
      changedFromTotals: _changedFromTotals
    } = getFilteredHhstArray(
      baseData,
      searchexpression,
      true
    );
    searchTree = _searchTree;
    filteredHhstArray = _filteredHhstArray;
    totals = _totals;
    changedFromTotals= _changedFromTotals;
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
    versionsSelection,
    changedFromVersionsSelection,
    changedFromTotals
  };
}

/** can be used to initialize appState */
export function getStateFrom(
  searchexpression: string,
  currentUser: UserName
): AppState {
  const coreAppState: CoreAppState = {
    versionsTree: versionsStore,
    versionDesc: baseDataArrays[currentUser].versionDesc,
    changedFromVersion: null, // default: no comparision
    showOnlyChanges: true, // default: show only changes
    searchexpression,
    currentUser,
    modalInfo: null
  };
  const derived = getDerivedFrom(coreAppState);

  return { ...coreAppState, derived };
}
