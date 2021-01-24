import { SearchFieldsData } from "./SearchFieldsTypes";

export const initialFieldsData: SearchFieldsData = {
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
      keyword: "Epl",
      type: "pseudonumeric",
      minDigits: 2,
      hidden: true,
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
      keyword: "Epl",
      type: "pseudonumeric",
      minDigits: 2,
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

export const fieldsPseudoNumeric: (keyof SearchFieldsData["positive"])[] = ["epl"];
