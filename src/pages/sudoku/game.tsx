import React from 'react'

import { ICell, IGame, newBlockCell } from './sudoku'

type CellProps = {
    cell: ICell,
    dispatch(value: {
        i: number,
        j: number,
        value: number | null
    }): void
 }

class Cell extends React.Component<CellProps> {
  constructor(props: CellProps) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  shouldComponentUpdate(newProps: CellProps) {
    const oldCell = this.props.cell
    const newCell = newProps.cell
    const shouldUpdate = (
      oldCell.value !== newCell.value ||
      oldCell.editable !== newCell.editable ||
      oldCell.hasConflict !== newCell.hasConflict
    )
    return shouldUpdate
  }

  render() {
    const cell = this.props.cell

    const classes = []
    classes.push('i' + cell.i)
    classes.push('j' + cell.j)
    classes.push(cell.editable ? 'editable' : 'not-editable')
    classes.push(cell.hasConflict ? 'has-conflict' : 'no-conflict')
    if (cell.hasConflict) {
      console.log('', cell)
      console.log('>>>>', classes.join(' '))
    }

    return (
      <td className={classes.join(' ')}>
        <input
          type="tel"
          value={cell.value ?? ''}
          onClick={this.onClick}
          onChange={this.onChange} />
      </td>
    )
  }

  onClick(event: any) {
    event.preventDefault()
    if (this.props.cell.editable) {
      event.target.select()
    } else {
      event.target.blur()
    }
  }

  onChange(event: any) {
    event.preventDefault()
    const cell = this.props.cell
    if (!cell.editable) {
      return
    }
    const newValue = event.target.value
    if (newValue !== '' && !/^[1-9]$/.test(newValue)) {
      event.target.value = cell.value
      return
    }
    this.props.dispatch({
      i: cell.i,
      j: cell.j,
      value: newValue === '' ? null : parseInt(newValue),
    })
  }
}

export const Game = ({
  game,
  isPause,
  onCellValueChange,
}: {
  game: IGame,
  isPause: boolean,
  onCellValueChange(value: { i: number, j: number, value: number | null }): void,
 }) => {
  return (
    <div>
      <table className="sudoku-table">
        <tbody>
          {game.cells.map((line, i) => (
            <tr key={i}>
              {line.map((cell) => (
                <Cell cell={isPause ? newBlockCell(cell) : cell} key={cell.j} dispatch={onCellValueChange} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
