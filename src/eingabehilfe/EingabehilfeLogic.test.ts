import {
  eingabehilfen,
  getCurrentTokenAtPos,
  replaceToken
} from "./EingabeHilfeLogic";

test("Leeres Suchfeld muss auch Epl: als Suchvorschlag liefern", () => {
  const suchfeld = { searchexpression: "", cursorPos: 0 };
  const res = eingabehilfen(suchfeld);
  expect(res.items).toContainEqual(
    expect.objectContaining({ proposal: "Epl:" })
  );
});

test("finde mittleres token", () => {
  const oldExp = "hi you world";
  const cursorPos = 6;
  const { curToken: result } = getCurrentTokenAtPos(oldExp, cursorPos);
  expect(result).toBe("you");
});

test("Mittleres Token sollte korrekt ersetzt werden.", () => {
  const oldExp = "hi you world";
  const cursorPos = 6;
  const newToken = "my";
  const result = replaceToken(oldExp, cursorPos, newToken);
  expect(result).toBe("hi my world");
});

test("Suchfeld mit '1' muss auch fullMatch liefern", () => {
  const suchfeld = { searchexpression: "1", cursorPos: 1 };
  const res = eingabehilfen(suchfeld);
  expect(res.fullMatch).toBeTruthy();
});

test("epl:122 should not throw an Error", () => {
  const suchfeld = { searchexpression: "epl:122", cursorPos: 7 };
  const res = eingabehilfen(suchfeld);
  expect(res.fullMatch).toContain("Volltext");
});

test("replace correctly", () => {
  const suchfeld = {
    searchexpression: "4 Kzn:verstfPA soll1:0- A, other stuff , Gr",
    cursorPos: 42
  };
  const res = replaceToken(
    suchfeld.searchexpression,
    suchfeld.cursorPos,
    "Grp:"
  );
  expect(res).toContain(" , Grp:");
});
