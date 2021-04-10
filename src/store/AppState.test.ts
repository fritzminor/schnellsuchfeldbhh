import { BaseData, getFilteredHhstArray } from "./AppState";
import hhstData01_02 from "./material/bhh_epl01_02.json";

const BearbeiterEpl01und02 = hhstData01_02 as BaseData;

test("getFilteredHhstArray with empty returns whole hhstArray", () => {
  const baseData = BearbeiterEpl01und02;

  const res = getFilteredHhstArray(
    baseData,
    "", false
  );
  expect(res.filteredHhstArray.length).toEqual(
    baseData.hhsts.length
  );
});

test("getFilteredHhstArray with '0111/11957' returns one single value", () => {
  const baseData = BearbeiterEpl01und02;

  const res = getFilteredHhstArray(
    baseData,
    "0111/11957",false
  );
  expect(res.filteredHhstArray.length).toEqual(
    1
  );
});

test("getFilteredHhstArray with '0111/11957' withBlocks=true returns five values (", () => {
  const baseData = BearbeiterEpl01und02;

  const res = getFilteredHhstArray(
    baseData,
    "0111/11957",true
  );
  expect(res.filteredHhstArray.length).toEqual(
    9 // tg top, hhst, tg, kap x2, epl x2, totals x2
  );
});
