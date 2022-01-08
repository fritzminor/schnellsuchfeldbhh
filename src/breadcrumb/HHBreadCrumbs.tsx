import { Home32 } from "@carbon/icons-react";
import { FC } from "react";
import { SetVersion } from "../store/Store";
import { versionsStore } from "../store/versions/VersionsStore";
import {
  VersionDescriptor,
  VersionsSelection
} from "../store/versions/VersionsTypes";
import { HHBreadcrumb } from "./HHBreadCrumb";

export type HHBreadcrumbsProps = {
  versionsSelection: VersionsSelection;
  versionDesc?: VersionDescriptor;
  setVersion: SetVersion;
  additionalClassNames?: string;
};

export const HHBreadcrumbs: FC<HHBreadcrumbsProps> = ({
  versionDesc,
  versionsSelection,
  setVersion,
  additionalClassNames
}) => {
  console.log("versionsSelection ", versionsSelection);
  console.log("versionsTree", versionsStore);
  return (
      <nav className="breadcrumb has-arrow-separator">
        {versionDesc ? (
          <ul>
            <HHBreadcrumb
              chosen={versionDesc.orgBudgetName}
              possibilities={versionsSelection.orgBudgets}
              setVersion={setVersion}
              additionalClassNames={additionalClassNames}
            />
            <HHBreadcrumb
              chosen={versionDesc.budgetName}
              possibilities={versionsSelection.budgets}
              setVersion={setVersion}
              additionalClassNames={additionalClassNames}
            />

            <HHBreadcrumb
              chosen={versionDesc.lineName}
              possibilities={versionsSelection.lines}
              setVersion={setVersion}
              additionalClassNames={additionalClassNames}
            />
            <HHBreadcrumb
              chosen={versionDesc.modStateName}
              possibilities={versionsSelection.modStates}
              setVersion={setVersion}
              additionalClassNames={additionalClassNames}
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
    
  );
};
