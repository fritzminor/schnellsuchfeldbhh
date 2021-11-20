import { cloneDeep } from "lodash";
import { BaseData, emptyBaseData } from "../AppState";
import { applyChanges } from "./combineBaseData";
import { b1, b2 } from "./testData.test";



describe("tests for combineBaseData", () => {
  test("apply empty changes to empty origin", () => {
    const origin: BaseData = cloneDeep(emptyBaseData);
    const changes: BaseData = cloneDeep(emptyBaseData);
    changes.versionDesc = cloneDeep(origin.versionDesc);
    const result = applyChanges(origin, changes);
    expect(result).toEqual(emptyBaseData);
  });

  test("apply empty changes ", () => {
    const origin: BaseData = cloneDeep(b1);
    const changes: BaseData = cloneDeep(emptyBaseData);
    changes.versionDesc = cloneDeep(origin.versionDesc);
    const result = applyChanges(origin, changes);
    expect(result).toEqual(b1);
  });

  test("apply origin as changes ", () => {
    const origin: BaseData = cloneDeep(b1);
    const changes: BaseData = cloneDeep(b1);
    const result = applyChanges(origin, changes);
    expect(result).toEqual(b1);
  });

  test("apply to empty origin ", () => {
    const origin: BaseData = cloneDeep(emptyBaseData);
    const changes: BaseData = cloneDeep(b1);
    const result = applyChanges(origin, changes);
    expect(result).toEqual(b1);
  });

  test("apply single change to hhst (sollJahr1) ", () => {
    const origin: BaseData = cloneDeep(b1);
    const changes: BaseData = cloneDeep(b2);
    const result = applyChanges(origin, changes);
    expect(result.hhsts.length).toBe(b1.hhsts.length);
    expect(result.hhsts[0]).toEqual(b2.hhsts[0]);
    // otherwise the same as before
    result.hhsts[0] = b1.hhsts[0];
    result.versionDesc=b1.versionDesc;
    expect(result).toEqual(b1);
  });
});
