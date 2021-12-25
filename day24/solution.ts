import _, { parseInt, range } from "lodash";

enum InstructionType {
  inp = "inp",
  add = "add",
  mul = "mul",
  div = "div",
  mod = "mod",
  eql = "eql",
}

type InpInstruction = {
  type: InstructionType.inp;
  a: string;
};

type AddInstruction = {
  type: InstructionType.add;
  a: string;
  b: string;
};

type MulInstruction = {
  type: InstructionType.mul;
  a: string;
  b: string;
};

type DivInstruction = {
  type: InstructionType.div;
  a: string;
  b: string;
};

type ModInstruction = {
  type: InstructionType.mod;
  a: string;
  b: string;
};

type EqlInstruction = {
  type: InstructionType.eql;
  a: string;
  b: string;
};

type Instruction =
  | InpInstruction
  | AddInstruction
  | MulInstruction
  | DivInstruction
  | ModInstruction
  | EqlInstruction;

const parseInstruction = (s: string): Instruction => {
  const [ins, a, b] = s.split(" ");
  switch (ins) {
    case "inp":
      return { type: InstructionType.inp, a };
    case "add":
      return { type: InstructionType.add, a, b };
    case "mul":
      return { type: InstructionType.mul, a, b };
    case "div":
      return { type: InstructionType.div, a, b };
    case "mod":
      return { type: InstructionType.mod, a, b };
    case "eql":
      return { type: InstructionType.eql, a, b };
    default:
      throw new Error(`Parse error on: ${s}`);
  }
};

const extractConstants = (is: Instruction[]) => {
  const divZBy = parseInt((is[4] as DivInstruction).b, 10);
  const addToXBy = parseInt((is[5] as AddInstruction).b, 10);
  const yAddBy = parseInt((is[15] as AddInstruction).b, 10);

  return {
    divZBy,
    addToXBy,
    yAddBy,
  };
};

const block = (
  input: number,
  z: number,
  divZBy: number,
  addToXBy: number,
  yAddBy: number
) => {
  const shouldAdd = (z % 26) + addToXBy !== input;
  z = Math.floor(z / divZBy);
  if (shouldAdd) {
    z *= 26;
    z += yAddBy;
    z += input;
  }
  return z;
};

interface Res {
  nbr: string;
  z: number;
  valid: boolean;
}

const runBlock = (
  soFar: string,
  z: number,
  index: number,
  instructionConstants: { yAddBy: number; divZBy: number; addToXBy: number }[],
  isPartTwo: boolean
): Res => {
  if (index >= instructionConstants.length) {
    return { nbr: soFar, z, valid: z === 0 };
  }
  const constants = instructionConstants[index];
  const start = !isPartTwo ? 9 : 1;
  const end = !isPartTwo ? 1 : 9;
  for (const i of range(start, end)) {
    const newZ = block(
      i,
      z,
      constants.divZBy,
      constants.addToXBy,
      constants.yAddBy
    );
    if (constants.divZBy > 1 && newZ >= z) {
      continue;
    }
    const res = runBlock(
      soFar + i,
      newZ,
      index + 1,
      instructionConstants,
      isPartTwo
    );
    if (res.valid) {
      return res;
    }
  }
  return { nbr: soFar, z, valid: false };
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const instructions = input.map(parseInstruction);
  const chunks: Instruction[][] = [];

  let is: Instruction[] = [];
  for (const i of instructions) {
    if (i.type === InstructionType.inp) {
      if (is.length > 0) {
        chunks.push(is);
      }
      is = [];
    }
    is.push(i);
  }
  chunks.push(is);

  const instructionConstants = chunks.map((c) => extractConstants(c));
  const res = runBlock("", 0, 0, instructionConstants, isPartTwo);
  if (res.valid) {
    return res.nbr;
  } else {
    throw new Error("No valid found");
  }
};
