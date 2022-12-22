import { chunk } from 'lodash'

export type ICell = {
  value: number | null;
  editable: boolean;
  hasConflict: boolean;
  i: number;
  j: number;
}

export type IGame = {
  cells: ICell[][];
  time: Date;
}

function newCell(i: number, j: number, value: number | null, editable: boolean): ICell {
  return {
    value,
    editable,
    hasConflict: false,
    i,
    j,
  }
}

function newGame(cells: ICell[][], time: Date | null): IGame {
  return {
    cells,
    time: time ?? new Date(0, 0, 0, 0, 0, 0, 0),
  }
}

function markAllWithoutConflict(cells: ICell[][]) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cells[i][j].hasConflict = false
    }
  }
}

function checkSubset(array: ICell[]) {
  const nums = new Map<number, number>()
  for (let i = 0; i < 9; i++) {
    if (array[i].value !== null && nums.has(array[i].value as number)) {
      array[i].hasConflict = true
      array[nums.get(array[i].value as number) as number].hasConflict = true
    }
    nums.set(array[i].value as number, i)
  }
}

export function checkConflicts(cells: ICell[][]) {
  markAllWithoutConflict(cells)

  // check horizontal lines
  for (let i = 0; i < 9; i++) {
    const arr = []
    for (let j = 0; j < 9; j++) {
      arr.push(cells[i][j])
    }
    checkSubset(arr)
  }

  // check vertical lines
  for (let j = 0; j < 9; j++) {
    const arr = []
    for (let i = 0; i < 9; i++) {
      arr.push(cells[i][j])
    }
    checkSubset(arr)
  }

  // check squares
  const c = cells
  checkSubset([c[0][0], c[0][1], c[0][2], c[1][0], c[1][1], c[1][2], c[2][0], c[2][1], c[2][2]])
  checkSubset([c[3][0], c[3][1], c[3][2], c[4][0], c[4][1], c[4][2], c[5][0], c[5][1], c[5][2]])
  checkSubset([c[6][0], c[6][1], c[6][2], c[7][0], c[7][1], c[7][2], c[8][0], c[8][1], c[8][2]])

  checkSubset([c[0][3], c[0][4], c[0][5], c[1][3], c[1][4], c[1][5], c[2][3], c[2][4], c[2][5]])
  checkSubset([c[3][3], c[3][4], c[3][5], c[4][3], c[4][4], c[4][5], c[5][3], c[5][4], c[5][5]])
  checkSubset([c[6][3], c[6][4], c[6][5], c[7][3], c[7][4], c[7][5], c[8][3], c[8][4], c[8][5]])

  checkSubset([c[0][6], c[0][7], c[0][8], c[1][6], c[1][7], c[1][8], c[2][6], c[2][7], c[2][8]])
  checkSubset([c[3][6], c[3][7], c[3][8], c[4][6], c[4][7], c[4][8], c[5][6], c[5][7], c[5][8]])
  checkSubset([c[6][6], c[6][7], c[6][8], c[7][6], c[7][7], c[7][8], c[8][6], c[8][7], c[8][8]])
}

// checkConflicts must run first
export function isComplete(cells: ICell[][]) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = cells[i][j]
      if (cell.hasConflict || cell.value === null) {
        return false
      }
    }
  }
  return true
}

export function boardToGame(board: string) {
  const array = []
  for (let i = 0; i < 81; i++) {
    if (board[i] === '0') {
      array.push(null)
    } else {
      array.push(parseInt(board[i]))
    }
  }
  const cells = chunk(array, 9)

  const game = []
  for (let i = 0; i < 9; i++) {
    const line = []
    for (let j = 0; j < 9; j++) {
      line.push(newCell(i, j, cells[i][j], cells[i][j] === null))
    }
    game.push(line)
  }
  return newGame(game, null)
}
