import { HHSt } from "./HHStType";

/**
 * compares two hhsts.
 * the sorted hhsts are ordered by
 *  - epl
 *  - kap
 *  - revenues before expenses
 *  - non-tgKey before tgKey
 *  - gruppe
 *  - suffix
 * 
 * Otherwise the hhst is considered equal, i.e. even if zweck or 
 * sollJahr1 differ, the function returns 0
 * @param a 
 * @param b 
 * @returns 
 */
export function compareHHSt(a: HHSt, b: HHSt): number {
  const cmpEplKap = (a.epl + a.kap).localeCompare(
    b.epl + b.kap
  );
  if (cmpEplKap)
    return cmpEplKap;

  if (a.expense) {
    if (!b.expense)
      return 1; // a comes after b
  } else {
    // a is revenue
    if (b.expense)
      return -1; // a comes before b
  }

  if (a.tgKey) {
    if (b.tgKey) {
      const cmpTgKey = a.tgKey.localeCompare(b.tgKey);
      if (cmpTgKey)
        return cmpTgKey;
    } else {
      // a has tgKey, b has not.
      return 1; // a comes after b
    }
  } else {
    // a.tgKey is undefined
    if (b.tgKey) {
      // a has got no tgKey, b has got one.
      return -1; // b comes after a
    }
  }

  const cmpTitelNr = (a.gruppe + a.suffix).localeCompare(
    b.gruppe + b.suffix
  );
 return cmpTitelNr;
}
