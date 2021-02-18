import * as React from "react";

import { EingabeHilfeItem } from "./EingabeHilfeTypes";
import { EingabeHilfeElement } from "./EingabeHilfeElement";
import { replaceToken } from "./EingabeHilfeLogic";
import { AppState } from "../store/AppState";
import { MoreLessButton } from "../othercomponents/MoreLessButton";

export type EingabeHilfenListProps = {
  appState: AppState;
  setSearchExpression: (searchexpression: string) => void;
  cursorPosState: number;
  setLimitOnState: (limitOnState: boolean) => void;

  moreHelpersThanLimitAvailable: boolean;
  helpers: HelpersType;
  limited: boolean;
  inputfieldRef: React.RefObject<HTMLInputElement>;
};

export type HelpersType = {
  items: EingabeHilfeItem[];
  fullMatch: string | null;
  helpText: string | null;
  curToken: string;
};

export function EingabeHilfenList({
  setSearchExpression,
  appState,
  cursorPosState,
  setLimitOnState,
  moreHelpersThanLimitAvailable,
  helpers: hilfen,
  inputfieldRef,
  limited
}: EingabeHilfenListProps): JSX.Element {
  return (
    <>
      <p className="helptext">
        {(hilfen?.helpText ? hilfen.helpText + " " : "") +
          (hilfen.fullMatch
            ? `"${hilfen.curToken}" führt zu ${hilfen.fullMatch}`
            : "")}
      </p>
      {hilfen &&
        hilfen.items.map((item) => (
          <EingabeHilfeElement
            proposal={item.proposal}
            description={item.description}
            key={item.proposal}
            setNewToken={(newToken: string) => {
              const newSE = replaceToken(
                appState.searchexpression,
                cursorPosState,
                newToken,
                item.additional
              );
              setSearchExpression(newSE);
              setLimitOnState(true);

              setTimeout(() => {
                inputfieldRef.current?.setSelectionRange(
                  newSE.length,
                  newSE.length
                );
              });
            }}
            focusInput={() => {
              setTimeout(() => {
                inputfieldRef.current?.focus();
              });
            }}
          />
        ))}
      <div> {moreHelpersThanLimitAvailable
        ? <MoreLessButton limited={limited} setLimited={setLimitOnState} />
        : <></>
      }
      </div>
    </>
  );
}
