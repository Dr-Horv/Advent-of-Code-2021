class SyntaxError extends Error {
  expected: string;
  found: string;
  constructor(message: string, expected: string, found: string) {
    super(message);
    this.expected = expected;
    this.found = found;
  }
}

const OPENERS = new Set(["(", "[", "{", "<"]);
const CLOSERS = new Set([")", "]", "}", ">"]);
const CLOSER_MAP: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
};

const SYNTAX_ERROR_SCORE_MAP: Record<string, number> = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};

const REPAIR_SCORE_MAP: Record<string, number> = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
};

const syntaxCheck = (program: string[]): string | undefined => {
  if (program.length === 0) {
    return undefined;
  }
  const next = program.shift()!;
  if (OPENERS.has(next)) {
    const expect = CLOSER_MAP[next];
    const found = syntaxCheck(program);
    if (expect !== found) {
      if (found === undefined) {
        return undefined;
      }
      throw new SyntaxError("Syntax error", expect, found);
    }
    return syntaxCheck(program);
  } else {
    return next;
  }
};

const syntaxRepair = (
  program: string[],
  additions: string[]
): string | undefined => {
  if (program.length === 0) {
    return undefined;
  }
  const next = program.shift()!;
  if (OPENERS.has(next)) {
    const expect = CLOSER_MAP[next];
    const found = syntaxRepair(program, additions);
    if (expect !== found) {
      if (found === undefined) {
        additions.push(expect);
        return syntaxRepair(program, additions);
      }
      throw new SyntaxError("Syntax error", expect, found);
    }
    return syntaxRepair(program, additions);
  } else {
    return next;
  }
};

const repairScore = (additions: string[]): number => {
  let score = 0;
  for (const a of additions) {
    score *= 5;
    score += REPAIR_SCORE_MAP[a];
  }
  return score;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  let score = 0;
  const incomplete: string[][] = [];
  for (const l of input) {
    const program = l.split("");
    try {
      syntaxCheck([...program]);
      incomplete.push([...program]);
    } catch (e: unknown) {
      const se: SyntaxError = e as SyntaxError;
      console.log(se.message, `Expected: ${se.expected} Found: ${se.found}`);
      score += SYNTAX_ERROR_SCORE_MAP[se.found];
    }
  }
  if (!isPartTwo) {
    return score.toString();
  }

  const scores: number[] = [];
  for (const p of incomplete) {
    const additions: string[] = [];
    syntaxRepair(p, additions);
    scores.push(repairScore(additions));
  }

  const middleScore = scores.sort((s1, s2) => s2 - s1)[
    Math.floor(scores.length / 2)
  ];
  return middleScore.toString();
};
