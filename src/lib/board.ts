import type { BoardShape } from "./shapes";

export type LetterDistribution =
  | "standard"
  | "random"
  | "vowel-heavy"
  | "consonant-heavy";

const LETTER_WEIGHTS: Record<string, Record<string, number>> = {
  standard: {
    E: 12.7,
    T: 9.1,
    A: 8.2,
    O: 7.5,
    I: 7.0,
    N: 6.7,
    S: 6.3,
    H: 6.1,
    R: 6.0,
    D: 4.3,
    L: 4.0,
    C: 2.8,
    U: 2.8,
    M: 2.4,
    W: 2.4,
    F: 2.2,
    G: 2.0,
    Y: 2.0,
    P: 1.9,
    B: 1.5,
    V: 1.0,
    K: 0.8,
    J: 0.15,
    X: 0.15,
    Q: 0.1,
    Z: 0.07,
  },
  random: Object.fromEntries(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => [l, 1]),
  ),
  "vowel-heavy": {
    A: 15,
    E: 15,
    I: 15,
    O: 15,
    U: 10,
    B: 1,
    C: 1,
    D: 2,
    F: 1,
    G: 1,
    H: 2,
    J: 0.5,
    K: 0.5,
    L: 2,
    M: 1,
    N: 2,
    P: 1,
    Q: 0.1,
    R: 2,
    S: 2,
    T: 3,
    V: 0.5,
    W: 1,
    X: 0.1,
    Y: 1,
    Z: 0.1,
  },
  "consonant-heavy": {
    A: 3,
    E: 3,
    I: 3,
    O: 3,
    U: 2,
    B: 3,
    C: 4,
    D: 5,
    F: 3,
    G: 3,
    H: 4,
    J: 1,
    K: 2,
    L: 5,
    M: 4,
    N: 5,
    P: 3,
    Q: 0.5,
    R: 5,
    S: 5,
    T: 6,
    V: 2,
    W: 3,
    X: 1,
    Y: 3,
    Z: 1,
  },
};

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function pickWeightedLetter(
  weights: Record<string, number>,
  random: () => number,
): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = random() * total;
  for (const [letter, weight] of entries) {
    r -= weight;
    if (r <= 0) return letter;
  }
  return entries[entries.length - 1][0];
}

export interface BoardCell {
  letter: string;
  row: number;
  col: number;
  active: boolean;
}

export function generateBoard(
  shape: BoardShape,
  distribution: LetterDistribution = "standard",
  seed?: number,
): BoardCell[][] {
  const random = seededRandom(seed ?? Math.floor(Math.random() * 1000000));
  const weights = LETTER_WEIGHTS[distribution];

  return shape.grid.map((row, rowIndex) =>
    row.map((active, colIndex) => ({
      letter: active ? pickWeightedLetter(weights, random) : "",
      row: rowIndex,
      col: colIndex,
      active,
    })),
  );
}

export function isAdjacent(cell1: BoardCell, cell2: BoardCell): boolean {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

export function isOrthogonalAdjacent(
  cell1: BoardCell,
  cell2: BoardCell,
): boolean {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function isDiagonalAdjacent(
  cell1: BoardCell,
  cell2: BoardCell,
): boolean {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return rowDiff === 1 && colDiff === 1;
}

export function boardToLetters(board: BoardCell[][]): string[][] {
  return board.map((row) => row.map((cell) => cell.letter));
}

export function lettersToBoard(
  letters: string[][],
  shape: BoardShape,
): BoardCell[][] {
  return letters.map((row, rowIndex) =>
    row.map((letter, colIndex) => ({
      letter,
      row: rowIndex,
      col: colIndex,
      active: shape.grid[rowIndex]?.[colIndex] ?? false,
    })),
  );
}
