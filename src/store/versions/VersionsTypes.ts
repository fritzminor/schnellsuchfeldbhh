
import { BaseData } from "../AppState";

/** A tree containing all data in the leafs.
 *  You can get to the leafs via orgBudgetName-> budgetName->lineName -> modStateName.
 *  BaseData is not necessarily available; possibly, it has to be fetched from local or remote storage.
 *
 * {@see VersionDescriptor}
 *
 */
export type VersionsTree =
  // orgs
  Map<
    string,
    // budgets
    BudgetsMap
  >;

export type VersionDescriptor = {
  /** e.g. "Bundeshaushalt", "Sondervermögen XY", "Landeshaushalt Z" */
  orgBudgetName: string;
  /** e.g. "BHH 2021", "Nachtrag 2021"
   *
   */
  budgetName: string;
  /** A line has one or many modStates.
   * e.g. "FM-Ziel", "Ressortforderung", "Regierungsentwurf"
   */
  lineName: string;

  /** Modification state. Each change or each bundle of changes results in a modification state.
   * e.g. "uploaded at 2021-12-13", "Änderungen lt. Regierungsbeschluss v. 13.12.2021",
   *      "Haushaltsberatungen UM/FM am 10.10.2021"
   */
  modStateName: string;

  /** milliseconds since UNIX epoch (January 1, 1970).
   * used for sorting.
   *  @see Date.getTime()
   */
  timestamp: number;
};

/**
 * {@see VersionsTree}
 */
export type BudgetsMap = Map<string, LinesMap>;

/**
 * {@see VersionsTree}
 */
export type LinesMap = Map<string, ModStatesMap>;

/**
 * {@see VersionsTree}
 */
export type ModStatesMap = Map<
  string,
  { baseData?: BaseData }
>;

export type Name2VersionDesc = {
  name: string;
  versionDesc: VersionDescriptor;
};

export type VersionsSelection = {
  orgBudgets: Name2VersionDesc[];
  budgets: Name2VersionDesc[];
  lines: Name2VersionDesc[];
  modStates: Name2VersionDesc[];
};
