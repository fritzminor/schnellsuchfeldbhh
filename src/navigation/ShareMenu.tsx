import {
  Share32,
  Email32
} from "@carbon/icons-react";
import React, { FC, useState } from "react";
import { AnalyzeSheetButton } from "../import/AnalyzeSheetButton";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import { Copy2Clipboard } from "../othercomponents/Copy2Clipboard";
import { DocReferrer } from "../othercomponents/DocReferrer";
import { AppState } from "../store/AppState";

export type ShareMenuProps = {
  appState: AppState;
  showUserMessage: (
    userMessage: string,
    timeout?: number
  ) => void;
  setModalInfo: (modalInfo: string | AnalyzeResults | null) => void;
};


export const ShareMenu: FC<ShareMenuProps> = ({
  appState,
  showUserMessage, setModalInfo
}) => {
  const [droppedDown, setDroppedDown] = useState<boolean>(
    false
  );

  const toggleDroppedDown = () => {
    setDroppedDown(!droppedDown);
  };

  const closeDropDownMenu = () => {
    setDroppedDown(false);
  };

  const additionalMessage = " Bitte Formel in Excel-Tabelle einfügen und dann Excel-Analyse starten.";

  return (
    <div className="navbar-item">
      <div
        className={`dropdown  ${droppedDown ? "is-active " : ""
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
            <Copy2Clipboard
              className={"dropdown-item"}
              text2copy={window.location.toString()}
              afterCopy={
                closeDropDownMenu
              }
              showUserMessage={showUserMessage}
            >Link in die Zwischenablage</Copy2Clipboard>

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

            <Copy2Clipboard
              className={"dropdown-item"}
              text2copy={"A=" + appState.searchexpression}
              afterCopy={
                closeDropDownMenu
              }
              additionalMessage={additionalMessage}
              showUserMessage={showUserMessage}
            >Ausgaben-Formel in die Zwischenablage</Copy2Clipboard>

            <Copy2Clipboard
              className={"dropdown-item"}
              text2copy={"E=" + appState.searchexpression}
              afterCopy={closeDropDownMenu}
              additionalMessage={additionalMessage}
              showUserMessage={showUserMessage}
            >Einnahmen-Formel in die Zwischenablage</Copy2Clipboard>


            <div className="dropdown-item is-flex is-flex-direction-row">
              <AnalyzeSheetButton
                appState={appState}
                setModalInfo={setModalInfo}
                afterAnalysis={ closeDropDownMenu }
              />
              <DocReferrer topic="Excel-Analyse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
