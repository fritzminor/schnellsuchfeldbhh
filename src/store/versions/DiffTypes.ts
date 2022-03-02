import { BaseData } from "../AppState";
import { HHSt, HHStValue } from "../HHStType";
import { VersionDescriptor } from "./VersionsTypes";

export type HHStWithDiff = HHSt & {

  /** changedFrom contains the value of this hhst 
   * in the origin basedata.
   * If it is undefined, the current hhst has not changed.
   * If it is defined, only the properties that have differences to
   * the current hhst are defined (changed hhst value).
   * Thus, if current value has deleted:true, all the properties
   * of changedFrom are defined (deleted hhst value). In such case, all the properties 
   * of current hhst value have the same value but deleted is true.
   * 
   * For new hhst values, changedFrom is null.
   */
  changedFrom?:Partial<HHStValue>| null;
}

/** returns true if hhst.changedFrom is null */
export function isNewHhst(hhst:Partial<HHStWithDiff>):boolean {
  return null===hhst.changedFrom;
}

/** returns true if hhst.changedFrom has a value, even if the value is null */
export function isModifiedHhst(hhst:Partial<HHStWithDiff>):boolean {
  return  hhst.changedFrom!==undefined;
}


export type BaseDataWithDiffs = Omit<BaseData,"hhsts"> & {
  /** changedFrom points to the version, the current
   * version has been compared to. 
   * If it is not set, no comparision has been done.
   */
  changedFrom?:VersionDescriptor;
  hhsts:HHStWithDiff[];
}