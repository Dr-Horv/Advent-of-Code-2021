interface BingoBoard {
  id: number;
  rows: Set<number>[];
  columns: Set<number>[];
}

const BOARD_SIZE = 5;

let id = 0;
const nextId = () => id++;

const parseBoard = (input: string[]): BingoBoard => {
  const rows = [];
  const columns: Set<number>[] = [
    new Set(),
    new Set(),
    new Set(),
    new Set(),
    new Set(),
  ];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const rowNumbers = input
      .shift()!
      .split(/\s+/)
      .map((s) => parseInt(s.trim(), 10));
    rows.push(new Set(rowNumbers));
    for (let j = 0; j < rowNumbers.length; j++) {
      columns[j]!.add(rowNumbers[j]);
    }
  }

  return { id: nextId(), rows, columns };
};

const parseBoards = (input: string[]) => {
  const boards: BingoBoard[] = [];
  while (input.length >= 5) {
    boards.push(parseBoard(input));
  }

  return boards;
};

const calculateScore = (board: BingoBoard, number: number): number => {
  const sum = board.rows
    .flatMap((s) => [...s.values()])
    .reduce((acc, curr) => acc + curr);
  return sum * number;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  const numbers = input
    .shift()!
    .split(",")
    .map((s) => parseInt(s, 10));

  let boards = parseBoards(input);
  let last = -1;
  let turn = 0;
  while (numbers.length > 0) {
    last = numbers.shift()!;
    turn++;
    for (const b of boards) {
      for (const r of b.rows) {
        r.delete(last);
      }
      for (const c of b.columns) {
        c.delete(last);
      }
    }

    for (const b of boards) {
      for (const check of [...b.rows, ...b.columns]) {
        if (check.size === 0) {
          if (!isPartTwo || boards.length === 1) {
            return calculateScore(b, last).toString();
          } else {
            boards = boards.filter((board) => board.id !== b.id);
          }
        }
      }
    }
  }

  throw new Error("No winner :'(");
};
