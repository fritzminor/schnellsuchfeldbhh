import { Compare32 } from "@carbon/icons-react";
import { FC, useState } from "react";
import { SetChangedFromVersion } from "../store/Store";
import {
  VersionDescriptor,
  VersionsSelection
} from "../store/versions/VersionsTypes";
import { CompareBreadcrumbs } from "./CompareBreadCrumbs";
import {
  HHBreadcrumbs,
  HHBreadcrumbsProps
} from "./HHBreadCrumbs";

export type BreadcrumbsSectionProps = HHBreadcrumbsProps & {
  setChangedFromVersion: SetChangedFromVersion;
  changedFromVersion: Readonly<VersionDescriptor> | null;
  changedFromVersionsSelection: Readonly<VersionsSelection>;
};

export const BreadcrumbsSection: FC<
  BreadcrumbsSectionProps
> = ({
  versionDesc,
  versionsSelection,
  setVersion,
  setChangedFromVersion,
  changedFromVersion,
  changedFromVersionsSelection
}) => {
  /** showCompareDialog is set when user asks for comparision. */
  const [showCompareDialog, setShowCompareDialog] =
    useState<boolean>(false);
  /** the compare dialog is shown
   * (i) if user asks for it or
   * (ii) if currently a comparison is shown
   */
  const shouldShowCompareDialog =
    showCompareDialog || changedFromVersion != null;

  const stopComparison = () => {
    setShowCompareDialog(false);
    setChangedFromVersion(null);
  };

  const hhBreadCrumbs = (
    <HHBreadcrumbs
      versionDesc={versionDesc}
      versionsSelection={versionsSelection}
      setVersion={setVersion}
    />
  );

  const compareDialog = (
    <div className={"container"}>
      <div>
        <div className="is-flex">
          <div className="is-align-self-center">
            <span
              className={
                "icon" +
                (changedFromVersion
                  ? ""
                  : " has-text-grey-light")
              }
            >
              <Compare32 />
            </span>
          </div>
          <div>
            <div>{hhBreadCrumbs}</div>
            <div className="">
              <CompareBreadcrumbs
                versionDesc={
                  changedFromVersion || versionDesc
                }
                versionsSelection={
                  changedFromVersionsSelection
                }
                setVersion={setChangedFromVersion}
              />
            </div>
          </div>
        </div>
        <div className="">
          <div className="field">
            <input
              id="onlyChanges"
              name="onlyChanges"
              type="checkbox"
              className="switch"
              checked={true}
            />
            <label htmlFor="onlyChanges">
              Zeige nur Änderungen
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <section
      className="section mb-1 py-1"
      id="hh_breadcrumbs"
    >
      {shouldShowCompareDialog ? (
        <div className="container">
          <div className="notification">
            <button
              className="delete"
              onClick={stopComparison}
            />
            {compareDialog}
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="is-flex is-justify-content-space-between">
            <div className="">{hhBreadCrumbs}</div>
            <div className="">
              <button
                className="button"
                onClick={() => setShowCompareDialog(true)}
              >
                <span className="icon has-text-grey-light">
                  <Compare32 />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
