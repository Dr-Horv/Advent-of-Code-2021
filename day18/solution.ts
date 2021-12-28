import { cloneDeep, parseInt } from "lodash";

type SnailfishNumber =
  | {
      left: SnailfishNumber;
      right: SnailfishNumber;
    }
  | number;

export const parseSnailfishNumber = (s: string[]): SnailfishNumber => {
  if (s.length === 0) {
    throw new Error("empty");
  }
  if (s.length === 1) {
    return parseInt(s[0], 10);
  }
  let commaIndex = -1;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "[") {
      depth++;
    } else if (c === "]") {
      depth--;
    } else if (c === "," && depth === 1) {
      commaIndex = i;
    }
  }
  return {
    left: parseSnailfishNumber(s.slice(1, commaIndex)),
    right: parseSnailfishNumber(s.slice(commaIndex + 1, s.length - 1)),
  };
};

export const add = (
  s1: SnailfishNumber,
  s2: SnailfishNumber
): SnailfishNumber => ({
  left: s1,
  right: s2,
});

export const stringifySnailfishNumber = (sn: SnailfishNumber): string => {
  if (typeof sn === "number") {
    return sn.toString();
  } else {
    return `[${stringifySnailfishNumber(sn.left)},${stringifySnailfishNumber(
      sn.right
    )}]`;
  }
};

const addToRegularL = (
  sn: SnailfishNumber,
  number: number
): SnailfishNumber => {
  if (typeof sn === "number") {
    return sn + number;
  } else {
    return {
      left: addToRegularL(sn.left, number),
      right: sn.right,
    };
  }
};

const addToRegularR = (
  sn: SnailfishNumber,
  number: number
): SnailfishNumber => {
  if (typeof sn === "number") {
    return sn + number;
  } else {
    return {
      left: sn.left,
      right: addToRegularR(sn.right, number),
    };
  }
};

export const explodeRule = (
  sn: SnailfishNumber,
  depth: number
): { addToLeft: number; addToRight: number } | null => {
  if (typeof sn === "number") {
    return null;
  }
  //console.log(depth, stringifySnailfishNumber(sn));

  if (depth === 3) {
    if (typeof sn.left !== "number") {
      sn.right = addToRegularL(sn.right, sn.left.right as number);
      const numberToAdd = sn.left.left as number;
      sn.left = 0;
      return { addToLeft: numberToAdd, addToRight: 0 };
    }

    if (typeof sn.right !== "number") {
      sn.left = addToRegularR(sn.left, sn.right.left as number);
      const numberToAdd = sn.right.right as number;
      sn.right = 0;
      //console.log({ addToLeft: 0, addToRight: numberToAdd });
      return { addToLeft: 0, addToRight: numberToAdd };
    }
  }

  const resL = explodeRule(sn.left, depth + 1);
  if (resL !== null) {
    //console.log("left leg exploded");
    if (resL.addToLeft > 0) {
      return resL;
    } else if (resL.addToRight > 0) {
      /*console.log(
        "addToRight",
        resL.addToRight,
        stringifySnailfishNumber(sn.right)
      );*/
      sn.right = addToRegularL(sn.right, resL.addToRight);
      return { addToLeft: 0, addToRight: 0 };
    } else {
      return resL;
    }
  }

  const resR = explodeRule(sn.right, depth + 1);
  if (resR !== null) {
    //console.log("right leg exploded");
    if (resR.addToRight > 0) {
      //console.log("right leg exploding sending upwards", resR);
      return resR;
    } else if (resR.addToLeft > 0) {
      sn.left = addToRegularR(sn.left, resR.addToLeft);
      return { addToLeft: 0, addToRight: 0 };
    } else {
      return resR;
    }
  }

  return null;
};

export const splitRule = (sn: SnailfishNumber): boolean => {
  //console.log("split", stringifySnailfishNumber(sn));
  if (typeof sn === "number") {
    return false;
  }

  if (typeof sn.left === "number" && sn.left >= 10) {
    //console.log("split l", sn.left);
    sn.left = { left: Math.floor(sn.left / 2), right: Math.round(sn.left / 2) };
    return true;
  }

  if (splitRule(sn.left)) {
    return true;
  }

  if (typeof sn.right === "number" && sn.right >= 10) {
    //console.log("split r", sn.right);
    sn.right = {
      left: Math.floor(sn.right / 2),
      right: Math.round(sn.right / 2),
    };
    return true;
  }

  return splitRule(sn.right);
};

export const reduceSnailfishNumber = (snailfishNumber: SnailfishNumber) => {
  //console.log("reduce:  \t" + stringifySnailfishNumber(sn));
  const sn = cloneDeep(snailfishNumber);
  let i = 0;
  while (true) {
    const explode = explodeRule(sn, 0);
    if (explode !== null) {
      //console.log("exploded:" + stringifySnailfishNumber(sn));
      i++;
      continue;
    } else {
      i = 0;
    }
    const splitResult = splitRule(sn);
    if (splitResult) {
      //console.log("splitted:" + stringifySnailfishNumber(sn));
      continue;
    }
    break;
  }
  return sn;
};

export const parseAndAdd = (input: string[]): SnailfishNumber => {
  const snn = input.map((line) => parseSnailfishNumber(line.split("")));
  return snn.reduce((acc, curr) => reduceSnailfishNumber(add(acc, curr)));
};

export const calculateMagnitude = (sn: SnailfishNumber): number => {
  if (typeof sn === "number") {
    return sn;
  }
  return 3 * calculateMagnitude(sn.left) + 2 * calculateMagnitude(sn.right);
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const snn = input.map((line) => parseSnailfishNumber(line.split("")));
  if (!isPartTwo) {
    const sn = snn.reduce((acc, curr) => reduceSnailfishNumber(add(acc, curr)));
    console.log(stringifySnailfishNumber(sn));
    return calculateMagnitude(sn).toString();
  }

  let max = -1;
  for (const sn1 of snn) {
    for (const sn2 of snn) {
      if (sn1 === sn2) {
        continue;
      }
      max = Math.max(
        max,
        calculateMagnitude(reduceSnailfishNumber(add(sn1, sn2))),
        calculateMagnitude(reduceSnailfishNumber(add(sn2, sn1)))
      );
    }
  }

  return max.toString();
};
