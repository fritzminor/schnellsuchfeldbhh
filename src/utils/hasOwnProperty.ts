/* eslint-disable no-prototype-builtins  */
/* eslint-disable @typescript-eslint/ban-types  */

/** checks, if ob has property prop.
 * 
 * Thanks to https://fettblog.eu/typescript-hasownproperty/
 * 
 * @param obj 
 * @param prop 
 * @returns 
 */
export function hasOwnProperty<
  X extends {},
  Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}
