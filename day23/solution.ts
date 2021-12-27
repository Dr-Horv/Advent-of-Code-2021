import { cloneDeep, every, range, some } from "lodash";
import PriorityQueue from "ts-priority-queue/src/PriorityQueue";

const printMap = (state: State) => {
  let str = `#############
#${state.hallway.join("")}#
###${state.rooms.map((r) => r[0]).join("#")}###
  #${state.rooms.map((r) => r[1]).join("#")}#`;

  if (state.rooms[0].length > 2) {
    str += `\n  #${state.rooms.map((r) => r[2]).join("#")}#
  #${state.rooms.map((r) => r[3]).join("#")}#`;
  }

  str += "\n  #########\n";

  console.log(str);
};

const parseState = (input: string[]): State => {
  const hallway: Occupancy[] = input[1]
    .split("")
    .filter((c) => isAmphipod(c) || c === ".")
    .map((c) => c as Occupancy);
  const roomSize = input.length - 3;
  const rooms: Occupancy[][] = [[], [], [], []];
  for (let depth = 0; depth < roomSize; depth++) {
    const row = input[2 + depth];
    const pods = row
      .split("")
      .filter((c) => isAmphipod(c))
      .map((a) => a as Amphipod);
    pods.forEach((p, i) => rooms[i].push(p));
  }

  return {
    key: JSON.stringify({ hallway, rooms, totalCost: 0 }),
    hallway,
    rooms,
    cost: 0,
    totalCost: 0,
  };
};

type Empty = ".";
const Amphipod = ["A", "B", "C", "D"] as const;
type Amphipod = typeof Amphipod[number];
const isAmphipod = (a: unknown) => Amphipod.indexOf(a as Amphipod) !== -1;

type Occupancy = Empty | Amphipod;

interface State {
  key: string;
  cost: number;
  totalCost: number;
  hallway: Occupancy[];
  rooms: Occupancy[][];
}

type HallwayPosition = { type: "H"; hallwayNumber: number };
type RoomPosition = { type: "R"; roomNumber: number; depth: number };
type Position = HallwayPosition | RoomPosition;

type Move = {
  from: Position;
  to: Position;
  distance: number;
};

const podToRoomLookup: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

const roomToPodLookup: Record<number, string> = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
};

const roomToHallwayLookup: Record<number, number> = {
  0: 2,
  1: 4,
  2: 6,
  3: 8,
};

const hallwayToRoomLookup: Record<number, number> = {
  2: 0,
  4: 1,
  6: 2,
  8: 3,
};

const setPosition = (p: Position, o: Occupancy, s: State) => {
  switch (p.type) {
    case "H":
      s.hallway[p.hallwayNumber] = o;
      break;
    case "R":
      s.rooms[p.roomNumber][p.depth] = o;
  }
};

const getPosition = (p: Position, s: State): Occupancy => {
  switch (p.type) {
    case "H":
      return s.hallway[p.hallwayNumber];
    case "R":
      return s.rooms[p.roomNumber][p.depth];
  }
};

const isRoomEnterable = (number: number, s: State): boolean => {
  const podType = roomToPodLookup[number];
  return every(s.rooms[number], (o) => o === podType || o === ".");
};

const validPodLocationsInHallway = (
  from: HallwayPosition,
  to: HallwayPosition
): HallwayPosition[] => {
  if (from.hallwayNumber === to.hallwayNumber) {
    return [];
  }
  const endOffset = from.hallwayNumber < to.hallwayNumber ? 1 : -1;
  return range(from.hallwayNumber, to.hallwayNumber + endOffset)
    .filter((i) => hallwayToRoomLookup[i] === undefined)
    .map((i) => ({
      type: "H",
      hallwayNumber: i,
    }));
};

const hallwayRangeExcludingStart = (
  from: HallwayPosition,
  to: HallwayPosition
): HallwayPosition[] => {
  const offset = from.hallwayNumber < to.hallwayNumber ? 1 : -1;
  if (from.hallwayNumber === to.hallwayNumber) {
    return [];
  }

  return range(from.hallwayNumber + offset, to.hallwayNumber + offset)
    .filter((i) => hallwayToRoomLookup[i] === undefined)
    .map((i) => ({
      type: "H",
      hallwayNumber: i,
    }));
};

const hallwayMoveAllowed = (
  from: HallwayPosition,
  to: HallwayPosition,
  s: State
): boolean => {
  return !some(
    hallwayRangeExcludingStart(from, to),
    (hp) => s.hallway[hp.hallwayNumber] !== "."
  );
};

const podsInHallwaysPositions = (s: State): HallwayPosition[] =>
  s.hallway
    .map((o, i) => ({ o, i }))
    .filter((d) => d.o !== ".")
    .map((o) => ({ type: "H", hallwayNumber: o.i }));

const reachableHallwayPositions = (
  from: HallwayPosition,
  s: State
): HallwayPosition[] => {
  const reachable: HallwayPosition[] = [];
  const toRight: HallwayPosition = {
    type: "H",
    hallwayNumber: s.hallway.length - 1,
  };
  for (const p of validPodLocationsInHallway(from, toRight)) {
    if (hallwayMoveAllowed(from, p, s)) {
      reachable.push(p);
    } else {
      break;
    }
  }

  const toLeft: HallwayPosition = {
    type: "H",
    hallwayNumber: 0,
  };
  for (const p of validPodLocationsInHallway(from, toLeft)) {
    if (hallwayMoveAllowed(from, p, s)) {
      reachable.push(p);
    } else {
      break;
    }
  }

  return reachable;
};

const getNextToLeaveRoom = (
  roomNumber: number,
  s: State
): number | undefined => {
  return s.rooms[roomNumber].findIndex((o) => o !== ".");
};

const getDeepestEmptySpaceInRoom = (
  roomNumber: number,
  s: State
): number | undefined => {
  let i = undefined;
  const room = s.rooms[roomNumber];
  for (let depth = 0; depth < room.length; depth++) {
    if (room[depth] === ".") {
      i = depth;
    }
  }
  return i;
};

const isRoomValidFor = (roomNumber: number, occupancy: Occupancy) => {
  if (occupancy === ".") {
    throw new Error("Unexpected not pod " + occupancy);
  }
  return podToRoomLookup[occupancy] === roomNumber;
};

/**
 * Shamelessly stolen from https://www.reddit.com/r/adventofcode/comments/rnjkzi/comment/hpt32ja/?utm_source=share&utm_medium=web2x&context=3
 */
const getMoves = (s: State): Move[] => {
  const moves: Move[] = [];
  range(0, 4)
    .filter((i) => !isRoomEnterable(i, s))
    .forEach((ri) => {
      const hallway = roomToHallwayLookup[ri];
      const nextToLeaveIndex = getNextToLeaveRoom(ri, s)!;
      const from: RoomPosition = {
        type: "R",
        roomNumber: ri,
        depth: nextToLeaveIndex,
      };

      reachableHallwayPositions(
        { type: "H", hallwayNumber: hallway },
        s
      ).forEach((hp) => {
        moves.push({
          from,
          to: hp,
          distance: nextToLeaveIndex + 1 + Math.abs(hp.hallwayNumber - hallway),
        });
      });

      for (const ri2 of range(0, 4).filter(
        (ri2) =>
          ri !== ri2 &&
          isRoomValidFor(ri2, getPosition(from, s)) &&
          isRoomEnterable(ri2, s)
      )) {
        const hallway2 = roomToHallwayLookup[ri2];
        if (
          !hallwayMoveAllowed(
            { type: "H", hallwayNumber: hallway },
            { type: "H", hallwayNumber: hallway2 },
            s
          )
        ) {
          continue;
        }

        const nextEmptySpaceInRoom = getDeepestEmptySpaceInRoom(ri2, s);
        if (nextEmptySpaceInRoom !== undefined) {
          const to: RoomPosition = {
            type: "R",
            depth: nextEmptySpaceInRoom,
            roomNumber: ri2,
          };
          moves.push({
            from,
            to,
            distance:
              nextToLeaveIndex +
              1 +
              Math.abs(hallway2 - hallway) +
              nextEmptySpaceInRoom +
              1,
          });
        }
      }
    });

  for (const hp of podsInHallwaysPositions(s)) {
    const from = hp;
    for (const ri2 of range(0, 4).filter(
      (ri2) =>
        isRoomValidFor(ri2, getPosition(from, s)) && isRoomEnterable(ri2, s)
    )) {
      const hallway2 = roomToHallwayLookup[ri2];
      if (
        !hallwayMoveAllowed(
          { type: "H", hallwayNumber: from.hallwayNumber },
          { type: "H", hallwayNumber: hallway2 },
          s
        )
      ) {
        continue;
      }

      const nextEmptySpaceInRoom = getDeepestEmptySpaceInRoom(ri2, s);
      if (nextEmptySpaceInRoom !== undefined) {
        const to: RoomPosition = {
          type: "R",
          depth: nextEmptySpaceInRoom,
          roomNumber: ri2,
        };
        moves.push({
          from,
          to,
          distance:
            Math.abs(hallway2 - from.hallwayNumber) + nextEmptySpaceInRoom + 1,
        });
      }
    }
  }

  return moves;
};

const performMove = (m: Move, s: State) => {
  const podType = getPosition(m.from, s);
  setPosition(m.to, podType, s);
  setPosition(m.from, ".", s);
};

const getNextStates = (s: State): State[] => {
  const moves = getMoves(s);
  //console.log(moves.length);
  return moves.map((m) => {
    //console.log(m);
    const stateCopy = cloneDeep(s);
    const podType = getPosition(m.from, s);
    performMove(m, stateCopy);
    const cost = calculateCost(podType, m.distance);
    const totalCost = s.totalCost + cost;
    const key = JSON.stringify({
      hallway: stateCopy.hallway,
      rooms: stateCopy.rooms,
      totalCost,
    });
    return { ...stateCopy, key, cost, totalCost };
  });
};

const costLookup: Record<string, number> = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

const calculateCost = (o: string, d: number) => {
  const costPerStep = costLookup[o];
  if (!costPerStep) {
    throw new Error("Could not find cost for " + o);
  }
  return costPerStep * d;
};

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

const aStar = (
  start: State,
  goal: (node: State) => boolean,
  h: (node: State) => number,
  getNeighbours: (node: State) => State[]
): State[] => {
  const cameFrom = new Map<string, State>();
  const gScoreMap = new Map<string, number>();
  const openSet = new Map<string, boolean>();

  const gScore = (s: string): number =>
    gScoreMap.has(s) ? gScoreMap.get(s)! : 99999999;
  gScoreMap.set(start.key, 0);

  const fScoreMap = new Map<string, number>();
  const fScore = (s: string): number =>
    fScoreMap.has(s) ? fScoreMap.get(s)! : 99999999;
  fScoreMap.set(start.key, h(start));

  const comparator = (n1: State, n2: State) => {
    const f1 = fScore(n1.key);
    const f2 = fScore(n2.key);
    return f1 - f2;
  };

  let os = new PriorityQueue({
    comparator: comparator,
    initialValues: [start],
  });
  openSet.set(start.key, true);

  const cost = (neighbour: State): number => {
    return neighbour.cost;
  };

  let i = 0;

  while (os.length > 0) {
    const current = os.dequeue();
    if (goal(current)) {
      return reconstructPath(current, cameFrom);
    }
    openSet.delete(current.key);

    const neighbours = getNeighbours(current);
    for (const neighbor of neighbours) {
      const tentativeGScore = gScore(current.key) + cost(neighbor);
      if (tentativeGScore < gScore(neighbor.key)) {
        cameFrom.set(neighbor.key, current);
        gScoreMap.set(neighbor.key, tentativeGScore);
        fScoreMap.set(neighbor.key, tentativeGScore + h(neighbor));
        if (!openSet.has(neighbor.key)) {
          openSet.set(neighbor.key, true);
          os.queue(neighbor);
        }
      }
    }

    i++;
  }

  throw new Error("Not found");
};

const parseStateInternal = (input: string): State => {
  const s = parseState(input.split("\n"));
  printMap(s);
  return s;
};

const goalState = () =>
  parseStateInternal(`#############
#...........#
###A#B#C#D###
  #A#B#C#D#
  #########`);

const oneStep = () =>
  parseStateInternal(`#############
#.A........D#
###.#B#C#.###
  #A#B#C#D#
  #########`);

const exampleState = () =>
  parseStateInternal(`#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########`);

const goal = (s: State): boolean => {
  for (let i = 0; i < 4; i++) {
    const podTypeSupposedToBeInRoom = roomToPodLookup[i];
    if (s.rooms[i].some((o) => o !== podTypeSupposedToBeInRoom)) {
      return false;
    }
  }
  return true;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  if (isPartTwo) {
    input = [
      input[0],
      input[1],
      input[2],
      "  #D#C#B#A#\r",
      "  #D#B#A#C#\r",
      input[3],
      input[4],
    ];
  }
  const state = parseState(input);
  const start = Date.now();
  const h = (s: State) => podsInHallwaysPositions(s).length;
  const p: State[] = aStar(state, goal, h, getNextStates);
  const end = Date.now();
  for (const s of p) {
    console.log(s.cost + "\n");
    printMap(s);
  }
  console.log("Done", (end - start) / 1000);

  return p[p.length - 1].totalCost.toString();
};
