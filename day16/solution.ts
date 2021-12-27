import { max, min, parseInt, reduce, sumBy } from "lodash";

enum Operator {
  Sum,
  Product,
  Minimum,
  Maximum,
  GreaterThan,
  LessThan,
  Equal,
}
type LiteralValuePacket = { type: "LV"; version: number; value: number };
type OperatorPacket = {
  type: "OP";
  version: number;
  operator: Operator;
  packets: Packet[];
};

type Packet = LiteralValuePacket | OperatorPacket;
interface ParseResult {
  packet: Packet;
  rest: string;
}

const parseLiteralValue = (version: number, s: string[]): ParseResult => {
  let i = 0;
  let number = [];
  while (true) {
    const firstBit = s[i];
    const fourBits = s.slice(i + 1, i + 5);
    number.push(...fourBits);
    if (firstBit === "0") {
      break;
    } else {
      i += 5;
    }
  }

  const packet: LiteralValuePacket = {
    type: "LV",
    version,
    value: parseInt(number.join(""), 2),
  };
  return { packet, rest: s.slice(i + 5).join("") };
};

const parseOperator = (
  version: number,
  operator: Operator,
  s: string[]
): ParseResult => {
  const lengthTypeId = s[0];
  if (lengthTypeId === "0") {
    const length = parseInt(s.slice(1, 16).join(""), 2);
    let bits = s.slice(16, 16 + length).join("");
    const rest = s.slice(16 + length).join("");
    const packets: Packet[] = [];
    while (bits.length > 0) {
      const res = parseNextPacket(bits);
      packets.push(res.packet);
      bits = res.rest;
    }
    const packet: OperatorPacket = { type: "OP", operator, version, packets };
    return { packet, rest };
  } else if (lengthTypeId === "1") {
    const subpackages = parseInt(s.slice(1, 12).join(""), 2);
    const packets: Packet[] = [];
    let rest = s.slice(12).join("");
    for (let i = 0; i < subpackages; i++) {
      const res = parseNextPacket(rest);
      packets.push(res.packet);
      rest = res.rest;
    }
    const packet: OperatorPacket = { type: "OP", operator, version, packets };
    return { packet, rest };
  }

  throw new Error("parseOperator error");
};

const parseOp = (typeId: number): Operator => {
  switch (typeId) {
    case 0:
      return Operator.Sum;
    case 1:
      return Operator.Product;
    case 2:
      return Operator.Minimum;
    case 3:
      return Operator.Maximum;
    case 5:
      return Operator.GreaterThan;
    case 6:
      return Operator.LessThan;
    case 7:
      return Operator.Equal;
  }
  throw new Error("Wrong typeId for operator package " + typeId);
};

const parseNextPacket = (p: string): ParseResult => {
  const s = p.split("");
  const version = parseInt(s.slice(0, 3).join(""), 2);
  const typeId = parseInt(s.slice(3, 6).join(""), 2);
  const rest = s.slice(6);
  switch (typeId) {
    case 4:
      return parseLiteralValue(version, rest);
    default:
      const operator = parseOp(typeId);
      return parseOperator(version, operator, rest);
  }
};

const toBinary = (hexChar: string): string =>
  parseInt(hexChar, 16).toString(2).padStart(4, "0");

const sumVersion = (p: Packet): number => {
  let sum = p.version;
  switch (p.type) {
    case "LV":
      break;
    case "OP":
      sum += sumBy(p.packets, (p) => sumVersion(p));
  }
  return sum;
};

const evaluateValue = (p: Packet): number => {
  switch (p.type) {
    case "LV":
      return p.value;
    case "OP":
      switch (p.operator) {
        case Operator.Sum:
          return sumBy(p.packets, (p) => evaluateValue(p));
        case Operator.Product:
          return reduce(p.packets, (acc, curr) => acc * evaluateValue(curr), 1);
        case Operator.Minimum:
          return min(p.packets.map(evaluateValue))!;
        case Operator.Maximum:
          return max(p.packets.map(evaluateValue))!;
        case Operator.GreaterThan:
          return evaluateValue(p.packets[0]) > evaluateValue(p.packets[1])
            ? 1
            : 0;
        case Operator.LessThan:
          return evaluateValue(p.packets[0]) < evaluateValue(p.packets[1])
            ? 1
            : 0;
        case Operator.Equal:
          return evaluateValue(p.packets[0]) === evaluateValue(p.packets[1])
            ? 1
            : 0;
      }
  }
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const msgInBinary = input[0].split("").map(toBinary).join("");
  const parseResult = parseNextPacket(msgInBinary);
  if (!isPartTwo) {
    return sumVersion(parseResult.packet).toString();
  } else {
    return evaluateValue(parseResult.packet).toString();
  }
};
