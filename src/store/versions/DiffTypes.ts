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




export type BaseDataWithDiffs = BaseData & {
  /** changedFrom points to the version, the current
   * version has been compared to. 
   * If it is not set, no comparision has been done.
   */
  changedFrom?:VersionDescriptor;
  hhsts:HHStWithDiff[];
}