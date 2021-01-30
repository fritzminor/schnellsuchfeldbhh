import { History } from "history";
import * as React from "react";
import { UserName } from "../users/UsersTypes";
import { AppState } from "./AppState";

export function createStore( // eslint-disable-line  @typescript-eslint/explicit-module-boundary-types
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  history: History
) {
  return {
    setSearchExpression(searchexpression: string) {
      history.push({
        search: searchexpression
          ? "?q=" + encodeURIComponent(searchexpression)
          : undefined
      });

      setState((prevState: AppState) => ({
        ...prevState,
        searchexpression
      }));
    },
    setCurrentUser(newCurrentUser: UserName) {
      setState((prevState) => ({

        ...prevState,
        currentUser: newCurrentUser
      }))
    }
  };
}
