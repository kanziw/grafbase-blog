import { EventEmitter } from 'events'

export type State = 'start' | 'game' | 'levelstart' | 'gameover' | 'gamecomplete' | 'win'
export type Callbacks = {
  saveScore(score: number): void,
  askAndGoToMain(): void,
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

gameEvents.on('state', ({ state, callbacks }: onState) => {
  switch (state) {
    case 'levelstart':
      currentStageScore = 0
      break
    case 'win':
      accScore += currentStageScore
      currentStageScore = 0
      break
    case 'gameover':
      callbacks.saveScore(getTotalScore())
      gameEvents.emit('gameover', { callbacks })
      break
    case 'gamecomplete':
      callbacks.saveScore(getTotalScore())
      break
  }
})

type onGameover = {
  callbacks: Callbacks,
}
gameEvents.on('gameover', ({ callbacks }: onGameover) => {
  callbacks.askAndGoToMain()
})

gameEvents.on('currentStageScoreIncreased', () => {
  currentStageScore += 1
})

export default gameEvents
