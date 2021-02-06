import { AppState } from "../../store/AppState";
import { csCategoryMetaData } from "./ClickSelectData";
import { ClickSelectCategory, CSCategoryMetaData } from "./ClickSelectTypes";




type ItemMeta = {
  name: string; // short name as "02"
  description?: string; // long name as "Epl 02 - Bundestag"
  count: number;
  expAmount: number;
  revAmount: number;
};


export type ClickSelectCategoryData = {
  description: string,
  /** e.g. "Kap:"  */
  searchPrefix: string,
  itemsMeta: { [index: string]: ItemMeta };
  itemsSorted: string[];
};

export type ClickSelectData = {
  rootCategories: ClickSelectCategory[];
  data: {
    // TODO implement all categories, remove the question mark in next line
    [index in ClickSelectCategory]?: ClickSelectCategoryData
  }
}


const csCategoryMetaMap: {
  [key in ClickSelectCategory]?: CSCategoryMetaData
} = {};

csCategoryMetaData.forEach((meta) => {
  csCategoryMetaMap[meta.category] = meta;
})


export function getClickSelectData(appState: AppState): ClickSelectData {

  const categories: ClickSelectCategory[] = [];
  const data: ClickSelectData["data"] = {};

  // prepare categories
  csCategoryMetaData.forEach((meta) => {
    categories.push(meta.category); // first put any category to root categories
    data[meta.category] = {
      searchPrefix: meta.prefixSearchTerm,
      description: meta.description,
      itemsMeta: {},
      itemsSorted: []
    }
  });

  // fill items

  appState.derived.filteredHhstArray.forEach((hhst) => {

    categories.forEach(category => {
      const catMeta = csCategoryMetaMap[category];
      if (!catMeta) {
        throw new Error("FATAL:  " + category + " is missing meta!!!")
      }
      const hhstFieldName = catMeta.hhstKey;
      const itemLong = hhst[hhstFieldName];
      const categoryData = data[category];
      if (!categoryData) {
        throw new Error("FATAL:  " + category + " is missing data field!!!")
      }
      if (typeof itemLong !== "string")
        throw new Error("FATAL: " + hhstFieldName + " is not of type string!!!");
      else {
        const itemKey = itemLong.substr(0, catMeta.digits);
        const itemData = categoryData.itemsMeta[itemKey];
        if (!itemData) { // new item    
          categoryData.itemsSorted.push(itemKey)
          categoryData.itemsMeta[itemKey] = {
            name: itemKey,
            count: 1,
            expAmount: hhst.expense ? hhst.sollJahr1 : 0,
            revAmount: hhst.expense ? 0 : hhst.sollJahr1,
          }
        } else {
          if (hhst.expense)
            itemData.expAmount += hhst.sollJahr1;
          else
            itemData.revAmount += hhst.sollJahr1;
        }
      }
    })
  })

  // remove categories


  const rootCategories = [...categories];
  console.log(rootCategories);
  categories.forEach((category) => {
    console.log(category, rootCategories);
    // es-lint-disable-next-line @typescript-eslint/no-non-null-assertion
    const catMeta = csCategoryMetaMap[category]!;
    console.log(catMeta);
    const parentCategory = catMeta.parentCategory;
    let deleteCurrCat = false;
    if (parentCategory) {
      console.log("with parent", category, rootCategories);
      // es-lint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (data[parentCategory]!.itemsSorted.length <= 1) {
        // parent category has one or zero elements ==> delete parent category
        const parentIndex = rootCategories.indexOf(parentCategory);
        if (parentIndex >= 0)
          rootCategories.splice(parentIndex, 1);

      } else
      // delete current category because parent category is shown
        deleteCurrCat = true;
      
      
    }

    if(data[category]!.itemsSorted.length<=1) {
      // delete current category because not enough items in category
      deleteCurrCat=true;
    }

    if (deleteCurrCat) {
      const catIndex = rootCategories.indexOf(category);
      if (catIndex >= 0)
        rootCategories.splice(catIndex, 1);
    }
    console.log(category, rootCategories);

  })
  console.log(rootCategories);

  // sort items
  rootCategories.forEach(category => {

    // es-lint-disable-next-line @typescript-eslint/no-non-null-assertion
    const catData = data[category]!;
    catData.itemsSorted.sort((itemA, itemB) => {
      return itemA < itemB ? -1 : itemA > itemB ? 1 : 0;
    })
  })

  return { rootCategories, data };
}