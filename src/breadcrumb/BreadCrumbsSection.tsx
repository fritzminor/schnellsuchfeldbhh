import { Compare32 } from "@carbon/icons-react";
import { FC, useState } from "react";
import { CompareBreadcrumbs } from "./CompareBreadCrumbs";
import {
  HHBreadcrumbs,
  HHBreadcrumbsProps
} from "./HHBreadCrumbs";

export type BreadcrumbsSectionProps = HHBreadcrumbsProps;

export const BreadcrumbsSection: FC<
  BreadcrumbsSectionProps
> = ({ versionDesc, versionsSelection, setVersion }) => {
  const [compare, setCompare] = useState<boolean>(false);
  return (
    <>
      <section
        className="section mb-1 py-1"
        id="hh_breadcrumbs"
      >
        <div className="container">
          <div className="columns">
            <div className="column is-four-fifth">
              <HHBreadcrumbs
                versionDesc={versionDesc}
                versionsSelection={versionsSelection}
                setVersion={setVersion}
              />
            </div>
            <div className="column is-one-fifth">
              {compare ? (
                <></>
              ) : (
                <button
                  className="button"
                  onClick={() => setCompare(!compare)}
                >
                  <span className="icon has-text-grey-light">
                    <Compare32 />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      {compare ? (
        <section
          className="section mb-1 py-1"
          id="compare_breadcrumbs"
        >
          <div className="container">
            <div className="columns">
              <div className="column is-four-fifth">
                <CompareBreadcrumbs
                  versionDesc={versionDesc}
                  versionsSelection={versionsSelection}
                  setVersion={setVersion}
                />
              </div>
              <div className="column is-one-fifth">
                {compare ? (
                  <button
                    className="button"
                    onClick={() => setCompare(!compare)}
                  >
                    <span className="icon">
                      <Compare32 />
                    </span>
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <></>
      )}
    </>
  );
};
