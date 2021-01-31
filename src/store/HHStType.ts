export type HHSt = {
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
