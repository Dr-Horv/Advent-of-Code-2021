import { cloneDeep, max, maxBy, min, parseInt, reduce, sumBy } from "lodash";

type Position = { x: number; y: number };
const toKey = ({ x, y }: Position): string => `${x},${y}`;

type Paper = Record<string, Position>;

type VerticalFold = { type: "V"; x: number };
type HorizontalFold = { type: "H"; y: number };

type Fold = VerticalFold | HorizontalFold;

const foldPaper = (fold: Fold, paper: Paper): Paper => {
  const newPaper: Paper = {};
  for (const p of Object.values(paper)) {
    switch (fold.type) {
      case "V":
        if (p.x > fold.x) {
          const xDiff = Math.abs(p.x - fold.x);
          const newX = fold.x - xDiff;
          newPaper[toKey({ x: newX, y: p.y })] = { x: newX, y: p.y };
        } else {
          newPaper[toKey({ x: p.x, y: p.y })] = { x: p.x, y: p.y };
        }
        break;
      case "H":
        if (p.y > fold.y) {
          const yDiff = p.y > fold.y ? Math.abs(p.y - fold.y) : 0;
          const newY = fold.y - yDiff;
          newPaper[toKey({ x: p.x, y: newY })] = { x: p.x, y: newY };
        } else {
          newPaper[toKey({ x: p.x, y: p.y })] = { x: p.x, y: p.y };
        }

        break;
    }
  }

  return newPaper;
};

function printPaper(paper: Paper) {
  const maxX = maxBy(Object.values(paper), (p) => p.x)!.x;
  const maxY = maxBy(Object.values(paper), (p) => p.y)!.y;
  let str = "";
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      if (paper[toKey({ x, y })]) {
        str += "#";
      } else {
        str += ".";
      }
    }
    str += "\n";
  }
  console.log(str);
}

export const solve = (input: string[], isPartTwo: boolean): string => {
  let paper: Paper = {};

  while (!input[0].startsWith("fold")) {
    const l = input.shift()!;
    const [x, y] = l.split(",").map((i) => parseInt(i, 10));
    paper[toKey({ x, y })] = { x, y };
  }

  const folds: Fold[] = [];
  for (const f of input) {
    const fold = f.split(" ")[2];
    const [c, ns] = fold.split("=");
    const i = parseInt(ns, 10);
    if (c === "y") {
      folds.push({ type: "H", y: i });
    } else if (c === "x") {
      folds.push({ type: "V", x: i });
    }
  }

  if (!isPartTwo) {
    paper = foldPaper(folds[0], paper);
    return Object.keys(paper).length.toString();
  }

  while (folds.length > 0) {
    paper = foldPaper(folds.shift()!, paper);
  }
  printPaper(paper);
  //paper = foldPaper(folds[1], paper);
  //console.log(paper, Object.keys(paper).length);
  //printPaper(paper);

  return "";
};
