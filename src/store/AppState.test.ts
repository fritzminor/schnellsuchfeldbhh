import { BaseData, getFilteredHhstArray } from "./AppState";
import hhstData01_02 from "./material/bhh_epl01_02.json";

const BearbeiterEpl01und02 = hhstData01_02 as BaseData;

test("getFilteredHhstArray with empty returns whole hhstArray", () => {
  const hhstArray = BearbeiterEpl01und02.hhsts;
  const res = getFilteredHhstArray(
    hhstArray,
    BearbeiterEpl01und02.tgMap,
    ""
  );
  expect(res.filteredHhstArray.length).toEqual(
    hhstArray.length
  );
});

test("getFilteredHhstArray with '0111/11957' returns one single value", () => {
  const hhstArray = BearbeiterEpl01und02.hhsts;

  const res = getFilteredHhstArray(
    hhstArray,
    BearbeiterEpl01und02.tgMap,
    "0111/11957"
  );
  expect(res.filteredHhstArray.length).toEqual(
    1
  );
});
