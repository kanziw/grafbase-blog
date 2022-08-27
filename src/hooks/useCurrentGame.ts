import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Game, gameDb, GameScore, User } from '../db'
import { useMe } from './useMe'

type CurrentGame = {
  game: Game,
  me: User,
  top10Scores: GameScore[] | null,
  isLoading: boolean,
}

export const useCurrentGame = (): CurrentGame => {
  const { pathname, state } = useLocation()
  const { me } = useMe()
  const [isLoading, setIsLoading] = useState(false)
  const [top10Scores, setTop10Scores] = useState<GameScore[] | null>(null)

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
    gameDb().listTop10Scores(game)
      .then(setTop10Scores)
      .finally(() => setIsLoading(false))
  }, [game])

  return { game, me, top10Scores, isLoading }
}
