import _ from "lodash";

export const solve = (input: string[], isPartTwo: boolean): string => {
  const rules: Record<string, string | undefined> = {};
  let current = input.shift()!;
  for (const r of input) {
    const [lhs, rhs] = r.split("->").map((s) => s.trim());
    rules[lhs] = rhs;
  }

  for (let i = 0; i < 10; i++) {
    console.log("starting " + i);
    let next = "";
    for (let l = 0; l <= current.length - 1; l++) {
      const lc = current[l];
      const rc = current[l + 1];
      const insertion = rules[lc + rc];
      next += lc + (insertion ? insertion : "");
    }

    current = next;
  }

  const chars = current.split("");
  const occurrences = _.countBy(chars);
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
