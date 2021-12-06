export const solve = (input: string[], isPartTwo: boolean): string => {
  let fishes = input[0].split(",").map((s) => parseInt(s, 10));
  const emptyCount: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  };

  const days = !isPartTwo ? 80 : 256;
  let counts: Record<number, number> = { ...emptyCount };
  for (const f of fishes) {
    counts[f] = counts[f] + 1;
  }
  for (let i = 0; i < days; i++) {
    let newCounts: Record<number, number> = { ...emptyCount };
    for (let c = 0; c <= 8; c++) {
      const count = counts[c];
      if (c === 0) {
        newCounts[6] = newCounts[6] + count;
        newCounts[8] = count;
      } else {
        newCounts[c - 1] += count;
      }
    }
    counts = newCounts;
  }

  let sum = Object.values(counts).reduce((acc, curr) => acc + curr);
  return sum.toString();
};
