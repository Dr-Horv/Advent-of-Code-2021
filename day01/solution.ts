const isPrime = (n: number) => {
  if (n === 0) {
    return false;
  } else if (n === 1) {
    return true;
  }
  for (let i = 2; i < n; i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  if (!isPartTwo) {
    return input
      .map((n) => parseInt(n, 10))
      .map((n, index) => (isPrime(n) ? n * index : 0))
      .reduce((acc, curr) => acc + curr)
      .toString();
  } else {
    return input
      .map((n) => parseInt(n, 10))
      .map((n, index) => {
        if (!isPrime(n)) {
          return index % 2 === 0 ? n : -n;
        } else {
          return 0;
        }
      })
      .reduce((acc, curr) => acc + curr)
      .toString();
  }
};
