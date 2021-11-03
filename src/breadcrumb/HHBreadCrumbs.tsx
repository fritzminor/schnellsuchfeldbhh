import { Home32 } from "@carbon/icons-react";
import { FC } from "react";
import { SetVersion } from "../store/Store";
import { versionsStore } from "../store/VersionsStore";
import {
  VersionDescriptor,
  VersionsSelection
} from "../store/VersionsTypes";
import { HHBreadcrumb } from "./HHBreadCrumb";

export type HHBreadcrumbsProps = {
  versionsSelection: VersionsSelection;
  versionDesc?: VersionDescriptor;
  setVersion: SetVersion;
};

export const HHBreadcrumbs: FC<HHBreadcrumbsProps> = ({
  versionDesc,
  versionsSelection,
  setVersion
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
              setVersion={setVersion}
            />
            <HHBreadcrumb
              chosen={versionDesc.budgetName}
              possibilities={versionsSelection.budgets}
              setVersion={setVersion}
            />

            <HHBreadcrumb
              chosen={versionDesc.lineName}
              possibilities={versionsSelection.lines}
              setVersion={setVersion}
            />
            <HHBreadcrumb
              chosen={versionDesc.modStateName}
              possibilities={versionsSelection.modStates}
              setVersion={setVersion}
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
