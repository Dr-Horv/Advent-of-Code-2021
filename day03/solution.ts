const partOne = (input: string[]): string => {
  const counts = Array.from({ length: input[0].length }).map(() => 0);
  for (const line of input) {
    const bits = line.split("");
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        counts[i] += 1;
      }
    }
  }

  const result = [];
  for (const count of counts) {
    if (count > input.length / 2) {
      result.push(1);
    } else {
      result.push(0);
    }
  }

  const gammaRateStr = result.join("");
  const gammaRate = parseInt(gammaRateStr, 2);
  const epsilonRate = gammaRate ^ parseInt("1".repeat(gammaRateStr.length), 2);

  return (gammaRate * epsilonRate).toString();
};

const mostCommonBitInPosition = (input: string[], index: number): string => {
  let ones = 0;
  for (const line of input) {
    if (line[index] === "1") {
      ones++;
    }
  }
  if (ones >= input.length / 2) {
    return "1";
  } else {
    return "0";
  }
};

const partTwo = (input: string[]) => {
  let oxygenCandidates = [...input];
  let CO2ScrubberCandidates = [...input];
  const bitLength = input[0].length;
  for (let i = 0; i < bitLength; i++) {
    const mostCommonBitOxygen = mostCommonBitInPosition(oxygenCandidates, i);
    oxygenCandidates = oxygenCandidates.filter(
      (c) => c[i] === mostCommonBitOxygen
    );
    if (oxygenCandidates.length === 1) {
      break;
    }
  }

  for (let i = 0; i < bitLength; i++) {
    const mostCommonBitCO2Scrubber = mostCommonBitInPosition(
      CO2ScrubberCandidates,
      i
    );
    const leastCommonBit = mostCommonBitCO2Scrubber === "1" ? "0" : "1";
    CO2ScrubberCandidates = CO2ScrubberCandidates.filter(
      (c) => c[i] === leastCommonBit
    );
    if (CO2ScrubberCandidates.length === 1) {
      break;
    }
  }

  return (
    parseInt(oxygenCandidates[0], 2) * parseInt(CO2ScrubberCandidates[0], 2)
  ).toString();
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  if (!isPartTwo) {
    return partOne(input);
  } else {
    return partTwo(input);
  }
};
