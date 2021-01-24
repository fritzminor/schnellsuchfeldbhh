import { SearchFieldsData } from "./SearchFieldsTypes";
import { cloneDeep } from "lodash";

const _initialFieldsData: SearchFieldsData = {
  negative: {
    epl: {
      label: "Einzelplan",
      keyword: "Epl",
      type: "pseudonumeric",
      minDigits: 2,
      hidden: true,
      valueFrom: "",
      valueTo: ""
    },
    kap: {
      label: "Kapitel",
      keyword: "Kap",
      type: "pseudonumeric",
      minDigits: 2,
      hidden: true,
      valueFrom: "",
      valueTo: ""
    },
    gruppe: {
      label: "Gruppierungnummer",
      keyword: "Grp",
      type: "pseudonumeric",
      minDigits: 1,
      valueFrom: "",
      valueTo: ""
    },
    fulltext: {
      label: "Volltextsuche",
      keyword: "Volltext",
      type: "single",
      hidden: true,
      value: ""
    }
  },
  positive: {
    epl: {
      label: "Einzelplan",
      keyword: "Epl",
      type: "pseudonumeric",
      minDigits: 2,
      valueFrom: "",
      valueTo: ""
    },
    kap: {
      label: "Kapitel",
      keyword: "Kap",
      type: "pseudonumeric",
      minDigits: 2,
      valueFrom: "",
      valueTo: ""
    },
    gruppe: {
      label: "Gruppierungsnummer",
      keyword: "Grp",
      type: "pseudonumeric",
      minDigits: 1,
      valueFrom: "",
      valueTo: ""
    },
    fulltext: {
      label: "Volltextsuche",
      keyword: "Volltext",
      type: "single",
      value: ""
    }
  }
};

export const fieldsPseudoNumeric: (keyof SearchFieldsData["positive"])[] = [
  "epl",
  "kap",
  "gruppe"
];

export const parserKeywords2FieldKeys: {
  [index: string]: "epl" | "kap" |"gruppe" //keyof SearchFieldsData["positive"];
} = {
  Epl: "epl",
  Kap: "kap",
  Grp: "gruppe"
};

export function initialFieldsData(): SearchFieldsData {
  const cloneData = cloneDeep(_initialFieldsData);
  return cloneData;
}
