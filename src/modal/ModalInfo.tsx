import { FC } from "react";
import { AppState } from "../store/AppState";
import { Store } from "../store/Store";
import { ModalAnalysis } from "./ModalAnalysis";
import { ModalMessage } from "./ModalMessage";
import { ModalVersionProperties } from "./versionproperties/ModalVersionProperties";

export type ModalInfoProps = {
  modalInfo: AppState["modalInfo"];
  hideUserMessage: Store["hideUserMessage"];
};

export const ModalInfo: FC<ModalInfoProps> = ({
  modalInfo,
  hideUserMessage
}) => {
  if (modalInfo)
    return typeof modalInfo === "string" ? (
      <ModalMessage
        active={!!modalInfo}
        hideModal={hideUserMessage}
      >
        <div className="notification">{modalInfo}</div>
      </ModalMessage>
    ) : modalInfo.type === "AnalyzeResults" ? (
      <ModalAnalysis
        modalInfo={modalInfo}
        hideModal={() => {
          hideUserMessage;
        }}
      ></ModalAnalysis>
    ) : (
      <ModalVersionProperties versionProps={modalInfo} hideModal={hideUserMessage} />
    );
  else return <></>;
};
