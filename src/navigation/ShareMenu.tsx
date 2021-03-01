import {
  Share32,
  Copy32,
  Email32
} from "@carbon/icons-react";
import React, { FC, useState } from "react";
import { DocReferrer } from "../othercomponents/DocReferrer";

export type ShareMenuProps = {
  showUserMessage: (
    userMessage: string,
    timeout?: number
  ) => void;
};

export const ShareMenu: FC<ShareMenuProps> = ({
  showUserMessage
}) => {
  const [droppedDown, setDroppedDown] = useState<boolean>(
    false
  );

  const toggleDroppedDown = () => {
    setDroppedDown(!droppedDown);
  };

  return (
    <div className="navbar-item">
      <div
        className={`dropdown  ${
          droppedDown ? "is-active " : ""
        }`}
        onClick={toggleDroppedDown}
      >
        <div className="dropdown-trigger">
          <button className="button has-background-info has-text-light">
            <Share32 /> Teilen
          </button>
        </div>
        <div
          className="dropdown-menu"
          id="dropdown-menu"
          role="menu"
        >
          <div className="dropdown-content">
            <a
              href="#"
              className="dropdown-item"
              onClick={async () => {
                try {
                  const clipboardText = window.location.toString();
                  await navigator.clipboard.writeText(
                    clipboardText
                  );
                  showUserMessage(
                    clipboardText +
                      " wurde in die Zwischenablage eingefügt."
                  );
                } catch (e) {
                  alert("No Clipboard:" + e);
                }
                setDroppedDown(false);
              }}
            >
              <span className="icon-text">
                <span className="icon">
                  <Copy32 />
                </span>
                <span>Link in die Zwischenablage</span>
              </span>
            </a>

            <a
              href={`mailto:?to=&subject=${encodeURIComponent(
                `Link zur Suche im Haushaltsplan`
              )}&body=${encodeURIComponent(
                `Link zur Suche im Haushaltsplan: ${window.location.toString()}`
              )}
              `}
              className="dropdown-item"
              onClick={async () => {
                //setDroppedDown(false);
              }}
            >
              <span className="icon-text">
                <span className="icon">
                  <Email32 />
                </span>
                <span>Link per Email</span>
              </span>
            </a>
            <hr className="dropdown-divider" />
            <div className="dropdown-item is-flex is-flex-direction-row">
              <DocReferrer topic="Teilen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
