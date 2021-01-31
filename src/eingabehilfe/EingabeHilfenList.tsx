import * as React from "react";

import { EingabeHilfeItem } from "./EingabeHilfeTypes";
import { EingabeHilfeElement } from "./EingabeHilfeElement";
import { replaceToken } from "./EingabeHilfeLogic";
import { AppState } from "../store/AppState";

export type EingabeHilfenListProps = {
  appState: AppState;
  setSearchExpression: (searchexpression: string) => void;
  cursorPosState: number;
  setLimitOnState: (limitOnState: boolean) => void;
  proposalsLimit: number;
  hilfen: HilfenType;
  limited: boolean;
  inputfieldRef: React.RefObject<HTMLInputElement>;
};

export type HilfenType = {
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
  proposalsLimit,
  hilfen,
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
      {limited ? (
        <button
          onClick={() => {
            setLimitOnState(false);
          }}
        >
          mehr...
        </button>
      ) : hilfen && hilfen.items.length > proposalsLimit ? (
        <button
          onClick={() => {
            setLimitOnState(true);
          }}
        >
          weniger...
        </button>
      ) : (
        <></>
      )}
    </>
  );
}
