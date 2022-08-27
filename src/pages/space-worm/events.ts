import { EventEmitter } from 'events'

export type State = 'start' | 'game' | 'levelstart' | 'gameover' | 'gamecomplete' | 'win'
export type Callbacks = {
  saveScore(score: number): void,
  goToMain(): void,
}
export type onState = {
  state: State,
  level: number,
  currentStageRemainingStars: number,
  callbacks: Callbacks,
}

const gameEvents = new EventEmitter()

let currentStageScore = 0
let accScore = 0

export const getTotalScore = () => accScore + currentStageScore

gameEvents.on('state', ({ state, level, currentStageRemainingStars, callbacks }: onState) => {
  console.log(' State changed to:', state, level, currentStageRemainingStars)

  switch (state) {
    case 'levelstart':
      currentStageScore = 0
      break
    case 'win':
      accScore += currentStageScore
      currentStageScore = 0
      break
  }
})

type onGameover = {
  callbacks: Callbacks,
  totalScore: number,
}
gameEvents.once('gameover', ({ callbacks, totalScore }: onGameover) => {
  callbacks.saveScore(totalScore)
  if (window.confirm('Go to main?')) {
    callbacks.goToMain()
  }
})

gameEvents.on('currentStageScoreIncreased', () => {
  currentStageScore += 1
})

export default gameEvents
