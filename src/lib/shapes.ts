export interface BoardShape {
  id: string;
  name: string;
  grid: boolean[][];
}

export const SHAPES: Record<string, BoardShape> = {
  "4x4": {
    id: "4x4",
    name: "4x4 Square",
    grid: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
  "5x5": {
    id: "5x5",
    name: "5x5 Square",
    grid: [
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
    ],
  },
  cross: {
    id: "cross",
    name: "Cross",
    grid: [
      [false, true, true, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
    ],
  },
  diamond: {
    id: "diamond",
    name: "Diamond",
    grid: [
      [false, false, true, false, false],
      [false, true, true, true, false],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    grid: [
      [false, true, true, false],
      [true, true, true, true],
      [true, true, true, true],
      [false, true, true, false],
    ],
  },
  "3x3": {
    id: "3x3",
    name: "3x3 Square",
    grid: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
};

export function getActiveCellCount(shape: BoardShape): number {
  return shape.grid.flat().filter(Boolean).length;
}
