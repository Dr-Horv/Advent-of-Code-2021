import _ from "lodash";

const reconstructPath = (
  node: CavernNode,
  cameFrom: Map<string, CavernNode>
): CavernNode[] => {
  let current = node;
  const path = [current];
  while (cameFrom.has(current.key)) {
    current = cameFrom.get(current.key)!;
    path.push(current);
  }
  return path.reverse();
};

const aStar = (
  start: CavernNode,
  goal: (node: CavernNode) => boolean,
  h: (node: CavernNode) => number,
  getNeighbours: (node: CavernNode) => CavernNode[]
): CavernNode[] => {
  let openSet = [start];
  const cameFrom = new Map<string, CavernNode>();
  const gScoreMap = new Map<string, number>();

  const gScore = (s: string): number =>
    gScoreMap.has(s) ? gScoreMap.get(s)! : 99999;
  gScoreMap.set(start.key, 0);

  const fScoreMap = new Map<string, number>();
  const fScore = (s: string): number =>
    fScoreMap.has(s) ? fScoreMap.get(s)! : 99999;
  fScoreMap.set(start.key, h(start));

  const cost = (curr: CavernNode, neighbour: CavernNode): number => {
    return neighbour.risk;
  };

  while (openSet.length > 0) {
    const current = _.minBy(openSet, (n) => fScore(n.key))!;
    if (goal(current)) {
      return reconstructPath(current, cameFrom);
    }
    openSet = openSet.filter((n) => current.key !== n.key);

    const neighbours = getNeighbours(current);
    for (const neighbor of neighbours) {
      const tentativeGScore = gScore(current.key) + cost(current, neighbor);
      if (tentativeGScore < gScore(neighbor.key)) {
        cameFrom.set(neighbor.key, current);
        gScoreMap.set(neighbor.key, tentativeGScore);
        fScoreMap.set(neighbor.key, tentativeGScore + h(neighbor));
        if (!openSet.some((n) => n.key === neighbor.key)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  throw new Error("Not found");
};

interface CavernNode {
  key: string;
  x: number;
  y: number;
  risk: number;
}

const toKey = (x: number, y: number) => `${x},${y}`;

export const solve = (input: string[], isPartTwo: boolean): string => {
  const WIDTH = input[0].length;
  const HEIGHT = input.length;
  const MAX_WIDTH = !isPartTwo ? WIDTH : WIDTH * 5;
  const MAX_HEIGHT = !isPartTwo ? HEIGHT : HEIGHT * 5;

  const cavernMap: Record<string, CavernNode | undefined> = {};

  for (let row = 0; row < input.length; row++) {
    const parts = input[row].split("").map((p) => parseInt(p, 10));
    for (let column = 0; column < parts.length; column++) {
      const key = toKey(column, row);
      cavernMap[key] = { key, x: column, y: row, risk: parts[column] };
    }
  }

  const GOAL_X = MAX_WIDTH - 1;
  const GOAL_Y = MAX_HEIGHT - 1;
  const goalFn = (n: CavernNode) => n.x === GOAL_X && n.y === GOAL_Y;
  const start = cavernMap[toKey(0, 0)]!;
  const heuristic = (n: CavernNode) =>
    Math.abs(n.x - GOAL_X) + Math.abs(n.y - GOAL_Y);

  const getShiftedNode = (p: { x: number; y: number }) => {
    const horizontalTile = Math.floor(p.x / WIDTH);
    const verticalTile = Math.floor(p.y / HEIGHT);
    const x = p.x % WIDTH;
    const y = p.y % HEIGHT;
    const v = cavernMap[toKey(x, y)]!;

    const potRisk = v.risk + horizontalTile + verticalTile;
    const risk = potRisk > 9 ? (potRisk % 10) + 1 : potRisk;
    const c: CavernNode = {
      key: toKey(p.x, p.y),
      x: p.x,
      y: p.y,
      risk,
    };
    return c;
  };

  const getNeighbours = (n: CavernNode): CavernNode[] => {
    return [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
    ]
      .map(({ dx, dy }) => ({
        x: n.x + dx,
        y: n.y + dy,
      }))
      .map((p) => {
        if (!isPartTwo) {
          return cavernMap[toKey(p.x, p.y)];
        }
        if (p.x < 0 || p.x > MAX_WIDTH - 1 || p.y < 0 || p.y > MAX_HEIGHT - 1) {
          return undefined;
        }
        return getShiftedNode(p);
      })
      .filter((n) => n !== undefined) as CavernNode[];
  };

  const path = aStar(start, goalFn, heuristic, getNeighbours);

  return _.sumBy(path.slice(1), (n) => n.risk).toString();
};
