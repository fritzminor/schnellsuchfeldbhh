import {
  EingabeHilfeItem,
  Keyword,
  RegExMatcher,
  Tag
} from "./EingabeHilfeTypes";

export const tags: Tag[] = [
  {
    name: "gesetzlLand",
    description: "gesetzliche Leistungen des Landes"
  },
  {
    name: "gesetzlBund",
    description:
      "gesetzliche Leistungen des Bundes oder der EU"
  },
  {
    name: "freiwillig",
    description: "freiwillige Leistungen"
  },
  {
    name: "gemPA",
    description:
      "gemeinsam bewirtschaftete Personalausgaben"
  },
  {
    name: "verstfPA",
    description: "verstärkungsfähige Personalausgaben"
  },
  {
    name: "deckungsfähig",
    description: "Haushaltsstellen mit Deckungsvermerk"
  },
  {
    name: "verstärkungsfähig",
    description: "Haushaltsstellen mit Verstärkungsvermerk"
  },
  {
    name: "Budget",
    description:
      "Haushaltsstellen, die im Budgetkreis gedeckt werden können"
  },
  {
    name: "übertragbar",
    description:
      "Haushaltsstellen, deren Reste ins nächste Jahr übertragen werden können"
  },
  {
    name: "HTA",
    description: "HighTech-Agenda"
  },
  {
    name: "KoaV",
    description: "Koalitionsvertrag"
  }
];

export const keywords: Keyword[] = [
  {
    name: "Epl",
    description:
      "Alle Haushaltsstellen eines Einzelplans, z.B. Epl:01 für Einzelplan des Bundespräsidenten",
    minDigits: 1,
    maxDigits: 2,
    fullMatchDescriptor: (curToken: string): string | null => {
      const regExRes = /^Epl:(\d{1,2})?$/i.exec(curToken);
      if (!regExRes) return null; //TODO: handle minus sign
      return `Suche in Einzelplan  ${regExRes && regExRes[1].length === 1
          ? "0" + regExRes[1]
          : regExRes
            ? regExRes[1]
            : ""
        }.`;
    }
  },
  {
    name: "Kap",
    description:
      "Alle Haushaltsstellen eines Kapitels, z.B. Kap:02 für alle Sammelkapitel oder Kap:1319 für Kapitel 19 im Einzelplan 13",
    minDigits: 1,
    maxDigits: 4,
    fullMatchDescriptor: (curToken: string): string | null => {
      const regExRes = /^Kap:(\d{1,2})(\d{1,2})?$/i.exec(
        curToken
      );
      if (!regExRes) return null; //TODO: handle minus sign
      if (regExRes && regExRes[2])
        return `Suche in Einzelplan ${regExRes[1]
          } Kapitel ${regExRes && regExRes[2].length === 1
            ? "0" + regExRes[2]
            : regExRes[2]
          }.`;
      else
        return `Suche in Kapitel ${regExRes && regExRes[1].length === 1
            ? "0" + regExRes[1]
            : (regExRes && regExRes[1]) || ""
          }.`;
    }
  },

  {
    name: "Grp",
    description: `Haushaltsstellen mit bestimmter Gruppierungsnummer, z.B. Grp:4 für Personalausgaben oder Grp:811 für Kfz-Anschaffungen`,
    minDigits: 1,
    maxDigits: 3
  },

  {
    name: "TG",
    description: `Haushaltsstellen in Titelgruppen, z.B. TG:98`,
    minDigits: 2,
    maxDigits: 2
  },
  {
    name: "FKZ",
    description:
      "Alle Haushaltsstellen mit einer bestimmten Funktionskennziffer, Haupt- oder Oberfunktion reicht aus.",
    minDigits: 1,
    maxDigits: 3
  },

  {
    name: "Soll1",
    description: `Suche nach Haushaltsbetrag/Haushaltsansatz für das erste Aufstellungsjahr`,
    minDigits: 1
  },
  /*
    {
      name: "Soll2",
      description: `Suche nach Haushaltsbetrag/Haushaltsansatz für das zweite Aufstellungsjahr`,
      minDigits: 1
    },*/
  {
    name: "Zweck",
    description: `Suche in Zweckbestimmung, z.B. Zweck:Verwaltungsaufwand`
  },

  {
    name: "Erl",
    description: `Suche in Erläuterung, z.B. Erl:Dienstreisen`
  },

  {
    name: "Volltext",
    description: `Volltextsuche in Zweckbestimmungen, Erläuterungen, Überschriften etc.`
  },

  {
    name: "Titelnr",
    description: `Suche nach Titelnummer, z.B. Titelnr:52901`,
    minDigits: 1,
    maxDigits: 5
  },

  {
    name: "VE1",
    description: `Suche nach Betrag der Verpflichtungsermächtigung
      im ersten Aufstellungsjahr`,
    minDigits: 1
  },
  {
    name: "VE2",
    description: `Suche nach Betrag der Verpflichtungsermächtigung
      im zweiten Aufstellungsjahr`,
    minDigits: 1
  }
];

export const regExMatchers: RegExMatcher[] = [
  {
    regEx: /^(\d{2})$/,
    convertStr: "Epl:$1",
    descriptionStr: "Suche nach Einzelplan $1"
  },
  {
    regEx: /^(\d{1})$/,
    convertStr: "Grp:$1",
    descriptionStr: "Suche nach Hauptgruppe $1"
  },
  {
    regEx: /^(\d{3})$/,
    convertStr: "Grp:$1",
    descriptionStr: "Suche nach Gruppierungsnummer $1"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?$/,
    convertStr: "Kap:$1$2",
    descriptionStr: "Suche im Einzelplan $1 nach Kapitel $2"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?(\d)$/,
    convertStr: "Kap:$1$2 Grp:$3",
    descriptionStr:
      "Suche im Kapitel $1 $2 nach Hauptgruppe $3"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?(\d\d)$/,
    convertStr: "Kap:$1$2 TG:$3",
    descriptionStr:
      "Suche im Kapitel $1 $2 nach Titelgruppe $3"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?(\d\d\d)$/,
    convertStr: "Kap:$1$2 Grp:$3",
    descriptionStr:
      "Suche im Kapitel $1 $2 nach Gruppierungsnummer $3"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?(\d{3})(\d)$/,
    convertStr: "Kap:$1$2 Titelnr:$3$4",
    descriptionStr:
      "Suche im Kapitel $1 $2 nach Titelnummer $3 $4x"
  },
  {
    regEx: /^(\d{2})(\d{2})\/?(\d{3})(\d\d)$/,
    convertStr: "Kap:$1$2 Titelnr:$3$4",
    descriptionStr:
      "Suche im Kapitel $1 $2 nach Titelnummer $3 $4"
  }
];

/** Diese Vorschläge werden am Anfang gezeigt, wenn das Suchfeld noch leer ist
 *  oder ein neuer Ausdruck begonnen wurde.
 */
export const proposalsForEmptyField: EingabeHilfeItem[] = [
  {
    proposal: "Suchbegriff",
    description: `Volltextsuche nach Suchbegriff in Zweckbestimmungen, Erläuterungen, Überschriften etc.`
  },
  {
    proposal: "4",
    description: `Hauptgruppe 4 - Personalausgaben`
  },
  {
    proposal: "1319",
    description: `Kapitel 13 19`
  },
  {
    proposal: "Kzn:freiwillig",
    description: `Haushaltsstellen mit dem Kennzeichen "freiwillig"
       für freiwillige Leistungen`
  },

  {
    proposal: "Grp:4-8",
    description: `Hauptgruppen 4 bis 8`
  },
];

/** Diese Vorschläge werden bei entsprechenden Suchausdrücken gezeigt.
 *
 */
export const otherProposals: EingabeHilfeItem[] = [
  {
    proposal: "Grp:0",
    description:
      "Hauptgruppe 0 - Einnahmen aus Steuern und steuerähnlichen Abgaben sowie EU-Eigenmittel"
  }, {
    proposal: "Grp:01-08",
    description:
      "Obergruppe 01-08 - Steuereinnahmen"
  },
  {
    proposal: "Grp:1",
    description:
      "Verwaltungseinnahmen, Einnahmen aus Schuldendienst u. dgl."
  },
  {
    proposal: "Grp:2",
    description:
      "Hauptgruppe 2 - Einnahmen aus Zuweisungen und Zuschüssen mit Ausnahme für Investitionen"
  },
  {
    proposal: "Grp:3",
    description:
      "Hauptgruppe 3 - Einnahmen aus Schuldenaufnahmen, aus Zuweisungen und Zuschüssen für Investitionen, besondere Finanzierungseinnahmen"
  },
  {
    proposal: "Grp:4",
    description: "Hauptgruppe 4 - Personalausgaben"
  },
  {
    proposal: "Grp:5",
    description:
      "Hauptgruppe 5 - Sächliche Verwaltungsausgaben, Ausgaben für den Schuldendienst"
  },
  {
    proposal: "Grp:6",
    description:
      "Hauptgruppe 6 - Ausgaben für Zuweisungen und Zuschüsse mit Ausnahme für Investitionen"
  },
  {
    proposal: "7",
    description: "Hauptgruppe 7 - Baumaßnahmen"
  },
  {
    proposal: "8",
    description:
      "Hauptgruppe 8 - Sonstige Sachinvestitionen, Investitionsförderungsmaßnahmen"
  },
  {
    proposal: "9",
    description:
      "Hauptgruppe 9 - Besondere Finanzierungsausgaben"
  },
  {
    proposal: "Grp:0-3",
    description:
      "Hauptgruppe 0-3  - Einnahmen"
  },
  {
    proposal: "Grp:4-9",
    description:
      "Hauptgruppe 4-9  - Ausgaben"
  },

];
