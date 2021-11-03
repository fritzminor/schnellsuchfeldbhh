import { FC, useState } from "react";
import { SetVersion } from "../store/Store";
import { Name2VersionDesc } from "../store/VersionsTypes";

export type HHBreadcrumbProps = {
  chosen: string;
  possibilities: Name2VersionDesc[];
  setVersion: SetVersion;
};
export const HHBreadcrumb: FC<HHBreadcrumbProps> = ({
  chosen,
  possibilities,
  setVersion
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  return (
    <li>
      <div
        className={
          "dropdown is-hoverable" +
          (collapsed ? "" : " is-active")
        }
      >
        <div className="dropdown-trigger">
          <button
            className="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            <span>{chosen}</span>
            <span className="icon is-small">
              <i
                className="fas fa-angle-down"
                aria-hidden="true"
              ></i>
            </span>
          </button>
        </div>
        <div
          className="dropdown-menu"
          id="dropdown-menu"
          role="menu"
        >
          <div className="dropdown-content">
            {possibilities.map(
              (name2VersionDesc, index) => {
                return (
                  <div
                    className="dropdown-item m-0 p-0"
                    key={`versionKey${index}`}
                  >
                    <button
                      className="button is-small is-link is-inverted"
                      onClick={() => {
                        setVersion(
                          name2VersionDesc.versionDesc
                        );
                      }}
                    >
                      {name2VersionDesc.name}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </li>
  );
};
