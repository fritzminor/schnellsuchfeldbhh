import { FC, useState } from "react";
import {
  Name2VersionDesc
} from "../store/VersionsTypes";

export type HHBreadcrumbProps = {
  chosen: string;
  possibilities: Name2VersionDesc[];
};
export const HHBreadcrumb: FC<HHBreadcrumbProps> = ({
  chosen,
  possibilities
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
            {possibilities.map((name2VersionDesc,index) => {
              return (
                <a href="#" className="dropdown-item" key={`versionKey${index}`}>
                  {name2VersionDesc.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </li>
  );
};
