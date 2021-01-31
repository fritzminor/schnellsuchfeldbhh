import * as React from "react";
import "bulma";

import "./styles.css";
import { EingabeHilfeContainer } from "./eingabehilfe/EingabeHilfeContainer";
import { HHStList } from "./hhstliste/HHStList";
import { AppState } from "./store/AppState";
import { createStore, getStateFrom } from "./store/Store";
import { useState } from "react";

import history from "history/browser";
import { Navigation } from "./users/Navigation";

// Check for https://medium.com/@svsh227/create-your-own-type-ahead-dropdown-in-react-599c96bebfa
//           https://github.com/fmoo/react-typeahead
//           https://github.com/moroshko/react-autosuggest

//eslint-disable-next-line no-undef
export default function App(): JSX.Element {
  const [state, setState] = useState<AppState>(getStateFrom(
      new URLSearchParams(history.location.search).get(
        "q"
      ) || "",
      "BearbeiterEpl01und02"
  ));
  const { setSearchExpression, setCurrentUser } = createStore(
    setState,
    history
  );
  
  return (
    <>
      <Navigation currentUser={state.currentUser} setCurrentUser={setCurrentUser}/>
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
            appState={state}
            setSearchExpression={setSearchExpression}
          />
        </div>
      </section>
      <section className="section">
        <HHStList appState={state} >
          <div className="container haushaltsstellenOverlay">
            {state.derived.searchTree ? (
              state.searchexpression ? (
                <> </>
              ) : (
                  <p>
                  </p>
                )
            ) : (
                <p className="subtitle">
                  Der Prototyp kann den Suchausdruck "
                  {state.searchexpression}" leider (noch)
                nicht verarbeiten.
                </p>
              )}
            {state.derived.searchParseErrMessage ? (
              <p className="">{state.derived.searchParseErrMessage}</p>
            ) : (
                <p></p>
              )}
          </div>
        </HHStList>
      </section>
      <footer className="footer">
        <div className="content has-text-centered">
          Daten von <a
            href="https://www.bundeshaushalt.de/download">bundeshaushalt.de</a>.
          Code auf <a href="https://github.com/fritzminor/schnellsuchfeldbhh">github</a> </div>
      </footer>

    </>
  );
}
