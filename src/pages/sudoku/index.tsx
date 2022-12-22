import './index.css'

import { cloneDeep } from 'lodash'
import { useEffect, useState } from 'react'

import { useMe } from '../../hooks'
import { Difficulty, randomBoard } from './boards'
import { Game } from './game'
import { Menu } from './Menu'
import { boardToGame, checkConflicts, IGame, isComplete } from './sudoku'

const LOCAL_STORAGE_KEY = 'miniapp-game-heaven#sudoku'

export const Sudoku = () => {
  const { me, isLoading } = useMe()
  const [game, setGame] = useState<IGame | null>(null)
  const [isGameCompleted, setIsGameCompleted] = useState(true)
  const [isPause, setIsPause] = useState(false)
  const [timer, setTimer] = useState(0)
  const localStorageKey = `${LOCAL_STORAGE_KEY}#${me?.id}`

  useEffect(() => {
    if (isGameCompleted || isPause) {
      return
    }
    const tick = setTimeout(() => setTimer(timer + 1), 1000)
    return () => clearTimeout(tick)
  }, [isGameCompleted, isPause, timer])

  const onCellValueChange = ({ i, j, value }: { i: number, j: number, value: number | null }) => {
    if (game) {
      const newGame = cloneDeep(game)
      newGame.cells[i][j].value = value
      checkConflicts(newGame.cells)
      saveGame(localStorageKey, { game: newGame, timer })
      setGame(newGame)

      if (isComplete(newGame.cells)) {
        setIsGameCompleted(true)
        deleteSavedGame(localStorageKey)
      }
    }
  }

  const onPauseClick = () => {
    if (game && !isGameCompleted) {
      setIsPause(!isPause)
      saveGame(localStorageKey, { game, timer })
    }
  }

  if (isLoading) {
    return <div>isLoading..</div>
  }

  if (!game) {
    return <Menu
      hasExistingGame={!!localStorage.getItem(localStorageKey)}
      onStartNewGameClick={(difficulty: Difficulty) => {
        setGame(boardToGame(randomBoard(difficulty)))
        setIsGameCompleted(false)
      }}
      onResumeGameClick={() => {
        const snapshot = loadGame(localStorageKey)
        if (snapshot) {
          setGame(snapshot.game)
          setTimer(snapshot.timer)
          setIsGameCompleted(false)
        }
      }}
     />
  }

  const time = new Date(timer * 1000)
  return (
    <>
      <Game game={game} isPause={isPause} onCellValueChange={onCellValueChange} />
      <div className="bottom-menu">
        <p>
          <span>
            {f(time.getUTCHours()) + ':' + f(time.getUTCMinutes()) + ':' + f(time.getUTCSeconds())}
          </span>
          {!isGameCompleted && <span onClick={onPauseClick}> | {isPause ? 'Resume' : 'Pause'}</span>}
        </p>
      </div>
      {game && isGameCompleted && (
      <div className="congratulations" onClick={() => setGame(null)}>
        Congratulations!
      </div>)}
    </>
  )
}

function f(num: number) {
  return `${num}`.padStart(2, '0')
}

type Snapshot = {
  game: IGame,
  timer: number,
}

function saveGame(localStorageKey: string, snapshot: Snapshot) {
  localStorage.setItem(localStorageKey, JSON.stringify(snapshot))
}
function loadGame(localStorageKey: string): Snapshot | null {
  const currentGame = localStorage.getItem(localStorageKey)

  return currentGame ? JSON.parse(currentGame) as Snapshot : null
}
function deleteSavedGame(localStorageKey: string) {
  localStorage.removeItem(localStorageKey)
}
