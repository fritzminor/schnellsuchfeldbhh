/** returns JSON.stringify(param, undefinded, "  ").
 *
 */
export function jsoning(param: unknown): string {
  return JSON.stringify(param, undefined, "  ");
}
