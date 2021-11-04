import { FC } from "react";
import { Name2VersionDesc } from "../../store/VersionsTypes";

export type ModalVersionCategoryProps = {
  catName: string;
  currName: string;
  setCurrName: (name: string) => void;
  name2versions: Name2VersionDesc[];
};

export const ModalVersionCategory: FC<ModalVersionCategoryProps> =
  ({ catName, currName, setCurrName, name2versions }) => {
    return (
      <div className="field">
        <label className="label">{catName}</label>

        <div className="control">
          <input
            className="input"
            type="text"
            value={currName}
            onChange={(ev) => {
              setCurrName(ev.target.value);
            }}
          />
        </div>
        <div className="m-2">
          {name2versions.map(({ name }, index) => {
            const checked: boolean = name === currName;
            console.log(
              "ModalCategory checkkk",
              name,
              currName,
              checked
            );
            return (
              <button
                className= {"button is-small"+(checked?" is-primary":"")}
                key={`name${index}`}
                onClick={() => setCurrName(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
