import { cloneDeep } from "lodash";
import { BaseData, emptyBaseData } from "../AppState";
import { compareHHSt } from "../compareHHSt";

/** applies changes to orgin and returns new combined BaseData.
 * E.g. if the basedata of a "Nachtragshaushalt" only contains the hhsts which
 * are changed, the complete data of the "Stammhaushalt" and the "Nachtragshaushalt"
 * representing the whole budget can be created by this function.
 * @param origin - the old data, e.g. the "Stammhaushalt".
 *   origin.hhsts are excpected to be ordered by compareHhst()
 * @param changes - the changes, usually less data than the origin, e.g.
 *   the "Nachtragshaushalt".
 *   changes.hhsts are excpected to be ordered by compareHhst()
 */
export function applyChanges(
  origin: BaseData,
  changes: BaseData
): BaseData {
  const result: BaseData = cloneDeep(emptyBaseData);
  result.versionDesc = cloneDeep(changes.versionDesc);
  result.eplMap = cloneDeep(origin.eplMap); // TODO: apply changes to eplMap correctly
  for(let k in changes.eplMap){
    result.eplMap[k]=changes.eplMap[k];
  }
  result.kapMap = cloneDeep(origin.kapMap); // TODO: apply changes to kapMap correctly
  for(let k in changes.kapMap){
    result.kapMap[k]=changes.kapMap[k];
  }
  result.tgMap = cloneDeep(origin.tgMap); // TODO: apply changes to tgMap  correctly
  for(let k in changes.tgMap){
    result.tgMap[k]=changes.tgMap[k];
  }
  
  result.firstYear = (changes.firstYear)? changes.firstYear: origin.firstYear;
  
  const rHhsts = result.hhsts;
  let o = 0,
    c = 0;
  while (
    o < origin.hhsts.length ||
    c < changes.hhsts.length
  ) {
    const oHhst = origin.hhsts[o];
    const cHhst = changes.hhsts[c];
    const cmp =
      o >= origin.hhsts.length
        ? 1 // out of bounds => oHhst > cHhst
        : c >= changes.hhsts.length
        ? -1 // out of bounds => oHhst < cHhst
        : compareHHSt(oHhst, cHhst);
    if (cmp < 0) {
      //oHhst < cHhst
      rHhsts.push(cloneDeep(oHhst));
      o++;
    } else {
      // oHhst >= cHhst
      // new hhst or changed hhst

      rHhsts.push(cloneDeep(cHhst));
      c++;
      if (cmp == 0) {
        // oHhst == cHhst
        // => changed hhst in changes
        o++;
      }
    }
  }
  return result;
}
