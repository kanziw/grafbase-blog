import { useLocation } from 'react-router-dom'

import { Game, gameDb, User } from '../db'
import { useMe } from './useMe'

export const useCurrentGame = (): { game: Game, me: User } => {
  const { pathname, state } = useLocation()
  const { me } = useMe()

  let { game } = (state ?? {}) as { game: Game }
  if (!game) {
    const [, slug] = pathname.split('/games/')

    game = gameDb().findOne(slug)
    if (!game) {
      throw new Error('Game not found')
    }
  }

  return { game, me }
}
