import { emptyBaseData } from "../AppState";
import { getHHStValue, HHSt, HHStValue } from "../HHStType";
import { cloneDeep } from "lodash";
import { compareBaseData } from "./compareBaseData";
import { b1, b2, b3 } from "./testData.test";



describe("compareBaseData", () => {
  test("compareBaseData with empty basedatas", () => {
    const origin = cloneDeep(emptyBaseData);
    const target = cloneDeep(emptyBaseData);
    const { targetWithDiffs, changes } = compareBaseData(origin, target);
    expect(targetWithDiffs.changedFrom).toEqual(origin.versionDesc);
    expect(targetWithDiffs.hhsts.length).toBe(0);
    expect(changes.changedFrom).toEqual(origin.versionDesc);
    expect(changes.hhsts.length).toBe(0);
  });

  test("compareBaseData with empty base data and b2", () => {
    const origin = cloneDeep(emptyBaseData);
    const target = cloneDeep(b2);

    const { targetWithDiffs, changes } = compareBaseData(origin, target);

    expect(targetWithDiffs.changedFrom).toEqual(origin.versionDesc);
    expect(targetWithDiffs.hhsts.length).toBe(1);
    expect(changes.changedFrom).toEqual(origin.versionDesc);
    expect(changes.hhsts.length).toBe(1);

    expect(targetWithDiffs.hhsts[0].changedFrom).toBeNull();
    expect(changes.hhsts[0].changedFrom).toBeNull();
  });

  test("compareBaseData with b2 and emptyBaseData", () => {
    const origin = cloneDeep(b2);
    const target = cloneDeep(emptyBaseData);

    const { targetWithDiffs, changes } = compareBaseData(origin, target);

    expect(targetWithDiffs.changedFrom).toEqual(b2.versionDesc);
    expect(targetWithDiffs.hhsts.length).toBe(1);
    expect(changes.changedFrom).toEqual(b2.versionDesc);
    expect(changes.hhsts.length).toBe(1);

    expect(targetWithDiffs.hhsts[0].deleted).toBeTruthy();
    expect(changes.hhsts[0].deleted).toBeTruthy();
   
    const expectedChangeFrom: HHStValue = getHHStValue(b2.hhsts[0]);
    expect(targetWithDiffs.hhsts[0].changedFrom).toEqual(expectedChangeFrom);
    expect(changes.hhsts[0].changedFrom).toEqual(expectedChangeFrom);

    const expectedHhstValue: HHStValue = {...expectedChangeFrom, deleted:true};
    expect(getHHStValue(targetWithDiffs.hhsts[0])).toEqual(expectedHhstValue);;
    expect(getHHStValue(changes.hhsts[0])).toEqual(expectedHhstValue);
    
  });

  test("compareBaseData with b1 and b2", () => {
    const origin = cloneDeep(b1);
    const target = cloneDeep(b2); // contains less hhsts than b1
    // so result contains a lot of deleted hhsts

    const { targetWithDiffs, changes } = compareBaseData(origin, target);

    expect(targetWithDiffs.changedFrom).toEqual(origin.versionDesc);
    expect(targetWithDiffs.hhsts.length).toBe(8); 
    expect(changes.changedFrom).toEqual(origin.versionDesc);
    expect(changes.hhsts.length).toBe(8);

    expect(getHHStValue( targetWithDiffs.hhsts[0])).toEqual(getHHStValue(b2.hhsts[0]));
    expect(getHHStValue( changes.hhsts[0])).toEqual(getHHStValue(b2.hhsts[0]));

    expect(targetWithDiffs.hhsts[0].changedFrom).toEqual<Partial<HHStValue>>({sollJahr1:0});
    expect(changes.hhsts[0].changedFrom).toEqual<Partial<HHStValue>>({sollJahr1:0});

    const originValue=getHHStValue(b1.hhsts[2]);
    expect(getHHStValue(targetWithDiffs.hhsts[2])).toEqual({...originValue, deleted:true});
    expect(getHHStValue(changes.hhsts[2])).toEqual({...originValue, deleted:true});

    expect(targetWithDiffs.hhsts[2].changedFrom).toEqual(originValue);
    expect(changes.hhsts[2].changedFrom).toEqual(originValue);
    
  });

  test("compareBaseData with b1 and b3", () => {
    const origin = cloneDeep(b1);
    const target = cloneDeep(b3); // contains one single change to b1 hhsts

    const { targetWithDiffs, changes } = compareBaseData(origin, target);

    expect(targetWithDiffs.changedFrom).toEqual(b1.versionDesc);
    expect(targetWithDiffs.hhsts.length).toBe(8); 
    expect(changes.changedFrom).toEqual(b1.versionDesc);
    expect(changes.hhsts.length).toBe(1);

    expect(getHHStValue( targetWithDiffs.hhsts[0])).toEqual(getHHStValue(b3.hhsts[0]));
    expect(getHHStValue( changes.hhsts[0])).toEqual(getHHStValue(b3.hhsts[0]));

    expect(targetWithDiffs.hhsts[0].changedFrom).toEqual<Partial<HHStValue>>({sollJahr1:0});
    expect(changes.hhsts[0].changedFrom).toEqual<Partial<HHStValue>>({sollJahr1:0});

    expect(targetWithDiffs.hhsts[2]).toEqual(b1.hhsts[2]);  // no changedFrom
  
  });


})