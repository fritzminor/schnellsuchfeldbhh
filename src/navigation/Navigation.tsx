import * as React from "react";
import {
  User24,
  CaretDown24,
  CertificateCheck32
} from "@carbon/icons-react";

import { UserName } from "./UsersTypes";
import { ImportButton } from "../import/ImportButton";
import { DocReferrer } from "../othercomponents/DocReferrer";
import { Store } from "../store/Store";
import { AppState } from "../store/AppState";
import { ShareMenu } from "./ShareMenu";

const userNames: UserName[] = [
  "BearbeiterEpl01und02",
  "BearbeiterGesamtBHH"
];

export type NavigationProps = {
  appState: AppState;
  store: Store;
};

export function Navigation({
  appState,
  store
}: NavigationProps): JSX.Element {
  const { currentUser } = appState;
  const { setCurrentUser, showUserMessage } = store;
  const [
    usersSelectable,
    setUsersSelectable
  ] = React.useState<boolean>(false);
  function toggleUsersSelectable() {
    setUsersSelectable(!usersSelectable);
  }

  const [
    burgerActiveClassName,
    setBurgerActiveClassName
  ] = React.useState<"is-active" | "">("");

  function toggleBurgerActiveClassName() {
    setBurgerActiveClassName(
      burgerActiveClassName ? "" : "is-active"
    );
  }

  /** has to be called after login has finished. */
  function finishUserLogin() {
    setUsersSelectable(false);
    setBurgerActiveClassName("");
  }

  return (
    <nav
      className="navbar has-background-info is-fixed-top"
      key="Navbar"
    >
      <div className="navbar-brand">
        <div className="navbar-item has-text-light">
          <div className="media">
            <div className="media-left">
              <a className="button is-info " href="#">
                <CertificateCheck32 />
              </a>
            </div>
            <div className="media-content">
              <p className="title has-text-light">
                Universalsuche
              </p>
              <p className="subtitle has-text-light is-hidden-mobile">
                Prototyp für die Suche im kameralen Haushalt
              </p>
            </div>
          </div>
        </div>
        <a
          role="button"
          className={`navbar-burger ${burgerActiveClassName}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
          onClick={toggleBurgerActiveClassName}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div
        className={`navbar-menu  ${burgerActiveClassName}`}
      >
        <div className="navbar-end">
          {/*----------  Manual ------------*/}
          <div className="navbar-item">
            <DocReferrer>Anleitung</DocReferrer>
          </div>

          {/*----------  Share-Dropdown ------------*/}
          <ShareMenu
            appState={appState}
            showUserMessage={showUserMessage}
            setModalInfo={store.setModalInfo}
          />

          {/* ------------ user selection ------------------*/}
          <div className="navbar-item">
            <div
              className={`dropdown  ${
                usersSelectable ? "is-active " : ""
              }`}
              onClick={toggleUsersSelectable}
            >
              <div className="dropdown-trigger">
                <button
                  className="button has-background-info"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                >
                  <span className="icon-text">
                    {" "}
                    <span className="icon has-text-light">
                      <User24 />
                    </span>
                    <span className="has-text-light">
                      {currentUser}
                    </span>
                  </span>
                  <span className="icon is-small">
                    <CaretDown24 />
                  </span>
                </button>
              </div>

              <div
                className="dropdown-menu"
                id="dropdown-menu"
                role="menu"
              >
                <div className="dropdown-content">
                  {userNames.map((userName) => {
                    return (
                      <a
                        href="#"
                        className="dropdown-item"
                        key={userName}
                        onClick={() => {
                          setCurrentUser(userName);
                          setUsersSelectable(false);
                        }}
                      >
                        <span className="icon-text">
                          {" "}
                          <span className="icon">
                            <User24 />
                          </span>
                          <span>{userName}</span>
                        </span>
                      </a>
                    );
                  })}
                  <hr className="dropdown-divider" />

                  <div className="dropdown-item is-flex is-flex-direction-row">
                    <ImportButton
                      store={{
                        ...store,
                        setCurrentUser: (
                          newCurrentUser
                        ) => {
                          setCurrentUser(newCurrentUser);
                          setUsersSelectable(false);
                        }
                      }}
                      loadFileFinished={finishUserLogin}
                      appState={appState}
                    />
                    <DocReferrer topic="Lokale Daten" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
