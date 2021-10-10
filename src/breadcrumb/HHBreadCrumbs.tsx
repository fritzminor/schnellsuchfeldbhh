import { Home32 } from "@carbon/icons-react";
import { FC } from "react";
import { VersionDescriptor } from "../store/AppState";

export type HHBreadcrumbsProps = {
  versionDesc?: VersionDescriptor;
  /** only used if no {@link HHBreadcrumbsProps.versionDesc}
   * 
   */
  firstYear?: number
}

export const HHBreadcrumbs:FC<HHBreadcrumbsProps>= ({versionDesc,firstYear}) => {
  return (
    <div className="container my-0">
      <nav className="breadcrumb has-arrow-separator">
        <ul>
          <li>
            <a href="#"  >{versionDesc?.orgBudgetName||<Home32 />} </a>
          </li>
          <li>
            <a href="#">{versionDesc?.budgetName || firstYear || "Haushaltsplan"}</a>
          </li>
          <li>
            <a href="#">{versionDesc?.containerName || "a/b/c-Linie"}</a>
          </li>
          <li>
            <a href="#">{versionDesc?.modStateName || `Stand: ${  new Date().toLocaleString() }` }</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
