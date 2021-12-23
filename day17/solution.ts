const toKey = (x: number, y: number) => `${x},${y}`;

const simulateShot = (
  startX: number,
  startY: number,
  targetArea: Set<string>,
  missed: (x: number, y: number) => boolean
): boolean => {
  let x = 0;
  let y = 0;
  let xVelocity = startX;
  let yVelocity = startY;
  while (!missed(x, y)) {
    x += xVelocity;
    y += yVelocity;
    if (targetArea.has(toKey(x, y))) {
      return true;
    }
    if (xVelocity > 0) {
      xVelocity--;
    } else if (xVelocity < 0) {
      xVelocity--;
    }
    yVelocity--;
  }
  return false;
};

const maxValueFromVelocity = (velocity: number): number => {
  let sum = 0;
  for (let v = velocity; v > 0; v--) {
    sum += v;
  }
  return sum;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const regex = /target area: x=(-*\d+)..(-*\d+), y=(-*\d+)..(-*\d+)/gm;

  const match = regex.exec(input[0])!;
  const x1 = parseInt(match[1], 10);
  const x2 = parseInt(match[2], 10);
  const y1 = parseInt(match[3], 10);
  const y2 = parseInt(match[4], 10);
  const targetArea: Set<string> = new Set<string>();
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      targetArea.add(toKey(x, y));
    }
  }
  const missed = (x: number, y: number) => x > maxX || y < minY;

  let valueSearchedFor = !isPartTwo ? -9999999 : 0;
  for (let x = 0; x <= maxX; x++) {
    const currMaxX = maxValueFromVelocity(x);
    if (currMaxX < minX) {
      continue;
    }
    for (let y = minY; y < 10_000; y++) {
      const currMaxY = maxValueFromVelocity(y);
      if (!isPartTwo) {
        if (currMaxY > valueSearchedFor) {
          if (simulateShot(x, y, targetArea, missed)) {
            valueSearchedFor = currMaxY;
          }
        }
      } else {
        if (simulateShot(x, y, targetArea, missed)) {
          valueSearchedFor++;
        }
      }
    }
  }

  return valueSearchedFor.toString();
};
