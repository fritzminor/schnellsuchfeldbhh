import { CSCategoryMetaData } from "./ClickSelectTypes";

export const csCategoryMetaData: CSCategoryMetaData[] = [
  {
    category: "epl2",
    description: "Einschränken auf Einzelplan",
    prefixSearchTerm: "",
    digits: 2,
    hhstKey: "epl"
  },
  {
    category: "kap2",
    description: "Einschränken nach Kapitel",
    prefixSearchTerm: "Kap:",
    parentCategory: "epl2",
    digits: 2,
    hhstKey: "kap"
  },
  {
    category: "grp1",
    description: "Einschränken nach Hauptfunktion",
    prefixSearchTerm: "",
    digits: 1,
    hhstKey: "gruppe"
  },
  {
    category: "grp2",
    description: "Einschränken nach Obergruppe",
    prefixSearchTerm: "Grp:",
    parentCategory:"grp1",
    digits: 2,
    hhstKey: "gruppe"
  },
  {
    category: "grp3",
    description: "Einschränken nach Gruppierungsnummer",
    prefixSearchTerm: "",
    parentCategory:"grp2",
    digits: 3,
    hhstKey: "gruppe"
  },
  {
    category: "fkz1",
    description: "Einschränken nach Hauptfunktion",
    prefixSearchTerm: "Fkz:",
    digits: 1,
    hhstKey: "fkz"
  },
  {
    category: "fkz2",
    description: "Einschränken nach Oberfunktion",
    prefixSearchTerm: "Fkz:",
    parentCategory:"fkz1",
    digits: 2,
    hhstKey: "fkz"
  },
  {
    category: "fkz3",
    description: "Einschränken nach Funktionskennziffer",
    prefixSearchTerm: "Fkz:",
    parentCategory:"fkz2",
    digits: 3,
    hhstKey: "fkz"
  },

]


