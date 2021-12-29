import { cloneDeep, max, min, parseInt, reduce, sumBy } from "lodash";

type Cave = {
  key: string;
  big: boolean;
  connectedCaves: Cave[];
};

type Path = string[];

type AdvancedPath = {
  next: Cave;
  path: Path;
  hasVisitedSmallCaveTwice: boolean;
  visited: Set<string>;
};

type CaveGraph = Record<string, Cave>;

const findAllPaths = (advancedPath: AdvancedPath): AdvancedPath[] => {
  const curr = advancedPath.next;
  if (curr.key === "end") {
    return [advancedPath];
  }

  const canEnterCave = (c: Cave) => {
    if (c.key === "start") {
      return false;
    }

    if (c.big) {
      return true;
    }

    if (!advancedPath.hasVisitedSmallCaveTwice) {
      return true;
    }

    return !advancedPath.visited.has(c.key);
  };

  return curr.connectedCaves
    .filter((c) => canEnterCave(c))
    .flatMap((c) => {
      const newPath = cloneDeep(advancedPath);
      newPath.next = c;
      newPath.path.push(c.key);
      newPath.visited.add(c.key);
      if (!c.big) {
        newPath.hasVisitedSmallCaveTwice =
          newPath.hasVisitedSmallCaveTwice || advancedPath.visited.has(c.key);
      }

      return findAllPaths(newPath);
    });
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const graph: CaveGraph = {};
  for (const line of input) {
    const [a, b] = line.split("-");
    const existingA = graph[a] || {
      key: a,
      big: a.toUpperCase() === a,
      connectedCaves: [],
    };
    const existingB = graph[b] || {
      key: b,
      big: b.toUpperCase() === b,
      connectedCaves: [],
    };
    existingA.connectedCaves.push(existingB);
    existingB.connectedCaves.push(existingA);
    graph[a] = existingA;
    graph[b] = existingB;
  }

  const allPaths = findAllPaths({
    next: graph["start"],
    path: ["start"],
    hasVisitedSmallCaveTwice: !isPartTwo,
    visited: new Set<string>("start"),
  });

  return allPaths.length.toString();
};
