import _, { parseInt, slice } from "lodash";

enum Command {
  ON = "on",
  OFF = "off",
}

interface Step {
  command: Command;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  z1: number;
  z2: number;
}

const regex = /(\w+) x=(-*\d+)..(-*\d+),y=(-*\d+)..(-*\d+),z=(-*\d+)..(-*\d+)/;
const parseStep = (s: string): Step => {
  const match = regex.exec(s)!;
  const command = <Command>match[1];
  const [x1, x2, y1, y2, z1, z2] = match.slice(2).map((m) => parseInt(m, 10));
  return {
    command,
    x1: Math.min(x1, x2),
    x2: Math.max(x1, x2),
    y1: Math.min(y1, y2),
    y2: Math.max(y1, y2),
    z1: Math.min(z1, z2),
    z2: Math.max(z1, z2),
  };
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const steps = input.map((s) => parseStep(s));
  const cubeMap = new Map<string, boolean>();
  for (const step of steps) {
    for (let x = step.x1; x <= step.x2; x++) {
      if (x < -50 || x > 50) {
        continue;
      }
      for (let y = step.y1; y <= step.y2; y++) {
        if (y < -50 || y > 50) {
          continue;
        }
        for (let z = step.z1; z <= step.z2; z++) {
          if (z < -50 || z > 50) {
            continue;
          }
          cubeMap.set(JSON.stringify([x, y, z]), step.command === Command.ON);
        }
      }
    }
  }

  const nbrOn = [...cubeMap.values()].filter((v) => v).length;

  return nbrOn.toString();
};
