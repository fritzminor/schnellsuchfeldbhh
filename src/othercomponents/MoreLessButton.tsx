import { FC } from "react";


export type MoreLessButtonProps = {
  limited: boolean,
  setLimited: (limited: boolean) => void;
};

export const MoreLessButton: FC<MoreLessButtonProps> = ({ limited, setLimited }) => (
  limited ? (
    <button className="button is-small"
      onClick={() => {
        setLimited(false);
      }}
    >
      mehr...
    </button>
  ) : (
      <button className="button is-small"
        onClick={() => {
          setLimited(true);
        }}
      >
        weniger...
      </button>
    )
);