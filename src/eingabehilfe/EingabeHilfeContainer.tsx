import * as React from "react";
import { eingabehilfen } from "./EingabeHilfeLogic";
import { EingabeHilfenList } from "./EingabeHilfenList";
import { useRef, useState } from "react";
import { Search24 } from "@carbon/icons-react";
import { SearchFieldsContainer } from "./searchfields/SearchFieldsContainer";
import { AppState } from "../store/AppState";
import { ClickSelectContainer } from "./clickSelect/ClickSelectContainer";
import { DocReferrer } from "../othercomponents/DocReferrer";

type EingabeHilfeContainerProps = {
  appState: AppState;
  setSearchExpression: (searchexpression: string) => void;
  defaultProposalLimit?: number;
};


type EingabeHilfeTabs = "searchfields" | "helpers" | "graphical";

export function EingabeHilfeContainer({
  appState,
  setSearchExpression,
  defaultProposalLimit
  //eslint-disable-next-line no-undef
}: EingabeHilfeContainerProps): JSX.Element {

  const searchexpression = appState.searchexpression;
  const proposalsLimit = defaultProposalLimit || 4;
  const inputfieldRef = useRef<HTMLInputElement>(null);
  const [focusState, setFocusState] = useState<boolean>(
    false
  );
  const [cursorPosState, setCursorPosState] = useState<
    number
  >(0);
  const [limitOnState, setLimitOnState] = useState<boolean>(
    true
  );

  const [activeTab, setActiveTab] = useState<EingabeHilfeTabs>("searchfields");

  const [
    searchExpressionSetBySearchFields,
    setSearchExpressionSetBySearchFields
  ] = useState<boolean>(false);

  const   /** Zeigt den Vorschlägebereich an. */
    showHelpers: () => void = () => {
      setActiveTab("helpers");
    };

  const hilfen = focusState
    ? eingabehilfen({
      searchexpression,
      cursorPos: cursorPosState
    })
    : null;
  let limited = false;
  const moreHelpersThanLimitAvailable=!!(hilfen && hilfen.items.length>proposalsLimit);
  if (hilfen && limitOnState) {
    if (hilfen.items.length > proposalsLimit) {
      hilfen.items = hilfen.items.slice(0, proposalsLimit);
      limited = true;
    }
  }

  return (
    <nav className="panel">
      <div className="container is-flex is-flex-direction-row is-align-items-center eingabeHilfeContainer">
        <div className="field is-flex-grow-2">
          <label className="label">
            Universalsuche
            <DocReferrer topic="Universalsuchfeld" />
          </label>

          <div className="control has-icons-left">

            <input
              type="search"
              name="suche"
              id="suche"
              placeholder="Suchwort"
              autoComplete="off"
              spellCheck="false"
              className="input is-rounded"
              value={searchexpression}
              ref={inputfieldRef}
              onChange={(e) => {
                setSearchExpression(e.target.value);
                setSearchExpressionSetBySearchFields(false);

                setCursorPosState(
                  e.target.selectionStart || 0
                );
              }}
              onFocus={(e) => {
                setFocusState(true);
                setCursorPosState(
                  e.target.selectionStart || 0
                );
              }}
              onKeyUp={(e) => {
                setCursorPosState(
                  (e.target as HTMLInputElement)
                    .selectionStart || 0
                );
                showHelpers();
              }}
              onClick={(e) => {
                setCursorPosState(
                  (e.target as HTMLInputElement)
                    .selectionStart || 0
                );
              }}
              onBlur={() => {
                /* setTimeout(() => {
                setFocusState(false);
              }, 100);*/
              }}
              title={
                "Tipp: Geben Sie mal Ziffern ein. \n\nUm " +
                "die Suche einzuengen, bitte weitere Suchausdrücke mit Leerstelle " +
                "getrennt angeben: Epl:13 Grp:0.\n\nUm die Suche zu erweitern, bitte weitere " +
                "Suchausdrücke mit Komma (,) getrennt angeben: Epl:06, Epl:13.\n\nEs können auch Klammern benutzt werden, " +
                "um Suchausdrücke zu gruppieren: \nEPl:13, (Epl:06 Grp:422) liefert alle Haushaltsstellen" +
                " des Epl 13 und vom Epl. 06 diejenigen mit der Gruppe 422. \n\nMit einem Minuszeichen (-) erhält man alle Suchergebnisse" +
                " ohne diejenigen, die dem Suchausdruck hinter dem Minuszeichen entsprechen: \n-Grp:4 klammert die Personalausgaben aus."
              }
            />
            <span className="icon is-small is-left">
              <Search24 className="searchIcon" />
            </span>

          </div>

        </div>
      </div>

      {/* ------------------ Tabs for different helpers  ---------------- */}
      <p className="panel-tabs">
        <a
          href="#top"
          className={activeTab === "searchfields" ? "is-active" : ""}
          onClick={() => setActiveTab("searchfields")}
        >
          Suchfelder
        </a>
        <a
          href="#top"
          className={activeTab === "helpers" ? "is-active" : ""}
          onClick={() => setActiveTab("helpers")}
        >
          Vorschläge
        </a>
        <a
          href="#top"
          className={activeTab === "graphical" ? "is-active" : ""}
          onClick={() => setActiveTab("graphical")}
        >
          Kreisauswahl
        </a>
        <a
          href="#hhstList"
        >
          Liste
        </a>
      </p>
      {activeTab === "helpers" ? (
        focusState && hilfen ? (
          <EingabeHilfenList
            appState={appState}
            setSearchExpression={(searchexpression) => {
              setSearchExpression(searchexpression);
              setSearchExpressionSetBySearchFields(false);
              setActiveTab("helpers");
            }}
            cursorPosState={cursorPosState}
            limited={limited}
            moreHelpersThanLimitAvailable={moreHelpersThanLimitAvailable}
            setLimitOnState={setLimitOnState}
            helpers={hilfen}
            inputfieldRef={inputfieldRef}
          />
        ) : (
            <p className="helptext">
              Bitte Suchausdruck eingeben, z.B. Kap:1319.
            </p>
          )
      ) : activeTab === "searchfields" ? (
        <SearchFieldsContainer key="searchFieldsContainer"
          setSearchExpression={(searchexpression) => {
            setSearchExpression(searchexpression);
            setSearchExpressionSetBySearchFields(true);
          }}
          appState={appState}
          searchExpressionSetBySearchFields={
            searchExpressionSetBySearchFields
          }
        />
      ) : ( // activeTab==="graphical"
            <ClickSelectContainer appState={appState} setSearchExpression={(searchexpression) => {
              setSearchExpression(searchexpression);
              if (searchExpressionSetBySearchFields)
                setSearchExpressionSetBySearchFields(false);
            }} />
          )}
    </nav>
  );
}
