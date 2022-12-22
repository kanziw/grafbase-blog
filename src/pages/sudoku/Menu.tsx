import type { Difficulty } from './boards'

export const Menu = ({
  hasExistingGame,
  onStartNewGameClick,
  onResumeGameClick,
}: {
  hasExistingGame: boolean,
  onStartNewGameClick(difficulty: Difficulty): void,
  onResumeGameClick(): void,
}) => {
  const onDifficultyClick = (event: any) => {
    event.preventDefault()
    const difficulty = event.target.getAttribute('data-difficulty')
    onStartNewGameClick(difficulty as Difficulty)
  }

  return (
    <div className="index">
      <h1>Sudoku</h1>
      <p>Start a new game</p>
      <p>Please, choose the difficulty:</p>
      <button data-difficulty="easy" onClick={onDifficultyClick}>Easy</button>
      <button data-difficulty="medium" onClick={onDifficultyClick}>Medium</button>
      <button data-difficulty="hard" onClick={onDifficultyClick}>Hard</button>
      {hasExistingGame && <p>or <span onClick={onResumeGameClick}>resume the existing one</span></p>}
    </div>
  )
}
