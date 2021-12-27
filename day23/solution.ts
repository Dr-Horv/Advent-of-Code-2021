import { maxBy, range } from "lodash";
import PriorityQueue from "ts-priority-queue/src/PriorityQueue";

const toKey = (x: number, y: number): string => `${x},${y}`;
let HEIGHT = 3;
const WIDTH = 11;
interface Space {
  x: number;
  y: number;
  key: string;
  isOutsideRoom: boolean;
}

type CavernMap = Record<string, Space>;

/*
#############
#...........#
###B#A#A#D###
  #B#C#D#C#
  #########
 */

/*
#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########
 */

const printMap = (state: State) => {
  let str = "";
  for (let y = -1; y <= HEIGHT; y++) {
    for (let x = -1; x <= WIDTH; x++) {
      const k = toKey(x, y);
      const c = state.map[k];
      const occupied = state.occupied[k];
      if (c) {
        if (occupied) {
          str += occupied;
        } else {
          str += ".";
        }
      } else {
        str += "#";
      }
    }
    str += "\n";
  }
  console.log(str);
};

interface State {
  key: string;
  map: CavernMap;
  occupied: Occupied;
  cost: number;
  step: number;
  totalCost: number;
}

type Move = { m: string; d: number };

const canGoIntoRoom = (o: string, nc: Space, s: State) => {
  if (nc.x === 2 && o !== "A") {
    return false;
  }
  if (nc.x === 4 && o !== "B") {
    return false;
  }
  if (nc.x === 6 && o !== "C") {
    return false;
  }
  if (nc.x === 8 && o !== "D") {
    return false;
  }

  const oneDown = toKey(nc.x, nc.y + 1);
  const oneDownO = s.occupied[oneDown];
  if (oneDownO) {
    return false;
  }
  const twoDown = toKey(nc.x, nc.y + 2);
  const twoDownO = s.occupied[twoDown];
  if (twoDownO) {
    return twoDownO === o;
  } else {
    return true;
  }
};

const horizontalMoveValid = (
  o: string,
  dx: number,
  c: Space,
  s: State
): Move | undefined => {
  const k = toKey(c.x + dx, c.y);
  const nc = s.map[k];
  if (!nc || s.occupied[k]) {
    return;
  }

  if (!nc.isOutsideRoom) {
    return { m: k, d: 1 };
  }

  if (canGoIntoRoom(o, nc, s)) {
    return { m: toKey(c.x + dx, c.y + 1), d: 2 };
  } else {
    const nk = toKey(c.x + 2 * dx, c.y);
    if (!s.occupied[nk]) {
      return { m: nk, d: 2 };
    }
  }
};

const upMoveValid = (o: string, c: Space, s: State): Move[] => {
  const k = toKey(c.x, c.y - 1);
  const nc = s.map[k];
  if (!nc || s.occupied[k]) {
    return [];
  }

  if (!nc.isOutsideRoom) {
    return [{ m: k, d: 1 }];
  }

  const valid: Move[] = [];
  const lk = toKey(c.x - 1, c.y - 1);
  if (!s.occupied[lk]) {
    valid.push({ m: lk, d: 2 });
  }

  const rk = toKey(c.x + 1, c.y - 1);
  if (!s.occupied[rk]) {
    valid.push({ m: rk, d: 2 });
  }
  return valid;
};

const downMoveValid = (o: string, c: Space, s: State): Move | undefined => {
  const k = toKey(c.x, c.y + 1);
  const nc = s.map[k];
  if (!nc || s.occupied[k]) {
    return;
  }

  return { m: k, d: 1 };
};

const columnLookup: Record<string, number> = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const costLookup: Record<string, number> = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

enum HallwayState {
  FROZEN,
  MOVE,
  NOT_IN_HALLWAY,
}

const frozenInHallway = (o: string, c: Space, s: State): HallwayState => {
  // Is in hallway
  if (c.y === 0) {
    const goalX = columnLookup[o];
    if (!canGoIntoRoom(o, s.map[toKey(goalX, 0)], s)) {
      return HallwayState.FROZEN;
    }
    for (const tx of range(c.x, goalX)) {
      if (tx === c.x) {
        continue;
      }
      if (s.occupied[toKey(tx, 0)]) {
        return HallwayState.FROZEN;
      }
    }

    return HallwayState.MOVE;
  } else {
    return HallwayState.NOT_IN_HALLWAY;
  }
};

function canMoveIntoHallway(k: string, o: string, c: Space, s: State): boolean {
  const ys = range(c.y - 1, 0);
  for (const y of ys) {
    if (s.occupied[toKey(c.x, y)]) {
      return false;
    }
  }
  return true;
}

function validHallwayLocations(k: string, o: string, c: Space, s: State) {
  const leftMoves = [];
  for (const x of range(c.x, -1)) {
    const m = toKey(x, 0);
    if (!s.occupied[m]) {
      if (!s.map[m].isOutsideRoom) {
        leftMoves.push({ m, d: Math.abs(c.x - x) + c.y });
      }
    } else {
      break;
    }
  }

  const rightMoves = [];
  for (const x of range(c.x, WIDTH)) {
    const m = toKey(x, 0);
    if (!s.occupied[m]) {
      if (!s.map[m].isOutsideRoom) {
        rightMoves.push({ m, d: Math.abs(c.x - x) + c.y });
      }
    } else {
      break;
    }
  }
  return [...rightMoves, ...leftMoves];
}

function validRoomMoves(k: string, o: string, c: Space, s: State): Move[] {
  const goalX = columnLookup[o];
  // Already inside right room
  if (goalX === c.x) {
    const ys = range(c.y, HEIGHT);
    const someoneLockedIn = ys.some((y) => {
      const o1 = s.occupied[toKey(c.x, y)];
      return o1 !== undefined && o1 !== o;
    });
    if (someoneLockedIn && canMoveIntoHallway(k, o, c, s)) {
      return validHallwayLocations(k, o, c, s);
    } else {
      return [];
    }
  } else if (canMoveIntoHallway(k, o, c, s)) {
    return validHallwayLocations(k, o, c, s);
  }
  return [];
}

const validHallwayMoves = (
  k: string,
  o: string,
  c: Space,
  s: State
): Move[] => {
  const goalX = columnLookup[o];
  const xs = range(c.x, goalX);
  for (const x of xs.slice(1)) {
    const occupied = s.occupied[toKey(x, 0)];
    if (occupied) {
      return [];
    }
  }
  const ys = range(c.y + 1, HEIGHT);
  const someoneLockedIn = ys.some((y) => {
    const o1 = s.occupied[toKey(goalX, y)];
    return o1 !== undefined && o1 !== o;
  });
  if (someoneLockedIn) {
    return [];
  }

  const maxY = ys
    .reverse()
    .find((y) => s.occupied[toKey(goalX, y)] === undefined)!;
  return [{ m: toKey(goalX, maxY), d: Math.abs(goalX - c.x) + maxY }];
};

const getValidMoves = (k: string, s: State): Move[] => {
  const c = s.map[k];
  const o = s.occupied[k]!;
  const valid: { m: string; d: number }[] = [];
  if (c.y > 0) {
    valid.push(...validRoomMoves(k, o, c, s));
  } else {
    valid.push(...validHallwayMoves(k, o, c, s));
  }
  return valid;
};

const getValidMoves2 = (k: string, s: State): Move[] => {
  const c = s.map[k];
  const o = s.occupied[k]!;
  const valid: { m: string; d: number }[] = [];
  const hallway = frozenInHallway(o, c, s);
  if (hallway === HallwayState.FROZEN) {
    return [];
  }

  const leftMove = horizontalMoveValid(o, -1, c, s);
  if (leftMove) {
    valid.push(leftMove);
  }

  const rightMove = horizontalMoveValid(o, +1, c, s);
  if (rightMove) {
    valid.push(rightMove);
  }

  const downMove = downMoveValid(o, c, s);
  if (downMove) {
    valid.push(downMove);
  }

  for (const v of upMoveValid(o, c, s)) {
    valid.push(v);
  }

  return valid;
};

const getValidMoves1 = (o: string, s: State): { m: string; d: number }[] => {
  const c = s.map[o];
  const leftKey = toKey(c.x - 1, c.y);
  const rightKey = toKey(c.x + 1, c.y);
  const downKey = toKey(c.x, c.y + 1);
  const upKey = toKey(c.x, c.y - 1);

  // TODO Rewrite this function, consider if going inside and out of room
  // or in corridor and down or left/right
  // Also check corridor rule in description
  const keysToConsider = [upKey, leftKey, rightKey];

  return keysToConsider.flatMap((k) => {
    const nc = s.map[k];
    if (!nc) {
      return [];
    }
    if (s.occupied[k] === undefined) {
      if (nc.isOutsideRoom) {
        const leftRoomKey = toKey(nc.x - 1, nc.y);
        const rightRoomKey = toKey(nc.x + 1, nc.y);
        const downRoomKey = toKey(nc.x, nc.y + 1);
        const downDownRoomKey = toKey(nc.x, nc.y + 2);
        const keysToConsider = [leftRoomKey, rightRoomKey];
        const curr = s.occupied[k]!;
        const oneBelow = s.occupied[downRoomKey];
        const twoBelow = s.occupied[downDownRoomKey];
        if (
          oneBelow === undefined &&
          (twoBelow === curr || twoBelow === undefined)
        ) {
          if (curr === "A" && nc.x === 2) {
            keysToConsider.push(downRoomKey);
          } else if (curr === "B" && nc.x === 4) {
            keysToConsider.push(downRoomKey);
          } else if (curr === "C" && nc.x === 6) {
            keysToConsider.push(downRoomKey);
          } else if (curr === "D" && nc.x === 8) {
            keysToConsider.push(downRoomKey);
          }
        }
        return keysToConsider
          .filter((rk) => s.occupied[rk] === undefined)
          .map((k) => ({ m: k, d: 2 }));
      } else {
        return [{ m: nc.key, d: 1 }];
      }
    }
    return [];
  });
};

function manhattan(m: string, o: string) {}

type Occupied = Record<string, string | undefined>;

function calculateCost(o: string, d: number) {
  switch (o) {
    case "A":
      return d;
    case "B":
      return d * 10;
    case "C":
      return d * 100;
    case "D":
      return d * 1000;
    default:
      throw new Error("Invalid thing to calculate cost: " + o);
  }
}

const reconstructPath = (
  node: State,
  cameFrom: Map<string, State>
): State[] => {
  let current = node;
  const path = [current];
  while (cameFrom.has(current.key)) {
    current = cameFrom.get(current.key)!;
    path.push(current);
  }
  return path.reverse();
};

const h2 = (s: State): number => {
  return (
    8 -
    ((s.occupied["2,1"] === "A" ? 1 : 0) +
      (s.occupied["2,2"] === "A" ? 1 : 0) +
      (s.occupied["4,1"] === "B" ? 1 : 0) +
      (s.occupied["4,2"] === "B" ? 1 : 0) +
      (s.occupied["6,1"] === "C" ? 1 : 0) +
      (s.occupied["6,2"] === "C" ? 1 : 0) +
      (s.occupied["8,1"] === "D" ? 1 : 0) +
      (s.occupied["8,2"] === "D" ? 1 : 0))
  );
};

const heuristic = (s: State): number => {
  let cost = 0;
  for (const ok of Object.keys(s.occupied)) {
    const o = s.occupied[ok]!;
    const goalX = columnLookup[o];
    const [x, y] = ok.split(",").map((s) => parseInt(s, 10));
    const xDiff = Math.abs(x - goalX);
    cost += (xDiff > 0 ? xDiff + 1 : 0) * costLookup[o];
  }
  return cost;
};

const aStar = (
  start: State,
  goal: (node: State) => boolean,
  h: (node: State) => number,
  getNeighbours: (node: State) => State[]
): State[][] => {
  const validPaths: State[][] = [];
  const cameFrom = new Map<string, State>();
  const gScoreMap = new Map<string, number>();
  const considered = new Map<string, boolean>();

  const gScore = (s: string): number =>
    gScoreMap.has(s) ? gScoreMap.get(s)! : 99999999;
  gScoreMap.set(start.key, 0);

  const fScoreMap = new Map<string, number>();
  const fScore = (s: string): number =>
    fScoreMap.has(s) ? fScoreMap.get(s)! : 99999999;
  fScoreMap.set(start.key, h(start));

  const comparator = (n1: State, n2: State) => {
    const f1 = n1.totalCost; //fScore(n1.key);
    const f2 = n2.totalCost; //fScore(n2.key);
    return f2 - f1;
  };

  let os = new PriorityQueue({
    comparator: comparator,
    initialValues: [start],
  });
  considered.set(start.key, true);

  const cost = (neighbour: State): number => {
    return neighbour.cost;
  };

  let i = 0;

  while (os.length > 0) {
    const current = os.dequeue();
    if (i % 10_000 === 0) {
      console.log("openSet", os.length);
      //printMap(current);
    }
    if (goal(current)) {
      validPaths.push(reconstructPath(current, cameFrom));
      continue;
    }

    const neighbours = getNeighbours(current);
    for (const neighbor of neighbours) {
      const tentativeGScore = gScore(current.key) + cost(neighbor);
      if (tentativeGScore < gScore(neighbor.key)) {
        cameFrom.set(neighbor.key, current);
        gScoreMap.set(neighbor.key, tentativeGScore);
        fScoreMap.set(neighbor.key, tentativeGScore + h(neighbor));
        if (!considered.has(neighbor.key)) {
          considered.set(neighbor.key, true);
          os.queue(neighbor);
        }
      }
    }

    i++;
  }

  if (validPaths.length > 0) {
    return validPaths;
  }
  throw new Error("Not found");
};

const goalState = () => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0);
  setSpace(1, 0);
  setSpace(2, 0, ".", true);
  setSpace(2, 1, "A");
  setSpace(2, 2, "A");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "B");
  setSpace(4, 2, "B");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "C");
  setSpace(6, 2, "C");
  setSpace(7, 0);
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "D");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };
  printMap(state);
  return state;
};

const fewStep = () => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0, "A");
  setSpace(1, 0, "B");
  setSpace(2, 0, ".", true);
  setSpace(2, 1, ".");
  setSpace(2, 2, "A");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, ".");
  setSpace(4, 2, "B");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "C");
  setSpace(6, 2, "C");
  setSpace(7, 0, "D");
  setSpace(8, 0, ".", true);
  setSpace(8, 1, ".");
  setSpace(8, 2, "D");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };
  printMap(state);
  return state;
};

const oneStep = () => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0, "A");
  setSpace(1, 0, ".");
  setSpace(2, 0, ".", true);
  setSpace(2, 1, ".");
  setSpace(2, 2, "A");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "B");
  setSpace(4, 2, "B");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "C");
  setSpace(6, 2, "C");
  setSpace(7, 0, ".");
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "D");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };
  printMap(state);
  return state;
};

const exampleState = (): State => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0);
  setSpace(1, 0);
  setSpace(2, 0, ".", true);
  setSpace(2, 1, "B");
  setSpace(2, 2, "A");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "C");
  setSpace(4, 2, "D");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "B");
  setSpace(6, 2, "C");
  setSpace(7, 0);
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "A");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };

  return state;
};

const exampleStatePart2 = (): State => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0);
  setSpace(1, 0);
  setSpace(2, 0, ".", true);
  setSpace(2, 1, "B");
  setSpace(2, 2, "D");
  setSpace(2, 3, "D");
  setSpace(2, 4, "A");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "C");
  setSpace(4, 2, "C");
  setSpace(4, 3, "B");
  setSpace(4, 4, "D");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "B");
  setSpace(6, 2, "B");
  setSpace(6, 3, "A");
  setSpace(6, 4, "C");
  setSpace(7, 0);
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "A");
  setSpace(8, 3, "C");
  setSpace(8, 4, "A");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };

  return state;
};

const myStatePart2 = (): State => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0);
  setSpace(1, 0);
  setSpace(2, 0, ".", true);
  setSpace(2, 1, "B");
  setSpace(2, 2, "D");
  setSpace(2, 3, "D");
  setSpace(2, 4, "B");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "A");
  setSpace(4, 2, "C");
  setSpace(4, 3, "B");
  setSpace(4, 4, "C");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "A");
  setSpace(6, 2, "B");
  setSpace(6, 3, "A");
  setSpace(6, 4, "D");
  setSpace(7, 0);
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "A");
  setSpace(8, 3, "C");
  setSpace(8, 4, "C");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };

  return state;
};

const myState = (): State => {
  const map: CavernMap = {};
  const occupied: Occupied = {};

  const setSpace = (
    x: number,
    y: number,
    thing: string = ".",
    isOutsideRoom: boolean = false
  ) => {
    const key = toKey(x, y);
    if (thing !== ".") {
      occupied[key] = thing;
    }
    map[key] = { key, x, y, isOutsideRoom };
  };
  setSpace(0, 0);
  setSpace(1, 0);
  setSpace(2, 0, ".", true);
  setSpace(2, 1, "B");
  setSpace(2, 2, "B");
  setSpace(3, 0);
  setSpace(4, 0, ".", true);
  setSpace(4, 1, "A");
  setSpace(4, 2, "C");
  setSpace(5, 0);
  setSpace(6, 0, ".", true);
  setSpace(6, 1, "A");
  setSpace(6, 2, "D");
  setSpace(7, 0);
  setSpace(8, 0, ".", true);
  setSpace(8, 1, "D");
  setSpace(8, 2, "C");
  setSpace(9, 0);
  setSpace(10, 0);
  const state: State = {
    map,
    occupied,
    cost: 0,
    totalCost: 0,
    key: JSON.stringify(occupied),
    step: 0,
  };

  return state;
};

const getNextStates = (s: State): State[] => {
  const nss: State[] = [];

  //console.log("---getNextStates---", Object.keys(s.occupied));
  //printMap(s);
  //console.log("---alternatives---");
  for (const k of Object.keys(s.occupied)) {
    const o = s.occupied[k]!;
    const validMoves = getValidMoves(k, s);
    for (const m of validMoves) {
      const nextOccupied = { ...s.occupied };
      delete nextOccupied[k];
      nextOccupied[m.m] = o;
      const step = s.step + 1;
      const key = Object.keys(nextOccupied)
        .sort()
        .map((k) => `[${k}]:${nextOccupied[k]}`)
        .join(",");
      const cost = calculateCost(o, m.d);
      const ns = {
        key,
        step,
        map: s.map,
        occupied: nextOccupied,
        cost,
        totalCost: s.totalCost + cost,
      };
      //printMap(ns);
      nss.push(ns);
    }
  }
  //console.log("------end-------");
  return nss;
};

const goal = (s: State): boolean => {
  return (
    s.occupied["2,1"] === "A" &&
    s.occupied["2,2"] === "A" &&
    s.occupied["4,1"] === "B" &&
    s.occupied["4,2"] === "B" &&
    s.occupied["6,1"] === "C" &&
    s.occupied["6,2"] === "C" &&
    s.occupied["8,1"] === "D" &&
    s.occupied["8,2"] === "D"
  );
};

const goalPartTwo = (s: State): boolean => {
  return (
    s.occupied["2,1"] === "A" &&
    s.occupied["2,2"] === "A" &&
    s.occupied["2,3"] === "A" &&
    s.occupied["2,4"] === "A" &&
    s.occupied["4,1"] === "B" &&
    s.occupied["4,2"] === "B" &&
    s.occupied["4,3"] === "B" &&
    s.occupied["4,4"] === "B" &&
    s.occupied["6,1"] === "C" &&
    s.occupied["6,2"] === "C" &&
    s.occupied["6,3"] === "C" &&
    s.occupied["6,4"] === "C" &&
    s.occupied["8,1"] === "D" &&
    s.occupied["8,2"] === "D" &&
    s.occupied["8,3"] === "D" &&
    s.occupied["8,4"] === "D"
  );
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const state = myStatePart2();
  HEIGHT = maxBy(Object.values(state.map), (s) => s.y)!.y + 1;
  console.log("HEIGHT", HEIGHT);
  printMap(state);

  //return "";
  //return "";
  const start = Date.now();
  console.log(h2(goalState()));
  console.log(h2(state));

  /*
  let index = 0;
  const ns1 = getNextStates(state);
  console.log("1111111");
  printMap(ns1[18]);
  const ns2 = getNextStates(ns1[18]);
  console.log("2222222");
  printMap(ns2[2]);
  const ns3 = getNextStates(ns2[2]);
  console.log("3333333");
  printMap(ns3[5]);
  const ns4 = getNextStates(ns3[5]);
  console.log("4444444");
  printMap(ns4[2]);
  const ns5 = getNextStates(ns4[2]);
  console.log("55555555");
  printMap(ns5[5]);
  const ns6 = getNextStates(ns5[5]);
  console.log("66666666");
  printMap(ns6[0]);
  const ns7 = getNextStates(ns6[0]);
  console.log("77777777");
  printMap(ns7[3]);
  const ns8 = getNextStates(ns7[3]);
  console.log("88888888");
  printMap(ns8[2]);
  const ns9 = getNextStates(ns8[2]);
  console.log("99999999");
  printMap(ns9[0]);
  const ns10 = getNextStates(ns9[0]);
  console.log("10101010");
  printMap(ns10[0]);
  const ns = getNextStates(ns10[0]);

  console.log("----------------PRINT----------");

  for (const n of ns) {
    console.log(index);
    printMap(n);
    index++;
  }
  return "";

  return "";*/
  const ps = aStar(state, goalPartTwo, heuristic, getNextStates);
  console.log("Done", (Date.now() - start) / 1000 / 60);
  console.log("valid paths", ps.length);
  for (const p of ps) {
    for (const s of p) {
      printMap(s);
    }
    const costs = p.map((s) => s.cost);
    console.log(costs);
    console.log(costs.reduce((acc, curr) => acc + curr));
  }

  return "";
};
