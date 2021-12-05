interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const parseLine = (s: string): Line => {
  const [lhs, rhs] = s.split("->").map((s) => s.trim());
  const [x1, y1] = lhs.split(",").map((s) => parseInt(s, 10));
  const [x2, y2] = rhs.split(",").map((s) => parseInt(s, 10));
  return { x1, y1, x2, y2 };
};

const incCoordinateValue = (
  x: number,
  y: number,
  map: Record<string, number | undefined>
) => {
  const key = `${x},${y}`;
  const entry = map[key];
  let nbr = entry !== undefined ? entry : 0;
  nbr++;
  map[key] = nbr;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const lines = input.map(parseLine);
  const map: Record<string, number | undefined> = {};
  const filter = !isPartTwo
    ? (l: Line) => l.x1 === l.x2 || l.y1 === l.y2
    : (l: Line) => l;

  for (const l of lines.filter(filter)) {
    if (l.x1 === l.x2) {
      const minY = Math.min(l.y1, l.y2);
      const maxY = Math.max(l.y1, l.y2);
      const x = l.x1;
      for (let y = minY; y <= maxY; y++) {
        incCoordinateValue(x, y, map);
      }
    } else if (l.y1 === l.y2) {
      const minX = Math.min(l.x1, l.x2);
      const maxX = Math.max(l.x1, l.x2);
      const y = l.y1;
      for (let x = minX; x <= maxX; x++) {
        incCoordinateValue(x, y, map);
      }
    } else {
      const minX = Math.min(l.x1, l.x2);
      const maxX = Math.max(l.x1, l.x2);
      const startY = l.x1 === minX ? l.y1 : l.y2;
      const stopY = l.x1 === minX ? l.y2 : l.y1;
      const diff = stopY - startY < 0 ? -1 : 1;
      let y = startY;
      for (let x = minX; x <= maxX; x++) {
        incCoordinateValue(x, y, map);
        y += diff;
      }
    }
  }

  const count = Object.values(map).filter(
    (v) => v !== undefined && v >= 2
  ).length;

  return count.toString();
};
