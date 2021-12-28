import {
  add,
  explodeRule,
  parseAndAdd,
  parseSnailfishNumber,
  reduceSnailfishNumber,
  splitRule,
  stringifySnailfishNumber,
} from "./solution";

describe.each([
  ["[[[[[9,8],1],2],3],4]", "[[[[0,9],2],3],4]"],
  ["[7,[6,[5,[4,[3,2]]]]]", "[7,[6,[5,[7,0]]]]"],
  ["[[6,[5,[4,[3,2]]]],1]", "[[6,[5,[7,0]]],3]"],
  [
    "[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]",
    "[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]",
  ],
  ["[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[7,0]]]]"],
])(".explodeRule(%s) = %s", (start, expected) => {
  it("should become as expected", () => {
    const sn = parseSnailfishNumber(start.split(""));
    explodeRule(sn, 0);
    const after = stringifySnailfishNumber(sn);
    expect(after).toBe(expected);
  });
});

describe("parse", () => {
  it("should parse", () => {
    parseSnailfishNumber([
      "[",
      "[",
      "[",
      "[",
      "4",
      ",",
      "0",
      "]",
      ",",
      "[",
      "5",
      ",",
      "4",
      "]",
      "]",
      ",",
      "[",
      "[",
      "7",
      ",",
      "0",
      "]",
      ",",
      "[",
      "15",
      ",",
      "5",
      "]",
      "]",
      "]",
      ",",
      "[",
      "10",
      ",",
      "[",
      "[",
      "11",
      ",",
      "9",
      "]",
      ",",
      "[",
      "11",
      ",",
      "0",
      "]",
      "]",
      "]",
      "]",
    ]);
  });
});

describe("specific explode rules", () => {
  it("should not explode", () => {
    const before = [
      "[",
      "[",
      "[",
      "[",
      "4",
      ",",
      "0",
      "]",
      ",",
      "[",
      "5",
      ",",
      "4",
      "]",
      "]",
      ",",
      "[",
      "[",
      "7",
      ",",
      "0",
      "]",
      ",",
      "[",
      "15",
      ",",
      "5",
      "]",
      "]",
      "]",
      ",",
      "[",
      "10",
      ",",
      "[",
      "[",
      "11",
      ",",
      "9",
      "]",
      ",",
      "[",
      "11",
      ",",
      "0",
      "]",
      "]",
      "]",
      "]",
    ];
    const sn = parseSnailfishNumber(before);
    const r = explodeRule(sn, 0);
    const after = stringifySnailfishNumber(sn);
    expect(after).toBe(before.join(""));
    expect(r).toBeNull();
  });
});

describe("add + reduce", () => {
  it("[[[[4,3],4],4],[7,[[8,4],9]]] + [1,1] = [[[[0,7],4],[[7,8],[6,0]]],[8,1]]", () => {
    const s1 = parseSnailfishNumber("[[[[4,3],4],4],[7,[[8,4],9]]]".split(""));
    const s2 = parseSnailfishNumber("[1,1]".split(""));
    const res = reduceSnailfishNumber(add(s1, s2));
    expect(stringifySnailfishNumber(res)).toBe(
      "[[[[0,7],4],[[7,8],[6,0]]],[8,1]]"
    );
  });

  it("[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]] + [7,[[[3,7],[4,3]],[[6,3],[8,8]]]] = [[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]", () => {
    const s1 = parseSnailfishNumber(
      "[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]".split("")
    );
    const s2 = parseSnailfishNumber(
      "[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]".split("")
    );
    const res = reduceSnailfishNumber(add(s1, s2));
    expect(stringifySnailfishNumber(res)).toBe(
      "[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]"
    );
  });

  it("[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]] + [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]] = [[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]", () => {
    const s1 = parseSnailfishNumber(
      "[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]".split("")
    );
    const s2 = parseSnailfishNumber(
      "[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]".split("")
    );
    const res = reduceSnailfishNumber(add(s1, s2));
    expect(stringifySnailfishNumber(res)).toBe(
      "[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]"
    );
  });

  it("[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]] + [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]] = [[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]", () => {
    const s1 = parseSnailfishNumber(
      "[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]".split("")
    );
    const s2 = parseSnailfishNumber(
      "[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]".split("")
    );
    const res = reduceSnailfishNumber(add(s1, s2));
    expect(stringifySnailfishNumber(res)).toBe(
      "[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]"
    );
  });

  it("[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]] + [7,[5,[[3,8],[1,4]]]] = [[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]", () => {
    const s1 = parseSnailfishNumber(
      "[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]".split("")
    );
    const s2 = parseSnailfishNumber("[7,[5,[[3,8],[1,4]]]]".split(""));
    const res = reduceSnailfishNumber(add(s1, s2));
    expect(stringifySnailfishNumber(res)).toBe(
      "[[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]"
    );
  });
});

describe.each([
  /*{
    list: ["[1,1]", "[2,2]", "[3,3]", "[4,4]"],
    expected: "[[[[1,1],[2,2]],[3,3]],[4,4]]",
  },
  {
    list: ["[1,1]", "[2,2]", "[3,3]", "[4,4]", "[5,5]"],
    expected: "[[[[3,0],[5,3]],[4,4]],[5,5]]",
  },
  {
    list: ["[1,1]", "[2,2]", "[3,3]", "[4,4]", "[5,5]", "[6,6]"],
    expected: "[[[[5,0],[7,4]],[5,5]],[6,6]]",
  },*/
  {
    list: [
      "[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]",
      "[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]",
      "[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]",
      "[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]",
      "[7,[5,[[3,8],[1,4]]]]",
      "[[2,[2,2]],[8,[8,1]]]",
      "[2,9]",
      "[1,[[[9,3],9],[[9,0],[0,7]]]]",
      "[[[5,[7,4]],7],1]",
      "[[[[4,2],2],6],[8,7]]",
    ],
    expected: "[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]",
  },
])(".add()", ({ list, expected }) => {
  it(`sum(${list}) = ${expected}`, () => {
    const result = parseAndAdd(list);
    expect(stringifySnailfishNumber(result)).toBe(expected);
  });
});

describe("split", () => {
  it("should split", () => {
    const s1 = parseSnailfishNumber(
      "[[[[7,7],[7,8]],[[9,5],[8,0]]],[[[9,10],20],[8,[9,0]]]]".split("")
    );
    splitRule(s1);
  });
});
