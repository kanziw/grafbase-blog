import { ICell, IGame, newBlockCell } from './sudoku'

export const Game = ({
  game,
  isPause,
  onCellValueChange,
}: {
  game: IGame,
  isPause: boolean,
  onCellValueChange(value: { i: number, j: number, value: number | null }): void,
 }) => (
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

type CellProps = {
  cell: ICell,
  dispatch(value: {
    i: number,
    j: number,
    value: number | null
  }): void
}

const Cell = ({ cell, dispatch }: CellProps) => {
  const onClick = (event: any) => {
    event.preventDefault()
    if (cell.editable) {
      event.target.select()
    } else {
      event.target.blur()
    }
  }

  const onChange = (event: any) => {
    event.preventDefault()
    if (!cell.editable) {
      return
    }
    const newValue = event.target.value
    if (newValue !== '' && !/^[1-9]$/.test(newValue)) {
      event.target.value = cell.value
      return
    }
    dispatch({
      i: cell.i,
      j: cell.j,
      value: newValue === '' ? null : parseInt(newValue),
    })
  }

  const classes = []
  classes.push('i' + cell.i)
  classes.push('j' + cell.j)
  classes.push(cell.editable ? 'editable' : 'not-editable')
  classes.push(cell.hasConflict ? 'has-conflict' : 'no-conflict')

  return (
    <td className={classes.join(' ')}>
      <input
        type="tel"
        value={cell.value ?? ''}
        onClick={onClick}
        onChange={onChange} />
    </td>
  )
}
