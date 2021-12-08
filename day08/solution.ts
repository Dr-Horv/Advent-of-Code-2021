interface Note {
  patterns: string[];
  outputs: string[];
}

const NBR_SIGNALS_FOR_1 = 2;
const NBR_SIGNALS_FOR_7 = 3;
const NBR_SIGNALS_FOR_4 = 4;
const NBR_SIGNALS_FOR_8 = 7;
const NBR_LOOKUP: Record<number, boolean> = {
  [NBR_SIGNALS_FOR_1]: true,
  [NBR_SIGNALS_FOR_7]: true,
  [NBR_SIGNALS_FOR_4]: true,
  [NBR_SIGNALS_FOR_8]: true,
};

const parseNote = (s: string): Note => {
  const [lhs, rhs] = s.split("|").map((s) => s.trim());
  const patterns = lhs.split(" ").map((s) => s.trim());
  const outputs = rhs.split(" ").map((s) => s.trim());
  return { patterns, outputs };
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const notes = input.map(parseNote);
  if (!isPartTwo) {
    let count = 0;
    for (const n of notes) {
      for (const o of n.outputs) {
        if (NBR_LOOKUP[o.length]) {
          count++;
        }
      }
    }

    return count.toString();
  }

  const values: number[] = [];
  for (const n of notes) {
    const segmentCounts = {
      a: n.patterns.filter((s) => s.includes("a")).length,
      b: n.patterns.filter((s) => s.includes("b")).length,
      c: n.patterns.filter((s) => s.includes("c")).length,
      d: n.patterns.filter((s) => s.includes("d")).length,
      e: n.patterns.filter((s) => s.includes("e")).length,
      f: n.patterns.filter((s) => s.includes("f")).length,
      g: n.patterns.filter((s) => s.includes("g")).length,
    };

    const findCount = (n: number, segmentCounts: Record<string, number>) => {
      const r = Object.entries(segmentCounts).find((e) => e[1] === n);
      return r![0];
    };

    const connectionMap: Record<string, string> = {
      f: findCount(9, segmentCounts),
      b: findCount(6, segmentCounts),
      e: findCount(4, segmentCounts),
    };

    const oneEntry = n.patterns.find((p) => p.length === NBR_SIGNALS_FOR_1)!;
    const c = oneEntry.replace(connectionMap["f"], "");
    connectionMap["c"] = c;

    const sevenEntry = n.patterns.find((p) => p.length === NBR_SIGNALS_FOR_7)!;
    const a = sevenEntry
      .replace(connectionMap["c"], "")
      .replace(connectionMap["f"], "");

    connectionMap["a"] = a;

    const fourEntry = n.patterns.find((p) => p.length === NBR_SIGNALS_FOR_4)!;
    const d = fourEntry
      .replace(connectionMap["c"], "")
      .replace(connectionMap["f"], "")
      .replace(connectionMap["b"], "");

    connectionMap["d"] = d;

    const eightEntry = n.patterns.find((p) => p.length === NBR_SIGNALS_FOR_8)!;

    const g = eightEntry
      .replace(connectionMap["b"], "")
      .replace(connectionMap["c"], "")
      .replace(connectionMap["d"], "")
      .replace(connectionMap["f"], "")
      .replace(connectionMap["a"], "")
      .replace(connectionMap["e"], "");

    connectionMap["g"] = g;

    const translation: Record<string, number> = {
      abcefg: 0,
      cf: 1,
      acdeg: 2,
      acdfg: 3,
      bcdf: 4,
      abdfg: 5,
      abdefg: 6,
      acf: 7,
      abcdefg: 8,
      abcdfg: 9,
    };

    //console.log(connectionMap);

    const reverseMap: Record<string, string> = {};
    for (const e of Object.entries(connectionMap)) {
      reverseMap[e[1]] = e[0];
    }

    const outputValues = n.outputs.map((o) => {
      const key = o
        .split("")
        .sort()
        .map((s) => {
          return s;
        })
        .map((c) => reverseMap[c])
        .sort()
        .join("");
      return translation[key];
    });

    values.push(parseInt(outputValues.map((n) => n + "").join(""), 10));
  }

  return values.reduce((acc, curr) => acc + curr).toString();
};
