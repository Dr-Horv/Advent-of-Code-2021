import { cloneDeep, max, min, parseInt, reduce, sumBy } from "lodash";

type Position = {
  x: number;
  y: number;
};

let WIDTH = 0;
let HEIGHT = 0;

const toKey = (p: Position) => `${p.x},${p.y}`;

const adjacent = (p: Position): Position[] => {
  const as: Position[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    const x = p.x + dx;
    if (x < 0 || x >= WIDTH) {
      continue;
    }
    for (let dy = -1; dy <= 1; dy++) {
      const y = p.y + dy;
      if (y < 0 || y >= HEIGHT || (dx == 0 && dy === 0)) {
        continue;
      }
      as.push({ x, y });
    }
  }
  return as;
};

type Octupus = {
  position: Position;
  energy: number;
  flashed: boolean;
};

type Octupuses = Record<string, Octupus | undefined>;

interface StepResult {
  next: Octupuses;
  flashes: number;
}

const step = (os: Octupuses): StepResult => {
  const next = cloneDeep(os);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      next[toKey({ x, y })]!.energy += 1;
    }
  }
  let newFlash = false;
  let flashes = 0;
  do {
    newFlash = false;
    Object.values(next)
      .filter((o) => o!.energy > 9 && !o!.flashed)
      .forEach((o) => {
        o!.flashed = true;
        flashes++;
        newFlash = newFlash || true;
        adjacent(o!.position).forEach((a) => {
          const o2 = next[toKey(a)]!;
          o2.energy += 1;
        });
      });
  } while (newFlash);

  Object.values(next).forEach((o) => {
    if (o!.flashed) {
      o!.energy = 0;
      o!.flashed = false;
    }
  });

  return { next, flashes };
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  HEIGHT = input.length;
  WIDTH = input[0].length;
  const octopuses: Octupuses = {};
  for (let y = 0; y < HEIGHT; y++) {
    const r = input[y].split("");
    for (let x = 0; x < WIDTH; x++) {
      octopuses[toKey({ x, y })] = {
        position: { x, y },
        energy: parseInt(r[x], 10),
        flashed: false,
      };
    }
  }

  if (!isPartTwo) {
    let s = octopuses;
    let totalFlashes = 0;
    for (let i = 0; i < 100; i++) {
      const res = step(s);
      totalFlashes += res.flashes;
      s = res.next;
    }
    return totalFlashes.toString();
  } else {
    let s = octopuses;
    const nbr = Object.values(s).length;
    let i = 1;
    while (true) {
      const res = step(s);
      if (res.flashes === nbr) {
        return i.toString();
      }
      s = res.next;
      i++;
    }
  }
};
