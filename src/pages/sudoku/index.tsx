import './index.css'

import { cloneDeep } from 'lodash'
import React, { useCallback, useState } from 'react'

import { Difficulty, randomBoard } from './boards'
import { Game } from './game'
import { Menu } from './Menu'
import { boardToGame, checkConflicts, IGame, isComplete } from './sudoku'

export const Sudoku = () => {
  const [game, setGame] = useState<IGame | null>(null)
  const [isGameCompleted, setIsGameCompleted] = useState(false)

  const onCellValueChange = useCallback(({ i, j, value }: { i: number, j: number, value: number | null }) => {
    if (game) {
      const newGame = cloneDeep(game)
      newGame.cells[i][j].value = value
      checkConflicts(newGame.cells)
      localStorage.currentGame = JSON.stringify(newGame)
      setGame(newGame)

      if (isComplete(newGame.cells)) {
        setIsGameCompleted(true)
        delete localStorage.currentGame
      }
    }
  }, [game])

  if (!game) {
    return <Menu
      hasExistingGame={typeof localStorage.currentGame !== 'undefined'}
      onStartNewGameClick={(difficulty: Difficulty) => {
        setGame(boardToGame(randomBoard(difficulty)))
        setIsGameCompleted(false)
      }}
      onResumeGameClick={() => setGame(JSON.parse(localStorage.currentGame) as IGame)}
     />
  }

  return (
    <>
      <Game game={game} onCellValueChange={onCellValueChange} />
      {isGameCompleted && (
      <div className="congratulations" onClick={() => setGame(null)}>
        Congratulations!
      </div>)}
    </>
  )
}
