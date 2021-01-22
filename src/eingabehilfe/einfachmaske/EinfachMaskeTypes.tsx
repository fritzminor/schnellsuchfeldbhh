export type EinfachMaskeData = {
  "positive": EinfachMaskeSimpleRowsData,
  "negative": EinfachMaskeSimpleRowsData
}

type EinfachMaskeSimpleRowsData={
  epl?: EinfachMaskeRowData,
  kap?: EinfachMaskeData
}
export type EinfachMaskeRowData = {
  value1: string;
  value2: string;
}