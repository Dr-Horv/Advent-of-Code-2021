interface SubmarinePosition {
  horizontalPos: number;
  depth: number;
  aim: number;
}

export const solve = (input: string[], isPartTwo: boolean): string => {
  const submarine: SubmarinePosition = { horizontalPos: 0, depth: 0, aim: 0 };

  if (!isPartTwo) {
    for (const command of input) {
      const [action, amountStr] = command.split(" ");
      const amount = parseInt(amountStr, 10);
      switch (action) {
        case "forward":
          submarine.horizontalPos += amount;
          break;
        case "down":
          submarine.depth += amount;
          break;
        case "up":
          submarine.depth -= amount;
          break;
      }
    }
    return (submarine.horizontalPos * submarine.depth).toString();
  } else {
    for (const command of input) {
      const [action, amountStr] = command.split(" ");
      const amount = parseInt(amountStr, 10);
      switch (action) {
        case "forward":
          submarine.horizontalPos += amount;
          submarine.depth += submarine.aim * amount;
          break;
        case "down":
          submarine.aim += amount;
          break;
        case "up":
          submarine.aim -= amount;
          break;
      }
    }
    return (submarine.horizontalPos * submarine.depth).toString();
  }
};
