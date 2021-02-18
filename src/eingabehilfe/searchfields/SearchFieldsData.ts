import { SearchFieldsData } from "./SearchFieldsTypes";
import { cloneDeep } from "lodash";

const _initialSimpleRowsData: SearchFieldsData["positive"]= {
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
    label: "Gruppierungnummer",
    keyword: "Grp",
    type: "pseudonumeric",
    minDigits: 1,
    valueFrom: "",
    valueTo: ""
  },
  fkz: {
    label: "Funktionskennziffer (FKZ)",
    keyword: "FKZ",
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
};

const _initialNegativeSimpleRowsData=cloneDeep(_initialSimpleRowsData);

const _initialFieldsData: SearchFieldsData = {
  negative: _initialNegativeSimpleRowsData,
  positive: _initialSimpleRowsData
};

export const fieldsPseudoNumeric: (keyof SearchFieldsData["positive"])[] = [
  "epl",
  "kap",
  "gruppe",
  "fkz"
];


export const fieldsLimited: (keyof SearchFieldsData["positive"])[] = [
  "epl",
  "kap",
  "fulltext"
];

export const fieldsExtended: (keyof SearchFieldsData["positive"])[] = [
  "epl",
  "kap",
  "gruppe",
  "fkz",
  "fulltext"
];

export const parserKeywords2FieldKeys: {
  [index: string]: //"epl" | "kap" | "gruppe" | "fkz" 
    Exclude<keyof SearchFieldsData["positive"],"fulltext">;
} = {
  Epl: "epl",
  Kap: "kap",
  Grp: "gruppe",
  FKZ: "fkz"
};

export function initialFieldsData(): SearchFieldsData {
  const cloneData = cloneDeep(_initialFieldsData);
  return cloneData;
}
