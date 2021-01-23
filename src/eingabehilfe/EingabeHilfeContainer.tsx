import * as React from "react";
import { eingabehilfen } from "./EingabeHilfeLogic";
import { EingabeHilfenList } from "./EingabeHilfenList";
import { useRef, useState } from "react";
import { Search24 } from "@carbon/icons-react";
import { SearchFieldsData } from "./searchfields/SearchFieldsTypes";
import { initialFieldsData } from "./searchfields/SearchFieldsData";
import { SearchFieldsContainer } from "./searchfields/SearchFieldsContainer";

type EingabeHilfeContainerProps = {
  searchexpression: string;
  setSearchExpression: (searchexpression: string) => void;
  defaultProposalLimit?: number;
};

export function EingabeHilfeContainer({
  searchexpression,
  setSearchExpression,
  defaultProposalLimit
}: EingabeHilfeContainerProps): JSX.Element {
  //eslint-disable-line no-undef
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

  const [hilfenActive, setHilfenActive] = useState<boolean>(
    false
  );

  const [searchFieldsData,setSearchFieldsData] = useState<SearchFieldsData>(
    initialFieldsData
  );

  const hilfen = focusState
    ? eingabehilfen({
        searchexpression,
        cursorPos: cursorPosState
      })
    : null;
  let limited = false;
  if (hilfen && limitOnState) {
    if (hilfen.items.length > proposalsLimit) {
      hilfen.items = hilfen.items.slice(0, proposalsLimit);
      limited = true;
    }
  }

  return (
    <nav className="panel">
      <div className="container eingabeHilfeContainer">
        <div className="inputfieldcontainer  ">
          <Search24 className="searchIcon" />
          <input
            type="search"
            name="suche"
            id="suche"
            placeholder="Suchwort"
            autoComplete="off"
            spellCheck="false"
            value={searchexpression}
            ref={inputfieldRef}
            onChange={(e) => {
              setSearchExpression(e.target.value);
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
        </div>
      </div>
      <p className="panel-tabs">
        <a
          href="#top"
          className={hilfenActive ? "" : "is-active"}
          onClick={() => setHilfenActive(false)}
        >
          Suchfelder
        </a>
        <a
          href="#top"
          className={hilfenActive ? "is-active" : ""}
          onClick={() => setHilfenActive(true)}
        >
          Hinweise
        </a>
      </p>
      {hilfenActive ? (
        focusState && hilfen ? (
          <EingabeHilfenList
            searchexpression={searchexpression}
            setSearchExpression={setSearchExpression}
            cursorPosState={cursorPosState}
            limited={limited}
            proposalsLimit={proposalsLimit}
            setLimitOnState={setLimitOnState}
            hilfen={hilfen}
            inputfieldRef={inputfieldRef}
          />
        ) : (
          <p className="helptext">
            Bitte Suchausdruck eingeben, z.B. Kap:1319.
          </p>
        )
      ) : (
        <SearchFieldsContainer
          searchFieldsData={searchFieldsData}
          setSearchExpression={setSearchExpression}
        />
      )}
    </nav>
  );
}
