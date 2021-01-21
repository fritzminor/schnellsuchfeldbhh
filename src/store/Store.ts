import { History } from "history";
import * as React from "react";
import { AppState } from "./AppState";

export function createStore(
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  history: History
) {
  return {
    setSearchExpression(searchexpression: string) {
      history.push({
        search: searchexpression
          ? "?q=" + encodeURIComponent(searchexpression)
          : undefined,
      });

      setState((prevState: AppState) => ({ ...prevState, searchexpression }));
    }
  };
}
