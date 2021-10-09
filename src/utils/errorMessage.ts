import { jsoning } from "./jsoning";

/** returns error.message if e is instance of Error. Otherwise it returns a JSON-Representation of e. */
export function errorMessage(e: unknown): string {
  return e instanceof Error
    ? e.message
    : jsoning(e);
}
