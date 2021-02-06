import { HHStFieldName } from "../../store/HHStType";

export type ClickSelectCategory = "epl2" | "kap2" | "tg2" | "fkz1" | "fkz2" | "fkz3" | "grp1" | "grp2" | "grp3";
export type CSCategoryMetaData = {
  category: ClickSelectCategory;
  description: string;

  /** Used in searchexpression, e.g. "Grp:"  */
  prefixSearchTerm: string;
  parentCategory?: ClickSelectCategory;
  digits: number;
  hhstKey: HHStFieldName;
}
