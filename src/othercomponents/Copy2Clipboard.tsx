import { Copy32 } from "@carbon/icons-react";
import React, { FC, PropsWithChildren } from "react";
import { Store } from "../store/Store";

export type Copy2ClipboardProps = {
  className?: string;
  text2copy: string;
  /** Wird der Benachrichtigung über die Einfügung ins 
   * Clipboard hinzugefügt.
   */
  additionalMessage?: string;

  /** This callback will be called after the text has been copied to clipboard.
   * 
   */
  afterCopy?: () => void;
  showUserMessage: Store["showUserMessage"];
};

export const Copy2Clipboard: FC<PropsWithChildren<Copy2ClipboardProps>> = ({
  className,
  text2copy,
  afterCopy,
  additionalMessage,
  showUserMessage,

  children
}) => {
  return (
    <a
      href="#"
      className={className || ""}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            text2copy
          );
          showUserMessage(`"${text2copy}" wurde in die Zwischenablage eingefügt.${additionalMessage || ""}`);

          if (afterCopy)
            afterCopy();
        } catch (e) {
          alert("No Clipboard:" + e);
        }

      }}
    >
      <span className="icon-text">
        <span className="icon">
          <Copy32 />
        </span>
        <span>{children}</span>
      </span>
    </a>

  );
};