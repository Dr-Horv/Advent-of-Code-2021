const toKey = (x: number, y: number): string => `${x},${y}`;

type Map = Record<string, string>;

let HEIGHT = 0;
let WIDTH = 0;

const performPartOfStep = (
  map: Map,
  nextKeyF: (x: number, y: number) => string,
  cucumberType: string
): Map => {
  const nextMap: Map = {};
  for (let y = HEIGHT - 1; y >= 0; y--) {
    for (let x = WIDTH - 1; x >= 0; x--) {
      const key = toKey(x, y);
      const nextKey = nextKeyF(x, y);
      const curr = map[key];
      if (curr) {
        if (curr === cucumberType && map[nextKey] === undefined) {
          nextMap[nextKey] = map[key];
        } else {
          nextMap[key] = curr;
        }
      }
    }
  }
  return nextMap;
};

const performStep = (map: Map): Map => {
  const nm = performPartOfStep(map, (x, y) => toKey((x + 1) % WIDTH, y), ">");
  return performPartOfStep(nm, (x, y) => toKey(x, (y + 1) % HEIGHT), "v");
};

const printMap = (map: Map) => {
  let str = "";
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      str += map[toKey(x, y)] ?? ".";
    }
    str += "\n";
  }
  console.log(str);
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  let map: Map = {};
  HEIGHT = input.length;
  WIDTH = input[0].length;
  for (let y = 0; y < HEIGHT; y++) {
    const r = input[y];
    for (let x = 0; x < WIDTH; x++) {
      const c = r[x];
      if (c !== ".") {
        map[toKey(x, y)] = c;
      }
    }
  }

  let step = 1;
  while (true) {
    const nextMap = performStep(map);
    if (JSON.stringify(nextMap) === JSON.stringify(map)) {
      break;
    }
    map = nextMap;
    step++;
  }
  return step.toString();
};
