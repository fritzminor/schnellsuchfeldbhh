import { Home32 } from "@carbon/icons-react";
import { FC } from "react";
import { versionsStore } from "../store/VersionsStore";
import {
  VersionDescriptor,
  VersionsSelection
} from "../store/VersionsTypes";
import { HHBreadcrumb } from "./HHBreadCrumb";

export type HHBreadcrumbsProps = {
  versionsSelection: VersionsSelection;
  versionDesc?: VersionDescriptor;
};

export const HHBreadcrumbs: FC<HHBreadcrumbsProps> = ({
  versionDesc,
  versionsSelection
}) => {
  console.log("versionsSelection ", versionsSelection);
  console.log("versionsTree", versionsStore);
  return (
    <div className="container my-0">
      <nav className="breadcrumb has-arrow-separator">
        {versionDesc ? (
          <ul>
            <HHBreadcrumb
              chosen={versionDesc.orgBudgetName}
              possibilities={versionsSelection.orgBudgets}
            />
            <HHBreadcrumb
              chosen={versionDesc.budgetName}
              possibilities={versionsSelection.budgets}
            />

            <HHBreadcrumb
              chosen={versionDesc.lineName}
              possibilities={versionsSelection.lines}
            />
            <HHBreadcrumb
              chosen={versionDesc.modStateName}
              possibilities={versionsSelection.modStates}
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
