export type EingabeHilfeItem = {
  /** Z.B. "Epl:02" */
  proposal: string;

  /** Should proposed token replace original token? */
  additional?:boolean;

  /** Z.B. "Alle Elemente des Epl. 02" */
  description: string;
};


export type Keyword = {
  /** e.g. "Epl" */
  name: string;

  /** e.g. "Haushaltsstellen einer bestimmten Gruppierungsnummer, z.B. Grp:811 für Kfz-Anschaffungen" */
  description: string;

  /** wenn dies gesetzt ist, wird von einem Schlüsselwort ausgegangen, das eine Zahl ist
   * oder als eine solche dargestellt wird.
   */
  minDigits?: number;
  maxDigits?: number;

  fullMatchDescriptor?: FullMatchDescriptor;
};
export type FullMatchDescriptor = (curToken: string) => string | null;

/** Tag sind Kennzeichen wie z.B. für gemeinsam bewirtschaftete  Personalausgaben
 * oder für gesetzliche Leistungen.
 */
export type Tag = {
  /** z.B. "gemPA" für gemeinsam bewirtschaftet Personalausgaben */
  name: string;

  description: string;
};

/** RegExMatcher sind spezielle Kontrukte wie z.B. eine Ziffer für Hauptgruppe */
export type RegExMatcher = {
  regEx: RegExp;
  descriptionStr: string;
  convertStr: string;
};
