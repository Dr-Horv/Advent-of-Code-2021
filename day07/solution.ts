const fuelCostPart2 = (n: number, target: number) => {
  const diff = Math.abs(n - target);
  let cost = 0;
  for (let i = 1; i <= diff; i++) {
    cost += i;
  }
  return cost;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const nbrs = input[0]
    .split(",")
    .map((s) => parseInt(s, 10))
    .sort((a, b) => a - b);
  let cheapest = 9999999999;

  const fuelCostCalculation = !isPartTwo
    ? (n: number, target: number) => Math.abs(n - target)
    : fuelCostPart2;

  for (let i = nbrs[0]; i < nbrs[nbrs.length - 1]; i++) {
    const target = i;
    let cost = 0;

    for (const n of nbrs) {
      cost += fuelCostCalculation(n, target);
    }
    if (cost < cheapest) {
      cheapest = cost;
    }
  }

  return cheapest.toString();
};
