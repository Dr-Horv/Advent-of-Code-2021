import _ from "lodash";

interface Basin {
  key: string;
  lowPoint: Point;
  points: Set<Point>;
  size: number;
}

interface Point {
  key: string;
  x: number;
  y: number;
  height: number;
}

const toKey = (x: number, y: number) => `${x},${y}`;

function expandBasin(
  start: Point,
  heightMap: Record<string, Point | undefined>
): Basin {
  if (start.height === 9) {
    return {
      key: toKey(start.x, start.y),
      lowPoint: start,
      points: new Set<Point>(),
      size: 0,
    };
  }

  const basin = new Set([start]);
  const candidates = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
  ]
    .map(({ dx, dy }) => ({
      x: start.x + dx,
      y: start.y + dy,
    }))
    .map((p) => heightMap[toKey(p.x, p.y)])
    .filter((p) => p && p.height < 9 && p.height > start.height) as Point[];

  for (const c of candidates) {
    basin.add(c);
    const candidateBasin = expandBasin(c, heightMap);
    candidateBasin.points.forEach((c) => basin.add(c));
  }

  return {
    key: toKey(start.x, start.y),
    lowPoint: start,
    points: basin,
    size: basin.size,
  };
}

export const solve = (input: string[], isPartTwo: boolean): string => {
  const WIDTH = input[0].length;
  const HEIGHT = input.length;

  const heightMap: Record<string, Point | undefined> = {};

  for (let row = 0; row < input.length; row++) {
    const parts = input[row].split("").map((p) => parseInt(p, 10));
    for (let column = 0; column < parts.length; column++) {
      const key = toKey(column, row);
      heightMap[key] = { key, x: column, y: row, height: parts[column] };
    }
  }

  const lowPoints: Point[] = [];

  for (let row = 0; row < HEIGHT; row++) {
    for (let column = 0; column < WIDTH; column++) {
      const candidate = heightMap[toKey(column, row)]!;
      const neighbours = [
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
      ]
        .map(({ dx, dy }) => ({
          x: candidate.x + dx,
          y: candidate.y + dy,
        }))
        .map((p) => heightMap[toKey(p.x, p.y)])
        .filter((p) => p !== undefined);

      const levelOrBelow = neighbours.filter(
        (n) => n!.height <= candidate.height
      );

      if (levelOrBelow.length === 0) {
        lowPoints.push(candidate);
      }
    }
  }

  if (!isPartTwo) {
    return lowPoints
      .map((p) => p.height + 1)
      .reduce((acc, curr) => acc + curr)
      .toString();
  }

  const basins = lowPoints.map((p) => expandBasin(p, heightMap));
  const sorted = _.sortBy(basins, (b) => b.size).reverse();
  return _.take(sorted, 3)
    .reduce((acc, curr) => acc * curr.size, 1)
    .toString();
};
