export type SearchFieldsData = {
  positive: SearchFieldsSimpleRowsData;
  negative: SearchFieldsSimpleRowsData;
};

type SearchFieldsSimpleRowsData = {
  epl: SearchFieldDataPseudoNumeric;
  kap: SearchFieldDataPseudoNumeric;
  gruppe: SearchFieldDataPseudoNumeric;
  fulltext: SearchFieldDataSingle;
};
export type SearchFieldData =
  | SearchFieldDataSingle
  | SearchFieldDataPseudoNumeric;

export type SearchFieldDataBase = {
  label: string;
  keyword: string;
  hidden?: boolean;
};
export type SearchFieldDataSingle = SearchFieldDataBase & {
  type: "single";
  value: string;
};

export type SearchFieldDataPseudoNumeric = SearchFieldDataBase & {
  type: "pseudonumeric";
  minDigits: number;
  valueFrom: string;
  valueTo: string;
};
