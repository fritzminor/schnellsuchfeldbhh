import { Compare32 } from "@carbon/icons-react";
import { FC } from "react";
import {
  HHBreadcrumbs,
  HHBreadcrumbsProps
} from "./HHBreadCrumbs";

export type CompareBreadcrumbsProps = HHBreadcrumbsProps;

export const CompareBreadcrumbs: FC<CompareBreadcrumbsProps> =
  ({ versionDesc, versionsSelection, setVersion }) => {
    return (
      <div className="has-text-grey-light">
        <HHBreadcrumbs
          versionDesc={versionDesc}
          versionsSelection={versionsSelection}
          setVersion={setVersion}
          additionalClassNames="has-text-grey-light"
        />
      </div>
    );
  };
