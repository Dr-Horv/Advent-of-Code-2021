import _ from "lodash";

export const solve = (input: string[], isPartTwo: boolean): string => {
  const rules: Record<string, string | undefined> = {};
  let current = input.shift()!;
  for (const r of input) {
    const [lhs, rhs] = r.split("->").map((s) => s.trim());
    rules[lhs] = rhs;
  }

  let pairs: Record<string, number> = {};

  for (let l = 0; l < current.length - 1; l++) {
    const lc = current[l];
    const rc = current[l + 1];
    const n = pairs[lc + rc] || 0;
    pairs[lc + rc] = n + 1;
    const insertion = rules[lc + rc];
    if (insertion) {
      const n = pairs[lc + insertion] || 0;
      pairs[lc + rc] = n + 1;

      const m = pairs[insertion + rc] || 0;
      pairs[lc + rc] = m + 1;
    }
  }

  const add = (
    o: Record<string, number | undefined>,
    k: string,
    add: number
  ) => {
    let n = o[k];
    if (n === undefined) {
      n = 0;
    }
    o[k] = n + add;
  };

  console.log(pairs);
  for (let i = 0; i < 40; i++) {
    const nextPairs: Record<string, number> = {};
    for (const p of Object.keys(pairs)) {
      const insertion = rules[p];
      const count = pairs[p];
      if (insertion) {
        const [lc, rc] = p.split("");
        add(nextPairs, lc + insertion, count);
        add(nextPairs, insertion + rc, count);
      } else {
        add(nextPairs, p, count);
      }
    }
    //console.log(pairs, nextPairs);
    pairs = nextPairs;
  }

  /*console.log(pairs);
  for (const p of [
    "NB",
    "BC",
    "CC",
    "CN",
    "NB",
    "BB",
    "BC",
    "CB",
    "BH",
    "HC",
    "CB",
  ]) {
    if (pairs[p] === undefined || pairs[p] === 0) {
      console.log("missing", p);
    } else {
      pairs[p]--;
    }
  }
  console.log(pairs);
  return "";*/

  let occurrences: Record<string, number> = {};
  for (const k of Object.keys(pairs)) {
    const [l] = k.split("");
    const count = pairs[k];
    add(occurrences, l, count);
  }

  add(occurrences, current[current.length - 1], 1);

  console.log(pairs);
  console.log(occurrences);
  let min = current[0];
  let max = current[0];
  for (const k of Object.keys(occurrences)) {
    if (occurrences[k] < occurrences[min]) {
      min = k;
    }
    if (occurrences[k] > occurrences[max]) {
      max = k;
    }
  }

  const diff = occurrences[max] - occurrences[min];
  return diff.toString();
};
