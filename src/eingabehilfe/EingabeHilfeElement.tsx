import * as React from "react";

import { EingabeHilfeItem } from "./EingabeHilfeTypes";

export function EingabeHilfeElement(
  props: EingabeHilfeItem & {
    setNewToken: (newToken: string, additional?:boolean) => void;
    focusInput: () => void;
  }
) {
  return (
    <button
      className="eingabeHilfeElement"
      onClick={() => {
        props.setNewToken(props.proposal,props.additional);
        props.focusInput();
      }}
    >
      <strong>{props.additional?"[A]":""}{props.proposal === " " ? `[Leertaste]` : props.proposal}</strong>
      {` - ${props.description}`}
    </button>
  );
}
