/** This module manages a cache for {@link BaseDataWithDiffs}
 *
 */

import { compareBaseData } from "./compareBaseData";
import { VersionDescriptor } from "./VersionsTypes";

/** type representing two datasets, one with only the changes between two versions,
 *  one additionally with the unchanged data of the new version.
 */
export type DiffedBaseDatas = ReturnType<
  typeof compareBaseData
>;
const diffedBaseDatas = new Map<string, DiffedBaseDatas>();

/** returns a string respresentation of the given versionDesc. */
function getVersionPath(versionDesc: VersionDescriptor) {
  return (
    versionDesc.orgBudgetName +
    "/" +
    versionDesc.budgetName +
    "/" +
    versionDesc.lineName +
    "/" +
    versionDesc.timestamp
  );
}

function getDiffPath(
  versionDesc: VersionDescriptor,
  changedFrom: VersionDescriptor
) {
  return (
    getVersionPath(versionDesc) +
    "/cmp/" +
    getVersionPath(changedFrom)
  );
}
/** puts a version diff into the cache or replaces it.
 *
 * This function should be used via {@link getBaseDataWithDiffs }
 */
export function addBaseDataWithDiff2Cache(
  versionDesc: VersionDescriptor,
  changedFrom: VersionDescriptor,
  data: DiffedBaseDatas
): void {
  diffedBaseDatas.set(getDiffPath(versionDesc,changedFrom),data);
}

/** returns the cached base datas (both with all the hhsts or only the hanges) of a comparison between two versions
 *  or undefined, if diff has not yet been cached.
 * This function should be used via {@link getBaseDataWithDiffs }
 */
export function getCachedBaseDataWithDiffs(
  versionDesc: VersionDescriptor,
  changedFrom: VersionDescriptor
): DiffedBaseDatas | undefined {
  return diffedBaseDatas.get(
    getDiffPath(versionDesc, changedFrom)
  );
}
