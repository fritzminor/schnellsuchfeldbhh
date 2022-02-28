import { BaseData } from "../AppState";
import {
  BudgetsMap,
  LinesMap,
  ModStatesMap,
  Name2VersionDesc,
  VersionDescriptor,
  VersionsSelection,
  VersionsTree
} from "./VersionsTypes";
import hhstDataBHH from "../material/bhh_long.json";
import { jsoning } from "../../utils/jsoning";
import { BaseDataWithDiffs } from "./DiffTypes";
import { compareBaseData } from "./compareBaseData";

const bhhBaseData = hhstDataBHH as BaseData;
export const versionsStore: VersionsTree = new Map();
addVersion(bhhBaseData);

export function addVersion(baseData: BaseData): void {
  console.log("addVersion", baseData);
  const versionDesc = baseData.versionDesc;
  if (!versionDesc)
    throw new Error("FATAL: Version descriptor missing.");

  const modState = versionsStore
    .get(versionDesc.orgBudgetName)
    ?.get(versionDesc.budgetName)
    ?.get(versionDesc.lineName)
    ?.get(versionDesc.modStateName);
  if (modState) {
    console.warn(
      "WARNUNG: Version wird überschrieben: ",
      versionDesc
    );
  }
  const modStatesMap: ModStatesMap =
    getModStatesMap(versionDesc) || new Map();
  modStatesMap.set(versionDesc.modStateName, { baseData });
  const sortedModStatesMap = new Map(
    [...modStatesMap].sort(sortModStates)
  );
  const linesMap: LinesMap =
    versionsStore
      .get(versionDesc.orgBudgetName)
      ?.get(versionDesc.budgetName) || new Map();
  linesMap.set(versionDesc.lineName, sortedModStatesMap);
  // TODO: sort lines map, budgets map and versions tree root
  const budgetsMap: BudgetsMap =
    versionsStore.get(versionDesc.orgBudgetName) ||
    new Map();
  budgetsMap.set(versionDesc.budgetName, linesMap);
  versionsStore.set(versionDesc.orgBudgetName, budgetsMap);
}

/** possibly returns undefined */
export function getBaseData(
  versionDesc: VersionDescriptor
): BaseData | undefined {
  return versionsStore
    .get(versionDesc.orgBudgetName)
    ?.get(versionDesc.budgetName)
    ?.get(versionDesc.lineName)
    ?.get(versionDesc.modStateName)?.baseData;
}

/** returns a single base data or base data that has
 * been compared to another version.
 * @param versionDesc - the currently displayed version
 * @param changedFromVersion - the
 * @returns the compared data or a single basedata, if
 *   changedFromVersion is not defined. It is undefined,
 *   if {@link getBaseData } is undefined
 */
export function getBaseDataWithDiffs(
  versionDesc: VersionDescriptor,
  changedFromVersion: VersionDescriptor | undefined
): BaseDataWithDiffs | undefined {
  if (changedFromVersion) {
    const current = getBaseData(versionDesc);
    const changedFrom = getBaseData(changedFromVersion);
    if (changedFrom && current) {
      const { targetWithDiffs } = compareBaseData(
        changedFrom,
        current
      );
      return targetWithDiffs;
    }
  }
  return getBaseData(versionDesc);
}

/** possibly returns undefined */
function getModStatesMap(versionDesc: VersionDescriptor) {
  return versionsStore
    .get(versionDesc.orgBudgetName)
    ?.get(versionDesc.budgetName)
    ?.get(versionDesc.lineName);
}
/** possibly returns undefined */
function getBudgetsMap(versionDesc: VersionDescriptor) {
  return versionsStore.get(versionDesc.orgBudgetName);
}

/** possibly returns undefined */
function getLinesMap(versionDesc: VersionDescriptor) {
  return versionsStore
    .get(versionDesc.orgBudgetName)
    ?.get(versionDesc.budgetName);
}

function sortModStates(
  a: [
    string,
    {
      baseData?: BaseData | undefined;
    }
  ],
  b: [
    string,
    {
      baseData?: BaseData | undefined;
    }
  ]
): number {
  const aBaseData = a[1].baseData;
  const bBaseData = b[1].baseData;
  if (!aBaseData || !bBaseData)
    throw new Error("No basedata for sorting");
  if (!aBaseData.versionDesc || !bBaseData.versionDesc)
    throw new Error("No version descriptor for sorting.");
  return (
    aBaseData.versionDesc.timestamp -
    bBaseData.versionDesc.timestamp
  );
}

export function getVersionsSelectionFor(
  versionDesc: VersionDescriptor
): VersionsSelection {
  const orgBudgets: Name2VersionDesc[] = [];
  const orgBudgetsMap = versionsStore;
  orgBudgetsMap.forEach((budgetMap, orgBudget) => {
    const linesMap = budgetMap.values().next()
      .value as LinesMap; // lines of first budget of orgBudget
    // TODO: check why do we have to make an explicit type cast for values().next() ????
    const modStatesMap = linesMap.values().next()
      .value as ModStatesMap; // modStates of first line
    const baseData = modStatesMap.values().next().value
      .baseData as BaseData | undefined;

    if (!baseData || !baseData.versionDesc) {
      console.error("modStatesMap", modStatesMap);
      console.error("baseData", baseData);
      console.error("versionDesc", baseData?.versionDesc);
      throw new Error(
        `No base data for orgBudget: ${jsoning(
          versionDesc
        )}`
      );
    }
    orgBudgets.push({
      name: orgBudget,
      versionDesc: baseData.versionDesc
    });
  });

  const budgets: Name2VersionDesc[] = [];
  const budgetsMap = getBudgetsMap(versionDesc);
  if (budgetsMap)
    budgetsMap.forEach((linesMap, budget) => {
      const modStatesMap = linesMap.values().next()
        .value as ModStatesMap; // modStates of first line
      // TODO: check why do we have to make an explicit type cast for values().next() ????
      const baseData = modStatesMap.values().next().value
        .baseData as BaseData | undefined;

      if (!baseData)
        throw new Error(
          `No base data for budget: ${jsoning(versionDesc)}`
        );
      budgets.push({
        name: budget,
        versionDesc: baseData.versionDesc
      });
    });

  const lines: Name2VersionDesc[] = [];
  const linesMap = getLinesMap(versionDesc);
  if (linesMap)
    linesMap.forEach((modStatesMap, line) => {
      console.log("line", line);
      // TODO: check why do we have to make an explicit type cast for values().next() ????
      const baseData = modStatesMap.values().next().value
        .baseData as BaseData | undefined;

      if (!baseData)
        throw new Error(
          `No base data for line: ${jsoning(versionDesc)}`
        );
      lines.push({
        name: line,
        versionDesc: baseData.versionDesc
      });
    });

  const modStates: Name2VersionDesc[] = [];
  const modStatesMap = getModStatesMap(versionDesc);
  if (modStatesMap)
    modStatesMap.forEach((modState) => {
      const baseData = modState.baseData;
      if (!baseData)
        throw new Error(
          `No base data for modState: ${jsoning(
            versionDesc
          )}`
        );
      modStates.push({
        name: baseData.versionDesc.modStateName,
        versionDesc: baseData.versionDesc
      });
    });
  console.log("modStates", modStates);
  return {
    orgBudgets,
    budgets,
    lines,
    modStates
  };
}
