import _ from "lodash";

let die = 0;
let rolls = 0;
const rollDeterministicDie = (): number => {
  rolls++;
  const r = die + 1;
  die = (die + 1) % 100;
  return r;
};

const doTurn = (pos: number) => {
  const sum =
    rollDeterministicDie() + rollDeterministicDie() + rollDeterministicDie();
  return (pos + sum) % 10;
};

const turnCache = new Map<number, number[]>();
const doPart2Turn = (pos: number): number[] => {
  const cacheValue = turnCache.get(pos);
  if (cacheValue !== undefined) {
    return cacheValue;
  }
  const sums = [];
  for (let x = 1; x <= 3; x++) {
    for (let y = 1; y <= 3; y++) {
      for (let z = 1; z <= 3; z++) {
        sums.push(x + y + z);
      }
    }
  }
  const res = sums.map((sum) => (pos + sum) % 10);
  turnCache.set(pos, res);
  return res;
};

interface PlayerState {
  name: string;
  pos: number;
  score: number;
}

let playCache = new Map<string, Record<string, number>>();
const play = (
  players: Record<number, PlayerState>,
  turn: number
): Record<string, number> => {
  const key = JSON.stringify({ players, turn });
  const cacheValue = playCache.get(key);
  if (cacheValue !== undefined) {
    return cacheValue;
  }
  const currentPlayer = turn % 2;
  const otherPlayer = (turn + 1) % 2;
  if (players[otherPlayer].score >= 21) {
    return { [players[otherPlayer].name]: 1, [players[currentPlayer].name]: 0 };
  }

  const wins = {
    P1: 0,
    P2: 0,
  };

  const p = players[currentPlayer];
  const futurePositions = doPart2Turn(p.pos);
  for (const pos of futurePositions) {
    const np = _.cloneDeep(p);
    np.pos = pos;
    np.score += np.pos + 1;

    const nextState: Record<number, PlayerState> = {
      [currentPlayer]: np,
      [otherPlayer]: _.cloneDeep(players[otherPlayer]),
    };

    const results = play(nextState, turn + 1);
    wins["P1"] += results["P1"];
    wins["P2"] += results["P2"];
  }

  playCache.set(key, wins);
  return wins;
};

export const solve = (input: string[], isPartTwo: boolean): string => {
  let player1Pos = parseInt(_.last(input[0].split(" "))!, 10);
  let player1Score = 0;
  let player2Pos = parseInt(_.last(input[1].split(" "))!, 10);
  let player2Score = 0;

  const players: Record<number, PlayerState> = {
    0: { name: "P1", pos: player1Pos - 1, score: player1Score },
    1: { name: "P2", pos: player2Pos - 1, score: player2Score },
  };

  let turn = 0;
  if (isPartTwo) {
    const res = play(players, 0);
    return Math.max(res["P1"], res["P2"]).toString();
  }

  while (true) {
    const p = players[turn % 2];
    p.pos = doTurn(p.pos);
    p.score += p.pos + 1;
    if (p.score >= 1000) {
      return (rolls * players[(turn + 1) % 2].score).toString();
    }
    turn++;
  }
};
