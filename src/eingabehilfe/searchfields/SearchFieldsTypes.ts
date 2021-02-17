export type SearchFieldsData = {
  positive: SearchFieldsSimpleRowsData;
  negative: SearchFieldsSimpleRowsData;
};

type SearchFieldsSimpleRowsData = {
  epl: SearchFieldDataPseudoNumeric;
  kap: SearchFieldDataPseudoNumeric;
  gruppe: SearchFieldDataPseudoNumeric;
  fkz: SearchFieldDataPseudoNumeric;
  fulltext: SearchFieldDataSingle;
};

export type SearchFieldData =
  | SearchFieldDataSingle
  | SearchFieldDataPseudoNumeric;

export type SearchFieldDataBase = {
  /** name displayed in UI searchfields */
  label: string;

  /** keyword used in Universalsuche */
  keyword: string;
  
};
export type SearchFieldDataSingle = SearchFieldDataBase & {
  type: "single";
  /** Suchbegriff oder Suchbegriffe mit Leerzeichen oder Komma getrennt */
  value: string;
};

export type SearchFieldDataPseudoNumeric = SearchFieldDataBase & {
  type: "pseudonumeric";
  minDigits: number;
  valueFrom: string;
  valueTo: string;
};
