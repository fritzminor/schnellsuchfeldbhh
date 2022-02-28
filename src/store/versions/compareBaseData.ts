import { cloneDeep, isEqual } from "lodash";
import { BaseData } from "../AppState";
import { compareHHSt, compareHHStKey } from "../compareHHSt";
import { getHHStValue, HHStValue } from "../HHStType";
import {
  BaseDataWithDiffs,
  HHStWithDiff
} from "./DiffTypes";

/** compares two basedatas and returns the differences.
 * @param origin - the old data,
 * @param target - the new data,
 * @returns the changes in two variants:
 *   - targetWithDiffs is the target-BaseData with the differences
 *     to origin.
 *   - changes contains only the changes, but also with the
 *     differences to origin
 */
export function compareBaseData(
  origin: BaseData,
  target: BaseData
): {
  targetWithDiffs: BaseDataWithDiffs;
  changes: BaseDataWithDiffs;
} {
  const tHhsts: HHStWithDiff[] = [];
  const cHhsts: HHStWithDiff[] = [];

  const orgHhsts = origin.hhsts.slice().sort(compareHHStKey);
  const targetHhsts = target.hhsts.slice().sort(compareHHStKey);

  let o = 0,
    t = 0;
  while (
    o < orgHhsts.length ||
    t < targetHhsts.length
  ) {
    const oHhst = orgHhsts[o];
    const tHhst = targetHhsts[t];
    const cmp =
      o >= origin.hhsts.length
        ? 1 // out of bounds => oHhst > tHhst
        : t >= target.hhsts.length
          ? -1 // out of bounds => oHhst < cHhst
          : compareHHStKey(oHhst, tHhst);
    if (cmp < 0) {
      //oHhst < tHhst
      // => oHhst probably deleted
      if (oHhst.deleted) {
        // oh, unchanged
        // nothing's left to do

      } else {
        const changedHhst: HHStWithDiff = { ...cloneDeep(oHhst), deleted: true, changedFrom: getHHStValue(oHhst) };
        tHhsts.push(changedHhst);
        cHhsts.push(changedHhst);
      }
      o++;
    } else {
      // oHhst >= tHhst

      if (cmp == 0) {
        // oHhst == tHhst
        // => same hhst key
        if (oHhst.deleted && tHhst.deleted) {
          // both deleted
          // => do nothing
        } else {
          const oHhstValue = getHHStValue(oHhst);
          const tHhstValue = getHHStValue(tHhst);
          if (isEqual(oHhstValue, tHhstValue)) {
            // unchanged
            tHhsts.push({ ...cloneDeep(oHhst), changedFrom: undefined });
          } else {
            // changed
            const changedHhst: HHStWithDiff = { ...cloneDeep(tHhst), changedFrom: oHhst.deleted ? null : getChangedProperties(oHhst, tHhst) };
            tHhsts.push(changedHhst);
            cHhsts.push(changedHhst);
          }
        }
        t++; o++;
      } else {
        // oHhst > tHhst
        // probably new tHhst
        if (!tHhst.deleted) {
          // really new hhst
          const changedHhst: HHStWithDiff = { ...cloneDeep(tHhst), changedFrom: null };
          tHhsts.push(changedHhst);
          cHhsts.push(changedHhst);
        }
        t++;
      }
    }
  }

  const targetWithDiffs: BaseDataWithDiffs = {
    ...target,
    changedFrom: origin.versionDesc,
    hhsts: tHhsts.sort(compareHHSt) // sort is necessary because we used 
    // a sort orfer of compareHHStKey
  };
  return {
    targetWithDiffs,
    changes: { ...targetWithDiffs, hhsts: cHhsts.sort(compareHHSt) }
  };
}

/** returns only the changed properties. The vlaues are taken from oHhst. */
function getChangedProperties(oHhst: HHStValue, tHhst: HHStValue): Partial<HHStValue> {
  return {
    tgKey: getChangedProperty(oHhst.tgKey, tHhst.tgKey),
    fkz: getChangedProperty(oHhst.fkz, tHhst.fkz),
    zweck: getChangedProperty(oHhst.zweck, tHhst.zweck),
    sollJahr1: getChangedProperty(oHhst.sollJahr1, tHhst.sollJahr1),
    deleted: getChangedProperty(oHhst.deleted, tHhst.deleted),

  };
}

/** if params are not equal (!==), then return first param. 
 * If params are equal return undefined.
 */
function getChangedProperty<T>(o: T, t: T): T | undefined {
  return o === t ? undefined : o;
}