import { SearchNode } from "../hhstliste/hhstListeLogic/searchTreeTypes";
import { UserName } from "../navigation/UsersTypes";
import { AnalyzeResults } from "../import/importAnalyseSheet";
import {
  HHSt,
  HHStBlockLimiter,
  HHStOrBlock
} from "./HHStType";
import { getSearchTree } from "../hhstliste/hhstListeLogic/searchParser";
import { isSearched } from "../hhstliste/hhstListeLogic/evalSearch4HHSt";

export type Totals = {
  revenues: number;
  expenses: number;
};

/** Titelgruppen description */
export type TgMap = {
  /** tgKey, e.g. "0102TG60" for TG 60 in Epl 01 Kap 02  */
  [index: string]: {
    /** e.g. "60" */
    tgNr: string;
    /** tg description used as tg caption */
    name: string;
  };
};

export type AppState = {
  searchexpression: string;
  currentUser: UserName;

  modalInfo: string | AnalyzeResults | null;

  derived: {
    searchTree: SearchNode | null;
    searchParseErrMessage?: string;

    /** contains all HHSt of the given user (not restricted to searchexpression / searchTree) */
    hhstArray: HHSt[];

    /** contains the tg-descriptions */
    tgMap: TgMap;

    /** contains the HHSts filtered by searchTree plus block elements for (sub-)totals. */
    filteredHhstArray: HHStOrBlock[];

    totals: Totals;

    /** the first budget year = SollJahr1 */
    firstYear: number;
  };
};

const emptyBlockDesc = {
  name: "",
  totalExpenses: 0,
  totalRevenues: 0,
  anyExpense: false,
  anyRevenue: false
};

/** helper method to get filteredHhstList from given searchexpression */
export function getFilteredHhstArray(
  hhstArray: HHSt[],
  tgMap: TgMap,
  searchexpression: string,
  withBlocks = false
): {
  searchTree: SearchNode | null;
  filteredHhstArray: HHStOrBlock[];
  totals: Totals;
} {
  const totals: Totals = {
    revenues: 0,
    expenses: 0
  };
  const searchTree = getSearchTree(searchexpression);
  const filteredHhstArray: HHStOrBlock[] = [];

  let currEpl = { ...emptyBlockDesc }; // clone emptyBlockDesc

  const pushEplTotals = () => {
    const totalRevenues: HHStBlockLimiter = {
      type: "block",
      blockstart: false,
      lastline: false,
      epl: currEpl.name,
      kap: "",
      gruppe: "",
      suffix: "",
      fkz: "",
      zweck: `Einnahmen Epl ${currEpl.name}`,
      sollJahr1: currEpl.totalRevenues
    };

    filteredHhstArray.push(totalRevenues);

    const totalExpenses: HHStBlockLimiter = {
      ...totalRevenues,
      lastline: true,
      zweck: `Ausgaben Epl ${currEpl.name}`,
      expense: true,
      sollJahr1: currEpl.totalExpenses
    };
    filteredHhstArray.push(totalExpenses);
    currEpl = { ...emptyBlockDesc }; // reset to content of emptyBlockDesc
  };

  /** currKap.name=epl+kap */
  let currKap = { ...emptyBlockDesc }; // clone emptyBlockDesc

  const pushKapTotals = () => {
    const zweckEnd = `Kap ${currKap.name.substr(
      0,
      2
    )} ${currKap.name.substr(2, 2)}`;
    const totalRevenues: HHStBlockLimiter = {
      type: "block",
      blockstart: false,
      lastline: false,
      epl: currKap.name.substr(0, 2),
      kap: currKap.name.substr(2, 2),
      gruppe: "",
      suffix: "",
      fkz: "",
      zweck: `Einnahmen ${zweckEnd}`,
      sollJahr1: currKap.totalRevenues
    };
    filteredHhstArray.push(totalRevenues);
    const totalExpenses: HHStBlockLimiter = {
      ...totalRevenues,
      lastline: true,
      zweck: `Ausgaben ${zweckEnd}`,
      expense: true,
      sollJahr1: currKap.totalExpenses
    };
    filteredHhstArray.push(totalExpenses);
    currKap = { ...emptyBlockDesc }; // reset to content of emptyBlockDesc
  };

  /** currTG.name=epl+kap+"TG"+tgNr */
  let currTG = { ...emptyBlockDesc }; // clone emptyBlockDesc

  const pushTgTotals = () => {
    const zweckEnd =
      tgMap[currTG.name].name ||
      `Epl ${currTG.name.substr(
        0,
        2
      )} Kap ${currTG.name.substr(
        2,
        2
      )} TG ${currTG.name.substr(6, 2)}`;
    const totalRevenues: HHStBlockLimiter = {
      type: "block",
      blockstart: false,
      lastline: !currTG.anyExpense,
      epl: currTG.name.substr(0, 2),
      kap: currTG.name.substr(2, 2),
      gruppe: `TG ${currTG.name.substr(6, 2)}`,
      suffix: "",
      fkz: "",
      zweck: `Einnahmen ${zweckEnd}`,
      sollJahr1: currTG.totalRevenues
    };

    if (currTG.anyRevenue)
      filteredHhstArray.push(totalRevenues);

    if (currTG.anyExpense) {
      const totalExpenses: HHStBlockLimiter = {
        ...totalRevenues,
        lastline: true,
        zweck: `Ausgaben ${zweckEnd}`,
        expense: true,
        sollJahr1: currTG.totalExpenses
      };
      filteredHhstArray.push(totalExpenses);
    }
    currTG = { ...emptyBlockDesc }; // reset to content of emptyBlockDesc
  };

  hhstArray.forEach((hhst) => {
    if (isSearched(hhst, searchTree)) {
      if (withBlocks) {
        const hhstTgKey = hhst.tgKey;
        if (
          (hhstTgKey || currTG.name) &&
          hhstTgKey !== currTG.name
        ) {
          if (currTG.name)
            // end of currEpl
            pushTgTotals();
          else currTG = { ...emptyBlockDesc };
          currTG.name = hhstTgKey || "";
        }
        const hhstKap4 = hhst.epl + hhst.kap;
        if (hhstKap4 !== currKap.name) {
          if (currKap.name)
            // end of currEpl
            pushKapTotals();
          currKap.name = hhstKap4;
        }

        if (hhst.epl !== currEpl.name) {
          if (currEpl.name)
            // end of currEpl
            pushEplTotals();
          currEpl.name = hhst.epl;
        }
      }

      filteredHhstArray.push(hhst);

      if (hhst.expense) {
        currTG.totalExpenses += hhst.sollJahr1;
        currTG.anyExpense = true;
        currKap.totalExpenses += hhst.sollJahr1;
        currEpl.totalExpenses += hhst.sollJahr1;
        totals.expenses += hhst.sollJahr1;
      } else {
        currTG.totalRevenues += hhst.sollJahr1;
        currTG.anyRevenue = true;
        currKap.totalRevenues += hhst.sollJahr1;
        currEpl.totalRevenues += hhst.sollJahr1;
        totals.revenues += hhst.sollJahr1;
      }
    }
  });

  if (withBlocks) {
    if (currTG.name) pushTgTotals();
    if (currKap.name) pushKapTotals();
    if (currEpl.name) pushEplTotals();
    const totalRevenues: HHStBlockLimiter = {
      type: "block",
      blockstart: false,
      lastline: false,
      epl: "",
      kap: "",
      gruppe: "",
      suffix: "",
      fkz: "",
      zweck: "Gesamteinnahmen",
      sollJahr1: totals.revenues
    };
    filteredHhstArray.push(totalRevenues);
    const totalExpenses: HHStBlockLimiter = {
      ...totalRevenues,
      lastline: true,
      zweck: "Gesamtausgaben",
      expense: true,
      sollJahr1: totals.expenses
    };
    filteredHhstArray.push(totalExpenses);
  }
  return { searchTree, filteredHhstArray, totals };
}

/** helper method.
 * returns a number formatted with . as 000 separator and a comma 0
 */
export function formatBetrag(betrag: number): string {
  return betrag === 0
    ? "-"
    : betrag.toLocaleString("de-DE", {
        minimumFractionDigits: 1
      });
}
