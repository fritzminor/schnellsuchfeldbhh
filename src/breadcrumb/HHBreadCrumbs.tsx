import { Home32 } from "@carbon/icons-react";
import { FC } from "react";
import {
  VersionDescriptor,
  VersionsTree
} from "../store/AppState";
import { HHBreadcrumb } from "./HHBreadCrumb";

export type HHBreadcrumbsProps = {
  versionsTree: VersionsTree;
  versionDesc?: VersionDescriptor;
};

export const HHBreadcrumbs: FC<HHBreadcrumbsProps> = ({
  versionDesc
}) => {
  return (
    <div className="container my-0">
      <nav className="breadcrumb has-arrow-separator">
        {versionDesc ? (
          <ul>
            <HHBreadcrumb
              chosen={versionDesc.orgBudgetName}
              possibilities={new Map()}
            />
            <HHBreadcrumb
              chosen={versionDesc.budgetName}
              possibilities={new Map()}
            />

            <HHBreadcrumb
              chosen={versionDesc.lineName}
              possibilities={new Map()}
            />
            <HHBreadcrumb
              chosen={versionDesc.modStateName}
              possibilities={new Map()}
            />
          </ul>
        ) : (
          <ul>
            <li>
              <Home32 />
            </li>
          </ul>
        )}
      </nav>
    </div>
  );
};
