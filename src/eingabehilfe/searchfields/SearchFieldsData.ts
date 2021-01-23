import { SearchFieldsData } from "./SearchFieldsTypes";

export const initialFieldsData: SearchFieldsData = {
  negative: {},
  positive: {
    epl: {
      label: "Einzelplan",
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
