import * as React from "react";
import "bulma";

import "./styles.css";
import { EingabeHilfeContainer } from "./eingabehilfe/EingabeHilfeContainer";
import { HHStList } from "./hhstliste/HHStList";
import { AppState } from "./store/AppState";
import { createStore } from "./store/Store";
import { getSearchTree } from "./hhstliste/hhstListeLogic/searchParser";
import { useState } from "react";

import history from "history/browser";
import { SearchNode } from "./hhstliste/hhstListeLogic/searchTreeTypes";

// Check for https://medium.com/@svsh227/create-your-own-type-ahead-dropdown-in-react-599c96bebfa
//           https://github.com/fmoo/react-typeahead
//           https://github.com/moroshko/react-autosuggest

export default function App():JSX.Element {
  const [state, setState] = useState<AppState>({
    searchexpression:
      new URLSearchParams(history.location.search).get(
        "q"
      ) || ""
  });
  const { setSearchExpression } = createStore(
    setState,
    history
  );
  let searchTree: SearchNode | null;
  let searchParseErrMessage: undefined | string;
  try {
    searchTree = getSearchTree(state.searchexpression);
  } catch (err) {
    console.log(err);
    searchTree = null;
    searchParseErrMessage = err.message;
  }
  return (
    <>
      <section className="section hero">
        <div className="hero-body is-primary">
          <div className="container">
            <h1 className="title">Universalsuchfeld</h1>
            <h2 className="subtitle">
              Prototyp für Suchhilfen
            </h2>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <EingabeHilfeContainer
            searchexpression={state.searchexpression}
            setSearchExpression={setSearchExpression}
          />
        </div>
      </section>
      <section className="section">
        <HHStList searchTree={searchTree}>
          <div className="container haushaltsstellenOverlay">
            {searchTree ? (
              state.searchexpression ? (
                <> </>
              ) : (
                <p >
                  Hier werden alle Haushaltsstellen
                  angezeigt, für die der Benutzer berechtigt
                  ist.
                </p>
              )
            ) : (
              <p className="title">
                Der Prototyp kann den Suchausdruck "
                {state.searchexpression}" leider (noch) nicht
                verarbeiten.
              </p>
            )}
            {searchParseErrMessage ? (
              <p className="">{searchParseErrMessage}</p>
            ) : (
              <p></p>
            )}
          </div>
        </HHStList>
      </section>
    </>
  );
}
