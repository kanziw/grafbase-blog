import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Game, gameDb, GameScore, User, userDb } from '../db'
import { useMe } from './useMe'

export type GameScoreWithUser = GameScore & {
  user: User;
};
type CurrentGame = {
  game: Game;
  me: User | null;
  top10Scores: GameScoreWithUser[] | null;
  isLoading: boolean;
};

export const useCurrentGame = (): CurrentGame => {
  const { pathname, state } = useLocation()
  const { me, isLoading: isMeLoading } = useMe()
  const [isLoading, setIsLoading] = useState(isMeLoading)
  const [top10Scores, setTop10Scores] = useState<GameScoreWithUser[] | null>(
    null,
  )

  let { game } = (state ?? {}) as { game: Game }
  if (!game) {
    const [, slug] = pathname.split('/games/')

    game = gameDb().findOne(slug)
    if (!game) {
      throw new Error('Game not found')
    }
  }

  useEffect(() => {
    setIsLoading(true)
    gameDb()
      .listTop10Scores(game)
      .then(async(scores) => {
        const users = await userDb().list(scores.map((score) => score.userId))
        return scores.map((score, idx) => ({
          ...score,
          user: users[idx],
        }))
      })
      .then(setTop10Scores)
      .finally(() => setIsLoading(false))
  }, [game])

  return {
    game,
    me,
    top10Scores,
    isLoading: isMeLoading || isLoading,
  }
}
