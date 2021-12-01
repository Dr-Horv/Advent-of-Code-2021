import { solve } from "./solution";
import * as fs from "fs";

interface Test {
  prop: string;
}

const readInput = (filename = "input.txt") =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .filter((s) => s.length);

const input = readInput();
const part = process.env.part || "part1";

const solution = solve(input, part === "part2");
console.log(solution);
