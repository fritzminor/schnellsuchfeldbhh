import {
  BaseData,
  BudgetsMap,
  LinesMap,
  ModStatesMap,
  VersionsTree
} from "./AppState";
import hhstDataBHH from "./material/bhh_long.json";

const bhhBaseData = hhstDataBHH as BaseData;
export const versionsStore: VersionsTree = new Map();
addVersion(bhhBaseData);


export function addVersion(baseData: BaseData): void {
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
    versionsStore
      .get(versionDesc.orgBudgetName)
      ?.get(versionDesc.budgetName)
      ?.get(versionDesc.lineName) || new Map();
  modStatesMap.set(versionDesc.modStateName, { baseData });
  const linesMap: LinesMap =
    versionsStore
      .get(versionDesc.orgBudgetName)
      ?.get(versionDesc.budgetName) || new Map();
  linesMap.set(versionDesc.lineName, modStatesMap);
  const budgetsMap: BudgetsMap =
    versionsStore.get(versionDesc.orgBudgetName) ||
    new Map();
  budgetsMap.set(versionDesc.budgetName, linesMap);
  versionsStore.set(versionDesc.orgBudgetName, budgetsMap);
}
