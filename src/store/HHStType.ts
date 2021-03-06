export type HHSt = {
  type: "hhst";
  /** two digits Einzelplan */
  epl: string;
  /** two digits Kapitel */
  kap: string;
  /** three digits Gruppierungsnummer  */
  gruppe: string;

  /** two digits suffix/Titelgruppe */
  suffix: string;

  /** Titelgruppe 8 characters key, e.g. "0102TG60" for Titelgruppe 60 in Epl 01 Kap 02 */
  tgKey?: string;

  expense?: boolean;
  /** three digits Funktionskennziffer */
  fkz: string;
  /** Zweckbestimmung  */
  zweck: string;

  /** Soll-Betrag */
  sollJahr1: number;
};

export type HHStFieldName = keyof Omit<HHSt, "type" | "expense">;
/**
 * TODO: add kapKey, eplKey
 */
export type HHStSectionKeyField = "tgKey"; 


export type HHStBlockStart = {
  blockstart: true;
} & Omit<HHSt, "type">;

export type HHStBlockEnd = {
  blockstart: false;
  lastline: boolean;
} & Omit<HHSt, "type">;

export type HHStBlockLimiter = {
  type: "block";
} & (HHStBlockEnd | HHStBlockStart);

export type HHStOrBlock = HHStBlockLimiter | HHSt;
