import { getSearchTree } from "./searchParser";

describe("Search Parser tests", () => {
  test("Test TG:a_text", () => {
    const searchExpression = "TG:a_text";
    const result = getSearchTree(searchExpression);
    expect(result).toEqual({
      colType: "sectionMap",
      keyword: "TG",
      sectionKeyField: "tgKey",
      sectionMap: "tgMap",
      subtype: "single",
      type: "text",
      value: "a_text"
    });
  });
});
