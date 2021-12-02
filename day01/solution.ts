export const solve = (input: string[], isPartTwo: boolean): string => {
  const numbers = input.map((s) => parseInt(s, 10));
  let increases = 0;
  if (!isPartTwo) {
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] > numbers[i - 1]) {
        increases++;
      }
    }
    return increases.toString();
  } else {
    let sum = numbers[0] + numbers[1] + numbers[2];
    for (let i = 3; i < numbers.length; i++) {
      const newSum = numbers[i] + numbers[i - 1] + numbers[i - 2];
      if (newSum > sum) {
        increases++;
      }
      sum = newSum;
    }
    return increases.toString();
  }
};
