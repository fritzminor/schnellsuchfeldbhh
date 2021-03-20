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
  expense?: boolean;
  /** three digits Funktionskennziffer */
  fkz: string;
  /** Zweckbestimmung  */
  zweck: string;

  /** Soll-Betrag */
  sollJahr1: number;
};

export type HHStFieldName= keyof HHSt;

export type HHStBlockEnd = {
  blockstart:false;

} & Omit<HHSt,"type">;

export type HHStBlockLimiter = {
  type:"block"
} & HHStBlockEnd;

export type HHStOrBlock = HHStBlockLimiter | HHSt;