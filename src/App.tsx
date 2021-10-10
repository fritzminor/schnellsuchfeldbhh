import * as React from "react";
import "bulma";

import "./styles.css";
import { EingabeHilfeContainer } from "./eingabehilfe/EingabeHilfeContainer";
import { HHStList } from "./hhstliste/HHStList";
import { AppState } from "./store/AppState";
import {
  createStore,
  getStateFrom,
  Store
} from "./store/Store";
import { useState } from "react";

import { Navigation } from "./navigation/Navigation";
import { HHStOverview } from "./hhstliste/HHStOverview";
import { ModalInfo } from "./modal/ModalInfo";
import { HHBreadcrumbs } from "./breadcrumb/HHBreadCrumbs";

// Check for https://medium.com/@svsh227/create-your-own-type-ahead-dropdown-in-react-599c96bebfa
//           https://github.com/fmoo/react-typeahead
//           https://github.com/moroshko/react-autosuggest

function getQ(urlSearch: string) {
  return new URLSearchParams(urlSearch).get("q") || "";
}

//eslint-disable-next-line no-undef
export default function App(): JSX.Element {
  const [state, setState] = useState<AppState>(
    getStateFrom(
      getQ(window.location.search),
      "BearbeiterEpl01und02"
    )
  );
  const store: Store = createStore(setState);
  const { setSearchExpression } = store;

  const [
    historyListened,
    setHistoryListened
  ] = useState<boolean>(false);
  if (!historyListened) {
    setHistoryListened(true);
    window.onpopstate = () => {
      setTimeout(() => {
        setSearchExpression(
          getQ(window.location.search),
          true
        );
      });
    };
  }

  return (
    <>
      <Navigation appState={state} store={store} />
      <section className="section">
        <div className="container">
          <EingabeHilfeContainer
            key="eingabeHilfeContainer"
            appState={state}
            setSearchExpression={setSearchExpression}
          />
        </div>
      </section>

      <section className="section">
        <HHStOverview appState={state} />
      </section>
      <section className="section mb-1 py-1" id="hh_breadcrumb">
        <HHBreadcrumbs versionDesc={state.derived.baseData.versionDesc} />
      </section>
      <section className="section pt-1" id="hhstList">
        <HHStList appState={state}>
          {!state.derived.searchTree &&
          state.searchexpression ? (
            <div className="container haushaltsstellenOverlay">
              <p className="subtitle">
                Der Prototyp kann den Suchausdruck "
                {state.searchexpression}" leider (noch)
                nicht verarbeiten.
              </p>

              {state.derived.searchParseErrMessage ? (
                <p className="">
                  {state.derived.searchParseErrMessage}
                </p>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </HHStList>
      </section>
      <footer className="footer">
        <div className="content has-text-centered">
          Daten von{" "}
          <a href="https://www.bundeshaushalt.de/download">
            bundeshaushalt.de
          </a>
          . Code auf{" "}
          <a href="https://github.com/fritzminor/schnellsuchfeldbhh">
            github
          </a>{" "}
        </div>
      </footer>
      
      {/* --------- show internal basedata for development purposes -----------
       process.env.NODE_ENV === "development" ? (
        <pre>{JSON.stringify(state.derived.baseData, undefined, "  ")}</pre>
      ) : (
        <></>
      ) */
      }
      <ModalInfo
        modalInfo={state.modalInfo}
        hideUserMessage={store.hideUserMessage}
      />
    </>
  );
}
